# helpmeai-skills

Official skills registry for [help-me-ai](https://github.com/bamlab/helpmeai).

## What are Skills?

Skills are AI coding assistant rules and best practices for specific libraries. When you run `help-me-ai` in your project, it matches your dependencies against this registry and offers to install relevant skills.

## Available Skills

| Skill | Library | Version | Description |
|-------|---------|---------|-------------|
| React Query v5 | `@tanstack/react-query` | >=5.0.0 | TanStack Query v5 patterns and best practices |
| React Query v4 | `@tanstack/react-query` | >=4.0.0 <5.0.0 | TanStack Query v4 patterns |
| Zod Validation | `zod` | >=3.0.0 | Schema validation best practices |
| React Hook Form | `react-hook-form` | >=7.0.0 | Form handling patterns |
| Zustand State | `zustand` | >=4.0.0 | State management patterns |
| Tailwind CSS | `tailwindcss` | >=3.0.0 | Utility-first CSS patterns |

## Contributing

We welcome contributions! Here's how to add a new skill:

### 1. Create the Skill Directory

```
skills/
└── your-skill-name/
    └── SKILL.md
```

### 2. Write the SKILL.md

Follow this structure:

```markdown
# Skill Title

Brief description of what this skill covers.

## When to Use

Describe when this skill should be applied.

## Key Concepts

### Concept 1

\`\`\`typescript
// Code examples
\`\`\`

## Common Patterns

### Pattern 1

...

## Things to Avoid

1. Don't do X
2. Don't do Y
```

### 3. Add to index.json

```json
{
  "id": "your-skill-name",
  "name": "Your Skill Name",
  "description": "Brief description",
  "library": "package-name",
  "versionRange": ">=1.0.0",
  "path": "skills/your-skill-name"
}
```

### Version Range Syntax

Use [semver ranges](https://github.com/npm/node-semver#ranges):

- `>=5.0.0` - Version 5 and above
- `>=4.0.0 <5.0.0` - Version 4.x only
- `^3.0.0` - Compatible with 3.x
- `*` - All versions

### 4. Submit a Pull Request

1. Fork this repository
2. Create your skill
3. Test locally with `help-me-ai -r file:///path/to/your/fork`
4. Submit a PR

## Using a Custom Registry

You can host your own skills registry and use it with:

```bash
npx help-me-ai -r https://raw.githubusercontent.com/yourorg/your-skills/main
```

## License

MIT
