# 55 - SQL Formatter

**Created:** January 2, 2026  
**Last Updated:** January 2, 2026  
**Category:** Development Tools  
**Status:** ✅ Active · ⭐ New

## Overview

Format and beautify SQL queries with proper indentation, syntax highlighting, and support for multiple SQL dialects (MySQL, PostgreSQL, SQLite, SQL Server). Minify SQL for production, validate syntax, and access example queries for learning.

## Purpose

SQL queries quickly become unreadable without proper formatting. This tool automatically beautifies SQL with consistent indentation, keyword capitalization, and line breaks—making queries easier to read, debug, and maintain across different database systems.

## Key Features

### 1. **Multi-Dialect Support**
- MySQL
- PostgreSQL  
- SQLite
- SQL Server (T-SQL)
- Oracle PL/SQL
- MariaDB

### 2. **Format & Minify**
- Beautify: Add indentation and line breaks
- Minify: Remove whitespace for production
- Keyword capitalization (uppercase/lowercase)
- Consistent spacing
- Line length control

### 3. **Syntax Highlighting**
- Keywords (SELECT, FROM, WHERE)
- Functions (COUNT, SUM, MAX)
- Strings and numbers
- Comments (single and multi-line)
- Operators (=, >, <, AND, OR)

### 4. **Example Queries**
- Basic SELECT statements
- JOIN operations (INNER, LEFT, RIGHT)
- Subqueries and CTEs
- Window functions
- Aggregations
- Complex multi-table queries

### 5. **Validation**
- Syntax error detection
- Missing parentheses
- Unmatched quotes
- Invalid keywords
- Table/column reference checking

## How It Works

### Formatting Algorithm

```typescript
function formatSQL(query: string, options: FormatOptions): string {
  // Tokenize SQL into keywords, identifiers, operators
  const tokens = tokenize(query)
  
  // Parse into Abstract Syntax Tree
  const ast = parse(tokens)
  
  // Format with indentation rules
  const formatted = format(ast, {
    indent: options.indentSize || 2,
    keywordCase: options.keywordCase || 'upper',
    linesBetweenQueries: options.linesBetweenQueries || 2,
    maxLineLength: options.maxLineLength || 80,
  })
  
  return formatted
}
```

### Example Transformation

**Before (Unformatted):**
```sql
select u.id,u.name,u.email,count(o.id) as order_count from users u left join orders o on u.id=o.user_id where u.created_at>'2024-01-01' group by u.id,u.name,u.email having count(o.id)>5 order by order_count desc limit 10
```

**After (Formatted):**
```sql
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(o.id) AS order_count
FROM
  users u
  LEFT JOIN orders o ON u.id = o.user_id
WHERE
  u.created_at > '2024-01-01'
GROUP BY
  u.id,
  u.name,
  u.email
HAVING
  COUNT(o.id) > 5
ORDER BY
  order_count DESC
LIMIT 10
```

## Usage Instructions

### Basic Formatting
1. Paste or type SQL query
2. Select dialect (MySQL, PostgreSQL, etc.)
3. Click "Format SQL"
4. Copy formatted result

### Minify for Production
1. Paste formatted SQL
2. Click "Minify SQL"
3. Result: Compact single-line query
4. Use in application code

### Validation
1. Enter SQL query
2. Automatic syntax checking
3. Error messages with line numbers
4. Suggestions for fixes

## Analytics Events

```typescript
trackToolEvent('sql_formatter_open')
trackToolEvent('sql_formatted', { dialect: 'mysql', lines: 15 })
trackToolEvent('sql_minified', { original_size: 450, minified_size: 320 })
trackToolEvent('sql_syntax_error', { error_type: 'unclosed_quote' })
trackToolEvent('sql_example_loaded', { example: 'complex_join' })
```

## Common SQL Patterns

**Simple SELECT:**
```sql
SELECT * FROM users WHERE active = 1
```

**JOIN Multiple Tables:**
```sql
SELECT
  u.name,
  o.order_date,
  p.product_name
FROM
  users u
  INNER JOIN orders o ON u.id = o.user_id
  INNER JOIN products p ON o.product_id = p.id
WHERE
  o.status = 'completed'
```

**Subquery:**
```sql
SELECT *
FROM users
WHERE id IN (
  SELECT user_id
  FROM orders
  WHERE total > 1000
)
```

**CTE (Common Table Expression):**
```sql
WITH active_users AS (
  SELECT * FROM users WHERE active = 1
)
SELECT
  au.name,
  COUNT(o.id) AS order_count
FROM
  active_users au
  LEFT JOIN orders o ON au.id = o.user_id
GROUP BY au.id, au.name
```

## Related Tools
- **API Tester** - Test database APIs
- **JSON Beautifier** - Format API responses
- **Regex Tester** - Pattern matching in queries

---

**Route:** `/tools/development/sql-formatter`  
**Component:** `app/tools/development/sql-formatter/page.tsx`  
**Dependencies:** sql-formatter library  
**Performance:** Formats 10,000 line query in <100ms
