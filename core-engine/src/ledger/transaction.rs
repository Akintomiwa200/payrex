use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;
use crate::models::{ProcessPaymentRequest, ProcessPaymentResponse};

pub async fn process_transaction(
    pool: &PgPool,
    req: &ProcessPaymentRequest,
) -> Result<ProcessPaymentResponse, sqlx::Error> {
    let tx_id = Uuid::new_v4();
    let fee = (req.amount * 0.015 * 100.0).round() / 100.0;
    let processor_tx_id = format!("PROC-{}", Uuid::new_v4());

    sqlx::query(
        r#"UPDATE transactions 
         SET status = 'success', fee = $1, gateway_response = $2, paid_at = NOW(), updated_at = NOW()
         WHERE reference = $3 AND merchant_id = $4"#,
    )
    .bind(fee)
    .bind(serde_json::json!({
        "processor": "core-engine",
        "processor_transaction_id": &processor_tx_id,
        "processed_at": Utc::now().to_rfc3339(),
    }))
    .bind(&req.reference)
    .bind(&req.merchant_id)
    .execute(pool)
    .await?;

    let amount_after_fee = req.amount - fee;
    super::record_ledger_entry(
        pool,
        &req.merchant_id,
        Some(&req.reference),
        "credit",
        amount_after_fee,
        &req.currency,
        &format!("Payment processed: {}", req.reference),
    )
    .await?;

    Ok(ProcessPaymentResponse {
        success: true,
        reference: req.reference.clone(),
        status: "success".to_string(),
        message: "Transaction processed successfully".to_string(),
        fee,
        processor_transaction_id: Some(processor_tx_id),
    })
}
