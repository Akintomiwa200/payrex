import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function AuthDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Authentication</h1>
      <p className="text-lg text-muted-foreground mb-8">API keys, merchant registration, and authentication flows.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">API Key Types</h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
            <div className="font-bold text-green-500 mb-1">Test Keys</div>
            <code className="text-sm">sk_test_...</code>
            <p className="text-sm text-muted-foreground mt-2">Use for development and testing. No real money moved.</p>
          </div>
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5">
            <div className="font-bold text-red-500 mb-1">Live Keys</div>
            <code className="text-sm">sk_live_...</code>
            <p className="text-sm text-muted-foreground mt-2">Use for production. Moves real money.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/auth/register" description="Register a new merchant" />
          <EndpointCard method="POST" path="/auth/api-keys" description="Generate a new API key" />
          <EndpointCard method="GET" path="/auth/api-keys" description="List all API keys" />
          <EndpointCard method="PUT" path="/auth/api-keys/{id}" description="Update API key settings" />
          <EndpointCard method="DELETE" path="/auth/api-keys/{id}" description="Revoke an API key" />
        </div>

        <h3 className="text-xl font-bold mb-4">Register Merchant</h3>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "businessName": "Acme Corp",
    "email": "admin@acme.com",
    "password": "secure-password-123"
  }'`}
          language="bash"
          title="POST /auth/register"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Security</h2>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>API keys are hashed using bcrypt (12 rounds) before storage</li>
          <li>Never share your API keys or commit them to version control</li>
          <li>Generate separate keys for development and production</li>
          <li>Revoke compromised keys immediately</li>
          <li>Use environment variables to store API keys in your application</li>
        </ul>
      </section>
    </div>
  )
}
