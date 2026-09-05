# Daily Note Generator

## Overview

The Daily Note Generator is a productivity tool designed to help users create, organize, and maintain timestamped daily notes with customizable templates. It provides an intuitive interface for journaling, meeting notes, task planning, and daily reflections with built-in date navigation and markdown support.

## Features

### 1. Template System

#### Pre-built Templates
- **Daily Log**: General-purpose daily note with focus areas, tasks, and priorities
- **Gratitude Journal**: Daily gratitude practice with reflection prompts
- **Learning Notes**: Educational notes with key concepts and action items
- **Meeting Notes**: Professional meeting documentation with agenda and action items
- **Project Planning**: Project management notes with milestones and tasks
- **Daily Reflection**: End-of-day reflection with energy tracking
- **Standup Notes**: Agile standup format (yesterday, today, blockers)
- **Blank Note**: Empty template for free-form note-taking

#### Custom Templates
- Create unlimited custom templates
- Use template variables (`{{date}}`, `{{time}}`)
- Organize by custom categories
- Persistent storage in localStorage

### 2. Date Navigation

- **Previous Day**: Navigate to yesterday's note
- **Today**: Quick jump to current date
- **Next Day**: Navigate to tomorrow's note
- **Date Display**: Full formatted date with weekday and time
- **Date-based Organization**: Automatic note organization by date
- **Recent Notes**: Quick access to last 5 notes

### 3. Note Management

- **Auto-save to localStorage**: Notes persist across sessions
- **Real-time Editing**: Instant updates as you type
- **Markdown Support**: Write notes using markdown syntax
- **Word/Character/Line Count**: Live statistics while editing
- **Note History**: Access previously saved notes by date
- **Update Existing Notes**: Edit and save changes to existing notes

### 4. Export & Sharing

- **Copy to Clipboard**: Quickly copy note content
- **Download as Markdown**: Export notes as .md files
- **Date-based Filenames**: Automatic naming (note-YYYY-MM-DD.md)

### 5. Statistics Dashboard

- **Total Notes**: Lifetime note count
- **Monthly Notes**: Notes created in current month
- **Average Word Count**: Average words per note
- **Real-time Stats**: Word, character, and line counts

## Technical Implementation

### Tech Stack

- **React**: Component-based UI (Next.js App Router)
- **TypeScript**: Type-safe development
- **Panda CSS**: Styling solution
- **localStorage**: Client-side data persistence
- **Lucide Icons**: Icon library
- **Sonner**: Toast notifications
- **Analytics**: User behavior tracking

### Data Structures

```typescript
interface Note {
  id: string // Unique identifier (date + timestamp)
  date: string // Date in ISO format (YYYY-MM-DD)
  content: string // Note content in markdown
  template: string // Template ID used
  timestamp: string // Last modified timestamp
}

interface Template {
  id: string // Unique template identifier
  name: string // Display name
  content: string // Template content with variables
  category: string // Template category
}
```

### State Management

- **React useState**: Local component state
- **useEffect**: Side effects for localStorage and date changes
- **useMemo**: Performance optimization for computed values
- **useCallback**: Memoized event handlers
- **localStorage**: Persistent storage for notes and templates

### Key Functions

#### Note Operations
- `handleSaveNote()`: Saves or updates note for current date
- `handleDateChange()`: Navigates between dates
- `handleTemplateChange()`: Applies template to current note
- `handleCopyToClipboard()`: Copies note content
- `handleDownloadMarkdown()`: Exports note as .md file

#### Template Management
- `handleCreateCustomTemplate()`: Creates new custom template
- `applyTemplate()`: Applies template with variable substitution
- `formatDate()`: Formats dates for storage
- `formatDisplayDate()`: Formats dates for display
- `formatTime()`: Gets current time formatted

#### Utilities
- `formatDate(date)`: Converts Date to ISO string (YYYY-MM-DD)
- `formatDisplayDate(dateStr)`: Converts to readable format
- `formatTime()`: Returns current time (HH:MM AM/PM)
- `applyTemplate(template, date)`: Replaces variables in template

## User Interface

### Layout

- **Three-Section Layout**:
  - Top: Header with title, description, and statistics
  - Middle: Date navigation bar
  - Bottom: Two-column grid (sidebar + editor)
- **Responsive Design**: Adapts to mobile, tablet, and desktop
- **Green Gradient Theme**: Consistent with productivity tools

### Components Used

- **Card**: Container components for sections
- **Input**: Template name input
- **Textarea**: Main note editor
- **Button**: Action buttons throughout
- **Badge**: Statistics and category labels

### Styling Approach

- Panda CSS with `css()` function exclusively
- No Tailwind utility classes
- Consistent spacing and typography
- Smooth transitions and hover effects
- Glass-morphism effects on cards

## Analytics Tracking

The tool tracks the following user events:

- `daily_note_saved`: When a note is saved (includes template type)
- `daily_note_template_changed`: When user switches templates
- `daily_note_date_changed`: When user navigates dates (includes direction)
- `daily_note_downloaded`: When note is exported
- `daily_note_copied`: When note is copied to clipboard
- `daily_note_custom_template_created`: When custom template is created

## Testing

### Test Coverage

The tool includes 30+ comprehensive tests covering:

#### Component Tests
- Page rendering
- Default state
- UI elements presence
- Template display
- Date navigation
- Action buttons

#### Template Tests
- Template listing
- Template selection
- Template application
- Custom template creation
- Template categories

#### Date Navigation Tests
- Previous day navigation
- Next day navigation
- Today navigation
- Date display updates

#### Note Management Tests
- Save functionality
- Update existing notes
- Empty note validation
- localStorage persistence
- Note loading from storage

