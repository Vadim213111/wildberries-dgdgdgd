#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="${ROOT_DIR}/scripts"
CONFIG_FILE="${ROOT_DIR}/generation.yaml"
SPECS_DIR="${ROOT_DIR}/specs"

if [[ ! -f "${CONFIG_FILE}" ]]; then
  echo "Error: config not found: ${CONFIG_FILE}" >&2
  exit 1
fi

mkdir -p "${SPECS_DIR}"

read_specs() {
  awk '
    $1=="specs:" {inside=1; next}
    inside && $0 ~ /^[^[:space:]]/ {inside=0}
    inside && $1=="-" {print $2}
  ' "${CONFIG_FILE}"
}

specs=()
while IFS= read -r spec; do
  [[ -n "${spec}" ]] && specs+=("${spec}")
done < <(read_specs)

if [[ "${#specs[@]}" -eq 0 ]]; then
  echo "Error: no specs found in ${CONFIG_FILE}" >&2
  exit 1
fi

# Try plain curl first — it's fast and works from hosts that aren't flagged
# by Wildberries' WBAAS anti-bot (e.g. most CI runners).
try_curl() {
  local tmp_dir
  tmp_dir="$(mktemp -d)"
  trap "rm -rf '${tmp_dir}'" RETURN

  local ua="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

  for spec in "${specs[@]}"; do
    if [[ ! "${spec}" =~ ^https?:// ]]; then
      echo "Skipping non-URL spec: ${spec}"
      continue
    fi
    local filename tmp_file
    filename="$(basename "${spec%%\?*}")"
    tmp_file="${tmp_dir}/${filename}"
    if ! curl -fsSL \
        --max-time 60 \
        -A "${ua}" \
        -H 'Accept: text/yaml,application/yaml,application/x-yaml,text/plain,*/*' \
        -H 'Accept-Language: ru-RU,ru;q=0.9,en;q=0.8' \
        -o "${tmp_file}" \
        "${spec}"; then
      return 1
    fi
    # Detect anti-bot HTML response masquerading as 200.
    if ! head -c 16 "${tmp_file}" | grep -q '^openapi:'; then
      return 1
    fi
    mv "${tmp_file}" "${SPECS_DIR}/${filename}"
    echo "curl: ${filename}"
  done
}

# Fallback: drive a headless Chromium via `patchright` (a Playwright fork
# with deeper CDP patches) that can complete the WBAAS JS challenge.
run_patchright() {
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
    echo "Error: node and npm are required for the patchright fallback." >&2
    exit 1
  fi
  (
    cd "${SCRIPT_DIR}"
    if [[ ! -d node_modules/patchright ]]; then
      echo "Installing patchright..."
      npm install --silent --no-audit --no-fund --no-save patchright@^1.59.4
    fi
    export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-${SCRIPT_DIR}/.playwright-browsers}"
    npx --no-install patchright install chromium >/dev/null
  )
  PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-${SCRIPT_DIR}/.playwright-browsers}" \
    node "${SCRIPT_DIR}/download-specs.mjs"
}

if try_curl; then
  echo "All specs downloaded via curl."
  exit 0
fi

echo "curl failed (likely anti-bot challenge); falling back to patchright..."
run_patchright
