# JSON Beautifier Pro - Usage Examples & Guide

**Last Updated:** November 2025  
**Tool URL:** `/tools/json-beautify`

## Table of Contents

1. [Quick Start](#quick-start)
2. [Feature Examples](#feature-examples)
3. [Real-World Use Cases](#real-world-use-cases)
4. [Advanced Techniques](#advanced-techniques)
5. [Keyboard Shortcuts](#keyboard-shortcuts)
6. [Pro Tips](#pro-tips)

---

## Quick Start

### Basic JSON Formatting

**Input (minified):**
```json
{"name":"John Doe","age":30,"email":"john@example.com","address":{"street":"123 Main St","city":"New York","zip":"10001"},"hobbies":["reading","gaming","coding"]}
```

**After Beautify (2 spaces):**
```json
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "zip": "10001"
  },
  "hobbies": [
    "reading",
    "gaming",
    "coding"
  ]
}
```

---

## Feature Examples

### 1. Schema Validation

#### Example: User Profile Validation

**JSON Data:**
```json
{
  "id": 123,
  "name": "Alice Smith",
  "email": "alice@example.com",
  "age": 28,
  "active": true
}
```

**Schema (User Template):**
```json
{
  "type": "object",
  "required": ["id", "name", "email"],
  "properties": {
    "id": { "type": "number" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "age": { "type": "number", "minimum": 0 },
    "active": { "type": "boolean" }
  }
}
```

**Result:** ✅ Valid - All required fields present with correct types

#### Example: API Response Validation

**JSON Data:**
```json
{
  "status": "success",
  "data": {
    "userId": 456,
    "token": "abc123xyz"
  },
  "message": "Login successful",
  "timestamp": "2025-11-08T10:30:00Z"
}
```

**Schema (API Response Template):**
```json
{
  "type": "object",
  "required": ["status", "data"],
  "properties": {
    "status": { "type": "string", "enum": ["success", "error"] },
    "data": { "type": "object" },
    "message": { "type": "string" },
    "timestamp": { "type": "string", "format": "date-time" }
  }
}
```

**Result:** ✅ Valid - Matches API response structure

---

### 2. JSONPath Search

#### Example: Extract User Names

**JSON Data:**
```json
{
  "users": [
    { "id": 1, "name": "Alice", "role": "admin" },
    { "id": 2, "name": "Bob", "role": "user" },
    { "id": 3, "name": "Charlie", "role": "user" }
  ]
}
```

**JSONPath Query:** `$.users[*].name`

**Result:**
```json
["Alice", "Bob", "Charlie"]
```

#### Example: Filter by Price

**JSON Data:**
```json
{
  "store": {
    "book": [
      { "title": "Book A", "price": 8.99 },
      { "title": "Book B", "price": 12.99 },
      { "title": "Book C", "price": 9.50 }
    ]
  }
}
```

**JSONPath Query:** `$.store.book[?(@.price < 10)].title`

**Result:**
```json
["Book A", "Book C"]
```

#### Common JSONPath Patterns

| Pattern | Description | Example |
|---------|-------------|---------|
| `$` | Root element | `$` |
| `$.property` | Direct child | `$.name` |
| `$..property` | Recursive descent | `$..email` |
| `$[0]` | Array index | `$.users[0]` |
| `$[*]` | All array elements | `$.items[*]` |
| `$[?(@.age > 18)]` | Filter expression | `$.users[?(@.age > 18)]` |
| `$..[0]` | First element recursively | `$..items[0]` |

---

### 3. Tree View Visualization

**Perfect for exploring complex nested structures:**

**JSON Data:**
```json
{
  "company": {
    "name": "TechCorp",
    "departments": [
      {
        "name": "Engineering",
        "employees": [
          { "name": "Alice", "title": "Senior Dev" },
          { "name": "Bob", "title": "Junior Dev" }
        ]
      }
    ]
  }
}
```

**Tree View Output:**
```
▼ root
  ▼ company (object)
    ▶ name: "TechCorp" (string)
    ▼ departments (array)
      ▼ [0] (object)
        ▶ name: "Engineering" (string)
        ▼ employees (array)
          ▼ [0] (object)
            ▶ name: "Alice" (string)
            ▶ title: "Senior Dev" (string)
```

**Benefits:**
- Expand/collapse nodes for easier navigation
- Color-coded types (strings, numbers, booleans)
- Path display for each node
- Great for debugging deeply nested APIs

---

### 4. JSON Diff Comparison

#### Example: API Version Comparison

**Version 1 (Original):**
```json
{
  "apiVersion": "v1",
  "endpoint": "/api/users",
  "method": "GET",
  "auth": "token"
}
```

**Version 2 (Updated):**
```json
{
  "apiVersion": "v2",
  "endpoint": "/api/v2/users",
  "method": "GET",
  "auth": "bearer",
  "rateLimit": 100
}
```

**Diff Result:**
```diff
{
-  "apiVersion": "v1",
+  "apiVersion": "v2",
-  "endpoint": "/api/users",
+  "endpoint": "/api/v2/users",
   "method": "GET",
-  "auth": "token"
+  "auth": "bearer",
+  "rateLimit": 100
}
```

**Legend:**
- 🔴 Red (removed): Fields that were deleted
- 🟢 Green (added): New fields
- 🟡 Yellow (modified): Changed values

---

### 5. TypeScript Interface Generator

#### Example: Generate Interface from API Response

**JSON Data:**
```json
{
  "user": {
    "id": 123,
    "username": "alice_smith",
    "email": "alice@example.com",
    "profile": {
      "bio": "Software Engineer",
      "avatar": "https://example.com/avatar.jpg"
    },
    "posts": [
      {
        "id": 1,
        "title": "Hello World",
        "published": true
      }
    ]
  }
}
```

**Generated TypeScript Interface:**
```typescript
interface Root {
  user: User;
}

interface User {
  id: number;
  username: string;
  email: string;
  profile: Profile;
  posts: Post[];
}

interface Profile {
  bio: string;
  avatar: string;
}

interface Post {
  id: number;
  title: string;
  published: boolean;
}
```

**Usage in Code:**
```typescript
// Copy-paste into your TypeScript project
import type { Root, User, Profile, Post } from './types';

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data: Root = await response.json();
  return data.user;
}
```

---

### 6. Advanced Formatting Options

#### Sort Keys Alphabetically

**Before:**
```json
{
  "zebra": "last",
  "apple": "first",
  "mango": "middle"
}
```

**After (Sort Keys enabled):**
```json
{
  "apple": "first",
  "mango": "middle",
  "zebra": "last"
}
```

**Use Case:** Consistent git diffs, easier comparison, standardized configs

#### Customizable Indentation

**2 Spaces (Default):**
```json
{
  "name": "compact",
  "nested": {
    "value": 123
  }
}
```

**4 Spaces:**
```json
{
    "name": "readable",
    "nested": {
        "value": 123
    }
}
```

**8 Spaces:**
```json
{
        "name": "extra-readable",
        "nested": {
                "value": 123
        }
}
```

---

### 7. Sample Data Generator

**From Schema:**
```json
{
  "type": "object",
  "required": ["id", "name"],
  "properties": {
    "id": { "type": "number" },
    "name": { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "active": { "type": "boolean" }
  }
}
```

**Generated Sample:**
```json
{
  "id": 0,
  "name": "Sample string",
  "email": "user@example.com",
  "active": true
}
```

**Use Cases:**
- API documentation examples
- Test data generation
- Schema validation testing
- Mock data for development

---

## Real-World Use Cases

### Use Case 1: Debugging API Responses

**Scenario:** You receive a minified API response and need to understand its structure.

**Steps:**
1. Copy minified JSON from Network DevTools
2. Paste into JSON Beautifier Pro
3. Click "Beautify" (or use 2/4/8 space indentation)
4. Switch to "Tree View" to explore nested structure
5. Use JSONPath to extract specific fields
6. Generate TypeScript interface for type safety

**Example Flow:**
```
Network Tab → Copy Response → Beautify → Tree View → JSONPath → TypeScript
```

---

### Use Case 2: Validating Configuration Files

**Scenario:** Ensure your app's config file matches required schema.

**Steps:**
1. Paste your config JSON
2. Switch to "Schema" tab
3. Load "Config" template or paste custom schema
4. Click "Validate"
5. Fix any validation errors shown

**Example Config:**
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "settings": {
    "debug": true,
    "timeout": 5000
  }
}
```

---

### Use Case 3: Comparing API Versions

**Scenario:** Track changes between API v1 and v2.

**Steps:**
1. Paste v1 JSON in main editor
2. Switch to "Diff" tab
3. Paste v2 JSON in comparison editor
4. Click "Compare"
5. Review highlighted differences
6. Document breaking changes

---

### Use Case 4: Generating Type Definitions

**Scenario:** Create TypeScript types from API documentation.

**Steps:**
1. Copy API response example
2. Paste into JSON Beautifier Pro
3. Switch to "TypeScript" tab
4. Click "Generate Interface"
5. Copy generated TypeScript code
6. Save to `types.ts` in your project

---

### Use Case 5: Testing JSONPath Queries

**Scenario:** Build complex queries for API filtering.

**Steps:**
1. Paste sample API response
2. Switch to "JSONPath" tab
3. Enter query (e.g., `$.users[?(@.age > 18)].name`)
4. View real-time results
5. Refine query until desired output
6. Use in production code

---

## Advanced Techniques

### Technique 1: Recursive Schema Validation

**Validate nested arrays and objects:**

```json
{
  "type": "object",
  "properties": {
    "users": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "name"],
        "properties": {
          "id": { "type": "number" },
          "name": { "type": "string" },
          "posts": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": { "type": "string" },
                "published": { "type": "boolean" }
              }
            }
          }
        }
      }
    }
  }
}
```

---

### Technique 2: Complex JSONPath Filters

**Filter with multiple conditions:**

```javascript
// Users older than 18 AND active
$.users[?(@.age > 18 && @.active == true)]

