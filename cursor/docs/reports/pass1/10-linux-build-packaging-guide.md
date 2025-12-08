# Linux Build & Packaging Guide for Desktop Application

**Purpose**: Complete guide for building and packaging desktop application for Linux (Pop!_OS/Ubuntu), covering Tauri and Electron build processes, .deb package creation, AppImage generation, and distribution strategies.

**Target**: DevOps and build engineers packaging desktop applications  
**Date**: January 2025  
**Status**: Research Phase - Build & Distribution  
**Size**: ~9KB (context window compatible)

---

## Executive Summary

Building and packaging a desktop application for Linux requires understanding the desktop framework's build process, Linux package formats (.deb, AppImage, Snap), and distribution mechanisms. This guide covers building Redwood.js for production, packaging with Tauri or Electron, creating .deb packages for Pop!_OS/Ubuntu, generating AppImage for portability, and setting up automated build processes. Key considerations include bundling Redwood.js server, handling dependencies, code signing, and update mechanisms.

**Key Recommendations**:
- Build Redwood.js for production before packaging
- Use Tauri for smaller bundle sizes (recommended)
- Create .deb packages for native Pop!_OS/Ubuntu installation
- Generate AppImage for portable distribution
- Set up automated build pipeline for releases

---

## Redwood.js Production Build

### Building for Production

```bash
# Build Redwood.js for production
cd /path/to/redwood-app
yarn redwood build

# Output locations:
# - .redwood/build/web/     (frontend static files)
# - .redwood/build/api/     (backend server code)
```

### Production Configuration

**`redwood.toml`**:

```toml
[web]
  port = 8911
  apiUrl = "http://localhost:8911"
  includeEnvironmentVariables = ["OLLAMA_BASE_URL"]

[api]
  port = 8911
```

**Environment Variables**:

```bash
# .env.production
REDWOOD_ENV=production
API_PORT=8911
OLLAMA_BASE_URL=http://localhost:11434
```

---

## Tauri Build & Packaging

### Tauri Configuration

**`src-tauri/tauri.conf.json`**:

```json
{
  "build": {
    "beforeDevCommand": "yarn redwood dev",
    "beforeBuildCommand": "yarn redwood build",
    "devPath": "http://localhost:8910",
    "distDir": "../.redwood/build/web",
    "withGlobalTauri": false
  },
  "package": {
    "productName": "LLM UI",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "fs": {
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "scope": ["$HOME/**"]
      },
      "clipboard": {
        "writeText": true,
        "readText": true
      }
    },
    "bundle": {
      "active": true,
      "targets": ["deb", "appimage"],
      "identifier": "com.example.glyph-nova",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ]
    },
    "security": {
      "csp": null
    }
  }
}
```

### Building Tauri App

```bash
# Install Tauri CLI
cargo install tauri-cli

# Build for Linux
cd src-tauri
cargo tauri build

# Output:
# - src-tauri/target/release/bundle/deb/*.deb
# - src-tauri/target/release/bundle/appimage/*.AppImage
```

### Building .deb Package

**Automatic with Tauri**:

Tauri automatically creates .deb packages when configured. The build process:

1. Bundles Redwood.js web files
2. Includes Tauri binary
3. Creates .deb package structure
4. Generates control files

**Manual .deb Creation** (if needed):

```bash
# Create package structure
mkdir -p glyph-nova_1.0.0_amd64/DEBIAN
mkdir -p glyph-nova_1.0.0_amd64/usr/bin
mkdir -p glyph-nova_1.0.0_amd64/usr/share/applications
mkdir -p glyph-nova_1.0.0_amd64/usr/share/icons/hicolor

# Copy application files
cp target/release/glyph-nova glyph-nova_1.0.0_amd64/usr/bin/
cp -r .redwood/build/web glyph-nova_1.0.0_amd64/usr/share/glyph-nova/

# Create control file
cat > glyph-nova_1.0.0_amd64/DEBIAN/control <<EOF
Package: glyph-nova
Version: 1.0.0
Section: utils
Priority: optional
Architecture: amd64
Depends: libwebkit2gtk-4.0-37, libgtk-3-0
Maintainer: Your Name <your.email@example.com>
Description: Local LLM Desktop Application
 A desktop application for interfacing with local LLMs
 and managing file context.
EOF

# Create .desktop file
cat > glyph-nova_1.0.0_amd64/usr/share/applications/glyph-nova.desktop <<EOF
[Desktop Entry]
Name=LLM UI
Exec=/usr/bin/glyph-nova
Icon=glyph-nova
Type=Application
Categories=Utility;Development;
EOF

# Build package
dpkg-deb --build glyph-nova_1.0.0_amd64
```

---

## Electron Build & Packaging

### Electron Builder Configuration

**`package.json`**:

```json
{
  "build": {
    "appId": "com.example.glyph-nova",
    "productName": "LLM UI",
    "linux": {
      "target": ["deb", "appimage"],
      "category": "Utility",
      "icon": "build/icon.png"
    },
    "files": [
      ".redwood/build/**/*",
      "node_modules/**/*",
      "electron/**/*"
    ],
    "extraResources": [
      {
        "from": ".redwood/build/api",
        "to": "api",
        "filter": ["**/*"]
      }
    ]
  }
}
```

### Building Electron App

```bash
# Install electron-builder
yarn add -D electron-builder

# Build for Linux
yarn electron-builder --linux

# Output:
# - dist/*.deb
# - dist/*.AppImage
```

---

## AppImage Generation

### Creating AppImage with Tauri

Tauri automatically generates AppImage when configured in `tauri.conf.json`:

