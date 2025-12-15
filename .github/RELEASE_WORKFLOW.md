# Release Workflow Documentation

This document explains how the automated release workflow works and how to use it with Cursor for generating professional release descriptions.

## Overview

The release workflow automatically:
1. Builds the Tauri desktop app for all platforms (macOS Intel/ARM, Linux, Windows)
2. Generates release notes from git commits with context from previous releases
3. Creates a **draft** GitHub release with all build artifacts
4. Includes installation instructions for all platforms

You can then use Cursor with the `release-descriptions.mdc` rule to refine the release description before publishing.

## Workflow Triggers

The release workflow (`release.yml`) triggers on:
- **Tag push**: When you push a version tag (e.g., `v0.1.0`)
- **Manual dispatch**: Via GitHub Actions UI with a version input

## How to Create a Release

### Standard Workflow (Recommended)

1. **Update version numbers** in your code:
   - `src-tauri/tauri.conf.json` → `version` field
   - `src-tauri/Cargo.toml` → `version` field in `[package]` section

2. **Commit and merge to main**:
   ```bash
   git add src-tauri/tauri.conf.json src-tauri/Cargo.toml
   git commit -m "chore: bump version to 0.1.0"
   git push origin main
   ```

3. **Create and push a version tag**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

4. **Wait for the workflow** to build and create a draft release

5. **Review and improve the release description**:
   - Go to GitHub Releases
   - Open the draft release
   - Use Cursor with the `release-descriptions.mdc` rule to improve the description
   - The draft includes previous release notes for reference

6. **Publish the release** when ready

### Using Cursor to Generate Release Description

When you want to create a release description:

1. **Prepare release context** (optional but recommended):
   ```bash
   ./scripts/prepare-release-context.sh v0.1.0
   ```
   This generates `release-context.md` with:
   - Commits since last release
   - Previous release notes (if GitHub CLI is installed)
   - Project context

2. **Use Cursor** with the release-descriptions rule:
   - Open `cursor/rules/manual/release-descriptions.mdc`
   - Provide the context file and ask: "Generate a release description for v0.1.0"
   - Cursor will follow the rule to create a professional description

3. **Copy the description** to the draft GitHub release

## PR Workflow

The PR workflow (`pr-checks.yml`) automatically runs on pull requests to `main` or `master`:

- **Tests**: Runs `yarn rw test --no-watch`
- **Build**: Builds the Redwood app and Tauri app (no bundle)
- **Status**: Shows ✅ or ❌ on the PR commit

This ensures code quality before merging.

## Release Notes Generation

The workflow generates release notes by:
1. Fetching commits since the last release tag
2. Categorizing commits into Features, Improvements, and Bug Fixes
3. Including previous release notes for reference (to avoid duplication)
4. Adding installation instructions for all platforms

**Important**: The initial release notes are basic. Use Cursor with the `release-descriptions.mdc` rule to:
- Verify features aren't duplicates of previous releases
- Make descriptions human-readable (not just commit messages)
- Ensure accurate categorization
- Add context and clarity

## Version Number Management

Version numbers are managed in:
- `src-tauri/tauri.conf.json` (source of truth)
- `src-tauri/Cargo.toml` (should match)

After a release is published, the workflow automatically bumps the patch version for the next development cycle.

## Build Artifacts

The workflow builds and packages for:
- **macOS**: `.dmg` files (Intel and Apple Silicon)
- **Linux**: `.deb`, `.rpm`, and `.AppImage`
- **Windows**: `.exe` installer and `.msi`

All artifacts are attached to the GitHub release.

## Troubleshooting

### Workflow doesn't trigger
- Ensure the tag format is `v*.*.*` (e.g., `v0.1.0`, not `0.1.0`)
- Check that the version in `tauri.conf.json` matches the tag

### Release notes are incomplete
- Use Cursor with the release-descriptions rule to improve them
- Check previous releases to avoid duplication
- Review the commit log to ensure all changes are captured

### Build fails
- Check that all dependencies are properly configured
- Verify the Redwood build succeeds locally first
- Check workflow logs for specific errors
