# API Request Tester Tool

**Created:** October 28, 2025  
**Last Updated:** October 28, 2025  
**Route:** `/tools/api-tester`  
**Category:** Development

## Overview

The API Request Tester is a comprehensive tool for testing and debugging HTTP APIs directly in your browser. It provides a full-featured REST client interface with support for all HTTP methods, custom headers, authentication, request bodies, and response inspection. Perfect for developers testing APIs, debugging backend services, or exploring third-party API endpoints.

## Purpose & Use Cases

### Primary Use Cases
1. **API Development** - Test your own REST APIs during development without leaving the browser
2. **API Debugging** - Inspect request/response details to troubleshoot API integration issues
3. **API Exploration** - Discover and experiment with third-party API endpoints
4. **Backend Testing** - Verify backend services are responding correctly with proper headers and status codes
5. **Documentation Verification** - Validate that API documentation matches actual endpoint behavior

### Why Use This Tool?
Unlike standalone API clients like Postman or Insomnia, this browser-based tool offers:
- **No installation required** - Works directly in the browser
- **Persistent presets** - Save frequently used requests in localStorage
- **Request history** - Track your last 50 requests with full responses
- **Privacy-focused** - All data stays in your browser (no cloud sync)
- **Fast iteration** - Quick testing without switching applications
- **Free and open source** - No account, subscription, or limits

## Key Features

### 1. HTTP Method Support
- **GET** - Retrieve data from endpoints
- **POST** - Create new resources or submit data
- **PUT** - Update existing resources completely
- **DELETE** - Remove resources
- **PATCH** - Partial resource updates
- **HEAD** - Get headers without response body
- **OPTIONS** - Check allowed methods and CORS preflight

### 2. Custom Headers Management
- Add unlimited custom headers as key-value pairs
- Enable/disable individual headers without deletion
- Common headers pre-populated (Content-Type, Authorization, Accept)
- Real-time header validation
- Headers persist in presets and history

### 3. Authentication Methods
- **None** - Public endpoints requiring no authentication
- **Bearer Token** - Modern OAuth 2.0 / JWT authentication
- **Basic Auth** - Traditional username/password authentication (Base64 encoded)
- Authentication automatically sets appropriate headers

### 4. Request Body Types
- **None** - For GET, DELETE, HEAD, OPTIONS requests
- **JSON** - Structured data with syntax validation
- **Text** - Plain text, XML, HTML, or other text formats
- **Form Data** - Key-value pairs for traditional form submissions
- Body type automatically sets Content-Type header

### 5. Response Viewer
- **Status Code** - HTTP status with color-coded display (success/error)
- **Response Time** - Request duration in milliseconds
- **Response Size** - Formatted size display (bytes, KB, MB)
- **Response Headers** - All headers returned by the server
- **Response Body** - Formatted JSON or raw text display
- **Copy Response** - One-click copy to clipboard
- **Download Response** - Save response as file

### 6. Presets System
- **Save Requests** - Store frequently used requests with custom names
- **Load Presets** - Instantly restore saved request configurations
- **Delete Presets** - Remove outdated or unwanted presets
- **Persistent Storage** - All presets saved in browser localStorage
- **Full Configuration** - Includes method, URL, headers, auth, and body

### 7. Request History
- **Last 50 Requests** - Automatic tracking of all sent requests
- **Full Details** - Includes complete request and response data
- **One-Click Restore** - Load any historical request instantly
- **Timestamp Display** - See when each request was made
- **Response Preview** - Quick status code and timing overview

### 8. Data Persistence
- All presets automatically saved to localStorage
- History maintained across browser sessions
- Data never leaves your device
- No server-side storage or tracking
- Storage keys: `api_tester_presets` and `api_tester_history`

## Technical Implementation

### Component Architecture

**File Structure:**
```
app/tools/api-tester/
├── page.tsx              # Main component (client-side)
├── layout.tsx            # SEO metadata
└── __tests__/
    └── page.test.tsx     # Component tests (45 tests)
```

### State Management

