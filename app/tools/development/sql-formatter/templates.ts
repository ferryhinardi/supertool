// SQL Formatter Templates and Utilities

export type SQLDialect = 'standard' | 'mysql' | 'postgresql' | 'sqlite' | 'sqlserver'

export interface FormatOptions {
  dialect: SQLDialect
  indentSize: number
  uppercaseKeywords: boolean
}

export interface SQLDialectOption {
  value: SQLDialect
  label: string
}

export interface SQLExample {
  name: string
  sql: string
}

// SQL Dialects
export const SQL_DIALECTS: SQLDialectOption[] = [
  { value: 'standard', label: 'Standard SQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'sqlserver', label: 'SQL Server (T-SQL)' },
]

// SQL Keywords (common across dialects)
const SQL_KEYWORDS = [
  // DML
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'FULL',
  'OUTER',
  'CROSS',
  'ON',
  'AS',
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'IS',
  'NULL',
  'INSERT',
  'INTO',
  'VALUES',
  'UPDATE',
  'SET',
  'DELETE',
  // DDL
  'CREATE',
  'ALTER',
  'DROP',
  'TABLE',
  'INDEX',
  'VIEW',
  'DATABASE',
  'SCHEMA',
  'PRIMARY',
  'KEY',
  'FOREIGN',
  'REFERENCES',
  'UNIQUE',
  'CHECK',
  'DEFAULT',
  'CONSTRAINT',
  'AUTO_INCREMENT',
  'IDENTITY',
  // Types
  'INT',
  'INTEGER',
  'VARCHAR',
  'CHAR',
  'TEXT',
  'DATE',
  'DATETIME',
  'TIMESTAMP',
  'TIME',
  'BOOLEAN',
  'BOOL',
  'DECIMAL',
  'NUMERIC',
  'FLOAT',
  'DOUBLE',
  'REAL',
  'BIGINT',
  'SMALLINT',
  'TINYINT',
  'BLOB',
  'CLOB',
  // Aggregate
  'COUNT',
  'SUM',
  'AVG',
  'MIN',
  'MAX',
  'GROUP',
  'BY',
  'HAVING',
  'ORDER',
  'ASC',
  'DESC',
  'LIMIT',
  'OFFSET',
  'DISTINCT',
  'ALL',
  // Other
  'UNION',
  'INTERSECT',
  'EXCEPT',
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'CAST',
  'CONVERT',
  'COALESCE',
  'NULLIF',
  'BEGIN',
  'COMMIT',
  'ROLLBACK',
  'TRANSACTION',
  'SAVEPOINT',
  'GRANT',
  'REVOKE',
  'PRIVILEGES',
]

// Example SQL Queries
export const SQL_EXAMPLES: SQLExample[] = [
  {
    name: 'Basic SELECT',
    sql: 'select id,name,email from users where status="active" and age>=18 order by name',
  },
  {
    name: 'JOIN',
    sql: 'select u.name,o.total from users u inner join orders o on u.id=o.user_id where o.status="completed"',
  },
  {
    name: 'Subquery',
    sql: 'select * from products where price>(select avg(price) from products) order by price desc',
  },
  {
    name: 'CREATE TABLE',
    sql: 'create table employees(id int primary key auto_increment,name varchar(100) not null,email varchar(100) unique,salary decimal(10,2),hire_date date)',
  },
  {
    name: 'INSERT',
    sql: 'insert into users(name,email,age)values("John Doe","john@example.com",30),("Jane Smith","jane@example.com",25)',
  },
  {
    name: 'UPDATE',
    sql: 'update orders set status="shipped",shipped_at=now() where id in(select order_id from shipments where shipped_date=current_date)',
  },
]

/**
 * Format SQL query with proper indentation and line breaks
 */
export function formatSQL(sql: string, options: FormatOptions): string {
  if (!sql.trim()) {
    throw new Error('SQL query cannot be empty')
  }

  let formatted = sql.trim()

  // Remove extra whitespace
  formatted = formatted.replace(/\s+/g, ' ')

  // Handle keywords based on case preference
  const _keywords = options.uppercaseKeywords
    ? SQL_KEYWORDS
    : SQL_KEYWORDS.map((k) => k.toLowerCase())
  const keywordPattern = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi')

  formatted = formatted.replace(keywordPattern, (match) => {
    return options.uppercaseKeywords ? match.toUpperCase() : match.toLowerCase()
  })

  const indent = ' '.repeat(options.indentSize)
  let indentLevel = 0
  let result = ''

  // Keywords that increase indent
  const _indentIncrease = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'INNER JOIN',
    'LEFT JOIN',
    'RIGHT JOIN',
    'ON',
    'GROUP BY',
    'ORDER BY',
    'HAVING',
    'UNION',
    'CASE',
  ]
  // Keywords that decrease indent
  const _indentDecrease = [')', 'END']
  // Keywords that should be on new lines
  const newLineKeywords = [
    'SELECT',
    'FROM',
    'WHERE',
    'JOIN',
    'INNER',
    'LEFT',
    'RIGHT',
    'FULL',
    'CROSS',
    'ON',
    'GROUP',
    'ORDER',
    'HAVING',
    'UNION',
    'AND',
    'OR',
    'CASE',
    'WHEN',
    'THEN',
    'ELSE',
    'END',
    'INSERT',
    'UPDATE',
    'DELETE',
    'CREATE',
    'ALTER',
    'DROP',
  ]

  const tokens = formatted.split(/\s+/)

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const upperToken = token.toUpperCase()

    // Check if token is a major keyword that needs new line
    if (newLineKeywords.includes(upperToken) && i > 0) {
      // Special handling for AND/OR - only new line if not in parentheses
      if (['AND', 'OR'].includes(upperToken)) {
        result += '\n' + indent.repeat(indentLevel) + token + ' '
      } else if (['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS'].includes(upperToken)) {
        // Handle JOIN keywords
        result += '\n' + indent.repeat(indentLevel) + token + ' '
      } else if (upperToken === 'ON' && tokens[i - 1]?.toUpperCase() === 'JOIN') {
        result += token + ' '
      } else {
        if (['FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING'].includes(upperToken)) {
          result += '\n' + indent.repeat(indentLevel) + token + ' '
        } else {
          result += token + ' '
        }
      }
    } else {
      result += token + ' '
    }

    // Handle indentation
    if (token === '(') {
      indentLevel++
      result += '\n' + indent.repeat(indentLevel)
    } else if (token === ')') {
      indentLevel = Math.max(0, indentLevel - 1)
      result = result.trimEnd() + '\n' + indent.repeat(indentLevel) + token + ' '
    }
  }

  // Clean up extra whitespace
  result = result
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')

  // Handle commas - put them at end of line
  result = result.replace(/\s*,\s*/g, ',\n' + indent.repeat(indentLevel))

  return result.trim()
}

