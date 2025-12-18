/**
 * Fragment Index
 * Export all template fragments
 */

export * from './base';
export * from './frontend';
export * from './backend';

import { baseFragments } from './base';
import { frontendFragments } from './frontend';
import { backendFragments } from './backend';
import type { TemplateFragment } from '../types';

// All fragments combined
export const allFragments: TemplateFragment[] = [
  ...baseFragments,
  ...frontendFragments,
  ...backendFragments,
];

// Get fragment by ID
export function getFragmentById(id: string): TemplateFragment | undefined {
  return allFragments.find(f => f.id === id);
}

// Get fragments by category
export function getFragmentsByCategory(category: string): TemplateFragment[] {
  return allFragments.filter(f => f.category === category);
}
