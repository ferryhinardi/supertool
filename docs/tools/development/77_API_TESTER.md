# API Request Tester

## Overview

The API Request Tester is a browser-based HTTP client for testing and debugging REST APIs directly from your browser. It provides a full-featured interface for constructing HTTP requests with custom headers, authentication, query parameters, and request bodies, while visualizing responses with syntax highlighting and performance metrics. The tool includes environment variable support, preset management, and request history tracking for efficient API development workflows.

## Purpose

The API Request Tester serves several critical functions for developers and API consumers:

— **REST API Testing** — Test HTTP endpoints with full control over methods, headers, authentication, and request bodies without installing desktop applications like Postman or Insomnia

— **Authentication Debugging** — Validate API authentication flows including Bearer tokens, Basic Auth, and API key mechanisms with environment variable support for secure token management

— **Response Analysis** — Inspect response headers, status codes, timing metrics, and body content with automatic JSON syntax highlighting for quick debugging

— **Multi-Environment Management** — Test APIs across development, staging, and production environments using variable substitution with {{variableName}} syntax for dynamic configuration

— **Request History & Presets** — Save frequently-used request configurations as presets and access the last 50 requests from history for reproducibility and debugging

— **GraphQL & WebHook Testing** — Test GraphQL queries using POST/JSON requests and debug webhook integrations with custom payload delivery

## Key Features

### 1. HTTP Method Support

The tool supports all seven standard HTTP methods for comprehensive REST API testing:

- **GET** — Retrieve resources with query parameters for filtering, pagination, and sorting
- **POST** — Create new resources with JSON, form-data, or plain text payloads
- **PUT** — Update entire resources with full replacement semantics
- **PATCH** — Apply partial updates to specific resource fields
- **DELETE** — Remove resources with optional confirmation headers
- **HEAD** — Retrieve response headers without body content for metadata inspection
- **OPTIONS** — Discover allowed methods and CORS preflight information

Each method is selected from a dropdown menu and automatically updates the UI to show relevant configuration options (e.g., body editors appear for POST/PUT/PATCH methods).

### 2. Query Parameter Management

Build complex URLs with multiple query parameters using a visual editor:

- **Add/Remove Parameters** — Dynamic parameter rows with key-value input fields
- **Enable/Disable Toggle** — Temporarily disable parameters without deleting them for A/B testing different configurations
- **URL Building** — Automatic URL construction with proper encoding of special characters
- **Parameter Persistence** — Query parameters are saved with presets and history entries

Parameters marked as disabled are grayed out and excluded from the final request URL, allowing quick experimentation with different parameter combinations.

### 3. Custom Headers Configuration

Add custom HTTP headers for API requirements, CORS handling, and content negotiation:

- **Key-Value Editor** — Add unlimited header pairs with enable/disable toggles
- **Common Headers** — Pre-populate headers like `Content-Type`, `Accept`, `User-Agent`
- **Authorization Headers** — Manual header addition for custom authentication schemes
- **Header Validation** — Real-time feedback for invalid header syntax

Headers are merged with authentication headers (from the Auth tab) and automatically include `Content-Type` based on selected body type (JSON, form-data, text).

### 4. Authentication Options

Four authentication methods are supported with secure token storage:

**None** — Public APIs requiring no authentication

**Bearer Token** — JWT and OAuth token-based authentication:
- Token input field with environment variable support ({{API_TOKEN}})
- Automatically adds `Authorization: Bearer <token>` header
- Common for modern REST APIs and OAuth 2.0 flows

**Basic Authentication** — Username/password credentials:
- Separate input fields for username and password
- Automatically encodes credentials as Base64
- Adds `Authorization: Basic <encoded>` header
- Useful for legacy APIs and development environments

**API Key** — Custom header-based authentication:
- Configurable key input field (default header: `X-API-Key`)
- Supports environment variable substitution for key values
- Common for third-party API services (Stripe, SendGrid, Twilio)

All authentication credentials support environment variable substitution and can be marked as secret for privacy.

### 5. Request Body Formats

Four body types accommodate different API requirements:

**None** — GET/DELETE requests without request bodies

**JSON** — Structured data with syntax validation:
- Monaco-style textarea with syntax highlighting (future enhancement)
- Real-time JSON validation before sending
- Automatically sets `Content-Type: application/json` header
- Common for REST APIs and GraphQL queries

**Plain Text** — Raw text payloads:
- Simple textarea for XML, CSV, or custom formats
- Sets `Content-Type: text/plain` header
- Useful for legacy systems or custom protocols

**Form Data (multipart/form-data)** — Key-value pairs for HTML form simulation:
- Dynamic field editor with add/remove functionality
- Sets `Content-Type: multipart/form-data` header
- Currently supports text fields only (file upload planned)
- Common for traditional web forms and file uploads

The tool validates JSON syntax client-side before sending to catch errors early and prevent unnecessary API calls.

### 6. Response Visualization

Comprehensive response display with multiple data points:

**Status Code Badge** — Color-coded by HTTP status:
- 2xx Success → Green
- 3xx Redirect → Blue
- 4xx Client Error → Orange
- 5xx Server Error → Red

**Performance Metrics**:
- Response time in milliseconds (rounded to nearest ms)
- Response size in kilobytes (calculated from response body)
- Both metrics displayed as compact badges next to status code

**Response Headers** — Expandable section showing all headers:
- Key-value display with monospace font for readability
- Common headers like `cache-control`, `content-type`, `set-cookie`
- Useful for debugging CORS, caching, and authentication issues

**Response Body** — Syntax-highlighted content:
- Automatic JSON detection and highlighting using highlight.js
- Plain text fallback for non-JSON responses
- Scrollable container with max-height for large responses
- Monospace font for code readability

**Export Options**:
- Copy to clipboard — One-click copy of response body
- Download as file — Save response as `.txt` file for offline analysis

### 7. Presets System

Save and load request configurations for frequently-used API calls:

**Save Current Request** — Stores complete configuration:
- HTTP method, URL, query parameters
- Headers, authentication settings
- Request body (all formats)
- Preset name for easy identification

**Load Preset** — Restore saved configuration:
- Dropdown selector showing all saved presets
- One-click load populates all fields
- Useful for recurring testing scenarios

**Delete Preset** — Remove outdated configurations:
- Confirmation dialog prevents accidental deletion
- Permanently removes from LocalStorage

**Preset Storage** — Persisted in browser LocalStorage:
- Survives page refreshes and browser restarts
- Limited by browser storage quota (typically 5-10MB)
- No server-side storage (privacy-focused)

Presets are ideal for documenting API workflows, onboarding new team members, and reproducing bugs.

### 8. Request History

Automatic tracking of the last 50 requests with full context:

