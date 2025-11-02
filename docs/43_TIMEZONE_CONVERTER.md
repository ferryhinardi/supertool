# Timezone Converter

## Overview

The **Timezone Converter** is a powerful tool for converting time across multiple timezones with full DST (Daylight Saving Time) awareness. Perfect for scheduling international meetings, coordinating with remote teams, and planning travel across time zones.

## Features

### 1. **DST-Aware Conversions**

Automatic daylight saving time handling:

- Accurate conversions during DST transitions
- Displays correct timezone offsets (e.g., "+09:00")
- Handles summer/winter time changes automatically
- Uses `date-fns-tz` for reliable timezone calculations

### 2. **Multiple Timezone Support**

Add and compare unlimited timezones:

- Default: Local Time + UTC
- 40+ popular timezones available
- Visual day/night indicators (blue for day, purple for night)
- Shows current time and date for each timezone
- Easy add/remove functionality

### 3. **Real-Time Updates**

Stay synchronized with current time:

- Updates every minute automatically
- Shows current time in all timezones
- Reflects DST changes as they occur
- "Now" button to jump to current time

### 4. **Meeting Time Planner**

Plan meetings across timezones:

- Time slider to test different meeting times
- See how your proposed time converts across all timezones
- Visual day/night indicators help avoid awkward hours
- Date display shows if meeting crosses date boundaries

### 5. **Popular Timezones**

Quick access to frequently used timezones:

- **Americas**: New York (EST), Los Angeles (PST), Chicago (CST), Denver (MST), Toronto, Vancouver, Mexico City, São Paulo, Buenos Aires
- **Europe**: London (GMT), Paris (CET), Berlin (CET), Moscow, Istanbul, Amsterdam
- **Asia**: Tokyo (JST), Shanghai (CST), Hong Kong (HKT), Singapore (SGT), Dubai (GST), India (IST), Seoul, Bangkok, Jakarta, Manila
- **Oceania**: Sydney (AEDT), Melbourne, Auckland (NZDT), Fiji, Honolulu
- **Africa**: Cairo, Johannesburg
- **UTC**: Universal Coordinated Time

### 6. **Favorites System**

Save timezone configurations:

- Save your frequently used timezone sets
- Quick load saved configurations
- Persistent storage in browser localStorage
- Multiple favorites support
- Shows timezone count and preview

### 7. **Search & Filter**

Find timezones quickly:

- Search by city name (e.g., "Tokyo")
- Search by timezone code (e.g., "JST", "PST")
- Live filtering as you type
- Auto-clear search after adding

### 8. **Visual Indicators**

Easy-to-read time display:

- **Day (6 AM - 6 PM)**: Blue borders and text
- **Night (6 PM - 6 AM)**: Purple borders and text
- Current date display for each timezone
- Timezone offset badges (e.g., "+09:00", "-05:00")
- Location pin icons for visual clarity

## How to Use

### Step 1: View Default Timezones

The page loads with two default timezones:

- Your **Local Time**
- **UTC** (Universal Coordinated Time)

### Step 2: Add More Timezones

1. Scroll to the "Add Timezone" section
2. Use the search box or browse popular timezones
3. Click on a timezone button to add it
4. The timezone appears in your list above

### Step 3: Plan a Meeting

1. Use the time input in "Meeting Time Planner" section
2. Adjust the time to test different meeting slots
3. Watch all timezones update in real-time
4. Check day/night indicators to avoid inconvenient times

### Step 4: Save Your Configuration (Optional)

1. Click "Save Configuration" button
2. Your current timezone set is saved
3. Load it anytime from "Saved Configurations" section

### Step 5: Remove Timezones

Click the trash icon next to any timezone to remove it from the list.

## Understanding Timezone Conversions

### How DST Works

Daylight Saving Time affects timezone offsets:

**Example: New York**

- **Winter (EST)**: UTC-5 (e.g., "05:00")
- **Summer (EDT)**: UTC-4 (e.g., "04:00")
- Transitions happen automatically in March and November

**Example: London**

- **Winter (GMT)**: UTC+0 (e.g., "+00:00")
- **Summer (BST)**: UTC+1 (e.g., "+01:00")
- Transitions happen automatically in March and October

### Day/Night Indicators

Visual cues help you schedule appropriately:

- **Blue border/text**: Daytime (6 AM - 6 PM)
- **Purple border/text**: Nighttime (6 PM - 6 AM)

This helps avoid scheduling meetings during sleep hours.

### Date Boundaries

The tool shows the full date for each timezone:

**Example**: When it's 11 PM Tuesday in New York:

- **New York**: Tue, Nov 2, 2025 - 23:00
- **Tokyo**: Wed, Nov 3, 2025 - 12:00

Notice Tokyo is already Wednesday!

## Technical Details

### Technologies Used

- **date-fns**: Modern date manipulation
- **date-fns-tz**: Timezone conversion with DST support
- **React**: Component-based UI
- **Panda CSS**: Styling with design tokens
- **Framer Motion**: Smooth animations
- **localStorage**: Favorites persistence

### Timezone Data

Uses IANA timezone database (e.g., "America/New_York", "Asia/Tokyo"):

- Industry-standard timezone identifiers
- Automatic DST handling
- Historical timezone data
- Regular updates via date-fns-tz

### Data Privacy

- All conversions performed locally in your browser
- Favorites stored in browser localStorage only
- No server-side processing or data storage
- No personal data collected

### Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design for mobile and desktop
- localStorage support required for favorites

## Examples

### Example 1: US-Asia Meeting

**Scenario**: Schedule a meeting between New York and Tokyo

**Setup**:

1. Add "New York (EST)"
2. Add "Tokyo (JST)"
3. Adjust time slider

**Good time**: 9 AM New York = 11 PM Tokyo (late but acceptable)
**Bad time**: 3 PM New York = 5 AM Tokyo (too early!)

### Example 2: European Team Call

**Scenario**: Team members in London, Paris, and Moscow

**Setup**:

1. Add "London (GMT)"
2. Add "Paris (CET)"
3. Add "Moscow"

**Observation**:

- London: 10:00 AM
- Paris: 11:00 AM (1 hour ahead)
- Moscow: 1:00 PM (3 hours ahead)

### Example 3: Australia-US Coordination

**Scenario**: Coordinate with Sydney from Los Angeles

**Setup**:

1. Add "Los Angeles (PST)"
2. Add "Sydney (AEDT)"

**Challenge**: 18-hour time difference + date boundary

- LA Monday 8 AM = Sydney Tuesday 2 AM (not ideal)
- LA Monday 5 PM = Sydney Tuesday 11 AM (better!)

### Example 4: Global Team Standup

**Scenario**: Team in 5+ timezones needs a meeting slot

**Setup**:

1. Add all team member timezones
2. Use time slider to find "least bad" time
3. Look for slots where most timezones show blue (daytime)

**Pro Tip**: Rotate meeting times so no single timezone always has inconvenient hours.

## Testing

The Timezone Converter includes comprehensive test coverage with 40+ test cases:

### Test Categories

1. **Initial Render**: Page structure and default timezones
2. **Meeting Time Planner**: Time input and "Now" button
3. **Timezone Cards**: Time display, dates, offsets
4. **Add Timezone**: Search, filter, add functionality
5. **Remove Timezone**: Deletion functionality
6. **Favorites System**: Save, load, delete configurations
7. **Accessibility**: Proper headings, labels, inputs
8. **Time Conversion Accuracy**: Consistent time updates
9. **Logic Tests**: DST transitions, formatting, offset calculation

### Run Tests

```bash
# Component tests
npm test app/tools/timezone-converter/__tests__/page.test.tsx

# Logic tests
npm test app/tools/timezone-converter/__tests__/logic.test.ts
```

## Pro Tips

### Tip 1: Use Favorites for Recurring Meetings

Save timezone sets for different teams or meeting types. Load them instantly when needed.

### Tip 2: Check Day/Night Colors

Before proposing a meeting time, ensure all timezones show reasonable hours (mostly blue, not purple).

### Tip 3: Account for Date Boundaries

Watch the date display when scheduling with Asia-Pacific regions. "End of day" meetings can cross into the next day.

### Tip 4: Plan Around DST Changes

In March and October, be extra careful with scheduling as some regions change DST while others don't.

### Tip 5: Use Local Time as Reference

Keep your local timezone in the list as a reference point when adding other timezones.

### Tip 6: Test Multiple Times

Use the time slider to test several potential meeting times before committing to one.

## Limitations

### Timezone Database

- Relies on browser's IANA timezone database
- Historical timezone data may vary by browser
- Future DST rule changes require library updates

### Time Granularity

- Shows hours and minutes only (no seconds)
- Updates every minute (not real-time seconds)
- Sufficient for meeting planning, not precise time sync

### Display Limits

- Adding too many timezones (20+) may affect performance
- UI may become cluttered with many timezones
- Recommended: Keep to 5-10 timezones for best experience

### Favorites Storage

- Limited by browser localStorage (typically 5-10MB)
- Clearing browser data removes all favorites
- No cloud sync across devices

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (h1, h2, h3)
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast color scheme
- Clear visual indicators
- Descriptive button labels
- Time input with proper type="time"

## Related Tools

- **Daily Note**: Plan your day across timezones
- **Daily Task Summary**: Schedule tasks with timezone awareness
- **Pomodoro**: Time management tool for remote teams
- **Task Timer**: Track work hours across timezones

## Analytics Tracking

The tool tracks the following events to improve user experience:

- `timezone_converter_open`: Page visited
- `timezone_converter_add`: Timezone added
- `timezone_converter_remove`: Timezone removed
- `timezone_converter_time_change`: Time slider adjusted
- `timezone_converter_favorite_add`: Configuration saved
- `timezone_converter_favorite_remove`: Favorite deleted
- `timezone_converter_favorite_load`: Favorite loaded

## Version History

- **v1.0.0** (2025): Initial release with full timezone converter features
  - Multiple timezone support (40+ cities)
  - DST-aware conversions
  - Real-time updates (every minute)
  - Meeting time planner
  - Day/night visual indicators
  - Favorites system
  - Search & filter functionality
  - Comprehensive testing
  - Analytics tracking
  - Responsive design

## Troubleshooting

### Issue: Times Don't Match Expected Values

**Solution**: Check if DST is in effect. Offsets change during DST transitions.

### Issue: Favorite Not Loading

**Solution**: Ensure you clicked "Save Configuration" before trying to load. Check browser's localStorage isn't disabled.

### Issue: Can't Find My Timezone

**Solution**: Use the search box. Type your city name or timezone code (e.g., "IST", "CET").

### Issue: Times Not Updating

**Solution**: The tool updates every minute. Click "Now" button to force an immediate update to current time.

## Support

For issues, questions, or feature requests:

- GitHub: [ferryhinardi/supertool](https://github.com/ferryhinardi/supertool)
- Submit an issue on the GitHub repository

---

**Built with ❤️ by Ferry**