**Request Configuration Interface:**
```typescript
interface RequestConfig {
  method: string          // HTTP method (GET, POST, etc.)
  url: string            // Target endpoint URL
  headers: Array<{
    id: string           // Unique header ID
    key: string          // Header name
    value: string        // Header value
    enabled: boolean     // Toggle header on/off
  }>
  auth: {
    type: 'none' | 'bearer' | 'basic'
    bearerToken?: string
    basicUsername?: string
    basicPassword?: string
  }
  body: {
    type: 'none' | 'json' | 'text' | 'formdata'
    content: string      // Body content as string
  }
}
```

**Response Interface:**
```typescript
interface Response {
  status: number         // HTTP status code (200, 404, etc.)
  statusText: string     // Status message ("OK", "Not Found")
  headers: Record<string, string>
  body: string          // Response body as string
  time: number          // Duration in milliseconds
  size: number          // Size in bytes
}
```

**Preset Interface:**
```typescript
interface Preset {
  id: string            // Unique ID (nanoid)
  name: string          // User-defined preset name
  config: RequestConfig // Full request configuration
  createdAt: string     // ISO timestamp
}
```

**History Entry Interface:**
```typescript
interface HistoryEntry {
  id: string            // Unique ID (nanoid)
  request: RequestConfig
  response: Response
  timestamp: string     // ISO timestamp
}
```

**React State Hooks:**
- `useState<RequestConfig>` - Current request configuration
- `useState<Response | null>` - Last response received
- `useState<boolean>` - Loading state during request
- `useState<Preset[]>` - Saved presets array
- `useState<HistoryEntry[]>` - Request history (max 50)
- `useState<string>` - New preset name input

### Core Functions

**1. Send Request**
```typescript
const sendRequest = async () => {
  setLoading(true)
  const startTime = performance.now()
  
  try {
    const headers = buildHeaders() // Process enabled headers + auth
    const response = await fetch(config.url, {
      method: config.method,
      headers,
      body: shouldIncludeBody ? config.body.content : undefined
    })
    
    const endTime = performance.now()
    const time = Math.round(endTime - startTime)
    const body = await response.text()
    const size = new Blob([body]).size
    
    const result = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      body,
      time,
      size
    }
    
    setResponse(result)
    addToHistory(config, result)
    trackToolEvent('api_tester_send_request', { method: config.method })
  } catch (error) {
    // Handle network errors
  } finally {
    setLoading(false)
  }
}
```

**2. Build Headers**
```typescript
const buildHeaders = () => {
  const headers = new Headers()
  
  // Add enabled custom headers
  config.headers
    .filter(h => h.enabled && h.key && h.value)
    .forEach(h => headers.set(h.key, h.value))
  
  // Add authentication header
  if (config.auth.type === 'bearer') {
    headers.set('Authorization', `Bearer ${config.auth.bearerToken}`)
  } else if (config.auth.type === 'basic') {
    const encoded = btoa(`${config.auth.basicUsername}:${config.auth.basicPassword}`)
    headers.set('Authorization', `Basic ${encoded}`)
  }
  
  // Set Content-Type based on body type
  if (config.body.type === 'json') {
    headers.set('Content-Type', 'application/json')
  } else if (config.body.type === 'formdata') {
    headers.set('Content-Type', 'application/x-www-form-urlencoded')
  }
  
  return headers
}
```

**3. Save Preset**
```typescript
const savePreset = () => {
  const preset: Preset = {
    id: nanoid(),
    name: presetName,
    config: currentConfig,
    createdAt: new Date().toISOString()
  }
  
  const updatedPresets = [...presets, preset]
  setPresets(updatedPresets)
  localStorage.setItem('api_tester_presets', JSON.stringify(updatedPresets))
  
  trackToolEvent('api_tester_save_preset')
  toast.success(`Preset "${presetName}" saved!`)
}
```

**4. Load from History**
```typescript
const loadFromHistory = (entry: HistoryEntry) => {
  setConfig(entry.request)
  setResponse(entry.response)
  toast.success('Request loaded from history')
}
```

### Styling Approach

