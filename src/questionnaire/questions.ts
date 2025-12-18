/**
 * Question Definitions
 * All questions for the interactive stack selection
 */

import {
  Question,
  QuestionChoice,
  QuestionGroup,
  QuestionnaireAnswers,
} from './types';
import {
  databases,
  orms,
  authProviders,
  frontends,
  backends,
  aiFrameworks,
  vectorDatabases,
} from '../knowledge';

// Helper to convert stack options to question choices
function optionsToChoices(
  options: Array<{
    id: string;
    name: string;
    description: string;
    logoEmoji?: string;
    pros: string[];
    cons: string[];
    tradeoffs: string[];
    complexity: string;
    monthlyCost: { free: boolean; hobbyist: string | null };
  }>,
  filter?: (opt: any) => boolean
): QuestionChoice[] {
  const filtered = filter ? options.filter(filter) : options;
  return filtered.map(opt => ({
    value: opt.id,
    name: opt.name,
    description: opt.description,
    icon: opt.logoEmoji,
    pros: opt.pros.slice(0, 3),
    cons: opt.cons.slice(0, 2),
    tradeoffs: opt.tradeoffs.slice(0, 2),
    complexity: opt.complexity,
    cost: opt.monthlyCost.free
      ? 'Free tier available'
      : opt.monthlyCost.hobbyist || 'Paid',
  }));
}

// ============================================
// BASIC PROJECT QUESTIONS
// ============================================

export const projectQuestions: Question[] = [
  {
    id: 'projectName',
    type: 'input',
    message: 'What is your project name?',
    description: 'This will be used for the directory and package name',
    icon: '📁',
    required: true,
    category: 'project',
    validate: (input: string) => {
      if (!input || input.length < 2) {
        return 'Project name must be at least 2 characters';
      }
      if (!/^[a-z0-9-_]+$/i.test(input)) {
        return 'Project name can only contain letters, numbers, hyphens, and underscores';
      }
      return true;
    },
    transform: (input: string) => input.toLowerCase().replace(/\s+/g, '-'),
  },
  {
    id: 'projectType',
    type: 'single',
    message: 'What type of project are you building?',
    description: 'This will help us recommend the most suitable stack',
    icon: '🏗️',
    required: true,
    category: 'project',
    choices: [
      {
        value: 'web-app',
        name: 'Full-Stack Web Application',
        description: 'Web app with frontend, backend, and database',
        icon: '🌐',
      },
      {
        value: 'api',
        name: 'API Service',
        description: 'Backend API service only (REST/GraphQL)',
        icon: '⚡',
      },
      {
        value: 'ai-app',
        name: 'AI Application',
        description: 'Application with AI/ML components',
        icon: '🤖',
      },
      {
        value: 'mcp-server',
        name: 'MCP Server',
        description: 'Model Context Protocol server for AI tools',
        icon: '🔌',
      },
      {
        value: 'cli',
        name: 'CLI Tool',
        description: 'Command-line interface application',
        icon: '💻',
      },
      {
        value: 'library',
        name: 'Library/Package',
        description: 'Reusable library or npm package',
        icon: '📦',
      },
      {
        value: 'worker',
        name: 'Background Worker',
        description: 'Background job processor or worker service',
        icon: '⚙️',
      },
      {
        value: 'static-site',
        name: 'Static Site',
        description: 'Static website or documentation site',
        icon: '📄',
      },
    ],
  },
];

// ============================================
// USER PROFILE QUESTIONS
// ============================================

