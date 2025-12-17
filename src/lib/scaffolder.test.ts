import { describe, it, expect } from 'vitest';
import { buildContext } from './scaffolder.js';
import type {
  ProjectConfig,
  ProjectType,
  DatabaseProvider,
  OrmChoice,
  AuthProvider,
  Runtime,
  VectorDBProvider,
  EmbeddingProvider,
  LocalAIProvider,
  AIFramework,
  WebServer,
} from './types.js';

function createBaseConfig(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    name: 'test-project',
    description: 'Test project',
    preset: 'none',
    complexityTrack: 'standard',
    type: 'nextjs',
    port: 3000,
    databaseProvider: 'none',
    orm: 'none',
    authProvider: 'none',
    vectorDB: 'none',
    embeddingProvider: 'none',
    localAI: 'none',
    aiFramework: 'none',
    domain: '',
    githubUsername: 'testuser',
    webServer: 'none',
    useDesignSystem: false,
    runtime: 'node',
    ...overrides,
  };
}

describe('buildContext', () => {
  describe('Name Transformations', () => {
    it('should generate nameKebab correctly', () => {
      const config = createBaseConfig({ name: 'My Test Project' });
      const context = buildContext(config);
      expect(context.nameKebab).toBe('my-test-project');
    });

    it('should generate namePascal correctly', () => {
      const config = createBaseConfig({ name: 'my-test-project' });
      const context = buildContext(config);
      expect(context.namePascal).toBe('MyTestProject');
    });

    it('should generate nameCamel correctly', () => {
      const config = createBaseConfig({ name: 'my-test-project' });
      const context = buildContext(config);
      expect(context.nameCamel).toBe('myTestProject');
    });

    it('should generate nameSnake correctly', () => {
      const config = createBaseConfig({ name: 'my-test-project' });
      const context = buildContext(config);
      expect(context.nameSnake).toBe('my_test_project');
    });

    it('should set year and timestamp', () => {
      const config = createBaseConfig();
      const context = buildContext(config);
      expect(context.year).toBe(new Date().getFullYear());
      expect(context.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Project Types', () => {
    const projectTypes: ProjectType[] = [
      'nextjs', 'tanstack-start', 'vite-react', 'static',
      'hono-api', 'elysia-api', 'express-api', 'fresh-api',
      'fastapi', 'litestar',
      'gin-api', 'fiber-api', 'echo-api',
      'axum-api', 'actix-api',
      'cli', 'mcp-server', 'worker', 'library',
    ];

    projectTypes.forEach((type) => {
      it(`should handle project type: ${type}`, () => {
        const config = createBaseConfig({ type });
        const context = buildContext(config);
        expect(context.type).toBe(type);
      });
    });

    describe('Language Detection', () => {
      it('should detect TypeScript projects', () => {
        const tsTypes: ProjectType[] = ['nextjs', 'tanstack-start', 'vite-react', 'hono-api', 'elysia-api', 'express-api', 'cli', 'mcp-server', 'library', 'worker'];
        tsTypes.forEach((type) => {
          const context = buildContext(createBaseConfig({ type }));
          expect(context.isTypeScript).toBe(true);
          expect(context.isPython).toBe(false);
          expect(context.isGo).toBe(false);
          expect(context.isRust).toBe(false);
          expect(context.isDeno).toBe(false);
        });
      });

      it('should detect Python projects', () => {
        const pythonTypes: ProjectType[] = ['fastapi', 'litestar'];
        pythonTypes.forEach((type) => {
          const context = buildContext(createBaseConfig({ type }));
          expect(context.isPython).toBe(true);
          expect(context.isTypeScript).toBe(false);
          expect(context.isGo).toBe(false);
          expect(context.isRust).toBe(false);
        });
      });

      it('should detect Go projects', () => {
        const goTypes: ProjectType[] = ['gin-api', 'fiber-api', 'echo-api'];
        goTypes.forEach((type) => {
          const context = buildContext(createBaseConfig({ type }));
          expect(context.isGo).toBe(true);
          expect(context.isPython).toBe(false);
          expect(context.isTypeScript).toBe(false);
          expect(context.isRust).toBe(false);
        });
      });

      it('should detect Rust projects', () => {
        const rustTypes: ProjectType[] = ['axum-api', 'actix-api'];
        rustTypes.forEach((type) => {
          const context = buildContext(createBaseConfig({ type }));
          expect(context.isRust).toBe(true);
          expect(context.isPython).toBe(false);
          expect(context.isGo).toBe(false);
          expect(context.isTypeScript).toBe(false);
        });
      });

      it('should detect Deno projects', () => {
        const context = buildContext(createBaseConfig({ type: 'fresh-api' }));
        expect(context.isDeno).toBe(true);
        expect(context.isPython).toBe(false);
        expect(context.isGo).toBe(false);
        expect(context.isRust).toBe(false);
      });
    });
  });

  describe('Database Providers', () => {
    const dbProviders: DatabaseProvider[] = [
      'none', 'supabase', 'neon', 'turso', 'convex', 'pocketbase', 'firebase',
      'postgres-local', 'mysql-local', 'mongodb-local', 'sqlite',
      'planetscale', 'cockroachdb',
    ];

    dbProviders.forEach((provider) => {
      it(`should handle database provider: ${provider}`, () => {
        const config = createBaseConfig({ databaseProvider: provider });
        const context = buildContext(config);
        expect(context.databaseProvider).toBe(provider);
      });
    });

    describe('Database Type Detection', () => {
      it('should detect Postgres providers', () => {
        const postgresProviders: DatabaseProvider[] = ['postgres-local', 'supabase', 'neon', 'cockroachdb'];
        postgresProviders.forEach((provider) => {
          const context = buildContext(createBaseConfig({ databaseProvider: provider }));
          expect(context.usesPostgres).toBe(true);
          expect(context.usesMysql).toBe(false);
          expect(context.usesMongo).toBe(false);
        });
      });

      it('should detect MySQL providers', () => {
        const mysqlProviders: DatabaseProvider[] = ['mysql-local', 'planetscale'];
        mysqlProviders.forEach((provider) => {
          const context = buildContext(createBaseConfig({ databaseProvider: provider }));
          expect(context.usesMysql).toBe(true);
          expect(context.usesPostgres).toBe(false);
          expect(context.usesMongo).toBe(false);
        });
      });

      it('should detect MongoDB providers', () => {
        const context = buildContext(createBaseConfig({ databaseProvider: 'mongodb-local' }));
        expect(context.usesMongo).toBe(true);
        expect(context.usesPostgres).toBe(false);
        expect(context.usesMysql).toBe(false);
      });

      it('should detect BaaS providers', () => {
        const baasProviders: DatabaseProvider[] = ['supabase', 'convex', 'pocketbase', 'firebase'];
        baasProviders.forEach((provider) => {
          const context = buildContext(createBaseConfig({ databaseProvider: provider }));
          expect(context.usesBaaS).toBe(true);
        });
      });

      it('should not mark non-BaaS as BaaS', () => {
        const nonBaas: DatabaseProvider[] = ['postgres-local', 'mysql-local', 'sqlite', 'neon', 'turso'];
        nonBaas.forEach((provider) => {
          const context = buildContext(createBaseConfig({ databaseProvider: provider }));
          expect(context.usesBaaS).toBe(false);
        });
      });
    });
  });

  describe('ORM Choices', () => {
    const orms: OrmChoice[] = [
      'drizzle', 'prisma', 'kysely',
      'sqlalchemy', 'tortoise', 'sqlmodel',
      'gorm', 'sqlx-go',
      'diesel', 'sqlx-rust', 'sea-orm',
      'none',
    ];

    orms.forEach((orm) => {
      it(`should handle ORM: ${orm}`, () => {
        const config = createBaseConfig({ orm });
        const context = buildContext(config);
        expect(context.orm).toBe(orm);
      });
    });
  });

  describe('Auth Providers', () => {
    const authProviders: AuthProvider[] = [
      'none', 'clerk', 'kinde', 'auth0', 'workos',
      'better-auth', 'lucia', 'authjs',
      'supabase-auth', 'convex-auth', 'firebase-auth', 'pocketbase-auth',
    ];

    authProviders.forEach((provider) => {
      it(`should handle auth provider: ${provider}`, () => {
        const config = createBaseConfig({ authProvider: provider });
        const context = buildContext(config);
        expect(context.authProvider).toBe(provider);
      });
    });
  });

  describe('Runtimes', () => {
    const runtimes: Runtime[] = ['node', 'bun', 'deno', 'python', 'go', 'rust'];

    runtimes.forEach((runtime) => {
      it(`should handle runtime: ${runtime}`, () => {
        const config = createBaseConfig({ runtime });
        const context = buildContext(config);
        expect(context.runtime).toBe(runtime);
      });
    });
  });

  describe('Web Servers', () => {
    const webServers: WebServer[] = ['none', 'caddy', 'nginx', 'traefik'];

    webServers.forEach((server) => {
      it(`should handle web server: ${server}`, () => {
        const config = createBaseConfig({ webServer: server });
        const context = buildContext(config);
        expect(context.webServer).toBe(server);
      });
    });
  });

  describe('AI/ML Features', () => {
    describe('AI Frameworks', () => {
      const frameworks: AIFramework[] = [
        'none', 'vercel-ai', 'langchain', 'llamaindex',
        'mastra', 'instructor', 'semantic-kernel',
      ];

      frameworks.forEach((framework) => {
        it(`should handle AI framework: ${framework}`, () => {
          const config = createBaseConfig({ aiFramework: framework });
          const context = buildContext(config);
          expect(context.aiFramework).toBe(framework);
        });
      });

      it('should detect hasAI when framework is set', () => {
        const context = buildContext(createBaseConfig({ aiFramework: 'langchain' }));
        expect(context.hasAI).toBe(true);
      });

      it('should not detect hasAI when framework is none', () => {
        const context = buildContext(createBaseConfig({ aiFramework: 'none' }));
        expect(context.hasAI).toBe(false);
      });
    });

    describe('Vector Databases', () => {
      const vectorDBs: VectorDBProvider[] = [
        'none', 'pinecone', 'weaviate', 'qdrant', 'chroma',
        'pgvector', 'supabase-vector', 'turbopuffer', 'milvus',
      ];

      vectorDBs.forEach((db) => {
        it(`should handle vector DB: ${db}`, () => {
          const config = createBaseConfig({ vectorDB: db });
          const context = buildContext(config);
          expect(context.vectorDB).toBe(db);
        });
      });

      it('should detect hasVectorDB when set', () => {
        const context = buildContext(createBaseConfig({ vectorDB: 'pinecone' }));
        expect(context.hasVectorDB).toBe(true);
      });
    });

    describe('Embedding Providers', () => {
      const embeddings: EmbeddingProvider[] = [
        'none', 'openai', 'cohere', 'voyage', 'ollama',
        'huggingface', 'together', 'google', 'fastembed',
      ];

      embeddings.forEach((provider) => {
        it(`should handle embedding provider: ${provider}`, () => {
          const config = createBaseConfig({ embeddingProvider: provider });
          const context = buildContext(config);
          expect(context.embeddingProvider).toBe(provider);
        });
      });

      it('should detect hasEmbeddings when set', () => {
        const context = buildContext(createBaseConfig({ embeddingProvider: 'openai' }));
        expect(context.hasEmbeddings).toBe(true);
      });
    });

    describe('Local AI Providers', () => {
      const localAI: LocalAIProvider[] = [
        'none', 'ollama', 'lmstudio', 'jan',
        'mlx', 'mlx-lm',
        'vllm', 'localai', 'tgi',
        'llamacpp', 'text-gen-webui',
      ];

      localAI.forEach((provider) => {
        it(`should handle local AI provider: ${provider}`, () => {
          const config = createBaseConfig({ localAI: provider });
          const context = buildContext(config);
          expect(context.localAI).toBe(provider);
        });
      });

      it('should detect hasLocalAI when set', () => {
        const context = buildContext(createBaseConfig({ localAI: 'ollama' }));
        expect(context.hasLocalAI).toBe(true);
      });

      it('should detect MLX providers', () => {
        const mlxProviders: LocalAIProvider[] = ['mlx', 'mlx-lm'];
        mlxProviders.forEach((provider) => {
          const context = buildContext(createBaseConfig({ localAI: provider }));
          expect(context.usesMLX).toBe(true);
        });
      });

      it('should not detect MLX for non-MLX providers', () => {
        const nonMLX: LocalAIProvider[] = ['ollama', 'vllm', 'localai'];
        nonMLX.forEach((provider) => {
          const context = buildContext(createBaseConfig({ localAI: provider }));
          expect(context.usesMLX).toBe(false);
        });
      });
    });

    describe('RAG Detection', () => {
      it('should detect isRAGApp when vector DB and embeddings are set', () => {
        const context = buildContext(createBaseConfig({
          vectorDB: 'pinecone',
          embeddingProvider: 'openai',
        }));
        expect(context.isRAGApp).toBe(true);
      });

      it('should not detect isRAGApp when only vector DB is set', () => {
        const context = buildContext(createBaseConfig({
          vectorDB: 'pinecone',
          embeddingProvider: 'none',
        }));
        expect(context.isRAGApp).toBe(false);
      });

      it('should not detect isRAGApp when only embeddings are set', () => {
        const context = buildContext(createBaseConfig({
          vectorDB: 'none',
          embeddingProvider: 'openai',
        }));
        expect(context.isRAGApp).toBe(false);
      });
    });
  });

  describe('Docker Requirements', () => {
    it('should require Docker for postgres-local', () => {
      const context = buildContext(createBaseConfig({ databaseProvider: 'postgres-local' }));
      expect(context.needsDocker).toBe(true);
    });

    it('should require Docker for mysql-local', () => {
      const context = buildContext(createBaseConfig({ databaseProvider: 'mysql-local' }));
      expect(context.needsDocker).toBe(true);
    });

    it('should require Docker for mongodb-local', () => {
      const context = buildContext(createBaseConfig({ databaseProvider: 'mongodb-local' }));
      expect(context.needsDocker).toBe(true);
    });

    it('should require Docker for self-hosted vector DBs', () => {
      const dockerVectorDBs: VectorDBProvider[] = ['qdrant', 'chroma', 'weaviate', 'milvus'];
      dockerVectorDBs.forEach((db) => {
        const context = buildContext(createBaseConfig({ vectorDB: db }));
        expect(context.needsDocker).toBe(true);
      });
    });

    it('should require Docker for self-hosted AI', () => {
      const dockerAI: LocalAIProvider[] = ['ollama', 'vllm', 'localai', 'tgi'];
      dockerAI.forEach((ai) => {
        const context = buildContext(createBaseConfig({ localAI: ai }));
        expect(context.needsDocker).toBe(true);
      });
    });

    it('should not require Docker for serverless options', () => {
      const context = buildContext(createBaseConfig({
        databaseProvider: 'supabase',
        vectorDB: 'pinecone',
        localAI: 'none',
      }));
      expect(context.needsDocker).toBe(false);
    });
  });

  describe('GPU Requirements', () => {
    it('should require GPU for vllm', () => {
      const context = buildContext(createBaseConfig({ localAI: 'vllm' }));
      expect(context.needsGPU).toBe(true);
    });

    it('should require GPU for text-gen-webui', () => {
      const context = buildContext(createBaseConfig({ localAI: 'text-gen-webui' }));
      expect(context.needsGPU).toBe(true);
    });

    it('should require GPU for TGI', () => {
      const context = buildContext(createBaseConfig({ localAI: 'tgi' }));
      expect(context.needsGPU).toBe(true);
    });

    it('should require GPU for HuggingFace embeddings', () => {
      const context = buildContext(createBaseConfig({ embeddingProvider: 'huggingface' }));
      expect(context.needsGPU).toBe(true);
    });

    it('should not require GPU for Ollama', () => {
      const context = buildContext(createBaseConfig({ localAI: 'ollama' }));
      expect(context.needsGPU).toBe(false);
    });

    it('should not require GPU for MLX (uses Apple Silicon)', () => {
      const context = buildContext(createBaseConfig({ localAI: 'mlx' }));
      expect(context.needsGPU).toBe(false);
    });
  });

  describe('Complexity Tracks', () => {
    it('should handle quick complexity', () => {
      const context = buildContext(createBaseConfig({ complexityTrack: 'quick' }));
      expect(context.complexityTrack).toBe('quick');
    });

    it('should handle standard complexity', () => {
      const context = buildContext(createBaseConfig({ complexityTrack: 'standard' }));
      expect(context.complexityTrack).toBe('standard');
    });

    it('should handle production complexity', () => {
      const context = buildContext(createBaseConfig({ complexityTrack: 'production' }));
      expect(context.complexityTrack).toBe('production');
    });
  });

  describe('Full Stack Configurations', () => {
    it('should handle SaaS starter preset equivalent', () => {
      const config = createBaseConfig({
        type: 'nextjs',
        databaseProvider: 'supabase',
        orm: 'drizzle',
        authProvider: 'supabase-auth',
        useDesignSystem: true,
        complexityTrack: 'production',
      });
      const context = buildContext(config);
      expect(context.usesPostgres).toBe(true);
      expect(context.usesBaaS).toBe(true);
      expect(context.isTypeScript).toBe(true);
      expect(context.needsDocker).toBe(false);
    });

    it('should handle AI RAG app preset equivalent', () => {
      const config = createBaseConfig({
        type: 'nextjs',
        databaseProvider: 'supabase',
        orm: 'drizzle',
        authProvider: 'supabase-auth',
        vectorDB: 'supabase-vector',
        embeddingProvider: 'openai',
        aiFramework: 'vercel-ai',
      });
      const context = buildContext(config);
      expect(context.hasAI).toBe(true);
      expect(context.hasVectorDB).toBe(true);
      expect(context.hasEmbeddings).toBe(true);
      expect(context.isRAGApp).toBe(true);
    });

    it('should handle local AI agent preset equivalent', () => {
      const config = createBaseConfig({
        type: 'hono-api',
        databaseProvider: 'turso',
        orm: 'drizzle',
        vectorDB: 'chroma',
        embeddingProvider: 'ollama',
        localAI: 'ollama',
        aiFramework: 'langchain',
      });
      const context = buildContext(config);
      expect(context.hasAI).toBe(true);
      expect(context.hasLocalAI).toBe(true);
      expect(context.needsDocker).toBe(true);
      expect(context.isRAGApp).toBe(true);
    });

    it('should handle MLX local preset equivalent', () => {
      const config = createBaseConfig({
        type: 'fastapi',
        runtime: 'python',
        databaseProvider: 'sqlite',
        orm: 'sqlalchemy',
        vectorDB: 'chroma',
        embeddingProvider: 'ollama',
        localAI: 'mlx',
        aiFramework: 'langchain',
      });
      const context = buildContext(config);
      expect(context.isPython).toBe(true);
      expect(context.usesMLX).toBe(true);
      expect(context.hasLocalAI).toBe(true);
      expect(context.needsGPU).toBe(false);
    });

    it('should handle Go microservice preset equivalent', () => {
      const config = createBaseConfig({
        type: 'gin-api',
        runtime: 'go',
        databaseProvider: 'postgres-local',
        orm: 'gorm',
      });
      const context = buildContext(config);
      expect(context.isGo).toBe(true);
      expect(context.usesPostgres).toBe(true);
      expect(context.needsDocker).toBe(true);
    });

    it('should handle Rust API preset equivalent', () => {
      const config = createBaseConfig({
        type: 'axum-api',
        runtime: 'rust',
        databaseProvider: 'postgres-local',
        orm: 'sqlx-rust',
      });
      const context = buildContext(config);
      expect(context.isRust).toBe(true);
      expect(context.usesPostgres).toBe(true);
      expect(context.needsDocker).toBe(true);
    });

    it('should handle FastAPI starter preset equivalent', () => {
      const config = createBaseConfig({
        type: 'fastapi',
        runtime: 'python',
        databaseProvider: 'postgres-local',
        orm: 'sqlalchemy',
        pythonPackageManager: 'uv',
      });
      const context = buildContext(config);
      expect(context.isPython).toBe(true);
      expect(context.usesPostgres).toBe(true);
      expect(context.needsDocker).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty name gracefully', () => {
      const config = createBaseConfig({ name: '' });
      const context = buildContext(config);
      expect(context.nameKebab).toBe('');
      expect(context.namePascal).toBe('');
    });

    it('should handle name with special characters', () => {
      const config = createBaseConfig({ name: 'my-project-2024' });
      const context = buildContext(config);
      expect(context.nameKebab).toBe('my-project-2024');
      expect(context.nameSnake).toBe('my_project_2024');
    });

    it('should handle all options set to none', () => {
      const config = createBaseConfig({
        databaseProvider: 'none',
        orm: 'none',
        authProvider: 'none',
        vectorDB: 'none',
        embeddingProvider: 'none',
        localAI: 'none',
        aiFramework: 'none',
        webServer: 'none',
      });
      const context = buildContext(config);
      expect(context.usesPostgres).toBe(false);
      expect(context.usesBaaS).toBe(false);
      expect(context.hasAI).toBe(false);
      expect(context.needsDocker).toBe(false);
      expect(context.needsGPU).toBe(false);
    });
  });
});
