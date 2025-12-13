#!/bin/bash
# Generate release notes for GitHub releases
# Usage: ./scripts/generate-release-notes.sh <version> [previous_tag]

set -e

VERSION=$1
PREVIOUS_TAG=${2:-$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")}

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version> [previous_tag]"
  exit 1
fi

# Extract version number (remove 'v' prefix if present)
VERSION_NUMBER=$(echo "$VERSION" | sed 's/^v//')

# Get commits since last tag
if [ -z "$PREVIOUS_TAG" ]; then
  # First release - get all commits
  COMMITS=$(git log --pretty=format:"%s|%h|%an" --reverse)
else
  # Get commits since last tag
  COMMITS=$(git log ${PREVIOUS_TAG}..HEAD --pretty=format:"%s|%h|%an" --reverse)
fi

# Categorize commits (simple heuristics)
FEATURES=""
IMPROVEMENTS=""
BUGFIXES=""
OTHER=""

while IFS='|' read -r subject hash author; do
  # Normalize subject
  subject_lower=$(echo "$subject" | tr '[:upper:]' '[:lower:]')

  # Categorize based on common patterns
  if [[ "$subject_lower" =~ ^(feat|add|new|implement).* ]] || [[ "$subject_lower" =~ ✨ ]]; then
    FEATURES="${FEATURES}- ${subject} (${hash:0:7})\n"
  elif [[ "$subject_lower" =~ ^(fix|bug|patch).* ]] || [[ "$subject_lower" =~ 🐛 ]]; then
    BUGFIXES="${BUGFIXES}- ${subject} (${hash:0:7})\n"
  elif [[ "$subject_lower" =~ ^(improve|enhance|refactor|optimize|update|upgrade).* ]] || [[ "$subject_lower" =~ 🔧|⚡ ]]; then
    IMPROVEMENTS="${IMPROVEMENTS}- ${subject} (${hash:0:7})\n"
  else
    OTHER="${OTHER}- ${subject} (${hash:0:7})\n"
  fi
done <<< "$COMMITS"

# Generate release notes following Cursor rule format
cat << EOF
🚀 Release v${VERSION_NUMBER}

This release includes updates and improvements to the Glyph Nova desktop application.

EOF

if [ -n "$FEATURES" ]; then
  echo "✨ **What's New**"
  echo ""
  echo -e "$FEATURES"
  echo ""
fi

if [ -n "$IMPROVEMENTS" ]; then
  echo "🔧 **Improvements**"
  echo ""
  echo -e "$IMPROVEMENTS"
  echo ""
fi

if [ -n "$BUGFIXES" ]; then
  echo "🐛 **Bug Fixes**"
  echo ""
  echo -e "$BUGFIXES"
  echo ""
fi

if [ -n "$OTHER" ]; then
  echo "📝 **Other Changes**"
  echo ""
  echo -e "$OTHER"
  echo ""
fi

cat << EOF
📦 **Installation**

**macOS:**
1. Download the \`.dmg\` file for your architecture (Intel or Apple Silicon)
2. Open the downloaded \`.dmg\` file
3. Drag Glyph Nova to your Applications folder
4. Open Glyph Nova from Applications (you may need to allow it in Security & Privacy settings)

**Windows:**
1. Download the \`.exe\` installer for your architecture (x64 or ARM64)
2. Run the installer and follow the setup wizard
3. Launch Glyph Nova from the Start menu

**Linux:**
- **Debian/Ubuntu**: Download and install the \`.deb\` file
  \`\`\`bash
  sudo dpkg -i glyph-nova_*.deb
  \`\`\`
- **Fedora/RHEL**: Download and install the \`.rpm\` file
  \`\`\`bash
  sudo rpm -i glyph-nova-*.rpm
  \`\`\`
- **AppImage**: Download the \`.AppImage\` file, make it executable, and run:
  \`\`\`bash
  chmod +x glyph-nova_*.AppImage
  ./glyph-nova_*.AppImage
  \`\`\`

**System Requirements:**
- macOS: macOS 10.15 (Catalina) or later
- Windows: Windows 7 or later (Windows 10 20H2+ recommended for WebView2)
- Linux: Modern distributions with WebKitGTK
EOF
