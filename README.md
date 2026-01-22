# help-me-ai

CLI tool to discover and install AI coding assistant skills based on your project dependencies.

## Installation

```bash
# Run directly with npx
npx @bam.tech/help-me-ai

# Or install globally
npm install -g @bam.tech/help-me-ai
```

## Usage

Navigate to your project directory and run:

```bash
npx @bam.tech/help-me-ai
```

The CLI will:

1. Scan your `package.json` for dependencies
2. Match them against available skills in the registry
3. Present an interactive selection of matching skills
4. Download and install selected skills to `.cursor/skills/` or `.claude/`

### Options

```bash
help-me-ai [options]

Options:
  -d, --directory <path>  Project directory to analyze (default: current directory)
  -r, --registry <url>    Custom skills registry URL
  --all                   Install all matching skills without prompting
  --list                  List matching skills without installing
  -V, --version           Output version number
  -h, --help              Display help
```

### Examples

```bash
# Analyze current directory
npx @bam.tech/help-me-ai

# Analyze a specific directory
npx @bam.tech/help-me-ai -d /path/to/project

# List available skills without installing
npx @bam.tech/help-me-ai --list

# Install all matching skills
npx @bam.tech/help-me-ai --all

# Use a custom registry
npx @bam.tech/help-me-ai -r https://raw.githubusercontent.com/myorg/my-skills/main
```

## How It Works

The CLI reads your project's dependencies and matches them against a skills registry. Skills are version-aware, so you'll only see skills compatible with your installed library versions.

### Supported Package Managers

- npm / yarn / pnpm / bun (via `package.json`)
- More coming soon (Cargo.toml, requirements.txt, etc.)

### Target Directories

The CLI automatically detects which AI assistant you're using:

- **Cursor**: Skills are installed to `.cursor/skills/`
- **Claude**: Skills are installed to `.claude/`

## Creating Custom Skills

See the [skills repository](https://github.com/bamlab/helpmeai/tree/main/skills-repo) for documentation on creating and contributing skills.

### Skills Registry Format

The registry uses an `index.json` file with semver ranges for version matching:

```json
{
  "version": "1.0.0",
  "skills": [
    {
      "id": "react-query-v5",
      "name": "React Query Best Practices",
      "description": "TanStack Query v5 patterns and best practices",
      "library": "@tanstack/react-query",
      "versionRange": ">=5.0.0",
      "path": "skills/react-query-v5"
    }
  ]
}
```

## Development

```bash
# Install dependencies
bun install

# Build
bun run build

# Run locally
node dist/index.js
```

## License

MIT
