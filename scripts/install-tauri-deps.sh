#!/bin/bash
# Install Tauri dependencies for Pop!_OS 22.04

echo "Installing Tauri system dependencies..."

sudo apt update

# Install webkit2gtk-4.1 and related packages
sudo apt install -y \
  libwebkit2gtk-4.1-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev

echo "✅ Dependencies installed successfully!"
echo ""
echo "Now you can build the Tauri app with:"
echo "  cd /home/jon/code/glyph-nova"
echo "  yarn tauri build"

