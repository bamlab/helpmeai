import type { Skill, SkillsIndex, Config } from './types.js';

/**
 * Download skills and index from GitHub
 */
export class SkillDownloader {
  constructor(private config: Config) {}

  /**
   * Fetch the skills index from the registry
   */
  async fetchIndex(): Promise<SkillsIndex> {
    const url = `${this.config.registryUrl}/index.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch skills index: ${response.status} ${response.statusText}`);
    }

    const index = (await response.json()) as SkillsIndex;
    return index;
  }

  /**
   * Fetch a skill's content from the registry
   */
  async fetchSkillContent(skill: Skill): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    
    // Fetch SKILL.md (main skill file)
    const skillMdUrl = `${this.config.registryUrl}/${skill.path}/SKILL.md`;
    const response = await fetch(skillMdUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch skill ${skill.id}: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();
    files.set('SKILL.md', content);

    return files;
  }

  /**
   * Build the full URL for a skill file
   */
  getSkillUrl(skill: Skill, filename: string): string {
    return `${this.config.registryUrl}/${skill.path}/${filename}`;
  }
}
