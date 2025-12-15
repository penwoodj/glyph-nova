#!/bin/bash
# Prepare release context for LLM-based release description generation
# This script fetches previous releases and commit logs to provide context
# Usage: ./scripts/prepare-release-context.sh <version> [output_file]

set -e

VERSION=$1
OUTPUT_FILE=${2:-release-context.md}

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version> [output_file]"
  exit 1
fi

# Extract version number (remove 'v' prefix if present)
VERSION_NUMBER=$(echo "$VERSION" | sed 's/^v//')

# Get the previous tag
PREVIOUS_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")

# Get commits since last tag (or all commits if first release)
if [ -z "$PREVIOUS_TAG" ]; then
  echo "First release - fetching all commits"
  COMMITS=$(git log --pretty=format:"%s|%h|%an|%ad" --date=short --reverse)
else
  echo "Fetching commits since $PREVIOUS_TAG"
  COMMITS=$(git log ${PREVIOUS_TAG}..HEAD --pretty=format:"%s|%h|%an|%ad" --date=short --reverse)
fi

# Fetch previous release notes from GitHub (if available and if we have gh CLI)
PREVIOUS_RELEASES=""
if command -v gh &> /dev/null; then
  echo "Fetching previous release notes from GitHub..."
  PREVIOUS_RELEASES=$(gh release list --limit 10 --json tagName,body --jq '.[] | "### \(.tagName)\n\n\(.body)\n\n---\n\n"')
fi

# Prepare context document
cat > "$OUTPUT_FILE" << EOF
# Release Context for v${VERSION_NUMBER}

## Current Version
${VERSION_NUMBER}

## Previous Release Tag
${PREVIOUS_TAG:-"None (first release)"}

## Commits Since Last Release

EOF

# Add commits in structured format
echo "$COMMITS" | while IFS='|' read -r subject hash author date; do
  echo "- **${subject}** (${hash:0:7}) by ${author} on ${date}" >> "$OUTPUT_FILE"
done

# Add previous releases if available
if [ -n "$PREVIOUS_RELEASES" ]; then
  cat >> "$OUTPUT_FILE" << EOF

## Previous Release Notes (for reference to avoid duplication)

${PREVIOUS_RELEASES}

EOF
else
  cat >> "$OUTPUT_FILE" << EOF

## Previous Release Notes

*Note: GitHub CLI (gh) not available. Install it to fetch previous release notes automatically.*
*Alternatively, manually review previous releases at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/releases*

EOF
fi

# Add current project files that might help with context
cat >> "$OUTPUT_FILE" << EOF

## Project Context Files

For additional context, refer to:
- README.md - Current features and status
- cursor/rules/manual/release-descriptions.mdc - Release description guidelines
- src-tauri/tauri.conf.json - Current version in config

## Instructions for Cursor

Use this context file along with the release-descriptions.mdc rule to generate a professional release description.

The release description should:
1. Reference previous releases to avoid duplicating features/improvements
2. Accurately categorize commits (new features vs improvements vs bug fixes)
3. Use human-readable language, not just commit messages
4. Include proper emojis and formatting
5. Include installation instructions (template provided in rule)

EOF

echo "Release context prepared in: $OUTPUT_FILE"
echo ""
echo "Next steps:"
echo "1. Review the context file: $OUTPUT_FILE"
echo "2. Use Cursor with the release-descriptions.mdc rule to generate the release description"
echo "3. Or use this context when the GitHub Action creates a draft release"

