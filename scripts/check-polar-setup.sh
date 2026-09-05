#!/bin/bash

###############################################################################
# Polar Payment Setup Verification Script
# Checks if all requirements are met for accepting live payments
###############################################################################

set -e

echo "🔍 Polar Payment Setup Verification"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}❌ .env.local file not found${NC}"
  echo "   Please create .env.local with Polar credentials"
  exit 1
fi

# Load environment variables
source .env.local

echo "📋 Environment Variables Check"
echo "==============================="
echo ""

# Function to check env var
check_env() {
  local var_name=$1
  local var_value=${!var_name}
  
  if [ -z "$var_value" ]; then
    echo -e "${RED}❌ $var_name${NC} - NOT SET"
    return 1
  else
    # Show first 10 chars
    local preview="${var_value:0:10}..."
    echo -e "${GREEN}✅ $var_name${NC} - $preview"
    return 0
  fi
}

# Check required variables
all_set=true

check_env "POLAR_ACCESS_TOKEN" || all_set=false
check_env "POLAR_WEBHOOK_SECRET" || all_set=false
check_env "POLAR_ORGANIZATION_ID" || all_set=false
check_env "NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID" || all_set=false

echo ""

if [ "$all_set" = false ]; then
  echo -e "${RED}❌ Missing required environment variables${NC}"
  echo ""
  echo "Please add missing variables to .env.local"
  echo "See: docs/setup/POLAR_PAYMENT_SETUP_FIX.md"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 API Connectivity Check"
echo "=========================="
echo ""

# Check if we can reach Polar API
echo "Testing Polar API connection..."

response=$(curl -s -w "\n%{http_code}" -X GET \
  "https://api.polar.sh/v1/organizations/$POLAR_ORGANIZATION_ID" \
  -H "Authorization: Bearer $POLAR_ACCESS_TOKEN")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Connected to Polar API${NC}"
  
  # Parse JSON response (requires jq)
  if command -v jq &> /dev/null; then
    org_name=$(echo "$body" | jq -r '.name // "N/A"')
    echo "   Organization: $org_name"
    echo ""
    
    # Check onboarding status (if available in response)
    onboarding=$(echo "$body" | jq -r '.onboarding_completed // "unknown"')
    payment_status=$(echo "$body" | jq -r '.payment_processor_status // "unknown"')
    
    if [ "$onboarding" = "true" ]; then
      echo -e "${GREEN}✅ Onboarding completed${NC}"
    elif [ "$onboarding" = "false" ]; then
      echo -e "${RED}❌ Onboarding NOT completed${NC}"
      echo ""
      echo "   ${YELLOW}⚠️  You need to complete merchant onboarding${NC}"
      echo "   Go to: https://polar.sh/dashboard/settings/organization"
    else
      echo -e "${YELLOW}⚠️  Onboarding status: $onboarding${NC}"
    fi
    
    if [ "$payment_status" = "active" ]; then
      echo -e "${GREEN}✅ Payment processor active${NC}"
    else
      echo -e "${YELLOW}⚠️  Payment processor: $payment_status${NC}"
      echo "   Connect Stripe at: https://polar.sh/dashboard/settings/payments"
    fi
  fi
else
  echo -e "${RED}❌ Failed to connect to Polar API (HTTP $http_code)${NC}"
  echo ""
  echo "Response:"
  echo "$body" | head -n 5
  echo ""
  echo "Possible issues:"
  echo "  - Invalid POLAR_ACCESS_TOKEN"
  echo "  - Invalid POLAR_ORGANIZATION_ID"
  echo "  - Network connectivity issue"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📦 Product Configuration Check"
echo "==============================="
echo ""

# Check if product exists
echo "Checking donation product..."

product_response=$(curl -s -w "\n%{http_code}" -X GET \
  "https://api.polar.sh/v1/products/$NEXT_PUBLIC_POLAR_DONATION_PRODUCT_ID" \
  -H "Authorization: Bearer $POLAR_ACCESS_TOKEN")

product_http_code=$(echo "$product_response" | tail -n1)
product_body=$(echo "$product_response" | sed '$d')

if [ "$product_http_code" = "200" ]; then
  echo -e "${GREEN}✅ Donation product exists${NC}"
  
  if command -v jq &> /dev/null; then
    product_name=$(echo "$product_body" | jq -r '.name // "N/A"')
    product_status=$(echo "$product_body" | jq -r '.status // "N/A"')
    
    echo "   Product: $product_name"
    echo "   Status: $product_status"
    
    if [ "$product_status" != "published" ] && [ "$product_status" != "active" ]; then
      echo -e "${YELLOW}   ⚠️  Product status should be 'published'${NC}"
    fi
  fi
else
  echo -e "${RED}❌ Product not found (HTTP $product_http_code)${NC}"
  echo ""
  echo "Please create a product at: https://polar.sh/dashboard/products"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 Summary & Next Steps"
echo "======================="
echo ""

if [ "$all_set" = true ] && [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Technical setup is correct${NC}"
  echo ""
  echo "If you still see 'Payments unavailable', you need to:"
  echo ""
  echo "1. Complete merchant onboarding"
  echo "   ${BLUE}https://polar.sh/dashboard/settings/organization${NC}"
  echo ""
  echo "2. Connect payment processor (Stripe)"
  echo "   ${BLUE}https://polar.sh/dashboard/settings/payments${NC}"
  echo ""
  echo "3. Publish your product"
  echo "   ${BLUE}https://polar.sh/dashboard/products${NC}"
  echo ""
  echo "4. Enable live mode"
  echo "   ${BLUE}https://polar.sh/dashboard/settings${NC}"
  echo ""
  echo "See detailed guide: ${BLUE}docs/setup/POLAR_PAYMENT_SETUP_FIX.md${NC}"
else
  echo -e "${RED}❌ Setup incomplete${NC}"
  echo ""
  echo "Please fix the issues above and try again."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
