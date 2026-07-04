pub mod transaction;

use sqlx::PgPool;
use uuid::Uuid;
use chrono::Utc;

#[derive(Debug)]
pub struct LedgerEntry {
    pub id: Uuid,
    pub merchant_id: String,
    pub transaction_reference: Option<String>,
    pub entry_type: String,
    pub amount: f64,
    pub balance_before: f64,
    pub balance_after: f64,
    pub currency: String,
    pub description: String,
}

#[derive(Debug)]
pub struct WalletBalance {
    pub merchant_id: String,
    pub balance: f64,
    pub pending_balance: f64,
    pub total_volume: f64,
    pub currency: String,
}

pub async fn record_ledger_entry(
    pool: &PgPool,
    merchant_id: &str,
    transaction_ref: Option<&str>,
    entry_type: &str,
    amount: f64,
    currency: &str,
    description: &str,
) -> Result<LedgerEntry, sqlx::Error> {
    let current_balance: f64 = sqlx::query_scalar(
        "SELECT COALESCE(balance, 0) FROM wallets WHERE merchant_id = $1",
    )
    .bind(merchant_id)
    .fetch_optional(pool)
    .await?
    .unwrap_or(0.0);

    let balance_after = if entry_type == "credit" || entry_type == "settlement" {
        current_balance + amount
    } else {
        current_balance - amount
    };

    let id = Uuid::new_v4();
    sqlx::query(
        r#"INSERT INTO balance_ledger (id, merchant_id, transaction_reference, type, amount, balance_before, balance_after, currency, description, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())"#,
    )
    .bind(id)
    .bind(merchant_id)
    .bind(transaction_ref)
    .bind(entry_type)
    .bind(amount)
    .bind(current_balance)
    .bind(balance_after)
    .bind(currency)
    .bind(description)
    .execute(pool)
    .await?;

    sqlx::query(
        r#"INSERT INTO wallets (merchant_id, balance, total_volume, currency, created_at, updated_at)
         VALUES ($1, $2, CASE WHEN $3 = 'credit' THEN $4 ELSE 0 END, $5, NOW(), NOW())
         ON CONFLICT (merchant_id) DO UPDATE SET
           balance = EXCLUDED.balance,
           total_volume = wallets.total_volume + CASE WHEN $3 = 'credit' THEN $4 ELSE 0 END,
           updated_at = NOW()"#,
    )
    .bind(merchant_id)
    .bind(balance_after)
    .bind(entry_type)
    .bind(amount)
    .bind(currency)
    .execute(pool)
    .await?;

    Ok(LedgerEntry {
        id,
        merchant_id: merchant_id.to_string(),
        transaction_reference: transaction_ref.map(|s| s.to_string()),
        entry_type: entry_type.to_string(),
        amount,
        balance_before: current_balance,
        balance_after,
        currency: currency.to_string(),
        description: description.to_string(),
    })
}

pub async fn get_wallet_balance(
    pool: &PgPool,
    merchant_id: &str,
) -> Result<WalletBalance, sqlx::Error> {
    let row = sqlx::query_as::<_, (String, f64, f64, f64, String)>(
        r#"SELECT merchant_id, balance, COALESCE(pending_balance, 0), COALESCE(total_volume, 0), COALESCE(currency, 'NGN')
         FROM wallets WHERE merchant_id = $1"#,
    )
    .bind(merchant_id)
    .fetch_optional(pool)
    .await?;

    match row {
        Some((mid, bal, pend, vol, curr)) => Ok(WalletBalance {
            merchant_id: mid,
            balance: bal,
            pending_balance: pend,
            total_volume: vol,
            currency: curr,
        }),
        None => Ok(WalletBalance {
            merchant_id: merchant_id.to_string(),
            balance: 0.0,
            pending_balance: 0.0,
            total_volume: 0.0,
            currency: "NGN".to_string(),
        }),
    }
}
