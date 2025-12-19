/**
 * Unified Stack Validator
 * Combines rule-based constraints with optional LLM-enhanced validation
 */

import type { ProjectConfig } from '../lib/types.js';
import {
  validateConstraints,
  formatValidationResult,
  type ValidationResult,
} from './constraints.js';
import {
  validateWithLLM,
  formatLLMResult,
  isLLMAvailable,
  getProviderInfo,
  type LLMValidationResult,
  type LLMProvider,
} from './llm-validator.js';

export interface StackValidationResult {
  valid: boolean;
  rulesResult: ValidationResult;
  llmResult?: LLMValidationResult;
  summary: string;
}

export interface ValidatorOptions {
  useLLM?: boolean;
  provider?: LLMProvider;
  apiKey?: string;
  verbose?: boolean;
}

/**
 * Validate a project configuration
 * @param config - Project configuration to validate
 * @param options - Validation options
 */
export async function validateStack(
  config: ProjectConfig,
  options: ValidatorOptions = {}
): Promise<StackValidationResult> {
  // Always run rule-based validation (fast, offline)
  const rulesResult = validateConstraints(config);

  // Optionally run LLM validation
  let llmResult: LLMValidationResult | undefined;
  if (options.useLLM) {
    if (!isLLMAvailable() && !options.apiKey) {
      llmResult = {
        success: false,
        analysis: 'No LLM API keys found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in .env',
        issues: [],
        recommendations: [],
        confidence: 0,
      };
    } else {
      llmResult = await validateWithLLM(config, {
        provider: options.provider,
        apiKey: options.apiKey,
      });
    }
  }

  // Determine overall validity
  // Stack is invalid if:
  // 1. Rule-based validation found errors, OR
  // 2. LLM found critical errors with high confidence
  let valid = rulesResult.valid;
  if (llmResult?.success && llmResult.confidence > 0.7) {
    const llmErrors = llmResult.issues.filter((i) => i.severity === 'error');
    if (llmErrors.length > 0) {
      valid = false;
    }
  }

  // Generate summary
  const summary = generateSummary(rulesResult, llmResult, options.verbose);

  return {
    valid,
    rulesResult,
    llmResult,
    summary,
  };
}

/**
 * Generate a human-readable summary of validation results
 */
function generateSummary(
  rulesResult: ValidationResult,
  llmResult?: LLMValidationResult,
  verbose?: boolean
): string {
  const lines: string[] = [];

  // Add horizontal separator
  lines.push('─'.repeat(50));
  lines.push('📋 Stack Validation Results');
  lines.push('─'.repeat(50));
  lines.push('');

  // Rules-based results
  lines.push('🔧 Rule-Based Validation:');
  lines.push(formatValidationResult(rulesResult).split('\n').map(l => '  ' + l).join('\n'));
  lines.push('');

  // LLM results (if available)
  if (llmResult) {
    lines.push('🤖 AI-Enhanced Validation:');
    lines.push(formatLLMResult(llmResult).split('\n').map(l => '  ' + l).join('\n'));
    lines.push('');
  }

  // Overall verdict
  lines.push('─'.repeat(50));
  const hasErrors = !rulesResult.valid ||
    (llmResult?.issues.filter((i) => i.severity === 'error').length ?? 0) > 0;
  const hasWarnings = rulesResult.warnings.length > 0 ||
    (llmResult?.issues.filter((i) => i.severity === 'warning').length ?? 0) > 0;

  if (hasErrors) {
    lines.push('❌ Validation FAILED - Please fix the errors above');
  } else if (hasWarnings) {
    lines.push('⚠️  Validation PASSED with warnings - Review recommendations');
  } else {
    lines.push('✅ Validation PASSED - Stack configuration looks good!');
  }
  lines.push('─'.repeat(50));

  return lines.join('\n');
}

/**
 * Quick validation using rules only (fast, offline)
 */
export function validateStackLocal(config: ProjectConfig): ValidationResult {
  return validateConstraints(config);
}

/**
 * Check if enhanced validation is available
 */
export function isEnhancedValidationAvailable(): boolean {
  return isLLMAvailable();
}

/**
 * Get available LLM provider info
 */
export function getLLMProviderInfo() {
  return getProviderInfo();
}

// Re-export types
export type { ValidationResult, LLMValidationResult, LLMProvider };
