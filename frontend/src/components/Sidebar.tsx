"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"
import {
  BookOpen, CreditCard, Users, Repeat, SplitSquareHorizontal,
  Webhook, Wallet, Landmark, ArrowUpFromLine, Scale,
  Key, Shield, Fingerprint, Smartphone, Cog, Play,
} from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: BookOpen },
  { href: "/docs", label: "Overview", icon: BookOpen },
  { href: "/docs/getting-started", label: "Getting Started", icon: Cog },
  { href: "/docs/auth", label: "Authentication", icon: Key },
  { href: "/docs/transactions", label: "Transactions", icon: CreditCard },
  { href: "/docs/customers", label: "Customers", icon: Users },
  { href: "/docs/subscriptions", label: "Subscriptions", icon: Repeat },
  { href: "/docs/splits", label: "Split Payments", icon: SplitSquareHorizontal },
  { href: "/docs/webhooks", label: "Webhooks", icon: Webhook },
  { href: "/docs/balance", label: "Balance & Ledger", icon: Wallet },
  { href: "/docs/settlements", label: "Settlements", icon: Landmark },
  { href: "/docs/transfers", label: "Transfers", icon: ArrowUpFromLine },
  { href: "/docs/disputes", label: "Disputes", icon: Scale },
  { href: "/docs/tokens", label: "Card Tokens", icon: Fingerprint },
  { href: "/docs/kyc", label: "KYC Verification", icon: Shield },
  { href: "/docs/compliance", label: "Compliance & AML", icon: Shield },
  { href: "/docs/threeds", label: "3D Secure", icon: Smartphone },
  { href: "/playground", label: "API Playground", icon: Play },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card overflow-y-auto flex-shrink-0">
      <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <CreditCard className="h-5 w-5" />
          Finance Gateway
        </Link>
        <p className="text-xs text-muted-foreground mt-1">API Documentation</p>
      </div>
      <nav className="p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
