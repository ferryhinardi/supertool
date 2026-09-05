# Currency Converter

## Overview

The **Currency Converter** is a powerful tool for converting between 150+ world currencies with real-time exchange rates. It supports favorites management, currency swapping, and provides accurate conversions with proper locale-based formatting for each currency.

## Features

### 1. **150+ World Currencies**

Complete coverage of major world currencies organized by region:

- **Americas**: USD, CAD, BRL, MXN, ARS, CLP, COP, PEN, VEF
- **Europe**: EUR, GBP, CHF, SEK, NOK, DKK, PLN, CZK, HUF, RON, BGN, HRK, RSD, TRY, UAH, RUB, ISK
- **Asia**: JPY, CNY, KRW, INR, IDR, THB, MYR, SGD, PHP, VND, HKD, TWD, PKR, BDT, LKR, NPR, MMK, KHR, LAK, BND, MOP
- **Africa**: ZAR, NGN, EGP, KES, GHS, UGX, TZS, MAD, TND, DZD, AOA, XOF, XAF, ETB, MUR, BWP, NAD, ZMW, MWK, RWF
- **Middle East**: AED, SAR, ILS, QAR, KWD, OMR, BHD, JOD, LBP, IQD, SYP, YER
- **Oceania**: AUD, NZD, FJD, PGK, WST, TOP, VUV, SBD
- **Cryptocurrencies**: BTC, ETH

### 2. **Real-time Exchange Rates**

- Primary data source: ExchangeRate-API
- Fallback source: Frankfurter API (free, no API key required)
- 1-hour cache duration for optimal performance
- Manual refresh capability
- Last updated timestamp display

### 3. **Favorites Management**

- Save frequently used currency pairs
- Quick access to favorite conversions
- Persistent storage in browser localStorage
- One-click loading of saved pairs
- Easy deletion of favorites

### 4. **Currency Swapping**

- Instant currency pair swapping
- Preserves converted amount
- Smooth transition animation
- Convenient reverse conversion

### 5. **Accurate Formatting**

Each currency is formatted according to its locale conventions:

- **IDR (Indonesian Rupiah)**: 1.450.000,00 (dot for thousands, comma for decimals)
- **USD (US Dollar)**: 1,450,000.00 (comma for thousands, dot for decimals)
- **EUR (Euro)**: 1.450.000,00 (dot for thousands, comma for decimals)
- **JPY (Japanese Yen)**: 1,450,000 (no decimals)

### 6. **Exchange Rate Display**

- Clear rate visualization (e.g., "1 USD = 14,500.00 IDR")
- Updates automatically when currencies change
- Helps understand conversion calculations

### 7. **Analytics Tracking**

Tracks user interactions for improvement:

- Currency conversions performed
- Currency selection changes
- Swap operations
- Favorite additions/removals
- Rate refreshes

## How to Use

### Step 1: Enter Amount

Type the amount you want to convert in the "From" input field (default: 100).

### Step 2: Select Currencies

- **From**: Choose the source currency (default: USD)
- **To**: Choose the target currency (default: IDR)

### Step 3: View Result

The converted amount appears instantly in the "To" field with proper formatting.

### Step 4: Use Additional Features (Optional)

- **Swap**: Click to reverse the currency pair
- **Favorite**: Save the current pair for quick access
- **Refresh Rates**: Update exchange rates manually

## Understanding Exchange Rates

### How Conversions Work

The tool uses USD as the base currency and performs conversions through a two-step process:

1. Convert source currency to USD (if not USD)
2. Convert USD to target currency (if not USD)

**Example**: Converting EUR to IDR

- EUR to USD: 100 EUR × 1.18 = 118 USD
- USD to IDR: 118 USD × 14,500 = 1,711,000 IDR

### Rate Updates

- Exchange rates are cached for 1 hour
- Click "Refresh Rates" to get the latest rates
- Last updated time is displayed below the converter

### Rate Sources

1. **Primary**: ExchangeRate-API (requires API key)
   - Professional-grade data
   - High accuracy and reliability
   - Requires `EXCHANGE_RATE_API_KEY` environment variable

2. **Fallback**: Frankfurter API
   - Free, no API key required
   - Reliable for major currencies
   - Automatically used if primary fails

## Technical Details

### API Configuration

Add to your `.env.local` file:

```bash
EXCHANGE_RATE_API_KEY=your_api_key_here
```

