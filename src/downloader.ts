import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
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
    
    // Handle local file:// URLs for testing
    if (url.startsWith('file://')) {
      const filePath = fileURLToPath(url);
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content) as SkillsIndex;
    }
    
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
    
    // Fetch the skill file directly (path now includes the filename)
    const skillUrl = `${this.config.registryUrl}/${skill.path}`;
    
    // Handle local file:// URLs for testing
    if (skillUrl.startsWith('file://')) {
      const filePath = fileURLToPath(skillUrl);
      const content = await readFile(filePath, 'utf-8');
      files.set('content', content);
      return files;
    }
    
    const response = await fetch(skillUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch skill ${skill.id}: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();
    files.set('content', content);

    return files;
  }

  /**
   * Build the full URL for a skill file
   */
  getSkillUrl(skill: Skill, filename: string): string {
    return `${this.config.registryUrl}/${skill.path}/${filename}`;
  }
}