**History Entry Contents**:
- Request configuration (method, URL, headers, body)
- Response data (status, headers, body, timing)
- Timestamp for chronological ordering

**History Features**:
- **Replay Requests** — Load any historical request to re-execute
- **Compare Responses** — Manually compare current response with historical data
- **Debugging** — Reproduce intermittent issues by replaying exact requests
- **Clear History** — Remove all entries to free up storage

**Storage Management**:
- Circular buffer (FIFO) keeps only last 50 requests
- Oldest entries automatically removed when limit reached
- Stored in LocalStorage with `apiTesterHistory` key

History is invaluable for debugging intermittent failures, documenting API behavior changes, and validating fixes.

### 9. Environment Variables

Dynamic configuration using {{variable}} substitution syntax:

**Variable Definition**:
- Create named environments (dev, staging, production)
- Define key-value pairs for each environment
- Mark variables as secret to hide values (password masking)
- Enable/disable variables without deletion

**Variable Substitution**:
- Use {{VARIABLE_NAME}} in URLs, headers, auth fields, and body content
- Variables replaced before request is sent
- Supports whitespace: {{  VARIABLE_NAME  }} normalizes to {{VARIABLE_NAME}}
- Unused variables pass through unchanged (no error)

**Environment Management**:
- Switch active environment with one click
- Create unlimited environments
- Duplicate environments for configuration testing
- Delete environments with confirmation

**Use Cases**:
- {{BASE_URL}} for environment-specific API endpoints
- {{API_KEY}} for secret tokens
- {{USER_ID}} for dynamic resource IDs
- {{TIMESTAMP}} for cache-busting (manual entry)

Environment variables prevent hardcoding sensitive credentials and enable seamless multi-environment testing.

### 10. Keyboard Shortcuts

Power user features for faster workflows:

**Cmd+Enter / Ctrl+Enter** — Send request:
- Works when URL input is focused
- Bypasses mouse interaction for send button
- Tracks usage with `api_tester_keyboard_shortcut_used` event

Additional shortcuts planned for future releases (preset navigation, tab switching, history access).

### 11. Response Export

Multiple export options for sharing and documentation:

**Copy to Clipboard** — One-click response body copy:
- Uses Clipboard API for instant copy
- Preserves formatting for JSON responses
- Shows success toast notification
- Useful for pasting into bug reports or documentation

**Download as File** — Save response for offline analysis:
- Generates `.txt` file with response body content
- Automatic filename with timestamp
- Preserves exact response content including whitespace
- Useful for large responses or compliance requirements

Both export options track usage with `api_tester_copy_response` analytics event.

## How It Works

The API Request Tester is built as a client-side Next.js page component with React state management. Here's the core request sending logic:

```typescript
// Core request sending function (lines 352-499)
const handleSendRequest = async () => {
  // Validate URL before proceeding
  const trimmedUrl = url.trim()
  if (!trimmedUrl) {
    toast.error('Please enter a valid URL')
    return
  }

  // Reset previous state
  setLoading(true)
  setError(null)
  setResponse(null)

  try {
    // Record start time for performance measurement
    const startTime = performance.now()

    // Build request configuration object
    const requestConfig: RequestInit = {
      method, // GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
      headers: {},
    }

    // Apply variable substitution to URL and all string fields
    const processedUrl = substituteVariables(trimmedUrl)
    const processedHeaders: Record<string, string> = {}

    // Add custom headers from Headers tab (enabled only)
    headers
      .filter((h) => h.enabled && h.key.trim())
      .forEach((h) => {
        // Substitute variables in both key and value
        const key = substituteVariables(h.key.trim())
        const value = substituteVariables(h.value)
        processedHeaders[key] = value
      })

    // Add authentication headers based on selected auth type
    if (authType === 'bearer' && authToken) {
      // Bearer token authentication (JWT, OAuth)
      const token = substituteVariables(authToken)
      processedHeaders['Authorization'] = `Bearer ${token}`
    } else if (authType === 'basic' && authUsername && authPassword) {
      // Basic authentication (username:password Base64 encoded)
      const username = substituteVariables(authUsername)
      const password = substituteVariables(authPassword)
      const credentials = btoa(`${username}:${password}`)
      processedHeaders['Authorization'] = `Basic ${credentials}`
    } else if (authType === 'api-key' && authApiKey) {
      // API key authentication (custom header)
      const apiKey = substituteVariables(authApiKey)
      processedHeaders['X-API-Key'] = apiKey
    }

    // Build request body based on selected body type
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (bodyType === 'json' && bodyJson) {
        // JSON body: validate syntax and set content-type
        try {
          const processedJson = substituteVariables(bodyJson)
          JSON.parse(processedJson) // Validate JSON syntax
          requestConfig.body = processedJson
          processedHeaders['Content-Type'] = 'application/json'
        } catch (e) {
          throw new Error('Invalid JSON syntax in request body')
        }
      } else if (bodyType === 'text' && bodyText) {
        // Plain text body
        requestConfig.body = substituteVariables(bodyText)
        processedHeaders['Content-Type'] = 'text/plain'
      } else if (bodyType === 'form-data') {
        // Form data: build multipart/form-data payload
        const formDataObj = new FormData()
        formData
          .filter((f) => f.key.trim())
          .forEach((f) => {
            const key = substituteVariables(f.key.trim())
            const value = substituteVariables(f.value)
            formDataObj.append(key, value)
          })
        requestConfig.body = formDataObj
        // Note: Content-Type is automatically set by FormData
      }
    }

    // Assign processed headers to request config
    requestConfig.headers = processedHeaders

    // Build final URL with query parameters
    let finalUrl = processedUrl
    const enabledParams = queryParams.filter((p) => p.enabled && p.key.trim())
    if (enabledParams.length > 0) {
      const urlObj = new URL(processedUrl)
      enabledParams.forEach((p) => {
        const key = substituteVariables(p.key.trim())
        const value = substituteVariables(p.value)
        urlObj.searchParams.append(key, value)
      })
      finalUrl = urlObj.toString()
    }

    // Send HTTP request using Fetch API
    const res = await fetch(finalUrl, requestConfig)

    // Calculate response time
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)

    // Parse response headers
    const responseHeaders: Record<string, string> = {}
    res.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })

    // Parse response body (try JSON, fallback to text)
    let responseBody = ''
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      // JSON response: parse and stringify for formatting
      const jsonData = await res.json()
      responseBody = JSON.stringify(jsonData, null, 2)
    } else {
      // Non-JSON response: get as plain text
      responseBody = await res.text()
    }

    // Calculate response size in KB
    const responseSize = new Blob([responseBody]).size / 1024

    // Store response data in state
    const responseData = {
      status: res.status,
      statusText: res.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: responseTime,
      size: responseSize,
    }
    setResponse(responseData)

    // Add to history (keep last 50 requests)
    const historyEntry = {
      id: nanoid(),
      timestamp: Date.now(),
      request: {
        method,
        url: finalUrl,
        headers: processedHeaders,
        body: requestConfig.body || null,
      },
      response: responseData,
    }
    const updatedHistory = [historyEntry, ...history].slice(0, 50)
    setHistory(updatedHistory)
    localStorage.setItem('apiTesterHistory', JSON.stringify(updatedHistory))

    // Track analytics event
    trackToolEvent('api_tester_send_request', {
      method,
      status: res.status,
      time: responseTime,
    })
  } catch (err) {
    // Handle network errors, timeouts, or other failures
    const errorMessage = err instanceof Error ? err.message : 'Request failed'
    setError(errorMessage)
    
    // Track error in analytics
    trackToolEvent('api_tester_send_request', {
      method,
      error: errorMessage,
    })
  } finally {
    setLoading(false)
  }
}
```

