use serde::{Deserialize, Serialize};
use uuid::Uuid;
use chrono::NaiveDateTime;

#[derive(Debug, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "varchar")]
pub enum TransactionStatus {
    #[sqlx(rename = "pending")]
    Pending,
    #[sqlx(rename = "initialized")]
    Initialized,
    #[sqlx(rename = "processing")]
    Processing,
    #[sqlx(rename = "success")]
    Success,
    #[sqlx(rename = "failed")]
    Failed,
    #[sqlx(rename = "reversed")]
    Reversed,
    #[sqlx(rename = "refunded")]
    Refunded,
}

#[derive(Debug, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "varchar")]
pub enum PaymentChannel {
    #[sqlx(rename = "card")]
    Card,
    #[sqlx(rename = "ussd")]
    Ussd,
    #[sqlx(rename = "bank_transfer")]
    BankTransfer,
    #[sqlx(rename = "mobile_money")]
    MobileMoney,
    #[sqlx(rename = "qr")]
    Qr,
    #[sqlx(rename = "direct_debit")]
    DirectDebit,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: Uuid,
    pub reference: String,
    pub merchant_id: String,
    pub customer_id: Option<String>,
    pub amount: f64,
    pub currency: String,
    pub status: String,
    pub channel: Option<String>,
    pub fee: f64,
    pub metadata: Option<serde_json::Value>,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LedgerEntry {
    pub id: Uuid,
    pub merchant_id: String,
    pub transaction_reference: Option<String>,
    pub entry_type: String,
    pub amount: f64,
    pub balance_before: f64,
    pub balance_after: f64,
    pub currency: String,
    pub created_at: NaiveDateTime,
}

#[derive(Debug, Deserialize)]
pub struct ProcessPaymentRequest {
    pub reference: String,
    pub amount: f64,
    pub currency: String,
    pub merchant_id: String,
}

#[derive(Debug, Serialize)]
pub struct ProcessPaymentResponse {
    pub success: bool,
    pub reference: String,
    pub status: String,
    pub message: String,
    pub fee: f64,
    pub processor_transaction_id: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct FraudCheckRequest {
    pub transaction_reference: String,
    pub amount: f64,
    pub currency: String,
    pub email: Option<String>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize)]
pub struct FraudCheckResponse {
    pub is_fraudulent: bool,
    pub score: f64,
    pub flags: Vec<String>,
    pub recommendation: String,
}
