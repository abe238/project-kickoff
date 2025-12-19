/**
 * Multi-Provider LLM Validator
 * Supports Anthropic Claude, OpenAI GPT, and Google Gemini
 * Auto-detects available providers and falls back gracefully
 */

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ProjectConfig } from '../lib/types.js';

export type LLMProvider = 'anthropic' | 'openai' | 'gemini' | 'auto';

export interface LLMValidationResult {
  success: boolean;
  provider?: LLMProvider;
  analysis: string;
  issues: LLMIssue[];
  recommendations: string[];
  confidence: number;
}

export interface LLMIssue {
  severity: 'error' | 'warning' | 'info';
  title: string;
  description: string;
  suggestion?: string;
}

export interface LLMOptions {
  provider?: LLMProvider;
  apiKey?: string;
}

const SYSTEM_PROMPT = `You are an expert Solutions Architect specializing in modern web development stacks (2025). Your role is to analyze project configurations and identify potential issues, incompatibilities, or suboptimal choices.

You have deep knowledge of:
- JavaScript/TypeScript ecosystems (Next.js, TanStack, Hono, Bun, Node.js)
- Database technologies (PostgreSQL, SQLite, Supabase, Turso, D1, Neon, PlanetScale)
- ORMs (Drizzle, Prisma, SQLAlchemy, GORM, Diesel)
- Auth providers (Better-Auth, Clerk, Lucia, Auth.js, Supabase Auth)
- AI/ML frameworks (LangChain, Vercel AI SDK, Mastra, MLX)
- Vector databases (Pinecone, Qdrant, Chroma, pgvector, Turbopuffer)
- Python, Go, and Rust backend stacks

Known issues to check for:
1. D1 + Prisma: Prisma has significant edge compatibility issues with Cloudflare D1
2. Better-Auth + Next.js + Bun: Build failures reported
3. Turbopuffer: Object storage architecture means ~500ms cold query latency
4. Platform-specific auth (Supabase Auth, Firebase Auth) requires matching database
5. NoSQL databases (MongoDB, Firebase, Convex) don't work with SQL ORMs
6. Edge runtimes have limitations with heavy dependencies
7. MLX only works on Apple Silicon

Respond with a JSON object containing:
- issues: Array of {severity, title, description, suggestion}
- recommendations: Array of strings with improvement suggestions
- confidence: Number 0-1 indicating confidence in the analysis`;

const USER_PROMPT_TEMPLATE = (configSummary: string) => `Analyze this project configuration for potential issues, incompatibilities, or suboptimal choices:

${configSummary}

Return your analysis as a JSON object with the structure:
{
  "issues": [{"severity": "error|warning|info", "title": "...", "description": "...", "suggestion": "..."}],
  "recommendations": ["..."],
  "confidence": 0.0-1.0
}

Only return the JSON object, no other text.`;

/**
 * Get available LLM providers
 */
export function getAvailableProviders(): LLMProvider[] {
  const providers: LLMProvider[] = [];
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.GEMINI_API_KEY) providers.push('gemini');
  return providers;
}

/**
 * Get the best available provider
 * Priority: Anthropic > OpenAI > Gemini
 */
export function getBestProvider(): LLMProvider | null {
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.GEMINI_API_KEY) return 'gemini';
  return null;
}

/**
 * Check if any LLM provider is available
 */
export function isLLMAvailable(): boolean {
  return getBestProvider() !== null;
}

/**
 * Validate with Anthropic Claude
 */
async function validateWithAnthropic(
  config: ProjectConfig,
  apiKey?: string
): Promise<LLMValidationResult> {
  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not found');

  const client = new Anthropic({ apiKey: key });
  const configSummary = formatConfigForLLM(config);

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: USER_PROMPT_TEMPLATE(configSummary) }],
  });

  const content = response.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }

  const parsed = parseJSONResponse(content.text);
  return {
    success: true,
    provider: 'anthropic',
    analysis: content.text,
    issues: parsed.issues || [],
    recommendations: parsed.recommendations || [],
    confidence: parsed.confidence || 0.8,
  };
}

/**
 * Validate with OpenAI GPT
 */
async function validateWithOpenAI(
  config: ProjectConfig,
  apiKey?: string
): Promise<LLMValidationResult> {
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not found');

  const client = new OpenAI({ apiKey: key });
  const configSummary = formatConfigForLLM(config);

  const response = await client.chat.completions.create({
    model: 'gpt-5',
    max_completion_tokens: 4096,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: USER_PROMPT_TEMPLATE(configSummary) },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = parseJSONResponse(content);
  return {
    success: true,
    provider: 'openai',
    analysis: content,
    issues: parsed.issues || [],
    recommendations: parsed.recommendations || [],
    confidence: parsed.confidence || 0.8,
  };
}

/**
 * Validate with Google Gemini
 */
async function validateWithGemini(
  config: ProjectConfig,
  apiKey?: string
): Promise<LLMValidationResult> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY not found');

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
  const configSummary = formatConfigForLLM(config);

  const prompt = `${SYSTEM_PROMPT}\n\n${USER_PROMPT_TEMPLATE(configSummary)}`;
  const result = await model.generateContent(prompt);
  const content = result.response.text();

  if (!content) {
    throw new Error('No response from Gemini');
  }

  const parsed = parseJSONResponse(content);
  return {
    success: true,
    provider: 'gemini',
    analysis: content,
    issues: parsed.issues || [],
    recommendations: parsed.recommendations || [],
    confidence: parsed.confidence || 0.8,
  };
}

