import inquirer from 'inquirer';
import type { ProjectConfig, ProjectType, ComplexityTrack, Preset } from './types.js';

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
  return !['cli', 'mcp-server', 'library'].includes(type);
}

function canHaveDatabase(type: ProjectType): boolean {
  return type === 'nextjs' || type === 'api' || type === 'worker';
}

function canHaveAuth(type: ProjectType): boolean {
  return type === 'nextjs' || type === 'api';
}

function isServerless(type: ProjectType): boolean {
  return ['cli', 'mcp-server', 'library'].includes(type);
}

interface PresetConfig {
  type: ProjectType;
  complexityTrack: ComplexityTrack;
  needsDatabase?: boolean;
  databaseType?: 'postgres' | 'sqlite';
  needsAuth?: boolean;
  useDesignSystem?: boolean;
}

const PRESETS: Record<Exclude<Preset, 'none'>, PresetConfig> = {
  'saas-starter': {
    type: 'nextjs',
    complexityTrack: 'production',
    needsDatabase: true,
    databaseType: 'postgres',
    needsAuth: true,
    useDesignSystem: true,
  },
  'api-microservice': {
    type: 'api',
    complexityTrack: 'standard',
    needsDatabase: true,
    databaseType: 'postgres',
    needsAuth: false,
  },
  'quick-cli': {
    type: 'cli',
    complexityTrack: 'quick',
  },
  'landing-page': {
    type: 'static',
    complexityTrack: 'quick',
  },
  'mcp-tool': {
    type: 'mcp-server',
    complexityTrack: 'quick',
  },
};