**Color Scheme:** Blue/Purple gradient theme
- Primary gradient: `blue.400` → `purple.400`
- HTTP method badges: Color-coded (GET=green, POST=blue, DELETE=red, etc.)
- Status codes: Green for 2xx, yellow for 3xx, red for 4xx/5xx
- Consistent with development tool category

**Layout Pattern:**
- Two-column layout: Request config (left) + Response viewer (right)
- Tabbed interface for request sections (Headers, Auth, Body)
- Collapsible sections for presets and history
- All styling uses Panda CSS `css()` function (no Tailwind utilities)

**Card Structure:**
```tsx
<div className={css({ display: 'grid', gridTemplateColumns: { base: '1', lg: '2' } })}>
  {/* Left Column: Request Configuration */}
  <Card>
    <CardHeader>HTTP Method + URL Input</CardHeader>
    <CardContent>
      <Tabs>
        <Tab>Headers Editor</Tab>
        <Tab>Authentication</Tab>
        <Tab>Request Body</Tab>
      </Tabs>
      <Button onClick={sendRequest}>Send Request</Button>
    </CardContent>
  </Card>
  
  {/* Right Column: Response Viewer */}
  <Card>
    <CardHeader>Response Status + Actions</CardHeader>
    <CardContent>
      {/* Status, Time, Size */}
      {/* Headers Display */}
      {/* Body Display (formatted JSON or raw) */}
    </CardContent>
  </Card>
</div>
```

### Analytics Events

All user interactions are tracked for usage insights:

| Event Name | Trigger | Metadata |
|------------|---------|----------|
| `api_tester_send_request` | Send button clicked | `method` |
| `api_tester_method_change` | HTTP method selected | `method` |
| `api_tester_save_preset` | Preset saved | None |
| `api_tester_load_preset` | Preset loaded | None |
| `api_tester_delete_preset` | Preset deleted | None |
| `api_tester_copy_response` | Response copied | None |
| `api_tester_open` | Tool page loaded | None |

### Testing Strategy

**Test Coverage:** 45 comprehensive tests covering:

1. **Rendering Tests** (8 tests)
   - Page structure and heading
   - URL input field
   - HTTP method selector
   - Send button presence
   - Headers, auth, and body tabs
   - Presets and history sections
   - Response viewer (when no response yet)

