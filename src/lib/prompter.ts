import inquirer from 'inquirer';
import type {
  ProjectConfig,
  ProjectType,
  ComplexityTrack,
  Preset,
  DatabaseProvider,
  OrmChoice,
  AuthProvider,
  Runtime,
  ServerFramework,
  VectorDBProvider,
  EmbeddingProvider,
  LocalAIProvider,
  AIFramework,
  WebServer,
} from './types.js';

function validateProjectName(input: string): boolean | string {
  if (!input) return 'Project name is required';
  if (!/^[a-z0-9-]+$/.test(input)) {
    return 'Project name must be lowercase with hyphens only (e.g., my-project)';
  }
  if (input.length > 50) return 'Project name must be 50 characters or less';
  return true;
}

function generateRandomPort(): number {
  return Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;
}

function isFrontend(type: ProjectType): boolean {
  return ['nextjs', 'tanstack-start', 'vite-react'].includes(type);
}

function isApi(type: ProjectType): boolean {
  return [
    'hono-api', 'elysia-api', 'express-api', 'fresh-api',
    'fastapi', 'litestar',
    'gin-api', 'fiber-api', 'echo-api',
    'axum-api', 'actix-api'
  ].includes(type);
}

function isFullStack(type: ProjectType): boolean {
  return ['nextjs', 'tanstack-start'].includes(type);
}

function needsPortQuestion(type: ProjectType): boolean {
  return !['cli', 'mcp-server', 'library'].includes(type);
}

function canHaveDatabase(type: ProjectType): boolean {
  return [
    'nextjs', 'tanstack-start',
    'hono-api', 'elysia-api', 'express-api', 'fresh-api',
    'fastapi', 'litestar',
    'gin-api', 'fiber-api', 'echo-api',
    'axum-api', 'actix-api',
    'worker'
  ].includes(type);
}

function canHaveAuth(type: ProjectType): boolean {
  return [
    'nextjs', 'tanstack-start',
    'hono-api', 'elysia-api', 'express-api', 'fresh-api',
    'fastapi', 'litestar',
    'gin-api', 'fiber-api', 'echo-api',
    'axum-api', 'actix-api'
  ].includes(type);
}

function isServerless(type: ProjectType): boolean {
  return ['cli', 'mcp-server', 'library'].includes(type);
}

function canHaveAI(type: ProjectType): boolean {
  return [
    'nextjs', 'tanstack-start',
    'hono-api', 'elysia-api', 'express-api', 'fresh-api',
    'fastapi', 'litestar',
    'gin-api', 'fiber-api', 'echo-api',
    'axum-api', 'actix-api',
    'worker', 'mcp-server'
  ].includes(type);
}

function isPythonProject(type: ProjectType): boolean {
  return ['fastapi', 'litestar'].includes(type);
}

function isGoProject(type: ProjectType): boolean {
  return ['gin-api', 'fiber-api', 'echo-api'].includes(type);
}

function isRustProject(type: ProjectType): boolean {
  return ['axum-api', 'actix-api'].includes(type);
}

function isDenoProject(type: ProjectType): boolean {
  return ['fresh-api'].includes(type);
}

function deriveRuntime(type: ProjectType): Runtime {
  if (isPythonProject(type)) return 'python';
  if (isGoProject(type)) return 'go';
  if (isRustProject(type)) return 'rust';
  if (isDenoProject(type)) return 'deno';
  if (type === 'elysia-api') return 'bun';
  return 'node';
}

function deriveServerFramework(type: ProjectType): ServerFramework | undefined {
  const mapping: Record<string, ServerFramework> = {
    'hono-api': 'hono',
    'elysia-api': 'elysia',
    'express-api': 'express',
    'fresh-api': 'fresh',
    'fastapi': 'fastapi',
    'litestar': 'litestar',
    'gin-api': 'gin',
    'fiber-api': 'fiber',
    'echo-api': 'echo',
    'axum-api': 'axum',
    'actix-api': 'actix',
  };
  return mapping[type];
}

interface PresetConfig {
  type: ProjectType;
  complexityTrack: ComplexityTrack;
  runtime: Runtime;
  databaseProvider?: DatabaseProvider;
  orm?: OrmChoice;
  authProvider?: AuthProvider;
  useDesignSystem?: boolean;
  serverFramework?: ServerFramework;
  vectorDB?: VectorDBProvider;
  embeddingProvider?: EmbeddingProvider;
  localAI?: LocalAIProvider;
  aiFramework?: AIFramework;
  webServer?: WebServer;
  pythonPackageManager?: 'pip' | 'poetry' | 'uv' | 'pipenv';
}

