import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function BalanceDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Balance & Ledger</h1>
      <p className="text-lg text-muted-foreground mb-8">Real-time wallet balances with a complete double-entry ledger for all financial movements.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="GET" path="/balance" description="Get wallet balance" />
          <EndpointCard method="GET" path="/balance/ledger" description="List ledger entries" />
          <EndpointCard method="GET" path="/balance/ledger/{id}" description="Get ledger entry details" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Get Balance</h2>
        <CodeBlock
          code={`curl http://localhost:8080/api/v1/balance \\
  -H "Authorization: Bearer sk_test_..."

{
  "currency": "NGN",
  "balance": 150000.00,
  "pendingBalance": 25000.00,
  "totalVolume": 5000000.00,
  "ledgerEntries": 1250
}`}
          language="bash"
          title="GET /balance"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Ledger Entry Types</h2>
        <div className="grid grid-cols-3 gap-3">
          {["credit", "debit", "reversal", "fee", "settlement", "refund"].map((t) => (
            <div key={t} className="p-3 rounded-lg border border-border bg-card text-sm font-medium capitalize">{t}</div>
          ))}
        </div>
      </section>
    </div>
  )
}
