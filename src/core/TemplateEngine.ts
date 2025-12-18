import fs from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';

export interface TemplateContext {
  projectName: string;
  description?: string | undefined;
  author?: string | undefined;
  license?: string | undefined;
  year?: number | undefined;
  packageManager?: string | undefined;
  [key: string]: unknown;
}

export interface ProcessedTemplate {
  content: string;
  sourceFile?: string | undefined;
}

export interface TemplateLoadOptions {
  encoding?: BufferEncoding | undefined;
  throwOnMissing?: boolean | undefined;
}

export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
  variables: string[];
}

export interface TemplateFileInfo {
  path: string;
  relativePath: string;
  isDirectory: boolean;
  processedName?: string | undefined;
}

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.bmp', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.otf',
  '.pdf', '.zip', '.tar', '.gz', '.rar',
  '.mp3', '.mp4', '.wav', '.avi', '.mov',
  '.exe', '.dll', '.so', '.dylib'
]);

export class TemplateEngine {
  private handlebars: typeof Handlebars;
  private compiledTemplates: Map<string, Handlebars.TemplateDelegate> = new Map();

  constructor() {
    this.handlebars = Handlebars.create();
    this.registerBuiltinHelpers();
  }

  async loadTemplate(
    filePath: string,
    options: TemplateLoadOptions = {}
  ): Promise<string> {
    const { encoding = 'utf-8', throwOnMissing = true } = options;

    const exists = await fs.pathExists(filePath);
    if (!exists) {
      if (throwOnMissing) {
        throw new Error(`Template file not found: ${filePath}`);
      }
      return '';
    }

    const content = await fs.readFile(filePath, encoding);
    return content;
  }

  async loadTemplatesFromDirectory(
    directoryPath: string,
    options: TemplateLoadOptions = {}
  ): Promise<Map<string, string>> {
    const templates = new Map<string, string>();

    const exists = await fs.pathExists(directoryPath);
    if (!exists) {
      throw new Error(`Template directory not found: ${directoryPath}`);
    }

    const files = await this.getTemplateFiles(directoryPath);

    for (const fileInfo of files) {
      if (!fileInfo.isDirectory) {
        const content = await this.loadTemplate(fileInfo.path, options);
        templates.set(fileInfo.relativePath, content);
      }
    }

    return templates;
  }

