import inquirer from 'inquirer';
import type { ProjectConfig, ProjectType } from './types.js';

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

export async function promptProjectConfig(): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
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
    },
    {
      type: 'confirm',
      name: 'needsDatabase',
      message: 'Need database?',
      default: (answers: { type: ProjectType }) =>
        answers.type === 'nextjs' || answers.type === 'api',
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
    {
      type: 'confirm',
      name: 'needsAuth',
      message: 'Need authentication?',
      default: false,
    },
    {
      type: 'input',
      name: 'domain',
      message: 'Production domain (leave empty for local only):',
      default: '',
    },
    {
      type: 'input',
      name: 'githubUsername',
      message: 'GitHub username:',
      default: 'abe238',
    },
    {
      type: 'confirm',
      name: 'useDesignSystem',
      message: 'Include Gemini-style design system?',
      default: (answers: { type: ProjectType }) =>
        answers.type === 'nextjs' || answers.type === 'vite-react',
      when: (answers) => answers.type === 'nextjs' || answers.type === 'vite-react',
    },
  ]);

  return answers as ProjectConfig;
}
