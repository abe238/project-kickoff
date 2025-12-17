export type ProjectType =
  // Full-Stack JS/TS
  | 'nextjs'
  | 'tanstack-start'
  // Frontend
  | 'vite-react'
  | 'static'
  // Backend - Node/Bun
  | 'hono-api'
  | 'elysia-api'
  | 'express-api'
  // Backend - Deno
  | 'fresh-api'
  // Backend - Python
  | 'fastapi'
  | 'litestar'
  // Backend - Go
  | 'gin-api'
  | 'fiber-api'
  | 'echo-api'
  // Backend - Rust
  | 'axum-api'
  | 'actix-api'
  // Tools
  | 'cli'
  | 'mcp-server'
  | 'worker'
  | 'library';

export type ComplexityTrack = 'quick' | 'standard' | 'production';

export type Preset =
  | 'none'
  // JS/TS Stacks
  | 'saas-starter'
  | 'api-microservice'
  | 'tanstack-hono'
  | 'edge-api'
  // Python Stacks
  | 'fastapi-starter'
  | 'python-ml-api'
  // Go Stacks
  | 'go-microservice'
  // Rust Stacks
  | 'rust-api'
  // AI/ML
  | 'ai-rag-app'
  | 'ai-agent'
  | 'mlx-local'
  // Quick Start
  | 'quick-cli'
  | 'landing-page'
  | 'mcp-tool';

// Database providers (2025)
export type DatabaseProvider =
  | 'none'
  // Serverless Postgres
  | 'supabase'           // Supabase (Postgres + Auth + Storage)
  | 'neon'               // Neon (Serverless Postgres, branching)
  // Edge/SQLite
  | 'turso'              // Turso (libSQL, edge-first)
  | 'd1'                 // Cloudflare D1 (edge SQLite)
  | 'sqlite'             // Local SQLite (file-based, most deployed DB)
  // BaaS
  | 'convex'             // Convex (Reactive BaaS)
  | 'pocketbase'         // PocketBase (SQLite BaaS in 1 file)
  | 'firebase'           // Firebase (Google BaaS)
  // Self-hosted
  | 'postgres-local'     // Self-hosted PostgreSQL
  | 'mysql-local'        // Self-hosted MySQL
  | 'mongodb-local'      // Self-hosted MongoDB
  // Cache/KV (often paired with primary DB)
  | 'redis'              // Redis (cache, sessions, pub/sub, queues)
  | 'upstash'            // Upstash (serverless Redis)
  | 'valkey'             // Valkey (Redis fork, open source)
  | 'dragonfly'          // Dragonfly (Redis-compatible, faster)
  // Paid/Enterprise
  | 'planetscale'        // PlanetScale (MySQL + Vitess)
  | 'cockroachdb';       // CockroachDB (Distributed SQL)

// ORM options (2025)
export type OrmChoice =
  // JavaScript/TypeScript
  | 'drizzle'            // SQL-like, fast, lightweight
  | 'prisma'             // Battle-tested, great DX
  | 'kysely'             // Type-safe SQL query builder
  // Python
  | 'sqlalchemy'         // Python ORM standard
  | 'tortoise'           // Async Python ORM
  | 'sqlmodel'           // FastAPI creator's ORM
  // Go
  | 'gorm'               // Go ORM
  | 'sqlx-go'            // Go SQL toolkit
  // Rust
  | 'diesel'             // Rust ORM
  | 'sqlx-rust'          // Rust async SQL
  | 'sea-orm'            // Rust async ORM
  | 'none';              // Raw SQL or BaaS handles it

// Server framework for API projects
export type ServerFramework =
  // Node/Bun
  | 'hono'               // Edge-first, multi-runtime
  | 'elysia'             // Bun-native, Eden E2E types
  | 'express'            // Battle-tested, huge ecosystem
  | 'fastify'            // Fast Node.js framework
  // Deno
  | 'fresh'              // Deno native, islands
  | 'oak'                // Deno Koa-like
  // Python
  | 'fastapi'            // Python async, auto-docs
  | 'litestar'           // Python async, high-perf
  | 'flask'              // Python micro-framework
  | 'django'             // Python batteries-included
  // Go
  | 'gin'                // Go fast, popular
  | 'fiber'              // Go Express-like
  | 'echo'               // Go minimalist
  // Rust
  | 'axum'               // Rust Tokio-based
  | 'actix'              // Rust actor-based
  | 'rocket';            // Rust ergonomic

// Auth providers (2025)
export type AuthProvider =
  | 'none'
  // Modern Hosted
  | 'clerk'              // Hosted, easy setup, components
  | 'kinde'              // B2B-focused, SAML SSO, feature flags
  | 'auth0'              // Enterprise, Okta-owned
  | 'workos'             // Enterprise SSO, directory sync
  // Self-hosted
  | 'better-auth'        // Modern, self-hosted, great DX
  | 'lucia'              // Lightweight, self-hosted
  | 'authjs'             // NextAuth.js / Auth.js
  // Platform-specific
  | 'supabase-auth'      // If using Supabase
  | 'convex-auth'        // If using Convex
  | 'firebase-auth'      // If using Firebase
  | 'pocketbase-auth';   // If using PocketBase

