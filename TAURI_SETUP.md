# Tauri Setup Guide for LLM UI

This guide documents the setup process for Tauri desktop framework integration.

## Prerequisites Check

### System Dependencies (Linux/Pop!_OS)

Check installed packages:
```bash
dpkg -l | grep -E "(libwebkit2gtk|build-essential|libssl-dev|libgtk-3-dev)"
```

**Already Installed:**
- ✅ build-essential
- ✅ libwebkit2gtk-4.0-37
- ✅ curl
- ✅ wget

**May Need Installation:**
- ⚠️ libwebkit2gtk-4.0-dev (development headers)
- ⚠️ libssl-dev
- ⚠️ libgtk-3-dev
- ⚠️ libayatana-appindicator3-dev
- ⚠️ librsvg2-dev

**Install Missing Dependencies:**
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

### Rust Toolchain

**Check Installation:**
```bash
which rustc
rustc --version
```

**Install Rust (if not installed):**
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

**Verify Installation:**
```bash
rustc --version
cargo --version
```

### Tauri CLI

**Install via Cargo:**
```bash
cargo install tauri-cli --locked
```

**Or use npm package (alternative):**
```bash
npm install -D @tauri-apps/cli
```

## Next Steps

Once prerequisites are installed:
1. Initialize Tauri in the project
2. Configure for Redwood.js integration
3. Set up file system permissions
4. Implement server lifecycle management

See: `.cursor/docs/plans/02-mvp-implementation-plan.md` - Phase 1.2

