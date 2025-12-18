/**
 * Generator Module
 * Main exports for template generation
 */

// Export types
export * from './types';

// Export registry
export { createFragmentRegistry, validateFragmentDependencies, resolveFragmentOrder } from './registry';

// Export fragments
export {
  allFragments,
  getFragmentById,
  getFragmentsByCategory,
  baseFragments,
  frontendFragments,
  backendFragments,
  baseFragment,
  dockerFragment,
  githubActionsFragment,
  nextjsFragment,
  viteReactFragment,
  staticFragment,
  honoFragment,
  cliFragment,
  mcpServerFragment,
  workerFragment,
  libraryFragment,
} from './fragments';
