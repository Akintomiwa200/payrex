import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function SubscriptionsDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Subscriptions</h1>
      <p className="text-lg text-muted-foreground mb-8">Recurring billing with subscription plans and automated payment collection.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/plans" description="Create a subscription plan" />
          <EndpointCard method="GET" path="/plans" description="List subscription plans" />
          <EndpointCard method="GET" path="/plans/{id}" description="Get plan details" />
          <EndpointCard method="POST" path="/subscriptions" description="Create a subscription" />
          <EndpointCard method="GET" path="/subscriptions" description="List subscriptions" />
          <EndpointCard method="POST" path="/subscriptions/{id}/cancel" description="Cancel a subscription" />
          <EndpointCard method="POST" path="/subscriptions/{id}/pause" description="Pause a subscription" />
          <EndpointCard method="POST" path="/subscriptions/{id}/resume" description="Resume a paused subscription" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Create a Plan</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/plans \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Premium Plan",
    "amount": 50000.00,
    "currency": "NGN",
    "interval": "monthly",
    "description": "Premium subscription with all features",
    "billingCycles": 12
  }'`}
          language="bash"
          title="POST /plans"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Create a Subscription</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/subscriptions \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customerId": "cus_abc123",
    "planId": "plan_xyz789",
    "startDate": "2024-01-01",
    "authorization": {
      "token": "tok_card_abc123"
    }
  }'`}
          language="bash"
          title="POST /subscriptions"
        />
      </section>
    </div>
  )
}
