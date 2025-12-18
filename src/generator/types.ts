/**
 * Generator Types
 * Interfaces for composable template fragments and generation context
 */

import type { StackOption, Runtime, ProjectType } from '../knowledge/types';

// Fragment categories
export type FragmentCategory =
  | 'base'
  | 'runtime'
  | 'frontend'
  | 'backend'
  | 'database'
  | 'orm'
  | 'auth'
  | 'ai'
  | 'deployment'
  | 'tooling';

// File mapping within a fragment
export interface FragmentFile {
  source: string;
  destination: string;
  condition?: (context: GeneratorContext) => boolean;
}

// Package.json modifications
export interface PackageJsonFragment {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

// Environment variable definition
export interface EnvVarDefinition {
  key: string;
  defaultValue?: string;
  description: string;
  required: boolean;
  secret?: boolean;
}

// Template fragment definition
export interface TemplateFragment {
  id: string;
  name: string;
  category: FragmentCategory;
  path: string;
  description: string;
  dependencies?: string[];
  incompatibleWith?: string[];
  files: FragmentFile[];
  packageJson?: PackageJsonFragment;
  envVars?: EnvVarDefinition[];
  postInstallSteps?: string[];
  documentationUrl?: string;
}

// Generation context passed to templates
export interface GeneratorContext {
  projectName: string;
  projectType: ProjectType;
  runtime: Runtime;
  selections: Record<string, string>;
  options: Record<string, StackOption | undefined>;
  features: {
    docker: boolean;
    githubActions: boolean;
    tests: boolean;
    linting: boolean;
  };
  metadata: {
    author?: string;
    description?: string;
    repository?: string;
    license?: string;
  };
}

// Fragment registry for looking up fragments
export interface FragmentRegistry {
  fragments: Map<string, TemplateFragment>;
  getById(id: string): TemplateFragment | undefined;
  getByCategory(category: FragmentCategory): TemplateFragment[];
  getCompatible(fragmentId: string): TemplateFragment[];
}

// Generation plan - ordered list of fragments to apply
export interface GenerationPlan {
  fragments: TemplateFragment[];
  mergedPackageJson: PackageJsonFragment;
  allEnvVars: EnvVarDefinition[];
  allPostInstallSteps: string[];
  conflicts: Array<{ fragmentA: string; fragmentB: string; reason: string }>;
}

// Generation result
export interface GenerationResult {
  success: boolean;
  outputPath: string;
  filesCreated: string[];
  warnings: string[];
  errors: string[];
  nextSteps: string[];
}

// Template merge strategy
export type MergeStrategy = 'replace' | 'merge' | 'append' | 'skip';

// File generation options
export interface FileGenerationOptions {
  overwrite: boolean;
  dryRun: boolean;
  verbose: boolean;
}

// Fragment loader interface
export interface FragmentLoader {
  loadFragment(id: string): Promise<TemplateFragment>;
  loadAllFragments(): Promise<TemplateFragment[]>;
  validateFragment(fragment: TemplateFragment): boolean;
}

// Template engine interface
export interface TemplateEngine {
  render(templatePath: string, context: GeneratorContext): Promise<string>;
  renderString(template: string, context: GeneratorContext): string;
}

// Fragment selection from questionnaire answers
export interface FragmentSelection {
  fragmentId: string;
  category: FragmentCategory;
  reason: string;
}

// Map questionnaire answers to fragments
export function selectFragmentsFromAnswers(
  answers: Record<string, unknown>,
  registry: FragmentRegistry
): FragmentSelection[] {
  const selections: FragmentSelection[] = [];

  // Always include base fragment
  selections.push({
    fragmentId: 'base',
    category: 'base',
    reason: 'Core project files',
  });

  // Map specific answers to fragments
  const answerToFragmentMap: Record<string, { category: FragmentCategory; reason: string }> = {
    frontend: { category: 'frontend', reason: 'Frontend framework' },
    backend: { category: 'backend', reason: 'Backend framework' },
    database: { category: 'database', reason: 'Database provider' },
    orm: { category: 'orm', reason: 'ORM/Query builder' },
    auth: { category: 'auth', reason: 'Authentication provider' },
    ai: { category: 'ai', reason: 'AI framework' },
  };

  for (const [answerKey, config] of Object.entries(answerToFragmentMap)) {
    const value = answers[answerKey];
    if (value && typeof value === 'string' && value !== 'none') {
      const fragment = registry.getById(value);
      if (fragment) {
        selections.push({
          fragmentId: value,
          category: config.category,
          reason: config.reason,
        });
      }
    }
  }

  // Add deployment fragments based on feature flags
  if (answers.includeDocker) {
    selections.push({
      fragmentId: 'docker',
      category: 'deployment',
      reason: 'Docker containerization',
    });
  }

  if (answers.includeGithubActions) {
    selections.push({
      fragmentId: 'github-actions',
      category: 'deployment',
      reason: 'CI/CD pipeline',
    });
  }

  return selections;
}
