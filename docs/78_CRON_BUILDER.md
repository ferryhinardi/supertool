Cron Expression Builder
Overview
The Cron Expression Builder is a visual tool for creating, validating, and testing cron expressions across multiple scheduling platforms. It provides an intuitive interface with dropdown selectors for each cron field, 30 pre-configured schedule presets, real-time validation with human-readable translations, and a preview of the next 10 execution times with relative timestamps.
Purpose
The Cron Expression Builder exists to solve several critical challenges in scheduled task configuration:

- **Eliminate Syntax Errors**: Visual dropdowns and presets prevent common cron syntax mistakes that can cause jobs to run at incorrect times or fail silently.
- **Multi-Platform Compatibility**: Supports 5 different cron formats (Unix, Quartz, AWS EventBridge, Spring, Kubernetes) with automatic field count adjustment and platform-specific validation.
- **Reduce Testing Time**: Real-time preview of next 10 execution times allows developers to verify schedules before deployment, catching timezone and timing issues early.
- **Improve Documentation**: Human-readable translations like "Every weekday at 9:00 AM" provide clear descriptions for code comments and team documentation.
- **Accelerate Development**: 30 quick presets covering common schedules (hourly, daily, weekly, monthly) reduce configuration time from minutes to seconds.
- **Prevent Conflicts**: Automatic detection of day-of-month vs day-of-week conflicts helps avoid the common mistake of specifying both fields simultaneously.
  Key Features
  Visual Schedule Builder
  The tool provides five interactive dropdown selectors corresponding to the core cron fields: Minute, Hour, Day of Month, Month, and Day of Week. Each dropdown contains common options like "Every minute", "Every 5 minutes", specific values (0-59 for minutes, 0-23 for hours), and a "Custom..." option for entering complex expressions like ranges (1-5), lists (1,3,5), or step values (_/15). The visual interface eliminates the need to memorize cron syntax, making schedule creation accessible to developers unfamiliar with cron expressions.
  Multi-Platform Support
  Five major cron platforms are supported with automatic format adjustment:
  **Unix/Linux Crontab** (5 fields): The traditional cron format used in Linux/Unix systems via `crontab -e`. Format: `minute hour day month weekday`. Example: `0 2 _ \* _`runs daily at 2:00 AM.
**Quartz Scheduler** (7 fields): Java-based enterprise scheduler with seconds and year fields. Format:`second minute hour day month weekday year`. Example: `0 0 2 _ _ ? _`runs daily at 2:00 AM. Supports special characters like`?`(no specific value),`L`(last day),`W`(weekday), and`#`(nth occurrence).
**AWS EventBridge** (6 fields): Amazon's serverless event scheduler. Format:`minute hour day month weekday year`. Example: `0 2 \* _ ? _`runs daily at 2:00 AM. Does not support seconds field but includes year field for long-term scheduling.
**Spring @Scheduled** (6 fields): Spring Framework's annotation-based scheduler. Format:`second minute hour day month weekday`. Example: `0 0 2 \* \* _`runs daily at 2:00 AM. Supports seconds for sub-minute precision but excludes year field.
**Kubernetes CronJob** (5 fields): Container orchestration scheduling. Format:`minute hour day month weekday`. Example: `0 2 _ \* \*` runs daily at 2:00 AM. Identical to Unix format, used in Kubernetes manifest files.
  The platform selector automatically adjusts the number of input fields and validation rules based on the selected platform, ensuring generated expressions are syntactically correct for the target environment.
  30 Quick Presets
  Pre-configured schedule templates are organized into six categories:
  **Common Schedules** (4 presets):
- Every minute: `* * * * *` - Highest frequency for monitoring and health checks
- Every 5 minutes: `*/5 * * * *` - Log aggregation and cache updates
- Every 15 minutes: `*/15 * * * *` - Data synchronization tasks
- Every 30 minutes: `*/30 * * * *` - Medium-frequency processing jobs
  **Hourly Schedules** (5 presets):
- Every hour: `0 * * * *` - Hourly reports and metrics collection
- Every 2 hours: `0 */2 * * *` - Database maintenance windows
- Every 4 hours: `0 */4 * * *` - Backup verification checks
- Every 6 hours: `0 */6 * * *` - Long-running data pipelines
- Every 12 hours: `0 */12 * * *` - Bi-daily synchronization
  **Daily Schedules** (5 presets):
- Daily at midnight: `0 0 * * *` - Start-of-day batch processing
- Daily at noon: `0 12 * * *` - Mid-day data refreshes
- Daily at 6 AM: `0 6 * * *` - Pre-business-hours preparation
- Daily at 9 PM: `0 21 * * *` - Evening batch jobs
- Twice daily (9 AM and 9 PM): `0 9,21 * * *` - Morning and evening updates
  **Weekly Schedules** (5 presets):
- Every Monday at 9 AM: `0 9 * * 1` - Start-of-week processing
- Every Friday at 5 PM: `0 17 * * 5` - End-of-week reports
- Every Sunday at midnight: `0 0 * * 0` - Weekly cleanup and maintenance
- Every weekday at 9 AM: `0 9 * * 1-5` - Business day automation
- Every weekend at noon: `0 12 * * 0,6` - Weekend batch processing
  **Monthly Schedules** (4 presets):