export const profileQuestions: Question[] = [
  {
    id: 'experience',
    type: 'single',
    message: 'What is your experience level?',
    description: 'This helps us recommend tools with appropriate complexity',
    icon: '🎯',
    required: true,
    category: 'profile',
    choices: [
      {
        value: 'beginner',
        name: 'Beginner',
        description: 'New to web development, prefer simple tools',
        icon: '🌱',
      },
      {
        value: 'intermediate',
        name: 'Intermediate',
        description: 'Comfortable with web dev, open to some complexity',
        icon: '🌿',
      },
      {
        value: 'advanced',
        name: 'Advanced',
        description: 'Experienced developer, comfortable with complex tools',
        icon: '🌳',
      },
      {
        value: 'expert',
        name: 'Expert',
        description: 'Very experienced, optimizing for specific needs',
        icon: '🏔️',
      },
    ],
  },
  {
    id: 'budget',
    type: 'single',
    message: 'What is your budget for third-party services?',
    description: 'Monthly budget for databases, auth, hosting, etc.',
    icon: '💰',
    required: true,
    category: 'profile',
    choices: [
      {
        value: 'free',
        name: 'Free Only',
        description: 'Only free tiers and open-source tools',
        icon: '🆓',
      },
      {
        value: 'low',
        name: 'Low ($0-$50/mo)',
        description: 'Hobbyist/side project budget',
        icon: '💵',
      },
      {
        value: 'medium',
        name: 'Medium ($50-$200/mo)',
        description: 'Startup/small business budget',
        icon: '💰',
      },
      {
        value: 'high',
        name: 'High ($200+/mo)',
        description: 'Production/enterprise budget',
        icon: '💎',
      },
      {
        value: 'unlimited',
        name: 'Unlimited',
        description: 'Budget is not a constraint',
        icon: '🏦',
      },
    ],
  },
  {
    id: 'scale',
    type: 'single',
    message: 'What scale are you building for?',
    description: 'Expected users/traffic in the near term',
    icon: '📈',
    required: true,
    category: 'profile',
    choices: [
      {
        value: 'prototype',
        name: 'Prototype/MVP',
        description: 'Just testing ideas, minimal users',
        icon: '🧪',
      },
      {
        value: 'small',
        name: 'Small (< 1K users)',
        description: 'Side project or small team tool',
        icon: '🏠',
      },
      {
        value: 'medium',
        name: 'Medium (1K-10K users)',
        description: 'Growing product with real users',
        icon: '🏢',
      },
      {
        value: 'large',
        name: 'Large (10K-100K users)',
        description: 'Established product with significant traffic',
        icon: '🏙️',
      },
      {
        value: 'enterprise',
        name: 'Enterprise (100K+ users)',
        description: 'High-scale production system',
        icon: '🌍',
      },
    ],
  },
  {
    id: 'timeline',
    type: 'single',
    message: 'How quickly do you need to ship?',
    description: 'This affects whether we recommend simpler vs. more robust options',
    icon: '⏰',
    required: true,
    category: 'profile',
    choices: [
      {
        value: 'urgent',
        name: 'ASAP',
        description: 'Need to ship very quickly, willing to refactor later',
        icon: '🚀',
      },
      {
        value: 'normal',
        name: 'Normal',
        description: 'Standard timeline, balance of speed and quality',
        icon: '📅',
      },
      {
        value: 'flexible',
        name: 'Flexible',
        description: 'No rush, want to do it right the first time',
        icon: '🎯',
      },
    ],
  },
];

// ============================================
// RUNTIME QUESTIONS
// ============================================

export const runtimeQuestions: Question[] = [
  {
    id: 'runtime',
    type: 'single',
    message: 'What runtime/language do you want to use?',
    description: 'Primary runtime for your backend',
    icon: '⚙️',
    required: true,
    category: 'runtime',
    showWhen: (answers: QuestionnaireAnswers) =>
      answers.projectType !== 'static-site',
    choices: [
      {
        value: 'node',
        name: 'Node.js',
        description: 'JavaScript/TypeScript runtime',
        icon: '🟢',
        pros: ['Huge ecosystem', 'Easy to hire', 'Great tooling'],
        cons: ['Single-threaded', 'Callback complexity'],
      },
      {
        value: 'bun',
        name: 'Bun',
        description: 'Fast all-in-one JavaScript runtime',
        icon: '🥟',
        pros: ['Very fast', 'Built-in bundler', 'Drop-in Node replacement'],
        cons: ['Newer ecosystem', 'Some Node APIs missing'],
      },
      {
        value: 'deno',
        name: 'Deno',
        description: 'Secure runtime for JavaScript and TypeScript',
        icon: '🦕',
        pros: ['Secure by default', 'Built-in TypeScript', 'Modern APIs'],
        cons: ['Smaller ecosystem', 'Different module system'],
      },
      {
        value: 'python',
        name: 'Python',
        description: 'Great for AI/ML and rapid development',
        icon: '🐍',
        pros: ['AI/ML libraries', 'Easy to learn', 'Great for data'],
        cons: ['Slower performance', 'GIL limitations'],
      },
      {
        value: 'go',
        name: 'Go',
        description: 'Fast, simple, and concurrent',
        icon: '🐹',
        pros: ['Very fast', 'Great concurrency', 'Simple language'],
        cons: ['Less expressive', 'No generics (before 1.18)'],
      },
      {
        value: 'rust',
        name: 'Rust',
        description: 'Performance and safety focused',
        icon: '🦀',
        pros: ['Blazing fast', 'Memory safe', 'Great for systems'],
        cons: ['Steep learning curve', 'Longer development time'],
      },
    ],
  },
];

// ============================================
// FRONTEND QUESTIONS
// ============================================

export const frontendQuestions: Question[] = [
  {
    id: 'frontend',
    type: 'select',
    message: 'Which frontend framework do you want to use?',
    description: 'Main framework for your frontend',
    icon: '🖼️',
    required: true,
    category: 'frontend',
    showWhen: (answers: QuestionnaireAnswers) =>
      ['web-app', 'ai-app', 'static-site'].includes(answers.projectType as string),
    choices: optionsToChoices(frontends),
  },
];

