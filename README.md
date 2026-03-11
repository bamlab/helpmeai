# help-me-ai

> AI coding assistant skills exist for every library you use — but who has time to find and install them one by one?

**help-me-ai** scans your `package.json`, matches your dependencies against a curated registry, and installs the right skills in one command.

```bash
bunx @bam.tech/help-me-ai
# or
npx @bam.tech/help-me-ai
```

That's it. Pick the skills you want from the interactive prompt, and they're installed to `.cursor/skills/` or `.claude/skills/` automatically.

---

## Skills registry

The built-in registry lives in [`skills-repo/index.json`](./skills-repo/index.json). Each entry matches one or more npm packages (with optional semver ranges) to a skill file.

Skills can be sourced in two ways:

**Local / hosted markdown** — a raw URL to a `.md` file:
```json
{
  "id": "data-fetching-react-query-v5",
  "matchingLibraries": [{ "name": "@tanstack/react-query", "versionRange": ">=5.0.0" }],
  "path": "https://raw.githubusercontent.com/bamlab/helpmeai/main/skills-repo/skills/data-fetching-react-query@v5.md"
}
```

**[skills.sh](https://skills.sh)** — a community-hosted skill referenced by its slug:
```json
{
  "id": "vercel-react-native-skills",
  "matchingLibraries": [{ "name": "react-native", "versionRange": "*" }],
  "skillsShUrl": "https://skills.sh/vercel-labs/agent-skills/vercel-react-native-skills"
}
```

---

## Contributing a skill

1. Add your skill file to [`skills-repo/skills/`](./skills-repo/skills/)
2. Add an entry to [`skills-repo/index.json`](./skills-repo/index.json)
3. Open a PR

See [`skills-repo/README.md`](./skills-repo/README.md) for the full guide.

---

## License

MIT
