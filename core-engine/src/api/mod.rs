pub mod handlers;

use actix_web::web;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .route("/process", web::post().to(handlers::process_payment))
            .route("/fraud-check", web::post().to(handlers::fraud_check))
            .route("/balance/{merchant_id}", web::get().to(handlers::get_balance))
            .route("/validate-card", web::get().to(handlers::validate_card))
            .route("/generate-key", web::get().to(handlers::generate_key))
            .route("/encrypt", web::post().to(handlers::encrypt_data))
            .route("/decrypt", web::post().to(handlers::decrypt_data))
            .route("/health", web::get().to(handlers::health_check)),
    );
}
