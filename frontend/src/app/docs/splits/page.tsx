import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function SplitsDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Split Payments</h1>
      <p className="text-lg text-muted-foreground mb-8">Split payments across multiple subaccounts for marketplace and platform use cases.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Split Types</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 rounded-lg border border-border bg-card"><div className="font-bold mb-1">Percentage</div><div className="text-sm text-muted-foreground">Split by % of amount</div></div>
          <div className="p-4 rounded-lg border border-border bg-card"><div className="font-bold mb-1">Flat</div><div className="text-sm text-muted-foreground">Fixed amount per recipient</div></div>
          <div className="p-4 rounded-lg border border-border bg-card"><div className="font-bold mb-1">Mixed</div><div className="text-sm text-muted-foreground">Combination of both</div></div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/splits" description="Create split configuration" />
          <EndpointCard method="GET" path="/splits/{id}" description="Get split details" />
          <EndpointCard method="GET" path="/splits" description="List all splits" />
          <EndpointCard method="PUT" path="/splits/{id}" description="Update split" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Create a Split</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/splits \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "percentage",
    "currency": "NGN",
    "recipients": [
      { "subaccountId": "sub_acc_1", "percentage": 70 },
      { "subaccountId": "sub_acc_2", "percentage": 30 }
    ]
  }'`}
          language="bash"
          title="POST /splits"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Use Split in Payment</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/transactions/initialize \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@example.com",
    "amount": 10000.00,
    "splitId": "split_abc123"
  }'`}
          language="bash"
          title="POST /transactions/initialize with split"
        />
      </section>
    </div>
  )
}