Get a free API key at [ExchangeRate-API.com](https://www.exchangerate-api.com)

### Currency Data

The tool uses the `lib/currency.ts` library which includes:

- 150+ currency codes and names
- Locale mappings for proper formatting
- Regional organization
- Symbol support

### Data Privacy

- All conversions are performed locally in your browser
- Favorites stored in browser localStorage only
- Exchange rate data fetched from public APIs
- No personal data is collected or stored

### Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design for mobile and desktop
- localStorage support required for favorites

## Examples

### Example 1: USD to IDR

**Input:**

- Amount: 100
- From: USD
- To: IDR

**Output:**

- Result: 1.450.000,00 IDR
- Rate: 1 USD = 14.500,00 IDR

### Example 2: EUR to GBP

**Input:**

- Amount: 50
- From: EUR
- To: GBP

**Output:**

- Result: 43.00 GBP
- Rate: 1 EUR = 0.86 GBP

### Example 3: JPY to USD

**Input:**

- Amount: 10,000
- From: JPY
- To: USD

**Output:**

- Result: 90.50 USD
- Rate: 1 JPY = 0.009 USD

## Testing

The Currency Converter includes comprehensive test coverage with 50+ test cases:

### Test Categories

1. **Initial Render**: Page structure and default values
2. **Exchange Rates Loading**: API fetching and error handling
3. **Currency Conversion**: Calculation accuracy across currencies
4. **Swap Currencies**: Proper currency pair reversal
5. **Refresh Rates**: Rate update functionality
6. **Favorites**: Save, load, and delete operations
7. **Exchange Rate Display**: Rate formula accuracy
8. **Pro Tips**: Information display
9. **Accessibility**: ARIA labels, keyboard navigation
10. **Currency Formatting**: Locale-specific formatting

### Run Tests

```bash
npm test app/tools/currency-converter/__tests__/page.test.tsx
```

## Pro Tips

### Tip 1: Save Favorites

Save frequently used currency pairs as favorites for instant access. Perfect for regular international transactions or travel planning.

### Tip 2: Use Swap Feature

Quickly reverse conversions using the Swap button instead of manually changing both currency selectors.

### Tip 3: Check Last Updated

Always check the "Last updated" timestamp to ensure you're using current rates for important transactions.

### Tip 4: Manual Refresh

Click "Refresh Rates" before critical conversions to get the absolute latest exchange rates.

### Tip 5: Multiple Conversions

Keep the tool open in a tab to quickly convert amounts between your favorite currency pairs throughout the day.

## Limitations

### Exchange Rate Accuracy

- Rates are indicative and may differ from actual bank rates
- Banks and payment processors add their own margins
- Rates update every hour (not real-time)
- For official transactions, consult your bank or payment provider

### Cryptocurrency Rates

- BTC and ETH rates are highly volatile
- Not recommended for time-sensitive transactions
- Use dedicated crypto exchanges for actual trading

### Offline Usage

- Requires internet connection to fetch rates
- Previously fetched rates work offline (until cache expires)
- Favorites work offline once saved

## Accessibility

- Semantic HTML structure
- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast color scheme
- Clear visual hierarchy
- Descriptive button labels

## Related Tools

- **Split Bill**: Calculate shared expenses in multiple currencies
- **Unit Converter**: Convert other units (length, weight, temperature)
- **Daily Task Summary**: Track currency-related financial tasks

## API Integration

### ExchangeRate-API

**Endpoint**: `https://v6.exchangerate-api.com/v6/{API_KEY}/latest/USD`

**Features**:

- Professional-grade data
- 161 currencies supported
- Updates every 24 hours
- 1,500 free requests/month

**Setup**:

1. Sign up at [ExchangeRate-API.com](https://www.exchangerate-api.com)
2. Get your API key
3. Add to `.env.local`: `EXCHANGE_RATE_API_KEY=your_key`

### Frankfurter API

**Endpoint**: `https://api.frankfurter.app/latest?from=USD`

**Features**:

- Free, no API key required
- Covers major currencies
- Updated daily
- No rate limits

**Fallback Logic**:

The tool automatically falls back to Frankfurter if ExchangeRate-API fails or no API key is provided.

## Version History

- **v1.0.0** (2025): Initial release with full currency converter features
  - 150+ world currencies
  - Real-time exchange rates
  - Favorites management
  - Currency swapping
  - Proper locale formatting
  - Comprehensive testing
  - Analytics tracking

## Support

For issues, questions, or feature requests:

- GitHub: [ferryhinardi/supertool](https://github.com/ferryhinardi/supertool)
- Submit an issue on the GitHub repository

---

**Built with ❤️ by Ferry**
