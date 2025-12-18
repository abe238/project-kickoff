/**
 * Answer Mapper
 * Converts questionnaire answers to generator context
 */

import type { GeneratorContext } from '../generator/types';
import type { QuestionnaireAnswers } from '../questionnaire/types';
import type { ProjectType, Runtime, StackOption } from '../knowledge/types';
import { getOptionById } from '../knowledge';

// Map questionnaire answers to generator context
export function mapAnswersToContext(
  answers: QuestionnaireAnswers,
  projectName: string
): GeneratorContext {
  const selections: Record<string, string> = {};
  const options: Record<string, StackOption | undefined> = {};

  // Map category selections
  const categoryFields: Array<keyof QuestionnaireAnswers> = [
    'frontend',
    'backend',
    'database',
    'orm',
    'auth',
    'ai',
    'vectorDb',
    'embedding',
    'localAi',
  ];

  for (const field of categoryFields) {
    const value = answers[field];
    if (value && typeof value === 'string' && value !== 'none') {
      selections[field] = value;

      // Try to get the full option object from knowledge base
      const option = getOptionById(value);
      if (option) {
        options[field] = option;
      }
    }
  }

  return {
    projectName,
    projectType: (answers.projectType as ProjectType) || 'web-app',
    runtime: (answers.runtime as Runtime) || 'node',
    selections,
    options,
    features: {
      docker: answers.includeDocker ?? true,
      githubActions: answers.includeGithubActions ?? false,
      tests: answers.includeTests ?? false,
      linting: answers.includeLinting ?? true,
    },
    metadata: {
      description: typeof answers.projectName === 'string' ? `${answers.projectName} project` : undefined,
    },
  };
}

// Map generator context back to display-friendly format
export function contextToDisplayConfig(context: GeneratorContext): Record<string, string> {
  const display: Record<string, string> = {
    'Project Name': context.projectName,
    'Project Type': context.projectType,
    'Runtime': context.runtime,
  };

  // Add selections with proper names
  for (const [key, value] of Object.entries(context.selections)) {
    const option = context.options[key];
    const displayName = key.charAt(0).toUpperCase() + key.slice(1);
    display[displayName] = typeof option === 'object' && option && 'name' in option
      ? (option as { name: string }).name
      : value;
  }

  // Add features
  if (context.features.docker) display['Docker'] = 'Yes';
  if (context.features.githubActions) display['GitHub Actions'] = 'Yes';
  if (context.features.tests) display['Tests'] = 'Yes';
  if (context.features.linting) display['Linting'] = 'Yes';

  return display;
}

// Get reasoning for each selection based on knowledge base
export function getSelectionReasoning(context: GeneratorContext): Record<string, string> {
  const reasoning: Record<string, string> = {};

  for (const [key, value] of Object.entries(context.selections)) {
    const option = context.options[key];
    if (typeof option === 'object' && option && 'bestFor' in option) {
      const bestFor = (option as { bestFor: string[] }).bestFor;
      reasoning[key] = bestFor[0] || `Selected ${value}`;
    } else {
      reasoning[key] = `Selected ${value}`;
    }
  }

  return reasoning;
}
