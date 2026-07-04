import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function CustomersDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Customers</h1>
      <p className="text-lg text-muted-foreground mb-8">Create and manage your payment customers with metadata and transaction history.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/customers" description="Create a customer" />
          <EndpointCard method="GET" path="/customers/{id}" description="Get customer details" />
          <EndpointCard method="GET" path="/customers" description="List all customers" />
          <EndpointCard method="PUT" path="/customers/{id}" description="Update customer" />
          <EndpointCard method="DELETE" path="/customers/{id}" description="Delete a customer" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Create a Customer</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/customers \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348012345678",
    "metadata": {
      "company": "Acme Inc",
      "referralSource": "website"
    }
  }'`}
          language="bash"
          title="POST /customers"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Customer Object</h2>
        <CodeBlock
          code={`{
  "id": "cus_abc123",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348012345678",
  "riskLevel": "low",
  "totalTransactions": 0,
  "totalVolume": 0,
  "metadata": { "company": "Acme Inc" },
  "createdAt": "2024-01-01T00:00:00.000Z"
}`}
          language="json"
          title="Customer Response"
        />
      </section>
    </div>
  )
}
