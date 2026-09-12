#!/usr/bin/env bash
# Idempotent repository bootstrap for SuperTool.
# Runs after the repository is checked out. Safe to run repeatedly.
set -euo pipefail

cd "$(dirname "$0")/.."

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# package.json requires Node >=24; the base image defaults to Node 22.
nvm install 24
nvm alias default 24
nvm use 24

# pnpm is pinned via package.json "packageManager"; provide it through corepack.
corepack enable
corepack prepare --activate >/dev/null 2>&1 || true

# Provide working local defaults so the dev server boots without manual setup.
if [ ! -f .env.local ] && [ -f .env.local.example ]; then
  cp .env.local.example .env.local
fi

# Installs dependencies and runs the panda codegen postinstall step.
pnpm install --frozen-lockfile
