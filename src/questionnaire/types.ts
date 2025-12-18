/**
 * Questionnaire Types
 * Interfaces for the interactive question flow system
 */

import { ProjectType, Runtime } from '../knowledge/types';
import { BudgetLevel, ExperienceLevel, ScaleRequirement, TimelineUrgency } from '../recommender/types';

// Question types
export type QuestionType = 'single' | 'multi' | 'confirm' | 'input' | 'select';

// Base question interface
export interface BaseQuestion {
  id: string;
  type: QuestionType;
  message: string;
  description?: string;
  icon?: string;
  helpText?: string;
  required?: boolean;
  showWhen?: (answers: QuestionnaireAnswers) => boolean;
  category?: string;
  order?: number;
}

// Choice for single/multi select questions
export interface QuestionChoice {
  value: string;
  name: string;
  description?: string;
  shortDescription?: string;
  icon?: string;
  disabled?: boolean;
  disabledReason?: string;
  pros?: string[];
  cons?: string[];
  tradeoffs?: string[];
  complexity?: string;
  cost?: string;
}

// Single choice question
export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single' | 'select';
  choices: QuestionChoice[];
  default?: string;
}

// Multi choice question
export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi';
  choices: QuestionChoice[];
  default?: string[];
  min?: number;
  max?: number;
}

// Confirmation question
export interface ConfirmQuestion extends BaseQuestion {
  type: 'confirm';
  default?: boolean;
}

// Text input question
export interface InputQuestion extends BaseQuestion {
  type: 'input';
  default?: string;
  placeholder?: string;
  validate?: (input: string) => boolean | string;
  transform?: (input: string) => string;
}

// Union type for all questions
export type Question =
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | ConfirmQuestion
  | InputQuestion;

// Questionnaire-specific answers (maps to recommender UserRequirements)
export interface QuestionnaireAnswers {
  projectName?: string;
  projectType?: ProjectType;
  runtime?: Runtime;
  budget?: BudgetLevel;
  experience?: ExperienceLevel;
  scale?: ScaleRequirement;
  timeline?: TimelineUrgency;
  frontend?: string;
  backend?: string;
  database?: string;
  orm?: string;
  auth?: string;
  ai?: string;
  vectorDb?: string;
  embedding?: string;
  localAi?: string;
  priorities?: string[];
  mustHaveFeatures?: string[];
  niceToHaveFeatures?: string[];
  includeDocker?: boolean;
  includeGithubActions?: boolean;
  includeTests?: boolean;
  includeLinting?: boolean;
  [key: string]: unknown;
}

// Question flow state
export interface FlowState {
  currentQuestionIndex: number;
  answers: QuestionnaireAnswers;
  history: string[];        // Stack of question IDs for back navigation
  skippedQuestions: string[];
  completedCategories: string[];
  startTime: Date;
  lastInteraction: Date;
}

// Flow event types
export type FlowEventType =
  | 'question_shown'
  | 'answer_received'
  | 'question_skipped'
  | 'category_completed'
  | 'flow_completed'
  | 'flow_cancelled'
  | 'navigation_back'
  | 'validation_error';

// Flow event
export interface FlowEvent {
  type: FlowEventType;
  questionId?: string;
  answer?: unknown;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Question group for organized flow
export interface QuestionGroup {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  questions: Question[];
  order: number;
}

// Flow configuration
export interface FlowConfig {
  allowBack: boolean;
  allowSkip: boolean;
  showProgress: boolean;
  showCategories: boolean;
  showTradeoffs: boolean;
  validateOnChange: boolean;
  persistState: boolean;
  timeout?: number;         // Session timeout in minutes
}

// Default flow configuration
export const defaultFlowConfig: FlowConfig = {
  allowBack: true,
  allowSkip: false,
  showProgress: true,
  showCategories: true,
  showTradeoffs: true,
  validateOnChange: true,
  persistState: false,
};

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    questionId: string;
    message: string;
  }>;
}

// Flow completion result
export interface FlowResult {
  completed: boolean;
  cancelled: boolean;
  answers: QuestionnaireAnswers;
  duration: number;           // In milliseconds
  questionsAnswered: number;
  questionsSkipped: number;
}

// Question rendering hint
export interface RenderHint {
  layout: 'list' | 'grid' | 'cards';
  showDescription: boolean;
  showIcons: boolean;
  showTradeoffs: boolean;
  maxVisible?: number;
  searchable?: boolean;
}

// Default render hints by question type
export const defaultRenderHints: Record<QuestionType, RenderHint> = {
  single: {
    layout: 'list',
    showDescription: true,
    showIcons: true,
    showTradeoffs: false,
  },
  select: {
    layout: 'list',
    showDescription: true,
    showIcons: true,
    showTradeoffs: true,
    searchable: true,
  },
  multi: {
    layout: 'list',
    showDescription: true,
    showIcons: true,
    showTradeoffs: false,
  },
  confirm: {
    layout: 'list',
    showDescription: false,
    showIcons: false,
    showTradeoffs: false,
  },
  input: {
    layout: 'list',
    showDescription: true,
    showIcons: false,
    showTradeoffs: false,
  },
};
