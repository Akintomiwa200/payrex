use actix_web::{web, HttpResponse, HttpRequest};
use crate::AppState;
use crate::models::*;
use crate::ledger;
use crate::ledger::transaction as txn_processor;
use crate::fraud;
use crate::crypto;
use crate::security;

pub async fn health_check(state: web::Data<AppState>) -> HttpResponse {
    let db_ok = sqlx::query("SELECT 1")
        .execute(&state.db_pool)
        .await
        .is_ok();

    HttpResponse::Ok().json(serde_json::json!({
        "status": if db_ok { "ok" } else { "degraded" },
        "service": "core-engine",
        "version": "1.0.0",
        "database": db_ok,
        "timestamp": chrono::Utc::now().to_rfc3339(),
        "uptime_seconds": chrono::Utc::now().timestamp(),
    }))
}

pub async fn process_payment(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<ProcessPaymentRequest>,
) -> HttpResponse {
    let client_ip = req.peer_addr().map(|a| a.ip().to_string()).unwrap_or_default();
    if !state.rate_limiter.check(&format!("process:{}", client_ip)) {
        return HttpResponse::TooManyRequests().json(serde_json::json!({
            "success": false,
            "message": "Rate limit exceeded. Try again later.",
        }));
    }

    log::info!("Processing payment: {} for merchant {}", body.reference, body.merchant_id);

    match txn_processor::process_transaction(&state.db_pool, &body).await {
        Ok(response) => HttpResponse::Ok().json(response),
        Err(e) => {
            log::error!("Payment processing failed: {:?}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "success": false,
                "message": format!("Payment processing failed: {}", e),
            }))
        }
    }
}

pub async fn fraud_check(
    state: web::Data<AppState>,
    req: HttpRequest,
    body: web::Json<FraudCheckRequest>,
) -> HttpResponse {
    let client_ip = req.peer_addr().map(|a| a.ip().to_string()).unwrap_or_default();
    if !state.rate_limiter.check(&format!("fraud:{}", client_ip)) {
        return HttpResponse::TooManyRequests().json(serde_json::json!({
            "success": false,
            "message": "Rate limit exceeded",
        }));
    }

    log::info!("Running fraud check for: {}", body.transaction_reference);
    let result = fraud::run_fraud_check(&body).await;
    HttpResponse::Ok().json(result)
}

pub async fn get_balance(
    state: web::Data<AppState>,
    path: web::Path<String>,
) -> HttpResponse {
    let merchant_id = path.into_inner();
    log::info!("Fetching balance for merchant: {}", merchant_id);

    match ledger::get_wallet_balance(&state.db_pool, &merchant_id).await {
        Ok(balance) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "data": balance,
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "success": false,
            "message": format!("Failed to fetch balance: {}", e),
        })),
    }
}

pub async fn validate_card(
    query: web::Query<CardValidateQuery>,
) -> HttpResponse {
    let result = crypto::validate_card_number(&query.card_number);
    HttpResponse::Ok().json(result)
}

pub async fn generate_key(
    query: web::Query<GenerateKeyQuery>,
) -> HttpResponse {
    let key_type = query.key_type.as_deref().unwrap_or("test");
    let key = crypto::generate_api_key(key_type);
    HttpResponse::Ok().json(serde_json::json!({
        "key": key,
        "key_type": key_type,
    }))
}

pub async fn encrypt_data(
    state: web::Data<AppState>,
    body: web::Json<EncryptRequest>,
) -> HttpResponse {
    match security::encrypt(&body.plaintext, &state.encryption_key) {
        Ok(ciphertext) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "ciphertext": ciphertext,
        })),
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "success": false,
            "message": e,
        })),
    }
}

pub async fn decrypt_data(
    state: web::Data<AppState>,
    body: web::Json<DecryptRequest>,
) -> HttpResponse {
    match security::decrypt(&body.ciphertext, &state.encryption_key) {
        Ok(plaintext) => HttpResponse::Ok().json(serde_json::json!({
            "success": true,
            "plaintext": plaintext,
        })),
        Err(e) => HttpResponse::BadRequest().json(serde_json::json!({
            "success": false,
            "message": e,
        })),
    }
}

#[derive(serde::Deserialize)]
pub struct CardValidateQuery {
    pub card_number: String,
}

#[derive(serde::Deserialize)]
pub struct GenerateKeyQuery {
    pub key_type: Option<String>,
}

#[derive(serde::Deserialize)]
pub struct EncryptRequest {
    pub plaintext: String,
}

#[derive(serde::Deserialize)]
pub struct DecryptRequest {
    pub ciphertext: String,
}
