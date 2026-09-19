#!/usr/bin/env bash
set -euo pipefail

echo "=== Running Validation Script ==="

# 1. Validate data/fundraisers.json against data/fundraisers.schema.json
echo "1. Validating data/fundraisers.json against data/fundraisers.schema.json..."
npx --package=ajv-cli@5.0.0 --package=ajv-formats@3.0.1 ajv validate \
  --spec=draft2020 \
  -c ajv-formats \
  -s data/fundraisers.schema.json \
  -d data/fundraisers.json
echo "   -> fundraisers.json is valid!"

# 2. Check that data/content.json parses as valid JSON
echo "2. Checking that data/content.json parses..."
node -e "JSON.parse(require('fs').readFileSync('data/content.json', 'utf8'))"
echo "   -> content.json parses successfully!"

# 3. Validate index.html markup
echo "3. Validating index.html..."
npx --package=html-validate@11.16.0 html-validate index.html
echo "   -> index.html is valid HTML!"

echo "=== All Validation Checks Passed! ==="