**Environment Variable Substitution Logic:**

```typescript
// Variable substitution for environment variables (lines 292-305)
const substituteVariables = (text: string): string => {
  // Return original text if no active environment
  if (!activeEnvironment) return text
  
  let result = text
  // Loop through all enabled variables with non-empty keys
  activeEnvironment.variables
    .filter((v) => v.enabled && v.key.trim())
    .forEach((v) => {
      // Create regex to match {{variableName}} with optional whitespace
      const regex = new RegExp(`{{\\s*${v.key.trim()}\\s*}}`, 'g')
      // Replace all occurrences with variable value
      result = result.replace(regex, v.value)
    })
  
  return result
}
```

**Environment Management Functions:**

```typescript
// Create new environment (lines 308-320)
const createEnvironment = () => {
  const newEnv = {
    id: nanoid(),
    name: 'New Environment',
    variables: [{ key: '', value: '', enabled: true, secret: false }],
  }
  const updated = [...environments, newEnv]
  setEnvironments(updated)
  localStorage.setItem('apiTesterEnvironments', JSON.stringify(updated))
  
  // Track analytics
  trackToolEvent('api_tester_environment_created', { name: newEnv.name })
}

// Update environment properties (lines 322-335)
const updateEnvironment = (id: string, updates: Partial<Environment>) => {
  const updated = environments.map((env) =>
    env.id === id ? { ...env, ...updates } : env
  )
  setEnvironments(updated)
  localStorage.setItem('apiTesterEnvironments', JSON.stringify(updated))
  
  // Track analytics
  trackToolEvent('api_tester_environment_updated', { id })
}

// Delete environment with confirmation (lines 337-350)
const deleteEnvironment = (id: string) => {
  if (!confirm('Delete this environment?')) return
  
  const updated = environments.filter((env) => env.id !== id)
  setEnvironments(updated)
  localStorage.setItem('apiTesterEnvironments', JSON.stringify(updated))
  
  // Clear active environment if deleted
  if (activeEnvironmentId === id) {
    setActiveEnvironmentId(null)
    localStorage.removeItem('apiTesterActiveEnvironment')
  }
  
  // Track analytics
  trackToolEvent('api_tester_environment_deleted', { id })
}
```

The tool uses LocalStorage for persistence, React state for UI reactivity, and the Fetch API for HTTP requests. All string fields support variable substitution, and responses are automatically parsed based on content-type headers.

## Usage Instructions

### Basic Workflow

1. **Enter Request URL** — Type the API endpoint in the URL input field (e.g., `https://api.github.com/users/octocat`)
2. **Select HTTP Method** — Choose from dropdown (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)
3. **Configure Request** — Add query parameters, headers, authentication, or body content using tabs
4. **Send Request** — Click "Send Request" button or press Cmd/Ctrl+Enter
5. **Analyze Response** — View status code, timing, headers, and body with syntax highlighting
6. **Save as Preset** (Optional) — Click "Save Preset" to store configuration for reuse

### Use Case 1: Testing Public REST API

**Scenario**: You need to test a public REST API endpoint to verify it returns expected data and proper status codes. You'll use the JSONPlaceholder API (a free fake REST API for testing) to fetch a blog post by ID.

**Steps**:

1. Open the API Request Tester at `/tools/development/api-tester`
2. Leave HTTP method as **GET** (default)
3. Enter URL: `https://jsonplaceholder.typicode.com/posts/1`
4. Navigate to **Params** tab and add query parameters (optional for this example):
   - Key: `_limit`, Value: `1`, Enabled: ✓
5. Navigate to **Headers** tab and add custom header (optional):
   - Key: `Accept`, Value: `application/json`, Enabled: ✓
6. Leave **Auth** as "None" (public API requires no authentication)
7. Click **Send Request** button or press **Cmd+Enter**
8. Observe response status: **200 OK** with green badge
9. Check response time (typically 100-300ms depending on network)
10. Inspect response body showing JSON with `userId`, `id`, `title`, `body` fields
11. View response headers to see `content-type: application/json; charset=utf-8`
12. Click **Copy** to copy response JSON to clipboard for documentation

**Benefits**:
- Verify API availability and endpoint correctness without installing tools
- Inspect response structure to understand data model before implementation
- Check response headers for caching, content-type, and CORS policies
- Measure API performance with millisecond-precision timing
- Document API behavior with exportable response data
- Test different resource IDs by modifying URL path

### Use Case 2: Authenticated API Testing with Bearer Token

**Scenario**: You're developing a frontend application that needs to call a protected API endpoint requiring JWT authentication. You need to test if your Bearer token works correctly and inspect the authenticated response.

**Steps**:

1. Open **Environments** panel and create new environment named "Development"
2. Add environment variable:
   - Key: `API_TOKEN`, Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your JWT token)
   - Check **Secret** checkbox to mask token value
   - Ensure **Enabled** is checked
3. Activate "Development" environment (green checkmark appears)
4. Set HTTP method to **GET**
5. Enter URL: `https://api.example.com/v1/user/profile` (or use `{{BASE_URL}}/user/profile` with BASE_URL variable)
6. Navigate to **Auth** tab and select **Bearer Token** from dropdown
7. Enter token value: `{{API_TOKEN}}` (references environment variable)
8. Navigate to **Headers** tab and add (if needed):
   - Key: `Accept`, Value: `application/json`, Enabled: ✓
9. Click **Send Request** — tool automatically adds `Authorization: Bearer <token>` header
10. Verify response status: **200 OK** (or **401 Unauthorized** if token invalid/expired)
11. Inspect response body to see user profile data (name, email, permissions, etc.)
12. Check response headers for token expiration hints (`X-Token-Expires-At`)
13. Save as preset: Click **Save Preset**, name it "Get User Profile - Authenticated"

