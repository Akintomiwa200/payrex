import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function DocsOverview() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">API Overview</h1>
      <p className="text-lg text-muted-foreground mb-8">
        The Finance Gateway API is organized around REST. All requests should be made to the gateway server at <code className="text-primary">http://localhost:8080</code>.
      </p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Base URL</h2>
        <CodeBlock code="http://localhost:8080/api/v1" language="bash" title="API Base URL" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        <p className="text-muted-foreground mb-4">
          All API requests require an API key passed via the <code className="text-primary">Authorization</code> header:
        </p>
        <CodeBlock
          code="Authorization: Bearer sk_test_abc123def456..."
          language="bash"
          title="Request Header"
        />
        <p className="text-muted-foreground mt-4">
          Generate test keys via the core engine or the Auth API. Use <code className="text-primary">sk_test_</code> for test mode and <code className="text-primary">sk_live_</code> for live mode.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Response Format</h2>
        <p className="text-muted-foreground mb-4">
          All responses follow a consistent JSON envelope:
        </p>
        <CodeBlock
          code={JSON.stringify({
            status: true,
            message: "Transaction initialized",
            data: { reference: "REF-001", amount: 5000, status: "pending" },
            timestamp: "2024-01-01T00:00:00.000Z",
          }, null, 2)}
          language="json"
          title="Success Response"
        />
        <CodeBlock
          code={JSON.stringify({
            status: false,
            statusCode: 422,
            message: "Amount must be greater than zero",
            data: null,
            timestamp: "2024-01-01T00:00:00.000Z",
          }, null, 2)}
          language="json"
          title="Error Response"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Idempotency</h2>
        <p className="text-muted-foreground mb-4">
          POST requests support idempotency via the <code className="text-primary">Idempotency-Key</code> header. If a request is retried with the same key within 24 hours, the original response is returned.
        </p>
        <CodeBlock
          code="Idempotency-Key: unique-key-per-request-123"
          language="bash"
          title="Idempotency Header"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Rate Limiting</h2>
        <p className="text-muted-foreground mb-4">
          The API is rate-limited per API key. Limits are configured via environment variables:
        </p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-primary">30</div>
            <div className="text-sm text-muted-foreground">Requests per window</div>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="text-2xl font-bold text-primary">60s</div>
            <div className="text-sm text-muted-foreground">Window duration</div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Rate-limited responses return HTTP <code className="text-primary">429 Too Many Requests</code> with a <code className="text-primary">Retry-After</code> header.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3">
          <EndpointCard method="POST" path="/transactions/initialize" description="Initialize a new payment transaction" />
          <EndpointCard method="GET" path="/transactions/{reference}" description="Verify a transaction status" />
          <EndpointCard method="POST" path="/transactions/charge" description="Charge a card directly" />
          <EndpointCard method="POST" path="/transactions/{reference}/refund" description="Refund a transaction" />
          <EndpointCard method="GET" path="/transactions" description="List transactions with filters" />
          <EndpointCard method="POST" path="/customers" description="Create a customer" />
          <EndpointCard method="GET" path="/customers/{id}" description="Get customer details" />
          <EndpointCard method="POST" path="/subscriptions" description="Create a subscription" />
          <EndpointCard method="POST" path="/splits" description="Create a split payment configuration" />
          <EndpointCard method="POST" path="/webhooks" description="Register a webhook endpoint" />
          <EndpointCard method="POST" path="/transfers" description="Initiate a transfer" />
          <EndpointCard method="POST" path="/disputes" description="Open a dispute" />
          <EndpointCard method="POST" path="/tokens" description="Tokenize a card" />
          <EndpointCard method="POST" path="/kyc/documents" description="Submit a KYC document" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Error Codes</h2>
        <p className="text-muted-foreground mb-4">
          The API uses standardized error codes for consistent error handling:
        </p>
        <CodeBlock
          code={`UNAUTHORIZED         401  Invalid or missing API key
VALIDATION_ERROR      422  Request validation failed
INVALID_AMOUNT        422  Amount must be greater than zero
INSUFFICIENT_BALANCE  400  Insufficient wallet balance
TRANSACTION_NOT_FOUND 404  Transaction not found
RATE_LIMIT_EXCEEDED   429  Too many requests`}
          language="bash"
          title="Common Error Codes"
        />
      </section>
    </div>
  )
}
