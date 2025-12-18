/**
 * Interactive Flow Runner
 * Orchestrates questionnaire, recommendations, and generation
 */

import {
  QuestionFlow,
  allQuestions,
  questionGroups,
  renderQuestion,
  renderProgress,
  renderCategoryHeader,
  renderFinalSummary,
  renderWelcome,
  renderGoodbye,
  renderWarning,
  renderSuccess,
  renderOptionDetails,
  renderComparisonTable,
} from '../questionnaire';
import type { QuestionnaireAnswers } from '../questionnaire/types';
import type { Question } from '../questionnaire/types';
import { recommendStack, createScoringContext } from '../recommender';
import type { UserRequirements } from '../recommender/types';
import { generateProject, validateContext } from '../generator';
import { mapAnswersToContext, contextToDisplayConfig, getSelectionReasoning } from './mapper';
import { getOptionById, databases, orms, authProviders, frontends, backends } from '../knowledge';
import type { StackOption } from '../knowledge/types';
import chalk from 'chalk';

// Run the full interactive questionnaire flow
export async function runInteractiveFlow(): Promise<QuestionnaireAnswers> {
  renderWelcome();

  const flow = new QuestionFlow(allQuestions, {
    allowBack: true,
    allowSkip: false,
    showProgress: true,
    showCategories: true,
    showTradeoffs: true,
  });

  let question = flow.getCurrentQuestion() || flow.getNextQuestion();
  let lastCategory = '';

  while (question) {
    // Show category header when category changes
    if (question.category && question.category !== lastCategory) {
      const group = questionGroups.find(g => g.questions.some(q => q.id === question!.id));
      if (group) {
        renderCategoryHeader(group.name, group.icon);
      }
      lastCategory = question.category;
    }

    // Show progress
    const progress = flow.getProgress();
    renderProgress(progress.current, progress.total);

    // For stack selection questions, show option details if available
    await showOptionDetailsIfApplicable(question, flow.getAnswers());

    // Render question and get answer
    const answer = await renderQuestion(question);
    flow.setAnswer(question.id, answer);

    // Get next question
    question = flow.getNextQuestion();
  }

  return flow.getAnswers();
}

// Show option details for stack selection questions
async function showOptionDetailsIfApplicable(
  question: Question,
  currentAnswers: QuestionnaireAnswers
): Promise<void> {
  // Map question IDs to knowledge base categories
  const categoryMap: Record<string, StackOption[]> = {
    database: databases,
    orm: orms,
    auth: authProviders,
    frontend: frontends,
    backend: backends,
  };

  const category = question.category;
  if (!category || !categoryMap[category]) return;

  // Only show for select-type questions
  if (question.type !== 'select' && question.type !== 'single') return;

  // Get options for this category
  const options = categoryMap[category];
  if (!options || options.length === 0) return;

  // Show comparison table for the top options
  const topOptions = options.slice(0, 5);
  console.log();
  renderComparisonTable(topOptions);
}

// Run questionnaire with recommendations
export async function runWithRecommendations(): Promise<QuestionnaireAnswers> {
  const answers = await runInteractiveFlow();

  // Convert answers to requirements for recommendation
  const requirements: UserRequirements = {
    projectType: answers.projectType || 'web-app',
    runtime: answers.runtime || 'node',
    budget: answers.budget || 'low',
    experience: answers.experience || 'intermediate',
    scale: answers.scale || 'small',
    timeline: answers.timeline || 'normal',
    priorities: answers.priorities || [],
    mustHaveFeatures: answers.mustHaveFeatures || [],
    niceToHaveFeatures: answers.niceToHaveFeatures || [],
    excludeOptions: [],
    preferredOptions: [],
    existingStack: [],
  };

  // Get recommendations
  const recommendations = recommendStack(requirements);

  // Show recommendations summary
  console.log();
  console.log(chalk.bold('📊 Stack Recommendations Based on Your Profile:'));
  console.log(chalk.gray('─'.repeat(50)));

  if (recommendations.frontend) {
    console.log(
      chalk.cyan('Frontend:'),
      recommendations.frontend.recommended.option.name,
      chalk.dim(`(score: ${recommendations.frontend.recommended.score.toFixed(1)})`)
    );
  }
  if (recommendations.backend) {
    console.log(
      chalk.cyan('Backend:'),
      recommendations.backend.recommended.option.name,
      chalk.dim(`(score: ${recommendations.backend.recommended.score.toFixed(1)})`)
    );
  }
  if (recommendations.database) {
    console.log(
      chalk.cyan('Database:'),
      recommendations.database.recommended.option.name,
      chalk.dim(`(score: ${recommendations.database.recommended.score.toFixed(1)})`)
    );
  }
  if (recommendations.auth) {
    console.log(
      chalk.cyan('Auth:'),
      recommendations.auth.recommended.option.name,
      chalk.dim(`(score: ${recommendations.auth.recommended.score.toFixed(1)})`)
    );
  }

  console.log(chalk.gray('─'.repeat(50)));
  console.log();

  return answers;
}

// Full interactive create flow
export async function interactiveCreate(
  projectName: string,
  outputDir: string
): Promise<void> {
  // Run questionnaire
  const answers = await runInteractiveFlow();

  // Map to context
  const context = mapAnswersToContext(answers, projectName);

  // Validate context
  const validation = validateContext(context);
  if (!validation.valid) {
    for (const error of validation.errors) {
      renderWarning(error);
    }
    throw new Error('Invalid project configuration');
  }

  // Show final configuration
  const displayConfig = contextToDisplayConfig(context);
  const reasoning = getSelectionReasoning(context);

  console.log();
  console.log(chalk.bold('📋 Final Configuration:'));
  console.log(chalk.gray('─'.repeat(50)));
  for (const [key, value] of Object.entries(displayConfig)) {
    console.log(`  ${chalk.cyan(key + ':')} ${value}`);
  }
  console.log(chalk.gray('─'.repeat(50)));

  // Generate project
  console.log();
  console.log(chalk.bold('🔨 Generating project...'));

  const result = await generateProject(context, outputDir);

  if (result.success) {
    renderSuccess(`Created ${result.filesCreated.length} files`);

    // Show warnings if any
    for (const warning of result.warnings) {
      renderWarning(warning);
    }

    // Show next steps
    renderGoodbye(projectName);

    if (result.nextSteps.length > 0) {
      console.log(chalk.bold('Next steps:'));
      for (const step of result.nextSteps) {
        console.log(chalk.dim(`  ${step}`));
      }
    }
  } else {
    for (const error of result.errors) {
      console.error(chalk.red(`Error: ${error}`));
    }
    throw new Error('Project generation failed');
  }
}
