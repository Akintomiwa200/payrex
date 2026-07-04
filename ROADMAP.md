# Production Roadmap

## Phase 1: Foundation (Current)
- [x] NestJS API gateway with TypeORM + PostgreSQL
- [x] Rust core engine with Actix-web
- [x] Full Swagger/OpenAPI documentation
- [x] Merchant authentication and API key management
- [x] Payment processing (card, bank transfer, USSD)
- [x] Payment provider abstraction (internal, Flutterwave, Interswitch)
- [x] Idempotency middleware
- [x] Webhook delivery with exponential backoff retries
- [x] Card tokenization
- [x] Transfers (single, bulk, recipients)
- [x] Disputes and chargebacks
- [x] Transaction timeline / audit trail
- [x] Bull queue for async processing
- [x] 3D Secure 2.0 authentication flow
- [x] KYC/AML compliance infrastructure
- [x] Settlement engine with auto-reconciliation

## Phase 2: Security & Compliance (2-4 weeks)
- [ ] **PCI DSS SAQ D certification** — engage QSA, complete Self-Assessment Questionnaire
- [ ] **PCI-compliant card vault** — replace raw PAN storage with tokenization vault (e.g., VGS, Basis Theory, or HashiCorp Vault)
- [ ] **DPA and GDPR readiness** — Data Processing Agreement templates, consent management, right-to-erasure endpoints
- [ ] **SOC 2 Type I audit** — engage auditor for controls certification
- [ ] **Penetration test** — third-party pentest against API and infrastructure
- [ ] **Secrets management** — migrate all secrets from .env to Vault or AWS Secrets Manager
- [ ] **Production KYC integrations** — replace simulated BVN/NIN checks with Dojah, VerifyMe, or Appruve
- [ ] **Production compliance screening** — integrate real sanction lists (UN, OFAC, EU) and PEP databases

## Phase 3: Bank Integrations & Licensing (4-8 weeks)
- [ ] **Payment Service Provider (PSP) license** — apply in target jurisdiction (CBN for Nigeria, BoG for Ghana, etc.)
- [ ] **Bank partnership agreements** — sign direct acquiring agreements with 1-3 partner banks
- [ ] **Flutterwave production keys** — upgrade from test to production API keys
- [ ] **Interswitch production credentials** — obtain production client ID/secret/terminal ID
- [ ] **NIBSS Instant Payment (NIP)** — direct integration for real-time bank transfers
- [ ] **NIBSS BVN validation** — production BVN verification through NIBSS
- [ ] **Multi-currency settlement** — USD, GBP, EUR settlement accounts via partner banks
- [ ] **Card scheme registration** — register as payment facilitator with Visa and Mastercard

## Phase 4: Platform Resilience (2-4 weeks)
- [ ] **Multi-region PostgreSQL** — configure read replicas and failover (AWS RDS Multi-AZ or Aurora)
- [ ] **Redis Sentinel/Cluster** — high-availability Redis for Bull queues (prevent job loss on failover)
- [ ] **Horizontal auto-scaling** — configure K8s HPA for gateway and core-engine based on CPU/queue depth
- [ ] **Disaster recovery** — RTO < 15 min, RPO < 1 min. Documented DR plan with regular drills
- [ ] **Rate limiting at edge** — deploy API gateway (Kong/AWS API Gateway/Cloudflare) with per-merchant rate limits
- [ ] **DDoS protection** — Cloudflare or AWS Shield Advanced
- [ ] **Database migration automation** — `synchronize: false`, migration generation in CI/CD pipeline

## Phase 5: Monitoring & Observability (1-2 weeks)
- [ ] **Structured logging** — JSON logging with correlation IDs shipped to Elasticsearch / Loki
- [ ] **Distributed tracing** — OpenTelemetry for HTTP requests and Bull jobs (Jaeger or Honeycomb)
- [ ] **Metrics & dashboards** — Datadog/Grafana dashboards for:
  - Transaction volume, success/failure rates, latency (p50/p95/p99)
  - Queue depth and processing times per queue
  - Worker concurrency and error rates
  - Settlement reconciliation gaps
- [ ] **Alerting** — PagerDuty/Opsgenie alerts for:
  - Queue backpressure > 10k jobs
  - Transaction success rate < 95%
  - Settlement reconciliation failure
  - Webhook delivery failure rate > 5%
- [ ] **SLA monitoring** — external synthetic checks every 1 min from 3 regions

## Phase 6: Developer Experience (1-2 weeks)
- [ ] **SDK generation** — generate client SDKs (Node.js, Python, PHP, Go, Java) from OpenAPI spec using openapi-generator
- [ ] **Test mode data seeding** — pre-populated test cards, banks, and webhook fixtures for developer onboarding
- [ ] **API changelog** — documented changelog with versioning policy (v1 stable, v2 preview)
- [ ] **Webhook inspector** — dashboard to view recent webhook attempts, payloads, and retry individual deliveries
- [ ] **GraphQL API** — optional GraphQL wrapper over core REST API for complex queries
- [ ] **Postman collection** — auto-published Postman collection from OpenAPI spec

## Phase 7: Advanced Features (4-8 weeks)
- [ ] **USSD push** — direct USSD session initiation from API (requires telco partnerships)
- [ ] **QR payments** — static and dynamic QR code generation (NQR standard)
- [ ] **Recurring mandates** — e-mandate and ACH direct debit support
- [ ] **Payout to bank** — automated bulk payout engine for marketplace merchants
- [ ] **Virtual accounts** — provision dedicated NUBAN accounts per merchant/customer (requires bank partnership)
- [ ] **Multi-tenant admin dashboard** — merchant-facing portal for transaction search, refund, dispute management
- [ ] **Invoice generation** — PDF invoice generation with payment links
- [ ] **Crypto on-ramp** — accept USDC/USDT via MoonPay or similar

## Phase 8: Scale & Optimization (Ongoing)
- [ ] **Database read replicas** — route GET queries to replicas
- [ ] **Cache layer** — Redis caching for bank list, country list, BIN data
- [ ] **Query optimization** — monthly query profiling and index review
- [ ] **Cost optimization** — reserved DB instances, right-sizing ECS/K8s pods, RIs for Redis
- [ ] **Chaos engineering** — monthly game-day: simulate AZ failure, DB primary failover, Redis outage
- [ ] **PCI surveillance** — continuous PCI compliance monitoring (quarterly ASV scans)

## Immediate Action Items (Week 1)
1. Set `NODE_ENV=production` and `synchronize: false` in TypeORM config
2. Generate initial migration: `npm run migration:generate -- InitialSchema`
3. Run migration on production DB: `npm run migration:run`
4. Set up Redis with password and TLS (`REDIS_URL=rediss://:password@host:6380`)
5. Generate strong `ENCRYPTION_KEY` (32 bytes hex) and `JWT_SECRET`
6. Engage Flutterwave sales to upgrade to production keys
7. Configure Cloudflare or AWS WAF in front of the API
8. Set up centralized logging (ELK/Loki/Grafana)