  async getTemplateFiles(directoryPath: string): Promise<TemplateFileInfo[]> {
    const files: TemplateFileInfo[] = [];

    const traverse = async (currentPath: string, basePath: string): Promise<void> => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        const relativePath = path.relative(basePath, fullPath);

        files.push({
          path: fullPath,
          relativePath,
          isDirectory: entry.isDirectory()
        });

        if (entry.isDirectory()) {
          await traverse(fullPath, basePath);
        }
      }
    };

    await traverse(directoryPath, directoryPath);
    return files;
  }

  parse(templateString: string, cacheKey?: string | undefined): Handlebars.TemplateDelegate {
    if (cacheKey) {
      const cached = this.compiledTemplates.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    const compiled = this.handlebars.compile(templateString, { noEscape: true });

    if (cacheKey) {
      this.compiledTemplates.set(cacheKey, compiled);
    }

    return compiled;
  }

  process(templateString: string, context: TemplateContext): string {
    try {
      const compiled = this.parse(templateString);
      return compiled(context);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Template processing failed: ${errorMessage}`);
    }
  }

  processSafe(templateString: string, context: TemplateContext): ProcessedTemplate {
    try {
      const content = this.process(templateString, context);
      return { content };
    } catch {
      return { content: templateString };
    }
  }

  async processFile(
    filePath: string,
    context: TemplateContext,
    options: TemplateLoadOptions = {}
  ): Promise<ProcessedTemplate> {
    const templateString = await this.loadTemplate(filePath, options);
    const content = this.process(templateString, context);
    return { content, sourceFile: filePath };
  }

  async processFileSafe(
    filePath: string,
    context: TemplateContext,
    options: TemplateLoadOptions = {}
  ): Promise<ProcessedTemplate> {
    try {
      return await this.processFile(filePath, context, options);
    } catch {
      const templateString = await this.loadTemplate(filePath, { ...options, throwOnMissing: false });
      return { content: templateString, sourceFile: filePath };
    }
  }

  processFileName(fileName: string, context: TemplateContext): string {
    return fileName
      .replace(/_dot_/g, '.')
      .replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        const value = context[key];
        return typeof value === 'string' ? value : String(value ?? key);
      });
  }

  isBinaryFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return BINARY_EXTENSIONS.has(ext);
  }

  async processSourceFile(
    srcPath: string,
    destPath: string,
    context: TemplateContext
  ): Promise<void> {
    if (this.isBinaryFile(srcPath)) {
      await fs.copy(srcPath, destPath);
    } else {
      const content = await this.loadTemplate(srcPath);
      const processedContent = this.process(content, context);
      await fs.writeFile(destPath, processedContent, 'utf-8');
    }
  }

  async processSourceFileSafe(
    srcPath: string,
    destPath: string,
    context: TemplateContext
  ): Promise<{ success: boolean; error?: string | undefined }> {
    try {
      await this.processSourceFile(srcPath, destPath, context);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      try {
        await fs.copy(srcPath, destPath);
        return { success: true, error: `Warning: ${errorMessage}` };
      } catch {
        return { success: false, error: errorMessage };
      }
    }
  }

  validate(templateString: string): TemplateValidationResult {
    const errors: string[] = [];
    const variables: string[] = [];

    const variablePattern = /\{\{([^}]+)\}\}/g;
    let match;
    while ((match = variablePattern.exec(templateString)) !== null) {
      const variable = match[1]?.trim();
      if (variable && !variable.startsWith('#') && !variable.startsWith('/') && !variable.startsWith('>')) {
        const parts = variable.split(/\s+/);
        const varName = parts.length > 1 ? parts[parts.length - 1] : variable;
        if (varName && !variables.includes(varName)) {
          variables.push(varName);
        }
      }
    }

    try {
      this.handlebars.compile(templateString);
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }

    const openBraces = (templateString.match(/\{\{/g) ?? []).length;
    const closeBraces = (templateString.match(/\}\}/g) ?? []).length;
    if (openBraces !== closeBraces) {
      errors.push(`Mismatched braces: ${openBraces} opening, ${closeBraces} closing`);
    }

    return {
      valid: errors.length === 0,
      errors,
      variables
    };
  }

  extractVariables(templateString: string): string[] {
    const result = this.validate(templateString);
    return result.variables;
  }

  registerHelper(name: string, fn: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, fn);
  }

  registerPartial(name: string, template: string): void {
    this.handlebars.registerPartial(name, template);
  }

  clearCache(): void {
    this.compiledTemplates.clear();
  }

  getHandlebarsInstance(): typeof Handlebars {
    return this.handlebars;
  }

  private registerBuiltinHelpers(): void {
    // kebab-case: MyProjectName -> my-project-name
    this.handlebars.registerHelper('kebab', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    });

    // PascalCase: my-project-name -> MyProjectName
    this.handlebars.registerHelper('pascal', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (_, c: string) => c.toUpperCase());
    });

    // camelCase: my-project-name -> myProjectName
    this.handlebars.registerHelper('camel', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
        .replace(/^(.)/, (_, c: string) => c.toLowerCase());
    });

    // snake_case: MyProjectName -> my_project_name
    this.handlebars.registerHelper('snake', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
    });

    // SCREAMING_SNAKE_CASE: myProjectName -> MY_PROJECT_NAME
    this.handlebars.registerHelper('screaming', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toUpperCase();
    });

    // Title Case: my-project-name -> My Project Name
    this.handlebars.registerHelper('title', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c: string) => c.toUpperCase());
    });

    this.handlebars.registerHelper('lower', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str.toLowerCase();
    });

    this.handlebars.registerHelper('upper', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str.toUpperCase();
    });

    this.handlebars.registerHelper('capitalize', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    this.handlebars.registerHelper('if_eq', function(this: unknown, a: unknown, b: unknown, opts: Handlebars.HelperOptions) {
      return a === b ? opts.fn(this) : opts.inverse(this);
    });

    this.handlebars.registerHelper('unless_eq', function(this: unknown, a: unknown, b: unknown, opts: Handlebars.HelperOptions) {
      return a !== b ? opts.fn(this) : opts.inverse(this);
    });

    this.handlebars.registerHelper('json', (context: unknown) => {
      return JSON.stringify(context, null, 2);
    });

    this.handlebars.registerHelper('json_compact', (context: unknown) => {
      return JSON.stringify(context);
    });

    this.handlebars.registerHelper('year', () => {
      return new Date().getFullYear();
    });

    this.handlebars.registerHelper('date', () => {
      return new Date().toISOString().split('T')[0];
    });

    this.handlebars.registerHelper('timestamp', () => {
      return new Date().toISOString();
    });

    this.handlebars.registerHelper('default', (value: unknown, defaultValue: unknown) => {
      return value ?? defaultValue;
    });

    this.handlebars.registerHelper('coalesce', (...args: unknown[]) => {
      args.pop(); // Remove options
      for (const arg of args) {
        if (arg) return arg;
      }
      return '';
    });

    this.handlebars.registerHelper('pluralize', (count: unknown, singular: string, plural: string) => {
      return count === 1 ? singular : plural;
    });

    this.handlebars.registerHelper('join', (arr: unknown, separator: unknown) => {
      if (!Array.isArray(arr)) return '';
      const sep = typeof separator === 'string' ? separator : ', ';
      return arr.join(sep);
    });

    this.handlebars.registerHelper('first', (arr: unknown) => {
      if (!Array.isArray(arr)) return '';
      return arr[0] ?? '';
    });

    this.handlebars.registerHelper('last', (arr: unknown) => {
      if (!Array.isArray(arr)) return '';
      return arr[arr.length - 1] ?? '';
    });

    this.handlebars.registerHelper('length', (arr: unknown) => {
      if (Array.isArray(arr)) return arr.length;
      if (typeof arr === 'string') return arr.length;
      return 0;
    });

    this.handlebars.registerHelper('contains', function(this: unknown, haystack: unknown, needle: unknown, opts: Handlebars.HelperOptions) {
      if (Array.isArray(haystack) && haystack.includes(needle)) {
        return opts.fn(this);
      }
      if (typeof haystack === 'string' && typeof needle === 'string' && haystack.includes(needle)) {
        return opts.fn(this);
      }
      return opts.inverse(this);
    });

    this.handlebars.registerHelper('gt', function(this: unknown, a: unknown, b: unknown, opts: Handlebars.HelperOptions) {
      return (a as number) > (b as number) ? opts.fn(this) : opts.inverse(this);
    });

    this.handlebars.registerHelper('lt', function(this: unknown, a: unknown, b: unknown, opts: Handlebars.HelperOptions) {
      return (a as number) < (b as number) ? opts.fn(this) : opts.inverse(this);
    });

    this.handlebars.registerHelper('and', function(this: unknown, ...args: unknown[]) {
      const opts = args.pop() as Handlebars.HelperOptions;
      const result = args.every(Boolean);
      return result ? opts.fn(this) : opts.inverse(this);
    });

    this.handlebars.registerHelper('or', function(this: unknown, ...args: unknown[]) {
      const opts = args.pop() as Handlebars.HelperOptions;
      const result = args.some(Boolean);
      return result ? opts.fn(this) : opts.inverse(this);
    });

    this.handlebars.registerHelper('not', function(this: unknown, value: unknown, opts: Handlebars.HelperOptions) {
      return !value ? opts.fn(this) : opts.inverse(this);
    });

    this.handlebars.registerHelper('trim', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str.trim();
    });

    this.handlebars.registerHelper('replace', (str: unknown, find: string, replace: string) => {
      if (typeof str !== 'string') return '';
      return str.replace(new RegExp(find, 'g'), replace);
    });

    this.handlebars.registerHelper('substring', (str: unknown, start: number, end?: number | Handlebars.HelperOptions) => {
      if (typeof str !== 'string') return '';
      if (typeof end === 'object') {
        return str.substring(start);
      }
      return str.substring(start, end);
    });

    this.handlebars.registerHelper('repeat', (str: unknown, count: number) => {
      if (typeof str !== 'string') return '';
      return str.repeat(Math.max(0, count));
    });

    this.handlebars.registerHelper('padStart', (str: unknown, length: number, char: string) => {
      if (typeof str !== 'string') return '';
      return str.padStart(length, char || ' ');
    });

    this.handlebars.registerHelper('padEnd', (str: unknown, length: number, char: string) => {
      if (typeof str !== 'string') return '';
      return str.padEnd(length, char || ' ');
    });

    this.handlebars.registerHelper('add', (a: number, b: number) => (a || 0) + (b || 0));
    this.handlebars.registerHelper('subtract', (a: number, b: number) => (a || 0) - (b || 0));
    this.handlebars.registerHelper('multiply', (a: number, b: number) => (a || 0) * (b || 0));
    this.handlebars.registerHelper('divide', (a: number, b: number) => b === 0 ? 0 : (a || 0) / b);
    this.handlebars.registerHelper('mod', (a: number, b: number) => b === 0 ? 0 : (a || 0) % b);

    this.handlebars.registerHelper('slug', (str: unknown) => {
      if (typeof str !== 'string') return '';
      return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    });
  }
}

export function createTemplateEngine(): TemplateEngine {
  return new TemplateEngine();
}
