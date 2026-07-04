use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::Rng;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::sync::RwLock;

/// AES-256-GCM encrypt a plaintext string
pub fn encrypt(plaintext: &str, key: &[u8]) -> Result<String, String> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| format!("Invalid key: {}", e))?;
    let mut nonce_bytes = [0u8; 12];
    OsRng.fill(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);
    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    let mut combined = nonce_bytes.to_vec();
    combined.extend_from_slice(&ciphertext);
    Ok(BASE64.encode(&combined))
}

/// AES-256-GCM decrypt a base64-encoded ciphertext
pub fn decrypt(encoded: &str, key: &[u8]) -> Result<String, String> {
    let combined = BASE64
        .decode(encoded)
        .map_err(|e| format!("Invalid base64: {}", e))?;
    if combined.len() < 12 {
        return Err("Ciphertext too short".to_string());
    }
    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let nonce = Nonce::from_slice(nonce_bytes);
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|e| format!("Invalid key: {}", e))?;
    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|e| format!("Decryption failed: {}", e))?;
    Ok(String::from_utf8(plaintext).map_err(|e| format!("Invalid UTF-8: {}", e))?)
}

/// SHA-256 hash
pub fn hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    hex::encode(hasher.finalize())
}

/// Mask a card number: 408408******4081
pub fn mask_card_number(pan: &str) -> String {
    if pan.len() < 8 {
        return "****".to_string();
    }
    let prefix = &pan[..6];
    let suffix = &pan[pan.len() - 4..];
    format!("{}******{}", prefix, suffix)
}

/// Simple in-memory rate limiter (sliding window)
pub struct RateLimiter {
    requests: RwLock<HashMap<String, Vec<i64>>>,
    max_requests: usize,
    window_seconds: i64,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window_seconds: i64) -> Self {
        Self {
            requests: RwLock::new(HashMap::new()),
            max_requests,
            window_seconds,
        }
    }

    pub fn check(&self, key: &str) -> bool {
        let now = chrono::Utc::now().timestamp();
        let mut cache = self.requests.write().unwrap();
        let timestamps = cache.entry(key.to_string()).or_insert_with(Vec::new);
        timestamps.retain(|t| now - *t < self.window_seconds);
        if timestamps.len() >= self.max_requests {
            false
        } else {
            timestamps.push(now);
            true
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_encrypt_decrypt() {
        let key = b"01234567890123456789012345678901"; // 32 bytes
        let original = "sensitive_pan_4084084084084081";
        let encrypted = encrypt(original, key).unwrap();
        assert_ne!(encrypted, original);
        let decrypted = decrypt(&encrypted, key).unwrap();
        assert_eq!(decrypted, original);
    }

    #[test]
    fn test_wrong_key_fails() {
        let key1 = b"01234567890123456789012345678901";
        let key2 = b"abcdefghijklmnopqrstuvwxyz123456";
        let encrypted = encrypt("test_data", key1).unwrap();
        assert!(decrypt(&encrypted, key2).is_err());
    }

    #[test]
    fn test_mask_card_number() {
        assert_eq!(mask_card_number("4084084084084081"), "408408******4081");
        assert_eq!(mask_card_number("1234"), "****");
    }

    #[test]
    fn test_hash() {
        let h = hash("hello");
        assert_eq!(h.len(), 64);
        assert_eq!(hash("hello"), hash("hello"));
        assert_ne!(hash("hello"), hash("world"));
    }

    #[test]
    fn test_rate_limiter() {
        let limiter = RateLimiter::new(3, 60);
        assert!(limiter.check("test_key"));
        assert!(limiter.check("test_key"));
        assert!(limiter.check("test_key"));
        assert!(!limiter.check("test_key"));
        assert!(limiter.check("other_key"));
    }
}
