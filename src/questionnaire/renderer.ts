/**
 * CLI Renderer for Interactive Questionnaire
 * Displays questions, options with pros/cons, and final stack summary
 */

import { select, checkbox, confirm, input } from '@inquirer/prompts';
import boxen from 'boxen';
import chalk from 'chalk';
import {
  Question,
  SingleChoiceQuestion,
  MultiChoiceQuestion,
  ConfirmQuestion,
  InputQuestion,
  QuestionChoice,
} from './types';
import type { StackOption } from '../knowledge/types';

// Render a question and get the answer
export async function renderQuestion(question: Question): Promise<unknown> {
  console.log();
  console.log(chalk.bold(`${question.icon || '❓'} ${question.message}`));
  if (question.description) {
    console.log(chalk.dim(question.description));
  }
  console.log();

  switch (question.type) {
    case 'single':
    case 'select':
      return renderSingleChoice(question as SingleChoiceQuestion);
    case 'multi':
      return renderMultiChoice(question as MultiChoiceQuestion);
    case 'confirm':
      return renderConfirm(question as ConfirmQuestion);
    case 'input':
      return renderInput(question as InputQuestion);
    default:
      throw new Error(`Unknown question type: ${(question as Question).type}`);
  }
}

// Render single choice question
async function renderSingleChoice(question: SingleChoiceQuestion): Promise<string> {
  const choices = question.choices.map(choice => ({
    value: choice.value,
    name: formatChoiceName(choice),
    description: choice.shortDescription || choice.description,
  }));

  return select({
    message: '',
    choices,
    default: question.default,
  });
}

// Render multi choice question
async function renderMultiChoice(question: MultiChoiceQuestion): Promise<string[]> {
  const choices = question.choices.map(choice => ({
    value: choice.value,
    name: formatChoiceName(choice),
    description: choice.shortDescription || choice.description,
  }));

  return checkbox({
    message: '',
    choices,
    required: question.min !== undefined && question.min > 0,
  });
}

// Render confirm question
async function renderConfirm(question: ConfirmQuestion): Promise<boolean> {
  return confirm({
    message: '',
    default: question.default,
  });
}

// Render input question
async function renderInput(question: InputQuestion): Promise<string> {
  return input({
    message: '',
    default: question.default,
    validate: question.validate,
  });
}

// Format choice name with optional complexity/cost indicators
function formatChoiceName(choice: QuestionChoice): string {
  let name = choice.name;

  if (choice.complexity) {
    const complexityIcon =
      choice.complexity === 'low' ? '🟢' : choice.complexity === 'medium' ? '🟡' : '🔴';
    name += ` ${complexityIcon}`;
  }

  if (choice.cost) {
    name += chalk.dim(` (${choice.cost})`);
  }

  return name;
}

// Render detailed option card with pros/cons/tradeoffs
export function renderOptionDetails<T extends StackOption>(option: T): void {
  const width = Math.min(process.stdout.columns || 80, 80);
  const halfWidth = Math.floor(width / 2) - 2;

  // Header box
  console.log(
    boxen(`${chalk.bold(option.name)}\n${option.description}`, {
      padding: 1,
      borderColor: 'blue',
      title: option.logoEmoji || '📦',
      titleAlignment: 'left',
      width,
    })
  );

  // Pros box
  const prosContent = option.pros.map(pro => chalk.green(`  ✓ ${pro}`)).join('\n');
  console.log(
    boxen(`${chalk.green.bold('PROS')}\n${prosContent || '  None listed'}`, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'green',
      width: halfWidth,
    })
  );

  // Cons box
  const consContent = option.cons.map(con => chalk.red(`  ✗ ${con}`)).join('\n');
  console.log(
    boxen(`${chalk.red.bold('CONS')}\n${consContent || '  None listed'}`, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'red',
      width: halfWidth,
    })
  );

  // Tradeoffs box
  if (option.tradeoffs.length > 0) {
    const tradeoffsContent = option.tradeoffs.map(t => chalk.yellow(`  ⚖ ${t}`)).join('\n');
    console.log(
      boxen(`${chalk.yellow.bold('TRADEOFFS')}\n${tradeoffsContent}`, {
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        borderColor: 'yellow',
        width,
      })
    );
  }

  console.log();
}

