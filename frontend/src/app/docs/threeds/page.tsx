import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function ThreeDSDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">3D Secure 2.0</h1>
      <p className="text-lg text-muted-foreground mb-8">3D Secure 2.0 authentication flow for card payments. Supports frictionless and challenge-based authentication.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Authentication Flow</h2>
        <div className="space-y-4 mb-8">
          {[
            { step: 1, label: "Initiate", desc: "Create a 3DS session with card details and transaction info" },
            { step: 2, label: "Challenge", desc: "If required, redirect the customer to the ACS challenge page" },
            { step: 3, label: "Callback", desc: "ACS sends the authentication result to your callback URL" },
            { step: 4, label: "Check", desc: "Verify the authentication status before proceeding with the charge" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex-shrink-0">{s.step}</div>
              <div><div className="font-medium">{s.label}</div><div className="text-sm text-muted-foreground">{s.desc}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/3ds/initiate" description="Initiate 3DS authentication" />
          <EndpointCard method="POST" path="/3ds/callback" description="ACS callback endpoint" />
          <EndpointCard method="GET" path="/3ds/{reference}/status" description="Check authentication status" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Initiate 3DS</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/3ds/initiate \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "transactionReference": "REF-001",
    "amount": 5000.00,
    "currency": "NGN",
    "cardNumber": "4084084084084081",
    "expiryMonth": "12",
    "expiryYear": "2025",
    "cardHolderName": "John Doe",
    "callbackUrl": "https://yourapp.com/3ds-callback"
  }'`}
          language="bash"
          title="POST /3ds/initiate"
        />
      </section>
    </div>
  )
}
