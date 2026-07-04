import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function TokensDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Card Tokens</h1>
      <p className="text-lg text-muted-foreground mb-8">Tokenize card details for PCI-compliant recurring billing. Never handle raw card numbers after tokenization.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/tokens/card" description="Tokenize a card" />
          <EndpointCard method="GET" path="/tokens/{id}" description="Get token details" />
          <EndpointCard method="POST" path="/tokens/charge" description="Charge a tokenized card" />
          <EndpointCard method="GET" path="/tokens" description="List tokens" />
          <EndpointCard method="DELETE" path="/tokens/{id}" description="Delete a token" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Tokenize a Card</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/tokens/card \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "cardNumber": "4084084084084081",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cvv": "123",
    "customerId": "cus_abc123"
  }'`}
          language="bash"
          title="POST /tokens/card"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Charge Using Token</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/tokens/charge \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "tok_card_abc123",
    "amount": 5000.00,
    "currency": "NGN",
    "cvv": "123"
  }'`}
          language="bash"
          title="POST /tokens/charge"
        />
      </section>
    </div>
  )
}
