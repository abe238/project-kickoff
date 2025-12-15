import type { ProjectConfig, TemplateContext } from './types.js';
declare function buildContext(config: ProjectConfig): TemplateContext;
export declare function scaffoldProject(config: ProjectConfig, outputDir: string): Promise<void>;
export { buildContext };
