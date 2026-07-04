import Link from "next/link"
import { ArrowRight, BookOpen, Play, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">
          Finance Gateway <span className="text-primary">API</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Enterprise payment gateway API — process payments, manage customers, handle subscriptions, split payments, transfer funds, and reconcile settlements.
        </p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <BookOpen className="h-4 w-4" />
            Read the Docs
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border font-medium hover:bg-accent transition-colors"
          >
            <Play className="h-4 w-4" />
            Try the API
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Zap, title: "Fast", desc: "Rust-powered core engine handles thousands of transactions per second with sub-millisecond latency." },
          { icon: Shield, title: "Secure", desc: "AES-256-GCM encryption, PCI-compliant tokenization, KYC/AML compliance, and audit trails." },
          { icon: BookOpen, title: "Developer First", desc: "Full Swagger docs, interactive playground, webhook testing, and client SDKs." },
        ].map((item) => (
          <div key={item.title} className="p-6 rounded-xl border border-border bg-card">
            <item.icon className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">1. Generate an API key</p>
            <pre className="bg-muted p-3 rounded-lg text-sm">curl http://localhost:9090/api/v1/generate-key?key_type=test</pre>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">2. Initialize a transaction</p>
            <pre className="bg-muted p-3 rounded-lg text-sm">{`curl -X POST http://localhost:8080/api/v1/transactions/initialize \
  -H "Authorization: Bearer sk_test_your_key" \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@example.com","amount":5000,"currency":"NGN"}'`}</pre>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-2">3. View Swagger docs</p>
            <pre className="bg-muted p-3 rounded-lg text-sm">open http://localhost:8080/api/docs</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
