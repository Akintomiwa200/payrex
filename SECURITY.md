# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Finance Gateway seriously. If you discover a security vulnerability, please **do not** open a public issue.

Instead, send a report to **security@finance-gateway.dev**.

Please include the following details:

- Type of vulnerability
- Steps to reproduce
- Affected component (gateway, core-engine, app)
- Potential impact
- Suggested fix (if any)

You should receive a response within 48 hours. If you don't, follow up via the same channel.

## Disclosure Policy

- We will acknowledge receipt of your report within 2 business days
- We will provide an estimated timeline for a fix
- We will notify you when the vulnerability is fixed
- We will give credit to the reporter (if desired)

## Security Measures

This project implements the following security controls:

### Encryption
- AES-256-GCM for sensitive data at rest (PAN, BVN, NIN, SSN)
- PBKDF2 key derivation with 100,000 iterations
- HMAC-SHA256 integrity verification on ciphertext
- TLS 1.3 for all network communication

### Authentication
- API key authentication (Bearer token)
- JWT for merchant session management
- bcrypt (12 rounds) for password hashing
- Optional TOTP-based 2FA

### Authorization
- Per-merchant resource isolation
- API key scoping (read/write/admin)
- Idempotency key enforcement

### Data Protection
- Automatic masking of sensitive fields in API responses
- PCI-compliant card tokenization (no raw PAN storage)
- Audit logging for all state-changing operations
- Request validation against SQL injection, XSS, path traversal

### Infrastructure
- Rate limiting (per IP and per API key)
- IP whitelist/blacklist
- Helmet security headers (HSTS, CSP, X-Frame-Options)
- Prepared statements for all database queries

## PCI Compliance

This project handles payment card data. Before processing live transactions:

1. Complete PCI DSS Self-Assessment Questionnaire (SAQ D)
2. Engage a Qualified Security Assessor (QSA)
3. Implement a PCI-compliant card vault (replaces current tokenization)
4. Run quarterly ASV scans
5. Never store CVV, PIN, or full magnetic stripe data

## Bug Bounty

We do not currently offer a bug bounty program. Security researchers who report valid vulnerabilities will be publicly acknowledged in our security hall of fame.