const PRESETS: Record<Exclude<Preset, 'none'>, PresetConfig> = {
  'saas-starter': {
    type: 'nextjs',
    complexityTrack: 'production',
    runtime: 'node',
    databaseProvider: 'supabase',
    orm: 'drizzle',
    authProvider: 'supabase-auth',
    useDesignSystem: true,
  },
  'api-microservice': {
    type: 'hono-api',
    complexityTrack: 'standard',
    runtime: 'bun',
    databaseProvider: 'neon',
    orm: 'drizzle',
    authProvider: 'none',
  },
  'tanstack-hono': {
    type: 'tanstack-start',
    complexityTrack: 'standard',
    runtime: 'bun',
    databaseProvider: 'turso',
    orm: 'drizzle',
    authProvider: 'better-auth',
    useDesignSystem: true,
  },
  'edge-api': {
    type: 'hono-api',
    complexityTrack: 'quick',
    runtime: 'bun',
    databaseProvider: 'turso',
    orm: 'drizzle',
    authProvider: 'none',
  },
  'quick-cli': {
    type: 'cli',
    complexityTrack: 'quick',
    runtime: 'node',
    databaseProvider: 'none',
    orm: 'none',
    authProvider: 'none',
  },
  'landing-page': {
    type: 'static',
    complexityTrack: 'quick',
    runtime: 'node',
    databaseProvider: 'none',
    orm: 'none',
    authProvider: 'none',
  },
  'mcp-tool': {
    type: 'mcp-server',
    complexityTrack: 'quick',
    runtime: 'node',
    databaseProvider: 'none',
    orm: 'none',
    authProvider: 'none',
  },
  'ai-rag-app': {
    type: 'nextjs',
    complexityTrack: 'standard',
    runtime: 'node',
    databaseProvider: 'supabase',
    orm: 'drizzle',
    authProvider: 'supabase-auth',
    useDesignSystem: true,
    vectorDB: 'supabase-vector',
    embeddingProvider: 'openai',
    localAI: 'none',
    aiFramework: 'vercel-ai',
  },
  'ai-agent': {
    type: 'hono-api',
    complexityTrack: 'standard',
    runtime: 'bun',
    databaseProvider: 'turso',
    orm: 'drizzle',
    authProvider: 'none',
    vectorDB: 'chroma',
    embeddingProvider: 'ollama',
    localAI: 'ollama',
    aiFramework: 'langchain',
  },
  'fastapi-starter': {
    type: 'fastapi',
    complexityTrack: 'standard',
    runtime: 'python',
    databaseProvider: 'postgres-local',
    orm: 'sqlalchemy',
    authProvider: 'none',
    pythonPackageManager: 'uv',
  },
  'python-ml-api': {
    type: 'fastapi',
    complexityTrack: 'standard',
    runtime: 'python',
    databaseProvider: 'postgres-local',
    orm: 'sqlalchemy',
    authProvider: 'none',
    vectorDB: 'pgvector',
    embeddingProvider: 'openai',
    localAI: 'none',
    aiFramework: 'langchain',
    pythonPackageManager: 'uv',
  },
  'go-microservice': {
    type: 'gin-api',
    complexityTrack: 'standard',
    runtime: 'go',
    databaseProvider: 'postgres-local',
    orm: 'gorm',
    authProvider: 'none',
  },
  'rust-api': {
    type: 'axum-api',
    complexityTrack: 'standard',
    runtime: 'rust',
    databaseProvider: 'postgres-local',
    orm: 'sqlx-rust',
    authProvider: 'none',
  },
  'mlx-local': {
    type: 'fastapi',
    complexityTrack: 'standard',
    runtime: 'python',
    databaseProvider: 'sqlite',
    orm: 'sqlalchemy',
    authProvider: 'none',
    vectorDB: 'chroma',
    embeddingProvider: 'ollama',
    localAI: 'mlx',
    aiFramework: 'langchain',
    pythonPackageManager: 'uv',
  },
};

export interface PromptOptions {
  name?: string;
  preset?: string;
  useDefaults?: boolean;
}