// ============================================
// BACKEND QUESTIONS
// ============================================

export const backendQuestions: Question[] = [
  {
    id: 'backend',
    type: 'select',
    message: 'Which backend framework do you want to use?',
    description: 'Main framework for your API/server',
    icon: '⚡',
    required: true,
    category: 'backend',
    showWhen: (answers: QuestionnaireAnswers) =>
      ['web-app', 'api', 'ai-app', 'mcp-server', 'worker'].includes(
        answers.projectType as string
      ) && answers.frontend !== 'nextjs',
    choices: optionsToChoices(backends, (b: any) =>
      ['node', 'bun'].includes(b.runtime)
    ),
  },
];

// ============================================
// DATABASE QUESTIONS
// ============================================

export const databaseQuestions: Question[] = [
  {
    id: 'database',
    type: 'select',
    message: 'Which database do you want to use?',
    description: 'Primary database for your application',
    icon: '🗄️',
    required: true,
    category: 'database',
    showWhen: (answers: QuestionnaireAnswers) =>
      ['web-app', 'api', 'ai-app', 'worker'].includes(answers.projectType as string),
    choices: optionsToChoices(databases),
  },
  {
    id: 'orm',
    type: 'select',
    message: 'Which ORM do you want to use?',
    description: 'Object-Relational Mapping library',
    icon: '🔗',
    required: false,
    category: 'database',
    showWhen: (answers: QuestionnaireAnswers) =>
      Boolean(answers.database) &&
      !['convex', 'firebase', 'pocketbase', 'none'].includes(answers.database as string),
    choices: optionsToChoices(orms),
  },
];

// ============================================
// AUTH QUESTIONS
// ============================================

export const authQuestions: Question[] = [
  {
    id: 'needsAuth',
    type: 'confirm',
    message: 'Does your application need user authentication?',
    description: 'User login, registration, and session management',
    icon: '🔐',
    required: true,
    category: 'auth',
    showWhen: (answers: QuestionnaireAnswers) =>
      ['web-app', 'api', 'ai-app'].includes(answers.projectType as string),
    default: true,
  },
  {
    id: 'auth',
    type: 'select',
    message: 'Which authentication provider do you want to use?',
    description: 'Authentication and user management',
    icon: '🔐',
    required: true,
    category: 'auth',
    showWhen: (answers: QuestionnaireAnswers) => answers.needsAuth === true,
    choices: optionsToChoices(authProviders),
  },
];

// ============================================
// AI QUESTIONS
// ============================================

export const aiQuestions: Question[] = [
  {
    id: 'needsAI',
    type: 'confirm',
    message: 'Does your application need AI/LLM capabilities?',
    description: 'AI chat, embeddings, or other LLM features',
    icon: '🤖',
    required: true,
    category: 'ai',
    showWhen: (answers: QuestionnaireAnswers) =>
      answers.projectType === 'ai-app' ||
      ['web-app', 'api'].includes(answers.projectType as string),
    default: false,
  },
  {
    id: 'ai',
    type: 'select',
    message: 'Which AI framework do you want to use?',
    description: 'SDK or framework for AI integration',
    icon: '🤖',
    required: true,
    category: 'ai',
    showWhen: (answers: QuestionnaireAnswers) =>
      answers.needsAI === true || answers.projectType === 'ai-app',
    choices: optionsToChoices(aiFrameworks),
  },
  {
    id: 'needsRAG',
    type: 'confirm',
    message: 'Do you need RAG (Retrieval Augmented Generation)?',
    description: 'Vector database for document Q&A and semantic search',
    icon: '📚',
    required: true,
    category: 'ai',
    showWhen: (answers: QuestionnaireAnswers) =>
      Boolean(answers.ai) && answers.ai !== 'none',
    default: false,
  },
  {
    id: 'vectorDb',
    type: 'select',
    message: 'Which vector database do you want to use?',
    description: 'Vector storage for embeddings and semantic search',
    icon: '📊',
    required: true,
    category: 'ai',
    showWhen: (answers: QuestionnaireAnswers) => answers.needsRAG === true,
    choices: optionsToChoices(vectorDatabases),
  },
];

// ============================================
// TOOLING QUESTIONS
// ============================================

