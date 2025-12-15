export type ProjectType = 'nextjs' | 'vite-react' | 'api' | 'static';

export interface ProjectConfig {
  name: string;
  description: string;
  type: ProjectType;
  port: number;
  needsDatabase: boolean;
  databaseType?: 'postgres' | 'sqlite';
  needsAuth: boolean;
  domain?: string;
  githubUsername: string;
  useDesignSystem: boolean;
}

export interface TemplateContext extends ProjectConfig {
  nameKebab: string;
  namePascal: string;
  nameCamel: string;
  year: number;
  timestamp: string;
}
