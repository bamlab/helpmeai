import { mkdir, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { Skill, Target, TargetType } from './types.js';

/**
 * Install skills to the appropriate directory
 */
export class SkillInstaller {
  /**
   * Detect available targets in a directory
   * Always returns both .cursor and .claude targets
   */
  async detectTargets(directory: string): Promise<Target[]> {
    const targets: Target[] = [];

    // Always include .cursor target
    const cursorPath = join(directory, '.cursor');
    const cursorDetected = await this.directoryExists(cursorPath);
    targets.push({
      type: 'cursor',
      path: join(cursorPath, 'skills'),
      detected: cursorDetected,
    });

    // Always include .claude target (project-specific skills)
    const claudePath = join(directory, '.claude', 'skills');
    const claudeDetected = await this.directoryExists(join(directory, '.claude'));
    targets.push({
      type: 'claude',
      path: claudePath,
      detected: claudeDetected,
    });

    return targets;
  }

  /**
   * Install a skill to the target directory
   */
  async installSkill(
    skill: Skill,
    files: Map<string, string>,
    target: Target
  ): Promise<string[]> {
    const installedFiles: string[] = [];

    // Create skill directory: .cursor/skills/{skill-id}/
    const skillDirectory = join(target.path, skill.id);
    await this.ensureDirectory(skillDirectory);

    // Write skill content as SKILL.md inside the skill directory
    for (const [filename, content] of files) {
      // Write as SKILL.md inside the skill folder
      const filePath = join(skillDirectory, 'SKILL.md');
      await writeFile(filePath, content, 'utf-8');
      installedFiles.push(filePath);
    }

    return installedFiles;
  }

  /**
   * Get the display name for a target type
   */
  getTargetDisplayName(type: TargetType): string {
    switch (type) {
      case 'cursor':
        return '.cursor/skills/';
      case 'claude':
        return '.claude/skills/';
      default:
        return type;
    }
  }

  /**
   * Check if a directory exists
   */
  private async directoryExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Ensure a directory exists
   */
  private async ensureDirectory(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }
}