// Render comparison table for multiple options
export function renderComparisonTable<T extends StackOption>(
  options: T[],
  highlightId?: string
): void {
  const width = Math.min(process.stdout.columns || 100, 100);

  console.log(
    boxen(chalk.bold('📊 Comparison'), {
      padding: 0,
      borderColor: 'cyan',
      width,
    })
  );

  // Table header
  const header = `${'Option'.padEnd(20)} ${'Complexity'.padEnd(12)} ${'Cost'.padEnd(15)} ${'Best For'.padEnd(40)}`;
  console.log(chalk.bold.cyan(header));
  console.log(chalk.dim('─'.repeat(width - 4)));

  // Table rows
  for (const option of options) {
    const isHighlighted = option.id === highlightId;
    const complexityColor =
      option.complexity === 'low' ? chalk.green : option.complexity === 'medium' ? chalk.yellow : chalk.red;

    const row = `${option.name.padEnd(20)} ${complexityColor(option.complexity.padEnd(12))} ${formatCost(option.monthlyCost).padEnd(15)} ${(option.bestFor[0] || '').slice(0, 40).padEnd(40)}`;

    console.log(isHighlighted ? chalk.bold.white(row) : row);
  }

  console.log();
}

// Format cost tier for display
function formatCost(costTier: StackOption['monthlyCost']): string {
  if (costTier.free) return chalk.green('Free');
  if (costTier.hobbyist) return chalk.blue(`$${costTier.hobbyist}/mo`);
  if (costTier.startup) return chalk.yellow(`$${costTier.startup}/mo`);
  return chalk.red('Enterprise');
}

// Render progress bar
export function renderProgress(current: number, total: number): void {
  const percentage = Math.round((current / total) * 100);
  const barWidth = 30;
  const filled = Math.round((current / total) * barWidth);
  const empty = barWidth - filled;

  const bar = chalk.green('█'.repeat(filled)) + chalk.dim('░'.repeat(empty));
  console.log(chalk.dim(`Progress: [${bar}] ${percentage}% (${current}/${total})`));
  console.log();
}

// Render category header
export function renderCategoryHeader(name: string, icon?: string): void {
  console.log();
  console.log(
    boxen(chalk.bold(`${icon || '📁'} ${name}`), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'magenta',
      borderStyle: 'round',
    })
  );
}

// Render final stack summary
export function renderFinalSummary(
  selections: Record<string, StackOption | string>,
  reasoning: Record<string, string>
): void {
  const width = Math.min(process.stdout.columns || 80, 80);

  console.log();
  console.log(
    boxen(chalk.bold.green('🎉 Your Stack Selection'), {
      padding: 1,
      borderColor: 'green',
      borderStyle: 'double',
      width,
    })
  );

  // Render each selection
  Object.entries(selections).forEach(([category, selection]) => {
    const name = typeof selection === 'string' ? selection : selection.name;
    const icon = typeof selection === 'object' && selection.logoEmoji ? selection.logoEmoji : '📦';

    console.log(chalk.bold(`  ${icon} ${capitalizeFirst(category)}: ${chalk.cyan(name)}`));

    if (reasoning[category]) {
      console.log(chalk.dim(`     ${reasoning[category]}`));
    }
  });

  console.log();
}

// Render recommendation reasoning
export function renderRecommendation(
  category: string,
  recommended: StackOption,
  reason: string
): void {
  console.log(
    boxen(
      `${chalk.bold.green('✓ Recommended:')} ${recommended.name}\n\n${chalk.dim(reason)}`,
      {
        padding: 1,
        borderColor: 'green',
        title: `${recommended.logoEmoji || '📦'} ${capitalizeFirst(category)}`,
        titleAlignment: 'left',
      }
    )
  );
}

// Render warning message
export function renderWarning(message: string): void {
  console.log(
    boxen(chalk.yellow(`⚠️  ${message}`), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'yellow',
    })
  );
}

// Render error message
export function renderError(message: string): void {
  console.log(
    boxen(chalk.red(`❌ ${message}`), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'red',
    })
  );
}

// Render success message
export function renderSuccess(message: string): void {
  console.log(
    boxen(chalk.green(`✅ ${message}`), {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: 'green',
    })
  );
}

// Render info message
export function renderInfo(message: string): void {
  console.log(chalk.cyan(`ℹ️  ${message}`));
}

// Helper: capitalize first letter
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Render welcome banner
export function renderWelcome(): void {
  console.log(
    boxen(
      `${chalk.bold.cyan('project-kickoff')}\n\n${chalk.dim('Interactive stack selection for your next project')}`,
      {
        padding: 1,
        borderColor: 'cyan',
        borderStyle: 'round',
        textAlignment: 'center',
      }
    )
  );
  console.log();
}

// Render goodbye message
export function renderGoodbye(projectName: string): void {
  console.log();
  console.log(
    boxen(
      `${chalk.bold.green('🚀 Project scaffolded successfully!')}\n\n` +
        `${chalk.dim('Next steps:')}\n` +
        `  ${chalk.cyan(`cd ${projectName}`)}\n` +
        `  ${chalk.cyan('npm install')}\n` +
        `  ${chalk.cyan('npm run dev')}`,
      {
        padding: 1,
        borderColor: 'green',
        borderStyle: 'double',
      }
    )
  );
}
