import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { coerce } from 'semver';
import { PackageParser } from './base.js';
import type { Dependency, ParseResult } from '../types.js';

interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Parser for npm/yarn/pnpm/bun package.json files
 */
export class NpmParser extends PackageParser {
  readonly name = 'npm';
  readonly configFile = 'package.json';

  async canParse(directory: string): Promise<boolean> {
    const packageJsonPath = join(directory, this.configFile);
    try {
      await access(packageJsonPath);
      return true;
    } catch {
      return false;
    }
  }

  async parse(directory: string): Promise<ParseResult> {
    const packageJsonPath = join(directory, this.configFile);
    const content = await readFile(packageJsonPath, 'utf-8');
    const packageJson: PackageJson = JSON.parse(content);

    const dependencies: Dependency[] = [];

    // Parse regular dependencies
    if (packageJson.dependencies) {
      for (const [name, version] of Object.entries(packageJson.dependencies)) {
        dependencies.push({
          name,
          version: this.normalizeVersion(version),
          isDev: false,
        });
      }
    }

    // Parse dev dependencies
    if (packageJson.devDependencies) {
      for (const [name, version] of Object.entries(packageJson.devDependencies)) {
        dependencies.push({
          name,
          version: this.normalizeVersion(version),
          isDev: true,
        });
      }
    }

    return {
      dependencies,
      packageManager: this.name,
    };
  }

  /**
   * Normalize a version string to a clean semver version
   * Handles ranges like ^1.0.0, ~1.0.0, >=1.0.0, etc.
   */
  private normalizeVersion(version: string): string {
    // Remove common prefixes
    const cleaned = version.replace(/^[\^~>=<]+/, '').trim();
    
    // Try to coerce to a valid semver
    const coerced = coerce(cleaned);
    if (coerced) {
      return coerced.version;
    }
    
    // Return original if coercion fails
    return cleaned;
  }
}
