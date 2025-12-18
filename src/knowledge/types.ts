/**
 * Knowledge Base Types
 * Core type definitions for the smart questionnaire system
 */

// Cost structure for stack options
export interface CostTier {
  free: boolean;
  hobbyist: string | null;    // e.g., "$0-25/mo"
  startup: string | null;     // e.g., "$25-100/mo"
  enterprise: string | null;  // e.g., "$100+/mo"
}

// Complexity levels
export type Complexity = 'low' | 'medium' | 'high';

// Scalability levels
export type Scalability = 'low' | 'medium' | 'high' | 'unlimited';

// Runtime types
export type Runtime = 'node' | 'bun' | 'deno' | 'python' | 'go' | 'rust';

// Project types
export type ProjectType =
  | 'web-app'
  | 'api'
  | 'cli'
  | 'library'
  | 'ai-app'
  | 'static-site'
  | 'mcp-server'
  | 'worker';

// Base interface for all stack options
export interface StackOption {
  id: string;
  name: string;
  description: string;
  pros: string[];
  cons: string[];
  tradeoffs: string[];
  bestFor: string[];
  monthlyCost: CostTier;
  requiredEnvVars: string[];
  compatibleWith: string[];
  incompatibleWith: string[];
  complexity: Complexity;
  documentationUrl?: string;
  logoEmoji?: string;
}

// Database-specific interface
export interface DatabaseOption extends StackOption {
  category: 'database';
  type: 'sql' | 'nosql' | 'graph' | 'key-value' | 'document';
  hosting: 'serverless' | 'managed' | 'self-hosted' | 'baas';
  scalability: Scalability;
  supportedRuntimes: Runtime[];
  connectionPooling: boolean;
  realtimeSupport: boolean;
  branchingSupport: boolean;
}

// ORM-specific interface
export interface ORMOption extends StackOption {
  category: 'orm';
  supportedDatabases: string[];
  typeSafety: boolean;
  migrations: boolean;
  queryStyle: 'sql-like' | 'object-oriented' | 'query-builder' | 'schema-first';
  supportedRuntimes: Runtime[];
}

// Auth-specific interface
export interface AuthOption extends StackOption {
  category: 'auth';
  type: 'hosted' | 'self-hosted' | 'platform-specific';
  socialLogin: boolean;
  mfa: boolean;
  sso: boolean;
  prebuiltComponents: boolean;
  supportedRuntimes: Runtime[];
}

// Frontend framework interface
export interface FrontendOption extends StackOption {
  category: 'frontend';
  type: 'full-stack' | 'spa' | 'static' | 'islands';
  ssr: boolean;
  ssg: boolean;
  serverComponents: boolean;
  typeSafe: boolean;
  bundler: string;
}

// Backend framework interface
export interface BackendOption extends StackOption {
  category: 'backend';
  runtime: Runtime;
  type: 'minimal' | 'batteries-included' | 'microframework';
  edgeSupport: boolean;
  websocketSupport: boolean;
  openApiSupport: boolean;
  performanceRating: 'fast' | 'very-fast' | 'blazing';
}

// AI framework interface
export interface AIOption extends StackOption {
  category: 'ai';
  type: 'sdk' | 'framework' | 'local';
  streaming: boolean;
  structuredOutput: boolean;
  agentSupport: boolean;
  supportedProviders: string[];
  supportedRuntimes: Runtime[];
}

// Vector database interface
export interface VectorDBOption extends StackOption {
  category: 'vector-db';
  hosting: 'managed' | 'self-hosted' | 'embedded';
  maxDimensions: number;
  hybridSearch: boolean;
  filtering: boolean;
  supportedRuntimes: Runtime[];
}

// Embedding provider interface
export interface EmbeddingOption extends StackOption {
  category: 'embedding';
  type: 'cloud' | 'local';
  models: string[];
  maxTokens: number;
  costPer1MTokens: string | null;
  supportedRuntimes: Runtime[];
}

// Local AI provider interface
export interface LocalAIOption extends StackOption {
  category: 'local-ai';
  platform: 'cross-platform' | 'apple-silicon' | 'linux-cuda' | 'docker';
  gpuRequired: boolean;
  minMemoryGB: number;
  apiCompatibility: 'openai' | 'custom' | 'both';
}