export const toolingQuestions: Question[] = [
  {
    id: 'includeDocker',
    type: 'confirm',
    message: 'Include Docker configuration?',
    description: 'Dockerfile and docker-compose for containerization',
    icon: '🐳',
    required: false,
    category: 'tooling',
    default: true,
  },
  {
    id: 'includeGithubActions',
    type: 'confirm',
    message: 'Include GitHub Actions CI/CD?',
    description: 'Automated testing and deployment workflows',
    icon: '🔄',
    required: false,
    category: 'tooling',
    default: true,
  },
  {
    id: 'includeTests',
    type: 'confirm',
    message: 'Include testing setup?',
    description: 'Vitest or Jest configuration for unit/integration tests',
    icon: '🧪',
    required: false,
    category: 'tooling',
    default: true,
  },
  {
    id: 'includeLinting',
    type: 'confirm',
    message: 'Include linting and formatting?',
    description: 'ESLint, Prettier, and Biome configuration',
    icon: '✨',
    required: false,
    category: 'tooling',
    default: true,
  },
];

// ============================================
// PRIORITY QUESTIONS
// ============================================

export const priorityQuestions: Question[] = [
  {
    id: 'priorities',
    type: 'multi',
    message: 'What are your top priorities?',
    description: 'Select up to 3 priorities (helps with recommendations)',
    icon: '🎯',
    required: false,
    category: 'priorities',
    max: 3,
    choices: [
      {
        value: 'dx',
        name: 'Developer Experience',
        description: 'Great tooling, fast iteration, clear errors',
        icon: '💻',
      },
      {
        value: 'performance',
        name: 'Performance',
        description: 'Fast response times, low latency',
        icon: '⚡',
      },
      {
        value: 'type-safety',
        name: 'Type Safety',
        description: 'Strong typing, catch errors at compile time',
        icon: '🔒',
      },
      {
        value: 'scalability',
        name: 'Scalability',
        description: 'Handle growth without major rewrites',
        icon: '📈',
      },
      {
        value: 'simplicity',
        name: 'Simplicity',
        description: 'Easy to understand and maintain',
        icon: '🎯',
      },
      {
        value: 'cost',
        name: 'Cost Efficiency',
        description: 'Minimize infrastructure costs',
        icon: '💰',
      },
      {
        value: 'security',
        name: 'Security',
        description: 'Strong security features and practices',
        icon: '🛡️',
      },
      {
        value: 'ecosystem',
        name: 'Ecosystem/Community',
        description: 'Large community, lots of resources',
        icon: '🌐',
      },
    ],
  },
];

// ============================================
// ALL QUESTIONS (ordered)
// ============================================

export const allQuestions: Question[] = [
  ...projectQuestions,
  ...profileQuestions,
  ...runtimeQuestions,
  ...frontendQuestions,
  ...backendQuestions,
  ...databaseQuestions,
  ...authQuestions,
  ...aiQuestions,
  ...toolingQuestions,
  ...priorityQuestions,
];

// ============================================
// QUESTION GROUPS
// ============================================

export const questionGroups: QuestionGroup[] = [
  {
    id: 'project',
    name: 'Project Setup',
    description: 'Basic project information',
    icon: '📁',
    questions: projectQuestions,
    order: 1,
  },
  {
    id: 'profile',
    name: 'Your Profile',
    description: 'Help us understand your needs',
    icon: '👤',
    questions: profileQuestions,
    order: 2,
  },
  {
    id: 'runtime',
    name: 'Runtime',
    description: 'Choose your runtime/language',
    icon: '⚙️',
    questions: runtimeQuestions,
    order: 3,
  },
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'Frontend framework selection',
    icon: '🖼️',
    questions: frontendQuestions,
    order: 4,
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Backend framework selection',
    icon: '⚡',
    questions: backendQuestions,
    order: 5,
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Database and ORM selection',
    icon: '🗄️',
    questions: databaseQuestions,
    order: 6,
  },
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Authentication provider selection',
    icon: '🔐',
    questions: authQuestions,
    order: 7,
  },
  {
    id: 'ai',
    name: 'AI Integration',
    description: 'AI and ML capabilities',
    icon: '🤖',
    questions: aiQuestions,
    order: 8,
  },
  {
    id: 'tooling',
    name: 'Tooling',
    description: 'Development tooling options',
    icon: '🛠️',
    questions: toolingQuestions,
    order: 9,
  },
  {
    id: 'priorities',
    name: 'Priorities',
    description: 'Your top priorities',
    icon: '🎯',
    questions: priorityQuestions,
    order: 10,
  },
];

// Get questions for a specific flow type
export function getQuestionsForProjectType(projectType: string): Question[] {
  return allQuestions.filter(q => {
    if (!q.showWhen) return true;
    return q.showWhen({ projectType } as QuestionnaireAnswers);
  });
}

// Get minimal questions for quick setup
export function getQuickSetupQuestions(): Question[] {
  return [
    ...projectQuestions,
    profileQuestions.find(q => q.id === 'experience')!,
    runtimeQuestions[0],
  ];
}
