/**
 * Recommendation Explainer
 * Generates human-readable explanations for recommendations
 */

import { StackOption } from '../knowledge/types';
import {
  ScoredOption,
  CategoryRecommendation,
  StackRecommendation,
  TradeoffAnalysis,
  OptionComparison,
  Warning,
  UserRequirements,
} from './types';

// Generate explanation for a single scored option
export function generateOptionExplanation<T extends StackOption>(scored: ScoredOption<T>): string {
  const { option, score, reasoning, warnings } = scored;
  const lines: string[] = [];

  // Header with score
  lines.push(`${option.logoEmoji || '📦'} ${option.name} (Score: ${Math.round(score)}/100)`);
  lines.push('');

  // Quick summary
  lines.push(option.description);
  lines.push('');

  // Top reasons
  const positiveReasons = reasoning.filter(r => r.impact === 'positive');
  const negativeReasons = reasoning.filter(r => r.impact === 'negative');

  if (positiveReasons.length > 0) {
    lines.push('✅ Why this works for you:');
    positiveReasons.slice(0, 3).forEach(r => {
      lines.push(`   • ${r.explanation}`);
    });
    lines.push('');
  }

  if (negativeReasons.length > 0) {
    lines.push('⚠️  Considerations:');
    negativeReasons.slice(0, 3).forEach(r => {
      lines.push(`   • ${r.explanation}`);
    });
    lines.push('');
  }

  // Warnings
  if (warnings.length > 0) {
    lines.push('🚨 Warnings:');
    warnings.forEach(w => {
      lines.push(`   • ${w.message}`);
      if (w.suggestion) {
        lines.push(`     → ${w.suggestion}`);
      }
    });
    lines.push('');
  }

  return lines.join('\n');
}

// Generate short summary for CLI display
export function generateShortSummary<T extends StackOption>(scored: ScoredOption<T>): string {
  const { option, score, warnings } = scored;
  const warningIcon = warnings.some(w => w.severity === 'critical')
    ? '🔴'
    : warnings.length > 0
      ? '🟡'
      : '🟢';

  return `${warningIcon} ${option.logoEmoji || '📦'} ${option.name} — ${Math.round(score)}/100`;
}

// Generate detailed tradeoff analysis between options
export function generateTradeoffAnalysis<T extends StackOption>(
  optionA: T,
  optionB: T,
  aspect: string
): TradeoffAnalysis {
  const scoreAspect = (option: T, aspectKey: string): number => {
    let score = 50;
    const lowerAspect = aspectKey.toLowerCase();

    // Check pros
    option.pros.forEach(pro => {
      if (pro.toLowerCase().includes(lowerAspect)) score += 15;
    });

    // Check cons
    option.cons.forEach(con => {
      if (con.toLowerCase().includes(lowerAspect)) score -= 15;
    });

    // Check bestFor
    option.bestFor.forEach(best => {
      if (best.toLowerCase().includes(lowerAspect)) score += 10;
    });

    return Math.max(0, Math.min(100, score));
  };

  const scoreA = scoreAspect(optionA, aspect);
  const scoreB = scoreAspect(optionB, aspect);

  const benefitA =
    optionA.pros.find(p => p.toLowerCase().includes(aspect.toLowerCase())) ||
    `Good ${aspect} support`;
  const benefitB =
    optionB.pros.find(p => p.toLowerCase().includes(aspect.toLowerCase())) ||
    `Good ${aspect} support`;

  return {
    aspect,
    optionA: { name: optionA.name, score: scoreA, benefit: benefitA },
    optionB: { name: optionB.name, score: scoreB, benefit: benefitB },
    recommendation:
      Math.abs(scoreA - scoreB) < 10
        ? `Both options are comparable for ${aspect}`
        : scoreA > scoreB
          ? `${optionA.name} is better for ${aspect}`
          : `${optionB.name} is better for ${aspect}`,
    userShouldChooseAIf: `You prioritize ${optionA.name}'s approach: ${benefitA}`,
    userShouldChooseBIf: `You prioritize ${optionB.name}'s approach: ${benefitB}`,
  };
}

