import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function TransactionsDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Transactions</h1>
      <p className="text-lg text-muted-foreground mb-8">Initialize, verify, charge, and refund payments across multiple channels.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Payment Channels</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {["Card", "Bank Transfer", "USSD", "Mobile Money", "QR", "Direct Debit"].map((ch) => (
            <div key={ch} className="p-3 rounded-lg border border-border bg-card text-center text-sm font-medium">{ch}</div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/transactions/initialize" description="Initialize a new payment" />
          <EndpointCard method="GET" path="/transactions/{reference}" description="Verify transaction status" />
          <EndpointCard method="POST" path="/transactions/charge" description="Charge a card directly" />
          <EndpointCard method="POST" path="/transactions/charge/bank" description="Charge via bank transfer" />
          <EndpointCard method="POST" path="/transactions/charge/ussd" description="Charge via USSD" />
          <EndpointCard method="POST" path="/transactions/{reference}/refund" description="Refund a transaction" />
          <EndpointCard method="GET" path="/transactions" description="List transactions" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Initialize a Payment</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/transactions/initialize \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@example.com",
    "amount": 5000.00,
    "currency": "NGN",
    "callbackUrl": "https://yourapp.com/verify"
  }'`}
          language="bash"
          title="POST /transactions/initialize"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Charge a Card</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/transactions/charge \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@example.com",
    "amount": 5000.00,
    "card": {
      "number": "4084084084084081",
      "cvv": "123",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "pin": "1234"
    }
  }'`}
          language="bash"
          title="POST /transactions/charge"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Verify Transaction</h2>
        <CodeBlock
          code={`curl http://localhost:8080/api/v1/transactions/REF-001 \\
  -H "Authorization: Bearer sk_test_..."`}
          language="bash"
          title="GET /transactions/{reference}"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Refund</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/transactions/REF-001/refund \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 2500.00,
    "reason": "Customer requested partial refund"
  }'`}
          language="bash"
          title="POST /transactions/{reference}/refund"
        />
      </section>
    </div>
  )
}
