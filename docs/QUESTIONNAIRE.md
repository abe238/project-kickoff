# Project Kickoff Questionnaire

This document outlines all questions asked during `kickoff init` and how answers influence the generated project.

> **Inspired by BMAD-METHOD**: This questionnaire uses scale-adaptive tracks and type-specific questions to reduce cognitive load while gathering the right information for each project type.

---

## Questionnaire Flow

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: PROJECT CLASSIFICATION                     │
├─────────────────────────────────────────────────────┤
│ Q0. Project complexity track?                       │
│ Q1. Project name                                    │
│ Q2. Project description                             │
│ Q3. Project type                                    │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 2: TYPE-SPECIFIC QUESTIONS                    │
├─────────────────────────────────────────────────────┤
│ Web/API: Port, Database, Auth                       │
│ CLI: Interactive, Config file, Shell completion    │
│ Static: (minimal)                                   │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│ PHASE 3: DEPLOYMENT (skipped for quick track)       │
├─────────────────────────────────────────────────────┤
│ Domain, GitHub username, Design system              │
└─────────────────────────────────────────────────────┘
```

---

## Question 0: Complexity Track (NEW)

**Prompt:** `Project complexity:`

**Options:**

| Value | Label | Description |
|-------|-------|-------------|
| `quick` | Quick | Clear scope, single feature, internal tool |
| `standard` | Standard | Product/platform, multiple features |
| `production` | Production | Compliance, multi-tenant, security-critical |

### Track Behaviors

**Quick Track**
- Skips: Domain, design system, auth questions
- Best for: Internal tools, prototypes, single-purpose utilities
- Questions: ~5

**Standard Track** (Default)
- Full questionnaire flow
- Best for: Products, platforms, client projects
- Questions: ~10

**Production Track**
- All standard questions + security considerations
- Future: Will add compliance, monitoring, logging questions
- Best for: Fintech, healthcare, enterprise applications
- Questions: ~12+

**Comments:**
<!--
Track selection inspired by BMAD-METHOD's scale-adaptive approach.
Future considerations:
- Add domain-specific compliance questions for production track
- Consider "enterprise" track for multi-tenant SaaS
-->

---

## Question 1: Project Name

**Prompt:** `Project name (kebab-case):`

**Validation:**
- Lowercase letters, numbers, and hyphens only
- No spaces, underscores, or capitals
- Max 50 characters

**Used In:**
- Folder name
- package.json `name` field
- Docker image name (`ghcr.io/username/project-name`)
- Traefik route labels
- README title
- CLAUDE.md header
- CLI binary name (for CLI projects)

**Examples:**
- `my-dashboard`
- `api-gateway`
- `landing-page`
- `my-cli-tool`

**Comments:**
<!--
Add notes here about naming conventions, reserved names, or project-specific patterns
-->

---

## Question 2: Project Description

**Prompt:** `Project description:`

**Default:** `A new project scaffolded with kickoff`

**Used In:**
- package.json `description` field
- README.md intro
- CLAUDE.md overview
- HTML meta description (for web projects)
- CLI help text banner

**Examples:**
- `Real-time dashboard for monitoring API performance`
- `CLI tool for managing Docker deployments`
- `Landing page for product launch`

**Comments:**
<!--
Add notes here about description style, length recommendations, SEO considerations
-->

---

## Question 3: Project Type

**Prompt:** `Project type:`

**Options:**

| Value | Label | Description |
|-------|-------|-------------|
| `nextjs` | Next.js | Full-stack React with App Router |
| `vite-react` | Vite + React | SPA Frontend |
| `api` | Node.js API | Express backend |
| `cli` | CLI Tool | Command-line application (NEW) |
| `static` | Static Site | HTML/CSS/JS |

### When to Choose Each:

**Next.js (`nextjs`)**
- Server-side rendering needed
- SEO important
- API routes in same repo
- Full-stack in one deployment

**Vite + React (`vite-react`)**
- Pure frontend SPA
- Backend is separate service
- Fast development builds
- Client-side only

**Node.js API (`api`)**
- Backend only, no UI
- REST or GraphQL endpoints
- Microservice architecture
- Webhooks/integrations

**CLI Tool (`cli`)** ✨ NEW
- Terminal applications
- Developer tools
- Automation scripts
- Interactive prompts or flags-only

**Static Site (`static`)**
- Landing pages
- Documentation sites
- No dynamic content
- Maximum performance

**Comments:**
<!--
CLI template now implemented! Includes:
- Commander for command parsing
- Chalk for colored output
- Optional: Inquirer for prompts, Cosmiconfig for config files

Future project types to consider:
- [ ] Library/Package - npm packages for distribution
- [ ] Monorepo - Multiple packages in one repo (turborepo/nx)
- [ ] Worker - Background job processors
- [ ] Browser Extension - Chrome/Firefox extensions
-->

---

## Question 4: Development Port

**Prompt:** `Development port:`

**Default:** Random between 3000-9000

**Shown When:** Project type is NOT `cli`

**Validation:**
- Must be between 1024 and 65535
- Ports below 1024 require root

**Used In:**
- Vite/Next.js dev server
- Express listen port
- Docker EXPOSE
- docker-compose port mapping
- Health check URLs

**Common Ports:**
- `3000` - Default for many frameworks
- `5173` - Vite default
- `8080` - Common alternative
- `4000` - GraphQL convention

**Comments:**
<!--
Add notes here about:
- Port conflict resolution
- Team conventions
- Reserved ports to avoid
-->

---

## CLI-Specific Questions (Type = `cli`)

### Question 4a: Interactive Prompts

**Prompt:** `Include interactive prompts (inquirer)?`

**Default:** Yes

**If Yes, includes:**
- `inquirer` package for interactive prompts
- `ora` package for spinners
- Example prompt in generated code

**When to use:**
- Setup wizards
- Configuration tools
- User-facing CLIs

**When to skip:**
- Pure flag-based tools
- CI/CD automation tools
- Scripting utilities

---

### Question 4b: Config File Support

**Prompt:** `Support config file (~/.projectrc)?`

**Default:** No

**If Yes, includes:**
- `cosmiconfig` package
- Config loading from multiple locations:
  - `~/.projectrc`
  - `.projectrc.json`
  - `project.config.js`
- Example config command

**When to use:**
- Tools with many options
- User preferences storage
- Environment-specific settings

---

### Question 4c: Shell Completion

**Prompt:** `Generate shell completions (bash/zsh)?`

**Default:** No

**If Yes, includes:**
- Commander's built-in completion support
- Instructions for shell setup

**Comments:**
<!--
Shell completion is valuable for frequently-used CLIs.
Consider adding this for tools used multiple times per day.
-->

---

## Question 5: Database Required

**Prompt:** `Need database?`

**Shown When:** Project type is `nextjs` or `api`

**Default:**
- `Yes` for Next.js, API
- Not shown for Vite, Static, CLI

**Conditional:** Shows Question 6 if Yes

**Used In:**
- Prisma schema generation
- Docker compose database service
- Environment variables template
- CLAUDE.md architecture section

**Comments:**
<!--
Add notes here about:
- When to use external database services (Supabase, PlanetScale)
- Database-as-a-service vs self-hosted
- Data persistence considerations
-->

---

## Question 6: Database Type

**Prompt:** `Database type:`

**Shown When:** Question 5 = Yes

**Options:**

| Value | Label | Use Case |
|-------|-------|----------|
| `postgres` | PostgreSQL | Production, multi-user, complex queries |
| `sqlite` | SQLite | Development, single-user, embedded |

### PostgreSQL
- Production recommended
- Requires running database server
- Better for concurrent access
- Rich ecosystem (PostGIS, full-text search)

### SQLite
- File-based, no server needed
- Great for local tools
- Single-user scenarios
- Embedded applications

**Comments:**
<!--
Add notes here about:
- Other databases to support (MySQL, MongoDB, Redis)
- Connection pooling considerations
- Migration strategies
-->

---

## Question 7: Authentication Required

**Prompt:** `Need authentication?`

**Shown When:**
- Project type is `nextjs` or `api`
- AND complexity track is NOT `quick`

**Default:** No

**Used In:**
- Auth middleware generation
- JWT/session setup
- Protected route examples
- Environment variables for secrets

**If Yes, generates:**
- Password hashing utilities (bcrypt)
- JWT token handling (jose)
- Auth middleware
- Login/logout patterns

**Comments:**
<!--
Add notes here about:
- External auth providers (Clerk, Auth0, NextAuth)
- OAuth vs password auth
- API key authentication
- Session vs JWT tradeoffs
-->

---

## Question 8: Production Domain

**Prompt:** `Production domain (leave empty for local only):`

**Shown When:**
- Project type is NOT `cli`
- AND complexity track is NOT `quick`

**Default:** Empty (localhost only)

**Examples:**
- `myapp.example.com`
- `api.mydomain.io`
- `dashboard.internal.company.com`

**If Provided, enables:**
- Traefik routing labels in docker-compose
- SSL certificate configuration
- Production health check URLs
- Deployment instructions
- CORS configuration

**If Empty:**
- Local development only
- No Traefik labels
- Simple port mapping

**Comments:**
<!--
Add notes here about:
- Subdomain conventions
- Internal vs external domains
- Multi-environment (staging, production)
- Domain verification
-->

---

## Question 9: GitHub Username

**Prompt:** `GitHub username:`

**Default:** `abe238`

**Used In:**
- ghcr.io image path (`ghcr.io/username/project`)
- GitHub repository links
- README badges
- GitHub Actions workflow

**Comments:**
<!--
Add notes here about:
- Organization accounts vs personal
- Private registries
- Alternative container registries (Docker Hub, ECR)
-->

---

## Question 10: Design System

**Prompt:** `Include Gemini-style design system?`

**Shown When:**
- Project type is `nextjs` or `vite-react`
- AND complexity track is NOT `quick`

**Default:** Yes for frontend projects

**If Yes, includes:**
- Tailwind config with design tokens
- Color palette (dark theme)
- Typography scale
- Spacing system
- Component styles

**Design Tokens:**
```
Backgrounds: #0d0d0d → #1a1a1a → #262626
Text: #e8eaed (primary) → #9aa0a6 (secondary)
Accent: #8ab4f8 (blue) | #81c995 (green) | #f28b82 (red)
Border radius: 8px (cards) | 20px (buttons) | 28px (inputs)
```

**Comments:**
<!--
Add notes here about:
- Alternative design systems
- Light mode support
- Custom branding
- Component libraries (shadcn, Radix)
-->

---

## Template Decision Matrix

| Question | Next.js | Vite | API | CLI | Static |
|----------|---------|------|-----|-----|--------|
| Port | ✓ | ✓ | ✓ | ✗ | ✓ |
| CLI Interactive | ✗ | ✗ | ✗ | ✓ | ✗ |
| CLI Config File | ✗ | ✗ | ✗ | ✓ | ✗ |
| CLI Shell Completion | ✗ | ✗ | ✗ | ✓ | ✗ |
| Database | ✓ | ✗ | ✓ | ✗ | ✗ |
| Auth | ✓ | ✗ | ✓ | ✗ | ✗ |
| Domain | ✓ | ✓ | ✓ | ✗ | ✓ |
| Design System | ✓ | ✓ | ✗ | ✗ | ✗ |

### Track Impact on Questions

| Question | Quick | Standard | Production |
|----------|-------|----------|------------|
| Complexity Track | ✓ | ✓ | ✓ |
| Name | ✓ | ✓ | ✓ |
| Description | ✓ | ✓ | ✓ |
| Type | ✓ | ✓ | ✓ |
| Port | ✓ | ✓ | ✓ |
| Database | ✓ | ✓ | ✓ |
| Auth | ✗ | ✓ | ✓ |
| Domain | ✗ | ✓ | ✓ |
| Design System | ✗ | ✓ | ✓ |
| *Future: Monitoring* | ✗ | ✗ | ✓ |
| *Future: Logging* | ✗ | ✗ | ✓ |
| *Future: Compliance* | ✗ | ✗ | ✓ |

---

## BMAD-Inspired Expansion Ideas

Based on analysis of the [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) project scaffolding approach.

### Type-Specific Architecture Questions (Future)

**For API Projects:**
- [ ] API style? (REST / GraphQL / tRPC)
- [ ] API versioning? (URL /v1/ / Header / None)
- [ ] Rate limiting? (Yes / No)
- [ ] OpenAPI docs generation? (Yes / No)

**For Next.js/Vite Projects:**
- [ ] Rendering strategy? (SSR / SPA / ISR)
- [ ] Real-time features? (None / WebSockets / SSE)
- [ ] State management? (React Context / Zustand / Redux)

**For Production Track:**
- [ ] Domain type? (General / Fintech / Healthcare / Internal)
- [ ] Monitoring? (None / Sentry / Full observability)
- [ ] Logging? (Console / Structured JSON / Centralized)
- [ ] Deployment target? (VPS-Traefik / Vercel / Kubernetes)

### Detection-Based Classification (Future)

BMAD uses keyword detection to suggest project type. We could implement:

```yaml
detection_signals:
  api: ["API", "REST", "GraphQL", "backend", "endpoints"]
  cli: ["CLI", "command-line", "terminal", "interactive"]
  nextjs: ["SSR", "SEO", "full-stack", "server-side"]
  vite-react: ["SPA", "frontend", "client-side", "dashboard"]
