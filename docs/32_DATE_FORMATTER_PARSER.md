# Date Formatter & Parser

## Overview

The **Date Formatter & Parser** is a comprehensive tool for working with dates and timestamps. It allows you to parse dates in multiple formats, convert between timezones, format dates in various styles, and calculate time differences between dates.

## Features

### 1. **Universal Date Parsing**

Parse dates from multiple input formats:

- **ISO 8601**: `2024-01-15T12:00:00Z`, `2024-01-15T12:00:00.000Z`
- **Unix Timestamp (seconds)**: `1704067200`
- **Unix Timestamp (milliseconds)**: `1704067200000`
- **US Format**: `01/15/2024`
- **EU Format**: `15/01/2024`
- **Natural Language**: `January 15, 2024`, `Jan 15 2024`
- **RFC 2822**: `Mon, 15 Jan 2024 12:00:00 +0000`
- **Date Objects**: Native JavaScript Date objects

### 2. **Current Date/Time**

- One-click "Now" button to insert current date and time
- Automatically formatted in ISO 8601 format
- Respects selected timezone settings

### 3. **Multiple Format Outputs**

Convert parsed dates to 15+ format presets:

- **ISO 8601**: `2024-01-15T12:30:45.000Z`
- **Unix Timestamp (seconds)**: `1704067200`
- **Unix Timestamp (milliseconds)**: `1704067200000`
- **RFC 2822**: `Mon, 15 Jan 2024 12:30:45 +0000`
- **HTTP Header**: `Mon, 15 Jan 2024 12:30:45 GMT`
- **SQL Datetime**: `2024-01-15 12:30:45`
- **US Format**: `01/15/2024`
- **EU Format**: `15/01/2024`
- **Long Date**: `January 15, 2024`
- **Short Date**: `Jan 15, 2024`
- **Full DateTime**: `Monday, January 15, 2024 12:30:45 PM`
- **12-Hour Time**: `12:30:45 PM`
- **24-Hour Time**: `12:30:45`
- **Month/Year**: `January 2024`
- **Year**: `2024`

### 4. **Timezone Conversion**

Convert dates between 15 major timezones:

- **UTC** - Coordinated Universal Time
- **EST** - America/New_York (Eastern)
- **PST** - America/Los_Angeles (Pacific)
- **CST** - America/Chicago (Central)
- **MST** - America/Denver (Mountain)
- **GMT** - Europe/London (Greenwich)
- **CET** - Europe/Paris (Central European)
- **JST** - Asia/Tokyo (Japan)
- **IST** - Asia/Kolkata (India)
- **CST** - Asia/Shanghai (China)
- **AEST** - Australia/Sydney (Australian Eastern)
- **NZST** - Pacific/Auckland (New Zealand)
- **BRT** - America/Sao_Paulo (Brazil)
- **WIB** - Asia/Jakarta (Western Indonesia)
- **SGT** - Asia/Singapore (Singapore)

### 5. **Date Difference Calculator**

Calculate time differences between two dates with:

- **Human Readable Format**: "14 days, 12 hours, 30 minutes, 45 seconds"
- **Years**: Total years between dates
- **Months**: Total months between dates
- **Days**: Total days between dates
- **Total Days**: Absolute day count
- **Total Hours**: Total hours between dates
- **Total Minutes**: Total minutes between dates
- **Total Seconds**: Total seconds between dates

### 6. **Relative Time Display**

Shows human-friendly relative time:

- "2 hours ago"
- "in 3 days"
- "a few seconds ago"
- "in a month"

### 7. **Copy to Clipboard**

- One-click copy for any format output
- Copy converted timezone dates
- Toast notifications for user feedback

## How to Use

### Step 1: Parse a Date

Enter any date or timestamp in the main input field:

```
2024-01-15T12:00:00Z
1704067200
January 15, 2024
01/15/2024
```

Or click the **"Now"** button to use the current date/time.

### Step 2: View Formats

Once a valid date is parsed, the **Format Converter** section displays the date in 15+ different formats. Click the **Copy** button next to any format to copy it to your clipboard.

### Step 3: Convert Timezones

In the **Timezone Converter** section:

1. Select a target timezone from the dropdown
2. View the converted date and time
3. Click **Copy** to copy the converted date

### Step 4: Calculate Date Differences

In the **Date Difference Calculator**:

1. Enter a start date
2. Enter an end date
3. View the time difference in multiple formats:
   - Human readable format
   - Total days, hours, minutes, seconds

## Technical Details

### Library: Day.js

The tool uses **Day.js** (2KB), a lightweight alternative to Moment.js:

- **Size**: Only 2KB (gzipped)
- **Tree-shakeable**: Import only what you need
- **Immutable**: All operations return new instances
- **Chainable API**: Elegant method chaining

#### Plugins Used:
- `timezone` - Timezone support
- `utc` - UTC mode
- `customParseFormat` - Custom date parsing
- `relativeTime` - Relative time formatting
- `advancedFormat` - Advanced formatting options
- `localizedFormat` - Locale-aware formatting

### Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- No server-side dependencies
- Fully client-side processing

### Privacy

- **All operations performed locally** in your browser
- No data is sent to any server
- No tracking or logging
- No cookies or local storage

## Examples

### Example 1: Parse Unix Timestamp

**Input:**
```
1704067200
```

**Outputs:**
- ISO 8601: `2024-01-01T00:00:00.000Z`
- Long Date: `January 1, 2024`
- SQL Datetime: `2024-01-01 00:00:00`
- Unix Timestamp (ms): `1704067200000`

### Example 2: Convert Timezones

**Input:**
```
Date: 2024-01-15T12:00:00Z
Timezone: America/New_York
```

**Output:**
```
2024-01-15 07:00:00 EST
```

### Example 3: Calculate Date Difference

**Input:**
```
Start: 2024-01-01
End: 2024-01-15
```

**Output:**
```
Human Readable: 14 days
Total Days: 14
Total Hours: 336
Total Minutes: 20,160
Total Seconds: 1,209,600
```

### Example 4: Parse Natural Language

**Input:**
```
January 15, 2024
```

**Outputs:**
- ISO 8601: `2024-01-15T00:00:00.000Z`
- Unix Timestamp: `1705276800`
- US Format: `01/15/2024`
- EU Format: `15/01/2024`

## Testing

The Date Formatter & Parser includes comprehensive test coverage with 90+ test cases:

### Test Categories

1. **Utils Tests (60+ tests)**: 
   - Date parsing (12 tests)
   - Date formatting (9 tests)
   - Timezone conversion (5 tests)
   - Date difference calculation (10 tests)
   - Relative time (4 tests)
   - Helper functions (20 tests)

2. **Component Tests (35+ tests)**:
   - Initial render (8 tests)
   - Date input and parsing (8 tests)
   - Format converter (4 tests)
   - Timezone converter (5 tests)
   - Date difference calculator (10 tests)
   - Accessibility (4 tests)
   - Edge cases (5 tests)

### Run Tests

```bash
# Run all date formatter tests
npm test app/tools/date-formatter

# Run utils tests only
npm test app/tools/date-formatter/__tests__/utils.test.ts

# Run component tests only
npm test app/tools/date-formatter/__tests__/page.test.tsx
```

## Pro Tips

### Tip 1: Unix Timestamp Detection

The tool automatically detects whether a Unix timestamp is in seconds or milliseconds:

- **Seconds**: Numbers < 10,000,000,000 (e.g., `1704067200`)
- **Milliseconds**: Numbers ≥ 10,000,000,000 (e.g., `1704067200000`)

### Tip 2: Ambiguous Date Formats

When entering dates like `01/02/2024`:

- **US Format**: January 2, 2024 (MM/DD/YYYY)
- **EU Format**: February 1, 2024 (DD/MM/YYYY)

The tool attempts US format first. For EU dates, use formats like `2024-02-01` or `February 1, 2024`.

### Tip 3: Copy Frequently Used Formats

Keep the tool open in a browser tab and use it as a quick reference to copy dates in different formats throughout your day.

### Tip 4: Timezone-Aware Timestamps

When working with timestamps, always be aware of timezone implications. Use the Timezone Converter to see how the same moment looks across different timezones.

### Tip 5: Date Difference for Planning

Use the Date Difference Calculator for:
- Project deadline planning
- Event countdown timers
- Age calculations
- Time tracking

## Format Reference

### ISO 8601 Format

International standard for date/time representation:

```
2024-01-15T12:30:45.000Z
│    │  │ │  │  │  │    │
│    │  │ │  │  │  │    └─ Timezone (Z = UTC)
│    │  │ │  │  │  └────── Milliseconds
│    │  │ │  │  └───────── Seconds
│    │  │ │  └──────────── Minutes
│    │  │ └─────────────── Hours (24-hour)
│    │  └───────────────── Day
│    └──────────────────── Month
└───────────────────────── Year
```

### Unix Timestamp

Seconds since January 1, 1970 00:00:00 UTC (Unix Epoch):

```
1704067200 seconds = 2024-01-01 00:00:00 UTC
1704067200000 milliseconds = same moment
```

### RFC 2822 Format

Email header format for dates:

```
Mon, 15 Jan 2024 12:30:45 +0000
│    │  │   │    │        │
│    │  │   │    │        └─ Timezone offset
│    │  │   │    └────────── Time
│    │  │   └─────────────── Year
│    │  └─────────────────── Month (abbreviated)
│    └────────────────────── Day
└─────────────────────────── Weekday (abbreviated)
```

## Common Use Cases

### For Developers

1. **API Timestamp Conversion**: Convert Unix timestamps from APIs to readable formats
2. **Database Date Formatting**: Generate SQL-compatible datetime strings
3. **HTTP Header Dates**: Format dates for HTTP headers (RFC 2822)
4. **Logging**: Convert timestamps in log files to human-readable formats
5. **Testing**: Generate test dates in various formats