// Generate full comparison between two options
export function generateComparison<T extends StackOption>(
  optionA: T,
  optionB: T,
  scoreA: number,
  scoreB: number
): OptionComparison<T> {
  const winner: 'A' | 'B' | 'tie' =
    Math.abs(scoreA - scoreB) < 5 ? 'tie' : scoreA > scoreB ? 'A' : 'B';

  // Find unique pros
  const prosA = optionA.pros.filter(
    p => !optionB.pros.some(pb => pb.toLowerCase() === p.toLowerCase())
  );
  const prosB = optionB.pros.filter(
    p => !optionA.pros.some(pa => pa.toLowerCase() === p.toLowerCase())
  );

  // Find unique cons
  const consA = optionA.cons.filter(
    c => !optionB.cons.some(cb => cb.toLowerCase() === c.toLowerCase())
  );
  const consB = optionB.cons.filter(
    c => !optionA.cons.some(ca => ca.toLowerCase() === c.toLowerCase())
  );

  let verdict: string;
  if (winner === 'tie') {
    verdict = `${optionA.name} and ${optionB.name} are both excellent choices. Consider your specific priorities.`;
  } else if (winner === 'A') {
    verdict = `${optionA.name} is recommended for your use case. Key advantages: ${prosA.slice(0, 2).join(', ')}.`;
  } else {
    verdict = `${optionB.name} is recommended for your use case. Key advantages: ${prosB.slice(0, 2).join(', ')}.`;
  }

  return {
    optionA,
    optionB,
    winner,
    scoreA,
    scoreB,
    prosA: prosA.slice(0, 5),
    prosB: prosB.slice(0, 5),
    consA: consA.slice(0, 3),
    consB: consB.slice(0, 3),
    verdict,
  };
}

// Generate category recommendation explanation
export function generateCategoryExplanation<T extends StackOption>(
  rec: CategoryRecommendation<T>,
  requirements: UserRequirements
): string {
  const lines: string[] = [];
  const { recommended, alternatives, category } = rec;

  lines.push(`══════════════════════════════════════`);
  lines.push(`  ${category.toUpperCase()} RECOMMENDATION`);
  lines.push(`══════════════════════════════════════`);
  lines.push('');

  // Main recommendation
  lines.push(`🏆 Recommended: ${recommended.option.name}`);
  lines.push(`   Score: ${Math.round(recommended.score)}/100`);
  lines.push('');
  lines.push(`   ${recommended.option.description}`);
  lines.push('');

  // Why this option
  lines.push('   Why this fits your needs:');
  const topReasons = recommended.reasoning
    .filter(r => r.impact === 'positive')
    .slice(0, 3);
  topReasons.forEach(r => {
    lines.push(`   ✓ ${r.explanation}`);
  });
  lines.push('');

  // Pros and cons
  lines.push('   Pros:');
  recommended.option.pros.slice(0, 4).forEach(pro => {
    lines.push(`   + ${pro}`);
  });
  lines.push('');

  lines.push('   Cons:');
  recommended.option.cons.slice(0, 3).forEach(con => {
    lines.push(`   - ${con}`);
  });
  lines.push('');

  // Tradeoffs
  if (recommended.option.tradeoffs.length > 0) {
    lines.push('   Key Tradeoffs:');
    recommended.option.tradeoffs.slice(0, 3).forEach(tradeoff => {
      lines.push(`   ⚖️  ${tradeoff}`);
    });
    lines.push('');
  }

  // Warnings
  if (recommended.warnings.length > 0) {
    lines.push('   ⚠️  Warnings:');
    recommended.warnings.forEach(w => {
      lines.push(`   • ${w.message}`);
    });
    lines.push('');
  }

  // Alternatives
  if (alternatives.length > 0) {
    lines.push('   Alternatives to consider:');
    alternatives.slice(0, 3).forEach((alt, i) => {
      lines.push(
        `   ${i + 1}. ${alt.option.name} (Score: ${Math.round(alt.score)}/100)`
      );
      lines.push(`      ${alt.option.description}`);
    });
    lines.push('');
  }

  // Cost info
  const cost = recommended.option.monthlyCost;
  lines.push('   💰 Pricing:');
  if (cost.free) {
    lines.push('   • Free tier: Available');
  }
  if (cost.hobbyist) {
    lines.push(`   • Hobbyist: ${cost.hobbyist}`);
  }
  if (cost.startup) {
    lines.push(`   • Startup: ${cost.startup}`);
  }
  lines.push('');

  return lines.join('\n');
}

