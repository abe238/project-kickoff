/**
 * Knowledge Base Index
 * Central export for all stack knowledge
 */

// Types
export * from './types';

// Data
export { databases, getDatabaseById, getDatabasesByType, getDatabasesByHosting } from './databases';
export { orms, getORMById, getORMsByRuntime, getORMsByDatabase } from './orms';
export { authProviders, getAuthById, getAuthByType, getHostedAuthProviders, getSelfHostedAuthProviders } from './auth';
export {
  frontends,
  backends,
  getFrontendById,
  getBackendById,
  getBackendsByRuntime,
  getEdgeCompatibleBackends,
} from './frameworks';
export {
  aiFrameworks,
  vectorDatabases,
  embeddingProviders,
  localAIProviders,
  getAIFrameworkById,
  getVectorDBById,
  getEmbeddingById,
  getLocalAIById,
  getAIFrameworksByRuntime,
  getManagedVectorDBs,
} from './ai';
export {
  compatibilityMatrix,
  getCompatibilityRules,
  areCompatible,
  getCompatibleOptions,
  getIncompatibleOptions,
  getCompatibilityNote,
  validateStackSelection,
  getRecommendedPairings,
} from './compatibility';

// Re-export collections for easy access
import { databases } from './databases';
import { orms } from './orms';
import { authProviders } from './auth';
import { frontends, backends } from './frameworks';
import { aiFrameworks, vectorDatabases, embeddingProviders, localAIProviders } from './ai';
import { compatibilityMatrix } from './compatibility';
import type { KnowledgeBase, AnyStackOption, Runtime } from './types';

// Complete knowledge base
export const knowledgeBase: KnowledgeBase = {
  databases,
  orms,
  auth: authProviders,
  frontends,
  backends,
  ai: aiFrameworks,
  vectorDbs: vectorDatabases,
  embeddings: embeddingProviders,
  localAi: localAIProviders,
  webServers: [],
  presets: [],
  compatibility: compatibilityMatrix,
};

// Utility: Get any option by ID across all categories
export const getOptionById = (id: string): AnyStackOption | undefined => {
  const allOptions: AnyStackOption[] = [
    ...databases,
    ...orms,
    ...authProviders,
    ...frontends,
    ...backends,
    ...aiFrameworks,
    ...vectorDatabases,
    ...embeddingProviders,
    ...localAIProviders,
  ];
  return allOptions.find(opt => opt.id === id);
};

// Utility: Get all options in a category
export const getOptionsByCategory = (category: string): AnyStackOption[] => {
  switch (category) {
    case 'database':
      return databases;
    case 'orm':
      return orms;
    case 'auth':
      return authProviders;
    case 'frontend':
      return frontends;
    case 'backend':
      return backends;
    case 'ai':
      return aiFrameworks;
    case 'vector-db':
      return vectorDatabases;
    case 'embedding':
      return embeddingProviders;
    case 'local-ai':
      return localAIProviders;
    default:
      return [];
  }
};

// Utility: Search options by name or description
export const searchOptions = (query: string): AnyStackOption[] => {
  const normalizedQuery = query.toLowerCase();
  const allOptions: AnyStackOption[] = [
    ...databases,
    ...orms,
    ...authProviders,
    ...frontends,
    ...backends,
    ...aiFrameworks,
    ...vectorDatabases,
    ...embeddingProviders,
    ...localAIProviders,
  ];

  return allOptions.filter(
    opt =>
      opt.name.toLowerCase().includes(normalizedQuery) ||
      opt.description.toLowerCase().includes(normalizedQuery) ||
      opt.id.toLowerCase().includes(normalizedQuery)
  );
};

// Utility: Get options filtered by runtime
export const getOptionsForRuntime = (runtime: Runtime): {
  databases: typeof databases;
  orms: typeof orms;
  auth: typeof authProviders;
  backends: typeof backends;
  ai: typeof aiFrameworks;
} => {
  return {
    databases: databases.filter(db => db.supportedRuntimes.includes(runtime)),
    orms: orms.filter(orm => orm.supportedRuntimes.includes(runtime)),
    auth: authProviders.filter(auth => auth.supportedRuntimes.includes(runtime)),
    backends: backends.filter(be => be.runtime === runtime),
    ai: aiFrameworks.filter(ai => ai.supportedRuntimes.includes(runtime)),
  };
};

// Utility: Get complexity counts
export const getComplexitySummary = (): { low: number; medium: number; high: number } => {
  const allOptions: AnyStackOption[] = [
    ...databases,
    ...orms,
    ...authProviders,
    ...frontends,
    ...backends,
    ...aiFrameworks,
    ...vectorDatabases,
    ...embeddingProviders,
    ...localAIProviders,
  ];

  return {
    low: allOptions.filter(opt => opt.complexity === 'low').length,
    medium: allOptions.filter(opt => opt.complexity === 'medium').length,
    high: allOptions.filter(opt => opt.complexity === 'high').length,
  };
};
