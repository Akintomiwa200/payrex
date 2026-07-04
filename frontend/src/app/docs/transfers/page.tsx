import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function TransfersDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Transfers</h1>
      <p className="text-lg text-muted-foreground mb-8">Send money to bank accounts and mobile money wallets. Supports single and bulk transfers.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/transfers/recipients" description="Create a transfer recipient" />
          <EndpointCard method="GET" path="/transfers/recipients" description="List recipients" />
          <EndpointCard method="POST" path="/transfers" description="Initiate a single transfer" />
          <EndpointCard method="POST" path="/transfers/bulk" description="Initiate a bulk transfer" />
          <EndpointCard method="GET" path="/transfers" description="List transfers" />
          <EndpointCard method="GET" path="/transfers/{reference}" description="Get transfer status" />
          <EndpointCard method="GET" path="/transfers/bulk/{batchId}" description="Get bulk transfer status" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Create Recipient</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/transfers/recipients \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "bank_account",
    "name": "John Doe",
    "accountNumber": "0123456789",
    "bankCode": "058",
    "currency": "NGN",
    "description": "Primary payout account"
  }'`}
          language="bash"
          title="POST /transfers/recipients"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Initiate Transfer</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/transfers \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipientCode": "RCP_abc123",
    "amount": 50000.00,
    "currency": "NGN",
    "reason": "Payout for January sales"
  }'`}
          language="bash"
          title="POST /transfers"
        />
      </section>
    </div>
  )
}
