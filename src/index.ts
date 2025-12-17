#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { promptProjectConfig } from './lib/prompter.js';
import { scaffoldProject } from './lib/scaffolder.js';

const VERSION = '2.0.0';

const BANNER = `
${chalk.blue('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.blue('║')}  ${chalk.bold.white('Project Kickoff')} - Production-Ready Project Generator    ${chalk.blue('║')}
${chalk.blue('║')}  ${chalk.gray('Multi-language • AI/ML • Security best practices')}          ${chalk.blue('║')}
${chalk.blue('╚═══════════════════════════════════════════════════════════════╝')}
`;

// Stack descriptions for --help and list commands
const STACK_INFO = {
  // Frameworks
  frameworks: {
    'nextjs': { name: 'Next.js 15', desc: 'React meta-framework with App Router, Server Components, and built-in optimizations', best: 'Full-stack apps, SEO-critical sites, dashboard apps' },
    'tanstack-start': { name: 'TanStack Start', desc: 'Full-stack React 19 framework with type-safe routing and server functions', best: 'Type-obsessed teams, complex client state, TanStack Query users' },
    'vite-react': { name: 'Vite + React', desc: 'Lightning-fast build tool with React 19 for single-page applications', best: 'SPAs, internal tools, apps behind auth' },
    'hono-api': { name: 'Hono', desc: 'Ultra-fast web framework (~14KB) running on any JS runtime (Bun, Node, Deno, Edge)', best: 'Edge APIs, serverless functions, multi-runtime portability' },
    'elysia-api': { name: 'Elysia', desc: 'Bun-native framework with Eden (end-to-end type safety like tRPC)', best: 'Bun projects, type-safe APIs, maximum performance' },
    'express-api': { name: 'Express', desc: 'Battle-tested Node.js framework with massive ecosystem and middleware', best: 'Traditional APIs, teams familiar with Express, gradual migration' },
    'fastapi': { name: 'FastAPI', desc: 'Modern Python framework with automatic OpenAPI docs and async support', best: 'Python APIs, ML model serving, data science backends' },
    'gin': { name: 'Gin', desc: 'High-performance Go HTTP framework with martini-like API', best: 'High-throughput APIs, microservices, Go teams' },
    'fiber': { name: 'Fiber', desc: 'Express-inspired Go framework built on fasthttp for extreme performance', best: 'Migration from Express, performance-critical Go services' },
    'axum': { name: 'Axum', desc: 'Tokio-based Rust framework focusing on ergonomics and modularity', best: 'Rust APIs, maximum type safety, async-first services' },
    'actix': { name: 'Actix Web', desc: 'Powerful Rust actor-based framework, consistently tops benchmarks', best: 'Highest throughput needs, Rust teams, actor model fans' },
    'fresh': { name: 'Fresh', desc: 'Deno-native framework with island architecture (like Astro)', best: 'Deno projects, minimal JS shipping, content sites' },
  },
  // Databases
  databases: {
    'supabase': { name: 'Supabase', desc: 'Open-source Firebase alternative: Postgres + Auth + Storage + Realtime', best: 'MVPs, real-time apps, auth bundled with DB, open-source requirement' },
    'neon': { name: 'Neon', desc: 'Serverless Postgres with branching (like git), instant scaling, edge support', best: 'Dev/staging branches, serverless deploys, Vercel integration' },
    'turso': { name: 'Turso', desc: 'Edge-native libSQL (SQLite fork) with global replication and embedded replicas', best: 'Edge-first apps, embedded DBs, SQLite lovers, local-first' },
    'd1': { name: 'Cloudflare D1', desc: 'SQLite at the edge, native to Cloudflare Workers. Choose for CF ecosystem', best: 'Cloudflare Workers, edge compute, SQLite familiarity' },
    'sqlite': { name: 'SQLite', desc: 'The most deployed database in the world. Single file, zero config, ACID. Choose for local/embedded', best: 'CLIs, desktop apps, local dev, embedded systems, prototypes' },
    'convex': { name: 'Convex', desc: 'Reactive backend-as-a-service with real-time sync and type-safe queries', best: 'Real-time collaborative apps, rapid prototyping, no backend team' },
    'pocketbase': { name: 'PocketBase', desc: 'Single-file Go backend with SQLite, auth, and real-time subscriptions', best: 'Self-hosted MVPs, single-binary deploy, offline-capable apps' },
    'postgres-local': { name: 'PostgreSQL', desc: 'The world\'s most advanced open-source relational database', best: 'Production workloads, complex queries, PostGIS, full control' },
    'mysql-local': { name: 'MySQL', desc: 'World\'s most popular open-source database with massive ecosystem', best: 'Legacy systems, WordPress, simple CRUD, hosting compatibility' },
    'mongodb-local': { name: 'MongoDB', desc: 'Document database with flexible schemas and horizontal scaling', best: 'Unstructured data, rapid iteration, analytics, content management' },
    'redis': { name: 'Redis', desc: 'In-memory data store for caching, sessions, queues, pub/sub. Often paired with primary DB', best: 'Caching layer, session storage, job queues, real-time leaderboards' },
    'upstash': { name: 'Upstash', desc: 'Serverless Redis with per-request pricing. Edge-compatible, REST API', best: 'Serverless functions, edge caching, Vercel/Cloudflare integration' },
    'valkey': { name: 'Valkey', desc: 'Open-source Redis fork after Redis license change. Drop-in Redis replacement', best: 'Redis workloads needing true open-source license' },
    'dragonfly': { name: 'Dragonfly', desc: 'Redis-compatible but 25x faster, multi-threaded. Modern Redis alternative', best: 'High-performance Redis workloads, cost savings, modern infrastructure' },
    'cockroachdb': { name: 'CockroachDB', desc: 'Distributed SQL database surviving failures automatically', best: 'Global distribution, zero-downtime migrations, enterprise scale' },
    'firebase': { name: 'Firebase', desc: 'Google\'s BaaS with Firestore, Auth, Hosting, and Cloud Functions', best: 'Mobile apps, Google Cloud integration, quick prototypes' },
    'planetscale': { name: 'PlanetScale', desc: 'MySQL-compatible serverless DB with branching and non-blocking schema changes', best: 'MySQL at scale, zero-downtime deploys, Vitess-powered' },
  },
  // ORMs
  orms: {
    'drizzle': { name: 'Drizzle', desc: 'SQL-first ORM: ~7KB bundle, no binary, edge-ready. Queries look like SQL. Choose over Prisma for edge/serverless or if you know SQL well', best: 'Edge deployment, serverless, SQL experts, performance-critical apps' },
    'prisma': { name: 'Prisma', desc: 'DX-first ORM: visual studio, intuitive schema DSL, huge ecosystem. Choose over Drizzle for best DX or if team is new to SQL', best: 'Teams new to SQL, visual DB management, complex relations, rapid prototyping' },
    'kysely': { name: 'Kysely', desc: 'Pure query builder (not ORM): zero deps, full SQL control. Choose when you want SQL without the ORM abstraction', best: 'Complex raw queries, minimal abstraction, TypeScript + SQL purists' },
    'sqlalchemy': { name: 'SQLAlchemy', desc: 'Python gold standard: 15+ years, two APIs (Core + ORM), incredible flexibility. The default choice for Python', best: 'Python backends, complex queries, any database, production Python apps' },
    'sqlmodel': { name: 'SQLModel', desc: 'FastAPI creator\'s ORM: SQLAlchemy + Pydantic combined. Choose for FastAPI projects', best: 'FastAPI projects, Pydantic validation, modern Python APIs' },
    'gorm': { name: 'GORM', desc: 'Go ORM with associations, hooks, auto-migrations. Choose for Rails-like DX in Go', best: 'Go projects wanting ORM patterns, rapid development, migrations' },
    'sqlx-go': { name: 'sqlx (Go)', desc: 'Lightweight SQL extensions for Go. Choose over GORM for more SQL control', best: 'Raw SQL in Go, minimal abstraction, performance-critical Go apps' },
    'sqlx-rust': { name: 'sqlx (Rust)', desc: 'Async Rust SQL with compile-time query checking. Choose for maximum safety', best: 'Rust projects, compile-time SQL validation, async-first apps' },
    'sea-orm': { name: 'SeaORM', desc: 'Async Rust ORM with ActiveRecord pattern. Choose over sqlx for more abstraction', best: 'Rust teams wanting Rails-like DX, code generation, rapid development' },
    'diesel': { name: 'Diesel', desc: 'Sync Rust ORM with compile-time safety. Choose for sync Rust or maximum type safety', best: 'Sync Rust apps, maximum compile-time safety, Rust purists' },
  },
  // Auth
  auth: {
    'clerk': { name: 'Clerk', desc: 'Modern auth with beautiful UI components, SSO, and user management', best: 'SaaS apps, drop-in UI, social logins, organizations' },
    'kinde': { name: 'Kinde', desc: 'Developer-focused auth with feature flags and B2B support', best: 'Startups, feature flags included, simple pricing' },
    'better-auth': { name: 'Better Auth', desc: 'Framework-agnostic TypeScript auth library, self-hosted', best: 'Full control, self-hosted, privacy-focused, TypeScript' },
    'lucia': { name: 'Lucia', desc: 'Minimal auth library for session management, bring your own DB', best: 'Learning auth, custom implementations, minimal dependencies' },
    'authjs': { name: 'Auth.js', desc: 'NextAuth successor, framework-agnostic OAuth/email/credentials', best: 'Next.js projects, multiple providers, battle-tested' },
    'auth0': { name: 'Auth0', desc: 'Enterprise identity platform with SSO, MFA, and compliance', best: 'Enterprise requirements, compliance (SOC2/HIPAA), B2B' },
    'workos': { name: 'WorkOS', desc: 'Enterprise SSO and directory sync (SAML, SCIM, LDAP)', best: 'B2B SaaS, enterprise sales, directory integration' },
    'supabase-auth': { name: 'Supabase Auth', desc: 'Built-in auth for Supabase with Row Level Security', best: 'Supabase users, RLS integration, social + magic links' },
  },
  // AI Frameworks
  ai: {
    'vercel-ai': { name: 'Vercel AI SDK', desc: 'Unified API for LLMs with streaming, React hooks, and edge support', best: 'React/Next.js apps, streaming UI, multi-provider support' },
    'langchain': { name: 'LangChain', desc: 'Framework for LLM apps: chains, agents, RAG, and memory', best: 'Complex AI workflows, agents, document Q&A, RAG apps' },
    'llamaindex': { name: 'LlamaIndex', desc: 'Data framework connecting LLMs to external data sources', best: 'RAG pipelines, document indexing, data connectors' },
    'mastra': { name: 'Mastra', desc: 'TypeScript AI agent framework with tools and memory', best: 'AI agents, tool calling, TypeScript-first AI apps' },
  },
  // Vector DBs
  vectordbs: {
    'pinecone': { name: 'Pinecone', desc: 'Fully managed vector database with serverless and enterprise options', best: 'Production RAG, managed infrastructure, scale to billions' },
    'chroma': { name: 'Chroma', desc: 'Open-source embedding database, easy to start, AI-native', best: 'Prototypes, local development, open-source requirement' },
    'pgvector': { name: 'pgvector', desc: 'Vector similarity search extension for PostgreSQL', best: 'Existing Postgres, single-DB simplicity, SQL familiarity' },
    'qdrant': { name: 'Qdrant', desc: 'High-performance vector DB in Rust with filtering support', best: 'Self-hosted vectors, advanced filtering, high performance' },
    'weaviate': { name: 'Weaviate', desc: 'Open-source vector search with built-in vectorization', best: 'Semantic search, GraphQL API, hybrid search' },
    'supabase-vector': { name: 'Supabase Vector', desc: 'pgvector managed by Supabase with edge functions', best: 'Supabase users, all-in-one platform, simple setup' },
  },
  // Local AI
  localai: {
    'ollama': { name: 'Ollama', desc: 'Run LLMs locally with simple CLI, supports Llama, Mistral, and more', best: 'Local dev, privacy, offline use, easy model management' },
    'mlx': { name: 'MLX', desc: 'Apple\'s ML framework optimized for Apple Silicon (M1/M2/M3)', best: 'Mac development, Apple Silicon, efficient local inference' },
    'mlx-lm': { name: 'MLX-LM', desc: 'Language model inference and training on Apple Silicon', best: 'Mac users, LLM fine-tuning, local development' },
    'vllm': { name: 'vLLM', desc: 'High-throughput LLM serving with PagedAttention', best: 'Production serving, maximum throughput, batching' },
    'tgi': { name: 'TGI', desc: 'HuggingFace Text Generation Inference for production LLMs', best: 'HuggingFace models, production deployment, enterprise' },
    'localai': { name: 'LocalAI', desc: 'Drop-in OpenAI API replacement running local models', best: 'OpenAI API compatibility, self-hosted, privacy' },
    'lmstudio': { name: 'LM Studio', desc: 'Desktop app for running local LLMs with GUI', best: 'Non-technical users, model exploration, easy setup' },
  },
  // Web Servers
  webservers: {
    'caddy': { name: 'Caddy', desc: 'Modern web server with automatic HTTPS, HTTP/3, and simple config', best: 'Auto SSL, simple reverse proxy, developer-friendly' },
    'nginx': { name: 'nginx', desc: 'High-performance web server and reverse proxy, industry standard', best: 'Production load balancing, static files, complex routing' },
    'traefik': { name: 'Traefik', desc: 'Cloud-native edge router with automatic service discovery', best: 'Docker/K8s, microservices, dynamic configuration' },
  },
};

