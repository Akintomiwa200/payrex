export class PaymentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly data?: any,
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Invalid or missing API key', status: 401 },
  INVALID_API_KEY: { code: 'INVALID_API_KEY', message: 'API key is invalid or inactive', status: 401 },
  EXPIRED_API_KEY: { code: 'EXPIRED_API_KEY', message: 'API key has expired', status: 401 },
  INSUFFICIENT_PERMISSIONS: { code: 'INSUFFICIENT_PERMISSIONS', message: 'API key lacks required permissions', status: 403 },

  // Validation
  VALIDATION_ERROR: { code: 'VALIDATION_ERROR', message: 'Request validation failed', status: 422 },
  INVALID_AMOUNT: { code: 'INVALID_AMOUNT', message: 'Amount must be greater than zero', status: 422 },
  INVALID_CURRENCY: { code: 'INVALID_CURRENCY', message: 'Unsupported currency', status: 422 },
  INVALID_CARD: { code: 'INVALID_CARD', message: 'Card details are invalid', status: 422 },
  INVALID_CARD_NUMBER: { code: 'INVALID_CARD_NUMBER', message: 'Card number is invalid', status: 422 },
  INVALID_EXPIRY: { code: 'INVALID_EXPIRY', message: 'Card expiry date is invalid or in the past', status: 422 },
  INVALID_CVV: { code: 'INVALID_CVV', message: 'CVV is invalid', status: 422 },
  INVALID_EMAIL: { code: 'INVALID_EMAIL', message: 'Email address is invalid', status: 422 },
  INVALID_PHONE: { code: 'INVALID_PHONE', message: 'Phone number is invalid', status: 422 },
  INVALID_AMOUNT_RANGE: { code: 'INVALID_AMOUNT_RANGE', message: 'Amount is outside allowed range', status: 422 },
  INVALID_BANK_CODE: { code: 'INVALID_BANK_CODE', message: 'Bank code is invalid', status: 422 },
  INVALID_ACCOUNT_NUMBER: { code: 'INVALID_ACCOUNT_NUMBER', message: 'Account number is invalid', status: 422 },
  INVALID_REFERENCE: { code: 'INVALID_REFERENCE', message: 'Transaction reference is invalid', status: 422 },
  MISSING_REQUIRED_FIELD: { code: 'MISSING_REQUIRED_FIELD', message: 'A required field is missing', status: 422 },
  UNSUPPORTED_CHANNEL: { code: 'UNSUPPORTED_CHANNEL', message: 'Payment channel is not supported', status: 422 },

  // Transactions
  TRANSACTION_NOT_FOUND: { code: 'TRANSACTION_NOT_FOUND', message: 'Transaction not found', status: 404 },
  TRANSACTION_ALREADY_VERIFIED: { code: 'TRANSACTION_ALREADY_VERIFIED', message: 'Transaction has already been verified', status: 409 },
  TRANSACTION_EXPIRED: { code: 'TRANSACTION_EXPIRED', message: 'Transaction has expired', status: 410 },
  TRANSACTION_FAILED: { code: 'TRANSACTION_FAILED', message: 'Transaction processing failed', status: 400 },
  TRANSACTION_PENDING: { code: 'TRANSACTION_PENDING', message: 'Transaction is still pending', status: 400 },
  CANNOT_REFUND: { code: 'CANNOT_REFUND', message: 'Transaction cannot be refunded', status: 400 },
  REFUND_AMOUNT_EXCEEDED: { code: 'REFUND_AMOUNT_EXCEEDED', message: 'Refund amount exceeds transaction amount', status: 400 },
  REFUND_ALREADY_PROCESSED: { code: 'REFUND_ALREADY_PROCESSED', message: 'Full refund already processed for this transaction', status: 409 },

  // Balance & Wallet
  INSUFFICIENT_BALANCE: { code: 'INSUFFICIENT_BALANCE', message: 'Insufficient wallet balance', status: 400 },
  WALLET_NOT_FOUND: { code: 'WALLET_NOT_FOUND', message: 'Wallet not found', status: 404 },

  // Customers
  CUSTOMER_NOT_FOUND: { code: 'CUSTOMER_NOT_FOUND', message: 'Customer not found', status: 404 },
  CUSTOMER_ALREADY_EXISTS: { code: 'CUSTOMER_ALREADY_EXISTS', message: 'Customer with this email already exists', status: 409 },

  // Subscriptions
  PLAN_NOT_FOUND: { code: 'PLAN_NOT_FOUND', message: 'Subscription plan not found', status: 404 },
  SUBSCRIPTION_NOT_FOUND: { code: 'SUBSCRIPTION_NOT_FOUND', message: 'Subscription not found', status: 404 },
  SUBSCRIPTION_ALREADY_CANCELLED: { code: 'SUBSCRIPTION_ALREADY_CANCELLED', message: 'Subscription is already cancelled', status: 409 },

  // Splits
  SPLIT_NOT_FOUND: { code: 'SPLIT_NOT_FOUND', message: 'Split configuration not found', status: 404 },
  SPLIT_ALREADY_PROCESSED: { code: 'SPLIT_ALREADY_PROCESSED', message: 'Split has already been processed', status: 409 },
  INVALID_SPLIT_RECIPIENTS: { code: 'INVALID_SPLIT_RECIPIENTS', message: 'Split recipients total must equal 100%', status: 422 },

  // Transfers
  TRANSFER_NOT_FOUND: { code: 'TRANSFER_NOT_FOUND', message: 'Transfer not found', status: 404 },
  TRANSFER_FAILED: { code: 'TRANSFER_FAILED', message: 'Transfer processing failed', status: 400 },
  RECIPIENT_NOT_FOUND: { code: 'RECIPIENT_NOT_FOUND', message: 'Transfer recipient not found', status: 404 },
  RECIPIENT_ALREADY_EXISTS: { code: 'RECIPIENT_ALREADY_EXISTS', message: 'Recipient already exists', status: 409 },
  BULK_TRANSFER_PARTIALLY_FAILED: { code: 'BULK_TRANSFER_PARTIALLY_FAILED', message: 'Some transfers in the batch failed', status: 400 },

  // Disputes
  DISPUTE_NOT_FOUND: { code: 'DISPUTE_NOT_FOUND', message: 'Dispute not found', status: 404 },
  DISPUTE_ALREADY_RESOLVED: { code: 'DISPUTE_ALREADY_RESOLVED', message: 'Dispute has already been resolved', status: 409 },
  DISPUTE_EVIDENCE_REQUIRED: { code: 'DISPUTE_EVIDENCE_REQUIRED', message: 'Evidence is required to resolve this dispute', status: 422 },

  // Idempotency
  IDEMPOTENCY_KEY_REUSED: { code: 'IDEMPOTENCY_KEY_REUSED', message: 'Idempotency key has already been used for a different request', status: 422 },

  // Webhooks
  WEBHOOK_NOT_FOUND: { code: 'WEBHOOK_NOT_FOUND', message: 'Webhook endpoint not found', status: 404 },
  WEBHOOK_DELIVERY_FAILED: { code: 'WEBHOOK_DELIVERY_FAILED', message: 'Webhook delivery failed', status: 502 },

  // Tokens
  TOKEN_NOT_FOUND: { code: 'TOKEN_NOT_FOUND', message: 'Payment token not found', status: 404 },
  TOKEN_EXPIRED: { code: 'TOKEN_EXPIRED', message: 'Payment token has expired', status: 410 },
  TOKEN_ALREADY_USED: { code: 'TOKEN_ALREADY_USED', message: 'Payment token has already been used', status: 409 },

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please try again later.', status: 429 },

  // Server
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred', status: 500 },
  SERVICE_UNAVAILABLE: { code: 'SERVICE_UNAVAILABLE', message: 'Service is temporarily unavailable', status: 503 },
  PROVIDER_ERROR: { code: 'PROVIDER_ERROR', message: 'Payment provider returned an error', status: 502 },
  TIMEOUT: { code: 'TIMEOUT', message: 'Request timed out', status: 504 },
} as const;

export function throwPaymentError(
  errorDef: { code: string; message: string; status: number },
  additionalData?: any,
): never {
  throw new PaymentError(errorDef.code, errorDef.message, errorDef.status, additionalData);
}
