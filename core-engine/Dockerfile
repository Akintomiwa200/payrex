FROM rust:1.79-slim-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release 2>/dev/null || true
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim AS runner
RUN apt-get update && apt-get install -y ca-certificates libssl3 && rm -rf /var/lib/apt/lists/*
RUN addgroup --system app && adduser --system --ingroup app app
WORKDIR /app
COPY --from=builder /app/target/release/core-engine ./
USER app
EXPOSE 9090
CMD ["./core-engine"]
