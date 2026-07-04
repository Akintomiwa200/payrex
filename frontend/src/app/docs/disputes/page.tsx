import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function DisputesDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Disputes</h1>
      <p className="text-lg text-muted-foreground mb-8">Manage chargebacks and customer disputes with evidence submission and resolution tracking.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/disputes" description="Open a new dispute" />
          <EndpointCard method="GET" path="/disputes" description="List disputes" />
          <EndpointCard method="GET" path="/disputes/{id}" description="Get dispute details" />
          <EndpointCard method="POST" path="/disputes/{id}/evidence" description="Submit evidence" />
          <EndpointCard method="POST" path="/disputes/{id}/resolve" description="Resolve a dispute" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Open a Dispute</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/disputes \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "transactionReference": "REF-001",
    "reason": "unauthorized_charge",
    "description": "Customer claims they did not authorize this payment",
    "amount": 5000.00
  }'`}
          language="bash"
          title="POST /disputes"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Submit Evidence</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/disputes/DIS_abc123/evidence \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "delivery_proof",
    "description": "Signed delivery confirmation",
    "files": [
      {
        "url": "https://storage.example.com/delivery.pdf",
        "type": "document"
      }
    ]
  }'`}
          language="bash"
          title="POST /disputes/{id}/evidence"
        />
      </section>
    </div>
  )
}
