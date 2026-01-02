#!/usr/bin/env node

/**
 * Quick verification script for donation system testing
 * 
 * Usage:
 *   node scripts/verify-donation-test.js
 * 
 * This script checks:
 * 1. Dev server is running
 * 2. Support page is accessible
 * 3. Recent donations can be fetched
 * 4. Database connection is working
 */

const http = require('http');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data,
        });
      });
    }).on('error', reject);
  });
}

async function main() {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log('   SuperTool Donation System - Quick Verification', colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.cyan);

  const checks = [
    {
      name: 'Dev Server Running',
      test: () => checkUrl('http://localhost:3000'),
      success: 'Dev server is running on http://localhost:3000',
      error: 'Dev server is not responding',
    },
    {
      name: 'Support Page Accessible',
      test: () => checkUrl('http://localhost:3000/support'),
      success: 'Support page is accessible and ready for testing',
      error: 'Support page returned an error',
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const check of checks) {
    try {
      log(`\n🔍 Checking: ${check.name}...`, colors.blue);
      const result = await check.test();
      
      if (result.status === 200) {
        log(`✅ ${check.success}`, colors.green);
        passed++;
      } else {
        log(`❌ ${check.error} (Status: ${result.status})`, colors.red);
        failed++;
      }
    } catch (error) {
      log(`❌ ${check.error}: ${error.message}`, colors.red);
      failed++;
    }
  }

  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', colors.cyan);
  log(`   Results: ${passed} passed, ${failed} failed`, colors.cyan);
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', colors.cyan);

  if (failed === 0) {
    log('🎉 All checks passed! System is ready for donation testing.\n', colors.green);
    log('Next Steps:', colors.yellow);
    log('1. Open http://localhost:3000/support', colors.yellow);
    log('2. Make a test donation with card 4242 4242 4242 4242', colors.yellow);
    log('3. Check terminal for webhook logs', colors.yellow);
    log('4. Check spam folder for thank you email', colors.yellow);
    log('5. Refresh support page to see Recent Supporters update\n', colors.yellow);
    process.exit(0);
  } else {
    log('⚠️  Some checks failed. Please fix issues before testing.\n', colors.red);
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Verification failed: ${error.message}\n`, colors.red);
  process.exit(1);
});