/**
 * Validate a project configuration using LLM
 * Automatically selects the best available provider or uses specified one
 */
export async function validateWithLLM(
  config: ProjectConfig,
  options: LLMOptions = {}
): Promise<LLMValidationResult> {
  const requestedProvider = options.provider || 'auto';
  let provider: LLMProvider | null;

  if (requestedProvider === 'auto') {
    provider = getBestProvider();
  } else {
    provider = requestedProvider;
  }

  if (!provider) {
    return {
      success: false,
      analysis: 'No LLM API keys found. Set ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY in .env',
      issues: [{
        severity: 'error',
        title: 'Missing API Keys',
        description: 'No LLM provider API keys found in environment',
        suggestion: 'Add at least one API key to .env: ANTHROPIC_API_KEY, OPENAI_API_KEY, or GEMINI_API_KEY',
      }],
      recommendations: [],
      confidence: 0,
    };
  }

  try {
    switch (provider) {
      case 'anthropic':
        return await validateWithAnthropic(config, options.apiKey);
      case 'openai':
        return await validateWithOpenAI(config, options.apiKey);
      case 'gemini':
        return await validateWithGemini(config, options.apiKey);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    // If auto mode and one provider fails, try the next
    if (requestedProvider === 'auto') {
      const available = getAvailableProviders().filter((p) => p !== provider);
      if (available.length > 0) {
        console.log(`⚠️  ${provider} failed, trying ${available[0]}...`);
        return validateWithLLM(config, { ...options, provider: available[0] });
      }
    }

    return {
      success: false,
      provider,
      analysis: `LLM validation failed: ${message}`,
      issues: [{
        severity: 'warning',
        title: 'LLM Validation Failed',
        description: message,
        suggestion: 'Falling back to rule-based validation only',
      }],
      recommendations: [],
      confidence: 0,
    };
  }
}

/**
 * Format project config for LLM consumption
 */
function formatConfigForLLM(config: ProjectConfig): string {
  return `Project: ${config.name}
Description: ${config.description}
Type: ${config.type}
Runtime: ${config.runtime}

Database:
  Provider: ${config.databaseProvider}
  ORM: ${config.orm}

Authentication:
  Provider: ${config.authProvider}

AI/ML:
  Framework: ${config.aiFramework}
  Vector DB: ${config.vectorDB}
  Embeddings: ${config.embeddingProvider}
  Local AI: ${config.localAI}

Deployment:
  Complexity: ${config.complexityTrack}
  Web Server: ${config.webServer}
  Port: ${config.port}
  Domain: ${config.domain || 'not set'}

Additional Options:
  Design System: ${config.useDesignSystem}
  Server Framework: ${config.serverFramework || 'default'}`;
}

/**
 * Parse JSON response from LLM, handling markdown code blocks
 */
function parseJSONResponse(text: string): {
  issues: LLMIssue[];
  recommendations: string[];
  confidence: number;
} {
  let jsonText = text.trim();

  // Remove markdown code blocks if present
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.slice(7);
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith('```')) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  try {
    return JSON.parse(jsonText);
  } catch {
    return {
      issues: [],
      recommendations: [],
      confidence: 0.5,
    };
  }
}

/**
 * Format LLM validation result for display
 */
export function formatLLMResult(result: LLMValidationResult): string {
  const lines: string[] = [];

  if (!result.success) {
    lines.push(`⚠️  LLM Validation: ${result.analysis}`);
    return lines.join('\n');
  }

  const providerNames: Record<string, string> = {
    anthropic: 'Claude (Anthropic)',
    openai: 'GPT-4o (OpenAI)',
    gemini: 'Gemini (Google)',
  };
  const providerName = providerNames[result.provider || 'anthropic'] || 'AI';

  lines.push(`🤖 AI Stack Analysis via ${providerName} (${Math.round(result.confidence * 100)}% confidence)`);
  lines.push('');

  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  const info = result.issues.filter((i) => i.severity === 'info');

  if (errors.length > 0) {
    lines.push('❌ Critical Issues:');
    for (const issue of errors) {
      lines.push(`  • ${issue.title}: ${issue.description}`);
      if (issue.suggestion) {
        lines.push(`    💡 ${issue.suggestion}`);
      }
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push('⚠️  Warnings:');
    for (const issue of warnings) {
      lines.push(`  • ${issue.title}: ${issue.description}`);
      if (issue.suggestion) {
        lines.push(`    💡 ${issue.suggestion}`);
      }
    }
    lines.push('');
  }

  if (info.length > 0) {
    lines.push('ℹ️  Notes:');
    for (const issue of info) {
      lines.push(`  • ${issue.title}: ${issue.description}`);
    }
    lines.push('');
  }

  if (result.recommendations.length > 0) {
    lines.push('💡 Recommendations:');
    for (const rec of result.recommendations) {
      lines.push(`  • ${rec}`);
    }
    lines.push('');
  }

  if (result.issues.length === 0) {
    lines.push('✅ No issues detected - stack looks good!');
  }

  return lines.join('\n');
}

/**
 * Get provider display info
 */
export function getProviderInfo(): { available: LLMProvider[]; best: LLMProvider | null } {
  return {
    available: getAvailableProviders(),
    best: getBestProvider(),
  };
}
