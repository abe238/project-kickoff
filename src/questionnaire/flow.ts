/**
 * Question Flow Engine
 * Manages question ordering, conditional logic, and state
 */

import {
  Question,
  QuestionnaireAnswers,
  FlowState,
  FlowEvent,
  FlowEventType,
  FlowConfig,
  FlowResult,
  ValidationResult,
  QuestionGroup,
  defaultFlowConfig,
} from './types';

export class QuestionFlow {
  private questions: Question[];
  private groups: QuestionGroup[];
  private state: FlowState;
  private config: FlowConfig;
  private eventListeners: Map<FlowEventType, Array<(event: FlowEvent) => void>>;

  constructor(
    questions: Question[],
    config: Partial<FlowConfig> = {},
    groups: QuestionGroup[] = []
  ) {
    this.questions = questions;
    this.groups = groups;
    this.config = { ...defaultFlowConfig, ...config };
    this.eventListeners = new Map();

    this.state = {
      currentQuestionIndex: 0,
      answers: {},
      history: [],
      skippedQuestions: [],
      completedCategories: [],
      startTime: new Date(),
      lastInteraction: new Date(),
    };
  }

  // Get current question
  getCurrentQuestion(): Question | null {
    const visibleQuestions = this.getVisibleQuestions();
    const currentId = this.state.history[this.state.history.length - 1];

    if (currentId) {
      return visibleQuestions.find(q => q.id === currentId) || null;
    }

    // Find first unanswered visible question
    return (
      visibleQuestions.find(
        q =>
          this.state.answers[q.id] === undefined &&
          !this.state.skippedQuestions.includes(q.id)
      ) || null
    );
  }

  // Get next question based on current answers
  getNextQuestion(): Question | null {
    const visibleQuestions = this.getVisibleQuestions();
    const currentQuestion = this.getCurrentQuestion();

    if (!currentQuestion) {
      return visibleQuestions.find(
        q =>
          this.state.answers[q.id] === undefined &&
          !this.state.skippedQuestions.includes(q.id)
      ) || null;
    }

    const currentIndex = visibleQuestions.findIndex(q => q.id === currentQuestion.id);

    // Find next unanswered question
    for (let i = currentIndex + 1; i < visibleQuestions.length; i++) {
      const q = visibleQuestions[i];
      if (
        this.state.answers[q.id] === undefined &&
        !this.state.skippedQuestions.includes(q.id)
      ) {
        return q;
      }
    }

    return null;
  }

  // Get previous question
  getPreviousQuestion(): Question | null {
    if (this.state.history.length < 2) {
      return null;
    }

    const previousId = this.state.history[this.state.history.length - 2];
    return this.questions.find(q => q.id === previousId) || null;
  }

  // Get all visible questions based on current answers
  getVisibleQuestions(): Question[] {
    return this.questions.filter(q => {
      if (!q.showWhen) return true;
      return q.showWhen(this.state.answers);
    });
  }

  // Get questions by category
  getQuestionsByCategory(category: string): Question[] {
    return this.questions.filter(q => q.category === category);
  }

  // Set answer for a question
  setAnswer(questionId: string, answer: unknown): void {
    const previousAnswer = this.state.answers[questionId];
    this.state.answers[questionId] = answer;
    this.state.lastInteraction = new Date();

    // Add to history if not already there
    if (!this.state.history.includes(questionId)) {
      this.state.history.push(questionId);
    }

    // Emit event
    this.emit({
      type: 'answer_received',
      questionId,
      answer,
      timestamp: new Date(),
      metadata: { previousAnswer },
    });

    // Check if category is complete
    this.checkCategoryCompletion(questionId);

    // Invalidate dependent answers when parent changes
    this.invalidateDependentAnswers(questionId);
  }

  // Get all answers
  getAnswers(): QuestionnaireAnswers {
    return { ...this.state.answers };
  }

  // Get specific answer
  getAnswer(questionId: string): unknown {
    return this.state.answers[questionId];
  }

  // Navigate back to previous question
  goBack(): Question | null {
    if (!this.config.allowBack || this.state.history.length < 2) {
      return null;
    }

    this.state.history.pop();
    const previousId = this.state.history[this.state.history.length - 1];

    this.emit({
      type: 'navigation_back',
      questionId: previousId,
      timestamp: new Date(),
    });

    return this.questions.find(q => q.id === previousId) || null;
  }

  // Skip current question
  skipQuestion(): Question | null {
    if (!this.config.allowSkip) {
      return null;
    }

    const current = this.getCurrentQuestion();
    if (current && !current.required) {
      this.state.skippedQuestions.push(current.id);
      this.emit({
        type: 'question_skipped',
        questionId: current.id,
        timestamp: new Date(),
      });
    }

    return this.getNextQuestion();
  }

  // Check if flow is complete
  isComplete(): boolean {
    const requiredQuestions = this.getVisibleQuestions().filter(q => q.required !== false);
    return requiredQuestions.every(
      q =>
        this.state.answers[q.id] !== undefined ||
        this.state.skippedQuestions.includes(q.id)
    );
  }

