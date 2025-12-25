#!/usr/bin/env node

/**
 * Polar Payment Integration - Environment Variables Checker
 * 
 * This script verifies that all required environment variables
 * for Polar payment integration are properly set.
 */

const required = [
  'POLAR_ACCESS_TOKEN',
  'POLAR_WEBHOOK_SECRET',
  'POLAR_ORGANIZATION_ID',
  'NEXT_PUBLIC_POLAR_ORGANIZATION_ID',
  'NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

console.log('\n🔍 Checking Polar Payment Integration Environment Variables...\n');

let allSet = true;
let missingCount = 0;

required.forEach(key => {
  const value = process.env[key];
  if (value) {
    const preview = value.length > 20 ? `${value.substring(0, 20)}...` : value;
    console.log(`✅ ${key}`);
    console.log(`   ${preview}\n`);
  } else {
    console.log(`❌ ${key} - MISSING\n`);
    allSet = false;
    missingCount++;
  }
});

console.log('─'.repeat(60));

if (allSet) {
  console.log('\n✅ SUCCESS! All environment variables are set!\n');
  console.log('Next steps:');
  console.log('1. Apply database migration: supabase db push');
  console.log('2. Start dev server: pnpm dev');
  console.log('3. Test checkout API (see below)\n');
  console.log('Test command:');
  console.log('curl -X POST http://localhost:3000/api/payment/checkout \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"amount": 500, "currency": "USD"}\'');
  console.log('');
} else {
  console.log(`\n❌ MISSING ${missingCount} variable(s)!\n`);
  console.log('Please add the missing variables to .env.local and try again.\n');
  console.log('See .env.polar.txt for the complete configuration.\n');
  process.exit(1);
}
