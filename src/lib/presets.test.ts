import { describe, it, expect } from 'vitest';
import { getPreset, listPresets, getPresetNames, PRESETS, PRESET_CHOICES } from './presets.js';

describe('Presets', () => {
  describe('getPreset', () => {
    it('should return undefined for none preset', () => {
      expect(getPreset('none')).toBeUndefined();
    });

    it('should return config for saas-starter', () => {
      const preset = getPreset('saas-starter');
      expect(preset).toBeDefined();
      expect(preset?.type).toBe('nextjs');
      expect(preset?.databaseProvider).toBe('supabase');
      expect(preset?.orm).toBe('drizzle');
      expect(preset?.authProvider).toBe('supabase-auth');
    });

    it('should return config for ai-rag-app', () => {
      const preset = getPreset('ai-rag-app');
      expect(preset).toBeDefined();
      expect(preset?.vectorDB).toBe('supabase-vector');
      expect(preset?.aiFramework).toBe('vercel-ai');
      expect(preset?.embeddingProvider).toBe('openai');
    });

    it('should return config for ai-agent', () => {
      const preset = getPreset('ai-agent');
      expect(preset).toBeDefined();
      expect(preset?.localAI).toBe('ollama');
      expect(preset?.aiFramework).toBe('langchain');
      expect(preset?.vectorDB).toBe('chroma');
    });

    it('should return config for edge-api', () => {
      const preset = getPreset('edge-api');
      expect(preset).toBeDefined();
      expect(preset?.type).toBe('hono-api');
      expect(preset?.runtime).toBe('bun');
      expect(preset?.databaseProvider).toBe('turso');
    });

    it('should return config for fastapi-starter', () => {
      const preset = getPreset('fastapi-starter');
      expect(preset).toBeDefined();
      expect(preset?.type).toBe('fastapi');
      expect(preset?.runtime).toBe('python');
      expect(preset?.pythonPackageManager).toBe('uv');
    });

    it('should return config for go-microservice', () => {
      const preset = getPreset('go-microservice');
      expect(preset).toBeDefined();
      expect(preset?.type).toBe('gin-api');
      expect(preset?.runtime).toBe('go');
      expect(preset?.orm).toBe('gorm');
    });

    it('should return config for rust-api', () => {
      const preset = getPreset('rust-api');
      expect(preset).toBeDefined();
      expect(preset?.type).toBe('axum-api');
      expect(preset?.runtime).toBe('rust');
      expect(preset?.orm).toBe('sqlx-rust');
    });

    it('should return config for quick-cli', () => {
      const preset = getPreset('quick-cli');
      expect(preset).toBeDefined();
      expect(preset?.type).toBe('cli');
      expect(preset?.complexityTrack).toBe('quick');
    });

    it('should return config for mcp-tool', () => {
      const preset = getPreset('mcp-tool');
      expect(preset).toBeDefined();
      expect(preset?.type).toBe('mcp-server');
    });

    it('should return config for mlx-local', () => {
      const preset = getPreset('mlx-local');
      expect(preset).toBeDefined();
      expect(preset?.localAI).toBe('mlx');
      expect(preset?.runtime).toBe('python');
    });
  });

  describe('listPresets', () => {
    it('should return all presets as array', () => {
      const presets = listPresets();
      expect(Array.isArray(presets)).toBe(true);
      expect(presets.length).toBe(Object.keys(PRESETS).length);
    });

    it('should include name and config for each preset', () => {
      const presets = listPresets();
      presets.forEach(preset => {
        expect(preset.name).toBeDefined();
        expect(preset.config).toBeDefined();
        expect(preset.config.type).toBeDefined();
        expect(preset.config.runtime).toBeDefined();
      });
    });
  });

  describe('getPresetNames', () => {
    it('should return array starting with none', () => {
      const names = getPresetNames();
      expect(names[0]).toBe('none');
    });

    it('should include all preset names', () => {
      const names = getPresetNames();
      expect(names).toContain('saas-starter');
      expect(names).toContain('ai-rag-app');
      expect(names).toContain('ai-agent');
      expect(names).toContain('fastapi-starter');
      expect(names).toContain('go-microservice');
      expect(names).toContain('rust-api');
    });

    it('should have correct count', () => {
      const names = getPresetNames();
      expect(names.length).toBe(Object.keys(PRESETS).length + 1); // +1 for 'none'
    });
  });

  describe('PRESET_CHOICES', () => {
    it('should have name and value for each choice', () => {
      PRESET_CHOICES.forEach(choice => {
        expect(choice.name).toBeDefined();
        expect(choice.value).toBeDefined();
      });
    });

    it('should include Custom option first', () => {
      expect(PRESET_CHOICES[0].value).toBe('none');
      expect(PRESET_CHOICES[0].name).toContain('Custom');
    });

    it('should have descriptions for most presets', () => {
      const withDescriptions = PRESET_CHOICES.filter(c => c.description);
      expect(withDescriptions.length).toBeGreaterThan(10);
    });
  });

  describe('PRESETS configuration', () => {
    it('should have all required fields', () => {
      Object.entries(PRESETS).forEach(([name, config]) => {
        expect(config.type, `${name} missing type`).toBeDefined();
        expect(config.complexityTrack, `${name} missing complexityTrack`).toBeDefined();
        expect(config.runtime, `${name} missing runtime`).toBeDefined();
      });
    });

    it('should have valid complexity tracks', () => {
      const validTracks = ['quick', 'standard', 'production'];
      Object.entries(PRESETS).forEach(([name, config]) => {
        expect(validTracks).toContain(config.complexityTrack);
      });
    });

    it('should have valid runtimes', () => {
      const validRuntimes = ['node', 'bun', 'deno', 'python', 'go', 'rust'];
      Object.entries(PRESETS).forEach(([name, config]) => {
        expect(validRuntimes, `${name} has invalid runtime: ${config.runtime}`).toContain(config.runtime);
      });
    });
  });
});
