# Project Structure

## ✅ Final Implementation

### Skills Repository (Source)

```
skills-repo/
├── index.json                                  # Skills registry
└── skills/
    ├── react-query-v5-best-practices.md       # Flat structure
    ├── react-query-v4-best-practices.md
    ├── zod-validation-best-practices.md
    ├── react-hook-form-best-practices.md
    ├── zustand-state-best-practices.md
    └── tailwindcss-best-practices.md
```

**Key Points:**
- ✅ No nested folders - all skills are flat `.md` files
- ✅ Descriptive names ending in `-best-practices`
- ✅ Easy to browse and contribute

### Installed Skills (Target)

```
.cursor/skills/
├── react-query-v5-best-practices.md
├── zod-validation-best-practices.md
└── react-hook-form-best-practices.md
```

**Key Points:**
- ✅ Skills installed directly as `.md` files
- ✅ No subdirectories
- ✅ File names match skill IDs

### index.json Format

```json
{
  "version": "1.0.0",
  "skills": [
    {
      "id": "react-query-v5-best-practices",           // ← Matches filename
      "name": "React Query Best Practices",
      "description": "TanStack Query v5 patterns, best practices, and common pitfalls",
      "library": "@tanstack/react-query",
      "versionRange": ">=5.0.0",
      "path": "skills/react-query-v5-best-practices.md"  // ← Direct path to file
    }
  ]
}
```

**Key Points:**
- `id` matches the filename (without `.md`)
- `path` points directly to the file (includes `.md`)
- `versionRange` uses semver for flexible matching

## Benefits of Flat Structure

### 1. **Simplicity**
- No nested folders to navigate
- Clear, descriptive filenames
- Easy to see all available skills at a glance

### 2. **Easy Contribution**
- Just add a single `.md` file
- Update `index.json` with one entry
- No directory structure to worry about

### 3. **Better Organization**
- Skills are sorted alphabetically in the directory
- Consistent naming convention (`library-version-best-practices`)
- Easy to find specific skills

### 4. **Clean Installation**
- Users get flat files in `.cursor/skills/`
- No confusing nested directories
- Easy to manage and delete

## Example: Adding a New Skill

1. **Create the file**: `skills/nextjs-app-router-best-practices.md`

2. **Add to index.json**:
```json
{
  "id": "nextjs-app-router-best-practices",
  "name": "Next.js App Router Best Practices",
  "description": "Patterns for Next.js 13+ App Router",
  "library": "next",
  "versionRange": ">=13.0.0",
  "path": "skills/nextjs-app-router-best-practices.md"
}
```

3. **Done!** The skill will be automatically discovered and installable.

## Naming Convention

Follow this pattern for consistency:

```
{library}-{version-or-feature}-best-practices.md
```

Examples:
- `react-query-v5-best-practices.md`
- `zod-validation-best-practices.md`
- `tailwindcss-best-practices.md`
- `nextjs-app-router-best-practices.md`

## Migration Notes

### Old Structure (Removed)
```
skills/
└── react-query-v5/
    └── SKILL.md        ❌ Nested folders
```

### New Structure (Current)
```
skills/
└── react-query-v5-best-practices.md  ✅ Flat file
```

All skills have been migrated to the new flat structure!
