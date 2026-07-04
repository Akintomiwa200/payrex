import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function KYCDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">KYC Verification</h1>
      <p className="text-lg text-muted-foreground mb-8">Know Your Customer (KYC) verification with document upload, BVN, and NIN checks. Supports tiered KYC levels (0-3).</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">KYC Levels</h2>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { level: 0, label: "Unverified", limit: "₦0" },
            { level: 1, label: "Basic", limit: "₦50,000/day" },
            { level: 2, label: "Advanced", limit: "₦5,000,000/day" },
            { level: 3, label: "Business", limit: "Unlimited" },
          ].map((l) => (
            <div key={l.level} className="p-4 rounded-lg border border-border bg-card text-center">
              <div className="text-2xl font-bold text-primary">Level {l.level}</div>
              <div className="text-sm font-medium">{l.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{l.limit}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/kyc/documents" description="Submit a KYC document" />
          <EndpointCard method="POST" path="/kyc/verify-bvn" description="Verify a BVN" />
          <EndpointCard method="POST" path="/kyc/verify-nin" description="Verify a NIN" />
          <EndpointCard method="GET" path="/kyc/status" description="Get KYC status" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Submit a Document</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/kyc/documents \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "documentType": "international_passport",
    "documentNumber": "A12345678",
    "documentUrl": "https://storage.example.com/passport.jpg"
  }'`}
          language="bash"
          title="POST /kyc/documents"
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Verify BVN</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/kyc/verify-bvn \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "bvn": "22222222222",
    "phoneNumber": "08031234567",
    "dateOfBirth": "1990-01-15"
  }'`}
          language="bash"
          title="POST /kyc/verify-bvn"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Document Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {["international_passport", "national_id", "drivers_license", "voters_card", "bvn", "nin", "cac_registration", "utility_bill", "bank_statement", "tax_certificate"].map((t) => (
            <div key={t} className="p-3 rounded-lg border border-border bg-card text-sm">{t.replace(/_/g, " ")}</div>
          ))}
        </div>
      </section>
    </div>
  )
}