```

### Brownfield Support (Future)

- [ ] Add "Greenfield vs Brownfield" question
- [ ] For brownfield: Skip scaffolding, only generate specific files
- [ ] Analyze existing package.json/tsconfig.json for compatibility

---

## Additional Questions to Consider

### High Priority
- [ ] **Deployment Target** - VPS, Vercel, Railway, Fly.io, Kubernetes
- [ ] **API Style** - REST, GraphQL, tRPC (for api/nextjs)
- [ ] **Monitoring** - None, Sentry, Full (Prometheus/Grafana)

### Medium Priority
- [ ] **Package Manager** - npm, yarn, pnpm, bun
- [ ] **Testing Framework** - Jest, Vitest, Playwright
- [ ] **Logging** - Console, Pino, Winston

### Low Priority
- [ ] **CI/CD Platform** - GitHub Actions (default), GitLab CI, CircleCI
- [ ] **Container Registry** - ghcr.io (default), Docker Hub, ECR

---

## Template Variations to Consider

- [ ] **Next.js + Prisma + Auth** - Full-stack starter with everything
- [ ] **API + Queue** - Background job processing with BullMQ
- [ ] **Monorepo** - Multiple apps/packages with Turborepo
- [ ] **Library** - npm package template with proper exports
- [ ] **Worker** - Background job processor with health checks

---

## Notes

<!--
General notes about the questionnaire:
- v1.1.0: Added CLI template and complexity track
- Complexity track reduces cognitive load for simple projects
- CLI-specific questions replace web-specific ones
- BMAD insights inform future expansion
-->
