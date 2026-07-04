-- Finance Gateway - Database Initialization
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
DO $$ BEGIN
    CREATE TYPE transaction_status AS ENUM ('pending', 'initialized', 'processing', 'success', 'failed', 'reversed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_channel AS ENUM ('card', 'ussd', 'bank_transfer', 'mobile_money', 'qr', 'direct_debit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE currency AS ENUM ('NGN', 'USD', 'GBP', 'EUR', 'KES', 'GHS', 'ZAR');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE plan_interval AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'expired', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE split_type AS ENUM ('percentage', 'flat', 'mixed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE ledger_entry_type AS ENUM ('credit', 'debit', 'reversal', 'fee', 'settlement', 'refund');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE settlement_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_document_type AS ENUM ('international_passport', 'national_id', 'drivers_license', 'voters_card', 'bvn', 'nin', 'cac_registration', 'utility_bill', 'bank_statement', 'tax_certificate');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE kyc_verification_status AS ENUM ('unverified', 'pending', 'verified', 'failed', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'won', 'lost');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE threeds_status AS ENUM ('initiated', 'challenge_required', 'challenge_complete', 'authenticated', 'failed', 'declined', 'error');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE screening_status AS ENUM ('pending', 'clear', 'flagged', 'reviewed', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'api_call', 'payment', 'refund', 'transfer', 'kyc_update', 'compliance_check', 'settlement', 'webhook_send', 'export', 'settings_change');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE audit_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_status ON transactions(merchant_id, status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_merchant_email ON customers(merchant_id, email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_merchant ON subscriptions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_balance_ledger_merchant ON balance_ledger(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_merchant ON audit_logs(merchant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_kyc_records_merchant ON kyc_records(merchant_id);
CREATE INDEX IF NOT EXISTS idx_kyc_records_status ON kyc_records(status);
CREATE INDEX IF NOT EXISTS idx_bvn_records_merchant ON bvn_records(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_merchant ON payment_tokens(merchant_id);
CREATE INDEX IF NOT EXISTS idx_payment_tokens_customer ON payment_tokens(customer_id);
CREATE INDEX IF NOT EXISTS idx_transfers_merchant ON transfers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_bulk_transfers_merchant ON bulk_transfers(merchant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_merchant ON disputes(merchant_id);
CREATE INDEX IF NOT EXISTS idx_disputes_transaction ON disputes(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_threeds_auth_merchant ON threeds_authentications(merchant_id);
CREATE INDEX IF NOT EXISTS idx_threeds_auth_transaction ON threeds_authentications(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_compliance_screenings_merchant ON compliance_screenings(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_merchant ON transaction_monitoring(merchant_id);
CREATE INDEX IF NOT EXISTS idx_transaction_monitoring_ref ON transaction_monitoring(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_merchant ON idempotency_keys(merchant_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_merchant ON api_keys(merchant_id);
CREATE INDEX IF NOT EXISTS idx_settlements_status ON settlements(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_endpoint ON webhook_events(endpoint_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);

-- Full-text search on transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS search_vector tsvector;
CREATE INDEX IF NOT EXISTS idx_transactions_search ON transactions USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_transaction_search_vector()
RETURNS trigger AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.reference, '') || ' ' || COALESCE(NEW.failure_reason, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transaction_search ON transactions;
CREATE TRIGGER trg_transaction_search
    BEFORE INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_transaction_search_vector();
