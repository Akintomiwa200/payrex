# Contributing to Finance Gateway

Thank you for your interest in contributing! We welcome contributions from everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/finance-gateway.git`
3. Set up the development environment (see README.md)
4. Create a feature branch: `git checkout -b feature/my-feature`

## Development Workflow

### Gateway (NestJS)
```bash
cd gateway
npm install
npm run start:dev
```

### Core Engine (Rust)
```bash
cd core-engine
cargo build
cargo run
```

### Python App
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Code Standards

### NestJS (TypeScript)
- Follow existing patterns — services, controllers, modules, DTOs, entities
- Add Swagger decorators to all DTOs and controllers
- Use the error code system in `common/errors/error-codes.ts`
- Run `npm run lint` and `npm run format` before committing

### Rust
- Run `cargo fmt` and `cargo clippy` before committing
- Add tests for all new modules
- Use `thiserror` for error types

### Python
- Run `ruff check` and `black .` before committing
- Use type hints on all functions
- Add Pydantic schemas for request/response models

## Commit Conventions

We use conventional commits:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `style:` — formatting (no code change)
- `refactor:` — code restructuring
- `test:` — adding tests
- `chore:` — maintenance tasks

Example: `feat(transactions): add idempotency support for card charges`

## Pull Request Process

1. Update the ROADMAP.md if your changes affect the project roadmap
2. Ensure all CI checks pass (lint, test, build)
3. Get at least one review from a maintainer
4. Squash commits before merging

## Reporting Issues

Report bugs and request features via [GitHub Issues](https://github.com/your-org/finance-gateway/issues).

## Security Issues

Do not open public issues for security vulnerabilities. See [SECURITY.md](SECURITY.md).
