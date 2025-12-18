/**
 * Fragment Collector
 * Collects required fragments based on user selections
 */

import type { TemplateFragment, GeneratorContext, FragmentCategory } from './types';
import { allFragments, getFragmentById } from './fragments';

// Category to answer key mapping
const categoryAnswerMap: Record<FragmentCategory, string> = {
  base: 'base',
  runtime: 'runtime',
  frontend: 'frontend',
  backend: 'backend',
  database: 'database',
  orm: 'orm',
  auth: 'auth',
  ai: 'ai',
  deployment: 'deployment',
  tooling: 'tooling',
};

// Collect fragments based on context selections
export function collectFragments(context: GeneratorContext): TemplateFragment[] {
  const collected: TemplateFragment[] = [];
  const collectedIds = new Set<string>();

  // Always include base fragment
  const baseFragment = getFragmentById('base');
  if (baseFragment) {
    collected.push(baseFragment);
    collectedIds.add('base');
  }

  // Add fragments based on selections
  for (const [key, value] of Object.entries(context.selections)) {
    if (!value || value === 'none') continue;

    const fragment = getFragmentById(value);
    if (fragment && !collectedIds.has(fragment.id)) {
      collected.push(fragment);
      collectedIds.add(fragment.id);
    }
  }

  // Add deployment fragments based on features
  if (context.features.docker) {
    const dockerFragment = getFragmentById('docker');
    if (dockerFragment && !collectedIds.has('docker')) {
      collected.push(dockerFragment);
      collectedIds.add('docker');
    }
  }

  if (context.features.githubActions) {
    const ghFragment = getFragmentById('github-actions');
    if (ghFragment && !collectedIds.has('github-actions')) {
      collected.push(ghFragment);
      collectedIds.add('github-actions');
    }
  }

  return collected;
}

// Get all available fragments for a category
export function getAvailableFragments(category: FragmentCategory): TemplateFragment[] {
  return allFragments.filter(f => f.category === category);
}

// Check if a fragment is compatible with already selected fragments
export function isFragmentCompatible(
  fragment: TemplateFragment,
  selectedFragments: TemplateFragment[]
): boolean {
  const selectedIds = new Set(selectedFragments.map(f => f.id));

  // Check if any selected fragment is incompatible with this one
  for (const selected of selectedFragments) {
    if (selected.incompatibleWith?.includes(fragment.id)) {
      return false;
    }
  }

  // Check if this fragment is incompatible with any selected
  if (fragment.incompatibleWith) {
    for (const incompatible of fragment.incompatibleWith) {
      if (selectedIds.has(incompatible)) {
        return false;
      }
    }
  }

  return true;
}

// Get suggested fragments based on current selections
export function getSuggestedFragments(
  context: GeneratorContext,
  currentFragments: TemplateFragment[]
): TemplateFragment[] {
  const suggestions: TemplateFragment[] = [];
  const currentIds = new Set(currentFragments.map(f => f.id));

  // Check each available fragment
  for (const fragment of allFragments) {
    if (currentIds.has(fragment.id)) continue;
    if (!isFragmentCompatible(fragment, currentFragments)) continue;

    // Check if all dependencies are met
    const depsMet = !fragment.dependencies ||
      fragment.dependencies.every(dep => currentIds.has(dep));

    if (depsMet) {
      suggestions.push(fragment);
    }
  }

  return suggestions;
}
