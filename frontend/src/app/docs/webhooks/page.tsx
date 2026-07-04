import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function WebhooksDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Webhooks</h1>
      <p className="text-lg text-muted-foreground mb-8">Receive real-time notifications for events like successful payments, refunds, and disputes.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/webhooks" description="Register a webhook endpoint" />
          <EndpointCard method="GET" path="/webhooks" description="List all webhook endpoints" />
          <EndpointCard method="PUT" path="/webhooks/{id}" description="Update webhook endpoint" />
          <EndpointCard method="DELETE" path="/webhooks/{id}" description="Delete webhook endpoint" />
          <EndpointCard method="GET" path="/webhooks/{id}/events" description="List delivery events" />
          <EndpointCard method="POST" path="/webhooks/{id}/events/{eventId}/retry" description="Retry a failed delivery" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Register a Webhook</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/webhooks \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://yourapp.com/webhooks",
    "events": ["charge.success", "charge.failed", "refund.success"],
    "description": "Production webhook"
  }'`}
          language="bash"
          title="POST /webhooks"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Webhook Payload</h2>
        <CodeBlock
          code={`{
  "event": "charge.success",
  "data": {
    "reference": "REF-001",
    "amount": 5000.00,
    "currency": "NGN",
    "status": "success",
    "paidAt": "2024-01-01T00:00:00.000Z",
    "customer": {
      "email": "customer@example.com"
    }
  },
  "sentAt": "2024-01-01T00:00:00.000Z"
}`}
          language="json"
          title="Example Webhook Payload"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Signature Verification</h2>
        <p className="text-muted-foreground mb-4">Verify webhook signatures using HMAC-SHA256:</p>
        <CodeBlock
          code={`// Node.js
const crypto = require('crypto');
const secret = 'whsec_your_webhook_secret';
const signature = req.headers['x-webhook-signature'];
const payload = JSON.stringify(req.body);
const expected = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature),
  Buffer.from(expected)
);`}
          language="javascript"
          title="Signature Verification (Node.js)"
        />
      </section>
    </div>
  )
}