  // Get progress percentage
  getProgress(): { current: number; total: number; percentage: number } {
    const visibleQuestions = this.getVisibleQuestions();
    const answeredCount = visibleQuestions.filter(
      q =>
        this.state.answers[q.id] !== undefined ||
        this.state.skippedQuestions.includes(q.id)
    ).length;

    return {
      current: answeredCount,
      total: visibleQuestions.length,
      percentage: Math.round((answeredCount / visibleQuestions.length) * 100),
    };
  }

  // Validate all answers
  validate(): ValidationResult {
    const errors: Array<{ questionId: string; message: string }> = [];

    for (const question of this.getVisibleQuestions()) {
      if (question.required !== false && this.state.answers[question.id] === undefined) {
        errors.push({
          questionId: question.id,
          message: `${question.message} is required`,
        });
      }

      // Run custom validation for input questions
      if (question.type === 'input' && question.validate) {
        const result = question.validate(this.state.answers[question.id] as string);
        if (typeof result === 'string') {
          errors.push({ questionId: question.id, message: result });
        } else if (!result) {
          errors.push({ questionId: question.id, message: 'Invalid input' });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Get flow result
  getResult(): FlowResult {
    const now = new Date();
    return {
      completed: this.isComplete(),
      cancelled: false,
      answers: this.getAnswers(),
      duration: now.getTime() - this.state.startTime.getTime(),
      questionsAnswered: Object.keys(this.state.answers).length,
      questionsSkipped: this.state.skippedQuestions.length,
    };
  }

  // Cancel the flow
  cancel(): FlowResult {
    this.emit({
      type: 'flow_cancelled',
      timestamp: new Date(),
    });

    return {
      completed: false,
      cancelled: true,
      answers: this.getAnswers(),
      duration: new Date().getTime() - this.state.startTime.getTime(),
      questionsAnswered: Object.keys(this.state.answers).length,
      questionsSkipped: this.state.skippedQuestions.length,
    };
  }

  // Complete the flow
  complete(): FlowResult {
    const result = this.getResult();

    this.emit({
      type: 'flow_completed',
      timestamp: new Date(),
      metadata: { result },
    });

    return result;
  }

  // Reset the flow
  reset(): void {
    this.state = {
      currentQuestionIndex: 0,
      answers: {},
      history: [],
      skippedQuestions: [],
      completedCategories: [],
      startTime: new Date(),
      lastInteraction: new Date(),
    };
  }

  // Restore state (for persistence)
  restoreState(state: Partial<FlowState>): void {
    this.state = {
      ...this.state,
      ...state,
      lastInteraction: new Date(),
    };
  }

  // Get current state (for persistence)
  getState(): FlowState {
    return { ...this.state };
  }

  // Subscribe to events
  on(eventType: FlowEventType, callback: (event: FlowEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(callback);
  }

  // Unsubscribe from events
  off(eventType: FlowEventType, callback: (event: FlowEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  // Private: emit event
  private emit(event: FlowEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  // Private: check if a category is complete
  private checkCategoryCompletion(questionId: string): void {
    const question = this.questions.find(q => q.id === questionId);
    if (!question?.category) return;

    const categoryQuestions = this.getQuestionsByCategory(question.category);
    const allAnswered = categoryQuestions.every(
      q =>
        this.state.answers[q.id] !== undefined ||
        this.state.skippedQuestions.includes(q.id) ||
        (q.showWhen && !q.showWhen(this.state.answers))
    );

    if (allAnswered && !this.state.completedCategories.includes(question.category)) {
      this.state.completedCategories.push(question.category);
      this.emit({
        type: 'category_completed',
        timestamp: new Date(),
        metadata: { category: question.category },
      });
    }
  }

  // Private: invalidate dependent answers when parent changes
  private invalidateDependentAnswers(changedQuestionId: string): void {
    const changedAnswer = this.state.answers[changedQuestionId];

    for (const question of this.questions) {
      if (!question.showWhen) continue;

      // Check if this question depends on the changed question
      const wasVisible = this.state.answers[question.id] !== undefined;
      const isNowVisible = question.showWhen(this.state.answers);

      // If question became hidden, remove its answer
      if (wasVisible && !isNowVisible) {
        delete this.state.answers[question.id];
        const historyIndex = this.state.history.indexOf(question.id);
        if (historyIndex !== -1) {
          this.state.history.splice(historyIndex, 1);
        }
      }
    }
  }
}

// Factory function for creating a flow with groups
export function createGroupedFlow(
  groups: QuestionGroup[],
  config: Partial<FlowConfig> = {}
): QuestionFlow {
  const allQuestions = groups.flatMap(g => g.questions);
  return new QuestionFlow(allQuestions, config, groups);
}

// Helper to process answers through the flow
export async function runFlow(
  flow: QuestionFlow,
  answerProvider: (question: Question) => Promise<unknown>
): Promise<FlowResult> {
  let question = flow.getCurrentQuestion() || flow.getNextQuestion();

  while (question) {
    const answer = await answerProvider(question);
    flow.setAnswer(question.id, answer);
    question = flow.getNextQuestion();
  }

  return flow.complete();
}
