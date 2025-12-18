import chalk from 'chalk';
import ora, { type Ora } from 'ora';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

export class Logger {
  private verbose: boolean = false;
  private logLevel: LogLevel = LogLevel.INFO;
  private spinner: Ora | null = null;

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
    this.logLevel = verbose ? LogLevel.DEBUG : LogLevel.INFO;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  error(message: string, ...args: unknown[]): void {
    if (this.logLevel >= LogLevel.ERROR) {
      this.stopSpinner();
      console.error(chalk.red('✗'), message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(chalk.yellow('⚠'), message, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(message, ...args);
    }
  }

  success(message: string, ...args: unknown[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(chalk.green('✓'), message, ...args);
    }
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(chalk.gray('🔍'), chalk.gray(message), ...args);
    }
  }

  step(step: number, total: number, message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      const progress = chalk.blue(`[${step}/${total}]`);
      console.log(progress, message);
    }
  }

  startSpinner(message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      this.spinner = ora(message).start();
    }
  }

  updateSpinner(message: string): void {
    if (this.spinner) {
      this.spinner.text = message;
    }
  }

  succeedSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.succeed(message);
      this.spinner = null;
    }
  }

  failSpinner(message?: string): void {
    if (this.spinner) {
      this.spinner.fail(message);
      this.spinner = null;
    }
  }

  stopSpinner(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }

  progress(message: string): void {
    if (this.logLevel >= LogLevel.INFO) {
      process.stdout.write(chalk.blue('⏳') + ' ' + message);
    }
  }

  progressSuccess(): void {
    if (this.logLevel >= LogLevel.INFO) {
      process.stdout.write(chalk.green(' ✓\n'));
    }
  }

  progressError(): void {
    if (this.logLevel >= LogLevel.INFO) {
      process.stdout.write(chalk.red(' ✗\n'));
    }
  }

  newLine(): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log();
    }
  }

  progressBar(current: number, total: number, message: string = ''): void {
    if (this.logLevel >= LogLevel.INFO) {
      const width = 30;
      const percent = Math.round((current / total) * 100);
      const filled = Math.round((current / total) * width);
      const empty = width - filled;
      const bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
      process.stdout.write(`\r${bar} ${percent}% ${message}`);
      if (current === total) {
        process.stdout.write('\n');
      }
    }
  }

  table(data: Record<string, string>[]): void {
    if (this.logLevel >= LogLevel.INFO && data.length > 0) {
      const keys = Object.keys(data[0]!);
      const maxLengths = keys.map(key =>
        Math.max(key.length, ...data.map(row => String(row[key] || '').length))
      );

      const header = keys.map((key, i) => key.padEnd(maxLengths[i]!)).join(' | ');
      console.log(chalk.cyan(header));
      console.log(chalk.gray('-'.repeat(header.length)));

      for (const row of data) {
        const rowStr = keys.map((key, i) =>
          String(row[key] || '').padEnd(maxLengths[i]!)
        ).join(' | ');
        console.log(rowStr);
      }
    }
  }

  banner(text: string, subtitle?: string): void {
    console.log();
    console.log(chalk.bold.blue(text));
    if (subtitle) {
      console.log(chalk.gray(subtitle));
    }
    console.log();
  }
}

export const logger = new Logger();
