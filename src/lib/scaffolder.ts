import fs from 'fs-extra';
import path from 'path';
import ejs from 'ejs';
import { fileURLToPath } from 'url';
import type { ProjectConfig, TemplateContext } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-');
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toSnakeCase(str: string): string {
  return str.toLowerCase().replace(/-/g, '_').replace(/\s+/g, '_');
}

function buildContext(config: ProjectConfig): TemplateContext {
  // Database provider categories
  const postgresProviders = ['postgres-local', 'supabase', 'neon', 'cockroachdb'];
  const mysqlProviders = ['mysql-local', 'planetscale'];
  const mongoProviders = ['mongodb-local'];
  const baasProviders = ['supabase', 'convex', 'pocketbase', 'firebase'];

  // Docker requirements
  const dockerVectorDBs = ['qdrant', 'chroma', 'weaviate', 'milvus'];
  const dockerLocalAI = ['ollama', 'vllm', 'localai', 'tgi'];
  const dockerDatabases = ['postgres-local', 'mysql-local', 'mongodb-local'];

  // GPU requirements
  const gpuLocalAI = ['vllm', 'text-gen-webui', 'tgi'];
  const gpuEmbeddings = ['huggingface'];

  // MLX (Apple Silicon)
  const mlxProviders = ['mlx', 'mlx-lm'];

  // Language detection based on project type
  const pythonTypes = ['fastapi', 'litestar'];
  const goTypes = ['gin-api', 'fiber-api', 'echo-api'];
  const rustTypes = ['axum-api', 'actix-api'];
  const denoTypes = ['fresh-api'];
  const tsTypes = ['nextjs', 'tanstack-start', 'vite-react', 'hono-api', 'elysia-api', 'express-api', 'cli', 'mcp-server', 'library', 'worker'];

  // Determine simplified database type for templates
  const getDatabaseType = (): string => {
    if (postgresProviders.includes(config.databaseProvider)) return 'postgres';
    if (mysqlProviders.includes(config.databaseProvider)) return 'mysql';
    if (mongoProviders.includes(config.databaseProvider)) return 'mongo';
    if (['sqlite', 'turso', 'd1'].includes(config.databaseProvider)) return 'sqlite';
    if (baasProviders.includes(config.databaseProvider)) return 'baas';
    return 'none';
  };

  return {
    ...config,
    // Name transformations
    nameKebab: toKebabCase(config.name),
    namePascal: toPascalCase(config.name),
    nameCamel: toCamelCase(config.name),
    nameSnake: toSnakeCase(config.name),
    year: new Date().getFullYear(),
    timestamp: new Date().toISOString().split('T')[0],
    // Computed helpers - Database
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
    // Computed helpers - AI/ML
    hasAI: config.aiFramework !== 'none',
    hasVectorDB: config.vectorDB !== 'none',
    hasEmbeddings: config.embeddingProvider !== 'none',
    hasLocalAI: config.localAI !== 'none',
    needsGPU:
      gpuLocalAI.includes(config.localAI) ||
      gpuEmbeddings.includes(config.embeddingProvider),
    isRAGApp: config.vectorDB !== 'none' && config.embeddingProvider !== 'none',
    usesMLX: mlxProviders.includes(config.localAI),
    // Computed helpers - Auth
    needsAuth: config.authProvider !== 'none',
    // Computed helpers - Language/Runtime
    isTypeScript: tsTypes.includes(config.type),
    isPython: pythonTypes.includes(config.type),
    isGo: goTypes.includes(config.type),
    isRust: rustTypes.includes(config.type),
    isDeno: denoTypes.includes(config.type),
  };
}

async function renderTemplate(
  templatePath: string,
  context: TemplateContext
): Promise<string> {
  const template = await fs.readFile(templatePath, 'utf-8');
  return ejs.render(template, context, { async: false });
}

async function copyAndRenderTemplates(
  srcDir: string,
  destDir: string,
  context: TemplateContext
): Promise<void> {
  const entries = await fs.readdir(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    let destName = entry.name.replace(/\.ejs$/, '');

    // Handle special filename replacements
    destName = destName.replace('__name__', context.nameKebab);

    const destPath = path.join(destDir, destName);

    if (entry.isDirectory()) {
      await fs.ensureDir(destPath);
      await copyAndRenderTemplates(srcPath, destPath, context);
    } else if (entry.name.endsWith('.ejs')) {
      const content = await renderTemplate(srcPath, context);
      await fs.writeFile(destPath, content);
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}

export async function scaffoldProject(
  config: ProjectConfig,
  outputDir: string
): Promise<void> {
  const context = buildContext(config);
  const projectDir = path.join(outputDir, config.name);

  // Create project directory
  await fs.ensureDir(projectDir);

  // Get templates directory (relative to compiled output)
  const templatesDir = path.join(__dirname, '..', 'templates');

  // Copy shared templates first
  const sharedDir = path.join(templatesDir, 'shared');
  if (await fs.pathExists(sharedDir)) {
    await copyAndRenderTemplates(sharedDir, projectDir, context);
  }

  // Copy project-type specific templates
  const typeDir = path.join(templatesDir, config.type);
  if (await fs.pathExists(typeDir)) {
    await copyAndRenderTemplates(typeDir, projectDir, context);
  }

  // Create additional directories based on config
  // Only web/api projects need database or auth directories
  const toolTypes = ['cli', 'mcp-server', 'library', 'static'];
  const hasDatabase = config.databaseProvider !== 'none';
  const hasAuth = config.authProvider !== 'none';
  const needsDbDir = hasDatabase && config.orm === 'prisma' && !toolTypes.includes(config.type);
  const needsAuthDir = hasAuth && !toolTypes.includes(config.type);
  const needsAIDir = context.hasAI && !toolTypes.includes(config.type);

  if (needsDbDir) {
    await fs.ensureDir(path.join(projectDir, 'prisma'));
  }

  if (needsAuthDir) {
    await fs.ensureDir(path.join(projectDir, 'src', 'lib', 'auth'));
  }

  if (needsAIDir) {
    await fs.ensureDir(path.join(projectDir, 'src', 'lib', 'ai'));
  }
}

export { buildContext };