- First day of month at midnight: `0 0 1 * *` - Monthly billing and invoicing
- Last day of month at midnight: `0 0 L * *` - Month-end closing (Quartz only)
- 15th of every month at midnight: `0 0 15 * *` - Mid-month processing
- First Monday of month at 9 AM: `0 9 * * 1#1` - Monthly meetings and reports (Quartz only)
  **Advanced Schedules** (7 presets):
- Business hours (every hour 9 AM-5 PM weekdays): `0 9-17 * * 1-5` - Daytime-only processing
- Every quarter (Jan 1, Apr 1, Jul 1, Oct 1): `0 0 1 1,4,7,10 *` - Quarterly reports
- Every 10 minutes during work hours: `*/10 8-18 * * 1-5` - High-frequency business day checks
- Every weekday at midnight: `0 0 * * 1-5` - Business day batch jobs
- Every 2 hours on business days: `0 */2 * * 1-5` - Frequent weekday processing
- First and last day of month: `0 0 1,L * *` - Month boundary operations (Quartz only)
- Yearly (January 1st at midnight): `0 0 1 1 *` - Annual maintenance
  Real-Time Validation
  The validation system uses the `cron-parser` library to verify expression syntax and detect conflicts. Validation occurs on every field change with the following checks:
  **Field Count Validation**: Ensures the expression has the correct number of fields for the selected platform (5 for Unix/Kubernetes, 6 for AWS/Spring, 7 for Quartz). Invalid field counts display error messages like "Invalid cron expression for Unix Crontab: expected 5 fields, got 6".
  **Syntax Validation**: Parses each field to verify valid characters and ranges. Catches errors like invalid characters (`@` in minute field), out-of-range values (hour value of 25), or malformed step values (_/0). Error messages include the specific field and issue.
  **Conflict Detection**: Identifies the common mistake of specifying both day-of-month and day-of-week with values other than `_`or`?`. In most cron implementations, these fields use OR logic (job runs when EITHER condition matches), which can cause unexpected behavior. Warning message: "Specifying both day-of-month and day-of-week may cause unexpected behavior. Consider using '?' for one of them."
**Platform-Specific Validation**: Checks for platform-incompatible features like using `L`(last) or`W`(weekday) characters in Unix crontab expressions (only supported in Quartz), or using seconds field in AWS EventBridge (not supported).
Validation results display in real-time below the expression output with color-coded indicators: green checkmark for valid expressions, red error icon with detailed message for syntax errors, and yellow warning icon for potential issues.
 Human-Readable Translation
