import { satisfies, coerce } from 'semver';
import type { Dependency, Skill, SkillsIndex, MatchedSkill } from './types.js';

/**
 * Match project dependencies against available skills
 */
export class SkillMatcher {
  /**
   * Find all skills that match the given dependencies
   */
  matchSkills(dependencies: Dependency[], index: SkillsIndex): MatchedSkill[] {
    const matched: MatchedSkill[] = [];

    for (const skill of index.skills) {
      const dependency = this.findMatchingDependency(skill, dependencies);
      if (dependency) {
        matched.push({ skill, dependency });
      }
    }

    return matched;
  }

  /**
   * Find a dependency that matches a skill's requirements
   */
  private findMatchingDependency(
    skill: Skill,
    dependencies: Dependency[]
  ): Dependency | null {
    // Check each matching library configuration
    for (const matchingLib of skill.matchingLibraries) {
      for (const dep of dependencies) {
        if (dep.name === matchingLib.name) {
          // Try to match the version
          if (this.versionMatches(dep.version, matchingLib.versionRange)) {
            return dep;
          }
        }
      }
    }
    return null;
  }

  /**
   * Check if a version satisfies a version range
   */
  private versionMatches(version: string, range: string): boolean {
    // Handle wildcard
    if (range === '*') {
      return true;
    }

    // Try direct semver satisfaction
    try {
      // Coerce the version to handle non-strict versions
      const coercedVersion = coerce(version);
      if (coercedVersion && satisfies(coercedVersion.version, range)) {
        return true;
      }
    } catch {
      // If semver parsing fails, try string comparison
    }

    // Try with original version string
    try {
      if (satisfies(version, range)) {
        return true;
      }
    } catch {
      // Ignore parsing errors
    }

    return false;
  }
}
