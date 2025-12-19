/**
 * Constraint Engine - Rule-based stack validation
 * Prevents invalid or problematic stack combinations
 */

import type { ProjectConfig } from '../lib/types.js';

export type ConstraintSeverity = 'error' | 'warning';

export interface Constraint {
  id: string;
  severity: ConstraintSeverity;
  check: (config: ProjectConfig) => boolean;
  message: string;
  docs?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ConstraintViolation[];
  warnings: ConstraintViolation[];
}

export interface ConstraintViolation {
  id: string;
  message: string;
  docs?: string;
}

/**
 * Known compatibility constraints from research and ecosystem documentation
 */
export const CONSTRAINTS: Constraint[] = [
  // D1 requires Drizzle (Prisma has edge compatibility issues)
  {
    id: 'd1-requires-drizzle',
    severity: 'error',
    check: (config) => config.databaseProvider === 'd1' && config.orm === 'prisma',
    message: 'Cloudflare D1 requires Drizzle ORM. Prisma has significant edge compatibility issues with D1 including large bundle sizes and transaction incompatibility.',
    docs: 'https://orm.drizzle.team/docs/connect-cloudflare-d1',
  },

  // Better-Auth + Next.js 16 + Bun has build issues
  {
    id: 'better-auth-nextjs-bun',
    severity: 'error',
    check: (config) =>
      config.authProvider === 'better-auth' &&
      config.type === 'nextjs' &&
      config.runtime === 'bun',
    message: 'Better-Auth has known build failures with Next.js + Bun runtime. Use Node.js runtime or switch to a different auth provider.',
    docs: 'https://github.com/better-auth/better-auth/issues/6781',
  },

  // Turbopuffer cold start warning for real-time use cases
  {
    id: 'turbopuffer-latency',
    severity: 'warning',
    check: (config) => config.vectorDB === 'turbopuffer',
    message: 'Turbopuffer uses object storage architecture with ~500ms P90 cold query latency. Ensure your UI has loading states for search operations. Consider Pinecone or Qdrant for sub-50ms latency requirements.',
    docs: 'https://turbopuffer.com/',
  },

  // Prisma + Edge runtimes warning
  {
    id: 'prisma-edge-warning',
    severity: 'warning',
    check: (config) =>
      config.orm === 'prisma' &&
      (config.runtime === 'bun' || config.type === 'hono-api'),
    message: 'Prisma on edge runtimes requires the Prisma Accelerate or Data Proxy. Consider Drizzle for simpler edge deployment.',
    docs: 'https://www.prisma.io/docs/orm/prisma-client/deployment/edge/overview',
  },

  // Firebase + Drizzle incompatibility
  {
    id: 'firebase-orm-mismatch',
    severity: 'error',
    check: (config) =>
      config.databaseProvider === 'firebase' &&
      config.orm !== 'none',
    message: 'Firebase Firestore is a NoSQL document database and does not work with SQL ORMs like Drizzle or Prisma. Set ORM to "none" when using Firebase.',
  },

  // MongoDB + SQL ORM incompatibility
  {
    id: 'mongodb-sql-orm',
    severity: 'error',
    check: (config) =>
      config.databaseProvider === 'mongodb-local' &&
      !['none', 'prisma'].includes(config.orm),
    message: 'MongoDB is a NoSQL database. Only Prisma supports MongoDB among SQL-style ORMs. Use Prisma or set ORM to "none" for Mongoose.',
  },

  // Convex + external ORM incompatibility
  {
    id: 'convex-orm-mismatch',
    severity: 'error',
    check: (config) =>
      config.databaseProvider === 'convex' &&
      config.orm !== 'none',
    message: 'Convex is a reactive BaaS with its own data layer. External ORMs are not compatible. Set ORM to "none".',
  },

  // PocketBase + external ORM incompatibility
  {
    id: 'pocketbase-orm-mismatch',
    severity: 'error',
    check: (config) =>
      config.databaseProvider === 'pocketbase' &&
      config.orm !== 'none',
    message: 'PocketBase is a self-contained BaaS with built-in SQLite. External ORMs are not compatible. Set ORM to "none".',
  },

  // Auth provider without database warning
  {
    id: 'auth-needs-database',
    severity: 'warning',
    check: (config) =>
      config.authProvider !== 'none' &&
      !['clerk', 'auth0', 'workos', 'kinde'].includes(config.authProvider) &&
      config.databaseProvider === 'none',
    message: 'Self-hosted auth providers like Better-Auth, Lucia, and AuthJS require a database to store sessions and users. Add a database or use a managed auth provider like Clerk.',
  },

  // Vector DB without embedding provider
  {
    id: 'vectordb-needs-embeddings',
    severity: 'warning',
    check: (config) =>
      config.vectorDB !== 'none' &&
      config.embeddingProvider === 'none',
    message: 'You selected a vector database but no embedding provider. You will need to provide embeddings to store and query vectors.',
  },

  // MLX only works on Apple Silicon
  {
    id: 'mlx-apple-only',
    severity: 'warning',
    check: (config) => config.localAI === 'mlx',
    message: 'MLX is optimized for Apple Silicon (M1/M2/M3/M4/M5). This project will only run on macOS with Apple Silicon.',
  },

  // Supabase-vector requires Supabase
  {
    id: 'supabase-vector-requires-supabase',
    severity: 'error',
    check: (config) =>
      config.vectorDB === 'supabase-vector' &&
      config.databaseProvider !== 'supabase',
    message: 'Supabase Vector is a pgvector integration and requires Supabase as the database provider.',
  },

  // Platform-specific auth requires matching platform
  {
    id: 'supabase-auth-requires-supabase',
    severity: 'error',
    check: (config) =>
      config.authProvider === 'supabase-auth' &&
      config.databaseProvider !== 'supabase',
    message: 'Supabase Auth requires Supabase as the database provider.',
  },

  {
    id: 'convex-auth-requires-convex',
    severity: 'error',
    check: (config) =>
      config.authProvider === 'convex-auth' &&
      config.databaseProvider !== 'convex',
    message: 'Convex Auth requires Convex as the database provider.',
  },

  {
    id: 'firebase-auth-requires-firebase',
    severity: 'error',
    check: (config) =>
      config.authProvider === 'firebase-auth' &&
      config.databaseProvider !== 'firebase',
    message: 'Firebase Auth requires Firebase as the database provider.',
  },

  {
    id: 'pocketbase-auth-requires-pocketbase',
    severity: 'error',
    check: (config) =>
      config.authProvider === 'pocketbase-auth' &&
      config.databaseProvider !== 'pocketbase',
    message: 'PocketBase Auth requires PocketBase as the database provider.',
  },

  // Python ORM with non-Python runtime
  {
    id: 'python-orm-runtime-mismatch',
    severity: 'error',
    check: (config) =>
      ['sqlalchemy', 'tortoise', 'sqlmodel'].includes(config.orm) &&
      config.runtime !== 'python',
    message: 'SQLAlchemy, Tortoise ORM, and SQLModel are Python ORMs and require Python runtime.',
  },

  // Go ORM with non-Go runtime
  {
    id: 'go-orm-runtime-mismatch',
    severity: 'error',
    check: (config) =>
      ['gorm', 'sqlx-go'].includes(config.orm) &&
      config.runtime !== 'go',
    message: 'GORM and sqlx are Go ORMs and require Go runtime.',
  },

  // Rust ORM with non-Rust runtime
  {
    id: 'rust-orm-runtime-mismatch',
    severity: 'error',
    check: (config) =>
      ['diesel', 'sqlx-rust', 'sea-orm'].includes(config.orm) &&
      config.runtime !== 'rust',
    message: 'Diesel, SQLx, and SeaORM are Rust ORMs and require Rust runtime.',
  },

  // TanStack Start requires TypeScript runtime
  {
    id: 'tanstack-requires-ts',
    severity: 'error',
    check: (config) =>
      config.type === 'tanstack-start' &&
      !['node', 'bun'].includes(config.runtime),
    message: 'TanStack Start is a TypeScript framework and requires Node.js or Bun runtime.',
  },
];

/**
 * Validate a project configuration against all constraints
 */
export function validateConstraints(config: ProjectConfig): ValidationResult {
  const errors: ConstraintViolation[] = [];
  const warnings: ConstraintViolation[] = [];

  for (const constraint of CONSTRAINTS) {
    if (constraint.check(config)) {
      const violation: ConstraintViolation = {
        id: constraint.id,
        message: constraint.message,
        docs: constraint.docs,
      };

      if (constraint.severity === 'error') {
        errors.push(violation);
      } else {
        warnings.push(violation);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get a human-readable summary of validation results
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('❌ Stack Validation Errors:');
    for (const error of result.errors) {
      lines.push(`  • ${error.message}`);
      if (error.docs) {
        lines.push(`    📖 ${error.docs}`);
      }
    }
  }

  if (result.warnings.length > 0) {
    if (lines.length > 0) lines.push('');
    lines.push('⚠️  Stack Warnings:');
    for (const warning of result.warnings) {
      lines.push(`  • ${warning.message}`);
      if (warning.docs) {
        lines.push(`    📖 ${warning.docs}`);
      }
    }
  }

  if (result.valid && result.warnings.length === 0) {
    lines.push('✅ Stack validation passed - no issues detected');
  }

  return lines.join('\n');
}