**Benefits**:
- Securely test JWT authentication without exposing tokens in URL or unencrypted files
- Use environment variables to switch between dev/staging/production tokens instantly
- Debug 401/403 errors by inspecting response body for error details
- Verify token payload contains required claims by decoding JWT (use JWT Decoder tool)
- Test token expiration by waiting until expiry time and re-sending request
- Document authentication requirements for API consumers

### Use Case 3: GraphQL API Testing with POST/JSON

**Scenario**: You need to test a GraphQL API endpoint by sending a custom query with variables. GraphQL uses POST requests with JSON bodies containing `query` and `variables` fields.

**Steps**:

1. Set HTTP method to **POST**
2. Enter URL: `https://api.spacex.land/graphql` (public SpaceX GraphQL API)
3. Navigate to **Headers** tab and add:
   - Key: `Content-Type`, Value: `application/json`, Enabled: ✓
   - (Note: Tool auto-sets this for JSON body type, but good practice to verify)
4. Navigate to **Body** tab and select **JSON** from dropdown
5. Enter GraphQL query in JSON format:
   ```json
   {
     "query": "query GetLaunches($limit: Int!) { launches(limit: $limit) { mission_name launch_date_utc rocket { rocket_name } } }",
     "variables": {
       "limit": 5
     }
   }
   ```
6. Click **Send Request** or press **Cmd+Enter**
7. Verify response status: **200 OK**
8. Inspect response body showing nested JSON structure:
   ```json
   {
     "data": {
       "launches": [
         {
           "mission_name": "Starlink-15 (v1.0)",
           "launch_date_utc": "2020-10-24T15:31:00.000Z",
           "rocket": { "rocket_name": "Falcon 9" }
         },
         ...
       ]
     }
   }
   ```
9. Note response time (GraphQL queries can be slower than REST for complex nesting)
10. Save as preset: "SpaceX - Get Recent Launches" for future reference
11. Test error handling by sending invalid query (missing bracket) and observe error response

**Benefits**:
- Test GraphQL APIs without dedicated GraphQL clients (GraphiQL, Insomnia)
- Validate query syntax before integrating into application code
- Inspect nested data structures returned by GraphQL resolvers
- Debug GraphQL errors by examining error messages in response body
- Test query variables to ensure proper parameterization
- Compare GraphQL performance vs REST for same data retrieval

### Use Case 4: Form Data Submission (File Uploads)

**Scenario**: You're testing an API endpoint that accepts `multipart/form-data` submissions, such as a user profile update endpoint that takes text fields (name, email, bio) as key-value pairs.

**Steps**:

1. Set HTTP method to **POST**
2. Enter URL: `https://httpbin.org/post` (test endpoint that echoes form data)
3. Navigate to **Auth** tab and select **API Key** (if required by your API)
   - Enter API key: `test-api-key-12345` or use `{{API_KEY}}` variable
4. Navigate to **Body** tab and select **Form Data** from dropdown
5. Add form fields by clicking **+ Add Field**:
   - Key: `name`, Value: `John Doe`
   - Key: `email`, Value: `john@example.com`
   - Key: `bio`, Value: `Software developer with 5 years experience`
   - Key: `country`, Value: `United States`
6. Verify all fields have checkmarks (enabled)
7. Navigate to **Headers** tab — note that `Content-Type` will be auto-set to `multipart/form-data; boundary=...`
8. Click **Send Request**
9. Verify response status: **200 OK**
10. Inspect response body showing echoed form data under `form` object:
    ```json
    {
      "form": {
        "name": "John Doe",
        "email": "john@example.com",
        "bio": "Software developer with 5 years experience",
        "country": "United States"
      },
      "headers": {
        "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundary..."
      }
    }
    ```
11. Save as preset: "User Profile Update - Form Data" for regression testing

**Benefits**:
- Test form submission endpoints without building HTML forms
- Debug multipart/form-data encoding issues before frontend implementation
- Verify server correctly parses form field keys and values
- Test field validation by submitting invalid data (empty email, long bio)
- Simulate HTML form POST requests for legacy API endpoints
- Note: File upload fields planned for future enhancement (currently text fields only)

### Use Case 5: Multi-Environment Testing (Dev/Staging/Prod)

**Scenario**: You need to test the same API endpoint across development, staging, and production environments to ensure consistency. Each environment has different base URLs and potentially different API keys.

**Steps**:

1. Click **Environments** button to open environment manager
2. Create three environments by clicking **+ Create Environment**:
   
   **Development Environment**:
   - Name: `Development`
   - Variables:
     - Key: `BASE_URL`, Value: `https://dev-api.example.com`, Enabled: ✓
     - Key: `API_KEY`, Value: `dev-key-abc123`, Enabled: ✓, Secret: ✓
   
   **Staging Environment**:
   - Name: `Staging`
   - Variables:
     - Key: `BASE_URL`, Value: `https://staging-api.example.com`, Enabled: ✓
     - Key: `API_KEY`, Value: `staging-key-xyz789`, Enabled: ✓, Secret: ✓
   
   **Production Environment**:
   - Name: `Production`
   - Variables:
     - Key: `BASE_URL`, Value: `https://api.example.com`, Enabled: ✓
     - Key: `API_KEY`, Value: `prod-key-secure456`, Enabled: ✓, Secret: ✓

3. Activate **Development** environment (click radio button)
4. Set HTTP method to **GET**
5. Enter URL: `{{BASE_URL}}/users/123`
6. Navigate to **Auth** tab, select **API Key**, enter: `{{API_KEY}}`
7. Click **Send Request** — tool substitutes dev values before sending
8. Note response status and data from development environment
9. Switch to **Staging** environment (click radio button for Staging)
10. Click **Send Request** again — same request config, but staging URL/key used
11. Compare staging response with dev response (should be similar structure)
12. Switch to **Production** environment and repeat
13. Document any differences in response data between environments

**Benefits**:
- Test same endpoint across all environments without manual URL/key changes
- Prevent accidental production API calls by clearly marking active environment
- Quickly identify environment-specific issues (staging bug vs production bug)
- Onboard new developers by sharing environment configurations
- Ensure API consistency across deployment pipelines
- Reduce human error in copying/pasting environment-specific credentials

### Use Case 6: API Documentation Validation

**Scenario**: You're writing API documentation and need to verify that all documented endpoints work correctly, return proper status codes, and match the examples in the docs.

**Steps**:

1. Open API documentation in separate browser tab
2. Identify first documented endpoint: `GET /api/products` — returns list of products
3. In API Tester, set method to **GET**
4. Enter URL from docs: `https://api.example.com/api/products`
5. Add documented query parameters:
   - Key: `page`, Value: `1`, Enabled: ✓
   - Key: `limit`, Value: `10`, Enabled: ✓
   - Key: `category`, Value: `electronics`, Enabled: ✓
