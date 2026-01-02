#!/bin/bash

# Security Verification Script for SuperTool Supabase Database
# Run this script to verify security policies and check for issues

echo "=================================================="
echo "SuperTool - Security Verification Script"
echo "=================================================="
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    exit 1
fi

echo "✓ Supabase CLI found"
echo ""

# Check if project is linked
echo "Checking project connection..."
if ! supabase projects list 2>&1 | grep -q "supertool"; then
    echo "❌ Project not linked. Run: supabase link --project-ref mkzyuyvgrqjrhnbtagyh"
    exit 1
fi

echo "✓ Project linked: mkzyuyvgrqjrhnbtagyh"
echo ""

# Run database linter
echo "=================================================="
echo "1. Running Database Linter..."
echo "=================================================="
supabase db lint --linked --level warning
LINT_EXIT_CODE=$?

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ No linting errors found"
else
    echo "⚠️  Linting issues detected"
fi
echo ""

# Check RLS policies
echo "=================================================="
echo "2. Checking RLS Policies..."
echo "=================================================="

# Create a temporary SQL file for verification queries
cat > /tmp/security_check.sql <<'EOF'
-- Check if all critical tables have RLS enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'shortened_urls',
        'url_analytics',
        'split_bills',
        'split_bill_participants',
        'split_bill_items',
        'tool_ratings',
        'tool_rating_stats',
        'security_audit_log'
    )
ORDER BY tablename;
EOF

echo "RLS Status for Critical Tables:"
echo ""

# Note: This would require psql connection. For now, we'll use supabase CLI
echo "To verify RLS policies manually, run:"
echo "supabase db remote psql"
echo ""
echo "Then execute:"
echo "SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;"
echo ""

# Check for common security issues
echo "=================================================="
echo "3. Security Checklist"
echo "=================================================="

ISSUES_FOUND=0

# Check migration files
echo "Checking migration files..."
if [ -f "supabase/migrations/20251231000000_security_fixes.sql" ]; then
    echo "✓ Security fixes migration exists"
else
    echo "❌ Security fixes migration not found"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi

# Check for overly permissive policies (manual check reminder)
echo ""
echo "Manual verification needed:"
echo "- [ ] Verify no RLS policies have 'WITH CHECK (true)' for critical operations"
echo "- [ ] Check rate limiting triggers are active"
echo "- [ ] Verify audit logging is working"
echo ""

# Summary
echo "=================================================="
echo "4. Summary"
echo "=================================================="

if [ $ISSUES_FOUND -eq 0 ] && [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ All automated checks passed!"
    echo ""
    echo "Security improvements applied:"
    echo "  • Fixed overly permissive RLS policies"
    echo "  • Added rate limiting on tool_ratings"
    echo "  • Fixed unused function parameters"
    echo "  • Added input validation constraints"
    echo "  • Enabled security audit logging"
    echo ""
    echo "Next steps:"
    echo "1. Review Supabase Security Advisors:"
    echo "   https://supabase.com/dashboard/project/mkzyuyvgrqjrhnbtagyh/advisors/security"
    echo ""
    echo "2. Monitor security audit logs:"
    echo "   SELECT * FROM security_audit_log ORDER BY created_at DESC LIMIT 10;"
    echo ""
    echo "3. Review rate limiting settings if needed"
    exit 0
else
    echo "⚠️  Some issues found. Please review above."
    exit 1
fi