const program = new Command();

program
  .name('kickoff')
  .description('CLI to scaffold production-ready projects with security best practices')
  .version(VERSION)
  .addHelpText('after', `
${chalk.bold('Quick Start:')}
  ${chalk.cyan('$')} npx project-kickoff init          ${chalk.dim('# Interactive wizard')}
  ${chalk.cyan('$')} kickoff list                      ${chalk.dim('# See all options')}
  ${chalk.cyan('$')} kickoff stacks databases          ${chalk.dim('# Compare databases')}

${chalk.bold('Examples:')}
  ${chalk.dim('# Create a SaaS app with Next.js + Supabase')}
  ${chalk.cyan('$')} kickoff init
  ${chalk.dim('→ Select "saas-starter" preset')}

  ${chalk.dim('# Create a Python API')}
  ${chalk.cyan('$')} kickoff init
  ${chalk.dim('→ Select "fastapi-starter" preset')}

  ${chalk.dim('# Create a local AI agent')}
  ${chalk.cyan('$')} kickoff init
  ${chalk.dim('→ Select "ai-agent" preset')}

${chalk.bold('What You Get:')}
  ${chalk.green('✓')} TypeScript/Python/Go/Rust configured
  ${chalk.green('✓')} Docker + docker-compose ready
  ${chalk.green('✓')} GitHub Actions CI/CD pipeline
  ${chalk.green('✓')} Database migrations + ORM setup
  ${chalk.green('✓')} Auth integration (if selected)
  ${chalk.green('✓')} AI/ML scaffolding (if selected)
  ${chalk.green('✓')} ESLint/Prettier/Biome linting
  ${chalk.green('✓')} Testing framework configured
  ${chalk.green('✓')} Environment variables template
  ${chalk.green('✓')} Security best practices baked in

${chalk.bold('Documentation:')}
  ${chalk.dim('Interactive guide:')} docs/stacks.html
  ${chalk.dim('CLI reference:')}     kickoff --help
  ${chalk.dim('Stack details:')}     kickoff stacks all
`);

