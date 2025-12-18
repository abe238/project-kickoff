/**
 * Compatibility Matrix
 * Defines which stack options work together and which conflict
 */

import { CompatibilityMatrix, CompatibilityRule } from './types';

// Main compatibility matrix
export const compatibilityMatrix: CompatibilityMatrix = {
  // Database compatibility
  supabase: {
    compatibleWith: ['drizzle', 'prisma', 'supabase-auth', 'nextjs', 'tanstack-start', 'hono', 'express', 'vercel-ai', 'pgvector'],
    incompatibleWith: ['firebase', 'convex', 'pocketbase', 'firebase-auth', 'convex-auth', 'pocketbase-auth'],
    notes: {
      'supabase-auth': 'Native integration, recommended for Supabase projects',
      'drizzle': 'Works via Postgres connection string',
      'pgvector': 'Supabase includes pgvector extension by default',
    },
  },
  neon: {
    compatibleWith: ['drizzle', 'prisma', 'kysely', 'nextjs', 'hono', 'express', 'vercel-ai', 'pgvector'],
    incompatibleWith: ['firebase', 'convex', 'pocketbase', 'turso', 'd1'],
    notes: {
      'drizzle': 'Excellent serverless support with Neon',
      'prisma': 'Works but has cold start implications',
    },
  },
  turso: {
    compatibleWith: ['drizzle', 'hono', 'nextjs', 'tanstack-start', 'vercel-ai'],
    incompatibleWith: ['prisma', 'firebase', 'convex', 'supabase', 'neon', 'mysql-local'],
    notes: {
      'drizzle': 'Native libsql support, recommended ORM',
      'prisma': 'No libsql adapter available',
    },
  },
  d1: {
    compatibleWith: ['drizzle', 'hono'],
    incompatibleWith: ['prisma', 'firebase', 'convex', 'supabase', 'neon', 'turso', 'nextjs'],
    notes: {
      'hono': 'Both Cloudflare-native, excellent pairing',
      'drizzle': 'D1 adapter available',
    },
  },
  convex: {
    compatibleWith: ['convex-auth', 'nextjs', 'tanstack-start', 'vercel-ai'],
    incompatibleWith: ['supabase', 'firebase', 'pocketbase', 'drizzle', 'prisma', 'supabase-auth', 'firebase-auth'],
    notes: {
      'convex-auth': 'Native auth, only option for Convex',
    },
  },
  firebase: {
    compatibleWith: ['firebase-auth', 'nextjs', 'vite-react'],
    incompatibleWith: ['supabase', 'convex', 'pocketbase', 'drizzle', 'prisma', 'supabase-auth', 'convex-auth'],
    notes: {
      'firebase-auth': 'Native auth, only option for Firebase',
    },
  },
  pocketbase: {
    compatibleWith: ['pocketbase-auth', 'nextjs', 'vite-react', 'tanstack-start'],
    incompatibleWith: ['supabase', 'convex', 'firebase', 'drizzle', 'prisma', 'supabase-auth', 'firebase-auth'],
    notes: {
      'pocketbase-auth': 'Native auth, only option for PocketBase',
    },
  },

  // ORM compatibility
  drizzle: {
    compatibleWith: ['supabase', 'neon', 'turso', 'd1', 'postgres-local', 'mysql-local', 'sqlite', 'better-auth', 'lucia', 'nextjs', 'hono', 'express'],
    incompatibleWith: ['prisma', 'firebase', 'convex', 'pocketbase', 'mongodb-local'],
    notes: {
      'turso': 'Best ORM for libsql/Turso',
      'd1': 'Best ORM for Cloudflare D1',
    },
  },
  prisma: {
    compatibleWith: ['supabase', 'neon', 'postgres-local', 'mysql-local', 'planetscale', 'better-auth', 'lucia', 'authjs', 'nextjs', 'express'],
    incompatibleWith: ['drizzle', 'turso', 'd1', 'firebase', 'convex', 'pocketbase'],
    notes: {
      'neon': 'Works but watch for cold starts in serverless',
      'authjs': 'Has official Prisma adapter',
    },
  },
  kysely: {
    compatibleWith: ['postgres-local', 'mysql-local', 'sqlite', 'neon', 'planetscale', 'nextjs', 'hono'],
    incompatibleWith: ['prisma', 'drizzle', 'firebase', 'convex'],
  },

  // Auth compatibility
  clerk: {
    compatibleWith: ['nextjs', 'tanstack-start', 'hono', 'express', 'drizzle', 'prisma', 'supabase', 'neon', 'postgres-local'],
    incompatibleWith: ['supabase-auth', 'firebase-auth', 'convex-auth', 'pocketbase-auth', 'firebase', 'convex', 'pocketbase'],
    notes: {
      'nextjs': 'Excellent Next.js integration',
      'tanstack-start': 'Good TanStack Start support',
    },
  },
  kinde: {
    compatibleWith: ['nextjs', 'tanstack-start', 'hono', 'drizzle', 'prisma', 'supabase', 'neon'],
    incompatibleWith: ['supabase-auth', 'firebase-auth', 'convex-auth', 'pocketbase-auth', 'firebase', 'convex', 'pocketbase'],
  },
  auth0: {
    compatibleWith: ['nextjs', 'express', 'hono', 'fastapi', 'drizzle', 'prisma'],
    incompatibleWith: ['supabase-auth', 'firebase-auth', 'convex-auth', 'pocketbase-auth', 'firebase', 'convex', 'pocketbase'],
  },
  'better-auth': {
    compatibleWith: ['nextjs', 'tanstack-start', 'hono', 'express', 'drizzle', 'prisma', 'supabase', 'neon', 'postgres-local'],
    incompatibleWith: ['clerk', 'auth0', 'kinde', 'supabase-auth', 'firebase-auth', 'convex-auth'],
    notes: {
      'drizzle': 'Excellent integration with Drizzle',
      'hono': 'Great Hono middleware support',
    },
  },
  lucia: {
    compatibleWith: ['nextjs', 'hono', 'express', 'drizzle', 'prisma', 'supabase', 'neon', 'postgres-local'],
    incompatibleWith: ['clerk', 'auth0', 'kinde', 'supabase-auth', 'firebase-auth'],
  },
  authjs: {
    compatibleWith: ['nextjs', 'drizzle', 'prisma'],
    incompatibleWith: ['clerk', 'auth0', 'kinde', 'hono', 'tanstack-start', 'supabase-auth', 'firebase-auth'],
    notes: {
      'nextjs': 'Best integration is with Next.js',
      'prisma': 'Official Prisma adapter available',
    },
  },

  // Frontend compatibility
  nextjs: {
    compatibleWith: ['clerk', 'kinde', 'auth0', 'better-auth', 'lucia', 'authjs', 'supabase', 'neon', 'convex', 'firebase', 'drizzle', 'prisma', 'vercel-ai', 'langchain'],
    incompatibleWith: ['hono', 'express', 'fastapi'],
    notes: {
      'vercel-ai': 'Excellent integration via Server Actions',
      'clerk': 'Pre-built components work seamlessly',
    },
  },
  'tanstack-start': {
    compatibleWith: ['clerk', 'kinde', 'better-auth', 'supabase', 'convex', 'pocketbase', 'drizzle', 'vercel-ai'],
    incompatibleWith: ['authjs', 'hono', 'express'],
    notes: {
      'better-auth': 'Good full-stack auth integration',
    },
  },
  'vite-react': {
    compatibleWith: ['hono', 'express', 'fastapi', 'firebase', 'supabase', 'pocketbase', 'vercel-ai'],
    incompatibleWith: ['authjs', 'nextjs'],
    notes: {
      'hono': 'Can be paired with Hono backend',
    },
  },

  // Backend compatibility
  hono: {
    compatibleWith: ['clerk', 'kinde', 'better-auth', 'lucia', 'drizzle', 'turso', 'd1', 'supabase', 'neon', 'vercel-ai', 'langchain'],
    incompatibleWith: ['nextjs', 'tanstack-start', 'authjs', 'prisma'],
    notes: {
      'drizzle': 'Perfect pairing for edge deployments',
      'd1': 'Both Cloudflare-native',
      'turso': 'Great edge database pairing',
    },
  },
  express: {
    compatibleWith: ['clerk', 'auth0', 'better-auth', 'lucia', 'drizzle', 'prisma', 'supabase', 'neon', 'postgres-local', 'langchain'],
    incompatibleWith: ['nextjs', 'tanstack-start', 'd1', 'turso'],
  },
  fastapi: {
    compatibleWith: ['auth0', 'sqlalchemy', 'sqlmodel', 'tortoise', 'postgres-local', 'mysql-local', 'langchain', 'llamaindex'],
    incompatibleWith: ['nextjs', 'drizzle', 'prisma', 'clerk', 'supabase-auth'],
  },

  // AI Framework compatibility
  'vercel-ai': {
    compatibleWith: ['nextjs', 'hono', 'express', 'openai-sdk', 'anthropic-sdk', 'google-ai', 'ollama', 'pinecone', 'chromadb', 'turbopuffer'],
    incompatibleWith: [],
    notes: {
      'nextjs': 'Best integration with Server Actions and streaming',
      'ollama': 'Good local AI support',
    },
  },
  langchain: {
    compatibleWith: ['nextjs', 'hono', 'express', 'fastapi', 'openai-sdk', 'anthropic-sdk', 'pinecone', 'chromadb', 'qdrant', 'weaviate'],
    incompatibleWith: [],
    notes: {
      'pinecone': 'Official integration available',
      'chromadb': 'Great local development pairing',
    },
  },
  llamaindex: {
    compatibleWith: ['nextjs', 'express', 'fastapi', 'openai-sdk', 'pinecone', 'chromadb', 'qdrant', 'weaviate'],
    incompatibleWith: [],
  },

  // Vector DB compatibility
  pinecone: {
    compatibleWith: ['vercel-ai', 'langchain', 'llamaindex', 'openai-embeddings', 'cohere-embeddings', 'voyage-embeddings'],
    incompatibleWith: [],
  },
  chromadb: {
    compatibleWith: ['langchain', 'llamaindex', 'openai-embeddings', 'local-embeddings', 'ollama'],
    incompatibleWith: [],
    notes: {
      'ollama': 'Great for fully local AI stack',
    },
  },
  pgvector: {
    compatibleWith: ['supabase', 'neon', 'postgres-local', 'drizzle', 'prisma', 'openai-embeddings'],
    incompatibleWith: ['mysql-local', 'mongodb-local', 'turso', 'd1'],
    notes: {
      'supabase': 'Included by default in Supabase',
    },
  },

  // Local AI compatibility
  ollama: {
    compatibleWith: ['vercel-ai', 'langchain', 'chromadb', 'local-embeddings'],
    incompatibleWith: [],
    notes: {
      'chromadb': 'Perfect for fully local RAG stack',
    },
  },
};