// Products under $50 OR on sale
$.products[?(@.price < 50 || @.onSale == true)]

// Nested path with condition
$..orders[?(@.status == 'shipped')].items[*].name
```

---

### Technique 3: Batch Processing Workflow

**Process multiple JSON files:**

1. Beautify first JSON
2. Copy formatted output
3. Download as `.json` file
4. Repeat for all files
5. Use diff tool to compare

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + Enter` | Beautify JSON |
| `Cmd/Ctrl + Shift + M` | Minify JSON |
| `Cmd/Ctrl + C` | Copy to clipboard |
| `Cmd/Ctrl + S` | Download as file |
| `Cmd/Ctrl + K` | Sort keys |
| `Cmd/Ctrl + /` | Toggle tree view |

---

## Pro Tips

### Tip 1: Use Tree View for Debugging
When exploring unfamiliar APIs, start with Tree View to understand the structure before writing JSONPath queries.

### Tip 2: Save Common Schemas
Keep frequently used schemas (User, Product, Order) in a text file for quick validation.

### Tip 3: Generate Sample Data First
Before writing production code, generate sample data from your schema to test edge cases.

### Tip 4: Combine Features
Workflow: Beautify → Validate → Sort Keys → Generate TypeScript → Copy

### Tip 5: Use Diff for Regression Testing
Save "golden" API responses and compare against new versions to catch breaking changes.

