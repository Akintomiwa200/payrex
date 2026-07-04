import { CodeBlock } from "@/components/CodeBlock"
import { EndpointCard } from "@/components/EndpointCard"

export default function ComplianceDocs() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="text-4xl font-bold mb-4">Compliance & AML</h1>
      <p className="text-lg text-muted-foreground mb-8">Anti-money laundering (AML) screening, sanction list checks, and transaction monitoring.</p>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Screening Lists</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
          {["UN Sanctions", "OFAC SDN", "EU Sanctions", "UK Sanctions", "Interpol", "Local Blacklist", "PEP Database"].map((l) => (
            <div key={l} className="p-3 rounded-lg border border-border bg-card text-sm">{l}</div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Endpoints</h2>
        <div className="space-y-3 mb-8">
          <EndpointCard method="POST" path="/compliance/screen" description="Screen a subject against sanction lists" />
          <EndpointCard method="POST" path="/compliance/monitor" description="Monitor a transaction" />
          <EndpointCard method="GET" path="/compliance/screenings" description="List screenings" />
          <EndpointCard method="GET" path="/compliance/monitoring" description="List monitored transactions" />
          <EndpointCard method="PUT" path="/compliance/screenings/{id}/review" description="Review a flagged screening" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Screen a Subject</h2>
        <CodeBlock
          code={`curl -X POST http://localhost:8080/api/v1/compliance/screen \\
  -H "Authorization: Bearer sk_test_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "subjectType": "merchant",
    "subjectId": "m_abc123",
    "subjectName": "John Doe",
    "subjectCountry": "NG"
  }'`}
          language="bash"
          title="POST /compliance/screen"
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Risk Scoring</h2>
        <div className="p-6 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Risk Score</span>
            <span className="text-xs text-muted-foreground">0 = Safe &nbsp;·&nbsp; 100 = High Risk</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm">0-25</div>
              <div className="flex-1 h-3 rounded-full bg-green-500/20"><div className="w-1/4 h-full rounded-full bg-green-500" /></div>
              <div className="text-sm text-green-500">Low Risk</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm">25-50</div>
              <div className="flex-1 h-3 rounded-full bg-yellow-500/20"><div className="w-1/2 h-full rounded-full bg-yellow-500" /></div>
              <div className="text-sm text-yellow-500">Flagged</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 text-sm">50-100</div>
              <div className="flex-1 h-3 rounded-full bg-red-500/20"><div className="w-full h-full rounded-full bg-red-500" /></div>
              <div className="text-sm text-red-500">High Risk</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