// Web server interface
export interface WebServerOption extends StackOption {
  category: 'web-server';
  autoSSL: boolean;
  configStyle: 'simple' | 'complex' | 'code';
  dockerNative: boolean;
}

// Preset definition
export interface Preset {
  id: string;
  name: string;
  description: string;
  category: 'full-stack' | 'api' | 'ai-ml' | 'tools' | 'quick-start';
  stack: {
    projectType: ProjectType;
    frontend?: string;
    backend?: string;
    database?: string;
    orm?: string;
    auth?: string;
    ai?: string;
    vectorDb?: string;
    webServer?: string;
    runtime: Runtime;
  };
  bestFor: string[];
  complexity: Complexity;
  estimatedSetupTime: string;
}

// Question types for the questionnaire
export type QuestionType = 'single' | 'multi' | 'confirm' | 'input';

// Question option with display info
export interface QuestionOption {
  value: string;
  label: string;
  description: string;
  emoji?: string;
  pros?: string[];
  cons?: string[];
  tradeoffs?: string[];
}

// Question definition
export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: QuestionOption[];
  default?: string | string[] | boolean;
  showWhen?: (answers: Record<string, unknown>) => boolean;
  validate?: (value: unknown) => boolean | string;
  helpText?: string;
}

// User answers from questionnaire
export interface Answers {
  projectName: string;
  projectType: ProjectType;
  runtime?: Runtime;
  frontend?: string;
  backend?: string;
  database?: string;
  orm?: string;
  auth?: string;
  ai?: string;
  vectorDb?: string;
  embedding?: string;
  localAi?: string;
  webServer?: string;
  includeDocker?: boolean;
  includeGithubActions?: boolean;
  [key: string]: unknown;
}

// Recommendation from scoring engine
export interface Recommendation {
  optionId: string;
  option: StackOption;
  score: number;
  reasoning: string[];
  warnings: string[];
  alternatives: string[];
}

// Stack selection summary
export interface StackSelection {
  answers: Answers;
  recommendations: Record<string, Recommendation>;
  totalCost: CostTier;
  complexityScore: Complexity;
  requiredEnvVars: string[];
  warnings: string[];
  reasoning: string[];
}

// Compatibility rule
export interface CompatibilityRule {
  source: string;
  target: string;
  compatible: boolean;
  reason?: string;
}

// Compatibility matrix
export type CompatibilityMatrix = Record<string, {
  compatibleWith: string[];
  incompatibleWith: string[];
  notes?: Record<string, string>;
}>;

// Template fragment definition
export interface TemplateFragment {
  id: string;
  category: string;
  files: string[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  envVars?: string[];
  requires?: string[];
  conflictsWith?: string[];
}

// Template merge strategy
export type MergeStrategy = 'replace' | 'merge' | 'concat' | 'skip';

// Template context for EJS
export interface TemplateContext {
  projectName: string;
  answers: Answers;
  selection: StackSelection;
  timestamp: string;
  version: string;
  [key: string]: unknown;
}

// Knowledge base category
export type KnowledgeCategory =
  | 'database'
  | 'orm'
  | 'auth'
  | 'frontend'
  | 'backend'
  | 'ai'
  | 'vector-db'
  | 'embedding'
  | 'local-ai'
  | 'web-server';

// Union type for all stack options
export type AnyStackOption =
  | DatabaseOption
  | ORMOption
  | AuthOption
  | FrontendOption
  | BackendOption
  | AIOption
  | VectorDBOption
  | EmbeddingOption
  | LocalAIOption
  | WebServerOption;

// Knowledge base structure
export interface KnowledgeBase {
  databases: DatabaseOption[];
  orms: ORMOption[];
  auth: AuthOption[];
  frontends: FrontendOption[];
  backends: BackendOption[];
  ai: AIOption[];
  vectorDbs: VectorDBOption[];
  embeddings: EmbeddingOption[];
  localAi: LocalAIOption[];
  webServers: WebServerOption[];
  presets: Preset[];
  compatibility: CompatibilityMatrix;
}
