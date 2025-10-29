#!/bin/bash

# Ensure we're using the correct Node.js version
export NVM_DIR="/home/stanislavtoman/.config/nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the latest Node.js version
nvm use 24.11.0

# Set memory limit for Node.js to prevent out-of-memory issues
export NODE_OPTIONS="--max-old-space-size=8192"

# Navigate to the web app directory
cd /home/stanislavtoman/ens-ch/pancake-frontend-candidate-004/apps/web

# Show current Node.js version for verification
echo "Using Node.js version: $(node --version)"
echo "Using pnpm version: $(pnpm --version)"
echo "Node.js memory limit: $NODE_OPTIONS"

# Start the development server without TypeScript checking first
echo "Starting PancakeSwap development server (skipping build check)..."
npx next dev
