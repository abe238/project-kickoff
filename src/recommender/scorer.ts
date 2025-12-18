/**
 * Recommendation Scoring Engine
 * Scores stack options based on user requirements
 */

import { StackOption, Complexity, CostTier } from '../knowledge/types';
import {
  ScoredOption,
  UserRequirements,
  ScoreWeights,
  ScoringContext,
  ReasoningItem,
  Warning,
  defaultWeights,
  beginnerWeights,
  enterpriseWeights,
  BudgetLevel,
  ExperienceLevel,
} from './types';
import { areCompatible, getIncompatibleOptions } from '../knowledge/compatibility';

// Complexity score mapping
const complexityScores: Record<Complexity, number> = {
  low: 100,
  medium: 60,
  high: 30,
};

// Complexity preference by experience
const complexityPreference: Record<ExperienceLevel, Complexity[]> = {
  beginner: ['low'],
  intermediate: ['low', 'medium'],
  advanced: ['medium', 'high'],
  expert: ['low', 'medium', 'high'],
};

// Budget level mapping
const budgetLevelValues: Record<BudgetLevel, number> = {
  free: 0,
  low: 25,
  medium: 100,
  high: 500,
  unlimited: Infinity,
};

// Get weights based on user profile
export function getWeightsForProfile(requirements: UserRequirements): ScoreWeights {
  if (requirements.experience === 'beginner') {
    return beginnerWeights;
  }
  if (requirements.needsEnterprise || requirements.scale === 'enterprise') {
    return enterpriseWeights;
  }
  return defaultWeights;
}

// Score an option's complexity against requirements
function scoreComplexity<T extends StackOption>(
  option: T,
  requirements: UserRequirements
): { score: number; reasoning: ReasoningItem; warning?: Warning } {
  const preferredComplexities = complexityPreference[requirements.experience];
  const isPreferred = preferredComplexities.includes(option.complexity);
  const baseScore = complexityScores[option.complexity];

  let adjustedScore = baseScore;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let explanation = '';

  if (isPreferred) {
    adjustedScore = baseScore + 20;
    impact = 'positive';
    explanation = `${option.name}'s ${option.complexity} complexity aligns well with your ${requirements.experience} experience level`;
  } else if (requirements.experience === 'beginner' && option.complexity === 'high') {
    adjustedScore = baseScore - 30;
    impact = 'negative';
    explanation = `${option.name} has high complexity which may be challenging for beginners`;
  } else if (requirements.timeline === 'urgent' && option.complexity === 'high') {
    adjustedScore = baseScore - 20;
    impact = 'negative';
    explanation = `${option.name}'s high complexity may slow down your urgent timeline`;
  }

  const reasoning: ReasoningItem = {
    factor: 'complexity',
    impact,
    weight: adjustedScore,
    explanation,
  };

  const warning: Warning | undefined =
    !isPreferred && option.complexity === 'high'
      ? {
          severity: 'warning',
          category: 'complexity',
          message: `${option.name} has high complexity`,
          suggestion: 'Consider alternatives if you need faster time-to-market',
        }
      : undefined;

  return { score: Math.max(0, Math.min(100, adjustedScore)), reasoning, warning };
}

// Score an option's cost against budget
function scoreCost<T extends StackOption>(
  option: T,
  requirements: UserRequirements
): { score: number; reasoning: ReasoningItem; warning?: Warning } {
  const { monthlyCost } = option;
  const budgetLimit = budgetLevelValues[requirements.budget];

  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let explanation = '';
  let warning: Warning | undefined;

  // Free options always score well for cost
  if (monthlyCost.free && requirements.budget === 'free') {
    score = 100;
    impact = 'positive';
    explanation = `${option.name} is free, matching your budget requirement`;
  } else if (monthlyCost.free) {
    score = 90;
    impact = 'positive';
    explanation = `${option.name} offers a free tier`;
  } else {
    // Parse hobbyist cost
    const hobbyistCost = monthlyCost.hobbyist;
    if (hobbyistCost) {
      const costValue = parseInt(hobbyistCost.replace(/[^0-9]/g, ''), 10) || 0;
      if (costValue > budgetLimit && requirements.budget !== 'unlimited') {
        score = 30;
        impact = 'negative';
        explanation = `${option.name}'s cost (${hobbyistCost}/mo) exceeds your ${requirements.budget} budget`;
        warning = {
          severity: 'warning',
          category: 'cost',
          message: `${option.name} may exceed your budget at ${hobbyistCost}/month`,
          suggestion: 'Consider free alternatives or adjust budget expectations',
        };
      } else {
        score = 70;
        impact = 'neutral';
        explanation = `${option.name} costs ${hobbyistCost}/mo, within your budget`;
      }
    }
  }

  return {
    score,
    reasoning: { factor: 'cost', impact, weight: score, explanation },
    warning,
  };
}

