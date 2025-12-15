# Project Kickoff

CLI tool to scaffold production-ready projects with security best practices baked in.

## Features

- **Security First**: All generated projects include Docker security best practices (non-root user, read-only filesystem, resource limits)
- **CI/CD Ready**: GitHub Actions workflows with security scanning (npm audit, Trivy)
- **VPS Deployment Ready**: Traefik labels, health endpoints, and deployment scripts
- **AI-Assisted**: Every project includes a comprehensive CLAUDE.md for AI coding assistance
- **Design System**: Optional Gemini-style dark theme design tokens

## Installation

```bash
npm install -g project-kickoff
```

Or run directly with npx:

```bash
npx project-kickoff init
```

## Usage

### Create a new project

```bash
kickoff init
```

This will walk you through an interactive questionnaire:
- Project name
- Project type (Next.js, Vite+React, API, Static)
- Port number
- Database (PostgreSQL, SQLite, or none)
- Authentication
- Production domain
- Design system

### List available templates

```bash
kickoff list
```

## Project Templates

| Template | Description |
|----------|-------------|
| `nextjs` | Next.js 15 with App Router, TypeScript, Tailwind CSS |
| `vite-react` | Vite + React 19 SPA with TypeScript, Tailwind CSS |
| `api` | Express.js API with TypeScript |
| `static` | Static HTML/CSS/JS site with nginx |

## What's Generated

Every project includes:

```
my-project/
├── CLAUDE.md              # AI coding assistant context
├── README.md              # Project documentation
├── Dockerfile             # Secure multi-stage build
├── docker-compose.yml     # With Traefik labels & security
├── .github/
│   └── workflows/
│       └── deploy.yml     # CI/CD with security scanning
├── .env.example           # Environment template
├── .gitignore
└── src/                   # Source code
```

## Security Features

Based on lessons learned from production incidents:

1. **Never build on VPS**: All templates use GitHub Actions for builds
2. **Non-root containers**: All Dockerfiles use non-root users (uid 1001)
3. **Resource limits**: CPU and memory limits in docker-compose.yml
4. **Security headers**: Traefik middleware for HSTS, XSS protection, etc.
5. **Health endpoints**: Every app has `/api/health` for monitoring
6. **Security scanning**: npm audit and Trivy in CI/CD pipeline

## VPS Deployment

Safe deployment pattern:

```bash
# Push to GitHub (triggers GitHub Actions)
git push origin main

# On VPS (NEVER docker build!)
docker compose pull
docker compose up -d
```

## Development

```bash
# Clone the repo
git clone https://github.com/abe238/project-kickoff.git

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build
```

## License

MIT

---

*Scaffolded from lessons learned building production apps with proper security and deployment practices.*
