/**
 * Recommendation Engine Types
 * Interfaces for scoring and recommending stack options
 */

import { StackOption, Complexity, CostTier, Runtime, ProjectType } from '../knowledge/types';

// Score weight factors
export interface ScoreWeights {
  complexity: number;      // How much complexity affects score
  cost: number;            // How much cost affects score
  compatibility: number;   // How much compatibility affects score
  features: number;        // How much feature match affects score
  ecosystem: number;       // How much ecosystem maturity affects score
  performance: number;     // How much performance matters
}

// Default weights for different user profiles
export const defaultWeights: ScoreWeights = {
  complexity: 0.2,
  cost: 0.15,
  compatibility: 0.25,
  features: 0.2,
  ecosystem: 0.1,
  performance: 0.1,
};

export const beginnerWeights: ScoreWeights = {
  complexity: 0.35,
  cost: 0.1,
  compatibility: 0.2,
  features: 0.15,
  ecosystem: 0.15,
  performance: 0.05,
};

export const enterpriseWeights: ScoreWeights = {
  complexity: 0.1,
  cost: 0.1,
  compatibility: 0.2,
  features: 0.25,
  ecosystem: 0.15,
  performance: 0.2,
};

// User budget levels
export type BudgetLevel = 'free' | 'low' | 'medium' | 'high' | 'unlimited';

// User experience levels
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Scale requirements
export type ScaleRequirement = 'prototype' | 'small' | 'medium' | 'large' | 'enterprise';

// Timeline urgency
export type TimelineUrgency = 'urgent' | 'normal' | 'flexible';

// User requirements gathered from questionnaire
export interface UserRequirements {
  projectType: ProjectType;
  runtime: Runtime;
  budget: BudgetLevel;
  experience: ExperienceLevel;
  scale: ScaleRequirement;
  timeline: TimelineUrgency;
  priorities: string[];          // e.g., ['type-safety', 'performance', 'dx']
  mustHaveFeatures: string[];    // Required features
  niceToHaveFeatures: string[];  // Optional features
  excludeOptions: string[];      // Options user doesn't want
  preferredOptions: string[];    // Options user prefers
  existingStack: string[];       // Already chosen stack items
  teamSize?: number;
  isOpenSource?: boolean;
  needsEnterprise?: boolean;
}

// Scored option result
export interface ScoredOption<T extends StackOption = StackOption> {
  option: T;
  score: number;                 // 0-100 normalized score
  reasoning: ReasoningItem[];    // Why this score
  warnings: Warning[];           // Potential issues
  alternatives: string[];        // Alternative options to consider
  rank: number;                  // Position in recommendations
}

// Detailed reasoning item
export interface ReasoningItem {
  factor: string;               // e.g., 'complexity', 'cost'
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;               // How much this affected score
  explanation: string;          // Human-readable explanation
}

// Warning about an option
export interface Warning {
  severity: 'info' | 'warning' | 'critical';
  category: string;             // e.g., 'compatibility', 'cost', 'complexity'
  message: string;
  suggestion?: string;          // Suggested action
}

// Complete recommendation for a category
export interface CategoryRecommendation<T extends StackOption = StackOption> {
  category: string;
  recommended: ScoredOption<T>;
  alternatives: ScoredOption<T>[];
  explanation: string;
  tradeoffSummary: string;
}

// Full stack recommendation
export interface StackRecommendation {
  database?: CategoryRecommendation;
  orm?: CategoryRecommendation;
  auth?: CategoryRecommendation;
  frontend?: CategoryRecommendation;
  backend?: CategoryRecommendation;
  ai?: CategoryRecommendation;
  vectorDb?: CategoryRecommendation;
  embedding?: CategoryRecommendation;
  localAi?: CategoryRecommendation;
  overallScore: number;
  overallReasoning: string[];
  overallWarnings: Warning[];
  totalEstimatedCost: CostTier;
  overallComplexity: Complexity;
  compatibilityIssues: CompatibilityIssue[];
}

// Compatibility issue between options
export interface CompatibilityIssue {
  optionA: string;
  optionB: string;
  severity: 'warning' | 'critical';
  message: string;
  resolution?: string;
}

// Scoring context for consistent scoring across categories
export interface ScoringContext {
  requirements: UserRequirements;
  weights: ScoreWeights;
  existingSelections: Record<string, string>;
  compatibilityMatrix: Record<string, { compatibleWith: string[]; incompatibleWith: string[] }>;
}

// Comparison between two options
export interface OptionComparison<T extends StackOption = StackOption> {
  optionA: T;
  optionB: T;
  winner: 'A' | 'B' | 'tie';
  scoreA: number;
  scoreB: number;
  prosA: string[];
  prosB: string[];
  consA: string[];
  consB: string[];
  verdict: string;
}

// Tradeoff analysis
export interface TradeoffAnalysis {
  aspect: string;               // e.g., 'DX vs Performance'
  optionA: { name: string; score: number; benefit: string };
  optionB: { name: string; score: number; benefit: string };
  recommendation: string;
  userShouldChooseAIf: string;
  userShouldChooseBIf: string;
}