The`cronstrue` library converts cron expressions into natural language descriptions. This feature helps users verify their expressions match intended behavior and provides clear documentation for code comments. Examples:
- `* * * * *` → "Every minute"
- `0 2 * * *` → "At 02:00 AM"
- `*/15 * * * *` → "Every 15 minutes"
- `0 9 * * 1-5` → "At 09:00 AM, Monday through Friday"
- `0 0 1 * *` → "At 12:00 AM, on day 1 of the month"
- `0 9,21 * * *` → "At 09:00 AM and 09:00 PM"
- `*/10 8-18 * * 1-5` → "Every 10 minutes, between 08:00 AM and 06:59 PM, Monday through Friday"
- `0 0 1 1,4,7,10 *` → "At 12:00 AM, on day 1 of the month, only in January, April, July, and October"
  The translation updates in real-time as fields change, providing immediate feedback on schedule intent. If translation fails due to invalid syntax, an error message displays instead.
  Next Execution Preview
  The tool calculates and displays the next 10 execution times using `cron-parser` for parsing and `luxon` for date formatting. Each execution time shows:
  **Absolute timestamp**: Full date and time in format "DDD, MMM D, YYYY, h:mm A" (e.g., "Mon, Jan 6, 2025, 2:00 AM")
  **Relative time**: Human-friendly description like "in 2 hours", "in 3 days", "in 5 minutes"
  **Visual formatting**: Alternating row backgrounds for readability, monospace font for timestamps
  This preview helps catch timezone issues (all times display in browser's local timezone), verify schedule frequency, and identify potential overlaps with other jobs. For expressions that run infrequently (monthly, quarterly), the preview extends far enough into the future to show the pattern clearly.
  The calculation respects all cron features including step values, ranges, lists, and special characters. Invalid expressions display an error message instead of execution times.
  Custom Expression Input
  Each dropdown field includes a "Custom..." option that opens a text input for advanced cron patterns:
  **Ranges**: Enter `1-5` to run on Monday through Friday, `8-17` for business hours, `1-10` for first 10 days of month
  **Lists**: Enter `1,15` to run on 1st and 15th of month, `0,12` for midnight and noon, `1,3,5` for alternating days
  **Step values**: Enter `*/5` for every 5 units, `10-50/10` for 10,20,30,40,50, `0-59/15` for every 15 minutes
  **Special characters** (Quartz only):
- `?` (no specific value) for day-of-month or day-of-week when the other is specified
- `L` (last) for last day of month or last day of week
- `W` (weekday) for nearest weekday to specified day
- `#` (nth occurrence) for patterns like `1#1` (first Monday), `5#3` (third Friday)
  Custom values combine with dropdown selections to create complex schedules like "Every 10 minutes during business hours on weekdays" (`*/10 8-17 * * 1-5`) or "First and last day of each quarter" (`0 0 1,L 1,4,7,10 *`).
  Expression Export
  Two export methods allow easy transfer of generated expressions to other systems:
  **Copy to Clipboard**: Click the "Copy" button to copy the raw cron expression (`* * * * *`) to the clipboard. A toast notification confirms the copy action. Useful for pasting into configuration files, terminal commands, or CI/CD pipelines.
  **Download as Text File**: Click the "Download" button to save the expression as `cron-expression.txt`. The file contains only the raw expression without additional formatting. Useful for batch configuration or version control systems.
  Both actions trigger analytics events (`cron_builder_copy` and `cron_builder_download`) that track expression usage patterns and platform distribution.
  Category Filtering
  The preset list can be filtered by category using the dropdown selector:
  **All** (default): Shows all 30 presets across all categories
  **Common**: 4 high-frequency presets (every minute to every 30 minutes)
  **Hourly**: 5 hourly interval presets (every hour to every 12 hours)
  **Daily**: 5 daily time presets (midnight, 6 AM, noon, 9 PM, twice daily)
  **Weekly**: 5 weekly day presets (specific weekdays and weekday/weekend patterns)
  **Monthly**: 4 monthly presets (1st day, 15th day, last day, first Monday)
  **Advanced**: 7 complex patterns (business hours, quarterly, ranges)
  Filtering reduces visual clutter and helps users quickly find relevant presets for their use case. The filter persists during the session but resets on page reload.
  Reset Functionality
  The "Reset" button restores all fields to default values:
- Platform: Unix/Linux Crontab
- All five cron fields: "Every minute", "Every hour", "Every day", "Every month", "Every day of week"
- Generated expression: `* * * * *`
- Category filter: All
- Selected preset: None
  Reset is useful when starting a new expression after working on complex schedules, or when switching between projects with different requirements. A confirmation dialog prevents accidental resets that would lose unsaved work. The reset action triggers the `cron_builder_reset` analytics event.
  Responsive UI with Animations
  The interface uses `framer-motion` for smooth transitions:
  **Fade-in animations**: Preset items, validation messages, and execution times fade in when displayed
  **Smooth height transitions**: Category filter expansion, custom input fields, and error messages expand/collapse smoothly
  **Hover effects**: Buttons and preset items show subtle scale and shadow changes on hover
  **Loading states**: Validation and calculation operations show loading spinners during processing
  The layout adapts to different screen sizes:
- **Desktop (1024px+)**: Three-column layout with settings panel, visual builder, and output section
- **Tablet (768-1023px)**: Two-column layout with settings panel stacked above builder and output side-by-side
- **Mobile (<768px)**: Single-column layout with all sections stacked vertically
  Color scheme uses consistent semantic colors: blue for primary actions, red for errors, yellow for warnings, green for success, with proper contrast ratios for accessibility.
  Analytics Integration
  Five analytics events track user behavior:
  **cron_builder_preset** (Line 76 of page.tsx):
- Triggered when user clicks a preset
- Data: `{ preset_id: string, category: string }`
- Purpose: Identify most popular presets, improve preset offerings
  **cron_builder_platform** (Line 82 of page.tsx):
- Triggered when user changes platform
- Data: `{ platform: string }`
- Purpose: Track platform distribution, prioritize platform-specific features
  **cron_builder_copy** (Line 104 of page.tsx):
- Triggered when user copies expression
- Data: `{ platform: string, expression: string }`
- Purpose: Measure tool effectiveness, analyze expression patterns
  **cron_builder_download** (Line 123 of page.tsx):
- Triggered when user downloads expression
- Data: `{ platform: string, expression: string }`
- Purpose: Track export usage, understand distribution methods
  **cron_builder_reset** (Line 144 of page.tsx):
- Triggered when user clicks reset button
- Data: None
- Purpose: Measure feature discoverability, identify user confusion patterns
  How It Works
  The Cron Expression Builder processes user input through several coordinated systems, handling expression generation, validation, translation, and execution preview.
  Expression Generation Logic
  The `generateCronExpression()` function from `utils.ts` (lines 9-28) creates platform-specific cron expressions based on selected field values:
  export function generateCronExpression(
  fields: CronFields,
  platform: CronPlatform
  ): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = fields;
  const platformInfo = PLATFORM_INFO[platform];
  // Build base 5-field expression (minute hour day month weekday)
  let expression = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
  // Add seconds field for platforms that support it (Quartz, Spring)
  if (platformInfo.hasSeconds) {
  expression = `0 ${expression}`; // Default to 0 seconds
  }
  // Add year field for platforms that support it (Quartz, AWS)
  if (platformInfo.hasYear) {
  expression = `${expression} *`; // Default to every year
  }
  return expression;
  }
  Process flow:

1. Extract field values from CronFields object (minute, hour, dayOfMonth, month, dayOfWeek)
2. Look up platform configuration from PLATFORM_INFO to determine field requirements
3. Concatenate five base fields with space separators: minute hour day month weekday
4. Prepend "0" for seconds if platform supports it (Quartz adds "0 " prefix, Spring adds "0 " prefix)
5. Append "\*" for year if platform supports it (Quartz adds " " suffix, AWS adds " " suffix)
6. Return final expression string with correct field count (5, 6, or 7 fields)
   Examples:

- Unix (5 fields): _/5 _ \* \* \* (every 5 minutes)
- Quartz (7 fields): 0 _/5 _ \* _ ? _ (every 5 minutes with seconds and year)
- AWS (6 fields): _/5 _ \* _ ? _ (every 5 minutes with year, no seconds)
- Spring (6 fields): 0 _/5 _ \* \* \* (every 5 minutes with seconds, no year)
- Kubernetes (5 fields): _/5 _ \* \* \* (identical to Unix)
  Validation System
  The validateCronExpression() function from utils.ts (lines 33-112) performs comprehensive validation using the cron-parser library:
  export function validateCronExpression(
  expression: string,
  platform: CronPlatform
  ): ValidationResult {
  const platformInfo = PLATFORM_INFO[platform];
  const fields = expression.split(' ');
  // Step 1: Validate field count matches platform requirements
  const expectedFieldCount =
  (platformInfo.hasSeconds ? 1 : 0) +
  5 + // Base fields: minute hour day month weekday
  (platformInfo.hasYear ? 1 : 0);
  if (fields.length !== expectedFieldCount) {
  return {
  isValid: false,
  error: `Invalid cron expression for ${platformInfo.name}: expected ${expectedFieldCount} fields, got ${fields.length}`,
  };
  }
  // Step 2: Parse expression using cron-parser library
  try {
  const options = {
  currentDate: new Date(),
  iterator: true,
  // Map platform to cron-parser format
  tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
  // Adjust expression format for cron-parser
  let parseExpression = expression;
  if (platformInfo.hasSeconds && !expression.startsWith('0 ')) {
  parseExpression = `0 ${expression}`; // Add default seconds if missing
  }
      // Parse to validate syntax
      parseSync(parseExpression, options);
  } catch (error) {
  return {
  isValid: false,
  error: `Invalid cron syntax: ${error.message}`,
  };
  }
  // Step 3: Check for day-of-month vs day-of-week conflicts
  const dayOfMonthIndex = platformInfo.hasSeconds ? 3 : 2;
  const dayOfWeekIndex = platformInfo.hasSeconds ? 5 : 4;
  const dayOfMonth = fields[dayOfMonthIndex];
  const dayOfWeek = fields[dayOfWeekIndex];
  // Both fields have specific values (not _ or ?)
  if (
  dayOfMonth !== '_' && dayOfMonth !== '?' &&
  dayOfWeek !== '\*' && dayOfWeek !== '?'
  ) {
  return {
  isValid: true,
  warning: "Specifying both day-of-month and day-of-week may cause unexpected behavior. Consider using '?' for one of them.",
  };
  }
  // Step 4: Validation passed
  return { isValid: true };
  }
  Validation stages:

1. Field Count Check: Splits expression by spaces and compares field count to platform requirements. Unix/Kubernetes require 5 fields, AWS/Spring require 6, Quartz requires 7. Returns immediate error if count doesn't match.
2. Syntax Parsing: Uses cron-parser library's parseSync() function to validate field syntax. Checks for:
   - Valid characters (0-9, \*, /, -, ,, ?, L, W, #)
   - Valid ranges (0-59 for minutes, 0-23 for hours, 1-31 for days, 1-12 for months, 0-6 for weekdays)
   - Valid step values (divisor must be positive integer)
   - Valid special characters for platform (L, W, # only in Quartz)
   - Proper list formatting (comma-separated without spaces)
   - Proper range formatting (start-end with start < end)
3. Conflict Detection: Examines day-of-month and day-of-week fields (positions vary by platform based on seconds field). If both fields contain specific values (not wildcards \* or ?), returns a warning about OR logic behavior. Most cron systems execute when EITHER condition matches, not both, which can cause schedules to run more frequently than intended.
4. Result Aggregation: Returns ValidationResult object with:
   - isValid: true if all checks pass
   - isValid: false + error string if syntax invalid
   - isValid: true + warning string if potential conflict detected
     Error message examples:

- "Invalid cron expression for Unix Crontab: expected 5 fields, got 6"
- "Invalid cron syntax: 25 is not a valid hour value"
- "Invalid cron syntax: Unexpected character @ in minute field"
  Human-Readable Translation
  The getHumanReadable() function from utils.ts (lines 117-138) converts cron expressions to natural language using the cronstrue library:
  import cronstrue from 'cronstrue';
  export function getHumanReadable(
  expression: string,
  platform: CronPlatform
  ): string {
  try {
  // cronstrue expects 5 or 6 field format
  // Remove seconds field if present (cronstrue handles it automatically)
  // Remove year field if present (not supported by cronstrue)
      const fields = expression.split(' ');
      const platformInfo = PLATFORM_INFO[platform];

      let cronExpression = expression;

      // Remove year field for AWS/Quartz (last field)
      if (platformInfo.hasYear) {
        const fieldsWithoutYear = fields.slice(0, -1);
        cronExpression = fieldsWithoutYear.join(' ');
      }

      // Call cronstrue with options
      return cronstrue.toString(cronExpression, {
        use24HourTimeFormat: false, // Use 12-hour AM/PM format
        verbose: false, // Concise descriptions
        throwExceptionOnParseError: true,
      });
  } catch (error) {
  return 'Invalid cron expression';
  }
  }
  Translation process:

1. Format Adjustment: cronstrue library supports standard 5-field cron format and can handle 6-field format with seconds. It does NOT support year field, so expressions with year field (Quartz, AWS) need preprocessing.
2. Year Field Removal: For AWS and Quartz expressions, split by spaces and remove the last field (year). Join remaining fields back into string. Example: 0 2 \* _ ? _ (7 fields) becomes 0 2 \* \* ? (6 fields).
3. Library Invocation: Call cronstrue.toString() with options:
   - use24HourTimeFormat: false - Generate 12-hour times with AM/PM (e.g., "2:00 AM" instead of "02:00")
   - verbose: false - Produce concise descriptions (e.g., "At 2:00 AM" instead of "At 02:00 AM every day")
   - throwExceptionOnParseError: true - Throw errors for invalid syntax rather than returning partial descriptions
4. Error Handling: Catch any exceptions from cronstrue (invalid syntax, unsupported features) and return generic "Invalid cron expression" message.
   Translation examples:

- - - - - - → "Every minute"
- 0 \* \* \* \* → "Every hour"
- 0 2 \* \* \* → "At 02:00 AM"
- _/15 _ \* \* \* → "Every 15 minutes"
- 0 9-17 \* \* 1-5 → "Every hour, between 09:00 AM and 05:00 PM, Monday through Friday"
- 0 0 1 \* \* → "At 12:00 AM, on day 1 of the month"
- 0 0 \* \* 0 → "At 12:00 AM, only on Sunday"
- 0 9,21 \* \* \* → "At 09:00 AM and 09:00 PM"
  Next Execution Calculation
  The getNextExecutions() function from utils.ts (lines 143-188) calculates upcoming execution times using cron-parser for parsing and luxon for formatting:
  import { parseExpression } from 'cron-parser';
  import { DateTime } from 'luxon';
  export function getNextExecutions(
  expression: string,
  platform: CronPlatform,
  count: number = 10
  ): string[] {
  try {
  const platformInfo = PLATFORM_INFO[platform];
      // Step 1: Parse cron expression
      const options = {
        currentDate: new Date(),
        iterator: true,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone, // Use browser timezone
      };

      // Step 2: Adjust expression format for cron-parser compatibility
      let parseExpression = expression;

      // cron-parser expects standard format, may need adjustment for some platforms
      if (platformInfo.hasYear) {
        // Remove year field (last field) as cron-parser doesn't support it
        const fields = expression.split(' ');
        parseExpression = fields.slice(0, -1).join(' ');
      }

      const interval = parseExpression(parseExpression, options);

      // Step 3: Generate next N execution times
      const executions: string[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const next = interval.next();
          const date = next.value.toDate();

          // Step 4: Format with luxon
          const dt = DateTime.fromJSDate(date, {
            zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          });

          // Format: "DDD, MMM D, YYYY, h:mm A" (e.g., "Mon, Jan 6, 2025, 2:00 AM")
          const formatted = dt.toFormat('EEE, MMM d, yyyy, h:mm a');

          // Step 5: Calculate relative time
          const now = DateTime.now();
          const diff = dt.diff(now, ['days', 'hours', 'minutes']);

          let relative = '';
          if (diff.days >= 1) {
            relative = `in ${Math.floor(diff.days)} day${Math.floor(diff.days) !== 1 ? 's' : ''}`;
          } else if (diff.hours >= 1) {
            relative = `in ${Math.floor(diff.hours)} hour${Math.floor(diff.hours) !== 1 ? 's' : ''}`;
          } else if (diff.minutes >= 1) {
            relative = `in ${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) !== 1 ? 's' : ''}`;
          } else {
            relative = 'in less than a minute';
          }

          executions.push(`${formatted} (${relative})`);
        } catch (error) {
          break; // Stop if no more executions (for very specific schedules)
        }
      }

      return executions;
  } catch (error) {
  throw new Error(`Failed to calculate executions: ${error.message}`);
  }
  }
  Calculation stages:

1. Parser Configuration: Create options object with current date as starting point, iterator mode for sequential generation, and browser's timezone from Intl.DateTimeFormat().resolvedOptions().timeZone.
2. Expression Preprocessing: Remove year field for AWS/Quartz platforms since cron-parser doesn't support 7-field format. Keep seconds field as cron-parser handles 6-field format with seconds.
3. Interval Creation: Call parseExpression() to create an iterator that generates execution dates. The parser handles all cron features including step values, ranges, lists, and special characters.
4. Execution Generation Loop: Call interval.next() up to count times (default 10). Each call returns the next scheduled execution time as a JavaScript Date object. Break loop if no more executions exist (can happen with very specific schedules like "February 30th").
5. Date Formatting: Convert JavaScript Date to luxon DateTime object in browser's timezone. Format as "EEE, MMM d, yyyy, h:mm a" producing output like "Mon, Jan 6, 2025, 2:00 AM".
6. Relative Time Calculation: Calculate difference between execution time and current time using luxon's diff() method. Convert to days, hours, or minutes based on magnitude:
   - > = 1 day: "in X day(s)"
   - > = 1 hour: "in X hour(s)"
   - > = 1 minute: "in X minute(s)"
   - < 1 minute: "in less than a minute"
7. Result Assembly: Combine formatted timestamp and relative time as "Mon, Jan 6, 2025, 2:00 AM (in 2 hours)". Return array of 10 formatted strings.
   Output examples:
   For expression 0 2 \* \* _ (daily at 2 AM) on January 6, 2025 at 12:00 PM:
   Mon, Jan 6, 2025, 2:00 AM (in 14 hours)
   Tue, Jan 7, 2025, 2:00 AM (in 1 day)
   Wed, Jan 8, 2025, 2:00 AM (in 2 days)
   Thu, Jan 9, 2025, 2:00 AM (in 3 days)
   Fri, Jan 10, 2025, 2:00 AM (in 4 days)
   Sat, Jan 11, 2025, 2:00 AM (in 5 days)
   Sun, Jan 12, 2025, 2:00 AM (in 6 days)
   Mon, Jan 13, 2025, 2:00 AM (in 7 days)
   Tue, Jan 14, 2025, 2:00 AM (in 8 days)
   Wed, Jan 15, 2025, 2:00 AM (in 9 days)
   For expression _/5 \* \* \* _ (every 5 minutes):
   Mon, Jan 6, 2025, 12:05 PM (in 5 minutes)
   Mon, Jan 6, 2025, 12:10 PM (in 10 minutes)
   Mon, Jan 6, 2025, 12:15 PM (in 15 minutes)
   Mon, Jan 6, 2025, 12:20 PM (in 20 minutes)
   Mon, Jan 6, 2025, 12:25 PM (in 25 minutes)
   Mon, Jan 6, 2025, 12:30 PM (in 30 minutes)
   Mon, Jan 6, 2025, 12:35 PM (in 35 minutes)
   Mon, Jan 6, 2025, 12:40 PM (in 40 minutes)
   Mon, Jan 6, 2025, 12:45 PM (in 45 minutes)
   Mon, Jan 6, 2025, 12:50 PM (in 50 minutes)
   Platform Configuration
   The PLATFORM_INFO constant from types.ts (lines 90-135) defines characteristics for each supported platform:
   export const PLATFORM_INFO: Record<CronPlatform, PlatformInfo> = {
   unix: {
   name: 'Unix/Linux Crontab',
   description: 'Traditional Unix cron format (5 fields)',
   fieldCount: 5,
   hasSeconds: false,
   hasYear: false,
   format: 'minute hour day month weekday',
   example: '0 2 _ \* \*',
   documentation: 'https://man7.org/linux/man-pages/man5/crontab.5.html',
   },

quartz: {
name: 'Quartz Scheduler',
description: 'Java Quartz scheduler format (7 fields with seconds and year)',
fieldCount: 7,
hasSeconds: true,
hasYear: true,
format: 'second minute hour day month weekday year',
example: '0 0 2 \* _ ? _',
specialCharacters: ['?', 'L', 'W', '#'],
documentation: 'http://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html',
},

aws: {
name: 'AWS EventBridge',
description: 'Amazon EventBridge scheduler format (6 fields with year)',
fieldCount: 6,
hasSeconds: false,
hasYear: true,
format: 'minute hour day month weekday year',
example: '0 2 \* _ ? _',
specialCharacters: ['?', 'L', 'W'],
documentation: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-create-rule-schedule.html',
},

spring: {
name: 'Spring @Scheduled',
description: 'Spring Framework @Scheduled annotation format (6 fields with seconds)',
fieldCount: 6,
hasSeconds: true,
hasYear: false,
format: 'second minute hour day month weekday',
example: '0 0 2 \* \* \*',
documentation: 'https://docs.spring.io/spring-framework/reference/integration/scheduling.html',
},

kubernetes: {
name: 'Kubernetes CronJob',
description: 'Kubernetes CronJob format (5 fields, identical to Unix)',
fieldCount: 5,
hasSeconds: false,
hasYear: false,
format: 'minute hour day month weekday',
example: '0 2 \* \* \*',
documentation: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/',
},
};
Configuration fields:

- name: Display name shown in platform selector dropdown
- description: Tooltip text explaining platform characteristics
- fieldCount: Total number of cron fields (5, 6, or 7)
- hasSeconds: Boolean indicating if platform supports seconds field (Quartz and Spring only)
- hasYear: Boolean indicating if platform supports year field (Quartz and AWS only)
- format: Space-separated list of field names in order
- example: Sample cron expression in platform's format
- specialCharacters: Array of platform-specific special characters (Quartz supports ?, L, W, #; AWS supports ?, L, W)
- documentation: Official documentation URL for reference
  This configuration drives all platform-specific behavior including field count validation, expression generation, special character support, and documentation links.
  Preset Examples
  Sample presets from presets.ts showing different categories and patterns:
  // Common schedules - high frequency
  {
  id: 'every-minute',
  label: 'Every minute',
  expression: '\* \* \* \* _',
  category: 'common',
  description: 'Runs every minute of every hour',
  }
  // Hourly schedules - step values
  {
  id: 'every-6-hours',
  label: 'Every 6 hours',
  expression: '0 _/6 \* \* _',
  category: 'hourly',
  description: 'Runs at 00:00, 06:00, 12:00, 18:00',
  }
  // Daily schedules - specific times
  {
  id: 'daily-twice',
  label: 'Twice daily (9 AM and 9 PM)',
  expression: '0 9,21 _ \* _',
  category: 'daily',
  description: 'Runs at 9:00 AM and 9:00 PM every day',
  }
  // Weekly schedules - day ranges
  {
  id: 'weekdays-9am',
  label: 'Every weekday at 9 AM',
  expression: '0 9 _ _ 1-5',
  category: 'weekly',
  description: 'Runs Monday through Friday at 9:00 AM',
  }
  // Monthly schedules - day of month
  {
  id: 'first-of-month',
  label: 'First day of month at midnight',
  expression: '0 0 1 _ _',
  category: 'monthly',
  description: 'Runs at 00:00 on the 1st of every month',
  }
  // Advanced schedules - complex patterns
  {
  id: 'business-hours',
  label: 'Business hours (9-5 weekdays)',
  expression: '0 9-17 _ _ 1-5',
  category: 'advanced',
  description: 'Runs every hour from 9 AM to 5 PM, Monday through Friday',
  }
  {
  id: 'quarterly',
  label: 'Every quarter',
  expression: '0 0 1 1,4,7,10 _',
  category: 'advanced',
  description: 'Runs at midnight on January 1, April 1, July 1, and October 1',
  }
  Each preset includes:
- id: Unique identifier for analytics tracking
- label: Display name in preset list
- expression: Cron expression in 5-field Unix format (converted to other platforms automatically)
- category: One of 6 categories for filtering
- description: Human-readable explanation of when the schedule runs
  Usage Instructions
  Basic Workflow

1. Select Platform: Click the platform dropdown in the left settings panel and choose your target scheduler (Unix/Linux Crontab, Quartz Scheduler, AWS EventBridge, Spring @Scheduled, or Kubernetes CronJob). The visual builder will automatically adjust to show the correct number of fields.
2. Choose Starting Point: Either click a preset from the quick presets list (organized by category: Common, Hourly, Daily, Weekly, Monthly, Advanced) or start with the default "Every minute" configuration. Presets provide templates that you can customize.
3. Configure Schedule: Use the five dropdown selectors to build your schedule. Each dropdown shows common options for that field (minute, hour, day of month, month, day of week). Select values like "Every 5 minutes", "At 2 AM", "On day 15", "In January", or "On Monday".
4. Add Custom Values (optional): For advanced patterns, select "Custom..." from any dropdown to enter specific values. Use ranges (1-5), lists (1,3,5), step values (\*/10), or special characters (?, L, W, #) depending on your platform.
5. Review Expression: Check the generated expression in the output section. The raw cron syntax displays in monospace font, showing the exact string to use in your scheduler configuration.
6. Verify Human-Readable: Read the human-readable translation below the expression (e.g., "At 02:00 AM, Monday through Friday"). Ensure this matches your intended schedule. This catches common mistakes like AM/PM confusion or wrong day selection.
7. Check Next Executions: Scroll to the "Next 10 Executions" list. Verify the dates and times match your expectations. Pay attention to relative times ("in 2 hours") to ensure the schedule starts when intended. This is critical for catching timezone issues.
8. Validate for Errors: Look for validation messages. Green checkmark means valid syntax. Red error icon indicates syntax problems with specific field and fix suggestion. Yellow warning icon indicates potential conflicts (like specifying both day-of-month and day-of-week).
9. Export Expression: Click "Copy" to copy the expression to clipboard for pasting into configuration files, or click "Download" to save as cron-expression.txt for version control or documentation.
10. Test in Development: Deploy the expression to a development environment first. Monitor the first few executions to ensure timing is correct and no timezone issues exist.
    Use Case 1: Daily Backup Job
    Scenario: You need to configure a database backup script to run every day at 2:00 AM to ensure data safety without impacting daytime performance. The backup takes approximately 30 minutes to complete, so it must run during off-peak hours. You're using a Unix-based server with crontab for scheduling.
    Steps:
11. Access the Tool: Navigate to the Cron Expression Builder at /tools/development/cron-builder.
12. Confirm Platform: Verify the platform selector shows "Unix/Linux Crontab". This is the default and correct for standard Linux servers. The tool displays 5 input fields (minute, hour, day, month, weekday).
13. Browse Daily Presets: Click the category filter dropdown and select "Daily" to show only daily schedule presets. This reduces clutter and highlights relevant options.
14. Evaluate Preset Options: Review the 5 daily presets: "Daily at midnight" (0 0 \* \* _), "Daily at noon" (0 12 _ \* _), "Daily at 6 AM" (0 6 _ _ ), "Daily at 9 PM" (0 21 _ _ ), and "Twice daily" (0 9,21 _ \* \*). None exactly match the 2 AM requirement.
15. Select Closest Preset: Click "Daily at midnight" (0 0 \* \* _) as the starting point. This sets minute to 0, hour to 0, and all other fields to _ (every day/month/weekday).
16. Modify Hour Field: Click the hour dropdown (currently showing "At 0") and scroll to "At 2" to change from midnight to 2:00 AM. The expression updates to 0 2 \* \* \*.
17. Review Generated Expression: Check the output section shows 0 2 \* \* \*. This is the correct Unix cron format for "minute 0, hour 2, every day, every month, every weekday".
18. Verify Human-Readable Description: Confirm the description reads "At 02:00 AM". This clearly states the schedule runs at 2:00 AM every day, matching the requirement.
19. Check Next 10 Executions: Scroll to the execution preview. Verify it shows 10 consecutive days, all at 2:00 AM. Example: "Mon, Jan 6, 2025, 2:00 AM (in 14 hours)", "Tue, Jan 7, 2025, 2:00 AM (in 1 day)", etc. Ensure the times match your server's timezone.
20. Validate No Conflicts: Confirm the validation shows a green checkmark with no error or warning messages. The expression is syntactically valid and has no day-of-month vs day-of-week conflicts.
21. Copy Expression: Click the "Copy" button. A toast notification appears confirming "Cron expression copied to clipboard". The clipboard now contains 0 2 \* \* \*.
22. Deploy to Crontab: SSH into your server, run crontab -e, paste the expression, and add your backup script path. Example line: 0 2 \* \* \* /usr/local/bin/backup-database.sh. Save and exit. Run crontab -l to verify the entry was added.
23. Document the Schedule: Copy the human-readable description "At 02:00 AM" into your documentation or infrastructure-as-code repository for future reference.
24. Monitor First Execution: Stay available during the first scheduled execution (2:00 AM the next day) to verify the backup runs successfully and completes within the expected 30-minute window.
    Benefits:

- Zero Downtime Impact: Running at 2:00 AM ensures no customer-facing queries are slowed by backup operations, maintaining service quality during business hours (9 AM-6 PM).
- Consistent Recovery Point: Daily 2:00 AM backups create predictable recovery points. If data loss occurs at 3:00 PM, you know the backup is at most 13 hours old, enabling clear RTO/RPO commitments.
- Reduced Configuration Time: Using the visual builder with preset took 2 minutes vs 10-15 minutes researching cron syntax documentation and manually testing the expression format.
- Prevented Syntax Errors: Real-time validation caught potential mistakes (like typing 0 25 \* \* \* for 25:00 hours) before deployment, avoiding failed backups due to invalid crontab entries.
- Simplified Team Communication: The human-readable description "At 02:00 AM" is self-documenting in runbooks and on-call guides, reducing confusion compared to raw 0 2 \* \* \* syntax that junior engineers may misinterpret.
- Verified Execution Times: The next 10 executions preview confirmed the schedule runs daily without gaps or duplicates, and revealed the first execution is 14 hours away (in 14 hours), allowing time to test the backup script before the first automatic run.
  Use Case 2: Weekday Report Generation
  Scenario: Your business team needs automated sales reports generated every weekday morning at 9:00 AM for the daily standup meeting. The reports should NOT run on weekends since no one is in the office. Reports take 5 minutes to generate and must be ready before the 9:30 AM meeting starts. You're using AWS EventBridge to trigger a Lambda function.
  Steps:

1. Access the Tool: Open the Cron Expression Builder at /tools/development/cron-builder.
2. Change Platform: Click the platform dropdown (currently showing "Unix/Linux Crontab") and select "AWS EventBridge". The interface adds a sixth field for year, and the example changes to show 6-field format.
3. Filter by Category: Click the category filter and select "Weekly" to display only weekly schedule presets. This narrows the options to 5 weekly patterns.
4. Find Weekday Preset: Scan the weekly presets and click "Every weekday at 9 AM". The expression updates to 0 9 \* _ 1-5 _ (AWS format with year field). This template is almost perfect for the requirement.
5. Understand the Expression: Review each field: minute=0 (on the hour), hour=9 (9 AM), day=_ (every day), month=_ (every month), weekday=1-5 (Monday through Friday), year=\* (every year). This matches the "weekday at 9 AM" requirement exactly.
6. Verify Human-Readable: Check the description reads "At 09:00 AM, Monday through Friday". This confirms the schedule runs only on business days, not weekends.
7. Review Next Executions: Scroll to the execution preview. Notice it shows only weekdays, skipping Saturdays and Sundays. Example: "Mon, Jan 6, 2025, 9:00 AM (in 21 hours)", "Tue, Jan 7, 2025, 9:00 AM (in 2 days)", "Wed, Jan 8, 2025, 9:00 AM (in 3 days)", "Thu, Jan 9, 2025, 9:00 AM (in 4 days)", "Fri, Jan 10, 2025, 9:00 AM (in 5 days)", "Mon, Jan 13, 2025, 9:00 AM (in 8 days)" (notice skip from Friday to Monday).
8. Validate Timezone Awareness: Verify the times shown are in your browser's timezone. AWS EventBridge uses UTC internally, but the tool displays times in local timezone for easier verification. Note: You'll need to configure EventBridge timezone separately in AWS Console.
9. Check Validation Status: Confirm green checkmark with no errors or warnings. The expression 0 9 \* _ 1-5 _ is valid AWS EventBridge syntax with proper field count (6 fields).
10. Download Expression: Click "Download" to save the expression as cron-expression.txt. This file can be committed to your infrastructure-as-code repository (Terraform, CloudFormation, CDK) for version control.
11. Deploy to AWS EventBridge: Open AWS Console > EventBridge > Rules. Create new rule with schedule pattern. Paste expression 0 9 \* _ 1-5 _. Select timezone (e.g., America/New_York). Add Lambda function as target. Configure retry policy and dead-letter queue.
12. Add Documentation: In your Lambda function code comments, paste the human-readable description: // Runs at 09:00 AM, Monday through Friday. This helps future developers understand the schedule without decoding cron syntax.
13. Test Before Production: Manually trigger the Lambda function to verify report generation works correctly. Check report output format, data accuracy, and delivery method (email, S3 bucket, dashboard).
14. Monitor First Week: Review CloudWatch Logs for the first week of executions (5 days) to ensure the report runs at 9:00 AM each weekday, completes within 5 minutes, and produces correct data.
    Benefits:

- Perfect Business Alignment: Schedule runs only on weekdays (Monday-Friday), avoiding wasted compute costs and unnecessary S3 storage for weekend reports that no one reviews, saving approximately $50/month in Lambda and S3 costs.
- Meeting-Ready Reports: 9:00 AM execution ensures reports are generated and available 30 minutes before the 9:30 AM standup, giving team members time