// Generate full stack recommendation summary
export function generateStackSummary(rec: StackRecommendation): string {
  const lines: string[] = [];

  lines.push('╔════════════════════════════════════════════════════════════╗');
  lines.push('║           YOUR RECOMMENDED STACK                          ║');
  lines.push('╚════════════════════════════════════════════════════════════╝');
  lines.push('');

  // Overall scores
  lines.push(`📊 Overall Score: ${Math.round(rec.overallScore)}/100`);
  lines.push(`🎚️  Complexity: ${rec.overallComplexity}`);
  lines.push('');

  // Stack summary
  lines.push('📦 Selected Stack:');
  if (rec.frontend) {
    lines.push(
      `   Frontend:  ${rec.frontend.recommended.option.logoEmoji || '🖼️'} ${rec.frontend.recommended.option.name}`
    );
  }
  if (rec.backend) {
    lines.push(
      `   Backend:   ${rec.backend.recommended.option.logoEmoji || '⚙️'} ${rec.backend.recommended.option.name}`
    );
  }
  if (rec.database) {
    lines.push(
      `   Database:  ${rec.database.recommended.option.logoEmoji || '🗄️'} ${rec.database.recommended.option.name}`
    );
  }
  if (rec.orm) {
    lines.push(
      `   ORM:       ${rec.orm.recommended.option.logoEmoji || '🔗'} ${rec.orm.recommended.option.name}`
    );
  }
  if (rec.auth) {
    lines.push(
      `   Auth:      ${rec.auth.recommended.option.logoEmoji || '🔐'} ${rec.auth.recommended.option.name}`
    );
  }
  if (rec.ai) {
    lines.push(
      `   AI:        ${rec.ai.recommended.option.logoEmoji || '🤖'} ${rec.ai.recommended.option.name}`
    );
  }
  if (rec.vectorDb) {
    lines.push(
      `   VectorDB:  ${rec.vectorDb.recommended.option.logoEmoji || '📊'} ${rec.vectorDb.recommended.option.name}`
    );
  }
  lines.push('');

  // Cost summary
  lines.push('💰 Estimated Monthly Cost:');
  if (rec.totalEstimatedCost.free) {
    lines.push('   • Can start free');
  }
  if (rec.totalEstimatedCost.hobbyist) {
    lines.push(`   • Hobbyist: ${rec.totalEstimatedCost.hobbyist}`);
  }
  if (rec.totalEstimatedCost.startup) {
    lines.push(`   • Startup: ${rec.totalEstimatedCost.startup}`);
  }
  lines.push('');

  // Reasoning
  if (rec.overallReasoning.length > 0) {
    lines.push('📝 Why this stack:');
    rec.overallReasoning.slice(0, 5).forEach(reason => {
      lines.push(`   • ${reason}`);
    });
    lines.push('');
  }

  // Warnings
  if (rec.overallWarnings.length > 0) {
    lines.push('⚠️  Things to consider:');
    rec.overallWarnings.forEach(w => {
      const icon = w.severity === 'critical' ? '🔴' : w.severity === 'warning' ? '🟡' : '🔵';
      lines.push(`   ${icon} ${w.message}`);
    });
    lines.push('');
  }

  // Compatibility issues
  if (rec.compatibilityIssues.length > 0) {
    lines.push('🔗 Compatibility Notes:');
    rec.compatibilityIssues.forEach(issue => {
      const icon = issue.severity === 'critical' ? '❌' : '⚠️';
      lines.push(`   ${icon} ${issue.message}`);
      if (issue.resolution) {
        lines.push(`      → ${issue.resolution}`);
      }
    });
    lines.push('');
  }

  return lines.join('\n');
}

// Generate reasoning for why one option was chosen over another
export function explainChoice<T extends StackOption>(
  chosen: ScoredOption<T>,
  rejected: ScoredOption<T>
): string {
  const lines: string[] = [];

  lines.push(`Why ${chosen.option.name} over ${rejected.option.name}?`);
  lines.push('');

  // Score difference
  const diff = chosen.score - rejected.score;
  if (diff > 20) {
    lines.push(`${chosen.option.name} scored significantly higher (${Math.round(diff)} points)`);
  } else if (diff > 10) {
    lines.push(`${chosen.option.name} scored moderately higher (${Math.round(diff)} points)`);
  } else {
    lines.push(`Both options scored similarly, but ${chosen.option.name} edges ahead`);
  }
  lines.push('');

  // Key advantages
  lines.push(`Key advantages of ${chosen.option.name}:`);
  chosen.reasoning
    .filter(r => r.impact === 'positive')
    .slice(0, 3)
    .forEach(r => {
      lines.push(`• ${r.explanation}`);
    });
  lines.push('');

  // Why not the other
  const rejectedIssues = rejected.reasoning.filter(r => r.impact === 'negative');
  if (rejectedIssues.length > 0) {
    lines.push(`Concerns with ${rejected.option.name}:`);
    rejectedIssues.slice(0, 3).forEach(r => {
      lines.push(`• ${r.explanation}`);
    });
  }

  return lines.join('\n');
}

// Format warnings for display
export function formatWarnings(warnings: Warning[]): string {
  if (warnings.length === 0) return '';

  const lines: string[] = [];
  const critical = warnings.filter(w => w.severity === 'critical');
  const warns = warnings.filter(w => w.severity === 'warning');
  const infos = warnings.filter(w => w.severity === 'info');

  if (critical.length > 0) {
    lines.push('🔴 Critical Issues:');
    critical.forEach(w => {
      lines.push(`   ${w.message}`);
      if (w.suggestion) lines.push(`   → ${w.suggestion}`);
    });
    lines.push('');
  }

  if (warns.length > 0) {
    lines.push('🟡 Warnings:');
    warns.forEach(w => {
      lines.push(`   ${w.message}`);
      if (w.suggestion) lines.push(`   → ${w.suggestion}`);
    });
    lines.push('');
  }

  if (infos.length > 0) {
    lines.push('🔵 Notes:');
    infos.forEach(w => {
      lines.push(`   ${w.message}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}
