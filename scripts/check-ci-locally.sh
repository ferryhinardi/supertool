#!/bin/bash
# Local CI/CD Check Script
# This script simulates what GitHub Actions will run

set -e  # Exit on error

echo "🔍 Starting Local CI/CD Checks..."
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0

# Function to run a check
run_check() {
    local name=$1
    local command=$2
    
    echo "▶️  Running: $name"
    if eval "$command"; then
        echo -e "${GREEN}✅ PASSED:${NC} $name"
        echo ""
        return 0
    else
        echo -e "${RED}❌ FAILED:${NC} $name"
        echo ""
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# 1. TypeScript Check
echo "📝 Step 1: TypeScript Check"
echo "----------------------------"
run_check "TypeScript Check" "pnpm exec tsc --noEmit"

# 2. Lint Check
echo "🔍 Step 2: Lint Check"
echo "----------------------------"
run_check "ESLint" "pnpm lint" || echo -e "${YELLOW}⚠️  Lint has warnings (continue-on-error in CI)${NC}"
echo ""

# 3. Core Tests
echo "🧪 Step 3: Core Tests"
echo "----------------------------"
run_check "Components Tests" "CI=true pnpm test run components/" || true
run_check "Hooks Tests" "CI=true pnpm test run hooks/" || true
run_check "Lib Tests" "CI=true pnpm test run lib/" || true

# 4. Test Sharding Simulation
echo "🔀 Step 4: Test Sharding (Sample)"
echo "----------------------------"
run_check "Shard 1 of 4" "CI=true pnpm test run --shard=1/4 components/ hooks/ lib/" || true

# 5. Build Check
echo "🏗️  Step 5: Build Check"
echo "----------------------------"
run_check "Next.js Build" "pnpm build"

# Summary
echo ""
echo "=================================="
echo "📊 CI/CD Check Summary"
echo "=================================="
if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your code is ready for CI/CD pipeline ✨"
    exit 0
else
    echo -e "${RED}❌ $FAILURES check(s) failed${NC}"
    echo ""
    echo "Please fix the issues before pushing to main branch"
    exit 1
fi
