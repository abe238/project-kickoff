/**
 * Fragment Merger
 * Merges multiple fragments into a unified project structure
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as ejs from 'ejs';
import type {
  TemplateFragment,
  GeneratorContext,
  PackageJsonFragment,
  EnvVarDefinition,
  GenerationPlan,
} from './types';

// Create generation plan from fragments
export function createGenerationPlan(
  fragments: TemplateFragment[],
  context: GeneratorContext
): GenerationPlan {
  const mergedPackageJson: PackageJsonFragment = {
    dependencies: {},
    devDependencies: {},
    scripts: {},
    peerDependencies: {},
  };

  const allEnvVars: EnvVarDefinition[] = [];
  const allPostInstallSteps: string[] = [];
  const conflicts: Array<{ fragmentA: string; fragmentB: string; reason: string }> = [];
  const seenEnvKeys = new Set<string>();

  for (const fragment of fragments) {
    // Merge package.json
    if (fragment.packageJson) {
      mergePackageJson(mergedPackageJson, fragment.packageJson);
    }

    // Collect env vars
    if (fragment.envVars) {
      for (const envVar of fragment.envVars) {
        if (!seenEnvKeys.has(envVar.key)) {
          allEnvVars.push(envVar);
          seenEnvKeys.add(envVar.key);
        }
      }
    }

    // Collect post-install steps
    if (fragment.postInstallSteps) {
      for (const step of fragment.postInstallSteps) {
        if (!allPostInstallSteps.includes(step)) {
          allPostInstallSteps.push(step);
        }
      }
    }

    // Check for incompatibilities
    for (const other of fragments) {
      if (other.id === fragment.id) continue;
      if (fragment.incompatibleWith?.includes(other.id)) {
        conflicts.push({
          fragmentA: fragment.id,
          fragmentB: other.id,
          reason: `${fragment.name} is incompatible with ${other.name}`,
        });
      }
    }
  }

  return {
    fragments,
    mergedPackageJson,
    allEnvVars,
    allPostInstallSteps,
    conflicts,
  };
}

// Merge package.json fragments
function mergePackageJson(
  target: PackageJsonFragment,
  source: PackageJsonFragment
): void {
  if (source.dependencies) {
    target.dependencies = { ...target.dependencies, ...source.dependencies };
  }
  if (source.devDependencies) {
    target.devDependencies = { ...target.devDependencies, ...source.devDependencies };
  }
  if (source.scripts) {
    target.scripts = { ...target.scripts, ...source.scripts };
  }
  if (source.peerDependencies) {
    target.peerDependencies = { ...target.peerDependencies, ...source.peerDependencies };
  }
}

// Generate merged package.json content
export function generatePackageJson(
  context: GeneratorContext,
  mergedPackageJson: PackageJsonFragment
): object {
  return {
    name: context.projectName,
    version: '0.1.0',
    private: true,
    description: context.metadata.description || `${context.projectName} project`,
    author: context.metadata.author || '',
    license: context.metadata.license || 'MIT',
    ...(Object.keys(mergedPackageJson.scripts || {}).length > 0 && {
      scripts: mergedPackageJson.scripts,
    }),
    ...(Object.keys(mergedPackageJson.dependencies || {}).length > 0 && {
      dependencies: sortObject(mergedPackageJson.dependencies || {}),
    }),
    ...(Object.keys(mergedPackageJson.devDependencies || {}).length > 0 && {
      devDependencies: sortObject(mergedPackageJson.devDependencies || {}),
    }),
    ...(Object.keys(mergedPackageJson.peerDependencies || {}).length > 0 && {
      peerDependencies: sortObject(mergedPackageJson.peerDependencies || {}),
    }),
  };
}

// Generate .env.example content
export function generateEnvExample(envVars: EnvVarDefinition[]): string {
  const lines: string[] = ['# Environment Variables', ''];

  const requiredVars = envVars.filter(v => v.required);
  const optionalVars = envVars.filter(v => !v.required);

  if (requiredVars.length > 0) {
    lines.push('# Required');
    for (const envVar of requiredVars) {
      lines.push(`# ${envVar.description}`);
      lines.push(`${envVar.key}=${envVar.defaultValue || ''}`);
      lines.push('');
    }
  }

  if (optionalVars.length > 0) {
    lines.push('# Optional');
    for (const envVar of optionalVars) {
      lines.push(`# ${envVar.description}`);
      lines.push(`# ${envVar.key}=${envVar.defaultValue || ''}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// Render a template file
export async function renderTemplate(
  templatePath: string,
  context: GeneratorContext
): Promise<string> {
  const template = await fs.readFile(templatePath, 'utf-8');
  return ejs.render(template, context, {
    filename: templatePath,
  });
}

// Write generated files to output directory
export async function writeGeneratedFiles(
  plan: GenerationPlan,
  context: GeneratorContext,
  outputDir: string,
  templatesDir: string
): Promise<string[]> {
  const filesCreated: string[] = [];

  // Ensure output directory exists
  await fs.ensureDir(outputDir);

  // Process each fragment
  for (const fragment of plan.fragments) {
    const fragmentTemplatePath = path.join(templatesDir, fragment.path);

    for (const file of fragment.files) {
      // Check condition
      if (file.condition && !file.condition(context)) {
        continue;
      }

      const sourcePath = path.join(fragmentTemplatePath, file.source);
      const destPath = path.join(outputDir, file.destination);

      // Skip if source doesn't exist
      if (!await fs.pathExists(sourcePath)) {
        continue;
      }

      // Ensure destination directory exists
      await fs.ensureDir(path.dirname(destPath));

      // Render and write file
      try {
        const content = await renderTemplate(sourcePath, context);
        await fs.writeFile(destPath, content);
        filesCreated.push(file.destination);
      } catch (error) {
        console.error(`Error processing ${sourcePath}:`, error);
      }
    }
  }

  // Write merged package.json (if we have dependencies/scripts)
  const packageJsonPath = path.join(outputDir, 'package.json');
  const hasPackageJson = plan.mergedPackageJson.dependencies &&
    Object.keys(plan.mergedPackageJson.dependencies).length > 0 ||
    plan.mergedPackageJson.scripts &&
    Object.keys(plan.mergedPackageJson.scripts).length > 0;

  if (hasPackageJson && !filesCreated.includes('package.json')) {
    const packageJson = generatePackageJson(context, plan.mergedPackageJson);
    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
    filesCreated.push('package.json');
  }

  // Write merged .env.example
  if (plan.allEnvVars.length > 0 && !filesCreated.includes('.env.example')) {
    const envExamplePath = path.join(outputDir, '.env.example');
    const envContent = generateEnvExample(plan.allEnvVars);
    await fs.writeFile(envExamplePath, envContent);
    filesCreated.push('.env.example');
  }

  return filesCreated;
}

// Sort object keys alphabetically
function sortObject(obj: Record<string, string>): Record<string, string> {
  return Object.keys(obj)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = obj[key];
      return sorted;
    }, {} as Record<string, string>);
}
