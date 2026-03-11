/**
 * Represents a dependency found in a project
 */
export interface Dependency {
  name: string;
  version: string;
  isDev: boolean;
}

/**
 * Library matching configuration
 */
export interface MatchingLibrary {
  name: string;
  versionRange: string;
}

/**
 * Represents a skill in the registry.
 * Skills can be sourced from a direct URL (`path`) or from the skills.sh ecosystem (`skillsShUrl`).
 * For skills.sh, the URL format is: https://skills.sh/{org}/{repo}/{skill}
 * which resolves to: https://raw.githubusercontent.com/{org}/{repo}/main/skills/{skill}/AGENTS.md
 */
export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  matchingLibraries: MatchingLibrary[];
  /** Direct URL to the skill content (raw GitHub URL or local path) */
  path?: string;
  /** skills.sh URL, e.g. https://skills.sh/org/repo/skill-name */
  skillsShUrl?: string;
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