export async function promptProjectConfig(options: PromptOptions = {}): Promise<ProjectConfig> {
  // If preset was provided via CLI, validate it
  const cliPreset = options.preset as Preset | undefined;
  if (cliPreset && cliPreset !== 'none' && !PRESETS[cliPreset as Exclude<Preset, 'none'>]) {
    throw new Error(`Unknown preset: ${cliPreset}. Run 'kickoff list' to see available presets.`);
  }

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'preset',
      message: 'Start with a preset or custom?',
      choices: [
        { name: 'Custom - Configure everything', value: 'none' },
        new inquirer.Separator('── JavaScript/TypeScript ──'),
        { name: 'SaaS Starter - Next.js + Supabase + Drizzle', value: 'saas-starter' },
        { name: 'TanStack + Hono - TanStack Start + Turso + Better Auth', value: 'tanstack-hono' },
        { name: 'Edge API - Hono + Turso + Bun (blazing fast)', value: 'edge-api' },
        { name: 'API Microservice - Hono + Neon + Drizzle', value: 'api-microservice' },
        new inquirer.Separator('── Python ──'),
        { name: 'FastAPI Starter - FastAPI + PostgreSQL + SQLAlchemy', value: 'fastapi-starter' },
        { name: 'Python ML API - FastAPI + pgvector + LangChain', value: 'python-ml-api' },
        new inquirer.Separator('── Go ──'),
        { name: 'Go Microservice - Gin + PostgreSQL + GORM', value: 'go-microservice' },
        new inquirer.Separator('── Rust ──'),
        { name: 'Rust API - Axum + PostgreSQL + SQLx', value: 'rust-api' },
        new inquirer.Separator('── AI/ML ──'),
        { name: 'AI RAG App - Next.js + Supabase Vector + Vercel AI', value: 'ai-rag-app' },
        { name: 'AI Agent - Hono + Ollama + LangChain (local)', value: 'ai-agent' },
        { name: 'MLX Local - FastAPI + MLX + Apple Silicon', value: 'mlx-local' },
        new inquirer.Separator('── Quick Start ──'),
        { name: 'Quick CLI - Command-line tool', value: 'quick-cli' },
        { name: 'Landing Page - Static site', value: 'landing-page' },
        { name: 'MCP Tool - AI tool server', value: 'mcp-tool' },
      ],
      default: 'none',
      when: () => !cliPreset, // Skip if preset provided via CLI
    },
    {
      type: 'list',
      name: 'complexityTrack',
      message: 'Project complexity:',
      choices: [
        { name: 'Quick - Clear scope, minimal config', value: 'quick' },
        { name: 'Standard - Full features, good defaults', value: 'standard' },
        { name: 'Production - Security-focused, compliance-ready', value: 'production' },
      ],
      default: 'standard',
      when: (ans) => !cliPreset && ans.preset === 'none',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Project name (kebab-case):',
      validate: validateProjectName,
      when: () => !options.name, // Skip if name provided via CLI
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A new project scaffolded with kickoff',
      when: () => !cliPreset, // Skip for CLI presets - use default
    },
    {
      type: 'list',
      name: 'type',
      message: 'Project type:',
      choices: [
        new inquirer.Separator('── Full-Stack JS/TS ──'),
        { name: 'Next.js 15 (App Router, RSC)', value: 'nextjs' },
        { name: 'TanStack Start (React 19, type-safe)', value: 'tanstack-start' },
        new inquirer.Separator('── Frontend ──'),
        { name: 'Vite + React 19 (SPA)', value: 'vite-react' },
        { name: 'Static Site (HTML/CSS/JS)', value: 'static' },
        new inquirer.Separator('── Backend - Node/Bun ──'),
        { name: 'Hono (Edge-first, multi-runtime)', value: 'hono-api' },
        { name: 'Elysia (Bun-native, Eden E2E types)', value: 'elysia-api' },
        { name: 'Express (Battle-tested)', value: 'express-api' },
        new inquirer.Separator('── Backend - Deno ──'),
        { name: 'Fresh (Deno native, islands)', value: 'fresh-api' },
        new inquirer.Separator('── Backend - Python ──'),
        { name: 'FastAPI (Async, auto-docs)', value: 'fastapi' },
        { name: 'Litestar (High-performance)', value: 'litestar' },
        new inquirer.Separator('── Backend - Go ──'),
        { name: 'Gin (Fast, popular)', value: 'gin-api' },
        { name: 'Fiber (Express-like)', value: 'fiber-api' },
        { name: 'Echo (Minimalist)', value: 'echo-api' },
        new inquirer.Separator('── Backend - Rust ──'),
        { name: 'Axum (Tokio-based, ergonomic)', value: 'axum-api' },
        { name: 'Actix (Actor-based, fastest)', value: 'actix-api' },
        new inquirer.Separator('── Other ──'),
        { name: 'Worker (BullMQ + Redis)', value: 'worker' },
        new inquirer.Separator('── Tools ──'),
        { name: 'CLI Tool (Commander)', value: 'cli' },
        { name: 'MCP Server (AI integrations)', value: 'mcp-server' },
        { name: 'Library (npm package)', value: 'library' },
      ],
      when: (ans) => !cliPreset && ans.preset === 'none',
    },
    // Runtime (only for JS/TS projects that have a choice)
    {
      type: 'list',
      name: 'runtime',
      message: 'Runtime:',
      choices: [
        { name: 'Bun (Fast, modern - recommended for Hono/Elysia)', value: 'bun' },
        { name: 'Node.js (Battle-tested, wider compatibility)', value: 'node' },
      ],
      default: (ans: { type: ProjectType }) => {
        if (ans.type === 'elysia-api') return 'bun';
        if (ans.type === 'hono-api') return 'bun';
        return 'node';
      },
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        const type = ans.type;
        // Only show runtime choice for JS/TS projects
        const jsTypes = ['nextjs', 'tanstack-start', 'vite-react', 'hono-api', 'elysia-api', 'express-api', 'worker', 'cli', 'mcp-server', 'library'];
        return jsTypes.includes(type) && !['static', 'library'].includes(type);
      },
    },
    {
      type: 'number',
      name: 'port',
      message: 'Development port:',
      default: generateRandomPort(),
      validate: (input: number) => {
        if (input < 1024 || input > 65535) return 'Port must be between 1024 and 65535';
        return true;
      },
      when: (ans) => {
        if (cliPreset) return false; // Skip for CLI presets - use generated default
        const effectivePreset = ans.preset;
        const type = effectivePreset && effectivePreset !== 'none' ? PRESETS[effectivePreset as Exclude<Preset, 'none'>].type : ans.type;
        return needsPortQuestion(type);
      },
    },
    // Database Provider (2025)
    {
      type: 'list',
      name: 'databaseProvider',
      message: 'Database:',
      choices: (ans) => {
        const type = ans.type;
        const choices = [];

        // Serverless options (JS/TS focused)
        if (!isPythonProject(type) && !isGoProject(type) && !isRustProject(type)) {
          choices.push(
            new inquirer.Separator('── Serverless (recommended) ──'),
            { name: 'Supabase - Postgres + Auth + Storage + Realtime', value: 'supabase' },
            { name: 'Neon - Serverless Postgres, branching, edge', value: 'neon' },
            { name: 'Turso - libSQL (SQLite), edge-first, global', value: 'turso' },
            { name: 'D1 - Cloudflare edge SQLite', value: 'd1' },
            { name: 'Convex - Reactive BaaS, real-time, type-safe', value: 'convex' }
          );
        }

        // BaaS options
        choices.push(
          new inquirer.Separator('── BaaS ──'),
          { name: 'PocketBase - SQLite BaaS in 1 file', value: 'pocketbase' },
          { name: 'Firebase - Google BaaS', value: 'firebase' }
        );

        // Self-hosted
        choices.push(
          new inquirer.Separator('── Self-hosted ──'),
          { name: 'PostgreSQL - Self-hosted/Docker', value: 'postgres-local' },
          { name: 'MySQL - Self-hosted/Docker', value: 'mysql-local' },
          { name: 'MongoDB - Self-hosted/Docker', value: 'mongodb-local' },
          { name: 'SQLite - Local file, zero config, most deployed DB', value: 'sqlite' }
        );

        // Cache/KV (often paired with primary DB)
        choices.push(
          new inquirer.Separator('── Cache/KV (pair with primary DB) ──'),
          { name: 'Redis - Cache, sessions, queues, pub/sub', value: 'redis' },
          { name: 'Upstash - Serverless Redis (edge, REST API)', value: 'upstash' },
          { name: 'Valkey - Open-source Redis fork', value: 'valkey' },
          { name: 'Dragonfly - Redis-compatible, 25x faster', value: 'dragonfly' }
        );

        // Enterprise
        choices.push(
          new inquirer.Separator('── Enterprise ──'),
          { name: 'PlanetScale - MySQL + Vitess', value: 'planetscale' },
          { name: 'CockroachDB - Distributed SQL', value: 'cockroachdb' },
          new inquirer.Separator(),
          { name: 'None - No database', value: 'none' }
        );

        return choices;
      },
      default: (ans: { type: ProjectType }) => {
        if (isPythonProject(ans.type) || isGoProject(ans.type) || isRustProject(ans.type)) {
          return 'postgres-local';
        }
        return 'supabase';
      },
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return canHaveDatabase(ans.type);
      },
    },
    // ORM (language-aware)
    {
      type: 'list',
      name: 'orm',
      message: 'ORM:',
      choices: (ans) => {
        const type = ans.type;

        // BaaS handles data layer
        if (ans.databaseProvider === 'convex' || ans.databaseProvider === 'pocketbase' || ans.databaseProvider === 'firebase') {
          return [{ name: 'None - BaaS handles data layer', value: 'none' }];
        }

        // Python ORMs
        if (isPythonProject(type)) {
          return [
            { name: 'SQLAlchemy - Python ORM standard (recommended)', value: 'sqlalchemy' },
            { name: 'SQLModel - FastAPI creator\'s ORM, Pydantic integration', value: 'sqlmodel' },
            { name: 'Tortoise - Async Python ORM', value: 'tortoise' },
            { name: 'None - Raw SQL', value: 'none' },
          ];
        }

        // Go ORMs
        if (isGoProject(type)) {
          return [
            { name: 'GORM - Full-featured Go ORM (recommended)', value: 'gorm' },
            { name: 'sqlx - Type-safe SQL toolkit', value: 'sqlx-go' },
            { name: 'None - Raw SQL', value: 'none' },
          ];
        }

        // Rust ORMs
        if (isRustProject(type)) {
          return [
            { name: 'SQLx - Async, compile-time checked (recommended)', value: 'sqlx-rust' },
            { name: 'SeaORM - Async ORM built on SQLx', value: 'sea-orm' },
            { name: 'Diesel - Sync ORM, mature', value: 'diesel' },
            { name: 'None - Raw SQL', value: 'none' },
          ];
        }

        // JS/TS ORMs (default)
        return [
          { name: 'Drizzle - SQL-like, fast, lightweight (recommended)', value: 'drizzle' },
          { name: 'Prisma - Battle-tested, great DX', value: 'prisma' },
          { name: 'Kysely - Type-safe SQL query builder', value: 'kysely' },
          { name: 'None - Raw SQL', value: 'none' },
        ];
      },
      default: (ans: { type: ProjectType }) => {
        if (isPythonProject(ans.type)) return 'sqlalchemy';
        if (isGoProject(ans.type)) return 'gorm';
        if (isRustProject(ans.type)) return 'sqlx-rust';
        return 'drizzle';
      },
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return ans.databaseProvider && ans.databaseProvider !== 'none';
      },
    },
    // Auth Provider (2025)
    {
      type: 'list',
      name: 'authProvider',
      message: 'Authentication:',
      choices: (ans) => {
        const type = ans.type;
        const choices = [];

        // Platform-specific auth (show first if applicable)
        if (ans.databaseProvider === 'supabase') {
          choices.push({ name: 'Supabase Auth - Built-in with Supabase (recommended)', value: 'supabase-auth' });
        }
        if (ans.databaseProvider === 'convex') {
          choices.push({ name: 'Convex Auth - Built-in with Convex (recommended)', value: 'convex-auth' });
        }
        if (ans.databaseProvider === 'firebase') {
          choices.push({ name: 'Firebase Auth - Built-in with Firebase (recommended)', value: 'firebase-auth' });
        }
        if (ans.databaseProvider === 'pocketbase') {
          choices.push({ name: 'PocketBase Auth - Built-in with PocketBase (recommended)', value: 'pocketbase-auth' });
        }

        // JS/TS focused auth (skip for non-JS projects)
        if (!isPythonProject(type) && !isGoProject(type) && !isRustProject(type)) {
          choices.push(
            new inquirer.Separator('── Hosted (Easy Setup) ──'),
            { name: 'Clerk - Easy setup, pre-built components', value: 'clerk' },
            { name: 'Kinde - B2B-focused, feature flags, SAML SSO', value: 'kinde' },
            new inquirer.Separator('── Self-Hosted ──'),
            { name: 'Better Auth - Modern, great DX (recommended)', value: 'better-auth' },
            { name: 'Lucia - Lightweight, minimal', value: 'lucia' },
            { name: 'Auth.js - NextAuth.js successor', value: 'authjs' },
            new inquirer.Separator('── Enterprise ──'),
            { name: 'Auth0 - Enterprise-grade, Okta-owned', value: 'auth0' },
            { name: 'WorkOS - Enterprise SSO, directory sync', value: 'workos' }
          );
        } else {
          // For Python/Go/Rust, show simpler options
          choices.push(
            new inquirer.Separator('── Hosted ──'),
            { name: 'Auth0 - Enterprise-grade, multi-language SDKs', value: 'auth0' },
            { name: 'Kinde - B2B-focused, feature flags', value: 'kinde' },
            new inquirer.Separator('── Enterprise ──'),
            { name: 'WorkOS - Enterprise SSO, directory sync', value: 'workos' }
          );
        }

        choices.push(
          new inquirer.Separator(),
          { name: 'None - No authentication', value: 'none' }
        );
        return choices;
      },
      default: (ans: { databaseProvider: DatabaseProvider }) => {
        if (ans.databaseProvider === 'supabase') return 'supabase-auth';
        if (ans.databaseProvider === 'convex') return 'convex-auth';
        if (ans.databaseProvider === 'firebase') return 'firebase-auth';
        if (ans.databaseProvider === 'pocketbase') return 'pocketbase-auth';
        return 'better-auth';
      },
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        const type = ans.type;
        const track = ans.complexityTrack;
        return canHaveAuth(type) && track !== 'quick';
      },
    },
    // CLI-specific questions
    {
      type: 'confirm',
      name: 'cliInteractive',
      message: 'Include interactive prompts (inquirer)?',
      default: true,
      when: (ans) => {
        if (cliPreset) return false; // Skip for CLI presets - use defaults
        const effectivePreset = ans.preset;
        const type = effectivePreset && effectivePreset !== 'none' ? PRESETS[effectivePreset as Exclude<Preset, 'none'>].type : ans.type;
        return type === 'cli';
      },
    },
    {
      type: 'confirm',
      name: 'cliConfigFile',
      message: 'Support config file (~/.projectrc)?',
      default: false,
      when: (ans) => {
        if (cliPreset) return false; // Skip for CLI presets - use defaults
        const effectivePreset = ans.preset;
        const type = effectivePreset && effectivePreset !== 'none' ? PRESETS[effectivePreset as Exclude<Preset, 'none'>].type : ans.type;
        return type === 'cli';
      },
    },
    {
      type: 'confirm',
      name: 'cliShellCompletion',
      message: 'Generate shell completions?',
      default: false,
      when: (ans) => {
        if (cliPreset) return false; // Skip for CLI presets - use defaults
        const effectivePreset = ans.preset;
        const type = effectivePreset && effectivePreset !== 'none' ? PRESETS[effectivePreset as Exclude<Preset, 'none'>].type : ans.type;
        return type === 'cli';
      },
    },
    // MCP-specific
    {
      type: 'list',
      name: 'mcpTransport',
      message: 'MCP transport:',
      choices: [
        { name: 'stdio (Standard I/O - recommended)', value: 'stdio' },
        { name: 'SSE (Server-Sent Events)', value: 'sse' },
      ],
      default: 'stdio',
      when: (ans) => {
        if (cliPreset) return false; // Skip for CLI presets - use defaults
        const effectivePreset = ans.preset;
        const type = effectivePreset && effectivePreset !== 'none' ? PRESETS[effectivePreset as Exclude<Preset, 'none'>].type : ans.type;
        return type === 'mcp-server';
      },
    },
    // Library-specific
    {
      type: 'list',
      name: 'libraryTestFramework',
      message: 'Test framework:',
      choices: [
        { name: 'Vitest (Fast, modern)', value: 'vitest' },
        { name: 'Jest (Battle-tested)', value: 'jest' },
      ],
      default: 'vitest',
      when: (ans) => {
        if (cliPreset) return false; // Skip for CLI presets - use defaults
        const effectivePreset = ans.preset;
        const type = effectivePreset && effectivePreset !== 'none' ? PRESETS[effectivePreset as Exclude<Preset, 'none'>].type : ans.type;
        return type === 'library';
      },
    },
    // AI/ML Framework
    {
      type: 'list',
      name: 'aiFramework',
      message: 'AI/ML Framework:',
      choices: [
        { name: 'None - No AI features', value: 'none' },
        new inquirer.Separator('── Modern AI SDKs ──'),
        { name: 'Vercel AI SDK - React hooks, streaming (recommended)', value: 'vercel-ai' },
        { name: 'Mastra - TypeScript-first AI framework', value: 'mastra' },
        { name: 'Instructor - Structured outputs, validation', value: 'instructor' },
        new inquirer.Separator('── Comprehensive ──'),
        { name: 'LangChain - Full-featured, RAG, agents', value: 'langchain' },
        { name: 'LlamaIndex - Data framework, RAG-focused', value: 'llamaindex' },
        new inquirer.Separator('── Enterprise ──'),
        { name: 'Semantic Kernel - Microsoft, enterprise', value: 'semantic-kernel' },
      ],
      default: 'none',
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        const type = ans.type;
        return canHaveAI(type) && ans.complexityTrack !== 'quick';
      },
    },
    // Vector Database
    {
      type: 'list',
      name: 'vectorDB',
      message: 'Vector Database:',
      choices: (ans) => {
        const choices = [
          new inquirer.Separator('── Managed (recommended) ──'),
          { name: 'Pinecone - Scalable, production-ready', value: 'pinecone' },
          { name: 'Turbopuffer - Serverless, edge-optimized', value: 'turbopuffer' },
        ];
        if (ans.databaseProvider === 'supabase') {
          choices.push({ name: 'Supabase Vector - pgvector built-in (recommended)', value: 'supabase-vector' });
        }
        choices.push(
          new inquirer.Separator('── Self-hosted ──'),
          { name: 'pgvector - PostgreSQL extension', value: 'pgvector' },
          { name: 'Qdrant - Rust-based, fast', value: 'qdrant' },
          { name: 'Weaviate - GraphQL API, hybrid search', value: 'weaviate' },
          { name: 'Chroma - Lightweight, dev-friendly', value: 'chroma' },
          { name: 'Milvus - Enterprise-grade, distributed', value: 'milvus' },
          new inquirer.Separator(),
          { name: 'None - No vector database', value: 'none' }
        );
        return choices;
      },
      default: (ans: { databaseProvider: DatabaseProvider }) => {
        if (ans.databaseProvider === 'supabase') return 'supabase-vector';
        return 'pinecone';
      },
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return ans.aiFramework && ans.aiFramework !== 'none';
      },
    },
    // Embedding Provider
    {
      type: 'list',
      name: 'embeddingProvider',
      message: 'Embedding Provider:',
      choices: [
        new inquirer.Separator('── Cloud APIs ──'),
        { name: 'OpenAI - text-embedding-3 (recommended)', value: 'openai' },
        { name: 'Voyage AI - Code-optimized embeddings', value: 'voyage' },
        { name: 'Cohere - embed-english-v3', value: 'cohere' },
        { name: 'Google - text-embedding-004', value: 'google' },
        { name: 'Together AI - Fast, affordable', value: 'together' },
        new inquirer.Separator('── Local/Self-hosted ──'),
        { name: 'Ollama - Local embeddings (nomic-embed)', value: 'ollama' },
        { name: 'HuggingFace - sentence-transformers', value: 'huggingface' },
        { name: 'FastEmbed - Lightweight local', value: 'fastembed' },
        new inquirer.Separator(),
        { name: 'None - No embeddings', value: 'none' },
      ],
      default: 'openai',
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return ans.vectorDB && ans.vectorDB !== 'none';
      },
    },
    // Local AI Provider
    {
      type: 'list',
      name: 'localAI',
      message: 'Local AI/LLM Provider:',
      choices: [
        { name: 'None - Use cloud APIs only', value: 'none' },
        new inquirer.Separator('── Popular (Cross-platform) ──'),
        { name: 'Ollama - Easy setup, many models (recommended)', value: 'ollama' },
        { name: 'LM Studio - Desktop app + API', value: 'lmstudio' },
        { name: 'Jan - Desktop app + API', value: 'jan' },
        new inquirer.Separator('── Apple Silicon (M1/M2/M3/M4) ──'),
        { name: 'MLX - Apple MLX framework (fastest on Mac)', value: 'mlx' },
        { name: 'MLX-LM - MLX LLM package', value: 'mlx-lm' },
        new inquirer.Separator('── Production (GPU) ──'),
        { name: 'vLLM - OpenAI-compatible, fast (CUDA)', value: 'vllm' },
        { name: 'LocalAI - OpenAI drop-in replacement', value: 'localai' },
        { name: 'TGI - HuggingFace Text Generation Inference', value: 'tgi' },
        new inquirer.Separator('── Advanced ──'),
        { name: 'llama.cpp - Low-level, max control', value: 'llamacpp' },
        { name: 'Text Gen WebUI - Full-featured UI', value: 'text-gen-webui' },
      ],
      default: 'none',
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return ans.aiFramework && ans.aiFramework !== 'none' && ans.complexityTrack !== 'quick';
      },
    },
    // Domain
    {
      type: 'input',
      name: 'domain',
      message: 'Production domain (empty for local only):',
      default: '',
      when: (ans) => {
        if (cliPreset) return false; // Skip for CLI presets - use default
        const effectivePreset = ans.preset;
        if (effectivePreset && effectivePreset !== 'none') {
          const preset = PRESETS[effectivePreset as Exclude<Preset, 'none'>];
          return preset.complexityTrack !== 'quick' && !isServerless(preset.type);
        }
        return ans.complexityTrack !== 'quick' && !isServerless(ans.type);
      },
    },
    // Web Server (for production deployments)
    {
      type: 'list',
      name: 'webServer',
      message: 'Web server / reverse proxy:',
      choices: [
        { name: 'Caddy - Auto-HTTPS, simple config (recommended)', value: 'caddy' },
        { name: 'nginx - High-performance, battle-tested', value: 'nginx' },
        { name: 'Traefik - Docker/K8s native, auto-discovery', value: 'traefik' },
        { name: 'None - Direct container/process exposure', value: 'none' },
      ],
      default: 'caddy',
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        const track = ans.complexityTrack;
        return ans.domain && ans.domain.length > 0 && track === 'production';
      },
    },
    // Python package manager
    {
      type: 'list',
      name: 'pythonPackageManager',
      message: 'Python package manager:',
      choices: [
        { name: 'uv - Fast, modern, Rust-based (recommended)', value: 'uv' },
        { name: 'Poetry - Dependency management + publishing', value: 'poetry' },
        { name: 'pip + venv - Standard, battle-tested', value: 'pip' },
        { name: 'Pipenv - Pipfile + lock file', value: 'pipenv' },
      ],
      default: 'uv',
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return isPythonProject(ans.type);
      },
    },
    // Go module path
    {
      type: 'input',
      name: 'goModulePath',
      message: 'Go module path (e.g., github.com/user/project):',
      default: (ans: { githubUsername?: string; name: string }) => {
        const username = ans.githubUsername || 'username';
        return `github.com/${username}/${ans.name}`;
      },
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return isGoProject(ans.type);
      },
    },
    // Rust edition
    {
      type: 'list',
      name: 'rustEdition',
      message: 'Rust edition:',
      choices: [
        { name: '2021 - Stable, widely supported (recommended)', value: '2021' },
        { name: '2024 - Latest features (nightly may be required)', value: '2024' },
      ],
      default: '2021',
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return isRustProject(ans.type);
      },
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: 'GitHub username:',
      default: 'abe238',
      when: () => !cliPreset, // Skip for CLI presets - use default
    },
    // Design system
    {
      type: 'confirm',
      name: 'useDesignSystem',
      message: 'Include Gemini-style design system?',
      default: true,
      when: (ans) => {
        if (cliPreset || ans.preset !== 'none') return false;
        return isFrontend(ans.type) && ans.complexityTrack !== 'quick';
      },
    },
  ]);

  // Apply preset defaults (CLI preset takes precedence)
  const effectivePreset = cliPreset || answers.preset || 'none';
  let presetDefaults: Partial<ProjectConfig> = {};
  if (effectivePreset !== 'none') {
    const preset = PRESETS[effectivePreset as Exclude<Preset, 'none'>];
    presetDefaults = {
      type: preset.type,
      complexityTrack: preset.complexityTrack,
      runtime: preset.runtime,
      databaseProvider: preset.databaseProvider ?? 'none',
      orm: preset.orm ?? 'none',
      authProvider: preset.authProvider ?? 'none',
      useDesignSystem: preset.useDesignSystem ?? false,
      serverFramework: preset.serverFramework,
      vectorDB: preset.vectorDB ?? 'none',
      embeddingProvider: preset.embeddingProvider ?? 'none',
      localAI: preset.localAI ?? 'none',
      aiFramework: preset.aiFramework ?? 'none',
      webServer: preset.webServer ?? 'none',
      pythonPackageManager: preset.pythonPackageManager,
    };
  }

  const finalType = presetDefaults.type ?? answers.type;
  const finalRuntime = presetDefaults.runtime ?? answers.runtime ?? deriveRuntime(finalType);

  const config: ProjectConfig = {
    preset: effectivePreset,
    complexityTrack: presetDefaults.complexityTrack ?? answers.complexityTrack ?? 'standard',
    name: options.name || answers.name,
    description: answers.description || 'A new project scaffolded with kickoff',
    type: finalType,
    port: answers.port ?? generateRandomPort(),
    runtime: finalRuntime,
    databaseProvider: presetDefaults.databaseProvider ?? answers.databaseProvider ?? 'none',
    orm: presetDefaults.orm ?? answers.orm ?? 'none',
    authProvider: presetDefaults.authProvider ?? answers.authProvider ?? 'none',
    vectorDB: presetDefaults.vectorDB ?? answers.vectorDB ?? 'none',
    embeddingProvider: presetDefaults.embeddingProvider ?? answers.embeddingProvider ?? 'none',
    localAI: presetDefaults.localAI ?? answers.localAI ?? 'none',
    aiFramework: presetDefaults.aiFramework ?? answers.aiFramework ?? 'none',
    domain: answers.domain ?? '',
    githubUsername: answers.githubUsername || 'abe238',
    webServer: presetDefaults.webServer ?? answers.webServer ?? 'none',
    useDesignSystem: presetDefaults.useDesignSystem ?? answers.useDesignSystem ?? false,
    serverFramework: presetDefaults.serverFramework ?? deriveServerFramework(finalType),
    cliInteractive: answers.cliInteractive ?? true,
    cliConfigFile: answers.cliConfigFile ?? false,
    cliShellCompletion: answers.cliShellCompletion ?? false,
    mcpTransport: answers.mcpTransport ?? 'stdio',
    libraryTestFramework: answers.libraryTestFramework ?? 'vitest',
    pythonPackageManager: presetDefaults.pythonPackageManager ?? answers.pythonPackageManager,
    goModulePath: answers.goModulePath,
    rustEdition: answers.rustEdition,
  };

  return config;
}
