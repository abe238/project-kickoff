/**
 * Fragment Registry
 * Central registry for all template fragments
 */

import type { TemplateFragment, FragmentCategory, FragmentRegistry } from './types';

// Create a fragment registry
export function createFragmentRegistry(fragments: TemplateFragment[]): FragmentRegistry {
  const fragmentMap = new Map<string, TemplateFragment>();

  for (const fragment of fragments) {
    fragmentMap.set(fragment.id, fragment);
  }

  return {
    fragments: fragmentMap,

    getById(id: string): TemplateFragment | undefined {
      return fragmentMap.get(id);
    },

    getByCategory(category: FragmentCategory): TemplateFragment[] {
      return fragments.filter(f => f.category === category);
    },

    getCompatible(fragmentId: string): TemplateFragment[] {
      const fragment = fragmentMap.get(fragmentId);
      if (!fragment) return [];

      return fragments.filter(f => {
        if (f.id === fragmentId) return false;
        if (fragment.incompatibleWith?.includes(f.id)) return false;
        if (f.incompatibleWith?.includes(fragmentId)) return false;
        return true;
      });
    },
  };
}

// Validate fragment dependencies
export function validateFragmentDependencies(
  selectedFragments: TemplateFragment[],
  registry: FragmentRegistry
): { valid: boolean; missingDeps: string[]; conflicts: string[] } {
  const selectedIds = new Set(selectedFragments.map(f => f.id));
  const missingDeps: string[] = [];
  const conflicts: string[] = [];

  for (const fragment of selectedFragments) {
    // Check dependencies
    if (fragment.dependencies) {
      for (const dep of fragment.dependencies) {
        if (!selectedIds.has(dep)) {
          missingDeps.push(`${fragment.id} requires ${dep}`);
        }
      }
    }

    // Check incompatibilities
    if (fragment.incompatibleWith) {
      for (const incompatible of fragment.incompatibleWith) {
        if (selectedIds.has(incompatible)) {
          conflicts.push(`${fragment.id} is incompatible with ${incompatible}`);
        }
      }
    }
  }

  return {
    valid: missingDeps.length === 0 && conflicts.length === 0,
    missingDeps,
    conflicts,
  };
}

// Resolve fragment order based on dependencies
export function resolveFragmentOrder(fragments: TemplateFragment[]): TemplateFragment[] {
  const resolved: TemplateFragment[] = [];
  const seen = new Set<string>();
  const visiting = new Set<string>();

  function visit(fragment: TemplateFragment): void {
    if (seen.has(fragment.id)) return;
    if (visiting.has(fragment.id)) {
      throw new Error(`Circular dependency detected involving ${fragment.id}`);
    }

    visiting.add(fragment.id);

    // Visit dependencies first
    if (fragment.dependencies) {
      for (const depId of fragment.dependencies) {
        const dep = fragments.find(f => f.id === depId);
        if (dep) {
          visit(dep);
        }
      }
    }

    visiting.delete(fragment.id);
    seen.add(fragment.id);
    resolved.push(fragment);
  }

  for (const fragment of fragments) {
    visit(fragment);
  }

  return resolved;
}
