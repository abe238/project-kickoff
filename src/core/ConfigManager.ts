import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export interface Config {
  defaultPreset?: string;
  defaultPackageManager?: 'npm' | 'yarn' | 'pnpm' | 'bun';
  defaultAuthor?: string;
  defaultLicense?: string;
  githubUsername?: string;
  skipGitByDefault?: boolean;
  skipInstallByDefault?: boolean;
  verboseByDefault?: boolean;
}

export class ConfigManager {
  private configPath: string;
  private config: Config = {};
  private defaultConfig: Config = {
    defaultPreset: undefined,
    defaultPackageManager: 'npm',
    defaultAuthor: '',
    defaultLicense: 'MIT',
    githubUsername: '',
    skipGitByDefault: false,
    skipInstallByDefault: false,
    verboseByDefault: false
  };

  constructor() {
    const configDir = process.env.KICKOFF_CONFIG_DIR ||
                      path.join(os.homedir(), '.kickoff');
    this.configPath = path.join(configDir, 'config.json');
  }

  async initialize(): Promise<void> {
    await this.ensureConfigDirectory();
    await this.loadConfig();
  }

  async getConfig(): Promise<Config> {
    return { ...this.defaultConfig, ...this.config };
  }

  async get<K extends keyof Config>(key: K): Promise<Config[K]> {
    const config = await this.getConfig();
    return config[key];
  }

  async set<K extends keyof Config>(key: K, value: Config[K]): Promise<void> {
    this.config[key] = value;
    await this.saveConfig();
  }

  async updateConfig(updates: Partial<Config>): Promise<void> {
    this.config = { ...this.config, ...updates };
    await this.saveConfig();
  }

  async resetConfig(): Promise<void> {
    this.config = { ...this.defaultConfig };
    await this.saveConfig();
  }

  getConfigPath(): string {
    return this.configPath;
  }

  private async ensureConfigDirectory(): Promise<void> {
    const configDir = path.dirname(this.configPath);
    await fs.ensureDir(configDir);
  }

  private async loadConfig(): Promise<void> {
    try {
      if (await fs.pathExists(this.configPath)) {
        const configData = await fs.readFile(this.configPath, 'utf-8');
        const parsedConfig = JSON.parse(configData);
        this.validateConfig(parsedConfig);
        this.config = parsedConfig;
      }
    } catch (error) {
      this.config = {};
    }
    this.applyEnvironmentOverrides();
  }

  private async saveConfig(): Promise<void> {
    try {
      const configToSave = { ...this.defaultConfig, ...this.config };
      await fs.writeFile(this.configPath, JSON.stringify(configToSave, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private validateConfig(config: unknown): void {
    if (typeof config !== 'object' || config === null) {
      throw new Error('Config must be a valid JSON object');
    }

    const cfg = config as Record<string, unknown>;

    if (cfg.defaultPackageManager && !['npm', 'yarn', 'pnpm', 'bun'].includes(cfg.defaultPackageManager as string)) {
      throw new Error('defaultPackageManager must be one of: npm, yarn, pnpm, bun');
    }
  }

  private applyEnvironmentOverrides(): void {
    if (process.env.KICKOFF_DEFAULT_PRESET) {
      this.config.defaultPreset = process.env.KICKOFF_DEFAULT_PRESET;
    }
    if (process.env.KICKOFF_DEFAULT_AUTHOR) {
      this.config.defaultAuthor = process.env.KICKOFF_DEFAULT_AUTHOR;
    }
    if (process.env.KICKOFF_GITHUB_USERNAME) {
      this.config.githubUsername = process.env.KICKOFF_GITHUB_USERNAME;
    }
    if (process.env.KICKOFF_SKIP_GIT === 'true') {
      this.config.skipGitByDefault = true;
    }
    if (process.env.KICKOFF_SKIP_INSTALL === 'true') {
      this.config.skipInstallByDefault = true;
    }
  }
}

export const configManager = new ConfigManager();