export async function promptProjectConfig(): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'preset',
      message: 'Start with a preset or custom?',
      choices: [
        { name: 'Custom - Configure everything', value: 'none' },
        new inquirer.Separator('── Presets ──'),
        { name: 'SaaS Starter - Next.js + Postgres + Auth', value: 'saas-starter' },
        { name: 'API Microservice - Express + Postgres', value: 'api-microservice' },
        { name: 'Quick CLI - Command-line tool', value: 'quick-cli' },
        { name: 'Landing Page - Static site', value: 'landing-page' },
        { name: 'MCP Tool - AI tool server', value: 'mcp-tool' },
      ],
      default: 'none',
    },
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
      when: (answers) => answers.preset === 'none',
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
        new inquirer.Separator('── Web ──'),
        { name: 'Next.js (Full-stack React with App Router)', value: 'nextjs' },
        { name: 'Vite + React (SPA Frontend)', value: 'vite-react' },
        { name: 'Static Site (HTML/CSS/JS)', value: 'static' },
        new inquirer.Separator('── Backend ──'),
        { name: 'Node.js API (Express backend)', value: 'api' },
        { name: 'Worker (Background jobs with BullMQ)', value: 'worker' },
        new inquirer.Separator('── Tools ──'),
        { name: 'CLI Tool (Command-line application)', value: 'cli' },
        { name: 'MCP Server (AI tool integration)', value: 'mcp-server' },
        { name: 'Library (npm package)', value: 'library' },
      ],
      when: (answers) => answers.preset === 'none',
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
      when: (answers) => {
        const type = answers.preset !== 'none' ? PRESETS[answers.preset as Exclude<Preset, 'none'>].type : answers.type;
        return needsPortQuestion(type);
      },
    },
    // CLI-specific questions
    {
      type: 'confirm',
      name: 'cliInteractive',
      message: 'Include interactive prompts (inquirer)?',
      default: true,
      when: (answers) => {
        const type = answers.preset !== 'none' ? PRESETS[answers.preset as Exclude<Preset, 'none'>].type : answers.type;
        return type === 'cli';
      },
    },
    {
      type: 'confirm',
      name: 'cliConfigFile',
      message: 'Support config file (~/.projectrc)?',
      default: false,
      when: (answers) => {
        const type = answers.preset !== 'none' ? PRESETS[answers.preset as Exclude<Preset, 'none'>].type : answers.type;
        return type === 'cli';
      },
    },
    {
      type: 'confirm',
      name: 'cliShellCompletion',
      message: 'Generate shell completions (bash/zsh)?',
      default: false,
      when: (answers) => {
        const type = answers.preset !== 'none' ? PRESETS[answers.preset as Exclude<Preset, 'none'>].type : answers.type;
        return type === 'cli';
      },
    },
    // MCP-specific questions
    {
      type: 'list',
      name: 'mcpTransport',
      message: 'MCP transport type:',
      choices: [
        { name: 'stdio (Standard I/O - recommended)', value: 'stdio' },
        { name: 'SSE (Server-Sent Events - for web)', value: 'sse' },
      ],
      default: 'stdio',
      when: (answers) => {
        const type = answers.preset !== 'none' ? PRESETS[answers.preset as Exclude<Preset, 'none'>].type : answers.type;
        return type === 'mcp-server';
      },
    },
    // Library-specific questions
    {
      type: 'list',
      name: 'libraryTestFramework',
      message: 'Test framework:',
      choices: [
        { name: 'Vitest (Fast, modern)', value: 'vitest' },
        { name: 'Jest (Battle-tested)', value: 'jest' },
      ],
      default: 'vitest',
      when: (answers) => {
        const type = answers.preset !== 'none' ? PRESETS[answers.preset as Exclude<Preset, 'none'>].type : answers.type;
        return type === 'library';
      },
    },
    // Database questions
    {
      type: 'confirm',
      name: 'needsDatabase',
      message: 'Need database?',
      default: (answers: { type: ProjectType; preset: Preset }) => {
        if (answers.preset !== 'none') {
          return PRESETS[answers.preset as Exclude<Preset, 'none'>].needsDatabase ?? false;
        }
        return canHaveDatabase(answers.type);
      },
      when: (answers) => {
        if (answers.preset !== 'none') return false;
        return canHaveDatabase(answers.type);
      },
    },
    {
      type: 'list',
      name: 'databaseType',
      message: 'Database type:',
      choices: [
        { name: 'PostgreSQL (Production recommended)', value: 'postgres' },
        { name: 'SQLite (Development/Simple projects)', value: 'sqlite' },
      ],
      when: (answers) => answers.preset === 'none' && answers.needsDatabase,
    },
    // Auth question
    {
      type: 'confirm',
      name: 'needsAuth',
      message: 'Need authentication?',
      default: false,
      when: (answers) => {
        if (answers.preset !== 'none') return false;
        const type = answers.type;
        const track = answers.complexityTrack;
        return canHaveAuth(type) && track !== 'quick';
      },
    },
    // Domain question
    {
      type: 'input',
      name: 'domain',
      message: 'Production domain (leave empty for local only):',
      default: '',
      when: (answers) => {
        if (answers.preset !== 'none') {
          const preset = PRESETS[answers.preset as Exclude<Preset, 'none'>];
          return preset.complexityTrack !== 'quick' && !isServerless(preset.type);
        }
        return answers.complexityTrack !== 'quick' && !isServerless(answers.type);
      },
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: 'GitHub username:',
      default: 'abe238',
    },
    // Design system
    {
      type: 'confirm',
      name: 'useDesignSystem',
      message: 'Include Gemini-style design system?',
      default: true,
      when: (answers) => {
        if (answers.preset !== 'none') return false;
        return isFrontend(answers.type) && answers.complexityTrack !== 'quick';
      },
    },
  ]);

  // Apply preset defaults
  let presetDefaults: Partial<ProjectConfig> = {};
  if (answers.preset !== 'none') {
    const preset = PRESETS[answers.preset as Exclude<Preset, 'none'>];
    presetDefaults = {
      type: preset.type,
      complexityTrack: preset.complexityTrack,
      needsDatabase: preset.needsDatabase ?? false,
      databaseType: preset.databaseType,
      needsAuth: preset.needsAuth ?? false,
      useDesignSystem: preset.useDesignSystem ?? false,
    };
  }

  const config: ProjectConfig = {
    preset: answers.preset,
    complexityTrack: presetDefaults.complexityTrack ?? answers.complexityTrack ?? 'standard',
    name: answers.name,
    description: answers.description,
    type: presetDefaults.type ?? answers.type,
    port: answers.port ?? 0,
    needsDatabase: presetDefaults.needsDatabase ?? answers.needsDatabase ?? false,
    databaseType: presetDefaults.databaseType ?? answers.databaseType,
    needsAuth: presetDefaults.needsAuth ?? answers.needsAuth ?? false,
    domain: answers.domain ?? '',
    githubUsername: answers.githubUsername,
    useDesignSystem: presetDefaults.useDesignSystem ?? answers.useDesignSystem ?? false,
    cliInteractive: answers.cliInteractive,
    cliConfigFile: answers.cliConfigFile,
    cliShellCompletion: answers.cliShellCompletion,
    mcpTransport: answers.mcpTransport,
    libraryTestFramework: answers.libraryTestFramework,
  };

  return config;
}
