import type { ParseResult } from '../types.js';

/**
 * Abstract base class for package manager parsers
 */
export abstract class PackageParser {
  /**
   * The name of the package manager (e.g., 'npm', 'cargo', 'pip')
   */
  abstract readonly name: string;

  /**
   * The file name to look for (e.g., 'package.json', 'Cargo.toml')
   */
  abstract readonly configFile: string;

  /**
   * Check if this parser can handle the given directory
   */
  abstract canParse(directory: string): Promise<boolean>;

  /**
   * Parse dependencies from the config file
   */
  abstract parse(directory: string): Promise<ParseResult>;
}

/**
 * Registry of available parsers
 */
export class ParserRegistry {
  private parsers: PackageParser[] = [];

  /**
   * Register a new parser
   */
  register(parser: PackageParser): void {
    this.parsers.push(parser);
  }

  /**
   * Find a parser that can handle the given directory
   */
  async findParser(directory: string): Promise<PackageParser | null> {
    for (const parser of this.parsers) {
      if (await parser.canParse(directory)) {
        return parser;
      }
    }
    return null;
  }

  /**
   * Get all registered parsers
   */
  getParsers(): PackageParser[] {
    return [...this.parsers];
  }
}
