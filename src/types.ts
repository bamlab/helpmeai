/**
 * Represents a dependency found in a project
 */
export interface Dependency {
  name: string;
  version: string;
  isDev: boolean;
}

/**
 * Represents a skill in the registry
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  library: string;
  versionRange: string;
  path: string;
}

/**
 * The skills registry index format
 */
export interface SkillsIndex {
  version: string;
  skills: Skill[];
}

/**
 * A skill matched to a project dependency
 */
export interface MatchedSkill {
  skill: Skill;
  dependency: Dependency;
}

/**
 * Supported target directories for skill installation
 */
export type TargetType = 'cursor' | 'claude';

/**
 * Target directory configuration
 */
export interface Target {
  type: TargetType;
  path: string;
  detected: boolean;
}

/**
 * Result of parsing a project's dependencies
 */
export interface ParseResult {
  dependencies: Dependency[];
  packageManager: string;
}

/**
 * Configuration for the CLI
 */
export interface Config {
  registryUrl: string;
  defaultBranch: string;
}

/**
 * Default configuration
 */
export const DEFAULT_CONFIG: Config = {
  registryUrl: 'https://raw.githubusercontent.com/bamlab/helpmeai/main/skills-repo',
  defaultBranch: 'main',
};
