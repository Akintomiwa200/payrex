import { CodeBlock } from "@/components/CodeBlock"

export default function GettingStartedPage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
      <p className="text-lg text-muted-foreground mb-8">Set up your development environment and make your first API call in minutes.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">1. Run the Services</h2>
        <p className="text-muted-foreground mb-4">Start all services using Docker Compose:</p>
        <CodeBlock code="docker compose up -d" language="bash" title="Terminal" />
        <p className="text-muted-foreground mt-4">This starts PostgreSQL, Redis, the NestJS gateway, and the Rust core engine.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">2. Generate an API Key</h2>
        <p className="text-muted-foreground mb-4">Generate a test API key from the core engine:</p>
        <CodeBlock
          code={`curl http://localhost:9090/api/v1/generate-key?key_type=test

{
  "key": "sk_test_1a2b3c4d5e6f7g8h9i0j...",
  "key_type": "test"
}`}
          language="bash"
          title="Request & Response"
        />
        <p className="text-muted-foreground mt-4">Save this key — you will use it in the <code className="text-primary">Authorization</code> header for all API requests.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">3. Make Your First API Call</h2>
        <p className="text-muted-foreground mb-4">Initialize a payment transaction:</p>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/transactions/initialize \\
  -H "Authorization: Bearer sk_test_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "customer@example.com",
    "amount": 5000.00,
    "currency": "NGN"
  }'`}
          language="bash"
          title="Initialize Transaction"
        />
        <p className="text-muted-foreground mt-4">The response includes a <code className="text-primary">reference</code> you can use to verify the transaction.</p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">4. Verify the Transaction</h2>
        <CodeBlock
          code={`curl http://localhost:8080/api/v1/transactions/REF-001 \\
  -H "Authorization: Bearer sk_test_your_key_here"`}
          language="bash"
          title="Verify Transaction"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">5. Check Your Balance</h2>
        <CodeBlock
          code={`curl http://localhost:8080/api/v1/balance \\
  -H "Authorization: Bearer sk_test_your_key_here"`}
          language="bash"
          title="Get Balance"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Explore Transactions", desc: "Learn about card charging, bank transfers, and USSD payments.", link: "/docs/transactions" },
            { title: "Manage Customers", desc: "Create and manage your payment customers.", link: "/docs/customers" },
            { title: "Set Up Webhooks", desc: "Receive real-time payment notifications.", link: "/docs/webhooks" },
            { title: "KYC & Compliance", desc: "Verify merchants and monitor transactions.", link: "/docs/kyc" },
          ].map((item) => (
            <a key={item.title} href={item.link} className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