// Runtime environment
export type Runtime =
  | 'node'               // Node.js (v20+)
  | 'bun'                // Bun (fast, all-in-one)
  | 'deno'               // Deno (secure, web standards)
  | 'python'             // Python (3.11+)
  | 'go'                 // Go (1.21+)
  | 'rust';              // Rust (stable)

// Web server for static/reverse proxy
export type WebServer =
  | 'none'
  | 'caddy'              // Auto-HTTPS, simple config
  | 'nginx'              // High-performance, battle-tested
  | 'traefik';           // Docker/K8s native, auto-discovery

// Vector database providers (2025)
export type VectorDBProvider =
  | 'none'
  | 'pinecone'           // Managed, scalable, production-ready
  | 'weaviate'           // Open-source, GraphQL API, hybrid search
  | 'qdrant'             // Rust-based, fast, self-hosted friendly
  | 'chroma'             // Lightweight, Python-native, dev-friendly
  | 'pgvector'           // PostgreSQL extension, use existing DB
  | 'supabase-vector'    // Supabase pgvector integration
  | 'turbopuffer'        // Serverless, edge-optimized
  | 'milvus';            // Enterprise-grade, distributed

// Embedding providers (2025)
export type EmbeddingProvider =
  | 'none'
  | 'openai'             // text-embedding-3-small/large
  | 'cohere'             // embed-english-v3.0
  | 'voyage'             // voyage-large-2, code-optimized
  | 'ollama'             // Local embeddings (nomic-embed, mxbai)
  | 'huggingface'        // sentence-transformers, local
  | 'together'           // Together AI embeddings
  | 'google'             // text-embedding-004
  | 'fastembed';         // Lightweight local embeddings

// Local AI/LLM providers (2025)
export type LocalAIProvider =
  | 'none'
  // Cross-platform
  | 'ollama'             // Most popular, easy setup
  | 'lmstudio'           // GUI + server mode
  | 'jan'                // Desktop app + API
  // Apple Silicon
  | 'mlx'                // Apple MLX framework (M1/M2/M3/M4/M5)
  | 'mlx-lm'             // MLX LLM package
  // Production
  | 'vllm'               // Production serving, GPU required
  | 'localai'            // OpenAI API drop-in replacement
  | 'tgi'                // HuggingFace Text Generation Inference
  // Advanced
  | 'llamacpp'           // Low-level, maximum control
  | 'text-gen-webui';    // Full-featured UI + API

// AI SDK/Framework (2025)
export type AIFramework =
  | 'none'
  | 'vercel-ai'          // AI SDK by Vercel (React hooks, streaming)
  | 'langchain'          // Python/JS, comprehensive but heavy
  | 'llamaindex'         // Data framework, RAG-focused
  | 'mastra'             // TypeScript-first AI framework
  | 'instructor'         // Structured outputs, validation
  | 'semantic-kernel';   // Microsoft, enterprise

export interface ProjectConfig {
  name: string;
  description: string;
  preset: Preset;
  complexityTrack: ComplexityTrack;
  type: ProjectType;
  port: number;
  // Database
  databaseProvider: DatabaseProvider;
  orm: OrmChoice;
  // Auth
  authProvider: AuthProvider;
  // AI/ML Features
  vectorDB: VectorDBProvider;
  embeddingProvider: EmbeddingProvider;
  localAI: LocalAIProvider;
  aiFramework: AIFramework;
  // Deployment
  domain?: string;
  githubUsername: string;
  webServer: WebServer;
  // Frontend
  useDesignSystem: boolean;
  // Runtime
  runtime: Runtime;
  // Server framework (for API types)
  serverFramework?: ServerFramework;
  // CLI-specific options
  cliInteractive?: boolean;
  cliConfigFile?: boolean;
  cliShellCompletion?: boolean;
  // MCP-specific options
  mcpTransport?: 'stdio' | 'sse';
  // Library-specific options
  libraryTestFramework?: 'vitest' | 'jest';
  // Python-specific options
  pythonPackageManager?: 'pip' | 'poetry' | 'uv' | 'pipenv';
  // Go-specific options
  goModulePath?: string;
  // Rust-specific options
  rustEdition?: '2021' | '2024';
}

export interface TemplateContext extends ProjectConfig {
  nameKebab: string;
  namePascal: string;
  nameCamel: string;
  nameSnake: string;
  year: number;
  timestamp: string;
  // Computed helpers - Database
  needsDatabase: boolean;
  databaseType: string;
  usesPostgres: boolean;
  usesMysql: boolean;
  usesMongo: boolean;
  usesBaaS: boolean;
  needsDocker: boolean;
  // Computed helpers - AI/ML
  hasAI: boolean;
  hasVectorDB: boolean;
  hasEmbeddings: boolean;
  hasLocalAI: boolean;
  needsGPU: boolean;
  isRAGApp: boolean;
  usesMLX: boolean;
  // Computed helpers - Auth
  needsAuth: boolean;
  // Computed helpers - Language/Runtime
  isTypeScript: boolean;
  isPython: boolean;
  isGo: boolean;
  isRust: boolean;
  isDeno: boolean;
}
