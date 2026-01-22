import { mkdir, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { Skill, Target, TargetType } from './types.js';

/**
 * Install skills to the appropriate directory
 */
export class SkillInstaller {
  /**
   * Detect available targets in a directory
   */
  async detectTargets(directory: string): Promise<Target[]> {
    const targets: Target[] = [];

    // Check for .cursor directory
    const cursorPath = join(directory, '.cursor');
    const cursorDetected = await this.directoryExists(cursorPath);
    targets.push({
      type: 'cursor',
      path: join(cursorPath, 'skills'),
      detected: cursorDetected,
    });

    // Check for .claude directory
    const claudePath = join(directory, '.claude');
    const claudeDetected = await this.directoryExists(claudePath);
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

    // Ensure the target directory exists
    await this.ensureDirectory(target.path);

    // Write skill content directly as {skill-id}.md
    for (const [filename, content] of files) {
      // Use the skill ID as the filename (e.g., react-query-v5.md)
      const filePath = join(target.path, `${skill.id}.md`);
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
        return '.claude/';
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
