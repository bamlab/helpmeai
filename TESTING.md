# Testing and Publishing Guide

## Local Testing

### Step 1: Build the Project

```bash
bun run build
```

### Step 2: Test with Local Skills Repository

Use the `file://` protocol to test with your local skills repository:

```bash
# From the test-project directory
cd test-project
node ../dist/index.js --list -r file:///Users/eliottg/Desktop/RN-Projects/helpmeai/skills-repo

# Or install skills interactively
node ../dist/index.js -r file:///Users/eliottg/Desktop/RN-Projects/helpmeai/skills-repo
```

### Step 3: Test with npm link (Recommended)

This makes the CLI available globally as if installed from npm:

```bash
# In the helpmeai directory
npm link

# Test in any project
cd /path/to/any/project
help-me-ai --list

# Test with local registry
help-me-ai -r file:///Users/eliottg/Desktop/RN-Projects/helpmeai/skills-repo

# When done testing, unlink
npm unlink -g help-me-ai
```

### Step 4: Test Installation

Run without `--list` to test the full interactive installation:

```bash
cd test-project
help-me-ai -r file:///Users/eliottg/Desktop/RN-Projects/helpmeai/skills-repo
```

This will:
1. Show matching skills with checkboxes
2. Let you select which to install
3. Create `.cursor/skills/` directory
4. Download and install selected skills

Verify the files were created:

```bash
ls -la test-project/.cursor/skills/
```

## Publishing to npm

### Prerequisites

1. **npm account**: Create one at [npmjs.com](https://npmjs.com)
2. **Login**: `npm login`
3. **Skills repo on GitHub**: Push `skills-repo/` to `github.com/bamlab/helpmeai-skills`

### Step 1: Prepare for Publishing

```bash
# Update version if needed
npm version patch  # or minor, or major

# Verify package.json
cat package.json
```

Make sure:
- ✅ `name` is available on npm (search at npmjs.com)
- ✅ `version` is correct
- ✅ `repository` field is set (optional but recommended)
- ✅ `license` is set (currently MIT)

### Step 2: Test Package Before Publishing

```bash
# Create a tarball to see what will be published
npm pack

# This creates help-me-ai-1.0.0.tgz
# Inspect contents:
tar -tzf help-me-ai-1.0.0.tgz

# Test installing from the tarball
cd /tmp/test-install
npm install /Users/eliottg/Desktop/RN-Projects/helpmeai/help-me-ai-1.0.0.tgz
npx help-me-ai --help
```

### Step 3: Publish to npm

```bash
# Publish to npm (public)
npm publish --access public

# Or publish as scoped package (if name is @bamlab/help-me-ai)
npm publish --access public
```

### Step 4: Test Published Package

```bash
# Test installation from npm
cd /tmp/test-npm-install
npx help-me-ai@latest --version
npx help-me-ai@latest --help
```

## Publishing Updates

When you make changes:

```bash
# Make your changes
# ...

# Rebuild
bun run build

# Update version
npm version patch  # or minor/major

# Publish
npm publish
```

## Using Scoped Packages

If you want to publish as `@bamlab/help-me-ai`:

1. Update `package.json`:
   ```json
   {
     "name": "@bamlab/help-me-ai",
     "bin": {
       "help-me-ai": "./bin/help-me-ai.js"
     }
   }
   ```

2. Publish:
   ```bash
   npm publish --access public
   ```

3. Users install with:
   ```bash
   npx @bamlab/help-me-ai
   ```

## GitHub Releases

After publishing to npm, create a GitHub release:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Then create a release on GitHub with the changelog.

## Checklist Before First Publish

- [ ] Skills repository pushed to `github.com/bamlab/helpmeai-skills`
- [ ] README.md is complete and helpful
- [ ] LICENSE file exists (MIT)
- [ ] package.json has correct metadata
- [ ] CLI tested locally with `npm link`
- [ ] CLI tested with real GitHub registry URL
- [ ] Version number is correct (start with 1.0.0)
- [ ] Logged into npm (`npm whoami`)
- [ ] Package name is available on npm

## Troubleshooting

### "Package name already exists"

Choose a different name or use a scoped package: `@bamlab/help-me-ai`

### "403 Forbidden"

You need to be logged in: `npm login`

For scoped packages, you may need organization access.

### "Skills registry not found" 

The GitHub repository must be public and the files accessible via raw.githubusercontent.com.

Test the URL manually:
```bash
curl https://raw.githubusercontent.com/bamlab/helpmeai-skills/main/index.json
```
