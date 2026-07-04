interface EndpointCardProps {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  description: string
}

const methodColors: Record<string, string> = {
  GET: "bg-green-500/10 text-green-500 border-green-500/20",
  POST: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PUT: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  PATCH: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  DELETE: "bg-red-500/10 text-red-500 border-red-500/20",
}

export function EndpointCard({ method, path, description }: EndpointCardProps) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${methodColors[method] || methodColors.GET}`}>
        {method}
      </span>
      <div className="flex-1 min-w-0">
        <code className="text-sm font-mono text-foreground break-all">{path}</code>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  )
}