```json
{
  "tauri": {
    "bundle": {
      "targets": ["appimage"]
    }
  }
}
```

### Manual AppImage Creation

**Using appimagetool**:

```bash
# Download appimagetool
wget https://github.com/AppImage/AppImageKit/releases/download/continuous/appimagetool-x86_64.AppImage
chmod +x appimagetool-x86_64.AppImage

# Create AppDir structure
mkdir -p AppDir/usr/bin
mkdir -p AppDir/usr/share/applications
mkdir -p AppDir/usr/share/icons/hicolor/256x256/apps

# Copy application files
cp target/release/glyph-nova AppDir/usr/bin/
cp -r .redwood/build/web AppDir/usr/share/glyph-nova/
cp icon.png AppDir/usr/share/icons/hicolor/256x256/apps/glyph-nova.png

# Create .desktop file
cat > AppDir/glyph-nova.desktop <<EOF
[Desktop Entry]
Name=LLM UI
Exec=glyph-nova
Icon=glyph-nova
Type=Application
Categories=Utility;
EOF

# Create AppRun
cat > AppDir/AppRun <<EOF
#!/bin/bash
HERE="\$(dirname "\$(readlink -f "\${0}")")"
"\${HERE}/usr/bin/glyph-nova"
EOF
chmod +x AppDir/AppRun

# Generate AppImage
./appimagetool-x86_64.AppImage AppDir LLM-UI-x86_64.AppImage
```

---

## Distribution Strategies

### Direct Distribution

**Download Links**:
- Host .deb and AppImage on GitHub Releases
- Provide download page with instructions
- Include checksums for verification

### Repository Distribution

**PPA (Personal Package Archive)** for Ubuntu/Pop!_OS:

```bash
# Create PPA structure
mkdir -p ppa/dists/focal/main/binary-amd64
cp *.deb ppa/dists/focal/main/binary-amd64/

# Generate Packages.gz
cd ppa
dpkg-scanpackages . /dev/null | gzip -9c > dists/focal/main/binary-amd64/Packages.gz

# Users can add PPA:
# sudo add-apt-repository ppa:yourname/glyph-nova
# sudo apt update
# sudo apt install glyph-nova
```

### Flatpak Distribution

**Create Flatpak Manifest**:

```yaml
# com.example.LLMUI.yml
app-id: com.example.LLMUI
runtime: org.freedesktop.Platform
runtime-version: '22.08'
sdk: org.freedesktop.Sdk
command: glyph-nova
finish-args:
  - --share=ipc
  - --socket=x11
  - --filesystem=home
modules:
  - name: glyph-nova
    buildsystem: simple
    build-commands:
      - install -Dm755 glyph-nova /app/bin/glyph-nova
      - cp -r web /app/share/glyph-nova/
    sources:
      - type: file
        url: https://github.com/yourname/glyph-nova/releases/download/v1.0.0/glyph-nova.tar.gz
        sha256: ...
```

---

## Build Automation

### GitHub Actions Workflow

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-linux:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: yarn install
      
      - name: Build Redwood.js
        run: yarn redwood build
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Build Tauri
        run: |
          cd src-tauri
          cargo tauri build --bundles deb,appimage
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: linux-build
          path: |
            src-tauri/target/release/bundle/deb/*.deb
            src-tauri/target/release/bundle/appimage/*.AppImage
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            src-tauri/target/release/bundle/deb/*.deb
            src-tauri/target/release/bundle/appimage/*.AppImage
```

---

## Code Signing (Optional)

### GPG Signing for .deb

```bash
# Generate GPG key
gpg --full-generate-key

# Sign package
dpkg-sig --sign builder glyph-nova_1.0.0_amd64.deb

# Verify signature
dpkg-sig --verify glyph-nova_1.0.0_amd64.deb
```

---

## Installation Instructions

### .deb Package Installation

```bash
# Download .deb file
wget https://github.com/yourname/glyph-nova/releases/download/v1.0.0/glyph-nova_1.0.0_amd64.deb

# Install
sudo dpkg -i glyph-nova_1.0.0_amd64.deb

# Fix dependencies if needed
sudo apt-get install -f
```

### AppImage Installation

```bash
# Download AppImage
wget https://github.com/yourname/glyph-nova/releases/download/v1.0.0/LLM-UI-x86_64.AppImage

# Make executable
chmod +x LLM-UI-x86_64.AppImage

# Run
./LLM-UI-x86_64.AppImage

# Optional: Install to system
sudo mv LLM-UI-x86_64.AppImage /usr/local/bin/glyph-nova
```

---

## External Documentation Links

### Build Tools
- [Tauri Building](https://tauri.app/v1/guides/building/) - Tauri build process
- [Electron Builder](https://www.electron.build/) - Electron packaging tool
- [AppImage](https://appimage.org/) - AppImage format documentation

### Linux Packaging
- [Debian Packaging](https://www.debian.org/doc/manuals/packaging-tutorial/) - .deb package guide
- [Flatpak](https://flatpak.org/) - Flatpak distribution format

---

## Implementation Checklist

- [ ] Configure Redwood.js production build
- [ ] Set up Tauri/Electron build configuration
- [ ] Create .deb package build process
- [ ] Generate AppImage bundle
- [ ] Set up automated build pipeline
- [ ] Create installation documentation
- [ ] Test installation on Pop!_OS
- [ ] Set up distribution channels
- [ ] Configure code signing (optional)
- [ ] Create release process documentation

---

**Report Status**: Complete  
**Context Window Compatibility**: ~9KB - Can be loaded with 2-3 other reports simultaneously