6. Add documented headers:
   - Key: `Accept`, Value: `application/json`, Enabled: ✓
7. Click **Send Request** and verify response matches documented example
8. Check response status: **200 OK** (as documented)
9. Compare response body structure with documented schema (field names, types)
10. Save as preset: "Products - Get List (Page 1)" for quick validation
11. Repeat for next documented endpoint: `POST /api/products` — create product
12. Build request body from documented example:
    ```json
    {
      "name": "Wireless Mouse",
      "category": "electronics",
      "price": 29.99,
      "stock": 150
    }
    ```
13. Send request and verify **201 Created** status
14. Document any discrepancies between API docs and actual behavior (wrong status code, missing fields, etc.)
15. Create preset for each documented endpoint to enable automated regression testing

**Benefits**:
- Catch documentation drift before customers encounter issues
- Validate all example requests/responses in docs are accurate
- Ensure documented error cases (400, 404, 500) are correctly described
- Test edge cases mentioned in documentation (empty lists, pagination boundaries)
- Build confidence in API documentation accuracy
- Create preset library for ongoing documentation validation

### Use Case 7: WebHook Testing and Debugging

**Scenario**: You're integrating a webhook system where your service sends HTTP POST requests to external URLs when events occur. You need to test the webhook payload structure and debug delivery issues.

**Steps**:

1. Go to webhook testing service (e.g., `https://webhook.site`) and copy unique URL
2. In API Tester, set method to **POST**
3. Enter webhook URL: `https://webhook.site/f9e7d8c6-1234-5678-9abc-def012345678`
4. Navigate to **Headers** tab and add:
   - Key: `Content-Type`, Value: `application/json`, Enabled: ✓
   - Key: `X-Webhook-Signature`, Value: `sha256=abc123...`, Enabled: ✓ (if required)
5. Navigate to **Body** tab, select **JSON**, and enter test payload:
   ```json
   {
     "event": "user.created",
     "timestamp": "2025-01-02T10:30:00Z",
     "data": {
       "user_id": 12345,
       "email": "test@example.com",
       "name": "Test User"
     }
   }
   ```
6. Click **Send Request**
7. Verify response status: **200 OK** (webhook.site always returns 200)
8. Switch to webhook.site tab to see received payload
9. Verify payload structure matches what webhook consumer expects
10. Test different event types by modifying `event` field:
    - `user.updated`, `user.deleted`, `order.placed`, etc.
11. Test error handling by sending to invalid URL and observing network error
12. Save as preset: "Webhook Test - User Created Event" for regression testing
13. Add to history for debugging failed webhook deliveries (compare working vs failing payloads)

**Benefits**:
- Debug webhook payload structure before deploying to production
- Verify webhook signature headers are correctly generated
- Test webhook retry logic by simulating failures (invalid URL, timeout)
- Validate webhook receiver correctly parses event types and data fields
- Document webhook payload examples for API consumers
- Reproduce webhook delivery failures by replaying historical requests

## Analytics Events

The tool tracks user interactions for product analytics and feature usage insights:

| Event Name | Trigger | Data Captured |
|------------|---------|---------------|
| `api_tester_open` | Tool page loaded | - |
| `api_tester_keyboard_shortcut_used` | Cmd/Ctrl+Enter pressed | - |
| `api_tester_environment_created` | New environment created | Environment name |
| `api_tester_environment_updated` | Environment modified | Environment ID |
| `api_tester_environment_deleted` | Environment removed | Environment ID |
| `api_tester_environment_duplicated` | Environment cloned | Original environment ID |
| `api_tester_environment_activated` | Environment switched | Environment ID, environment name |
| `api_tester_environment_variable_added` | Variable added to environment | Environment ID |
| `api_tester_send_request` | Request sent (success) | HTTP method, status code, response time (ms) |
| `api_tester_send_request` | Request sent (error) | HTTP method, error message |
| `api_tester_save_preset` | Preset saved | Preset name |
| `api_tester_load_preset` | Preset loaded | Preset ID |
| `api_tester_delete_preset` | Preset deleted | Preset ID |
| `api_tester_copy_response` | Response copied to clipboard | - |
| `api_tester_add_query_param` | Query parameter added | - |
| `api_tester_method_change` | HTTP method changed | New method |
| `api_tester_tab_change` | Tab switched | Tab name (params, auth, headers, body) |
| `api_tester_use_api_key_auth` | API key auth selected | - |

**Privacy Note**: No sensitive data (URLs, tokens, API keys, request/response bodies) is tracked. Only metadata like method, status code, and timing is captured for analytics.

## UI/UX Design

