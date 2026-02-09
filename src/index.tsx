#!/usr/bin/env node
import React, { useState, useEffect } from 'react';
import { render, Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { MultiSelectCheckbox } from './components/MultiSelectCheckbox.js';
import { Command } from 'commander';
import { ParserRegistry } from './parsers/base.js';
import { NpmParser } from './parsers/npm.js';
import { SkillMatcher } from './matcher.js';
import { SkillDownloader } from './downloader.js';
import { SkillInstaller } from './installer.js';
import { DEFAULT_CONFIG, type Config, type MatchedSkill, type Target } from './types.js';

const program = new Command();

interface CliOptions {
  directory: string;
  registry: string;
  all?: boolean;
  list?: boolean;
}

type AppState =
  | { step: 'parsing' }
  | { step: 'fetching' }
  | { step: 'no-packages' }
  | { step: 'no-skills' }
  | { step: 'no-targets'; skills: MatchedSkill[] }
  | { step: 'selecting'; skills: MatchedSkill[]; targets: Target[] }
  | { step: 'list-only'; skills: MatchedSkill[] }
  | { step: 'installing'; selectedSkills: MatchedSkill[]; targets: Target[] }
  | { step: 'done'; count: number; installedFiles: string[] }
  | { step: 'error'; message: string };

interface AppProps {
  options: CliOptions;
}

const App: React.FC<AppProps> = ({ options }) => {
  const [state, setState] = useState<AppState>({ step: 'parsing' });

  // Initial setup
  useEffect(() => {
    if (state.step === 'parsing') {
      runSetup(options, setState);
    }
  }, []);

  // Installation effect
  useEffect(() => {
    if (state.step === 'installing') {
      performInstallation(state.selectedSkills, state.targets, options, setState);
    }
  }, [state.step]);

  if (state.step === 'parsing') {
    return (
      <Box flexDirection="column">
        <Box flexDirection="column" marginBottom={1}>
          <Text color="cyan" bold>🔍 Searching for AI skills adapted to your project...</Text>
          <Text color="gray">This tool will analyze your project dependencies and find AI coding assistant skills tailored to your needs.</Text>
          <Text color="gray">You'll be able to review and download the matching skills.</Text>
        </Box>
        <Box>
          <Text color="blue">
            <Spinner type="dots" />
          </Text>
          <Text> Analyzing project dependencies...</Text>
        </Box>
      </Box>
    );
  }

  if (state.step === 'fetching') {
    return (
      <Box flexDirection="column">
        <Box>
          <Text color="blue">
            <Spinner type="dots" />
          </Text>
          <Text> Fetching skills registry...</Text>
        </Box>
      </Box>
    );
  }

  if (state.step === 'no-packages') {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No supported package manager found in this directory.</Text>
        <Text color="gray">Supported: package.json (npm/yarn/pnpm/bun)</Text>
      </Box>
    );
  }

  if (state.step === 'no-skills') {
    return (
      <Box flexDirection="column">
        <Text color="yellow">No matching skills found for your dependencies.</Text>
      </Box>
    );
  }

  if (state.step === 'no-targets') {
    return (
      <Box flexDirection="column">
        <Text color="yellow">
          Skills will be installed to both .cursor/skills/ and .claude/skills/ directories.
        </Text>
      </Box>
    );
  }

  if (state.step === 'list-only') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="green">✓ Found {state.skills.length} matching skill(s):</Text>
        </Box>
        {state.skills.map((match) => (
          <Box key={match.skill.id} flexDirection="column" marginBottom={1}>
            <Text bold color="cyan">
              {match.skill.name}
            </Text>
            <Text color="gray">  {match.skill.description}</Text>
            <Text color="gray">
              {' '}
              {match.dependency.name}@{match.dependency.version}
            </Text>
            <Text color="magenta">  Author: {match.skill.author}</Text>
          </Box>
        ))}
      </Box>
    );
  }

  if (state.step === 'selecting') {
    const items = state.skills.map((match) => ({
      label: `${match.skill.name} - by ${match.skill.author} (${match.dependency.name}@${match.dependency.version})`,
      value: match,
    }));

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="green">✓ Found {state.skills.length} matching skill(s)</Text>
        </Box>
        <Text color="gray">↑↓ to navigate, Space to toggle, Enter to confirm</Text>
        <Box marginTop={1}>
          <MultiSelectCheckbox
            items={items}
            defaultSelected={items.map((item) => item.value)}
            onSubmit={(selectedItems: MatchedSkill[]) => {
              if (selectedItems.length === 0) {
                setState({ step: 'done', count: 0, installedFiles: [] });
                return;
              }

              setState({
                step: 'installing',
                selectedSkills: selectedItems,
                targets: state.targets,
              });
            }}
          />
        </Box>
      </Box>
    );
  }

  if (state.step === 'installing') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="blue">
            <Spinner type="dots" />
          </Text>
          <Text> Downloading and installing {state.selectedSkills.length} skill(s)...</Text>
        </Box>
      </Box>
    );
  }

  if (state.step === 'done') {
    return (
      <Box flexDirection="column">
        <Text color="green">
          ✨ Done! {state.count} skill(s) installed successfully.
        </Text>
        {state.installedFiles.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text color="gray">Installed files:</Text>
            {state.installedFiles.slice(0, 10).map((file, i) => (
              <Text key={i} color="gray">
                  {file}
              </Text>
            ))}
            {state.installedFiles.length > 10 && (
              <Text color="gray">  ... and {state.installedFiles.length - 10} more</Text>
            )}
          </Box>
        )}
        <Box flexDirection="column" marginTop={1} paddingTop={1} borderStyle="single" borderColor="yellow">
          <Text color="yellow" bold>📝 Next Step - Customize Your Skills</Text>
          <Box flexDirection="column" marginTop={1}>
            <Text color="gray">Some skills contain placeholders that need to be replaced with your actual codebase paths.</Text>
            <Text color="gray">Prompt your coding agent with this exact message:</Text>
          </Box>
          <Box flexDirection="column" marginTop={1}>
            <Text color="cyan">
              Replace all placeholder comments marked with "TO-EDIT" in the installed
            </Text>
            <Text color="cyan">
              skill files with the actual paths and imports from my codebase.
            </Text>
            <Text color="cyan">
              Analyze my project structure to find the correct testing utilities,
            </Text>
            <Text color="cyan">
              setup files, and configuration paths.
            </Text>
          </Box>
        </Box>
      </Box>
    );
  }

  if (state.step === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">Error: {state.message}</Text>
      </Box>
    );
  }

  return null;
};

