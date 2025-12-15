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

function buildContext(config: ProjectConfig): TemplateContext {
  return {
    ...config,
    nameKebab: toKebabCase(config.name),
    namePascal: toPascalCase(config.name),
    nameCamel: toCamelCase(config.name),
    year: new Date().getFullYear(),
    timestamp: new Date().toISOString().split('T')[0],
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
  if (config.needsDatabase && config.type !== 'static') {
    await fs.ensureDir(path.join(projectDir, 'prisma'));
  }

  if (config.needsAuth && config.type !== 'static') {
    await fs.ensureDir(path.join(projectDir, 'src', 'lib', 'auth'));
  }
}

export { buildContext };
