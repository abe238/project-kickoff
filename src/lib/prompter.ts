import inquirer from 'inquirer';
import type { ProjectConfig, ProjectType, ComplexityTrack } from './types.js';

function validateProjectName(input: string): boolean | string {
  if (!input) return 'Project name is required';
  if (!/^[a-z0-9-]+$/.test(input)) {
    return 'Project name must be lowercase with hyphens only (e.g., my-project)';
  }
  if (input.length > 50) return 'Project name must be 50 characters or less';
  return true;
}

function generateRandomPort(): number {
  return Math.floor(Math.random() * (9000 - 3000 + 1)) + 3000;
}

function isFrontend(type: ProjectType): boolean {
  return type === 'nextjs' || type === 'vite-react';
}

function needsPortQuestion(type: ProjectType): boolean {
  return type !== 'cli';
}

function canHaveDatabase(type: ProjectType): boolean {
  return type === 'nextjs' || type === 'api';
}

function canHaveAuth(type: ProjectType): boolean {
  return type === 'nextjs' || type === 'api';
}

export async function promptProjectConfig(): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'complexityTrack',
      message: 'Project complexity:',
      choices: [
        { name: 'Quick - Clear scope, single feature, internal tool', value: 'quick' },
        { name: 'Standard - Product/platform, multiple features', value: 'standard' },
        { name: 'Production - Compliance, multi-tenant, security-critical', value: 'production' },
      ],
      default: 'standard',
    },
    {
      type: 'input',
      name: 'name',
      message: 'Project name (kebab-case):',
      validate: validateProjectName,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A new project scaffolded with kickoff',
    },
    {
      type: 'list',
      name: 'type',
      message: 'Project type:',
      choices: [
        { name: 'Next.js (Full-stack React with App Router)', value: 'nextjs' },
        { name: 'Vite + React (SPA Frontend)', value: 'vite-react' },
        { name: 'Node.js API (Express backend)', value: 'api' },
        { name: 'CLI Tool (Command-line application)', value: 'cli' },
        { name: 'Static Site (HTML/CSS/JS)', value: 'static' },
      ],
    },
    {
      type: 'number',
      name: 'port',
      message: 'Development port:',
      default: generateRandomPort(),
      validate: (input: number) => {
        if (input < 1024 || input > 65535) {
          return 'Port must be between 1024 and 65535';
        }
        return true;
      },
      when: (answers) => needsPortQuestion(answers.type),
    },
    // CLI-specific questions
    {
      type: 'confirm',
      name: 'cliInteractive',
      message: 'Include interactive prompts (inquirer)?',
      default: true,
      when: (answers) => answers.type === 'cli',
    },
    {
      type: 'confirm',
      name: 'cliConfigFile',
      message: 'Support config file (~/.projectrc)?',
      default: false,
      when: (answers) => answers.type === 'cli',
    },
    {
      type: 'confirm',
      name: 'cliShellCompletion',
      message: 'Generate shell completions (bash/zsh)?',
      default: false,
      when: (answers) => answers.type === 'cli',
    },
    // Database questions (not for CLI, static, or quick track frontend)
    {
      type: 'confirm',
      name: 'needsDatabase',
      message: 'Need database?',
      default: (answers: { type: ProjectType }) => canHaveDatabase(answers.type),
      when: (answers) => canHaveDatabase(answers.type),
    },
    {
      type: 'list',
      name: 'databaseType',
      message: 'Database type:',
      choices: [
        { name: 'PostgreSQL (Production recommended)', value: 'postgres' },
        { name: 'SQLite (Development/Simple projects)', value: 'sqlite' },
      ],
      when: (answers) => answers.needsDatabase,
    },
    // Auth question (not for CLI, static, vite-react, or quick track)
    {
      type: 'confirm',
      name: 'needsAuth',
      message: 'Need authentication?',
      default: false,
      when: (answers) => canHaveAuth(answers.type) && answers.complexityTrack !== 'quick',
    },
    // Domain question (not for CLI or quick track)
    {
      type: 'input',
      name: 'domain',
      message: 'Production domain (leave empty for local only):',
      default: '',
      when: (answers) => answers.type !== 'cli' && answers.complexityTrack !== 'quick',
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: 'GitHub username:',
      default: 'abe238',
    },
    // Design system (only for frontend projects, not quick track)
    {
      type: 'confirm',
      name: 'useDesignSystem',
      message: 'Include Gemini-style design system?',
      default: true,
      when: (answers) => isFrontend(answers.type) && answers.complexityTrack !== 'quick',
    },
  ]);

  // Set defaults for skipped questions
  const config: ProjectConfig = {
    complexityTrack: answers.complexityTrack,
    name: answers.name,
    description: answers.description,
    type: answers.type,
    port: answers.port ?? 0,
    needsDatabase: answers.needsDatabase ?? false,
    databaseType: answers.databaseType,
    needsAuth: answers.needsAuth ?? false,
    domain: answers.domain ?? '',
    githubUsername: answers.githubUsername,
    useDesignSystem: answers.useDesignSystem ?? false,
    cliInteractive: answers.cliInteractive,
    cliConfigFile: answers.cliConfigFile,
    cliShellCompletion: answers.cliShellCompletion,
  };

  return config;
}