### Interface Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  API Request Tester                                                          │
│  Test REST APIs with custom headers, auth, and request bodies               │
│  [Save Preset] [📋 Presets (5)] [🕐 History (12)] [🌍 Environments (3)]     │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─ Request Configuration ────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  Method: [GET ▼]  URL: [https://api.example.com/users        ] [Send] │  │
│  │                                                                         │  │
│  │  [Params] [Auth] [Headers] [Body]          (Active: Params tab)       │  │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │  │
│  │  │ Query Parameters                                                  │ │  │
│  │  │ ☑ page       1                                          [X]       │ │  │
│  │  │ ☑ limit      10                                         [X]       │ │  │
│  │  │ ☐ filter     active                                     [X]       │ │  │
│  │  │                                              [+ Add Parameter]     │ │  │
│  │  └───────────────────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─ Response ─────────────────────────────────────────────────────────────┐  │
│  │                                                                         │  │
│  │  [200 OK] [45ms] [2.3 KB]                          [Copy] [Download]  │  │
│  │                                                                         │  │
│  │  Response Headers ▼                                                    │  │
│  │  content-type: application/json; charset=utf-8                         │  │
│  │  cache-control: no-cache                                               │  │
│  │  x-ratelimit-remaining: 4999                                           │  │
│  │                                                                         │  │
│  │  Response Body                                                         │  │
│  │  ┌───────────────────────────────────────────────────────────────────┐ │  │
│  │  │ {                                                                 │ │  │
│  │  │   "id": 1,                                                        │ │  │
│  │  │   "name": "John Doe",                                             │ │  │
│  │  │   "email": "john@example.com",                                    │ │  │
│  │  │   "role": "admin"                                                 │ │  │
│  │  │ }                                                                 │ │  │
│  │  └───────────────────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌─ Features ─────────────────────────────────────────────────────────────┐  │
│  │  • 7 HTTP methods (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)      │  │
│  │  • Bearer, Basic, and API Key authentication                          │  │
│  │  • Environment variables with {{variable}} syntax                     │  │
│  │  • Request history (last 50 requests)                                 │  │
│  │  • Preset management for frequently-used requests                     │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Visual Design Details

**Color Scheme**:
- **Status Badges**:
  - 2xx Success: Green background (`bg-green-500/20`), green text (`text-green-400`)
  - 3xx Redirect: Blue background (`bg-blue-500/20`), blue text (`text-blue-400`)
  - 4xx Client Error: Orange background (`bg-orange-500/20`), orange text (`text-orange-400`)
  - 5xx Server Error: Red background (`bg-red-500/20`), red text (`text-red-400`)
- **Header Gradient**: Blue → Cyan → Teal (`from-blue-600 via-cyan-600 to-teal-600`)
- **Cards**: Dark glassmorphic with backdrop blur (`bg-black/40`, `backdrop-blur-sm`)
- **Borders**: Subtle white borders (`border-white/10`)

**Typography**:
- Headers: Bold, large font sizes (`text-3xl`, `font-bold`)
- Code/Monospace: Response body and headers use `font-mono` for readability
- Input Fields: Regular weight with adequate padding for touch targets

**Interactive Elements**:
- **Buttons**: Rounded corners (`rounded-lg`), hover effects (`hover:bg-white/5`)
- **Tabs**: Active tab highlighted with cyan underline and brighter text
- **Toggle Checkboxes**: Enabled = green checkmark, disabled = gray with strikethrough
- **Dropdowns**: Chevron icons indicating expandable sections

**Syntax Highlighting**:
- Uses `highlight.js` library with `github-dark` theme
- JSON keys in purple, strings in green, numbers in orange, booleans in blue
- Automatic language detection based on response content-type

**Responsive Design**:
- Mobile: Stacked layout with full-width cards, larger touch targets (48px minimum)
- Tablet: Two-column layout for request/response side-by-side
- Desktop: Wider input fields, more compact spacing for efficiency

## Performance Optimizations

The tool implements several techniques for optimal performance:

1. **Client-side JSON Validation** — Parse JSON request body before sending to catch syntax errors early and prevent unnecessary network requests. Uses `JSON.parse()` with try/catch to validate structure.

2. **LocalStorage Caching** — Persist presets, history (last 50 items only), and environments in browser LocalStorage for instant load on page refresh. History uses circular buffer to prevent unbounded growth and memory bloat.

3. **Lazy Syntax Highlighting** — Response body highlighting uses `useMemo` hook (lines 616-626) to recompute only when response changes, avoiding expensive re-renders on unrelated state updates.

4. **History Limit Enforcement** — Automatic truncation to last 50 requests (line 214) prevents LocalStorage quota exhaustion and maintains fast history search/display performance.

5. **Keyboard Shortcuts** — Cmd/Ctrl+Enter shortcut allows power users to send requests without mouse interaction, reducing friction for repetitive testing workflows.

6. **Efficient State Updates** — React state management with selective component re-renders prevents full page reflows when updating individual form fields or toggling parameters.

7. **Response Size Tracking** — Calculate response payload size in KB (lines 458, 2138) to help users identify oversized responses that may cause performance issues in production apps.

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 90+ | Full | Recommended, all features work including Clipboard API and Fetch |
| Edge 90+ | Full | Chromium-based, full feature parity with Chrome |
| Firefox 88+ | Full | Requires Fetch API support, minor CSS differences in backdrop-filter |
| Safari 14+ | Full | Some CORS limitations due to stricter security policies |
| Opera 76+ | Full | Chromium-based, identical behavior to Chrome |

**Minimum Requirements**:
- Fetch API for HTTP requests
- LocalStorage API for persistence (minimum 5MB quota)
- Clipboard API for copy-to-clipboard functionality (requires HTTPS)
- CSS `backdrop-filter` for glassmorphic UI effects (graceful degradation)
- JavaScript enabled (no fallback for disabled JS)

**Known Limitations**:
- Safari may require user gesture for clipboard access (must click button, keyboard shortcut may fail)
- Private/Incognito mode: LocalStorage may not persist after browser close
- CORS restrictions apply (cannot bypass same-origin policy unlike Postman)

## Common Questions

**Why does my request fail with CORS error when Postman works?**

Browsers enforce CORS (Cross-Origin Resource Sharing) security policies that desktop tools like Postman bypass. CORS errors occur when the API server doesn't include `Access-Control-Allow-Origin` headers allowing your browser's origin. To fix: 1) Ask API provider to add CORS headers, 2) Use a CORS proxy for development (not recommended for production), 3) Test from same origin as API, or 4) Use Postman for development and the browser tool for production testing where CORS is properly configured.

**Where is my data stored? Is it safe?**

All presets, history, and environments are stored exclusively in your browser's LocalStorage—never transmitted to any server. Data persists across page refreshes but is local to your device and browser profile. Clearing browser data or using Incognito mode will erase stored data. For sensitive APIs, clear history after testing and use environment variables marked as "secret" to mask tokens in the UI.

**Can I test authenticated APIs?**

Yes, the tool supports four authentication methods: Bearer Token (JWT/OAuth), Basic Authentication (username/password), API Key (custom header), and manual custom headers. Use environment variables to store sensitive tokens securely with password masking. Authentication credentials are added as headers automatically before sending requests.

**Does it support file uploads?**

Partially. The form-data body type currently supports text key-value pairs only. Binary file uploads with `<input type="file">` are planned for a future enhancement. Workaround: Use Base64-encoded file content as a text field value (not ideal for large files).

**How do environment variables work?**

Create named environments (dev, staging, production) and define key-value pairs. Use `{{VARIABLE_NAME}}` syntax in URLs, headers, auth fields, or request bodies. The tool replaces all variable placeholders with actual values from the active environment before sending requests. Variables can be marked as "secret" to hide values behind password dots in the UI.

**Can I import/export my presets?**

Not currently. Presets are stored in LocalStorage as JSON and can be manually copied via browser DevTools (`localStorage.getItem('apiTesterPresets')`). Future enhancement will add JSON export/import buttons for easier sharing and backup.

**Does it support WebSockets?**

No, the tool only supports HTTP/HTTPS requests using the Fetch API. WebSocket protocol requires different connection handling (persistent bidirectional communication). WebSocket support is planned as a future enhancement with separate UI for connection management and message streaming.

**How to test GraphQL APIs?**

Use POST method with JSON body type. Set URL to GraphQL endpoint (e.g., `https://api.example.com/graphql`). In the body, include `query` and optional `variables` fields as JSON:
```json
{
  "query": "query { users { id name } }",
  "variables": { "limit": 10 }
}
```
Set `Content-Type: application/json` header (auto-set for JSON body). Send request and inspect nested JSON response.

**Are there any rate limiting concerns?**