// Generate compatibility rules from matrix
export const getCompatibilityRules = (): CompatibilityRule[] => {
  const rules: CompatibilityRule[] = [];

  for (const [source, config] of Object.entries(compatibilityMatrix)) {
    for (const target of config.compatibleWith) {
      rules.push({
        source,
        target,
        compatible: true,
        reason: config.notes?.[target],
      });
    }
    for (const target of config.incompatibleWith) {
      rules.push({
        source,
        target,
        compatible: false,
      });
    }
  }

  return rules;
};

// Check if two options are compatible
export const areCompatible = (optionA: string, optionB: string): boolean => {
  const configA = compatibilityMatrix[optionA];
  const configB = compatibilityMatrix[optionB];

  if (configA?.incompatibleWith.includes(optionB)) return false;
  if (configB?.incompatibleWith.includes(optionA)) return false;

  return true;
};

// Get all compatible options for a given option
export const getCompatibleOptions = (optionId: string): string[] => {
  const config = compatibilityMatrix[optionId];
  return config?.compatibleWith || [];
};

// Get all incompatible options for a given option
export const getIncompatibleOptions = (optionId: string): string[] => {
  const config = compatibilityMatrix[optionId];
  return config?.incompatibleWith || [];
};

// Get compatibility note between two options
export const getCompatibilityNote = (source: string, target: string): string | undefined => {
  return compatibilityMatrix[source]?.notes?.[target];
};

// Validate a full stack selection
export const validateStackSelection = (
  selection: Record<string, string>
): { valid: boolean; conflicts: Array<{ optionA: string; optionB: string; reason?: string }> } => {
  const conflicts: Array<{ optionA: string; optionB: string; reason?: string }> = [];
  const selectedIds = Object.values(selection).filter(id => id && id !== 'none');

  for (let i = 0; i < selectedIds.length; i++) {
    for (let j = i + 1; j < selectedIds.length; j++) {
      const optionA = selectedIds[i];
      const optionB = selectedIds[j];

      if (!areCompatible(optionA, optionB)) {
        conflicts.push({
          optionA,
          optionB,
          reason: `${optionA} and ${optionB} are not compatible`,
        });
      }
    }
  }

  return {
    valid: conflicts.length === 0,
    conflicts,
  };
};

// Get recommended pairings for an option
export const getRecommendedPairings = (
  optionId: string
): Array<{ id: string; reason: string }> => {
  const config = compatibilityMatrix[optionId];
  if (!config?.notes) return [];

  return Object.entries(config.notes).map(([id, reason]) => ({
    id,
    reason,
  }));
};
