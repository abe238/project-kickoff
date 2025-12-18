/**
 * Base Template Fragments
 * Core project files included in all projects
 */

import type { TemplateFragment } from '../types';

export const baseFragment: TemplateFragment = {
  id: 'base',
  name: 'Base Project',
  category: 'base',
  path: 'shared',
  description: 'Core project files (README, CLAUDE.md, .gitignore)',
  files: [
    { source: 'README.md.ejs', destination: 'README.md' },
    { source: 'CLAUDE.md.ejs', destination: 'CLAUDE.md' },
    { source: '.gitignore.ejs', destination: '.gitignore' },
    { source: '.env.example.ejs', destination: '.env.example' },
  ],
  envVars: [
    {
      key: 'NODE_ENV',
      defaultValue: 'development',
      description: 'Environment mode',
      required: false,
    },
  ],
  postInstallSteps: [
    'Copy .env.example to .env and fill in values',
    'Initialize git repository with `git init`',
  ],
};

export const dockerFragment: TemplateFragment = {
  id: 'docker',
  name: 'Docker',
  category: 'deployment',
  path: 'shared',
  description: 'Docker containerization support',
  files: [
    { source: 'docker-compose.yml.ejs', destination: 'docker-compose.yml' },
  ],
  postInstallSteps: [
    'Build containers with `docker compose build`',
    'Start services with `docker compose up -d`',
  ],
};

export const githubActionsFragment: TemplateFragment = {
  id: 'github-actions',
  name: 'GitHub Actions',
  category: 'deployment',
  path: 'shared',
  description: 'CI/CD with GitHub Actions',
  files: [
    { source: '.github/workflows/deploy.yml.ejs', destination: '.github/workflows/deploy.yml' },
  ],
  envVars: [
    {
      key: 'VPS_HOST',
      description: 'VPS hostname for deployment',
      required: true,
      secret: true,
    },
    {
      key: 'VPS_USER',
      description: 'VPS SSH username',
      required: true,
      secret: true,
    },
    {
      key: 'VPS_SSH_KEY',
      description: 'VPS SSH private key',
      required: true,
      secret: true,
    },
  ],
  postInstallSteps: [
    'Add VPS_HOST, VPS_USER, VPS_SSH_KEY to GitHub repository secrets',
    'Push to main branch to trigger deployment',
  ],
};

export const baseFragments: TemplateFragment[] = [
  baseFragment,
  dockerFragment,
  githubActionsFragment,
];
