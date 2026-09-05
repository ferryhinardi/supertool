# Stopwatch & Timer

> **Category**: Productivity  
> **Path**: `/tools/productivity/stopwatch-timer`  
> **Status**: Active  
> **Processing**: 100% Client-side

## Overview

The Stopwatch & Timer is a professional time tracking tool featuring a precision stopwatch with lap recording and multiple countdown timers with desktop notifications. Save presets, export lap times, and run multiple timers simultaneously.

## Features

### Stopwatch Features

- **Precision Timing**: Millisecond-accurate stopwatch display (MM:SS.ms)
- **Lap Recording**: Track interval times with fastest/slowest highlighting
- **Export Laps**: Download lap times as CSV or JSON
- **Save Sessions**: Store completed sessions in history
- **Keyboard Shortcuts**: Space (start/pause), R (reset), L (lap)

### Timer Features

- **Multiple Timers**: Run several countdown timers simultaneously
- **Custom Presets**: Save and load frequently used durations
- **Desktop Notifications**: Browser notifications when timers complete
- **Audio Alerts**: Sound notification on timer completion
- **Visual Progress**: Progress bar for each active timer

## How to Use

### Stopwatch Mode

1. **Start/Pause**: Click "Start" button or press `Space`
2. **Record Laps**: Click "Lap" button or press `L` while running
3. **Reset**: Click "Reset" button or press `R`
4. **Export**: Click CSV or JSON to download lap times
5. **Save Session**: Click "Save Session" when paused

### Timer Mode

1. **Set Duration**: Enter minutes and seconds
2. **Name Timer** (optional): Give your timer a descriptive name
3. **Add Timer**: Click "Add Timer" to create countdown
4. **Start**: Click play button on the timer card
5. **Save Preset**: Click "Save Preset" to reuse duration later

## Keyboard Shortcuts (Stopwatch Mode)

| Key | Action |
|-----|--------|
| `Space` | Start/Pause stopwatch |
| `R` | Reset stopwatch and clear laps |
| `L` | Record lap (when running) |
| `Escape` | Exit fullscreen |

## Timer Presets

Presets are saved in localStorage and persist between sessions:

- Click **Save Preset** after entering a duration
- Click any preset card to create a new timer from it
- Delete presets with the trash icon

## Lap Time Features

### Lap Statistics

| Badge | Meaning |
|-------|---------|
| Fastest | Shortest lap duration (green) |
| Slowest | Longest lap duration (red) |

### Export Formats

**CSV Format**:
```csv
Lap,Lap Time,Total Time
1,00:30.45,00:30.45
2,00:28.12,00:58.57
```

**JSON Format**:
```json
{
  "totalTime": "02:30.45",
  "totalMilliseconds": 150450,
  "laps": [
    {"lap": 1, "lapTime": "00:30.45", "totalTime": "00:30.45"}
  ]
}
```

## Timer Notifications

### Enabling Notifications

1. Click "Enable Notifications" button in Timer mode
2. Accept browser permission prompt
3. Notifications will appear when timers complete

### Notification Types

- **Browser Notification**: Desktop popup with timer name
- **Audio Alert**: Sound plays when timer reaches zero
- **Toast Message**: In-app notification

## Timer States

| State | Visual Indicator |
|-------|------------------|
| Running | Green border, counting down |
| Paused | Gray border, time frozen |
| Warning (< 10s) | Red border, flashing |
| Complete | Green background, "0:00" display |

## Use Cases

- **Workouts**: Track exercise intervals with lap times
- **Cooking**: Set multiple timers for different dishes
- **Productivity**: Pomodoro-style work sessions
- **Meetings**: Time-box discussions and presentations
- **Games**: Speedrun timing with precise lap splits
- **Testing**: Measure performance benchmarks

## Technical Details

### Processing

| Aspect | Details |
|--------|---------|
| Processing Location | 100% client-side (browser) |
| Stopwatch Precision | 10ms intervals |
| Timer Precision | 1 second intervals |
| Storage | localStorage for presets and history |
| Notifications | Web Notifications API |
| Audio | Web Audio API fallback for beep |

### Time Display Formats

| Mode | Format | Example |
|------|--------|---------|
| Stopwatch | MM:SS.ms | 05:30.45 |
| Timer (< 1 hour) | MM:SS | 25:00 |
| Timer (>= 1 hour) | HH:MM:SS | 01:30:00 |

### Session History

Sessions are saved with:
- Total elapsed time
- All lap times with durations
- Session name (auto-generated or custom)
- Timestamp

## Browser Support

| Feature | Support |
|---------|---------|
| Stopwatch | All modern browsers |
| Notifications | Chrome, Firefox, Safari, Edge |
| Audio | All browsers with Web Audio API |
| localStorage | All modern browsers |

## Related Tools

- [Pomodoro Timer](/tools/productivity/pomodoro) - Focus timer with breaks
- [Task Timer](/tools/productivity/task-timer) - Session-based task tracking
- [Tally Counter](/tools/productivity/tally-counter) - Count occurrences
- [Daily Task Summary](/tools/productivity/daily-task-summary) - Track daily tasks

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025 | Initial release with stopwatch, timer, presets, and notifications |
| 1.1.0 | 2025 | Added keyboard shortcuts, fastest/slowest lap badges, export options |
