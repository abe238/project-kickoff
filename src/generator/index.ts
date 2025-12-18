/**
 * Generator Module
 * Main exports for template generation
 */

// Export types
export * from './types';

// Export registry
export { createFragmentRegistry, validateFragmentDependencies, resolveFragmentOrder } from './registry';

// Export collector
export {
  collectFragments,
  getAvailableFragments,
  isFragmentCompatible,
  getSuggestedFragments,
} from './collector';

// Export merger
export {
  createGenerationPlan,
  generatePackageJson,
  generateEnvExample,
  renderTemplate,
  writeGeneratedFiles,
} from './merger';

// Export engine
export {
  generateProject,
  quickGenerate,
  validateContext,
} from './engine';

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
