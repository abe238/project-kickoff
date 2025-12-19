# Kickoff v3.0.0

[![GitHub stars](https://img.shields.io/github/stars/abe238/project-kickoff?style=social)](https://github.com/abe238/project-kickoff/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/abe238/project-kickoff?style=social)](https://github.com/abe238/project-kickoff/network/members)
[![GitHub watchers](https://img.shields.io/github/watchers/abe238/project-kickoff?style=social)](https://github.com/abe238/project-kickoff/watchers)

[![npm version](https://img.shields.io/npm/v/project-kickoff?color=blue)](https://www.npmjs.com/package/project-kickoff)
[![License: ISC](https://img.shields.io/badge/License-ISC-green.svg)](https://opensource.org/licenses/ISC)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)

[![GitHub last commit](https://img.shields.io/github/last-commit/abe238/project-kickoff)](https://github.com/abe238/project-kickoff/commits/main)
[![GitHub issues](https://img.shields.io/github/issues/abe238/project-kickoff)](https://github.com/abe238/project-kickoff/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/abe238/project-kickoff)](https://github.com/abe238/project-kickoff/pulls)
[![GitHub repo size](https://img.shields.io/github/repo-size/abe238/project-kickoff)](https://github.com/abe238/project-kickoff)

---

Modern CLI scaffolding tool for production-ready projects with 2025 tech stacks. Multi-language support (TypeScript, Python, Go, Rust, Deno), AI/ML integrations, and security best practices baked in.

## Features

- **Multi-Language**: TypeScript/Node, Python, Go, Rust, Deno support
- **2025 Tech Stacks**: Supabase, Neon, Turso, Hono, TanStack Start, and more
- **AI/ML Ready**: Vector databases, embeddings, local AI (Ollama, MLX for Apple Silicon)
- **Modern Auth**: Clerk, Kinde, Auth0, Better Auth, Supabase Auth
- **14 Presets**: One-command project setup for common use cases
- **Interactive Docs**: HTML documentation accessible via CLI

## Installation

```bash
npm install -g project-kickoff
```

Or run directly with npx:

```bash
npx project-kickoff create my-app
```

## Quick Start

```bash
# Create a new project with interactive wizard
kickoff create my-app

# Use a preset for instant setup
kickoff create my-app --preset saas-starter

# List all available presets
kickoff list

# Dry run to see what would be created
kickoff create my-app --dry-run
```

## Documentation

```bash
# Open quick start guide in browser
kickoff docs

# Browse all presets with examples
kickoff presets

# Explore 2025 tech stacks
kickoff stacks
```

---

## Presets (One-Command Setup)

| Preset | Stack | Description |
|--------|-------|-------------|
| `saas-starter` | Next.js + Supabase + Drizzle | Production SaaS with auth, DB, design system |
| `tanstack-hono` | TanStack Start + Turso + Better Auth | Type-safe full-stack with edge DB |
| `edge-api` | Hono + Turso + Bun | Blazing fast edge API |
| `api-microservice` | Hono + Neon + Drizzle | Serverless microservice |
| `fastapi-starter` | FastAPI + PostgreSQL + SQLAlchemy | Python API with modern tooling |
| `python-ml-api` | FastAPI + pgvector + LangChain | ML-ready Python API |
| `go-microservice` | Gin + PostgreSQL + GORM | Go microservice |
| `rust-api` | Axum + PostgreSQL + SQLx | Rust API with compile-time safety |
| `ai-rag-app` | Next.js + Supabase Vector + Vercel AI | RAG application |
| `ai-agent` | Hono + Ollama + LangChain | Local AI agent |
| `mlx-local` | FastAPI + MLX + Chroma | Apple Silicon optimized AI |
| `quick-cli` | Commander + TypeScript | CLI tool |
| `landing-page` | HTML/CSS/JS + nginx | Static site |
| `mcp-tool` | TypeScript + stdio/SSE | MCP server for AI tools |

---

## Project Types

### Full-Stack JavaScript/TypeScript

| Type | Framework | Description | Generated Files |
|------|-----------|-------------|-----------------|
| `nextjs` | Next.js 15 | App Router, RSC, Server Actions | `app/`, `components/`, `lib/`, `next.config.ts` |
| `tanstack-start` | TanStack Start | React 19, type-safe routing | `app/`, `routes/`, `tanstack.config.ts` |

### Frontend

| Type | Framework | Description | Generated Files |
|------|-----------|-------------|-----------------|
| `vite-react` | Vite + React 19 | SPA with TypeScript | `src/`, `vite.config.ts`, `index.html` |
| `static` | HTML/CSS/JS | Static site with nginx | `public/`, `nginx.conf` |

### Backend - Node/Bun

| Type | Framework | Runtime | Generated Files |
|------|-----------|---------|-----------------|
| `hono-api` | Hono | Bun/Node | `src/index.ts`, `src/routes/`, `src/middleware/` |
| `elysia-api` | Elysia | Bun | `src/index.ts`, `src/routes/`, Eden types |
| `express-api` | Express | Node | `src/index.ts`, `src/routes/`, `src/middleware/` |

### Backend - Deno

| Type | Framework | Description | Generated Files |
|------|-----------|-------------|-----------------|
| `fresh-api` | Fresh | Islands architecture | `routes/`, `islands/`, `fresh.config.ts` |

### Backend - Python

| Type | Framework | Description | Generated Files |
|------|-----------|-------------|-----------------|
| `fastapi` | FastAPI | Async, auto-docs | `app/`, `main.py`, `requirements.txt`/`pyproject.toml` |
| `litestar` | Litestar | High-performance | `app/`, `main.py`, `requirements.txt` |

### Backend - Go

| Type | Framework | Description | Generated Files |
|------|-----------|-------------|-----------------|
| `gin-api` | Gin | Fast, popular | `main.go`, `handlers/`, `models/`, `go.mod` |
| `fiber-api` | Fiber | Express-like | `main.go`, `handlers/`, `go.mod` |
| `echo-api` | Echo | Minimalist | `main.go`, `handlers/`, `go.mod` |

### Backend - Rust

| Type | Framework | Description | Generated Files |
|------|-----------|-------------|-----------------|
| `axum-api` | Axum | Tokio-based | `src/main.rs`, `src/handlers/`, `Cargo.toml` |
| `actix-api` | Actix | Actor-based, fastest | `src/main.rs`, `src/handlers/`, `Cargo.toml` |

### Tools

| Type | Description | Generated Files |
|------|-------------|-----------------|
| `cli` | Commander CLI | `src/index.ts`, `src/commands/`, optional prompts/config |
| `mcp-server` | MCP server | `src/index.ts`, `src/tools/`, stdio/SSE transport |
| `library` | npm package | `src/index.ts`, `tsup.config.ts`, vitest/jest |
| `worker` | Background jobs | `src/worker.ts`, BullMQ + Redis |

---

## Database Providers

### Serverless (JavaScript/TypeScript recommended)

| Provider | Type | Features | Required Keys | Monthly Cost |
|----------|------|----------|---------------|--------------|
| `supabase` | PostgreSQL | Auth + Storage + Realtime | `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Free tier / $25+ |
| `neon` | PostgreSQL | Branching, edge, scale-to-zero | `DATABASE_URL` | Free tier / $19+ |
| `turso` | SQLite (libSQL) | Edge-first, global replication | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Free tier / $29+ |
| `convex` | Reactive BaaS | Real-time, type-safe | `CONVEX_DEPLOYMENT` | Free tier / $25+ |

### BaaS (Backend-as-a-Service)

| Provider | Type | Features | Required Keys | Monthly Cost |
|----------|------|----------|---------------|--------------|
| `pocketbase` | SQLite BaaS | Single file, auth, realtime | None (self-hosted) | Free (self-hosted) |
| `firebase` | NoSQL | Google BaaS, auth, storage | `FIREBASE_*` config | Free tier / Pay-as-you-go |

### Self-Hosted (Docker required)

| Provider | Type | Docker Image | Memory | Generated Files |
|----------|------|--------------|--------|-----------------|
| `postgres-local` | PostgreSQL | `postgres:16-alpine` | 256MB+ | `docker-compose.yml`, `init.sql` |
| `mysql-local` | MySQL | `mysql:8` | 512MB+ | `docker-compose.yml`, `init.sql` |
| `mongodb-local` | MongoDB | `mongo:7` | 512MB+ | `docker-compose.yml` |
| `sqlite` | SQLite | None | N/A | `db/` directory |

### Enterprise

| Provider | Type | Features | Required Keys | Monthly Cost |
|----------|------|----------|---------------|--------------|
| `planetscale` | MySQL + Vitess | Branching, serverless | `DATABASE_URL` | Free tier / $29+ |
| `cockroachdb` | Distributed SQL | Multi-region, ACID | `DATABASE_URL` | Free tier / $0.50/vCPU-hr |

---

## ORM Choices

### JavaScript/TypeScript

| ORM | Style | Features | Generated Files |
|-----|-------|----------|-----------------|
| `drizzle` | SQL-like | Fast, lightweight, type-safe | `src/db/schema.ts`, `drizzle.config.ts` |
| `prisma` | Schema-first | Great DX, migrations | `prisma/schema.prisma`, `src/db/client.ts` |
| `kysely` | Query builder | Type-safe SQL | `src/db/kysely.ts` |

### Python

| ORM | Style | Features | Generated Files |
|-----|-------|----------|-----------------|
| `sqlalchemy` | Standard | Mature, flexible | `app/models.py`, `app/database.py` |
| `sqlmodel` | Pydantic | FastAPI creator's ORM | `app/models.py` |
| `tortoise` | Async | Django-like, async-first | `app/models.py` |

### Go

| ORM | Style | Features | Generated Files |
|-----|-------|----------|-----------------|
| `gorm` | Full ORM | Auto-migrations, hooks | `models/`, `database/db.go` |
| `sqlx-go` | Raw SQL | Type-safe, no ORM magic | `database/queries.go` |

### Rust

| ORM | Style | Features | Generated Files |
|-----|-------|----------|-----------------|
| `sqlx-rust` | Compile-time | Async, checked queries | `src/db.rs`, `migrations/` |
| `sea-orm` | Active Record | Async, built on SQLx | `src/entities/`, `src/db.rs` |
| `diesel` | Sync | Mature, type-safe | `src/schema.rs`, `diesel.toml` |

---

## Authentication Providers

### Hosted (Easy Setup)

| Provider | Features | Required Keys | Monthly Cost |
|----------|----------|---------------|--------------|
| `clerk` | Pre-built components, social login | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Free tier / $25+ |
| `kinde` | B2B-focused, SAML SSO, feature flags | `KINDE_*` config | Free tier / $25+ |
| `auth0` | Enterprise-grade, Okta-owned | `AUTH0_*` config | Free tier / $23+ |
| `workos` | Enterprise SSO, directory sync | `WORKOS_*` config | Free tier / Pay-as-you-go |

### Self-Hosted

| Provider | Features | Required Keys | Generated Files |
|----------|----------|---------------|-----------------|
| `better-auth` | Modern, great DX | `BETTER_AUTH_SECRET` | `src/lib/auth.ts` |
| `lucia` | Lightweight, minimal | `LUCIA_*` config | `src/lib/auth/` |
| `authjs` | NextAuth successor | `AUTH_SECRET`, `AUTH_*` | `auth.ts`, `middleware.ts` |

### Platform-Specific

| Provider | Platform | Features | Required Keys |
|----------|----------|----------|---------------|
| `supabase-auth` | Supabase | Built-in with DB | Supabase keys |
| `convex-auth` | Convex | Built-in with DB | Convex keys |
| `firebase-auth` | Firebase | Built-in with DB | Firebase config |
| `pocketbase-auth` | PocketBase | Built-in with DB | None |

---

## AI/ML Features

### AI Frameworks

| Framework | Language | Features | Required Keys | Generated Files |
|-----------|----------|----------|---------------|-----------------|
| `vercel-ai` | TypeScript | React hooks, streaming | `OPENAI_API_KEY` or other | `src/lib/ai.ts`, `app/api/chat/` |
| `langchain` | Python/JS | Chains, agents, RAG | Model provider keys | `src/lib/langchain/` |
| `llamaindex` | Python/JS | Data framework, RAG | Model provider keys | `src/lib/llamaindex/` |
| `mastra` | TypeScript | TypeScript-first | Model provider keys | `src/lib/mastra/` |
| `instructor` | Python/JS | Structured outputs | Model provider keys | `src/lib/instructor/` |

### Vector Databases

| Provider | Type | Features | Required Keys | Monthly Cost |
|----------|------|----------|---------------|--------------|
| `pinecone` | Managed | Scalable, production-ready | `PINECONE_API_KEY` | Free tier / $70+ |
| `supabase-vector` | pgvector | Built into Supabase | Supabase keys | Included |
| `pgvector` | PostgreSQL ext | Use existing Postgres | None | Included with DB |
| `qdrant` | Self-hosted | Rust-based, fast | None | Free (self-hosted) |
| `chroma` | Self-hosted | Lightweight, dev-friendly | None | Free (self-hosted) |
| `weaviate` | Self-hosted | GraphQL, hybrid search | None | Free (self-hosted) |
| `turbopuffer` | Managed | Serverless, edge | `TURBOPUFFER_API_KEY` | Pay-as-you-go |
| `milvus` | Self-hosted | Enterprise, distributed | None | Free (self-hosted) |

### Embedding Providers

| Provider | Models | Required Keys | Cost per 1M tokens |
|----------|--------|---------------|-------------------|
| `openai` | text-embedding-3-small/large | `OPENAI_API_KEY` | $0.02 / $0.13 |
| `voyage` | voyage-large-2, code-optimized | `VOYAGE_API_KEY` | $0.10+ |
| `cohere` | embed-english-v3 | `COHERE_API_KEY` | $0.10 |
| `google` | text-embedding-004 | `GOOGLE_API_KEY` | $0.025 |
| `together` | Various | `TOGETHER_API_KEY` | $0.008 |
| `ollama` | nomic-embed, mxbai | None (local) | Free |
| `huggingface` | sentence-transformers | None (local) | Free |
| `fastembed` | Lightweight | None (local) | Free |

### Local AI/LLM Providers

| Provider | Platform | Features | Memory | GPU Required |
|----------|----------|----------|--------|--------------|
| `ollama` | Cross-platform | Easy setup, many models | 8GB+ | Optional |
| `lmstudio` | Desktop | GUI + server mode | 8GB+ | Optional |
| `jan` | Desktop | Desktop app + API | 8GB+ | Optional |
| `mlx` | Apple Silicon | MLX framework, fast on Mac | 16GB+ | No (uses Neural Engine) |
| `mlx-lm` | Apple Silicon | MLX LLM package | 16GB+ | No |
| `vllm` | Linux/CUDA | Production serving | 16GB+ | **Yes (CUDA)** |
| `localai` | Docker | OpenAI drop-in replacement | 8GB+ | Optional |
| `tgi` | Docker | HuggingFace inference | 16GB+ | **Yes (CUDA)** |
| `llamacpp` | Cross-platform | Low-level, max control | 8GB+ | Optional |
| `text-gen-webui` | Docker | Full-featured UI | 16GB+ | **Yes (recommended)** |

---

## Web Servers / Reverse Proxy

| Server | Features | Config File | Use Case |
|--------|----------|-------------|----------|
| `caddy` | Auto-HTTPS, simple config | `Caddyfile` | Recommended for most projects |
| `nginx` | High-performance, battle-tested | `nginx.conf` | High-traffic, complex routing |
| `traefik` | Docker/K8s native, auto-discovery | `traefik.yml` | Container orchestration |

---

## Runtime Options

| Runtime | Version | Best For | Package Manager |
|---------|---------|----------|-----------------|
| `node` | 20+ | Compatibility, ecosystem | npm/pnpm/yarn |
| `bun` | 1.0+ | Speed, all-in-one | bun |
| `deno` | 2.0+ | Security, web standards | deno |
| `python` | 3.11+ | ML/AI, data science | pip/poetry/uv |
| `go` | 1.21+ | Performance, simplicity | go mod |
| `rust` | stable | Safety, performance | cargo |

### Python Package Managers

| Manager | Features | Generated Files |
|---------|----------|-----------------|
| `uv` | Fast, Rust-based (recommended) | `pyproject.toml`, `uv.lock` |
| `poetry` | Dependency management + publishing | `pyproject.toml`, `poetry.lock` |
| `pip` | Standard, battle-tested | `requirements.txt` |
| `pipenv` | Pipfile + lock file | `Pipfile`, `Pipfile.lock` |

---

## Server Requirements & Cost Guide

### Development Machine

| Configuration | RAM | CPU | Storage | Cost |
|--------------|-----|-----|---------|------|
| Minimal (Node/Bun) | 8GB | 2 cores | 10GB | - |
| Standard (with Docker) | 16GB | 4 cores | 50GB | - |
| AI/ML (local models) | 32GB+ | 8 cores | 100GB+ | - |
| Apple Silicon AI (MLX) | 16GB+ unified | M1/M2/M3/M4 | 50GB+ | - |

### Production VPS (Monthly)

| Provider | Config | RAM | CPU | Cost | Best For |
|----------|--------|-----|-----|------|----------|
| Hetzner | CX22 | 4GB | 2 vCPU | $4.50 | Basic APIs |
| Hetzner | CX32 | 8GB | 4 vCPU | $8 | Standard apps |
| Hetzner | CX42 | 16GB | 8 vCPU | $16 | Heavy workloads |
| Railway | Starter | 8GB | 8 vCPU | $5+ | Serverless |
| Fly.io | Small | 1GB | 1 shared | $5 | Edge deployment |
| DigitalOcean | Basic | 4GB | 2 vCPU | $24 | General purpose |

### GPU Cloud (for AI inference)

| Provider | GPU | RAM | Cost/hour | Best For |
|----------|-----|-----|-----------|----------|
| RunPod | RTX 3090 | 24GB | $0.39 | Development |
| Lambda Labs | A10 | 24GB | $0.75 | Production |
| Vast.ai | Various | Varies | $0.20+ | Budget |

---

## Required User Data

### Always Required
- **Project name**: kebab-case, max 50 characters
- **GitHub username**: For deployment workflows

### Conditional Requirements

| Feature | Required Data | Environment Variables |
|---------|---------------|----------------------|
| Supabase | Supabase project | `SUPABASE_URL`, `SUPABASE_ANON_KEY` |
| Neon | Neon project | `DATABASE_URL` |
| Turso | Turso database | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| Clerk | Clerk app | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Kinde | Kinde app | `KINDE_ISSUER_URL`, `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET` |
| Auth0 | Auth0 tenant | `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` |
| OpenAI | API key | `OPENAI_API_KEY` |
| Pinecone | API key + index | `PINECONE_API_KEY`, `PINECONE_INDEX` |
| Production domain | Domain name | `DOMAIN` (for Traefik/Caddy) |
| Go projects | Module path | `go.mod` path |
| Rust projects | Crate name | `Cargo.toml` |

---

## Files Generated Per Option

### Base Files (All Projects)
```
project/
├── CLAUDE.md           # AI coding assistant context
├── README.md           # Project documentation
├── .gitignore          # Git ignore rules
├── .env.example        # Environment template
└── .github/
    └── workflows/
        └── deploy.yml  # CI/CD pipeline
```

### With Docker Deployment
```
project/
├── Dockerfile          # Multi-stage, secure build
├── docker-compose.yml  # With resource limits
└── .dockerignore       # Docker ignore
```

### With Database
```
project/
├── src/db/
│   ├── schema.ts       # Drizzle/Prisma schema
│   └── client.ts       # Database client
└── drizzle.config.ts   # or prisma/schema.prisma
```

### With Auth
```
project/
├── src/lib/auth/
│   ├── index.ts        # Auth configuration
│   └── middleware.ts   # Auth middleware
└── middleware.ts       # Route protection
```

### With AI/ML
```
project/
├── src/lib/ai/
│   ├── index.ts        # AI client setup
│   ├── embeddings.ts   # Embedding functions
│   └── chains/         # LangChain chains (if applicable)
└── .env.example        # With AI API keys
```

---

## Security Features

Based on production incident lessons:

1. **Never build on VPS**: GitHub Actions builds only
2. **Non-root containers**: All Dockerfiles use `USER appuser` (uid 1001)
3. **Resource limits**: CPU/memory limits in docker-compose
4. **Security headers**: Traefik/Caddy middleware for HSTS, CSP, XSS
5. **Health endpoints**: `/api/health` or `/health` for monitoring
6. **Secrets management**: `.env.example` templates, no hardcoded secrets
7. **Security scanning**: npm audit, Trivy in CI/CD

---

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## Development

```bash
# Clone
git clone https://github.com/abe238/project-kickoff.git
cd project-kickoff

# Install
npm install

# Development
npm run dev

# Build
npm run build

# Test
npm test
```

---

## License

ISC

---

*Built with lessons learned from production deployments, security incidents, and real-world AI/ML applications.*