The tool has no built-in rate limiting or request throttling. If you test rate-limited APIs (e.g., 100 requests/hour), you're responsible for tracking usage. The API server will return 429 (Too Many Requests) status when limit exceeded. Use response headers like `X-RateLimit-Remaining` to monitor quota. Future enhancement may add rate limit tracking and warnings.

**Is it safe to store API tokens?**

Tokens stored in environment variables remain in browser LocalStorage only—never sent to external servers. However, LocalStorage is accessible to any JavaScript running on the same origin (XSS risk). Best practices: 1) Use "secret" toggle to hide values in UI, 2) Clear sensitive environments after testing, 3) Use short-lived tokens (JWT with expiration), 4) Avoid storing production tokens in development browsers, 5) Use Incognito mode for highly sensitive APIs.

**Can I share presets with my team?**

Not directly in the current version. Workaround: 1) Manually copy preset JSON from LocalStorage, 2) Share JSON file with team, 3) Team members paste into their LocalStorage. Future enhancement will add export/import buttons and team workspace features for collaborative preset management.

**How are request timeouts handled?**

The tool uses browser's default Fetch API timeout (typically 30 seconds for most browsers). There's no custom timeout configuration yet. If a request takes >30s, the browser aborts with a network error. Future enhancement will add configurable timeout setting and manual abort button for long-running requests.

**Can it handle binary responses (images, PDFs)?**

Not currently. The tool displays response body as text (JSON or plain text). Binary responses will show as unreadable characters. Future enhancement will detect binary content-types and provide download option instead of displaying. Workaround: Use "Download" button to save binary response as file.

**Does it support client certificates?**

No, browser Fetch API doesn't support client certificate authentication. This is a browser security limitation, not a tool limitation. Desktop tools like Postman can configure client certs because they use native HTTP libraries. For mTLS (mutual TLS) testing, use Postman or curl from command line.

**Can I configure a proxy?**

No custom proxy configuration. The tool uses whatever proxy is configured in your browser/system settings. If your browser routes traffic through a corporate proxy, requests will automatically use it. Custom proxy headers (X-Forwarded-For) can be added manually in the Headers tab.

**Can I test localhost APIs?**

Yes, if your browser allows it. `http://localhost:3000` works in most browsers. However, HTTPS localhost may require accepting self-signed certificate warnings. CORS still applies—your localhost API must include proper CORS headers if the tool is served from a different origin (e.g., production domain accessing local API).

**How does it compare to Postman/Insomnia?**

The tool is a lightweight browser-based alternative for quick API testing without installing desktop applications. Advantages: instant access, no installation, shareable via URL. Limitations: fewer features (no collections, no automated testing, no team sync), browser CORS restrictions, no native OS integrations. Best for: rapid testing, documentation validation, learning APIs. Use Postman/Insomnia for: complex workflows, team collaboration, automated testing.

**Can I export requests as cURL commands?**

Not yet. This is a highly-requested feature planned for the next release. The export will generate executable cURL commands including all headers, auth, and body content for easy sharing with teammates or use in terminal/scripts.

**Does it support collections or folders?**

No organizational structure yet. Presets are displayed as a flat list. Future enhancement will add folder/tag system for grouping related requests (e.g., "User API", "Payment API", "Auth Endpoints").

**Can it do automated/performance testing?**

No. The tool is designed for manual single-request testing only. It doesn't support batch request execution, performance benchmarking, or automated test assertions. For automated testing, use tools like Postman Collections with Newman, or Playwright/Cypress for integration testing. Future enhancement may add bulk request runner for simple load testing.

**What happens to history when I close the browser?**

History persists in LocalStorage and survives browser restarts. However, clearing browser data or using Incognito/Private mode will erase history when the session ends. History is stored per browser profile—switching Chrome profiles or browsers shows different history.

**Can I use variables in headers?**

Yes, all header values support `{{VARIABLE_NAME}}` syntax. Common use case: `Authorization: Bearer {{ACCESS_TOKEN}}` where ACCESS_TOKEN is defined in active environment. Both header keys and values support variable substitution.

**How to test APIs requiring cookies?**

The tool automatically includes cookies from the same origin in requests (standard browser behavior). For cross-origin requests, cookies are only included if the API server returns `Access-Control-Allow-Credentials: true` header and the request sets `credentials: 'include'` (not currently configurable). For custom cookie testing, add `Cookie` header manually (may be blocked by some browsers for security).

**Does it follow redirects?**

Yes, Fetch API automatically follows 3xx redirects (301, 302, 307, 308) up to a maximum of 20 redirects. The final response shown is after all redirects are resolved. To inspect redirect chain, use browser DevTools Network tab while sending request. Future enhancement may add option to disable auto-follow for debugging redirect logic.

**Can I see raw request details?**

Not in the UI currently. To inspect raw HTTP request (headers, body, method), open browser DevTools → Network tab → send request → click request → view Headers/Payload tabs. Future enhancement will add "Request Details" panel showing exact request that was sent including all substituted variables.

## Future Enhancements

### High Priority (User-Requested Features)

1. **Collection Folders** — Organize presets into hierarchical folders/tags (Projects, Modules, APIs) for better management at scale
2. **Import/Export Presets** — JSON file format for backing up presets and sharing with team members via file upload/download
3. **cURL Command Generator** — Copy request as executable cURL/wget/HTTPie command for terminal usage or script integration
4. **Request Chaining** — Use response data from one request as variables in subsequent requests (e.g., extract token from login response)
5. **Mock Server Integration** — Create mock API endpoints that return predefined responses for frontend development without backend
6. **GraphQL Schema Explorer** — Introspection support with schema browser, autocomplete for queries, and inline documentation
7. **WebSocket Support** — Test real-time bidirectional communication with message history and connection state management
8. **Response Comparison** — Diff tool for comparing current response with previous responses to detect API changes
9. **API Documentation Generator** — Export presets as OpenAPI/Swagger specification for auto-generating API documentation
10. **Team Collaboration** — Cloud sync for shared workspaces, real-time collaboration, and centralized preset management

### Medium Priority (Nice-to-Have Features)

11. **Code Generation** — Generate HTTP request code in multiple languages (Python `requests`, JavaScript `fetch`, Ruby `net/http`, Go `http`, Java `HttpClient`)
12. **Request Templates** — Pre-built templates for popular APIs (Stripe, Twilio, SendGrid, GitHub, AWS) with variable placeholders
13. **Test Assertions** — Add validation rules for response status, body content, headers (e.g., assert status == 200, assert body.userId > 0)
14. **Performance Metrics Dashboard** — Charts showing response time trends, success rates, and error frequency over time
15. **Bulk Request Execution** — Run multiple requests sequentially or in parallel with result aggregation and error reporting
16. **Response Filtering/Search** — JSONPath or regex-based filtering to search/extract specific fields from large JSON responses
17. **Dark/Light Theme Toggle** — User preference for light mode (currently dark-only) with system theme auto-detection
18. **Auto-save Drafts** — Automatically save in-progress requests to prevent data loss on accidental tab close or browser crash
19. **Keyboard Shortcut Customization** — Allow users to define custom hotkeys for send request, save preset, switch tabs, etc.
20. **Request Duplication** — Clone existing request with one click for quick modification and testing variations

