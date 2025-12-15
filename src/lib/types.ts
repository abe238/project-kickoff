export type ProjectType =
  | 'nextjs'
  | 'vite-react'
  | 'api'
  | 'static'
  | 'cli'
  | 'mcp-server'
  | 'worker'
  | 'library';

export type ComplexityTrack = 'quick' | 'standard' | 'production';
export type Preset = 'none' | 'saas-starter' | 'api-microservice' | 'quick-cli' | 'landing-page' | 'mcp-tool';

export interface ProjectConfig {
  name: string;
  description: string;
  preset: Preset;
  complexityTrack: ComplexityTrack;
  type: ProjectType;
  port: number;
  needsDatabase: boolean;
  databaseType?: 'postgres' | 'sqlite';
  needsAuth: boolean;
  domain?: string;
  githubUsername: string;
  useDesignSystem: boolean;
  // CLI-specific options
  cliInteractive?: boolean;
  cliConfigFile?: boolean;
  cliShellCompletion?: boolean;
  // MCP-specific options
  mcpTransport?: 'stdio' | 'sse';
  // Library-specific options
  libraryTestFramework?: 'vitest' | 'jest';
}

export interface TemplateContext extends ProjectConfig {
  nameKebab: string;
  namePascal: string;
  nameCamel: string;
  year: number;
  timestamp: string;
}
