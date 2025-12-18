/**
 * Backend Template Fragments
 * API frameworks and server templates
 */

import type { TemplateFragment } from '../types';

export const honoFragment: TemplateFragment = {
  id: 'hono',
  name: 'Hono',
  category: 'backend',
  path: 'hono-api',
  description: 'Ultrafast, lightweight web framework for any runtime',
  dependencies: ['base'],
  files: [
    { source: 'package.json.ejs', destination: 'package.json' },
    { source: 'tsconfig.json.ejs', destination: 'tsconfig.json' },
    { source: 'src/index.ts.ejs', destination: 'src/index.ts' },
    { source: 'src/routes/health.ts.ejs', destination: 'src/routes/health.ts' },
    { source: 'Dockerfile.ejs', destination: 'Dockerfile' },
  ],
  packageJson: {
    dependencies: {
      'hono': '^4.3.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      'typescript': '^5.4.0',
      'tsx': '^4.9.0',
    },
    scripts: {
      'dev': 'tsx watch src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
    },
  },
  envVars: [
    {
      key: 'PORT',
      defaultValue: '3000',
      description: 'Server port',
      required: false,
    },
  ],
  postInstallSteps: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start development server',
  ],
  documentationUrl: 'https://hono.dev/',
};

export const cliFragment: TemplateFragment = {
  id: 'cli',
  name: 'CLI Tool',
  category: 'backend',
  path: 'cli',
  description: 'Command-line interface tool with Commander.js',
  dependencies: ['base'],
  files: [
    { source: 'package.json.ejs', destination: 'package.json' },
    { source: 'tsconfig.json.ejs', destination: 'tsconfig.json' },
    { source: 'src/index.ts.ejs', destination: 'src/index.ts' },
    { source: 'src/commands/greet.ts.ejs', destination: 'src/commands/greet.ts' },
    { source: 'src/lib/config.ts.ejs', destination: 'src/lib/config.ts' },
    { source: 'Dockerfile.ejs', destination: 'Dockerfile' },
    { source: '.gitignore.ejs', destination: '.gitignore' },
  ],
  packageJson: {
    dependencies: {
      'commander': '^12.1.0',
      'chalk': '^5.3.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      'typescript': '^5.4.0',
      'tsx': '^4.9.0',
    },
    scripts: {
      'dev': 'tsx src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
    },
  },
  postInstallSteps: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev -- --help` to test CLI',
    'Link globally with `npm link` for system-wide access',
  ],
};

export const mcpServerFragment: TemplateFragment = {
  id: 'mcp-server',
  name: 'MCP Server',
  category: 'backend',
  path: 'mcp-server',
  description: 'Model Context Protocol server for Claude integration',
  dependencies: ['base'],
  files: [
    { source: 'package.json.ejs', destination: 'package.json' },
    { source: 'tsconfig.json.ejs', destination: 'tsconfig.json' },
    { source: 'src/index.ts.ejs', destination: 'src/index.ts' },
    { source: '.gitignore.ejs', destination: '.gitignore' },
  ],
  packageJson: {
    dependencies: {
      '@modelcontextprotocol/sdk': '^1.0.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      'typescript': '^5.4.0',
    },
    scripts: {
      'build': 'tsc',
      'start': 'node dist/index.js',
      'inspect': 'npx @anthropics/mcp-inspector node dist/index.js',
    },
  },
  postInstallSteps: [
    'Run `npm install` to install dependencies',
    'Run `npm run build` to compile TypeScript',
    'Add to Claude settings to test MCP server',
  ],
  documentationUrl: 'https://modelcontextprotocol.io/',
};

export const workerFragment: TemplateFragment = {
  id: 'worker',
  name: 'Background Worker',
  category: 'backend',
  path: 'worker',
  description: 'Background job processor with BullMQ',
  dependencies: ['base'],
  files: [
    { source: 'package.json.ejs', destination: 'package.json' },
    { source: 'tsconfig.json.ejs', destination: 'tsconfig.json' },
    { source: 'src/index.ts.ejs', destination: 'src/index.ts' },
    { source: 'src/jobs/email.ts.ejs', destination: 'src/jobs/email.ts' },
    { source: 'src/jobs/webhook.ts.ejs', destination: 'src/jobs/webhook.ts' },
    { source: 'docker-compose.yml.ejs', destination: 'docker-compose.yml' },
    { source: 'Dockerfile.ejs', destination: 'Dockerfile' },
    { source: '.gitignore.ejs', destination: '.gitignore' },
  ],
  packageJson: {
    dependencies: {
      'bullmq': '^5.7.0',
      'ioredis': '^5.4.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      'typescript': '^5.4.0',
      'tsx': '^4.9.0',
    },
    scripts: {
      'dev': 'tsx watch src/index.ts',
      'build': 'tsc',
      'start': 'node dist/index.js',
    },
  },
  envVars: [
    {
      key: 'REDIS_URL',
      defaultValue: 'redis://localhost:6379',
      description: 'Redis connection URL for job queue',
      required: true,
    },
  ],
  postInstallSteps: [
    'Start Redis: `docker compose up -d redis`',
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start worker',
  ],
};

export const libraryFragment: TemplateFragment = {
  id: 'library',
  name: 'TypeScript Library',
  category: 'backend',
  path: 'library',
  description: 'Publishable TypeScript/JavaScript library',
  dependencies: ['base'],
  files: [
    { source: 'package.json.ejs', destination: 'package.json' },
    { source: 'tsconfig.json.ejs', destination: 'tsconfig.json' },
    { source: 'tsup.config.ts.ejs', destination: 'tsup.config.ts' },
    { source: 'src/index.ts.ejs', destination: 'src/index.ts' },
    { source: 'src/types.ts.ejs', destination: 'src/types.ts' },
    { source: 'src/greeter.ts.ejs', destination: 'src/greeter.ts' },
    { source: 'test/index.test.ts.ejs', destination: 'test/index.test.ts' },
    { source: '.gitignore.ejs', destination: '.gitignore' },
  ],
  packageJson: {
    devDependencies: {
      '@types/node': '^20.0.0',
      'typescript': '^5.4.0',
      'tsup': '^8.0.0',
      'vitest': '^1.6.0',
    },
    scripts: {
      'build': 'tsup',
      'test': 'vitest',
      'prepublishOnly': 'npm run build',
    },
  },
  postInstallSteps: [
    'Run `npm install` to install dependencies',
    'Run `npm test` to run tests',
    'Run `npm run build` to build for publishing',
  ],
};

export const backendFragments: TemplateFragment[] = [
  honoFragment,
  cliFragment,
  mcpServerFragment,
  workerFragment,
  libraryFragment,
];
