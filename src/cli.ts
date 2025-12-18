#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { fileURLToPath } from 'url';
import { promptProjectConfig } from './lib/prompter.js';
import { scaffoldProject } from './lib/scaffolder.js';
import { configManager } from './core/ConfigManager.js';
import { logger } from './utils/Logger.js';

const VERSION = '3.0.0';

const BANNER = `
${chalk.blue('  ██╗  ██╗██╗ ██████╗██╗  ██╗ ██████╗ ███████╗███████╗')}
${chalk.blue('  ██║ ██╔╝██║██╔════╝██║ ██╔╝██╔═══██╗██╔════╝██╔════╝')}
${chalk.cyan('  █████╔╝ ██║██║     █████╔╝ ██║   ██║█████╗  █████╗  ')}
${chalk.cyan('  ██╔═██╗ ██║██║     ██╔═██╗ ██║   ██║██╔══╝  ██╔══╝  ')}
${chalk.magenta('  ██║  ██╗██║╚██████╗██║  ██╗╚██████╔╝██║     ██║     ')}
${chalk.magenta('  ╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝     ')}
  ${chalk.gray('Modern Project Scaffolding • v' + VERSION)}
  ${chalk.dim('Multi-language • AI/ML • 2025 Stacks')}
`;

const program = new Command();

program
  .name('kickoff')
  .description('CLI to scaffold production-ready projects with 2025 tech stacks')
  .version(VERSION)
  .addHelpText('after', `
${chalk.bold('Quick Start:')}
  ${chalk.cyan('$')} kickoff create my-app          ${chalk.dim('# Interactive wizard')}
  ${chalk.cyan('$')} kickoff create my-app --preset saas-starter  ${chalk.dim('# Use preset')}
  ${chalk.cyan('$')} kickoff list                   ${chalk.dim('# See all presets')}

${chalk.bold('Examples:')}
  ${chalk.dim('# Create a SaaS app with Next.js + Supabase')}
  ${chalk.cyan('$')} kickoff create my-saas --preset saas-starter

  ${chalk.dim('# Create a Python API')}
  ${chalk.cyan('$')} kickoff create my-api --preset fastapi-starter

  ${chalk.dim('# Create a local AI agent')}
  ${chalk.cyan('$')} kickoff create my-agent --preset ai-agent

${chalk.bold('What You Get:')}
  ${chalk.green('✓')} TypeScript/Python/Go/Rust configured
  ${chalk.green('✓')} Docker + docker-compose ready
  ${chalk.green('✓')} GitHub Actions CI/CD pipeline
  ${chalk.green('✓')} Database migrations + ORM setup
  ${chalk.green('✓')} Auth integration (if selected)
  ${chalk.green('✓')} AI/ML scaffolding (if selected)
  ${chalk.green('✓')} Security best practices baked in

${chalk.bold('Documentation:')}
  ${chalk.cyan('$')} kickoff docs       ${chalk.dim('# Usage guide')}
  ${chalk.cyan('$')} kickoff stacks     ${chalk.dim('# All stacks & presets')}
`);

