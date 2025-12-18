import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { TemplateEngine, TemplateContext, createTemplateEngine } from './TemplateEngine.js';
import { Logger, logger } from '../utils/Logger.js';
import type { ProjectConfig } from '../lib/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ScaffoldingOptions {
  skipInstall?: boolean;
  skipGit?: boolean;
  dryRun?: boolean;
}

export interface ScaffoldingResult {
  success: boolean;
  projectPath: string;
  filesCreated: string[];
  errors: string[];
  warnings: string[];
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-');
}

function toPascalCase(str: string): string {
  return str.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
  return str.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

export function buildContext(config: ProjectConfig): TemplateContext {
  const postgresProviders = ['postgres-local', 'supabase', 'neon', 'cockroachdb'];
  const mysqlProviders = ['mysql-local', 'planetscale'];
  const mongoProviders = ['mongodb-local'];
  const baasProviders = ['supabase', 'convex', 'pocketbase', 'firebase'];
  const dockerVectorDBs = ['qdrant', 'chroma', 'weaviate', 'milvus'];
  const dockerLocalAI = ['ollama', 'vllm', 'localai', 'tgi'];
  const dockerDatabases = ['postgres-local', 'mysql-local', 'mongodb-local'];
  const gpuLocalAI = ['vllm', 'text-gen-webui', 'tgi'];
  const gpuEmbeddings = ['huggingface'];
  const mlxProviders = ['mlx', 'mlx-lm'];
  const pythonTypes = ['fastapi', 'litestar'];
  const goTypes = ['gin-api', 'fiber-api', 'echo-api'];
  const rustTypes = ['axum-api', 'actix-api'];
  const denoTypes = ['fresh-api'];
  const tsTypes = ['nextjs', 'tanstack-start', 'vite-react', 'hono-api', 'elysia-api', 'express-api', 'cli', 'mcp-server', 'library', 'worker'];

  const getDatabaseType = (): string => {
    if (postgresProviders.includes(config.databaseProvider)) return 'postgres';
    if (mysqlProviders.includes(config.databaseProvider)) return 'mysql';
    if (mongoProviders.includes(config.databaseProvider)) return 'mongo';
    if (['sqlite', 'turso', 'd1'].includes(config.databaseProvider)) return 'sqlite';
    if (baasProviders.includes(config.databaseProvider)) return 'baas';
    return 'none';
  };

  return {
    projectName: config.name,
    ...config,
    nameKebab: toKebabCase(config.name),
    namePascal: toPascalCase(config.name),
    nameCamel: toCamelCase(config.name),
    nameSnake: toSnakeCase(config.name),
    year: new Date().getFullYear(),
    timestamp: new Date().toISOString().split('T')[0],
    needsDatabase: config.databaseProvider !== 'none',
    databaseType: getDatabaseType(),
    usesPostgres: postgresProviders.includes(config.databaseProvider),
    usesMysql: mysqlProviders.includes(config.databaseProvider),
    usesMongo: mongoProviders.includes(config.databaseProvider),
    usesBaaS: baasProviders.includes(config.databaseProvider),
    needsDocker:
      dockerDatabases.includes(config.databaseProvider) ||
      dockerVectorDBs.includes(config.vectorDB) ||
      dockerLocalAI.includes(config.localAI),
    hasAI: config.aiFramework !== 'none',
    hasVectorDB: config.vectorDB !== 'none',
    hasEmbeddings: config.embeddingProvider !== 'none',
    hasLocalAI: config.localAI !== 'none',
    needsGPU:
      gpuLocalAI.includes(config.localAI) ||
      gpuEmbeddings.includes(config.embeddingProvider),
    isRAGApp: config.vectorDB !== 'none' && config.embeddingProvider !== 'none',
    usesMLX: mlxProviders.includes(config.localAI),
    needsAuth: config.authProvider !== 'none',
    isTypeScript: tsTypes.includes(config.type),
    isPython: pythonTypes.includes(config.type),
    isGo: goTypes.includes(config.type),
    isRust: rustTypes.includes(config.type),
    isDeno: denoTypes.includes(config.type),
  };
}

export class ProjectScaffolder {
  private templateEngine: TemplateEngine;
  private logger: Logger;

  constructor() {
    this.templateEngine = createTemplateEngine();
    this.logger = logger;
  }

  async create(config: ProjectConfig, outputDir: string, options: ScaffoldingOptions = {}): Promise<ScaffoldingResult> {
    const result: ScaffoldingResult = {
      success: false,
      projectPath: path.join(outputDir, config.name),
      filesCreated: [],
      errors: [],
      warnings: []
    };

    const totalSteps = 5;
    let currentStep = 0;

    try {
      currentStep++;
      this.logger.step(currentStep, totalSteps, 'Building template context...');
      const context = buildContext(config);
      this.logger.success('Context built');

      currentStep++;
      this.logger.step(currentStep, totalSteps, 'Creating project directory...');
      if (await fs.pathExists(result.projectPath)) {
        throw new Error(`Directory '${result.projectPath}' already exists`);
      }
      await fs.ensureDir(result.projectPath);
      this.logger.success('Directory created');

      currentStep++;
      this.logger.step(currentStep, totalSteps, 'Copying shared templates...');
      const templatesDir = path.join(__dirname, '..', '..', 'templates');
      const sharedDir = path.join(templatesDir, 'shared');
      if (await fs.pathExists(sharedDir)) {
        const sharedFiles = await this.copyAndProcessTemplates(sharedDir, result.projectPath, context);
        result.filesCreated.push(...sharedFiles);
      }
      this.logger.success('Shared templates copied');

      currentStep++;
      this.logger.step(currentStep, totalSteps, 'Copying project-type templates...');
      const typeDir = path.join(templatesDir, config.type);
      if (await fs.pathExists(typeDir)) {
        const typeFiles = await this.copyAndProcessTemplates(typeDir, result.projectPath, context);
        result.filesCreated.push(...typeFiles);
      }
      this.logger.success('Project templates copied');

      currentStep++;
      this.logger.step(currentStep, totalSteps, 'Creating additional directories...');
      await this.createAdditionalDirs(config, context, result.projectPath);
      this.logger.success('Additional directories created');

      result.success = true;
      this.logger.success(`Created ${result.filesCreated.length} files`);

    } catch (error) {
      result.errors.push(error instanceof Error ? error.message : String(error));
      this.logger.error(`Scaffolding failed: ${error instanceof Error ? error.message : String(error)}`);

      if (await fs.pathExists(result.projectPath)) {
        try {
          await fs.remove(result.projectPath);
        } catch {
          result.warnings.push('Failed to clean up partial project directory');
        }
      }
    }

    return result;
  }

  private async copyAndProcessTemplates(
    srcDir: string,
    destDir: string,
    context: TemplateContext
  ): Promise<string[]> {
    const filesCreated: string[] = [];
    const entries = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(srcDir, entry.name);
      let destName = entry.name
        .replace(/\.ejs$/, '')
        .replace(/\.hbs$/, '')
        .replace('__name__', context.nameKebab as string)
        .replace('_dot_', '.');

      destName = this.templateEngine.processFileName(destName, context);
      const destPath = path.join(destDir, destName);

      if (entry.isDirectory()) {
        await fs.ensureDir(destPath);
        const subFiles = await this.copyAndProcessTemplates(srcPath, destPath, context);
        filesCreated.push(...subFiles);
      } else if (this.templateEngine.isBinaryFile(srcPath)) {
        await fs.copy(srcPath, destPath);
        filesCreated.push(path.relative(destDir, destPath));
      } else {
        const content = await fs.readFile(srcPath, 'utf-8');
        const processed = this.templateEngine.process(content, context);
        await fs.writeFile(destPath, processed, 'utf-8');
        filesCreated.push(path.relative(destDir, destPath));
      }
    }

    return filesCreated;
  }

  private async createAdditionalDirs(
    config: ProjectConfig,
    context: TemplateContext,
    projectDir: string
  ): Promise<void> {
    const toolTypes = ['cli', 'mcp-server', 'library', 'static'];
    const hasDatabase = config.databaseProvider !== 'none';
    const hasAuth = config.authProvider !== 'none';

    if (hasDatabase && config.orm === 'prisma' && !toolTypes.includes(config.type)) {
      await fs.ensureDir(path.join(projectDir, 'prisma'));
    }

    if (hasAuth && !toolTypes.includes(config.type)) {
      await fs.ensureDir(path.join(projectDir, 'src', 'lib', 'auth'));
    }

    if (context.hasAI && !toolTypes.includes(config.type)) {
      await fs.ensureDir(path.join(projectDir, 'src', 'lib', 'ai'));
    }
  }
}

export async function scaffoldProject(
  config: ProjectConfig,
  outputDir: string
): Promise<void> {
  const scaffolder = new ProjectScaffolder();
  const result = await scaffolder.create(config, outputDir);
  if (!result.success) {
    throw new Error(result.errors.join(', '));
  }
}