### Low Priority (Polish & UX Improvements)

21. **Response History Comparison** — Compare current response with any historical response side-by-side with diff highlighting
22. **Custom Syntax Themes** — User-selectable highlight.js themes (Monokai, Dracula, Solarized) for response body syntax highlighting
23. **Plugin System** — Extension API for custom functionality (custom auth methods, response processors, exporters)
24. **API Monitoring** — Scheduled requests with uptime tracking, alert notifications, and status page generation
25. **Scheduled Requests** — Cron-based automated testing that runs requests at specified intervals (hourly, daily, weekly)
26. **AI-Powered Request Suggestions** — Smart autocomplete for headers, authentication, and common parameters based on URL domain
27. **Markdown Documentation Export** — Generate markdown files from presets with examples and descriptions for API documentation
28. **Request Versioning** — Track changes to saved presets over time with version history and rollback capability
29. **API Changelog Tracking** — Monitor API response structure changes over time to detect breaking changes early
30. **Integration Testing Suite** — Multi-step test scenarios with conditional logic and assertions for end-to-end API testing

### Technical Debt & Infrastructure

31. **IndexedDB for Large Responses** — Replace LocalStorage with IndexedDB for storing large response bodies (>5MB) without quota issues
32. **Service Worker for Caching** — Offline support for tool UI, faster load times, and background request scheduling
33. **WebAssembly for JSON Parsing** — Use WASM-based JSON parser for 2-5x faster parsing of large responses (>1MB)
34. **Streaming Response Support** — Handle chunked transfer encoding and display response body progressively as data arrives
35. **Request Cancellation** — Abort in-flight requests with manual cancel button to prevent unnecessary waiting
36. **Response Compression Support** — Automatic decompression of gzip/brotli responses with original/compressed size comparison
37. **HTTP/2 Testing** — Support for HTTP/2 features like server push, multiplexing, and header compression visualization
38. **Certificate Pinning** — Enhanced security for sensitive APIs by validating server certificate fingerprints
39. **Proxy Configuration UI** — Custom proxy settings with authentication for testing APIs through corporate proxies
40. **VPN Detection** — Warn users when VPN/proxy is active and may affect request behavior or performance

## Related Tools

The following SuperTool utilities complement the API Request Tester:

1. **JWT Decoder** — Decode and inspect JWT tokens used in Bearer authentication to verify claims, expiration, and payload structure
2. **JSON Formatter** — Format, validate, and minify JSON request/response bodies for readability and syntax checking
3. **Base64 Encoder/Decoder** — Encode/decode Basic Auth credentials, encode file content for JSON payloads, decode Base64 responses
4. **Hash Generator** — Create HMAC signatures for API authentication, generate SHA256/MD5 hashes for request verification
5. **Timestamp Converter** — Parse and format timestamps in API responses, convert between ISO 8601, Unix epoch, and human-readable formats
6. **Webhook Tester** — Receive and inspect webhook payloads sent by external services, useful for debugging webhook integrations

## Tips & Best Practices

💡 Use environments to separate dev/staging/production configurations and prevent accidental production API calls

💡 Save frequently-used requests as presets for quick access and consistent testing workflows

💡 Test with invalid data first (malformed JSON, missing required fields) to verify error handling before testing success cases

💡 Always check response headers for debugging clues like rate limits (`X-RateLimit-Remaining`), cache headers (`Cache-Control`), and authentication details

💡 Use Cmd/Ctrl+Enter keyboard shortcut for faster testing workflow instead of clicking the send button repeatedly

💡 Enable/disable query parameters to test different scenarios without deleting them, useful for A/B testing parameter combinations

💡 Store sensitive tokens in environment variables, not directly in request fields, to prevent accidental exposure

💡 Mark environment variables as secret to hide values from view and screen recordings during demos

💡 Use descriptive names for presets like "User Login - Success Case" or "Product Create - Invalid Price Error" for easy identification

💡 Test error scenarios (400/500 responses) as thoroughly as success cases to ensure proper error handling

💡 Verify Content-Type headers match your body type (application/json for JSON, multipart/form-data for form data)

💡 Copy cURL commands for sharing with teammates who prefer command-line tools (future feature)

💡 Download large responses instead of viewing in browser to prevent browser slowdown or memory issues

💡 Clear history regularly to maintain performance—the 50-item limit helps, but manual clearing ensures fast operation

💡 Duplicate environments when testing configuration changes to preserve working configurations as backups

💡 Use {{variables}} for dynamic values like timestamps (`{{TIMESTAMP}}`), UUIDs (`{{REQUEST_ID}}`), or random values (manual entry)

💡 Test CORS before deploying frontend—browser restrictions differ from Postman, may require server-side CORS header changes

💡 Validate JSON syntax before sending to avoid 400 errors from server—the tool validates client-side first

💡 Check response time metrics to identify slow endpoints that may need optimization or caching

💡 Test with all relevant HTTP methods, not just GET/POST—some APIs require PUT for updates, PATCH for partial updates

💡 Use form-data body type for simulating HTML form submissions, especially for legacy APIs expecting `application/x-www-form-urlencoded`

💡 Test authentication flow before building complex requests—verify tokens work with simple GET request first

💡 Keep presets organized by feature/module for easier navigation (use naming convention like "FeatureName - Action - Scenario")

💡 Use history to reproduce and debug intermittent issues—replay exact request that failed in production

💡 Monitor response sizes to identify oversized payloads that may cause performance issues in production apps (aim for <100KB per response)

💡 Create a "Health Check" preset for each environment to quickly verify API availability before detailed testing

💡 Use the Params tab instead of manually building query strings—automatic URL encoding prevents syntax errors

💡 Add `Accept` header to specify response format preference (e.g., `Accept: application/json` to ensure JSON responses)

💡 Test pagination by incrementing `page` parameter and verifying consistent response structure across pages

💡 Document API quirks in preset names (e.g., "User Create - Requires Lowercase Email") for team knowledge sharing

---

**Route**: `/tools/development/api-tester`  
**Component**: `app/tools/development/api-tester/page.tsx`  
**Dependencies**: `framer-motion`, `highlight.js`, `lucide-react`, `nanoid`, `sonner`  
**Test Coverage**: 0% (no tests currently exist)  
**Last Updated**: January 2, 2025