2. **HTTP Method Tests** (7 tests)
   - All 7 methods selectable (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
   - Method badge displays correctly
   - Analytics tracking on method change

3. **Headers Tests** (5 tests)
   - Add new header
   - Remove header
   - Toggle header enable/disable
   - Multiple headers support
   - Header persistence in presets

4. **Authentication Tests** (4 tests)
   - Switch between auth types (none, bearer, basic)
   - Bearer token input
   - Basic auth username/password inputs
   - Auth headers added to request

5. **Body Tests** (6 tests)
   - Switch between body types (none, json, text, formdata)
   - JSON body input and validation
   - Text body input
   - Form data key-value pairs
   - Body included in appropriate methods (POST/PUT/PATCH)
   - Invalid JSON error handling

6. **Request/Response Tests** (8 tests)
   - Successful GET request
   - POST request with JSON body
   - Request with custom headers
   - Request with bearer auth
   - Response status display
   - Response headers display
   - Response body display (formatted JSON)
   - Response timing and size display
   - Network error handling

7. **Presets Tests** (4 tests)
   - Save preset with name
   - Load preset restores configuration
   - Delete preset
   - Presets persist in localStorage

8. **History Tests** (3 tests)
   - Request added to history after sending
   - Load from history restores request and response
   - History limited to 50 entries (oldest removed)
   - History persists in localStorage

**Key Testing Patterns:**
- **Fetch mocking**: Uses `vi.spyOn(global, 'fetch')` to mock API calls
- **Async handling**: All tests use `waitFor` for async state updates
- **User interactions**: Uses `@testing-library/user-event` for realistic user actions
- **localStorage mocking**: Tests persistence without real browser storage
- **Response formatting**: Validates JSON pretty-printing and syntax highlighting

## User Experience Details

### Visual Feedback
- **Loading state** during request with spinner and disabled button
- **Toast notifications** for all operations (save preset, copy response, errors)
- **Color-coded status** - Green (2xx), yellow (3xx/redirect), red (4xx/5xx)
- **Syntax highlighting** for JSON responses using `react-syntax-highlighter`
- **Formatted timing** - Displays as "ms" or "s" depending on duration
- **Formatted size** - Displays as "B", "KB", or "MB" depending on size

### Input Validation
- **URL validation** - Shows error if URL is empty or invalid
- **JSON validation** - Highlights syntax errors in JSON body before sending
- **Header validation** - Prevents sending headers with empty keys
- **Auth validation** - Requires token/credentials when auth type is selected
- **Preset name** - Required field when saving preset

### Keyboard Shortcuts
- **Enter in URL input** - Sends request
- **Cmd/Ctrl + Enter** - Sends request from anywhere in form
- **Tab navigation** - Smooth navigation through form fields
- **Escape** - Close modals and dropdowns

### Mobile Responsiveness
- Single column layout on mobile (< 1024px)
- Two column layout on desktop (1024px+)
- Touch-friendly button sizes
- Responsive tabs and collapsible sections
- Optimized for portrait and landscape orientations

### Accessibility
- Proper semantic HTML (`<main>`, `<form>`, `<section>`)
- Button aria-labels for screen readers
- Form labels properly associated with inputs
- Keyboard navigation support throughout
- Color contrast meets WCAG AA standards
- Toast notifications with screen reader announcements

## localStorage Schema

**Storage Keys:**
- `api_tester_presets` - Saved request presets
- `api_tester_history` - Request history (max 50 entries)

**Presets Data Format:**
```json
[
  {
    "id": "abc123xyz",
    "name": "Get Users API",
    "config": {
      "method": "GET",
      "url": "https://api.example.com/users",
      "headers": [
        { "id": "h1", "key": "Accept", "value": "application/json", "enabled": true }
      ],
      "auth": { "type": "bearer", "bearerToken": "eyJhbGc..." },
      "body": { "type": "none", "content": "" }
    },
    "createdAt": "2025-10-28T12:00:00.000Z"
  }
]
```

**History Data Format:**
```json
[
  {
    "id": "def456uvw",
    "request": {
      "method": "POST",
      "url": "https://api.example.com/users",
      "headers": [...],
      "auth": {...},
      "body": { "type": "json", "content": "{\"name\":\"John\"}" }
    },
    "response": {
      "status": 201,
      "statusText": "Created",
      "headers": { "content-type": "application/json" },
      "body": "{\"id\":123,\"name\":\"John\"}",
      "time": 245,
      "size": 32
    },
    "timestamp": "2025-10-28T12:05:30.000Z"
  }
]
```

**Data Lifecycle:**
1. **Mount**: Read from localStorage, parse JSON, initialize with empty arrays if none
2. **Update**: Every preset save/delete triggers localStorage write
3. **Request**: Every successful request adds to history (keeps last 50)
4. **Unmount**: Data automatically persisted (no cleanup needed)

## Future Enhancements

### Potential Features (Not Yet Implemented)
1. **Collections**
   - Group related requests into collections
   - Import/export collections as JSON
   - Share collections via URL

2. **Environment Variables**
   - Define variables like `{{API_URL}}` in requests
   - Switch between dev/staging/production environments
   - Secure storage for sensitive tokens

3. **Request Chaining**
   - Extract values from responses (e.g., auth tokens)
   - Use extracted values in subsequent requests
   - Build multi-step API test flows

4. **Code Generation**
   - Generate cURL commands from requests
   - Export as JavaScript fetch/axios code
   - Support for Python, Go, PHP code snippets

5. **WebSocket Support**
   - Test WebSocket connections
   - Send/receive real-time messages
   - Monitor connection status

6. **GraphQL Support**
   - GraphQL query editor with syntax highlighting
   - Variable management
   - Schema introspection

7. **Response Validation**
   - Define expected status codes
   - JSON schema validation
   - Automated test assertions

8. **Performance Testing**
   - Send multiple requests concurrently
   - Measure average response times
   - Stress test endpoints

9. **Request Scheduling**
   - Schedule recurring requests (cron-like)
   - Endpoint monitoring/health checks
   - Alert on failures

10. **Team Collaboration**
    - Cloud sync for presets/collections
    - Share requests with team members
    - Real-time collaboration on API testing

## Integration Notes

### Homepage Integration
- **Category**: Development
- **Icon**: `Terminal` from Lucide
- **Gradient**: Blue to Purple (`from-blue-500 to-purple-500`)
- **Features Listed**:
  1. Test all HTTP methods
  2. Custom headers & auth
  3. Save request presets
  4. View response details

### Navigation Integration
- Added to Sidebar with `Terminal` icon
- Route: `/tools/api-tester`
- Listed under development tools section

### Analytics Integration
- All events prefixed with `api_tester_` for easy filtering
- Metadata includes HTTP method and operation type
- No sensitive data tracked (URLs, tokens, or response bodies excluded)

## Performance Considerations

### Optimization Strategies
1. **Lazy Initialization**: localStorage read only once on mount
2. **Debounced Inputs**: URL and body inputs debounced to prevent excessive re-renders
3. **Memoized Functions**: Request handler and formatters memoized with `useCallback`
4. **Efficient History**: Limited to 50 entries to prevent memory bloat
5. **Streaming Responses**: Large responses handled efficiently with `response.text()`

### Browser Compatibility
- **Fetch API**: Supported in all modern browsers (polyfill available for older browsers)
- **localStorage**: Universal support (fallback to in-memory storage on failure)
- **Performance API**: `performance.now()` for accurate timing
- **Blob API**: For calculating response size
- **Base64 Encoding**: `btoa()` for Basic Auth (polyfill available)

### Security Considerations
- **CORS**: Subject to browser CORS policies (may need CORS proxy for some APIs)
- **Credentials**: Never sent to server (all data stays in browser)
- **HTTPS**: Encourages HTTPS URLs for secure communication
- **XSS Prevention**: Response body sanitized before display
- **localStorage Limits**: ~5MB total (shared across all tools)

## Development Notes

### Common Pitfalls Avoided
- ✅ Used `Headers` object instead of plain objects (proper header handling)
- ✅ Checked response status before parsing JSON (handles error responses)
- ✅ Used `performance.now()` instead of `Date.now()` (sub-millisecond precision)
- ✅ Converted `Headers` to plain object for display (headers not serializable)
- ✅ Limited history to 50 entries (prevents localStorage quota exceeded)
- ✅ Handled network errors with try-catch (prevents unhandled promise rejections)
- ✅ Used `nanoid` for IDs instead of timestamps (prevents collisions)

### Code Quality Metrics
- **Test Coverage**: 45 tests, 100% passing
- **Type Safety**: Full TypeScript with strict mode
- **Linting**: Zero ESLint errors
- **Formatting**: Biome format compliant
- **Build**: Successfully builds for production
- **Bundle Size**: Optimized with code splitting

### Known Limitations
1. **CORS Restrictions**: Cannot bypass browser CORS policies (requires server-side proxy for some APIs)
2. **File Uploads**: Form data doesn't support file uploads yet (only text key-value pairs)
3. **Binary Responses**: Images/PDFs display as base64 text (no preview rendering)
4. **Request Cancellation**: No abort controller for canceling in-flight requests
5. **Streaming Responses**: No support for SSE (Server-Sent Events) or streaming APIs

## Conclusion

The API Request Tester tool provides a complete, browser-based solution for HTTP API testing with:
- Comprehensive support for all HTTP methods and authentication types
- Full request/response inspection with detailed timing and size metrics
- Persistent storage for presets and history via localStorage
- Production-ready code quality with extensive test coverage
- Accessible, responsive UI optimized for developer workflows
- Privacy-focused design with no server-side data storage

This tool serves as a powerful addition to the SuperTool suite, enabling developers to test and debug APIs without leaving their browser or installing additional software.