program
  .command('create')
  .argument('<name>', 'Name of the project to create')
  .option('-p, --preset <name>', 'Use a preset configuration')
  .option('-d, --directory <path>', 'Output directory', process.cwd())
  .option('--dry-run', 'Show what would be created without creating files')
  .option('--skip-install', 'Skip package installation')
  .option('--skip-git', 'Skip git initialization')
  .option('-y, --yes', 'Use default values for all prompts')
  .option('-v, --verbose', 'Enable verbose logging')
  .description('Create a new project')
  .action(async (name, options) => {
    console.log(BANNER);

    if (options.verbose) {
      logger.setVerbose(true);
    }

    try {
      const config = await promptProjectConfig({
        name,
        preset: options.preset,
        useDefaults: options.yes
      });

      console.log('\n' + chalk.bold('Project Configuration:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ${chalk.cyan('Name:')} ${config.name}`);
      console.log(`  ${chalk.cyan('Type:')} ${config.type}`);
      console.log(`  ${chalk.cyan('Runtime:')} ${config.runtime}`);
      console.log(`  ${chalk.cyan('Database:')} ${config.databaseProvider}${config.orm !== 'none' ? ` + ${config.orm}` : ''}`);
      console.log(`  ${chalk.cyan('Auth:')} ${config.authProvider}`);
      if (config.aiFramework !== 'none') {
        console.log(`  ${chalk.cyan('AI:')} ${config.aiFramework}${config.vectorDB !== 'none' ? ` + ${config.vectorDB}` : ''}`);
      }
      console.log(chalk.gray('─'.repeat(40)));

      if (options.dryRun) {
        console.log(chalk.yellow('\n[Dry Run] Would create project at:'));
        console.log(`  ${path.join(options.directory, config.name)}`);
        return;
      }

      const projectPath = path.join(options.directory, config.name);
      if (await fs.pathExists(projectPath)) {
        console.log(chalk.red(`\nError: Directory ${config.name} already exists`));
        process.exit(1);
      }

      const spinner = ora('Scaffolding project...').start();
      await scaffoldProject(config, options.directory);
      spinner.succeed('Project scaffolded');

      if (!options.skipGit) {
        spinner.start('Initializing git repository...');
        try {
          await execa('git', ['init'], { cwd: projectPath });
          await execa('git', ['add', '.'], { cwd: projectPath });
          await execa('git', ['commit', '-m', 'Initial commit from kickoff'], { cwd: projectPath });
          spinner.succeed('Git repository initialized');
        } catch {
          spinner.warn('Git initialization skipped');
        }
      }

      console.log('\n' + chalk.bold.green('Project created successfully!'));
      console.log('\n' + chalk.bold('Next steps:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ${chalk.cyan('1.')} cd ${config.name}`);
      console.log(`  ${chalk.cyan('2.')} npm install`);
      console.log(`  ${chalk.cyan('3.')} npm run dev`);
      console.log(chalk.gray('─'.repeat(40)));
      console.log('\n' + chalk.blue('Happy coding!') + '\n');
    } catch (error) {
      console.error(chalk.red('\nError:'), error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all available presets')
  .action(() => {
    console.log(BANNER);

    console.log(chalk.bold('Available Presets:'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log(`  ${chalk.magenta('saas-starter')}     Next.js + Supabase + Drizzle`);
    console.log(`  ${chalk.magenta('tanstack-hono')}    TanStack Start + Turso + Better Auth`);
    console.log(`  ${chalk.magenta('edge-api')}         Hono + Turso + Bun`);
    console.log(`  ${chalk.magenta('api-microservice')} Hono + Neon + Drizzle`);
    console.log(chalk.dim('  AI/ML'));
    console.log(`  ${chalk.magenta('ai-rag-app')}       Next.js + pgvector + Vercel AI`);
    console.log(`  ${chalk.magenta('ai-agent')}         Hono + Ollama + LangChain`);
    console.log(chalk.dim('  Multi-Language'));
    console.log(`  ${chalk.magenta('fastapi-app')}      FastAPI + PostgreSQL + SQLAlchemy`);
    console.log(`  ${chalk.magenta('go-api')}           Gin + PostgreSQL + GORM`);
    console.log(`  ${chalk.magenta('rust-api')}         Axum + PostgreSQL + sqlx`);
    console.log(chalk.dim('  Quick Start'));
    console.log(`  ${chalk.magenta('quick-cli')}        CLI tool (quick)`);
    console.log(`  ${chalk.magenta('landing-page')}     Static site (quick)`);
    console.log(`  ${chalk.magenta('mcp-server')}       MCP server for AI tools`);
    console.log(`  ${chalk.magenta('library')}          npm package with tsup + vitest`);
    console.log(`  ${chalk.magenta('worker')}           BullMQ background worker`);
    console.log(chalk.gray('─'.repeat(60)));

    console.log('\n' + chalk.dim('Usage: kickoff create <name> --preset <preset-name>'));
  });

program
  .command('stacks')
  .description('Open interactive stack explorer in browser')
  .action(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const docsPath = path.join(__dirname, '..', 'docs', 'stacks.html');

    if (await fs.pathExists(docsPath)) {
      const { execa } = await import('execa');
      await execa('open', [docsPath]);
      console.log(chalk.green('Opened stack explorer in browser'));
    } else {
      console.log(chalk.yellow('stacks.html not found. Run `kickoff docs` for available documentation.'));
    }
  });

program
  .command('docs')
  .description('Open usage guide in browser')
  .action(async () => {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const docsPath = path.join(__dirname, '..', 'docs', 'USAGE.html');

    if (await fs.pathExists(docsPath)) {
      const { execa } = await import('execa');
      await execa('open', [docsPath]);
      console.log(chalk.green('Opened usage guide in browser'));
    } else {
      console.log(chalk.yellow('USAGE.html not found.'));
    }
  });

program
  .command('config')
  .description('Configure default settings')
  .option('--show', 'Show current configuration')
  .option('--reset', 'Reset to defaults')
  .action(async (options) => {
    await configManager.initialize();

    if (options.show) {
      const config = await configManager.getConfig();
      console.log(chalk.bold('Current Configuration:'));
      console.log(JSON.stringify(config, null, 2));
      console.log(chalk.dim(`\nConfig file: ${configManager.getConfigPath()}`));
    } else if (options.reset) {
      await configManager.resetConfig();
      console.log(chalk.green('Configuration reset to defaults'));
    } else {
      console.log(chalk.dim('Options:'));
      console.log('  --show   Show current configuration');
      console.log('  --reset  Reset to defaults');
    }
  });

program.parse();
