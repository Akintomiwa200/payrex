"use client"

import { useState } from "react"
import { CodeBlock } from "@/components/CodeBlock"
import { Send, Plus, Trash2, Play } from "lucide-react"

interface Header {
  key: string
  value: string
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

const API_BASE = "http://localhost:8080/api/v1"

const PRESETS: { label: string; method: HttpMethod; path: string; body: string }[] = [
  {
    label: "Initialize Payment",
    method: "POST",
    path: "/transactions/initialize",
    body: JSON.stringify({ email: "customer@example.com", amount: 5000, currency: "NGN", callbackUrl: "https://example.com/verify" }, null, 2),
  },
  {
    label: "Verify Transaction",
    method: "GET",
    path: "/transactions/REF-001",
    body: "",
  },
  {
    label: "Charge Card",
    method: "POST",
    path: "/transactions/charge",
    body: JSON.stringify({ email: "customer@example.com", amount: 5000, card: { number: "4084084084084081", cvv: "123", expiryMonth: "12", expiryYear: "2025" } }, null, 2),
  },
  {
    label: "Create Customer",
    method: "POST",
    path: "/customers",
    body: JSON.stringify({ email: "john@example.com", firstName: "John", lastName: "Doe", phone: "+2348012345678" }, null, 2),
  },
  {
    label: "Get Balance",
    method: "GET",
    path: "/balance",
    body: "",
  },
  {
    label: "Create Webhook",
    method: "POST",
    path: "/webhooks",
    body: JSON.stringify({ url: "https://example.com/webhook", events: ["charge.success", "charge.failed"], description: "Test webhook" }, null, 2),
  },
  {
    label: "Create Split",
    method: "POST",
    path: "/splits",
    body: JSON.stringify({ type: "percentage", currency: "NGN", recipients: [{ subaccountId: "sub_1", percentage: 70 }, { subaccountId: "sub_2", percentage: 30 }] }, null, 2),
  },
  {
    label: "Initiate Transfer",
    method: "POST",
    path: "/transfers",
    body: JSON.stringify({ recipientCode: "RCP_abc123", amount: 50000, currency: "NGN", reason: "Payout" }, null, 2),
  },
  {
    label: "Submit KYC Document",
    method: "POST",
    path: "/kyc/documents",
    body: JSON.stringify({ documentType: "international_passport", documentNumber: "A12345678", documentUrl: "https://storage.example.com/doc.jpg" }, null, 2),
  },
  {
    label: "3DS Initiate",
    method: "POST",
    path: "/3ds/initiate",
    body: JSON.stringify({ transactionReference: "REF-001", amount: 5000, currency: "NGN", cardNumber: "4084084084084081", expiryMonth: "12", expiryYear: "2025", cardHolderName: "John Doe", callbackUrl: "https://example.com/3ds" }, null, 2),
  },
  {
    label: "Open Dispute",
    method: "POST",
    path: "/disputes",
    body: JSON.stringify({ transactionReference: "REF-001", reason: "unauthorized_charge", description: "Customer did not authorize", amount: 5000 }, null, 2),
  },
  {
    label: "Tokenize Card",
    method: "POST",
    path: "/tokens/card",
    body: JSON.stringify({ cardNumber: "4084084084084081", expiryMonth: "12", expiryYear: "2025", cvv: "123" }, null, 2),
  },
  {
    label: "Screen Compliance",
    method: "POST",
    path: "/compliance/screen",
    body: JSON.stringify({ subjectType: "merchant", subjectId: "m_abc123", subjectName: "John Doe", subjectCountry: "NG" }, null, 2),
  },
]

const methodColors: Record<HttpMethod, string> = {
  GET: "bg-green-500/10 text-green-500 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  PATCH: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
}

function PlaygroundPage() {
  const [method, setMethod] = useState<HttpMethod>("GET")
  const [path, setPath] = useState("/transactions")
  const [headers, setHeaders] = useState<Header[]>([{ key: "Authorization", value: "" }, { key: "Content-Type", value: "application/json" }])
  const [body, setBody] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateHeader = (index: number, field: "key" | "value", value: string) => {
    const updated = [...headers]
    updated[index][field] = value
    setHeaders(updated)
  }

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }])
  const removeHeader = (index: number) => setHeaders(headers.filter((_, i) => i !== index))

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setMethod(preset.method)
    setPath(preset.path)
    setBody(preset.body)
    setResponse(null)
    setError(null)
  }

  const sendRequest = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    const headerRecord: Record<string, string> = {}
    for (const h of headers) {
      if (h.key) headerRecord[h.key] = h.value
    }

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: { ...headerRecord },
        body: method === "GET" || method === "DELETE" ? undefined : body || undefined,
      })

      const text = await res.text()
      let parsed: any
      try { parsed = JSON.parse(text) } catch { parsed = text }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: parsed,
      })
    } catch (e: any) {
      setError(e.message || "Request failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Play className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">API Playground</h1>
      </div>
      <p className="text-muted-foreground mb-8">
        Test API endpoints directly from your browser. Requests are sent to <code className="text-primary">{API_BASE}</code>.
        Make sure the gateway is running on port 8080.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-3">Quick Actions</h2>
          <div className="space-y-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => loadPreset(preset)}
                className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors"
              >
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${methodColors[preset.method]}`}>
                  {preset.method}
                </span>
                <span className="text-muted-foreground truncate">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Request</h2>

            <div className="flex gap-3 mb-4">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as HttpMethod)}
                className={`px-3 py-2 rounded-lg border text-sm font-bold ${methodColors[method]} bg-card`}
              >
                {(["GET", "POST", "PUT", "PATCH", "DELETE"] as HttpMethod[]).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/endpoint"
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Headers</span>
                <button onClick={addHeader} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      value={h.key}
                      onChange={(e) => updateHeader(i, "key", e.target.value)}
                      placeholder="Header"
                      className="w-40 px-2 py-1.5 rounded border border-border bg-background text-xs font-mono"
                    />
                    <input
                      value={h.value}
                      onChange={(e) => updateHeader(i, "value", e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-2 py-1.5 rounded border border-border bg-background text-xs font-mono"
                    />
                    <button onClick={() => removeHeader(i)} className="p-1.5 text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {method !== "GET" && method !== "DELETE" && (
              <div className="mb-4">
                <span className="text-sm font-medium block mb-2">Body (JSON)</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder='{"key": "value"}'
                  rows={8}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono resize-y"
                />
              </div>
            )}

            <button
              onClick={sendRequest}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Send Request"}
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="font-medium text-red-500 mb-1">Error</div>
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          {response && (
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Response</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                  response.status < 300 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {response.status} {response.statusText}
                </span>
              </div>

              <div className="mb-4">
                <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Headers</span>
                <div className="bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
                  {Object.entries(response.headers).slice(0, 15).map(([k, v]) => (
                    <div key={k} className="text-xs font-mono">
                      <span className="text-muted-foreground">{k}:</span> {v as string}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-muted-foreground uppercase mb-2 block">Body</span>
                <CodeBlock
                  code={typeof response.body === "string" ? response.body : JSON.stringify(response.body, null, 2)}
                  language="json"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlaygroundPage
