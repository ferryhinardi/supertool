# Task Timer with Sessions

> **Category**: Productivity  
> **Path**: `/tools/productivity/task-timer`  
> **Status**: Active  
> **Processing**: 100% Client-side

## Overview

The Task Timer is a session-based time tracking tool for managing multiple concurrent tasks. Organize your work into sessions, track time across different activities, export detailed reports, and analyze your productivity patterns.

## Features

### Core Features

- **Session Management**: Group multiple task timers into named sessions
- **Multiple Concurrent Timers**: Track several tasks simultaneously
- **Session History**: View and export past sessions
- **Real-time Statistics**: Active timers, total timers, and session time

### Additional Features

- **Export Reports**: Download session data as CSV or JSON
- **Desktop Notifications**: Browser notifications for session events
- **Task Breakdown**: See time spent on each task within a session
- **Persistent History**: Sessions saved in localStorage

## How to Use

### Starting a Session

1. **Name Your Session** (optional): Enter a session name or use auto-generated name
2. **Start Session**: Click "Start Session" button
3. **Add Timers**: Create task timers within the session
4. **Track Time**: Start/pause individual timers as you work
5. **End Session**: Click "End Session" to save and close

### Managing Task Timers

1. **Add Timer**: Enter task name and click "Add Timer"
2. **Start/Pause**: Click play/pause button on each timer
3. **Reset**: Click reset button to zero a timer
4. **Remove**: Click X to delete a timer from session

## Session Control Panel

| Stat | Description |
|------|-------------|
| Active Timers | Number of currently running timers |
| Total Timers | Total number of timers in session |
| Session Time | Sum of all timer elapsed times |

## Timer States

| State | Visual | Description |
|-------|--------|-------------|
| Running | Green border/background | Timer actively counting |
| Paused | Gray border | Timer stopped, time preserved |
| Idle | Gray background | Timer at 0, never started |

## Time Display Format

| Duration | Format | Example |
|----------|--------|---------|
| < 1 hour | MM:SS | 45:30 |
| >= 1 hour | HH:MM:SS | 02:15:30 |

## Export Options

### CSV Format

```csv
Session: Development Sprint
Started: 1/8/2026, 10:00:00 AM
Ended: 1/8/2026, 2:30:00 PM

Task Name,Time (seconds),Time (formatted)
Code Review,3600,01:00:00
Bug Fixes,5400,01:30:00
Documentation,1800,00:30:00

Total,10800,03:00:00
```

### JSON Format

```json
{
  "session": "Development Sprint",
  "startTime": "2026-01-08T10:00:00.000Z",
  "endTime": "2026-01-08T14:30:00.000Z",
  "timers": [
    {
      "name": "Code Review",
      "elapsed": 3600,
      "formattedTime": "01:00:00"
    }
  ],
  "totalTime": 10800,
  "formattedTotalTime": "03:00:00"
}
```

## Session History

Session history includes:
- Session name
- Start and end timestamps
- All task timers with elapsed times
- Total session time
- Export buttons for CSV/JSON

### History Actions

| Action | Description |
|--------|-------------|
| Export CSV | Download session as spreadsheet-ready CSV |
| Export JSON | Download session as JSON data file |
| Delete | Remove session from history |

## Use Cases

- **Project Management**: Track time across different project phases
- **Freelancing**: Log billable hours per client task
- **Development**: Measure time spent on coding, testing, reviews
- **Research**: Track reading, writing, and analysis time
- **Learning**: Monitor study time across different subjects
- **Productivity Analysis**: Identify where time is spent

## Technical Details

### Processing

| Aspect | Details |
|--------|---------|
| Processing Location | 100% client-side (browser) |
| Timer Precision | 100ms update intervals |
| Storage | localStorage for session history |
| Max Sessions | Limited by localStorage (typically 5-10MB) |
| Privacy | No data sent to server |

### Timer Mechanism

- Uses `Date.now()` for accurate elapsed time calculation
- Stores `startTime` when timer begins
- Calculates elapsed as `(now - startTime) / 1000` seconds
- Survives page focus/blur without drift

### Data Persistence

| Data | Storage Key | Persistence |
|------|-------------|-------------|
| Session History | `taskTimerSessions` | Until manually cleared |
| Current Session | Memory only | Lost on page refresh |

## Notifications

Enable browser notifications to receive alerts:
- Session start/end confirmations
- Timer milestones (if configured)

To enable:
1. Click "Enable Notifications" button
2. Accept browser permission when prompted

## Best Practices

- Start each work period with a new session
- Use descriptive task names for better reports
- End sessions properly to save history
- Export important sessions for backup
- Review session history weekly for insights

## Related Tools

- [Stopwatch & Timer](/tools/productivity/stopwatch-timer) - Precision timing with laps
- [Pomodoro Timer](/tools/productivity/pomodoro) - Focus timer with breaks
- [Daily Task Summary](/tools/productivity/daily-task-summary) - Track daily accomplishments
- [Tally Counter](/tools/productivity/tally-counter) - Count occurrences

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with session management and export features |
