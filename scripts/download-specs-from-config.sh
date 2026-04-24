#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="${ROOT_DIR}/scripts"

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is required. The API source is behind an anti-bot challenge that only a real browser can solve, so we use Playwright + Chromium." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is required to install Playwright." >&2
  exit 1
fi

cd "${SCRIPT_DIR}"

if [[ ! -d node_modules/playwright ]]; then
  echo "Installing Playwright..."
  npm install --silent --no-audit --no-fund --no-save \
    playwright@^1.49.0 \
    playwright-extra@^4.3.6 \
    puppeteer-extra-plugin-stealth@^2.11.2
fi

export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-${SCRIPT_DIR}/.playwright-browsers}"

# Idempotent — skips already-installed browsers.
npx --no-install playwright install chromium >/dev/null

cd "${ROOT_DIR}"
node "${SCRIPT_DIR}/download-specs.mjs"
