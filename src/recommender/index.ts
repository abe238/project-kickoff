/**
 * Recommendation Engine
 * Main exports and orchestration for stack recommendations
 */

// Export types
export * from './types';

// Export scoring functions
export {
  scoreOption,
  scoreAndRankOptions,
  getTopRecommendation,
  compareOptions,
  getWeightsForProfile,
} from './scorer';

// Export explanation functions
export {
  generateOptionExplanation,
  generateShortSummary,
  generateTradeoffAnalysis,
  generateComparison,
  generateCategoryExplanation,
  generateStackSummary,
  explainChoice,
  formatWarnings,
} from './explainer';

// Re-import for orchestration
import {
  UserRequirements,
  ScoringContext,
  ScoredOption,
  CategoryRecommendation,
  StackRecommendation,
  CompatibilityIssue,
  Warning,
} from './types';
import { scoreAndRankOptions, getWeightsForProfile } from './scorer';
import { generateCategoryExplanation } from './explainer';
import {
  databases,
  orms,
  authProviders,
  frontends,
  backends,
  aiFrameworks,
  vectorDatabases,
  embeddingProviders,
  localAIProviders,
  compatibilityMatrix,
  validateStackSelection,
} from '../knowledge';
import type { StackOption, Complexity, CostTier } from '../knowledge/types';

// Create scoring context from requirements
export function createScoringContext(
  requirements: UserRequirements,
  existingSelections: Record<string, string> = {}
): ScoringContext {
  return {
    requirements,
    weights: getWeightsForProfile(requirements),
    existingSelections,
    compatibilityMatrix,
  };
}

// Recommend options for a single category
export function recommendForCategory<T extends StackOption>(
  category: string,
  options: T[],
  context: ScoringContext,
  count: number = 3
): CategoryRecommendation<T> | null {
  const scored = scoreAndRankOptions(options, context);

  if (scored.length === 0) {
    return null;
  }

  const recommended = scored[0];
  const alternatives = scored.slice(1, count);

  // Generate tradeoff summary
  const tradeoffSummary =
    alternatives.length > 0
      ? `Consider ${alternatives[0].option.name} if you need ${alternatives[0].option.bestFor[0] || 'different features'}`
      : 'This is the clear choice for your requirements';

  return {
    category,
    recommended,
    alternatives,
    explanation: generateCategoryExplanation(
      { category, recommended, alternatives, explanation: '', tradeoffSummary },
      context.requirements
    ),
    tradeoffSummary,
  };
}

// Get full stack recommendation
export function recommendStack(requirements: UserRequirements): StackRecommendation {
  const selections: Record<string, string> = {};
  const warnings: Warning[] = [];
  const reasoning: string[] = [];

  // Create initial context
  let context = createScoringContext(requirements, selections);

  // Recommend each category in dependency order
  const result: Partial<StackRecommendation> = {};

  // 1. Frontend (if needed)
  if (requirements.projectType !== 'api' && requirements.projectType !== 'cli') {
    const frontendRec = recommendForCategory('frontend', frontends, context);
    if (frontendRec) {
      result.frontend = frontendRec;
      selections.frontend = frontendRec.recommended.option.id;
      context = createScoringContext(requirements, selections);
      reasoning.push(
        `Selected ${frontendRec.recommended.option.name} for frontend: ${frontendRec.recommended.option.bestFor[0]}`
      );
    }
  }

  // 2. Backend
  const runtimeBackends = backends.filter(b => b.runtime === requirements.runtime);
  const backendRec = recommendForCategory('backend', runtimeBackends.length > 0 ? runtimeBackends : backends, context);
  if (backendRec) {
    result.backend = backendRec;
    selections.backend = backendRec.recommended.option.id;
    context = createScoringContext(requirements, selections);
    reasoning.push(
      `Selected ${backendRec.recommended.option.name} for backend: ${backendRec.recommended.option.bestFor[0]}`
    );
  }

  // 3. Database
  const dbRec = recommendForCategory('database', databases, context);
  if (dbRec) {
    result.database = dbRec;
    selections.database = dbRec.recommended.option.id;
    context = createScoringContext(requirements, selections);
    reasoning.push(
      `Selected ${dbRec.recommended.option.name} for database: ${dbRec.recommended.option.bestFor[0]}`
    );
  }

  // 4. ORM (if database selected and not BaaS)
  if (result.database && !['convex', 'firebase', 'pocketbase'].includes(selections.database)) {
    const ormRec = recommendForCategory('orm', orms, context);
    if (ormRec) {
      result.orm = ormRec;
      selections.orm = ormRec.recommended.option.id;
      context = createScoringContext(requirements, selections);
      reasoning.push(
        `Selected ${ormRec.recommended.option.name} for ORM: ${ormRec.recommended.option.bestFor[0]}`
      );
    }
  }

  // 5. Auth
  const authRec = recommendForCategory('auth', authProviders, context);
  if (authRec) {
    result.auth = authRec;
    selections.auth = authRec.recommended.option.id;
    context = createScoringContext(requirements, selections);
    reasoning.push(
      `Selected ${authRec.recommended.option.name} for auth: ${authRec.recommended.option.bestFor[0]}`
    );
  }

  // 6. AI (if needed)
  if (requirements.projectType === 'ai-app' || requirements.mustHaveFeatures.some(f => f.toLowerCase().includes('ai'))) {
    const aiRec = recommendForCategory('ai', aiFrameworks, context);
    if (aiRec) {
      result.ai = aiRec;
      selections.ai = aiRec.recommended.option.id;
      context = createScoringContext(requirements, selections);
      reasoning.push(
        `Selected ${aiRec.recommended.option.name} for AI: ${aiRec.recommended.option.bestFor[0]}`
      );
    }

    // Vector DB for AI apps
    const vectorRec = recommendForCategory('vectorDb', vectorDatabases, context);
    if (vectorRec) {
      result.vectorDb = vectorRec;
      selections.vectorDb = vectorRec.recommended.option.id;
      context = createScoringContext(requirements, selections);
    }
  }

  // Validate compatibility
  const validation = validateStackSelection(selections);
  const compatibilityIssues: CompatibilityIssue[] = validation.conflicts.map(c => ({
    optionA: c.optionA,
    optionB: c.optionB,
    severity: 'critical' as const,
    message: c.reason || `${c.optionA} and ${c.optionB} are incompatible`,
    resolution: 'Consider alternative options for one of these choices',
  }));

  // Calculate overall score
  const categoryScores = [
    result.frontend?.recommended.score,
    result.backend?.recommended.score,
    result.database?.recommended.score,
    result.orm?.recommended.score,
    result.auth?.recommended.score,
    result.ai?.recommended.score,
  ].filter((s): s is number => s !== undefined);

  const overallScore =
    categoryScores.length > 0
      ? categoryScores.reduce((a, b) => a + b, 0) / categoryScores.length
      : 0;

  // Calculate overall complexity
  const complexities = [
    result.frontend?.recommended.option.complexity,
    result.backend?.recommended.option.complexity,
    result.database?.recommended.option.complexity,
    result.orm?.recommended.option.complexity,
    result.auth?.recommended.option.complexity,
  ].filter((c): c is Complexity => c !== undefined);

  const complexityCount = {
    high: complexities.filter(c => c === 'high').length,
    medium: complexities.filter(c => c === 'medium').length,
    low: complexities.filter(c => c === 'low').length,
  };

  const overallComplexity: Complexity =
    complexityCount.high >= 2 ? 'high' : complexityCount.low >= 3 ? 'low' : 'medium';

  // Calculate total cost
  const totalEstimatedCost: CostTier = {
    free: true,
    hobbyist: null,
    startup: null,
    enterprise: null,
  };

  // Collect all warnings from recommendations
  const allWarnings = [
    ...(result.frontend?.recommended.warnings || []),
    ...(result.backend?.recommended.warnings || []),
    ...(result.database?.recommended.warnings || []),
    ...(result.orm?.recommended.warnings || []),
    ...(result.auth?.recommended.warnings || []),
    ...(result.ai?.recommended.warnings || []),
  ];

  return {
    ...result,
    overallScore,
    overallReasoning: reasoning,
    overallWarnings: [...warnings, ...allWarnings],
    totalEstimatedCost,
    overallComplexity,
    compatibilityIssues,
  } as StackRecommendation;
}