program
  .command('init')
  .description('Initialize a new project')
  .option('-d, --dry-run', 'Show what would be created without creating files')
  .option('-o, --output <dir>', 'Output directory', process.cwd())
  .action(async (options) => {
    console.log(BANNER);

    try {
      // Gather project configuration
      const config = await promptProjectConfig();

      // Show summary
      console.log('\n' + chalk.bold('Project Configuration:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ${chalk.cyan('Name:')} ${config.name}`);
      console.log(`  ${chalk.cyan('Type:')} ${config.type}`);
      console.log(`  ${chalk.cyan('Runtime:')} ${config.runtime}`);
      console.log(`  ${chalk.cyan('Port:')} ${config.port || 'N/A'}`);
      console.log(`  ${chalk.cyan('Database:')} ${config.databaseProvider}${config.orm !== 'none' ? ` + ${config.orm}` : ''}`);
      console.log(`  ${chalk.cyan('Auth:')} ${config.authProvider}`);
      if (config.aiFramework !== 'none') {
        console.log(`  ${chalk.cyan('AI:')} ${config.aiFramework}${config.vectorDB !== 'none' ? ` + ${config.vectorDB}` : ''}`);
      }
      console.log(`  ${chalk.cyan('Domain:')} ${config.domain || 'localhost'}`);
      console.log(chalk.gray('─'.repeat(40)));

      if (options.dryRun) {
        console.log(chalk.yellow('\n[Dry Run] Would create project at:'));
        console.log(`  ${path.join(options.output, config.name)}`);
        return;
      }

      // Check if directory already exists
      const projectPath = path.join(options.output, config.name);
      if (await fs.pathExists(projectPath)) {
        console.log(chalk.red(`\nError: Directory ${config.name} already exists`));
        process.exit(1);
      }

      // Scaffold the project
      const spinner = ora('Scaffolding project...').start();
      await scaffoldProject(config, options.output);
      spinner.succeed('Project scaffolded');

      // Initialize git
      spinner.start('Initializing git repository...');
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit from project-kickoff'], {
          cwd: projectPath,
        });
        spinner.succeed('Git repository initialized');
      } catch {
        spinner.warn('Git initialization skipped (git not available or error)');
      }

      // Print next steps
      console.log('\n' + chalk.bold.green('Project created successfully!'));
      console.log('\n' + chalk.bold('Next steps:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ${chalk.cyan('1.')} cd ${config.name}`);
      console.log(`  ${chalk.cyan('2.')} npm install`);
      console.log(`  ${chalk.cyan('3.')} npm run dev`);
      console.log(chalk.gray('─'.repeat(40)));

      if (config.domain) {
        console.log('\n' + chalk.bold('Deployment:'));
        console.log(chalk.gray('─'.repeat(40)));
        console.log(`  ${chalk.cyan('1.')} Push to GitHub: git push origin main`);
        console.log(`  ${chalk.cyan('2.')} GitHub Actions will build and push to ghcr.io`);
        console.log(`  ${chalk.cyan('3.')} Pull on VPS: docker compose pull && docker compose up -d`);
        console.log(chalk.gray('─'.repeat(40)));
        console.log(chalk.yellow('\n⚠️  NEVER run docker build on VPS - use GitHub Actions!'));
      }

      console.log('\n' + chalk.blue('Happy coding!') + '\n');
    } catch (error) {
      console.error(chalk.red('\nError:'), error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available project templates and options')
  .option('-v, --verbose', 'Show detailed descriptions for each option')
  .action((options) => {
    console.log(BANNER);

    if (options.verbose) {
      // Verbose mode - show full descriptions
      console.log(chalk.bold('📦 Presets (2025 Stacks):'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(`  ${chalk.magenta('saas-starter')}     ${chalk.white('Next.js + Supabase + Drizzle')}`);
      console.log(chalk.dim('                     Production SaaS with auth, DB, and payments ready'));
      console.log(`  ${chalk.magenta('tanstack-hono')}    ${chalk.white('TanStack Start + Turso + Better Auth')}`);
      console.log(chalk.dim('                     Type-safe full-stack with edge database'));
      console.log(`  ${chalk.magenta('edge-api')}         ${chalk.white('Hono + Turso + Bun')}`);
      console.log(chalk.dim('                     Blazing fast edge-first API'));
      console.log(`  ${chalk.magenta('ai-rag-app')}       ${chalk.white('Next.js + pgvector + Vercel AI')}`);
      console.log(chalk.dim('                     RAG application with vector search'));
      console.log(`  ${chalk.magenta('ai-agent')}         ${chalk.white('Hono + Ollama + LangChain')}`);
      console.log(chalk.dim('                     Local AI agent with no cloud costs'));
      console.log(chalk.gray('─'.repeat(70)));

      console.log('\n' + chalk.bold('🖥️  Frameworks:'));
      console.log(chalk.gray('─'.repeat(70)));
      for (const [key, info] of Object.entries(STACK_INFO.frameworks)) {
        console.log(`  ${chalk.cyan(key.padEnd(16))} ${chalk.white(info.name)}`);
        console.log(chalk.dim(`                     ${info.desc}`));
        console.log(chalk.dim(`                     Best for: ${info.best}`));
      }
      console.log(chalk.gray('─'.repeat(70)));

      console.log('\n' + chalk.bold('🗄️  Databases:'));
      console.log(chalk.gray('─'.repeat(70)));
      for (const [key, info] of Object.entries(STACK_INFO.databases)) {
        console.log(`  ${chalk.blue(key.padEnd(16))} ${chalk.white(info.name)}`);
        console.log(chalk.dim(`                     ${info.desc}`));
        console.log(chalk.dim(`                     Best for: ${info.best}`));
      }
      console.log(chalk.gray('─'.repeat(70)));

      console.log('\n' + chalk.bold('🔗 ORMs:'));
      console.log(chalk.gray('─'.repeat(70)));
      for (const [key, info] of Object.entries(STACK_INFO.orms)) {
        console.log(`  ${chalk.green(key.padEnd(16))} ${chalk.white(info.name)}`);
        console.log(chalk.dim(`                     ${info.desc}`));
        console.log(chalk.dim(`                     Best for: ${info.best}`));
      }
      console.log(chalk.gray('─'.repeat(70)));

      console.log('\n' + chalk.bold('🔐 Auth Providers:'));
      console.log(chalk.gray('─'.repeat(70)));
      for (const [key, info] of Object.entries(STACK_INFO.auth)) {
        console.log(`  ${chalk.yellow(key.padEnd(16))} ${chalk.white(info.name)}`);
        console.log(chalk.dim(`                     ${info.desc}`));
        console.log(chalk.dim(`                     Best for: ${info.best}`));
      }
      console.log(chalk.gray('─'.repeat(70)));

      console.log('\n' + chalk.bold('🤖 AI/ML:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(chalk.dim('  Frameworks:'));
      for (const [key, info] of Object.entries(STACK_INFO.ai)) {
        console.log(`    ${chalk.magenta(key.padEnd(14))} ${info.desc}`);
      }
      console.log(chalk.dim('\n  Vector Databases:'));
      for (const [key, info] of Object.entries(STACK_INFO.vectordbs)) {
        console.log(`    ${chalk.magenta(key.padEnd(14))} ${info.desc}`);
      }
      console.log(chalk.dim('\n  Local AI:'));
      for (const [key, info] of Object.entries(STACK_INFO.localai)) {
        console.log(`    ${chalk.magenta(key.padEnd(14))} ${info.desc}`);
      }
      console.log(chalk.gray('─'.repeat(70)));

      console.log('\n' + chalk.bold('🌐 Web Servers:'));
      console.log(chalk.gray('─'.repeat(70)));
      for (const [key, info] of Object.entries(STACK_INFO.webservers)) {
        console.log(`  ${chalk.cyan(key.padEnd(16))} ${chalk.white(info.name)}`);
        console.log(chalk.dim(`                     ${info.desc}`));
        console.log(chalk.dim(`                     Best for: ${info.best}`));
      }
      console.log(chalk.gray('─'.repeat(70)));

    } else {
      // Compact mode (default)
      console.log(chalk.bold('Presets (2025 Stacks):'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(`  ${chalk.magenta('saas-starter')}     Next.js + Supabase + Drizzle (production)`);
      console.log(`  ${chalk.magenta('tanstack-hono')}    TanStack Start + Turso + Better Auth`);
      console.log(`  ${chalk.magenta('edge-api')}         Hono + Turso + Bun (blazing fast)`);
      console.log(`  ${chalk.magenta('api-microservice')} Hono + Neon + Drizzle`);
      console.log(chalk.dim('  AI/ML'));
      console.log(`  ${chalk.magenta('ai-rag-app')}       Next.js + Supabase Vector + Vercel AI`);
      console.log(`  ${chalk.magenta('ai-agent')}         Hono + Ollama + LangChain (local)`);
      console.log(chalk.dim('  Multi-Language'));
      console.log(`  ${chalk.magenta('fastapi-app')}      FastAPI + PostgreSQL + SQLAlchemy`);
      console.log(`  ${chalk.magenta('go-api')}           Gin + PostgreSQL + GORM`);
      console.log(`  ${chalk.magenta('rust-api')}         Axum + PostgreSQL + sqlx`);
      console.log(chalk.dim('  Quick Start'));
      console.log(`  ${chalk.magenta('quick-cli')}        CLI tool (quick)`);
      console.log(`  ${chalk.magenta('landing-page')}     Static site (quick)`);
      console.log(`  ${chalk.magenta('mcp-tool')}         MCP server for AI tools (quick)`);
      console.log(chalk.gray('─'.repeat(60)));

      console.log('\n' + chalk.bold('Templates:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.dim('  Full-Stack (JS/TS)'));
      console.log(`    ${chalk.cyan('nextjs')}          Next.js 15 (App Router, RSC)`);
      console.log(`    ${chalk.cyan('tanstack-start')} TanStack Start (React 19, type-safe)`);
      console.log(chalk.dim('  Frontend'));
      console.log(`    ${chalk.cyan('vite-react')}     Vite + React 19 (SPA)`);
      console.log(`    ${chalk.cyan('static')}         HTML/CSS/JS with nginx`);
      console.log(chalk.dim('  Backend (JS/TS)'));
      console.log(`    ${chalk.cyan('hono-api')}       Hono (Edge-first, multi-runtime)`);
      console.log(`    ${chalk.cyan('elysia-api')}     Elysia (Bun-native, Eden E2E types)`);
      console.log(`    ${chalk.cyan('express-api')}    Express (Battle-tested)`);
      console.log(chalk.dim('  Backend (Multi-Language)'));
      console.log(`    ${chalk.cyan('fastapi')}        FastAPI (Python, async, OpenAPI)`);
      console.log(`    ${chalk.cyan('gin')}            Gin (Go, high-performance)`);
      console.log(`    ${chalk.cyan('fiber')}          Fiber (Go, Express-like)`);
      console.log(`    ${chalk.cyan('axum')}           Axum (Rust, Tokio-based)`);
      console.log(`    ${chalk.cyan('actix')}          Actix (Rust, actor-based)`);
      console.log(`    ${chalk.cyan('fresh')}          Fresh (Deno, island architecture)`);
      console.log(chalk.dim('  Tools'));
      console.log(`    ${chalk.cyan('cli')}            Command-line app with Commander`);
      console.log(`    ${chalk.cyan('mcp-server')}     MCP server for AI integrations`);
      console.log(`    ${chalk.cyan('library')}        npm package with tsup + vitest`);
      console.log(chalk.gray('─'.repeat(60)));

      console.log('\n' + chalk.bold('Databases (2025):'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.dim('  Serverless'));
      console.log(`    ${chalk.blue('supabase')}  Postgres + Auth + Storage + Realtime`);
      console.log(`    ${chalk.blue('neon')}      Serverless Postgres, branching, edge`);
      console.log(`    ${chalk.blue('turso')}     libSQL (SQLite), edge-first, global`);
      console.log(chalk.dim('  BaaS (Backend-as-a-Service)'));
      console.log(`    ${chalk.blue('convex')}    Reactive BaaS, real-time, type-safe`);
      console.log(`    ${chalk.blue('pocketbase')} Single-file Go backend, self-hosted`);
      console.log(`    ${chalk.blue('firebase')}  Google BaaS, Firestore, Cloud Functions`);
      console.log(chalk.dim('  Self-Hosted'));
      console.log(`    ${chalk.blue('postgres')}  The world's most advanced open-source DB`);
      console.log(`    ${chalk.blue('mysql')}     Popular open-source relational DB`);
      console.log(`    ${chalk.blue('mongodb')}   Document database, flexible schemas`);
      console.log(chalk.gray('─'.repeat(60)));

      console.log('\n' + chalk.bold('AI/ML Options:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(chalk.dim('  Frameworks:  vercel-ai | langchain | llamaindex | mastra'));
      console.log(chalk.dim('  Vector DBs:  pinecone | qdrant | chroma | pgvector | weaviate'));
      console.log(chalk.dim('  Local AI:    ollama | mlx | vllm | tgi | localai'));
      console.log(chalk.dim('  Embeddings:  openai | ollama | voyage | cohere'));
      console.log(chalk.gray('─'.repeat(60)));

      console.log('\n' + chalk.bold('Complexity Tracks:'));
      console.log(chalk.gray('─'.repeat(60)));
      console.log(`  ${chalk.yellow('quick')}        ~5 questions, fast scaffolding`);
      console.log(`  ${chalk.green('standard')}     ~10 questions, full features`);
      console.log(`  ${chalk.red('production')}   ~15+ questions, security-focused`);
      console.log(chalk.gray('─'.repeat(60)));

      console.log('\n' + chalk.dim('Run `kickoff list --verbose` for detailed descriptions'));
      console.log(chalk.dim('Run `kickoff stacks <category>` for in-depth info'));
    }
  });

// New stacks command for detailed information
program
  .command('stacks [category]')
  .description('Show detailed information about available stacks and tools')
  .addHelpText('after', `
Categories:
  frameworks   Web frameworks (Next.js, Hono, FastAPI, Gin, Axum, etc.)
  databases    Database providers (Supabase, Neon, Turso, Convex, etc.)
  orms         Object-Relational Mappers (Drizzle, Prisma, SQLAlchemy, etc.)
  auth         Authentication providers (Clerk, Kinde, Auth0, etc.)
  ai           AI/ML frameworks (Vercel AI, LangChain, LlamaIndex)
  vectordbs    Vector databases (Pinecone, Chroma, pgvector, etc.)
  localai      Local AI options (Ollama, MLX, vLLM, etc.)
  webservers   Web servers (Caddy, nginx, Traefik)
  all          Show everything

Examples:
  kickoff stacks frameworks
  kickoff stacks databases
  kickoff stacks all
`)
  .action((category) => {
    console.log(BANNER);

    const printCategory = (name: string, items: Record<string, { name: string; desc: string; best: string }>, color: typeof chalk.cyan) => {
      console.log('\n' + chalk.bold(`${name}:`));
      console.log(chalk.gray('─'.repeat(70)));
      for (const [key, info] of Object.entries(items)) {
        console.log(`  ${color(key.padEnd(16))} ${chalk.white(info.name)}`);
        console.log(chalk.gray(`                     ${info.desc}`));
        console.log(chalk.dim(`                     ✓ Best for: ${info.best}`));
        console.log();
      }
    };

    const categories: Record<string, () => void> = {
      frameworks: () => printCategory('🖥️  Frameworks', STACK_INFO.frameworks, chalk.cyan),
      databases: () => printCategory('🗄️  Databases', STACK_INFO.databases, chalk.blue),
      orms: () => printCategory('🔗 ORMs', STACK_INFO.orms, chalk.green),
      auth: () => printCategory('🔐 Auth Providers', STACK_INFO.auth, chalk.yellow),
      ai: () => printCategory('🤖 AI Frameworks', STACK_INFO.ai, chalk.magenta),
      vectordbs: () => printCategory('📊 Vector Databases', STACK_INFO.vectordbs, chalk.magenta),
      localai: () => printCategory('💻 Local AI', STACK_INFO.localai, chalk.magenta),
      webservers: () => printCategory('🌐 Web Servers', STACK_INFO.webservers, chalk.cyan),
    };

    if (!category || category === 'all') {
      Object.values(categories).forEach(fn => fn());
      console.log(chalk.gray('─'.repeat(70)));
      console.log(chalk.dim('\nSee docs/stacks.html for interactive guide with links'));
    } else if (categories[category]) {
      categories[category]();
      console.log(chalk.gray('─'.repeat(70)));
    } else {
      console.log(chalk.red(`Unknown category: ${category}`));
      console.log(chalk.dim('Available: frameworks, databases, orms, auth, ai, vectordbs, localai, webservers, all'));
    }
  });

program.parse();
