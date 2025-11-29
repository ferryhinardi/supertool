#!/bin/bash
set -e

echo "=========================================="
echo "Running CI/CD Validation Checks"
echo "=========================================="
echo ""

cd /workspaces/supertool

echo "✅ Step 1: Linting (pnpm lint)"
echo "------------------------------------------"
pnpm lint || {
  echo "❌ Linting failed!"
  exit 1
}
echo ""

echo "✅ Step 2: Type Checking (pnpm exec tsc --noEmit)"
echo "------------------------------------------"
pnpm exec tsc --noEmit || {
  echo "❌ Type checking failed!"
  exit 1
}
echo ""

echo "✅ Step 3: Unit Tests (CI=true pnpm test run)"
echo "------------------------------------------"
CI=true pnpm test run || {
  echo "❌ Tests failed!"
  exit 1
}
echo ""

echo "✅ Step 4: Production Build (pnpm build)"
echo "------------------------------------------"
pnpm build || {
  echo "❌ Build failed!"
  exit 1
}
echo ""

echo "=========================================="
echo "🎉 All CI/CD checks passed!"
echo "=========================================="
echo ""
echo "Ready to push to main branch."
