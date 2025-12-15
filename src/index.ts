#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { execa } from 'execa';
import { promptProjectConfig } from './lib/prompter.js';
import { scaffoldProject } from './lib/scaffolder.js';

const VERSION = '1.0.0';

const BANNER = `
${chalk.blue('╔═══════════════════════════════════════════════════════════════╗')}
${chalk.blue('║')}  ${chalk.bold.white('Project Kickoff')} - Production-Ready Project Generator    ${chalk.blue('║')}
${chalk.blue('║')}  ${chalk.gray('Security best practices baked in')}                          ${chalk.blue('║')}
${chalk.blue('╚═══════════════════════════════════════════════════════════════╝')}
`;

const program = new Command();

program
  .name('kickoff')
  .description('CLI to scaffold production-ready projects with security best practices')
  .version(VERSION);

program
  .command('init')
  .description('Initialize a new project')
  .option('-d, --dry-run', 'Show what would be created without creating files')
  .option('-o, --output <dir>', 'Output directory', process.cwd())
  .action(async (options) => {
    console.log(BANNER);

    try {
      // Gather project configuration
      const config = await promptProjectConfig();

      // Show summary
      console.log('\n' + chalk.bold('Project Configuration:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ${chalk.cyan('Name:')} ${config.name}`);
      console.log(`  ${chalk.cyan('Type:')} ${config.type}`);
      console.log(`  ${chalk.cyan('Port:')} ${config.port}`);
      console.log(`  ${chalk.cyan('Database:')} ${config.needsDatabase ? config.databaseType : 'None'}`);
      console.log(`  ${chalk.cyan('Auth:')} ${config.needsAuth ? 'Yes' : 'No'}`);
      console.log(`  ${chalk.cyan('Domain:')} ${config.domain || 'localhost'}`);
      console.log(chalk.gray('─'.repeat(40)));

      if (options.dryRun) {
        console.log(chalk.yellow('\n[Dry Run] Would create project at:'));
        console.log(`  ${path.join(options.output, config.name)}`);
        return;
      }

      // Check if directory already exists
      const projectPath = path.join(options.output, config.name);
      if (await fs.pathExists(projectPath)) {
        console.log(chalk.red(`\nError: Directory ${config.name} already exists`));
        process.exit(1);
      }

      // Scaffold the project
      const spinner = ora('Scaffolding project...').start();
      await scaffoldProject(config, options.output);
      spinner.succeed('Project scaffolded');

      // Initialize git
      spinner.start('Initializing git repository...');
      try {
        await execa('git', ['init'], { cwd: projectPath });
        await execa('git', ['add', '.'], { cwd: projectPath });
        await execa('git', ['commit', '-m', 'Initial commit from project-kickoff'], {
          cwd: projectPath,
        });
        spinner.succeed('Git repository initialized');
      } catch {
        spinner.warn('Git initialization skipped (git not available or error)');
      }

      // Print next steps
      console.log('\n' + chalk.bold.green('Project created successfully!'));
      console.log('\n' + chalk.bold('Next steps:'));
      console.log(chalk.gray('─'.repeat(40)));
      console.log(`  ${chalk.cyan('1.')} cd ${config.name}`);
      console.log(`  ${chalk.cyan('2.')} npm install`);
      console.log(`  ${chalk.cyan('3.')} npm run dev`);
      console.log(chalk.gray('─'.repeat(40)));

      if (config.domain) {
        console.log('\n' + chalk.bold('Deployment:'));
        console.log(chalk.gray('─'.repeat(40)));
        console.log(`  ${chalk.cyan('1.')} Push to GitHub: git push origin main`);
        console.log(`  ${chalk.cyan('2.')} GitHub Actions will build and push to ghcr.io`);
        console.log(`  ${chalk.cyan('3.')} Pull on VPS: docker compose pull && docker compose up -d`);
        console.log(chalk.gray('─'.repeat(40)));
        console.log(chalk.yellow('\n⚠️  NEVER run docker build on VPS - use GitHub Actions!'));
      }

      console.log('\n' + chalk.blue('Happy coding!') + '\n');
    } catch (error) {
      console.error(chalk.red('\nError:'), error);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List available project templates')
  .action(() => {
    console.log(BANNER);
    console.log(chalk.bold('Presets (quick start):'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  ${chalk.magenta('saas-starter')}     Next.js + Postgres + Auth (production)`);
    console.log(`  ${chalk.magenta('api-microservice')} Express + Postgres (standard)`);
    console.log(`  ${chalk.magenta('quick-cli')}        CLI tool (quick)`);
    console.log(`  ${chalk.magenta('landing-page')}     Static site (quick)`);
    console.log(`  ${chalk.magenta('mcp-tool')}         MCP server for AI tools (quick)`);
    console.log(chalk.gray('─'.repeat(50)));

    console.log('\n' + chalk.bold('Templates:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.dim('  Web'));
    console.log(`    ${chalk.cyan('nextjs')}       Full-stack React with App Router`);
    console.log(`    ${chalk.cyan('vite-react')}   SPA with TypeScript, Tailwind`);
    console.log(`    ${chalk.cyan('static')}       HTML/CSS/JS with nginx`);
    console.log(chalk.dim('  Backend'));
    console.log(`    ${chalk.cyan('api')}          Express.js REST API`);
    console.log(`    ${chalk.cyan('worker')}       Background jobs with BullMQ + Redis`);
    console.log(chalk.dim('  Tools'));
    console.log(`    ${chalk.cyan('cli')}          Command-line app with Commander`);
    console.log(`    ${chalk.cyan('mcp-server')}   MCP server for AI integrations`);
    console.log(`    ${chalk.cyan('library')}      npm package with tsup + vitest`);
    console.log(chalk.gray('─'.repeat(50)));

    console.log('\n' + chalk.bold('Complexity Tracks:'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`  ${chalk.yellow('quick')}        ~5 questions, fast scaffolding`);
    console.log(`  ${chalk.green('standard')}     ~10 questions, full features`);
    console.log(`  ${chalk.red('production')}   ~12+ questions, security-focused`);
    console.log(chalk.gray('─'.repeat(50)));
  });

program.parse();