// Quick recommendation for a specific category
export function quickRecommend(
  category: 'database' | 'orm' | 'auth' | 'frontend' | 'backend' | 'ai' | 'vectorDb',
  requirements: Partial<UserRequirements>
): ScoredOption | null {
  const fullRequirements: UserRequirements = {
    projectType: requirements.projectType || 'web-app',
    runtime: requirements.runtime || 'node',
    budget: requirements.budget || 'low',
    experience: requirements.experience || 'intermediate',
    scale: requirements.scale || 'small',
    timeline: requirements.timeline || 'normal',
    priorities: requirements.priorities || [],
    mustHaveFeatures: requirements.mustHaveFeatures || [],
    niceToHaveFeatures: requirements.niceToHaveFeatures || [],
    excludeOptions: requirements.excludeOptions || [],
    preferredOptions: requirements.preferredOptions || [],
    existingStack: requirements.existingStack || [],
  };

  const context = createScoringContext(fullRequirements);

  const optionsMap: Record<string, StackOption[]> = {
    database: databases,
    orm: orms,
    auth: authProviders,
    frontend: frontends,
    backend: backends,
    ai: aiFrameworks,
    vectorDb: vectorDatabases,
  };

  const options = optionsMap[category];
  if (!options) return null;

  const ranked = scoreAndRankOptions(options, context);
  return ranked[0] || null;
}

// Get recommendations with detailed explanation
export function explainRecommendations(requirements: UserRequirements): string {
  const rec = recommendStack(requirements);
  const lines: string[] = [];

  lines.push('╔════════════════════════════════════════════════════════════╗');
  lines.push('║        STACK RECOMMENDATION ANALYSIS                       ║');
  lines.push('╚════════════════════════════════════════════════════════════╝');
  lines.push('');

  // User profile
  lines.push('📋 Your Profile:');
  lines.push(`   Project Type: ${requirements.projectType}`);
  lines.push(`   Experience: ${requirements.experience}`);
  lines.push(`   Budget: ${requirements.budget}`);
  lines.push(`   Scale: ${requirements.scale}`);
  lines.push(`   Timeline: ${requirements.timeline}`);
  lines.push('');

  // Category explanations
  if (rec.frontend) {
    lines.push(rec.frontend.explanation);
  }
  if (rec.backend) {
    lines.push(rec.backend.explanation);
  }
  if (rec.database) {
    lines.push(rec.database.explanation);
  }
  if (rec.orm) {
    lines.push(rec.orm.explanation);
  }
  if (rec.auth) {
    lines.push(rec.auth.explanation);
  }
  if (rec.ai) {
    lines.push(rec.ai.explanation);
  }

  return lines.join('\n');
}