// Score compatibility with existing selections
function scoreCompatibility<T extends StackOption>(
  option: T,
  context: ScoringContext
): { score: number; reasoning: ReasoningItem; warning?: Warning } {
  const existingIds = Object.values(context.existingSelections).filter(id => id && id !== 'none');

  if (existingIds.length === 0) {
    return {
      score: 100,
      reasoning: {
        factor: 'compatibility',
        impact: 'neutral',
        weight: 100,
        explanation: 'No existing selections to check compatibility against',
      },
    };
  }

  let compatibleCount = 0;
  let incompatibleCount = 0;
  const incompatibilities: string[] = [];

  for (const existingId of existingIds) {
    if (areCompatible(option.id, existingId)) {
      compatibleCount++;
    } else {
      incompatibleCount++;
      incompatibilities.push(existingId);
    }
  }

  const score = incompatibleCount > 0 ? 20 : 100;
  const impact = incompatibleCount > 0 ? 'negative' : 'positive';
  const explanation =
    incompatibleCount > 0
      ? `${option.name} is incompatible with: ${incompatibilities.join(', ')}`
      : `${option.name} is compatible with all your selected options`;

  const warning: Warning | undefined =
    incompatibleCount > 0
      ? {
          severity: 'critical',
          category: 'compatibility',
          message: `${option.name} conflicts with ${incompatibilities.join(', ')}`,
          suggestion: 'Choose a compatible alternative or change conflicting selections',
        }
      : undefined;

  return {
    score,
    reasoning: { factor: 'compatibility', impact, weight: score, explanation },
    warning,
  };
}

// Score feature match
function scoreFeatures<T extends StackOption>(
  option: T,
  requirements: UserRequirements
): { score: number; reasoning: ReasoningItem } {
  const { mustHaveFeatures, niceToHaveFeatures, priorities } = requirements;
  let score = 70; // Base score
  const matches: string[] = [];
  const missing: string[] = [];

  // Check pros for feature matches
  const optionFeatures = [...option.pros, ...option.bestFor].map(f => f.toLowerCase());

  for (const feature of mustHaveFeatures) {
    const hasFeature = optionFeatures.some(f => f.includes(feature.toLowerCase()));
    if (hasFeature) {
      score += 10;
      matches.push(feature);
    } else {
      score -= 15;
      missing.push(feature);
    }
  }

  for (const feature of niceToHaveFeatures) {
    const hasFeature = optionFeatures.some(f => f.includes(feature.toLowerCase()));
    if (hasFeature) {
      score += 5;
      matches.push(feature);
    }
  }

  // Check priority alignment
  for (const priority of priorities) {
    const alignsWithPriority =
      option.pros.some(p => p.toLowerCase().includes(priority.toLowerCase())) ||
      option.bestFor.some(b => b.toLowerCase().includes(priority.toLowerCase()));
    if (alignsWithPriority) {
      score += 8;
    }
  }

  const impact = missing.length > 0 ? 'negative' : matches.length > 0 ? 'positive' : 'neutral';
  const explanation =
    matches.length > 0
      ? `${option.name} matches: ${matches.join(', ')}`
      : missing.length > 0
        ? `${option.name} missing: ${missing.join(', ')}`
        : `${option.name} partially matches your requirements`;

  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: { factor: 'features', impact, weight: score, explanation },
  };
}

