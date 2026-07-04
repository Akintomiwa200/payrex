export interface ProviderChargeRequest {
  reference: string;
  amount: number;
  currency: string;
  card?: {
    number: string;
    expMonth: string;
    expYear: string;
    cvv: string;
    pin?: string;
  };
  token?: string;
  email: string;
  ip?: string;
  metadata?: Record<string, any>;
}

export interface ProviderChargeResponse {
  success: boolean;
  status: string;
  processorReference: string;
  amount: number;
  fee: number;
  cardType?: string;
  last4?: string;
  authCode?: string;
  gatewayResponse: Record<string, any>;
}

export interface ProviderAuthorizationResponse {
  success: boolean;
  authorizationCode: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  bank?: string;
  reusable: boolean;
  signature: string;
}

export interface ProviderTransferRequest {
  reference: string;
  amount: number;
  currency: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  narration?: string;
}

export interface ProviderTransferResponse {
  success: boolean;
  processorReference: string;
  status: string;
  amount: number;
  fee: number;
  gatewayResponse: Record<string, any>;
}

export interface ProviderVerifyAccountRequest {
  bankCode: string;
  accountNumber: string;
}

export interface ProviderVerifyAccountResponse {
  success: boolean;
  accountName: string;
  bankCode: string;
}

export interface ProviderBalanceResponse {
  currency: string;
  availableBalance: number;
  ledgerBalance: number;
}

export interface PaymentProvider {
  name: string;
  charge(request: ProviderChargeRequest): Promise<ProviderChargeResponse>;
  authorize(request: ProviderChargeRequest): Promise<ProviderAuthorizationResponse>;
  capture(authorizationCode: string, amount: number): Promise<ProviderChargeResponse>;
  void(authorizationCode: string): Promise<boolean>;
  refund(processorReference: string, amount: number): Promise<boolean>;
  transfer(request: ProviderTransferRequest): Promise<ProviderTransferResponse>;
  verifyAccount(request: ProviderVerifyAccountRequest): Promise<ProviderVerifyAccountResponse>;
  getBalance(currency: string): Promise<ProviderBalanceResponse>;
  listBanks(country: string): Promise<any[]>;
}
