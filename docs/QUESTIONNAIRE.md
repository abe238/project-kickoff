# Project Kickoff Questionnaire

This document outlines all questions asked during `kickoff init` and how answers influence the generated project.

> **Multi-Language Support**: Now supports TypeScript, Python, Go, Rust, and Deno with language-aware questions and options.

---

## Questionnaire Flow

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: PROJECT SELECTION                          │
├─────────────────────────────────────────────────────┤
│ Q0. Preset or Custom?                               │
│ Q1. Complexity track (if custom)                    │
│ Q2. Project name                                    │
│ Q3. Project description                             │
│ Q4. Project type (if custom)                        │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 2: RUNTIME & INFRASTRUCTURE                   │
├─────────────────────────────────────────────────────┤
│ Q5. Runtime (JS/TS only)                            │
│ Q6. Port                                            │
│ Q7. Database provider                               │
│ Q8. ORM (language-aware)                            │
│ Q9. Auth provider (language-aware)                  │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 3: TYPE-SPECIFIC QUESTIONS                    │
├─────────────────────────────────────────────────────┤
│ CLI: Interactive, Config, Shell completion          │
│ MCP: Transport (stdio/SSE)                          │
│ Library: Test framework                             │
│ Python: Package manager                             │
│ Go: Module path                                     │
│ Rust: Edition                                       │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 4: AI/ML (if applicable)                      │
├─────────────────────────────────────────────────────┤
│ Q10. AI Framework                                   │
│ Q11. Vector Database                                │
│ Q12. Embedding Provider                             │
│ Q13. Local AI Provider                              │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 5: DEPLOYMENT                                 │
├─────────────────────────────────────────────────────┤
│ Q14. Domain                                         │
│ Q15. Web Server (production track)                  │
│ Q16. GitHub username                                │
│ Q17. Design system (frontend only)                  │
└─────────────────────────────────────────────────────┘
```

---

## Question 0: Preset Selection

**Prompt:** `Start with a preset or custom?`

**Presets Available:**

### JavaScript/TypeScript

| Preset | Stack | Best For |
|--------|-------|----------|
| `saas-starter` | Next.js + Supabase + Drizzle | Production SaaS applications |
| `tanstack-hono` | TanStack Start + Turso + Better Auth | Type-safe full-stack apps |
| `edge-api` | Hono + Turso + Bun | High-performance edge APIs |
| `api-microservice` | Hono + Neon + Drizzle | Serverless microservices |

### Python

| Preset | Stack | Best For |
|--------|-------|----------|
| `fastapi-starter` | FastAPI + PostgreSQL + SQLAlchemy | Python APIs with auto-docs |
| `python-ml-api` | FastAPI + pgvector + LangChain | ML/AI Python services |

### Go

| Preset | Stack | Best For |
|--------|-------|----------|
| `go-microservice` | Gin + PostgreSQL + GORM | High-performance Go services |

### Rust

| Preset | Stack | Best For |
|--------|-------|----------|
| `rust-api` | Axum + PostgreSQL + SQLx | Type-safe, fast Rust APIs |

### AI/ML

| Preset | Stack | Best For |
|--------|-------|----------|
| `ai-rag-app` | Next.js + Supabase Vector + Vercel AI | RAG applications |
| `ai-agent` | Hono + Ollama + LangChain | Local AI agents |
| `mlx-local` | FastAPI + MLX + Chroma | Apple Silicon AI apps |

### Quick Start

| Preset | Stack | Best For |
|--------|-------|----------|
| `quick-cli` | Commander + TypeScript | CLI tools |
| `landing-page` | HTML/CSS/JS + nginx | Static sites |
| `mcp-tool` | TypeScript + stdio/SSE | MCP servers for AI |

---

## Question 1: Complexity Track

**Prompt:** `Project complexity:`

**Shown When:** Preset = `none` (custom)

| Track | Questions | Skips | Best For |
|-------|-----------|-------|----------|
| `quick` | ~5 | Auth, Domain, Design System, AI/ML | Prototypes, internal tools |
| `standard` | ~10 | Nothing | Products, platforms |
| `production` | ~15+ | Nothing + adds Web Server | Enterprise, compliance |

---

## Question 2: Project Name

**Prompt:** `Project name (kebab-case):`

**Validation:**
- Lowercase, numbers, hyphens only
- Max 50 characters

**Used In:**
- Folder name, package.json, Docker image name
- Go module path (auto-generated)
- Rust crate name (auto-generated)
- Python package name (snake_case conversion)

---

## Question 3: Project Description

**Prompt:** `Project description:`

**Default:** `A new project scaffolded with kickoff`

---

## Question 4: Project Type

**Prompt:** `Project type:`

**Shown When:** Preset = `none`

### Full-Stack JS/TS

| Type | Framework | Runtime | Description |
|------|-----------|---------|-------------|
| `nextjs` | Next.js 15 | Node | App Router, RSC, Server Actions |
| `tanstack-start` | TanStack Start | Bun/Node | React 19, type-safe routing |

### Frontend

| Type | Framework | Description |
|------|-----------|-------------|
| `vite-react` | Vite + React 19 | SPA with TypeScript |
| `static` | HTML/CSS/JS | Static site with nginx |

### Backend - Node/Bun

| Type | Framework | Runtime | Description |
|------|-----------|---------|-------------|
| `hono-api` | Hono | Bun/Node | Edge-first, multi-runtime |
| `elysia-api` | Elysia | Bun | Bun-native, Eden E2E types |
| `express-api` | Express | Node | Battle-tested, huge ecosystem |

### Backend - Deno

| Type | Framework | Description |
|------|-----------|-------------|
| `fresh-api` | Fresh | Islands architecture, Deno native |

### Backend - Python

| Type | Framework | Description |
|------|-----------|-------------|
| `fastapi` | FastAPI | Async, automatic OpenAPI docs |
| `litestar` | Litestar | High-performance, modern |

### Backend - Go

| Type | Framework | Description |
|------|-----------|-------------|
| `gin-api` | Gin | Fast, popular |
| `fiber-api` | Fiber | Express-like API |
| `echo-api` | Echo | Minimalist, extensible |

### Backend - Rust

| Type | Framework | Description |
|------|-----------|-------------|
| `axum-api` | Axum | Tokio-based, ergonomic |
| `actix-api` | Actix | Actor-based, fastest |

### Tools

| Type | Description |
|------|-------------|
| `cli` | Command-line tool with Commander |
| `mcp-server` | MCP server for AI integrations |
| `library` | npm package with tsup + vitest |
| `worker` | Background jobs with BullMQ + Redis |

---

## Question 5: Runtime

**Prompt:** `Runtime:`

**Shown When:** JS/TS project types only (not Python/Go/Rust/Deno)

| Runtime | Best For |
|---------|----------|
| `bun` | Speed, all-in-one (recommended for Hono/Elysia) |
| `node` | Compatibility, wider ecosystem |

**Auto-derived for:**
- Python projects → `python`
- Go projects → `go`
- Rust projects → `rust`
- Deno projects → `deno`

---

## Question 6: Port

**Prompt:** `Development port:`

**Default:** Random 3000-9000

**Skipped For:** `cli`, `mcp-server`, `library`

---

## Question 7: Database Provider

**Prompt:** `Database:`

**Shown When:** Project can have database (APIs, full-stack)

### Serverless (JS/TS recommended)

| Provider | Type | Features | Cost |
|----------|------|----------|------|
| `supabase` | PostgreSQL | Auth + Storage + Realtime | Free/$25+ |
| `neon` | PostgreSQL | Branching, scale-to-zero | Free/$19+ |
| `turso` | SQLite (libSQL) | Edge-first, global | Free/$29+ |
| `convex` | Reactive BaaS | Real-time, type-safe | Free/$25+ |

### BaaS

| Provider | Type | Features |
|----------|------|----------|
| `pocketbase` | SQLite BaaS | Single file, auth, realtime |
| `firebase` | NoSQL | Google BaaS |

### Self-Hosted (Docker required)

| Provider | Type | Memory |
|----------|------|--------|
| `postgres-local` | PostgreSQL | 256MB+ |
| `mysql-local` | MySQL | 512MB+ |
| `mongodb-local` | MongoDB | 512MB+ |
| `sqlite` | SQLite | N/A |

### Enterprise

| Provider | Type | Features |
|----------|------|----------|
| `planetscale` | MySQL + Vitess | Branching, serverless |
| `cockroachdb` | Distributed SQL | Multi-region, ACID |

**Language-Aware Defaults:**
- JS/TS projects: Supabase (serverless)
- Python/Go/Rust: postgres-local (self-hosted)

---

## Question 8: ORM

**Prompt:** `ORM:`

**Language-Aware Options:**

### JavaScript/TypeScript

| ORM | Style | Features |
|-----|-------|----------|
| `drizzle` | SQL-like | Fast, lightweight (recommended) |
| `prisma` | Schema-first | Great DX, migrations |
| `kysely` | Query builder | Type-safe SQL |

### Python

| ORM | Style | Features |
|-----|-------|----------|
| `sqlalchemy` | Standard | Mature, flexible (recommended) |
| `sqlmodel` | Pydantic | FastAPI creator's ORM |
| `tortoise` | Async | Django-like, async-first |

### Go

| ORM | Style | Features |
|-----|-------|----------|
| `gorm` | Full ORM | Auto-migrations (recommended) |
| `sqlx-go` | Raw SQL | Type-safe, no magic |

### Rust

| ORM | Style | Features |
|-----|-------|----------|
| `sqlx-rust` | Compile-time | Async, checked queries (recommended) |
| `sea-orm` | Active Record | Async, built on SQLx |
| `diesel` | Sync | Mature, type-safe |

**Auto-selected `none` for:** Convex, PocketBase, Firebase (BaaS handles data)

---

## Question 9: Authentication

**Prompt:** `Authentication:`

**Shown When:** Track ≠ quick AND project can have auth

### Platform-Specific (shown first if applicable)

| Provider | Platform | Features |
|----------|----------|----------|
| `supabase-auth` | Supabase | Built-in with DB |
| `convex-auth` | Convex | Built-in with DB |
| `firebase-auth` | Firebase | Built-in with DB |
| `pocketbase-auth` | PocketBase | Built-in with DB |

### Hosted (JS/TS focused)

| Provider | Features | Cost |
|----------|----------|------|
| `clerk` | Pre-built components, social login | Free/$25+ |
| `kinde` | B2B-focused, SAML SSO, feature flags | Free/$25+ |

### Self-Hosted (JS/TS)

| Provider | Features |
|----------|----------|
| `better-auth` | Modern, great DX (recommended) |
| `lucia` | Lightweight, minimal |
| `authjs` | NextAuth successor |

### Enterprise

| Provider | Features | Best For |
|----------|----------|----------|
| `auth0` | Enterprise-grade, Okta-owned | All languages |
| `workos` | SSO, directory sync | B2B apps |

---

## CLI-Specific Questions

**Shown When:** Type = `cli`

### Interactive Prompts

**Prompt:** `Include interactive prompts (inquirer)?`

**Default:** Yes

**If Yes:** Includes `inquirer` and `ora` packages

### Config File Support

**Prompt:** `Support config file (~/.projectrc)?`

**Default:** No

**If Yes:** Includes `cosmiconfig` package

### Shell Completion

**Prompt:** `Generate shell completions?`

**Default:** No

---

## MCP-Specific Questions

**Shown When:** Type = `mcp-server`

### Transport

**Prompt:** `MCP transport:`

| Transport | Description |
|-----------|-------------|
| `stdio` | Standard I/O (recommended) |
| `sse` | Server-Sent Events |

---

## Library-Specific Questions

**Shown When:** Type = `library`

### Test Framework

**Prompt:** `Test framework:`

| Framework | Description |
|-----------|-------------|
| `vitest` | Fast, modern (recommended) |
| `jest` | Battle-tested |

---

## Python-Specific Questions

**Shown When:** Type = `fastapi` or `litestar`

### Package Manager

**Prompt:** `Python package manager:`

| Manager | Description | Generated Files |
|---------|-------------|-----------------|
| `uv` | Fast, Rust-based (recommended) | `pyproject.toml`, `uv.lock` |
| `poetry` | Dependency management + publishing | `pyproject.toml`, `poetry.lock` |
| `pip` | Standard, battle-tested | `requirements.txt` |
| `pipenv` | Pipfile + lock file | `Pipfile`, `Pipfile.lock` |

---

## Go-Specific Questions

**Shown When:** Type = `gin-api`, `fiber-api`, or `echo-api`

### Module Path

**Prompt:** `Go module path (e.g., github.com/user/project):`

**Default:** `github.com/{githubUsername}/{projectName}`

---

## Rust-Specific Questions

**Shown When:** Type = `axum-api` or `actix-api`

### Edition

**Prompt:** `Rust edition:`

| Edition | Description |
|---------|-------------|
| `2021` | Stable, widely supported (recommended) |
| `2024` | Latest features (may need nightly) |

---

## AI/ML Questions

**Shown When:** Track ≠ quick AND project can have AI

### AI Framework

**Prompt:** `AI/ML Framework:`

| Framework | Language | Features |
|-----------|----------|----------|
| `vercel-ai` | TypeScript | React hooks, streaming (recommended) |
| `mastra` | TypeScript | TypeScript-first |
| `instructor` | Python/JS | Structured outputs |
| `langchain` | Python/JS | Chains, agents, RAG |
| `llamaindex` | Python/JS | Data framework, RAG |
| `semantic-kernel` | Various | Microsoft, enterprise |

### Vector Database

**Prompt:** `Vector Database:`

**Shown When:** AI Framework ≠ none

| Provider | Type | Cost |
|----------|------|------|
| `pinecone` | Managed | Free/$70+ |
| `supabase-vector` | pgvector | Included with Supabase |
| `pgvector` | PostgreSQL ext | Included with DB |
| `qdrant` | Self-hosted | Free |
| `chroma` | Self-hosted | Free |
| `weaviate` | Self-hosted | Free |
| `turbopuffer` | Managed | Pay-as-you-go |
| `milvus` | Self-hosted | Free |

### Embedding Provider

**Prompt:** `Embedding Provider:`

**Shown When:** Vector DB ≠ none

| Provider | Models | Cost/1M tokens |
|----------|--------|----------------|
| `openai` | text-embedding-3 | $0.02-$0.13 |
| `voyage` | voyage-large-2 | $0.10+ |
| `cohere` | embed-english-v3 | $0.10 |
| `google` | text-embedding-004 | $0.025 |
| `together` | Various | $0.008 |
| `ollama` | nomic-embed, mxbai | Free (local) |
| `huggingface` | sentence-transformers | Free (local) |
| `fastembed` | Lightweight | Free (local) |

### Local AI Provider

**Prompt:** `Local AI/LLM Provider:`

**Shown When:** AI Framework ≠ none AND Track ≠ quick

#### Cross-Platform

| Provider | Memory | GPU Required |
|----------|--------|--------------|
| `ollama` | 8GB+ | Optional |
| `lmstudio` | 8GB+ | Optional |
| `jan` | 8GB+ | Optional |

#### Apple Silicon (M1/M2/M3/M4)

| Provider | Memory | Description |
|----------|--------|-------------|
| `mlx` | 16GB+ | MLX framework, fastest on Mac |
| `mlx-lm` | 16GB+ | MLX LLM package |

#### Production (GPU Required)

| Provider | Memory | GPU |
|----------|--------|-----|
| `vllm` | 16GB+ | CUDA required |
| `localai` | 8GB+ | Optional |
| `tgi` | 16GB+ | CUDA required |

#### Advanced

| Provider | Memory | Description |
|----------|--------|-------------|
| `llamacpp` | 8GB+ | Low-level, max control |
| `text-gen-webui` | 16GB+ | Full-featured UI |

---

## Deployment Questions

### Domain

**Prompt:** `Production domain (empty for local only):`

**Shown When:** Track ≠ quick AND type is deployable

**If Provided:** Enables Traefik/Caddy labels, SSL config

### Web Server

**Prompt:** `Web server / reverse proxy:`

**Shown When:** Track = production AND domain is set

| Server | Features | Config File |
|--------|----------|-------------|
| `caddy` | Auto-HTTPS, simple (recommended) | `Caddyfile` |
| `nginx` | High-performance | `nginx.conf` |
| `traefik` | Docker/K8s native | `traefik.yml` |

### GitHub Username

**Prompt:** `GitHub username:`

**Default:** `abe238`

**Used In:** ghcr.io image path, GitHub Actions

### Design System

**Prompt:** `Include Gemini-style design system?`

**Shown When:** Frontend project AND Track ≠ quick

**If Yes:** Tailwind config with dark theme design tokens

---

## Template Decision Matrix

| Question | Next.js | Vite | API | Python | Go | Rust | CLI | MCP | Library | Static |
|----------|---------|------|-----|--------|----|----|-----|-----|---------|--------|
| Runtime | JS only | JS only | JS only | auto | auto | auto | JS only | JS only | JS only | ✗ |
| Port | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Database | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| ORM | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Auth | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| AI/ML | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ | ✗ |
| Domain | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Design System | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| CLI Options | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ |
| MCP Transport | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Test Framework | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Package Manager | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Module Path | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Rust Edition | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ |

---

## Computed Context Flags

The scaffolder computes these flags from your answers:

### Database Flags

| Flag | True When |
|------|-----------|
| `usesPostgres` | postgres-local, supabase, neon, cockroachdb |
| `usesMysql` | mysql-local, planetscale |
| `usesMongo` | mongodb-local |
| `usesBaaS` | supabase, convex, pocketbase, firebase |
| `needsDocker` | Self-hosted DB, vector DB, or local AI |

### AI/ML Flags

| Flag | True When |
|------|-----------|
| `hasAI` | AI framework ≠ none |
| `hasVectorDB` | Vector DB ≠ none |
| `hasEmbeddings` | Embedding provider ≠ none |
| `hasLocalAI` | Local AI ≠ none |
| `isRAGApp` | Has vector DB AND embeddings |
| `usesMLX` | Local AI = mlx or mlx-lm |
| `needsGPU` | vllm, tgi, text-gen-webui, or huggingface embeddings |

### Language Flags

| Flag | True When |
|------|-----------|
| `isTypeScript` | JS/TS project types |
| `isPython` | fastapi, litestar |
| `isGo` | gin-api, fiber-api, echo-api |
| `isRust` | axum-api, actix-api |
| `isDeno` | fresh-api |

---

## Name Transformations

| Input | Kebab | Pascal | Camel | Snake |
|-------|-------|--------|-------|-------|
| `my-project` | my-project | MyProject | myProject | my_project |
| `API Gateway` | api-gateway | ApiGateway | apiGateway | api_gateway |

Used for: folder names, class names, variable names, Python modules

---

## Environment Variables by Provider

### Databases

| Provider | Variables |
|----------|-----------|
| Supabase | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Neon | `DATABASE_URL` |
| Turso | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` |
| Convex | `CONVEX_DEPLOYMENT` |
| PlanetScale | `DATABASE_URL` |

### Auth

| Provider | Variables |
|----------|-----------|
| Clerk | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Kinde | `KINDE_ISSUER_URL`, `KINDE_CLIENT_ID`, `KINDE_CLIENT_SECRET`, `KINDE_REDIRECT_URI` |
| Auth0 | `AUTH0_SECRET`, `AUTH0_BASE_URL`, `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` |
| Better Auth | `BETTER_AUTH_SECRET` |
| AuthJS | `AUTH_SECRET`, `AUTH_URL` |

### AI/ML

| Provider | Variables |
|----------|-----------|
| OpenAI | `OPENAI_API_KEY` |
| Pinecone | `PINECONE_API_KEY`, `PINECONE_INDEX` |
| Voyage | `VOYAGE_API_KEY` |
| Cohere | `COHERE_API_KEY` |
| Together | `TOGETHER_API_KEY` |

---

## Version History

- **v2.0.0**: Multi-language support (Python, Go, Rust, Deno), AI/ML features, new auth providers (Kinde), MLX support
- **v1.1.0**: Added CLI template, complexity tracks
- **v1.0.0**: Initial release with Next.js, Vite, API, Static