// Score ecosystem maturity
function scoreEcosystem<T extends StackOption>(option: T): { score: number; reasoning: ReasoningItem } {
  // Higher score for more documented, established options
  let score = 70;

  if (option.documentationUrl) {
    score += 10;
  }

  const ecosystemIndicators = [
    'large community',
    'active',
    'mature',
    'established',
    'popular',
    'widely used',
  ];

  for (const indicator of ecosystemIndicators) {
    if (option.pros.some(p => p.toLowerCase().includes(indicator))) {
      score += 5;
    }
  }

  const newIndicators = ['newer', 'young', 'less mature', 'smaller community'];
  for (const indicator of newIndicators) {
    if (option.cons.some(c => c.toLowerCase().includes(indicator))) {
      score -= 10;
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    reasoning: {
      factor: 'ecosystem',
      impact: score >= 70 ? 'positive' : 'neutral',
      weight: score,
      explanation:
        score >= 80
          ? `${option.name} has a mature ecosystem`
          : score >= 60
            ? `${option.name} has a growing ecosystem`
            : `${option.name} has a smaller ecosystem`,
    },
  };
}

// Score user preferences (explicit likes/dislikes)
function scorePreferences<T extends StackOption>(
  option: T,
  requirements: UserRequirements
): { score: number; reasoning: ReasoningItem } {
  if (requirements.excludeOptions.includes(option.id)) {
    return {
      score: 0,
      reasoning: {
        factor: 'preference',
        impact: 'negative',
        weight: 0,
        explanation: `${option.name} was explicitly excluded`,
      },
    };
  }

  if (requirements.preferredOptions.includes(option.id)) {
    return {
      score: 100,
      reasoning: {
        factor: 'preference',
        impact: 'positive',
        weight: 100,
        explanation: `${option.name} was explicitly preferred`,
      },
    };
  }

  return {
    score: 70,
    reasoning: {
      factor: 'preference',
      impact: 'neutral',
      weight: 70,
      explanation: 'No explicit preference',
    },
  };
}

// Main scoring function
export function scoreOption<T extends StackOption>(
  option: T,
  context: ScoringContext
): ScoredOption<T> {
  const { requirements, weights } = context;
  const reasoning: ReasoningItem[] = [];
  const warnings: Warning[] = [];

  // Skip excluded options
  if (requirements.excludeOptions.includes(option.id)) {
    return {
      option,
      score: 0,
      reasoning: [{ factor: 'excluded', impact: 'negative', weight: 0, explanation: 'Explicitly excluded' }],
      warnings: [],
      alternatives: [],
      rank: 999,
    };
  }

  // Calculate individual scores
  const complexityResult = scoreComplexity(option, requirements);
  const costResult = scoreCost(option, requirements);
  const compatibilityResult = scoreCompatibility(option, context);
  const featuresResult = scoreFeatures(option, requirements);
  const ecosystemResult = scoreEcosystem(option);
  const preferenceResult = scorePreferences(option, requirements);

  // Collect reasoning
  reasoning.push(complexityResult.reasoning);
  reasoning.push(costResult.reasoning);
  reasoning.push(compatibilityResult.reasoning);
  reasoning.push(featuresResult.reasoning);
  reasoning.push(ecosystemResult.reasoning);
  reasoning.push(preferenceResult.reasoning);

  // Collect warnings
  if (complexityResult.warning) warnings.push(complexityResult.warning);
  if (costResult.warning) warnings.push(costResult.warning);
  if (compatibilityResult.warning) warnings.push(compatibilityResult.warning);

  // Calculate weighted score
  const weightedScore =
    complexityResult.score * weights.complexity +
    costResult.score * weights.cost +
    compatibilityResult.score * weights.compatibility +
    featuresResult.score * weights.features +
    ecosystemResult.score * weights.ecosystem +
    preferenceResult.score * 0.1; // Small weight for explicit preference

  // Normalize to 0-100
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0) + 0.1;
  const normalizedScore = Math.round((weightedScore / totalWeight) * 100) / 100;

  // Find alternatives (options from same category that might work)
  const incompatible = getIncompatibleOptions(option.id);
  const alternatives = option.compatibleWith
    .filter(id => !incompatible.includes(id) && id !== option.id)
    .slice(0, 3);

  return {
    option,
    score: Math.max(0, Math.min(100, normalizedScore)),
    reasoning: reasoning.filter(r => r.explanation),
    warnings,
    alternatives,
    rank: 0, // Set later when sorting
  };
}

// Score multiple options and rank them
export function scoreAndRankOptions<T extends StackOption>(
  options: T[],
  context: ScoringContext
): ScoredOption<T>[] {
  const scored = options
    .filter(opt => opt.id !== 'none' || options.length === 1)
    .map(opt => scoreOption(opt, context))
    .sort((a, b) => b.score - a.score);

  // Assign ranks
  scored.forEach((item, index) => {
    item.rank = index + 1;
  });

  return scored;
}

// Get top recommendation with explanation
export function getTopRecommendation<T extends StackOption>(
  options: T[],
  context: ScoringContext
): ScoredOption<T> | null {
  const ranked = scoreAndRankOptions(options, context);
  return ranked.length > 0 ? ranked[0] : null;
}

// Compare two options directly
export function compareOptions<T extends StackOption>(
  optionA: T,
  optionB: T,
  context: ScoringContext
): { winner: 'A' | 'B' | 'tie'; scoreA: number; scoreB: number; verdict: string } {
  const scoredA = scoreOption(optionA, context);
  const scoredB = scoreOption(optionB, context);

  const diff = Math.abs(scoredA.score - scoredB.score);
  let winner: 'A' | 'B' | 'tie';
  let verdict: string;

  if (diff < 5) {
    winner = 'tie';
    verdict = `${optionA.name} and ${optionB.name} are roughly equivalent for your needs`;
  } else if (scoredA.score > scoredB.score) {
    winner = 'A';
    verdict = `${optionA.name} is recommended over ${optionB.name} (${Math.round(scoredA.score)} vs ${Math.round(scoredB.score)})`;
  } else {
    winner = 'B';
    verdict = `${optionB.name} is recommended over ${optionA.name} (${Math.round(scoredB.score)} vs ${Math.round(scoredA.score)})`;
  }

  return {
    winner,
    scoreA: scoredA.score,
    scoreB: scoredB.score,
    verdict,
  };
}
