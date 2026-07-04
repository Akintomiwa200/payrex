use crate::models::FraudCheckRequest;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Serialize)]
pub struct FraudCheckResult {
    pub is_fraudulent: bool,
    pub score: f64,
    pub flags: Vec<String>,
    pub recommendation: String,
    pub rules_triggered: Vec<FraudRuleResult>,
}

#[derive(Debug, Serialize)]
pub struct FraudRuleResult {
    pub rule: String,
    pub weight: f64,
    pub triggered: bool,
    pub detail: String,
}

pub async fn run_fraud_check(req: &FraudCheckRequest) -> FraudCheckResult {
    let mut flags: Vec<String> = Vec::new();
    let mut rules_triggered: Vec<FraudRuleResult> = Vec::new();
    let mut score: f64 = 0.0;

    // Rule 1: High amount threshold
    let high_amount_triggered = req.amount > 500_000.0;
    let very_high_amount_triggered = req.amount > 5_000_000.0;
    if high_amount_triggered {
        flags.push("high_amount".to_string());
        score += 20.0;
    }
    rules_triggered.push(FraudRuleResult {
        rule: "high_amount_threshold".into(),
        weight: 20.0,
        triggered: high_amount_triggered,
        detail: format!("Amount {} exceeds threshold 500000", req.amount),
    });

    if very_high_amount_triggered {
        flags.push("very_high_amount".to_string());
        score += 30.0;
    }

    // Rule 2: Velocity check from metadata
    let velocity_flagged = req.metadata.as_ref()
        .and_then(|m| m.get("velocity_check"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    if velocity_flagged {
        flags.push("high_velocity".to_string());
        score += 25.0;
    }
    rules_triggered.push(FraudRuleResult {
        rule: "velocity_check".into(),
        weight: 25.0,
        triggered: velocity_flagged,
        detail: "High transaction velocity detected".into(),
    });

    // Rule 3: New device
    let new_device = req.metadata.as_ref()
        .and_then(|m| m.get("new_device"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    if new_device {
        flags.push("new_device".to_string());
        score += 10.0;
    }
    rules_triggered.push(FraudRuleResult {
        rule: "new_device".into(),
        weight: 10.0,
        triggered: new_device,
        detail: "Transaction from unrecognized device".into(),
    });

    // Rule 4: Multiple cards check (from metadata)
    let multiple_cards = req.metadata.as_ref()
        .and_then(|m| m.get("card_count"))
        .and_then(|c| c.as_u64())
        .unwrap_or(0) > 3;
    if multiple_cards {
        flags.push("multiple_cards".to_string());
        score += 15.0;
    }
    rules_triggered.push(FraudRuleResult {
        rule: "multiple_cards".into(),
        weight: 15.0,
        triggered: multiple_cards,
        detail: "Multiple cards used in short period".into(),
    });

    // Rule 5: International transaction
    let international = req.metadata.as_ref()
        .and_then(|m| m.get("is_international"))
        .and_then(|v| v.as_bool())
        .unwrap_or(false);
    if international && req.amount > 100_000.0 {
        flags.push("international_high_value".to_string());
        score += 10.0;
    }
    rules_triggered.push(FraudRuleResult {
        rule: "international_high_value".into(),
        weight: 10.0,
        triggered: international && req.amount > 100_000.0,
        detail: "International transaction with high value".into(),
    });

    let recommendation = if score >= 50.0 {
        "block".to_string()
    } else if score >= 25.0 {
        "review".to_string()
    } else {
        "approve".to_string()
    };

    FraudCheckResult {
        is_fraudulent: score >= 50.0,
        score,
        flags,
        recommendation,
        rules_triggered,
    }
}
