export type ProjectType = 'nextjs' | 'vite-react' | 'api' | 'static' | 'cli';
export type ComplexityTrack = 'quick' | 'standard' | 'production';

export interface ProjectConfig {
  name: string;
  description: string;
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
}

export interface TemplateContext extends ProjectConfig {
  nameKebab: string;
  namePascal: string;
  nameCamel: string;
  year: number;
  timestamp: string;
}