### For Designers

1. **Content Scheduling**: Calculate days until content publication
2. **Project Timelines**: Visualize time between milestones
3. **Event Planning**: Format dates for mockups and prototypes

### For Data Analysts

1. **Data Cleaning**: Standardize dates from various sources
2. **Timestamp Analysis**: Convert between Unix timestamps and readable dates
3. **Time Series Data**: Calculate time intervals for analysis

### For Everyone

1. **Travel Planning**: Convert flight times across timezones
2. **Meeting Scheduling**: Compare times across different timezones
3. **Anniversary/Birthday Countdown**: Calculate time until special dates
4. **Historical Research**: Work with dates in various formats

## Limitations

### Timezone Complexity

- Daylight Saving Time (DST) transitions are handled automatically by Day.js
- Historical timezone changes before 1970 may not be accurate
- Some legacy timezones may not be supported

### Date Range

- JavaScript Date supports dates from April 20, 271821 BCE to September 13, 275760 CE
- Unix timestamps are limited to dates after January 1, 1970 (for positive values)
- Very old or future dates may have limited timezone support

### Parsing Ambiguity

- Ambiguous date formats (e.g., `01/02/2024`) default to US format
- Natural language parsing has limitations for complex expressions
- Invalid dates return null rather than throwing errors

### Locale Support

- Currently uses English month/day names
- Date formatting follows en-US conventions by default
- Future versions may add multi-locale support

## Accessibility

The Date Formatter & Parser follows accessibility best practices:

- **Semantic HTML**: Proper heading hierarchy (H1, H2, etc.)
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Screen Reader Support**: Descriptive labels and ARIA attributes
- **Visual Clarity**: High contrast colors and clear typography
- **Focus Indicators**: Visible focus states for keyboard navigation

## Analytics Tracking

The tool tracks anonymous usage data for improvement:

- `date_formatter_open`: Page opened
- `date_parse`: Date successfully parsed
- `date_format`: Date formatted to specific format
- `date_convert`: Timezone conversion performed
- `date_copy`: Format copied to clipboard
- `date_set_current`: "Now" button clicked

**Note**: No personal data or actual date values are collected.

## Related Tools

- **Stopwatch & Timer**: Track time durations in real-time
- **Pomodoro Timer**: Time management with date tracking
- **Daily Task Summary**: Schedule tasks with date tracking
- **Unit Converter**: Convert other units (not dates)

## API Integration (Future)

Potential future integrations:

1. **Holiday APIs**: Detect holidays and special dates
2. **Calendar Integration**: Export to Google Calendar, iCal
3. **World Clock**: Real-time clock display for multiple timezones
4. **Business Days Calculator**: Exclude weekends and holidays

## Version History

- **v1.0.0** (2025): Initial release
  - Universal date parsing (8+ formats)
  - 15+ output format presets
  - Timezone conversion (15 timezones)
  - Date difference calculator
  - Relative time display
  - Copy to clipboard functionality
  - 90+ comprehensive tests
  - Analytics tracking
  - Full accessibility support

## Future Enhancements

Potential improvements for future versions:

1. **Custom Format Builder**: Create custom date format strings
2. **Date Math**: Add/subtract days, months, years from dates
3. **Recurring Dates**: Calculate recurring date patterns
4. **Date Validation**: Validate date ranges and business logic
5. **Multi-Locale Support**: Format dates in different languages
6. **Calendar View**: Visual date picker with calendar
7. **Bulk Conversion**: Convert multiple dates at once
8. **Export**: Download conversions as CSV or JSON
9. **History**: Save recent conversions for quick access
10. **Date Presets**: Quick shortcuts for common dates (yesterday, tomorrow, etc.)

## Troubleshooting

### Date Not Parsing

If your date isn't being recognized:

1. **Check Format**: Ensure it matches one of the supported formats
2. **Remove Extra Spaces**: Leading/trailing spaces can cause issues
3. **Verify Validity**: Ensure the date is logically valid (e.g., not Feb 30)
4. **Try Different Format**: If ambiguous, use ISO 8601 format

### Timezone Issues

If timezone conversion seems wrong:

1. **Check DST**: Daylight Saving Time may affect the conversion
2. **Verify Timezone**: Ensure the timezone identifier is correct
3. **Use UTC**: When in doubt, work in UTC and convert at the end

### Incorrect Date Difference

If the difference calculation seems wrong:

1. **Check Date Order**: The calculator uses absolute difference
2. **Verify Dates**: Ensure both dates are valid and fully parsed
3. **Consider Timezone**: Differences are calculated in UTC

## Support

For issues, questions, or feature requests:

- GitHub: [ferryhinardi/supertool](https://github.com/ferryhinardi/supertool)
- Submit an issue on the GitHub repository
- Check existing documentation in `/docs` folder

---

**Built with ❤️ using Day.js**

**Route**: `/tools/date-formatter`

**Category**: Data Manipulation

**Last Updated**: January 2025
