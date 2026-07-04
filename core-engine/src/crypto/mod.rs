use hmac::{Hmac, Mac};
use sha2::{Sha256, Sha512};
use hex;
use rand::Rng;
use sha2::Digest;

type HmacSha256 = Hmac<Sha256>;
type HmacSha512 = Hmac<Sha512>;

#[derive(Debug)]
pub struct CardValidation {
    pub is_valid: bool,
    pub card_type: String,
    pub bank: String,
    pub errors: Vec<String>,
}

pub fn generate_api_key(key_type: &str) -> String {
    let prefix = match key_type {
        "live" => "sk_live_",
        _ => "sk_test_",
    };
    let random_bytes: Vec<u8> = (0..32).map(|_| rand::thread_rng().gen()).collect();
    let hex_string = hex::encode(random_bytes);
    format!("{}{}", prefix, hex_string)
}

pub fn sign_webhook_payload(payload: &[u8], secret: &[u8]) -> String {
    let mut mac = HmacSha256::new_from_slice(secret)
        .expect("HMAC key should be valid");
    mac.update(payload);
    hex::encode(mac.finalize().into_bytes())
}

pub fn sign_webhook_payload_512(payload: &[u8], secret: &[u8]) -> String {
    let mut mac = HmacSha512::new_from_slice(secret)
        .expect("HMAC key should be valid");
    mac.update(payload);
    hex::encode(mac.finalize().into_bytes())
}

pub fn verify_webhook_signature(payload: &[u8], signature: &str, secret: &[u8]) -> bool {
    let computed = sign_webhook_payload(payload, secret);
    computed.len() == signature.len() && {
        let computed_bytes = computed.as_bytes();
        let sig_bytes = signature.as_bytes();
        let mut result = 0u8;
        for i in 0..computed_bytes.len() {
            result |= computed_bytes[i] ^ sig_bytes[i];
        }
        result == 0
    }
}

pub fn generate_webhook_secret() -> String {
    let random_bytes: Vec<u8> = (0..32).map(|_| rand::thread_rng().gen()).collect();
    format!("whsec_{}", hex::encode(random_bytes))
}

pub fn generate_transaction_reference(prefix: &str) -> String {
    let random = uuid::Uuid::new_v4().to_string()[..8].to_uppercase();
    format!("{}-{}", prefix, random)
}

pub fn validate_card_number(number: &str) -> CardValidation {
    let mut errors = Vec::new();
    let cleaned: String = number.chars().filter(|c| c.is_ascii_digit()).collect();

    if cleaned.len() < 13 || cleaned.len() > 19 {
        errors.push("Card number must be 13-19 digits".to_string());
    }

    let checksum_valid = luhn_check(&cleaned);
    if !checksum_valid {
        errors.push("Card number failed Luhn check".to_string());
    }

    let card_type = detect_card_type(&cleaned);
    let bank = detect_bank(&cleaned);

    CardValidation {
        is_valid: errors.is_empty() && checksum_valid,
        card_type,
        bank,
        errors,
    }
}

fn luhn_check(number: &str) -> bool {
    let mut sum = 0;
    let mut alternate = false;

    for digit_char in number.chars().rev() {
        if let Some(d) = digit_char.to_digit(10) {
            let mut n = d;
            if alternate {
                n *= 2;
                if n > 9 {
                    n = n % 10 + 1;
                }
            }
            sum += n;
            alternate = !alternate;
        }
    }

    sum % 10 == 0
}

fn detect_card_type(number: &str) -> String {
    if number.starts_with('4') {
        "visa".to_string()
    } else if number.starts_with("51") || number.starts_with("52") || 
              number.starts_with("53") || number.starts_with("54") || 
              number.starts_with("55") {
        "mastercard".to_string()
    } else if number.starts_with("506") || number.starts_with("507") ||
              number.starts_with("508") || number.starts_with("509") {
        "verve".to_string()
    } else if number.starts_with("34") || number.starts_with("37") {
        "amex".to_string()
    } else if number.starts_with("6011") || number.starts_with("65") {
        "discover".to_string()
    } else {
        "unknown".to_string()
    }
}

fn detect_bank(number: &str) -> String {
    let bin = if number.len() >= 6 { &number[..6] } else { "" };
    match bin {
        "408408" | "408409" => "GTBank".to_string(),
        "506101" | "506102" => "Access Bank".to_string(),
        "506103" => "First Bank".to_string(),
        "506104" => "UBA".to_string(),
        "512345" | "539983" => "Zenith Bank".to_string(),
        "543210" => "First Bank".to_string(),
        _ => "International".to_string(),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_api_key_format() {
        let key = generate_api_key("test");
        assert!(key.starts_with("sk_test_"));
        assert_eq!(key.len(), 71);
    }

    #[test]
    fn test_webhook_signing_and_verification() {
        let payload = b"{\"event\":\"charge.success\"}";
        let secret = b"whsec_test_secret_key_12345";
        let signature = sign_webhook_payload(payload, secret);
        assert!(verify_webhook_signature(payload, &signature, secret));
        assert!(!verify_webhook_signature(payload, &signature, b"wrong"));
    }

    #[test]
    fn test_luhn_validation() {
        assert!(luhn_check("4084084084084081")); // valid test number
        assert!(!luhn_check("4084084084084082")); // invalid
    }

    #[test]
    fn test_card_validation_valid() {
        let result = validate_card_number("4084084084084081");
        assert!(result.is_valid);
        assert_eq!(result.card_type, "visa");
    }

    #[test]
    fn test_card_validation_invalid() {
        let result = validate_card_number("1234");
        assert!(!result.is_valid);
        assert!(!result.errors.is_empty());
    }

    #[test]
    fn test_detect_card_types() {
        assert_eq!(detect_card_type("4111111111111111"), "visa");
        assert_eq!(detect_card_type("5111111111111111"), "mastercard");
        assert_eq!(detect_card_type("5061011111111111"), "verve");
    }
}