/**
 * Minify SQL query by removing unnecessary whitespace
 */
export function minifySQL(sql: string): string {
  if (!sql.trim()) {
    throw new Error('SQL query cannot be empty')
  }

  let minified = sql.trim()

  // Remove comments
  minified = minified.replace(/--[^\n]*/g, '') // Single line comments
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '') // Multi-line comments

  // Remove extra whitespace
  minified = minified.replace(/\s+/g, ' ')

  // Remove whitespace around operators and punctuation
  minified = minified.replace(/\s*([(),=<>!])\s*/g, '$1')

  // Add back space after comma for readability
  minified = minified.replace(/,/g, ', ')

  return minified.trim()
}

/**
 * Detect SQL dialect from query content (basic detection)
 */
export function detectDialect(sql: string): SQLDialect {
  const upperSQL = sql.toUpperCase()

  // MySQL specific
  if (
    upperSQL.includes('AUTO_INCREMENT') ||
    (upperSQL.includes('LIMIT') && upperSQL.includes('OFFSET'))
  ) {
    return 'mysql'
  }

  // PostgreSQL specific
  if (upperSQL.includes('SERIAL') || upperSQL.includes('RETURNING') || upperSQL.includes('::')) {
    return 'postgresql'
  }

  // SQL Server specific
  if (upperSQL.includes('TOP') || upperSQL.includes('IDENTITY') || upperSQL.includes('GETDATE')) {
    return 'sqlserver'
  }

  // SQLite specific
  if (upperSQL.includes('AUTOINCREMENT') || upperSQL.includes('PRAGMA')) {
    return 'sqlite'
  }

  return 'standard'
}

/**
 * Validate SQL syntax (basic validation)
 */
export function validateSQL(sql: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const upperSQL = sql.toUpperCase()

  // Check for balanced parentheses
  const openCount = (sql.match(/\(/g) || []).length
  const closeCount = (sql.match(/\)/g) || []).length
  if (openCount !== closeCount) {
    errors.push('Unbalanced parentheses')
  }

  // Check for balanced quotes
  const singleQuotes = (sql.match(/'/g) || []).length
  if (singleQuotes % 2 !== 0) {
    errors.push('Unbalanced single quotes')
  }

  // Check for SELECT without FROM (except for certain cases)
  if (
    upperSQL.includes('SELECT') &&
    !upperSQL.includes('FROM') &&
    !upperSQL.match(/SELECT\s+\d+/)
  ) {
    errors.push('SELECT statement should typically include FROM clause')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
