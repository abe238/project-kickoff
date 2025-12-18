/**
 * Frontend Template Fragments
 * React, Next.js, Vite, and other frontend frameworks
 */

import type { TemplateFragment } from '../types';

export const nextjsFragment: TemplateFragment = {
  id: 'nextjs',
  name: 'Next.js',
  category: 'frontend',
  path: 'nextjs',
  description: 'Full-stack React framework with App Router',
  dependencies: ['base'],
  files: [
    { source: 'package.json.ejs', destination: 'package.json' },
    { source: 'next.config.ts.ejs', destination: 'next.config.ts' },
    { source: 'tsconfig.json.ejs', destination: 'tsconfig.json' },
    { source: 'tailwind.config.ts.ejs', destination: 'tailwind.config.ts' },
    { source: 'postcss.config.mjs.ejs', destination: 'postcss.config.mjs' },
    { source: 'src/app/layout.tsx.ejs', destination: 'src/app/layout.tsx' },
    { source: 'src/app/page.tsx.ejs', destination: 'src/app/page.tsx' },
    { source: 'src/app/globals.css.ejs', destination: 'src/app/globals.css' },
    { source: 'src/app/api/health/route.ts.ejs', destination: 'src/app/api/health/route.ts' },
    { source: 'Dockerfile.ejs', destination: 'Dockerfile' },
  ],
  packageJson: {
    dependencies: {
      'next': '^14.2.0',
      'react': '^18.3.0',
      'react-dom': '^18.3.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      'typescript': '^5.4.0',
      'tailwindcss': '^3.4.0',
      'postcss': '^8.4.0',
      'autoprefixer': '^10.4.0',
    },
    scripts: {
      'dev': 'next dev',
      'build': 'next build',
      'start': 'next start',
      'lint': 'next lint',
    },
  },
  envVars: [
    {
      key: 'NEXT_PUBLIC_API_URL',
      description: 'Public API URL for client-side requests',
      required: false,
    },
  ],
  postInstallSteps: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start development server',
  ],
  documentationUrl: 'https://nextjs.org/docs',
};

export const viteReactFragment: TemplateFragment = {
  id: 'vite-react',
  name: 'Vite + React',
  category: 'frontend',
  path: 'vite-react',
  description: 'Lightning fast React development with Vite',
  dependencies: ['base'],
  incompatibleWith: ['nextjs'],
  files: [
    { source: 'package.json.ejs', destination: 'package.json' },
    { source: 'vite.config.ts.ejs', destination: 'vite.config.ts' },
    { source: 'tsconfig.json.ejs', destination: 'tsconfig.json' },
    { source: 'tailwind.config.js.ejs', destination: 'tailwind.config.js' },
    { source: 'postcss.config.js.ejs', destination: 'postcss.config.js' },
    { source: 'index.html.ejs', destination: 'index.html' },
    { source: 'src/main.tsx.ejs', destination: 'src/main.tsx' },
    { source: 'src/App.tsx.ejs', destination: 'src/App.tsx' },
    { source: 'src/index.css.ejs', destination: 'src/index.css' },
    { source: 'Dockerfile.ejs', destination: 'Dockerfile' },
    { source: 'nginx.conf.ejs', destination: 'nginx.conf' },
  ],
  packageJson: {
    dependencies: {
      'react': '^18.3.0',
      'react-dom': '^18.3.0',
    },
    devDependencies: {
      '@types/react': '^18.3.0',
      '@types/react-dom': '^18.3.0',
      '@vitejs/plugin-react': '^4.2.0',
      'typescript': '^5.4.0',
      'vite': '^5.2.0',
      'tailwindcss': '^3.4.0',
      'postcss': '^8.4.0',
      'autoprefixer': '^10.4.0',
    },
    scripts: {
      'dev': 'vite',
      'build': 'tsc && vite build',
      'preview': 'vite preview',
    },
  },
  envVars: [
    {
      key: 'VITE_API_URL',
      description: 'API URL for client-side requests',
      required: false,
    },
  ],
  postInstallSteps: [
    'Run `npm install` to install dependencies',
    'Run `npm run dev` to start development server',
  ],
  documentationUrl: 'https://vitejs.dev/guide/',
};

export const staticFragment: TemplateFragment = {
  id: 'static',
  name: 'Static Site',
  category: 'frontend',
  path: 'static',
  description: 'Simple static HTML/CSS/JS site',
  dependencies: ['base'],
  incompatibleWith: ['nextjs', 'vite-react'],
  files: [
    { source: 'index.html.ejs', destination: 'index.html' },
    { source: 'styles.css.ejs', destination: 'styles.css' },
    { source: 'main.js.ejs', destination: 'main.js' },
    { source: 'Dockerfile.ejs', destination: 'Dockerfile' },
    { source: 'nginx.conf.ejs', destination: 'nginx.conf' },
  ],
  postInstallSteps: [
    'Open index.html in a browser to view',
    'Use a local server for development: `npx serve .`',
  ],
};

export const frontendFragments: TemplateFragment[] = [
  nextjsFragment,
  viteReactFragment,
  staticFragment,
];
