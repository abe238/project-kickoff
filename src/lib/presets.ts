import type {
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

export interface PresetConfig {
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

export const PRESETS: Record<Exclude<Preset, 'none'>, PresetConfig> = {
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

export function getPreset(name: Preset): PresetConfig | undefined {
  if (name === 'none') return undefined;
  return PRESETS[name];
}

export function listPresets(): Array<{ name: Preset; config: PresetConfig }> {
  return Object.entries(PRESETS).map(([name, config]) => ({
    name: name as Preset,
    config,
  }));
}

export function getPresetNames(): Preset[] {
  return ['none', ...Object.keys(PRESETS)] as Preset[];
}

export interface PresetChoice {
  name: string;
  value: Preset;
  description?: string;
}

export const PRESET_CHOICES: PresetChoice[] = [
  { name: 'Custom - Configure everything', value: 'none' },
  { name: 'SaaS Starter - Next.js + Supabase + Drizzle', value: 'saas-starter', description: 'Production SaaS with auth and payments ready' },
  { name: 'TanStack + Hono - TanStack Start + Turso + Better Auth', value: 'tanstack-hono', description: 'Type-safe full-stack with edge database' },
  { name: 'Edge API - Hono + Turso + Bun (blazing fast)', value: 'edge-api', description: 'Blazing fast edge-first API' },
  { name: 'API Microservice - Hono + Neon + Drizzle', value: 'api-microservice', description: 'Serverless API microservice' },
  { name: 'FastAPI Starter - FastAPI + PostgreSQL + SQLAlchemy', value: 'fastapi-starter', description: 'Python async API' },
  { name: 'Python ML API - FastAPI + pgvector + LangChain', value: 'python-ml-api', description: 'Python ML/AI backend' },
  { name: 'Go Microservice - Gin + PostgreSQL + GORM', value: 'go-microservice', description: 'High-performance Go API' },
  { name: 'Rust API - Axum + PostgreSQL + SQLx', value: 'rust-api', description: 'Maximum performance Rust API' },
  { name: 'AI RAG App - Next.js + Supabase Vector + Vercel AI', value: 'ai-rag-app', description: 'RAG application with vector search' },
  { name: 'AI Agent - Hono + Ollama + LangChain (local)', value: 'ai-agent', description: 'Local AI agent with no cloud costs' },
  { name: 'MLX Local - FastAPI + MLX + Apple Silicon', value: 'mlx-local', description: 'Apple Silicon optimized AI' },
  { name: 'Quick CLI - Command-line tool', value: 'quick-cli', description: 'CLI tool with Commander' },
  { name: 'Landing Page - Static site', value: 'landing-page', description: 'Static site with modern tooling' },
  { name: 'MCP Tool - AI tool server', value: 'mcp-tool', description: 'MCP server for AI tools' },
];
