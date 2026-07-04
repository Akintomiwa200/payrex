import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function SettlementsDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Settlements</h1>
      <p className="text-lg text-muted-foreground mb-8">Batch settlement processing, reconciliation, and payout reporting.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="GET" path="/settlements" description="List settlements" />
          <EndpointCard method="GET" path="/settlements/{id}" description="Get settlement details" />
          <EndpointCard method="POST" path="/settlements/{id}/process" description="Process a settlement batch" />
          <EndpointCard method="POST" path="/settlements/reconcile" description="Trigger reconciliation" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Reconciliation</h2>
        <p className="text-muted-foreground mb-4">
          Reconciliation runs automatically every 6 hours via a recurring Bull queue job. It matches transaction records against settlement reports and flags discrepancies.
        </p>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/settlements/reconcile \\
  -H "Authorization: Bearer sk_test_..."

{
  "status": true,
  "message": "Reconciliation completed",
  "data": {
    "matched": 145,
    "unmatched": 2,
    "discrepancies": [
      {
        "reference": "REF-001",
        "expected": 5000.00,
        "actual": 4950.00,
        "difference": -50.00
      }
    ]
  }
}`}
          language="bash"
          title="POST /settlements/reconcile"
        />
      </section>
    </div>
  )
}