### Tip 6: JSONPath for Data Extraction
Instead of writing JavaScript `map/filter/reduce`, use JSONPath for quick data extraction.

### Tip 7: Custom Indentation for Teams
Match your team's code style (2 spaces for JS/TS, 4 spaces for Python).

### Tip 8: Validate Before Deployment
Always validate config files against schemas before pushing to production.

---

## Common Errors & Solutions

### Error: "Invalid JSON"
**Solution:** Check for trailing commas, unquoted keys, or single quotes.

### Error: "Schema validation failed"
**Solution:** Review required fields, type mismatches, or missing properties.

### Error: "JSONPath returned empty"
**Solution:** Verify path syntax, check array indices, or simplify query.

### Error: "Cannot generate TypeScript"
**Solution:** Ensure JSON is valid and contains at least one object.

---

## API Integration Examples

### Example: Using Generated Types in React

```typescript
import type { User } from './types';
import { useState, useEffect } from 'react';

function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.username}</h1>
      <p>{user.email}</p>
      <img src={user.profile.avatar} alt={user.username} />
    </div>
  );
}
```

---

## Frequently Asked Questions

**Q: Can I validate against custom schemas?**  
A: Yes! Paste your custom JSON Schema in the Schema tab.

**Q: Does it support JSON5 or comments?**  
A: Currently only standard JSON. JSON5 support coming soon.

**Q: Is my data sent to a server?**  
A: No! All processing happens in your browser locally.

**Q: Can I save my JSONPath queries?**  
A: Queries are saved in local storage automatically.

**Q: What JSONPath syntax is supported?**  
A: Full support via `jsonpath-plus` library with all standard features.

---

**Need help?** Open an issue at https://github.com/sst/opencode

**Report bugs:** Use the feedback form in the tool
