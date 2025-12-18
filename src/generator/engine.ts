/**
 * Template Generation Engine
 * Main orchestration for project generation
 */

import * as path from 'path';
import * as fs from 'fs-extra';
import type { GeneratorContext, GenerationResult, TemplateFragment } from './types';
import { collectFragments } from './collector';
import { resolveFragmentOrder, validateFragmentDependencies, createFragmentRegistry } from './registry';
import { createGenerationPlan, writeGeneratedFiles } from './merger';
import { allFragments } from './fragments';

// Get templates directory path
function getTemplatesDir(): string {
  // In development, use src/templates
  // In production (dist), templates are copied to dist/templates
  const srcPath = path.join(__dirname, '..', 'templates');
  const distPath = path.join(__dirname, 'templates');

  if (fs.existsSync(srcPath)) {
    return srcPath;
  }
  return distPath;
}

// Generate a project from context
export async function generateProject(
  context: GeneratorContext,
  outputDir: string
): Promise<GenerationResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  try {
    // 1. Collect fragments based on selections
    const fragments = collectFragments(context);

    // 2. Create registry and validate
    const registry = createFragmentRegistry(allFragments);
    const validation = validateFragmentDependencies(fragments, registry);

    if (!validation.valid) {
      warnings.push(...validation.missingDeps);
      warnings.push(...validation.conflicts);
    }

    // 3. Resolve fragment order
    let orderedFragments: TemplateFragment[];
    try {
      orderedFragments = resolveFragmentOrder(fragments);
    } catch (error) {
      errors.push(`Dependency resolution error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      orderedFragments = fragments;
    }

    // 4. Create generation plan
    const plan = createGenerationPlan(orderedFragments, context);

    if (plan.conflicts.length > 0) {
      for (const conflict of plan.conflicts) {
        warnings.push(conflict.reason);
      }
    }

    // 5. Ensure output directory exists and is empty or doesn't exist
    const outputPath = path.resolve(outputDir);
    if (await fs.pathExists(outputPath)) {
      const files = await fs.readdir(outputPath);
      if (files.length > 0) {
        warnings.push(`Output directory ${outputPath} is not empty`);
      }
    }
    await fs.ensureDir(outputPath);

    // 6. Generate files
    const templatesDir = getTemplatesDir();
    const filesCreated = await writeGeneratedFiles(plan, context, outputPath, templatesDir);

    // 7. Determine next steps
    const nextSteps = generateNextSteps(context, plan);

    return {
      success: errors.length === 0,
      outputPath,
      filesCreated,
      warnings,
      errors,
      nextSteps,
    };
  } catch (error) {
    return {
      success: false,
      outputPath: outputDir,
      filesCreated: [],
      warnings,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      nextSteps: [],
    };
  }
}

// Generate next steps based on what was created
function generateNextSteps(
  context: GeneratorContext,
  plan: ReturnType<typeof createGenerationPlan>
): string[] {
  const steps: string[] = [];

  steps.push(`cd ${context.projectName}`);

  // Check if we have a package.json with dependencies
  const hasNodeDeps = plan.mergedPackageJson.dependencies &&
    Object.keys(plan.mergedPackageJson.dependencies).length > 0 ||
    plan.mergedPackageJson.devDependencies &&
    Object.keys(plan.mergedPackageJson.devDependencies).length > 0;

  if (hasNodeDeps) {
    steps.push('npm install');
  }

  // Check for env vars that need configuration
  const requiredEnvVars = plan.allEnvVars.filter(v => v.required);
  if (requiredEnvVars.length > 0) {
    steps.push('cp .env.example .env');
    steps.push('# Configure required environment variables in .env');
  }

  // Add dev command if available
  if (plan.mergedPackageJson.scripts?.dev) {
    steps.push('npm run dev');
  } else if (plan.mergedPackageJson.scripts?.start) {
    steps.push('npm start');
  }

  // Add fragment-specific steps
  for (const fragment of plan.fragments) {
    if (fragment.postInstallSteps) {
      for (const step of fragment.postInstallSteps) {
        if (!steps.includes(step) && !step.includes('npm install')) {
          steps.push(`# ${fragment.name}: ${step}`);
        }
      }
    }
  }

  return steps;
}

// Quick generate with minimal configuration
export async function quickGenerate(
  projectName: string,
  templateId: string,
  outputDir?: string
): Promise<GenerationResult> {
  const context: GeneratorContext = {
    projectName,
    projectType: 'web-app',
    runtime: 'node',
    selections: {
      frontend: templateId,
    },
    options: {},
    features: {
      docker: true,
      githubActions: false,
      tests: false,
      linting: true,
    },
    metadata: {},
  };

  const output = outputDir || path.join(process.cwd(), projectName);
  return generateProject(context, output);
}

// Validate context before generation
export function validateContext(context: GeneratorContext): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!context.projectName) {
    errors.push('Project name is required');
  } else if (!/^[a-z0-9-_]+$/i.test(context.projectName)) {
    errors.push('Project name must only contain letters, numbers, hyphens, and underscores');
  }

  if (!context.projectType) {
    errors.push('Project type is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