#### Export Tests
- Copy to clipboard
- Download as markdown
- Empty content validation
- File naming

#### Statistics Tests
- Note count
- Word count
- Character count
- Line count
- Monthly statistics

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test daily-note

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test:watch
```

## Usage Examples

### Basic Daily Note

1. Open the tool (defaults to today's date)
2. Select "Daily Log" template (default)
3. Fill in the template sections:
   - Today's Focus
   - Tasks Completed
   - Notes
   - Tomorrow's Priorities
4. Click "Save Note"

### Meeting Documentation

1. Click "Meeting Notes" template
2. Note auto-fills with current date and time
3. Add meeting details:
   - Attendees
   - Purpose
   - Agenda items
4. Document discussion points
5. List action items with checkboxes
6. Save and download as .md if needed

### Creating Custom Template

1. Click "Create Custom Template"
2. Enter template name (e.g., "Sprint Review")
3. Write template content with markdown
4. Use `{{date}}` and `{{time}}` variables
5. Click "Save"
6. Template appears in "Custom" category

### Reviewing Past Notes

1. Navigate using Previous/Next buttons
2. Or click date in "Recent Notes" sidebar
3. View or edit existing note
4. Save changes if needed

## Template Variables

Custom templates support the following variables:

- `{{date}}`: Automatically replaced with formatted date (e.g., "Monday, January 20, 2025")
- `{{time}}`: Automatically replaced with current time (e.g., "02:30 PM")

Example:
```markdown
# {{date}} - Sprint Planning

## Meeting Time: {{time}}

## Agenda
- Sprint goals
- Story point estimation
```

## Best Practices

### For Users

- **Consistent Daily Practice**: Create notes at the same time each day
- **Use Appropriate Templates**: Match template to note purpose
- **Leverage Markdown**: Use headings, lists, and formatting
- **Export Regularly**: Backup important notes
- **Create Custom Templates**: Build templates for recurring needs
- **Review Recent Notes**: Use sidebar for quick reference

### For Developers

- Notes stored under localStorage key `dailyNotes`
- Custom templates stored under `dailyNoteTemplates`
- Date format is always ISO (YYYY-MM-DD)
- Template IDs use kebab-case naming
- Custom template IDs prefixed with `custom-`
- Note content supports full markdown syntax

## Data Persistence

### Storage

- **localStorage**: Browser-based storage
- **Automatic Saving**: Manual save with explicit button
- **No Server Required**: Completely client-side
- **Privacy**: Data never leaves user's device
- **Persistence**: Survives browser restarts

### Storage Keys

- `dailyNotes`: Array of all saved notes
- `dailyNoteTemplates`: Array of custom templates

### Limitations

- localStorage has ~5-10MB limit (sufficient for years of notes)
- Data is device-specific (no sync across devices)
- Clearing browser data removes all notes
- No built-in cloud backup

### Recommendations

- Export important notes regularly
- Use download feature for backups
- Keep custom templates backed up
- Consider implementing cloud sync for production

## Accessibility

- Semantic HTML structure with `<main>` wrapper
- Keyboard navigation support
- ARIA labels on form elements
- Color contrast compliance (WCAG AA)
- Focus indicators on interactive elements
- Clear button labels and descriptions

## Performance

- Lightweight implementation
- Efficient React rendering with memoization
- Optimized re-renders with useCallback
- Fast localStorage operations
- No network requests for core functionality
- Lazy loading of note history

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Android)
- Requires localStorage support

## SEO Optimization

### Metadata

- Title: "Daily Note Generator - Timestamped Notes with Templates"
- Description: Comprehensive description for search engines
- Keywords: 14 relevant keywords for discoverability
- Category: Productivity
- Path: /tools/daily-note

### Structured Data

- Tool metadata generated via `generateToolMetadata()`
- Proper semantic HTML
- Optimized for search engine indexing

## Future Enhancements

Potential improvements for future versions:

- **Cloud Sync**: Multi-device synchronization
- **Rich Text Editor**: WYSIWYG markdown editing
- **Note Search**: Full-text search across all notes
- **Tags & Labels**: Custom categorization system
- **Calendar View**: Visual calendar with note indicators
- **Export Formats**: PDF, DOCX, HTML exports
- **Import Notes**: Bulk import from other tools
- **Note Linking**: Inter-note references
- **Attachments**: Image and file uploads
- **Sharing**: Public note sharing links
- **Themes**: Dark mode and custom color themes
- **Templates Library**: Community-shared templates
- **Reminders**: Daily note reminders
- **Streak Tracking**: Gamification for consistency
- **AI Assistance**: AI-powered note suggestions

## Integration Possibilities

The tool can be extended to integrate with:

- **Notion**: Export to Notion pages
- **Obsidian**: Compatible markdown format
- **Roam Research**: Network note-taking
- **Google Drive**: Cloud backup
- **Dropbox**: File synchronization
- **GitHub**: Version-controlled notes
- **Email**: Daily note email delivery
- **Calendar Apps**: Meeting note links
- **Task Managers**: Extract todos automatically

## Troubleshooting

### Notes Not Saving
- Check browser localStorage is enabled
- Verify sufficient storage space
- Try clearing old notes
- Check browser console for errors

### Templates Not Loading
- Verify localStorage access
- Clear browser cache
- Check for JavaScript errors
- Reload page

### Date Navigation Issues
- Ensure JavaScript is enabled
- Check browser date/time settings
- Try refreshing the page

## License

Part of the SuperTool suite - see project root for license information.

## Version History

- **v1.0.0** (January 2025): Initial release
  - 8 pre-built templates
  - Custom template creation
  - Date navigation
  - Markdown export
  - localStorage persistence
  - Comprehensive testing
  - Full analytics integration
