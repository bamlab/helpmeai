#!/usr/bin/env node
import { Command } from 'commander';
import { checkbox, select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import { ParserRegistry } from './parsers/base.js';
import { NpmParser } from './parsers/npm.js';
import { SkillMatcher } from './matcher.js';
import { SkillDownloader } from './downloader.js';
import { SkillInstaller } from './installer.js';
import { DEFAULT_CONFIG, type Config, type MatchedSkill, type Target } from './types.js';

const program = new Command();

program
  .name('help-me-ai')
  .description('Discover and install AI coding assistant skills based on your project dependencies')
  .version('1.0.0')
  .option('-d, --directory <path>', 'Project directory to analyze', process.cwd())
  .option('-r, --registry <url>', 'Custom skills registry URL', DEFAULT_CONFIG.registryUrl)
  .option('--all', 'Install all matching skills without prompting')
  .option('--list', 'List matching skills without installing')
  .action(async (options) => {
    try {
      await run(options);
    } catch (error) {
      if (error instanceof Error) {
        // Handle user cancellation gracefully
        if (error.message.includes('User force closed')) {
          console.log(chalk.yellow('\nOperation cancelled.'));
          process.exit(0);
        }
        console.error(chalk.red(`Error: ${error.message}`));
      } else {
        console.error(chalk.red('An unexpected error occurred'));
      }
      process.exit(1);
    }
  });

interface CliOptions {
  directory: string;
  registry: string;
  all?: boolean;
  list?: boolean;
}

async function run(options: CliOptions): Promise<void> {
  const config: Config = {
    ...DEFAULT_CONFIG,
    registryUrl: options.registry,
  };

  console.log(chalk.blue('🔍 Analyzing project dependencies...\n'));

  // Set up parser registry
  const parserRegistry = new ParserRegistry();
  parserRegistry.register(new NpmParser());

  // Find appropriate parser
  const parser = await parserRegistry.findParser(options.directory);
  if (!parser) {
    console.log(chalk.yellow('No supported package manager found in this directory.'));
    console.log(chalk.gray('Supported: package.json (npm/yarn/pnpm/bun)'));
    return;
  }

  console.log(chalk.gray(`Found ${parser.configFile} (${parser.name})`));

  // Parse dependencies
  const parseResult = await parser.parse(options.directory);
  console.log(chalk.gray(`Found ${parseResult.dependencies.length} dependencies\n`));

  // Fetch skills index
  console.log(chalk.blue('📦 Fetching skills registry...\n'));
  const downloader = new SkillDownloader(config);
  
  let index;
  try {
    index = await downloader.fetchIndex();
  } catch (error) {
    console.log(chalk.yellow('Could not fetch skills registry.'));
    console.log(chalk.gray('Make sure the registry URL is correct and accessible.'));
    console.log(chalk.gray(`Registry: ${config.registryUrl}`));
    return;
  }

  // Match skills
  const matcher = new SkillMatcher();
  const matchedSkills = matcher.matchSkills(parseResult.dependencies, index);

  if (matchedSkills.length === 0) {
    console.log(chalk.yellow('No matching skills found for your dependencies.'));
    return;
  }

  console.log(chalk.green(`✓ Found ${matchedSkills.length} matching skill(s):\n`));

  // List mode - just show skills and exit
  if (options.list) {
    for (const match of matchedSkills) {
      console.log(`  ${chalk.cyan(match.skill.name)}`);
      console.log(`    ${chalk.gray(match.skill.description)}`);
      console.log(`    ${chalk.gray(`Library: ${match.dependency.name}@${match.dependency.version}`)}`);
      console.log();
    }
    return;
  }

  // Detect targets
  const installer = new SkillInstaller();
  const targets = await installer.detectTargets(options.directory);
  const detectedTargets = targets.filter((t) => t.detected);

  if (detectedTargets.length === 0) {
    console.log(chalk.yellow('No .cursor or .claude directory found in this project.'));
    const shouldCreate = await confirm({
      message: 'Would you like to create a .cursor/skills directory?',
      default: true,
    });

    if (!shouldCreate) {
      console.log(chalk.gray('Exiting without installing skills.'));
      return;
    }

    // Mark cursor as the target even though it doesn't exist yet
    targets[0].detected = true;
  }

  // Select skills
  let selectedSkills: MatchedSkill[];

  if (options.all) {
    selectedSkills = matchedSkills;
    console.log(chalk.gray('Installing all matching skills...\n'));
  } else {
    const choices = matchedSkills.map((match) => ({
      name: `${match.skill.name} (${match.dependency.name}@${match.dependency.version})`,
      value: match,
      checked: true,
    }));

    selectedSkills = await checkbox({
      message: 'Select skills to install:',
      choices,
    });

    if (selectedSkills.length === 0) {
      console.log(chalk.yellow('No skills selected.'));
      return;
    }
  }

  // Select target
  let target: Target;

  if (detectedTargets.length === 1) {
    target = detectedTargets[0];
    console.log(chalk.gray(`\nTarget: ${installer.getTargetDisplayName(target.type)}`));
  } else if (detectedTargets.length > 1) {
    const targetChoices = detectedTargets.map((t) => ({
      name: `${installer.getTargetDisplayName(t.type)}${t.detected ? ' (detected)' : ''}`,
      value: t,
    }));

    target = await select({
      message: 'Select target directory:',
      choices: targetChoices,
    });
  } else {
    // Use cursor as default
    target = targets.find((t) => t.type === 'cursor')!;
  }

  // Download and install skills
  console.log(chalk.blue('\n📥 Downloading skills...\n'));

  for (const match of selectedSkills) {
    try {
      const files = await downloader.fetchSkillContent(match.skill);
      const installedFiles = await installer.installSkill(match.skill, files, target);
      
      console.log(chalk.green(`  ✓ ${match.skill.name}`));
      for (const file of installedFiles) {
        console.log(chalk.gray(`    → ${file}`));
      }
    } catch (error) {
      console.log(chalk.red(`  ✗ ${match.skill.name}: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  }

  console.log(chalk.green(`\n✨ Done! ${selectedSkills.length} skill(s) installed.`));
}

program.parse();
