import { mkdir, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import type { Skill, Target, TargetType } from './types.js';

const execAsync = promisify(exec);

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

    // Only include .cursor target if the .cursor directory exists (i.e. Cursor is being used)
    const cursorPath = join(directory, '.cursor');
    const cursorDetected = await this.directoryExists(cursorPath);
    if (cursorDetected) {
      targets.push({
        type: 'cursor',
        path: join(cursorPath, 'skills'),
        detected: true,
      });
    }

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
   * Install a skills.sh skill using the `skills` CLI.
   * Runs: npx skills add <github-url> -s <skill-name> --agent '*' -y
   */
  async installViaSkillsCli(skill: Skill, directory: string): Promise<void> {
    const match = skill.skillsShUrl!.match(/^https:\/\/skills\.sh\/([^/]+)\/([^/]+)\/([^/]+)$/);
    if (!match) throw new Error(`Invalid skills.sh URL: ${skill.skillsShUrl}`);

    const [, org, repo, skillName] = match;
    const githubUrl = `https://github.com/${org}/${repo}`;

    await execAsync(
      `npx --yes skills add ${githubUrl} -s ${skillName} --agent '*' -y`,
      { cwd: directory }
    );
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