async function runSetup(
  options: CliOptions,
  setState: React.Dispatch<React.SetStateAction<AppState>>
): Promise<void> {
  try {
    const config: Config = {
      ...DEFAULT_CONFIG,
      registryUrl: options.registry,
    };

    // Set up parser registry
    const parserRegistry = new ParserRegistry();
    parserRegistry.register(new NpmParser());

    // Find appropriate parser
    const parser = await parserRegistry.findParser(options.directory);
    if (!parser) {
      setState({ step: 'no-packages' });
      return;
    }

    // Parse dependencies
    const parseResult = await parser.parse(options.directory);

    // Fetch skills index
    setState({ step: 'fetching' });
    const downloader = new SkillDownloader(config);

    let index;
    try {
      index = await downloader.fetchIndex();
    } catch (error) {
      setState({
        step: 'error',
        message: 'Could not fetch skills registry. Make sure the registry URL is correct and accessible.',
      });
      return;
    }

    // Match skills
    const matcher = new SkillMatcher();
    const matchedSkills = matcher.matchSkills(parseResult.dependencies, index);

    if (matchedSkills.length === 0) {
      setState({ step: 'no-skills' });
      return;
    }

    // List mode - just show skills and exit
    if (options.list) {
      setState({ step: 'list-only', skills: matchedSkills });
      return;
    }

    // Detect targets (always returns both .cursor and .claude)
    const installer = new SkillInstaller();
    const targets = await installer.detectTargets(options.directory);

    // Install all mode - install to both targets
    if (options.all) {
      setState({ step: 'installing', selectedSkills: matchedSkills, targets });
      return;
    }

    // Interactive selection
    setState({ step: 'selecting', skills: matchedSkills, targets });
  } catch (error) {
    setState({
      step: 'error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    });
  }
}

async function performInstallation(
  selectedSkills: MatchedSkill[],
  targets: Target[],
  options: CliOptions,
  setState: React.Dispatch<React.SetStateAction<AppState>>
): Promise<void> {
  try {
    const config: Config = {
      ...DEFAULT_CONFIG,
      registryUrl: options.registry,
    };

    const downloader = new SkillDownloader(config);
    const installer = new SkillInstaller();

    let successCount = 0;
    const installedFiles: string[] = [];

    // Install to all targets (both .cursor and .claude)
    for (const match of selectedSkills) {
      try {
        const files = await downloader.fetchSkillContent(match.skill);
        // Install to each target
        for (const target of targets) {
          const paths = await installer.installSkill(match.skill, files, target);
          installedFiles.push(...paths);
        }
        successCount++;
      } catch (error) {
        // Continue with other skills even if one fails
        console.error(`Failed to install ${match.skill.name}: ${error}`);
      }
    }

    setState({ step: 'done', count: successCount, installedFiles });
  } catch (error) {
    setState({
      step: 'error',
      message: error instanceof Error ? error.message : 'Installation failed',
    });
  }
}

program
  .name('help-me-ai')
  .description('Discover and install AI coding assistant skills based on your project dependencies')
  .version('1.0.0')
  .option('-d, --directory <path>', 'Project directory to analyze', process.cwd())
  .option('-r, --registry <url>', 'Custom skills registry URL', DEFAULT_CONFIG.registryUrl)
  .option('--all', 'Install all matching skills without prompting')
  .option('--list', 'List matching skills without installing')
  .action((options: CliOptions) => {
    render(<App options={options} />);
  });

program.parse();
