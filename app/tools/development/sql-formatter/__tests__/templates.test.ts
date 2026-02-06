import { describe, expect, it } from 'vitest'
import {
  detectDialect,
  formatSQL,
  minifySQL,
  SQL_DIALECTS,
  SQL_EXAMPLES,
  validateSQL,
} from '../templates'

describe('SQL Formatter Templates', () => {
  describe('SQL_DIALECTS', () => {
    it('contains all expected dialects', () => {
      expect(SQL_DIALECTS).toHaveLength(5)
      expect(SQL_DIALECTS.map((d) => d.value)).toEqual([
        'standard',
        'mysql',
        'postgresql',
        'sqlite',
        'sqlserver',
      ])
    })

    it('has labels for all dialects', () => {
      expect(SQL_DIALECTS.find((d) => d.value === 'standard')?.label).toBe('Standard SQL')
      expect(SQL_DIALECTS.find((d) => d.value === 'mysql')?.label).toBe('MySQL')
      expect(SQL_DIALECTS.find((d) => d.value === 'postgresql')?.label).toBe('PostgreSQL')
      expect(SQL_DIALECTS.find((d) => d.value === 'sqlite')?.label).toBe('SQLite')
      expect(SQL_DIALECTS.find((d) => d.value === 'sqlserver')?.label).toBe('SQL Server (T-SQL)')
    })
  })

  describe('SQL_EXAMPLES', () => {
    it('contains all expected examples', () => {
      expect(SQL_EXAMPLES).toHaveLength(6)
    })

    it('has names for all examples', () => {
      const names = SQL_EXAMPLES.map((e) => e.name)
      expect(names).toContain('Basic SELECT')
      expect(names).toContain('JOIN')
      expect(names).toContain('Subquery')
      expect(names).toContain('CREATE TABLE')
      expect(names).toContain('INSERT')
      expect(names).toContain('UPDATE')
    })

    it('has sql content for all examples', () => {
      SQL_EXAMPLES.forEach((example) => {
        expect(example.sql).toBeTruthy()
        expect(example.sql.length).toBeGreaterThan(0)
      })
    })

    it('Basic SELECT example has correct content', () => {
      const example = SQL_EXAMPLES.find((e) => e.name === 'Basic SELECT')
      expect(example?.sql).toContain('select')
      expect(example?.sql).toContain('from')
      expect(example?.sql).toContain('users')
    })

    it('JOIN example has correct content', () => {
      const example = SQL_EXAMPLES.find((e) => e.name === 'JOIN')
      expect(example?.sql).toContain('join')
      expect(example?.sql).toContain('on')
    })

    it('Subquery example has correct content', () => {
      const example = SQL_EXAMPLES.find((e) => e.name === 'Subquery')
      expect(example?.sql).toContain('select')
      expect(example?.sql).toContain('avg')
    })

    it('CREATE TABLE example has correct content', () => {
      const example = SQL_EXAMPLES.find((e) => e.name === 'CREATE TABLE')
      expect(example?.sql).toContain('create table')
      expect(example?.sql).toContain('primary key')
    })

    it('INSERT example has correct content', () => {
      const example = SQL_EXAMPLES.find((e) => e.name === 'INSERT')
      expect(example?.sql).toContain('insert into')
      expect(example?.sql).toContain('values')
    })

    it('UPDATE example has correct content', () => {
      const example = SQL_EXAMPLES.find((e) => e.name === 'UPDATE')
      expect(example?.sql).toContain('update')
      expect(example?.sql).toContain('set')
    })
  })

  describe('formatSQL', () => {
    describe('basic formatting', () => {
      it('formats a simple SELECT query', () => {
        const input = 'select * from users'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('SELECT')
        expect(result).toContain('FROM')
      })

      it('handles empty input by throwing error', () => {
        expect(() =>
          formatSQL('', {
            dialect: 'standard',
            indentSize: 2,
            uppercaseKeywords: true,
          })
        ).toThrow('SQL query cannot be empty')
      })

      it('handles whitespace-only input by throwing error', () => {
        expect(() =>
          formatSQL('   ', {
            dialect: 'standard',
            indentSize: 2,
            uppercaseKeywords: true,
          })
        ).toThrow('SQL query cannot be empty')
      })

      it('removes extra whitespace', () => {
        const input = 'select  *   from    users'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).not.toContain('  ')
      })
    })

    describe('keyword case', () => {
      it('converts keywords to uppercase when uppercaseKeywords is true', () => {
        const input = 'select * from users where id = 1'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('SELECT')
        expect(result).toContain('FROM')
        expect(result).toContain('WHERE')
      })

      it('converts keywords to lowercase when uppercaseKeywords is false', () => {
        const input = 'SELECT * FROM users WHERE id = 1'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: false,
        })

        expect(result).toContain('select')
        expect(result).toContain('from')
        expect(result).toContain('where')
      })
    })

    describe('different dialects', () => {
      it('formats MySQL query', () => {
        const input = 'select * from users limit 10'
        const result = formatSQL(input, {
          dialect: 'mysql',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('SELECT')
        expect(result).toContain('LIMIT')
      })

      it('formats PostgreSQL query', () => {
        const input = 'select * from users offset 5'
        const result = formatSQL(input, {
          dialect: 'postgresql',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('SELECT')
        expect(result).toContain('OFFSET')
      })

      it('formats SQLite query', () => {
        const input = 'select * from users'
        const result = formatSQL(input, {
          dialect: 'sqlite',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('SELECT')
      })

      it('formats SQL Server query', () => {
        const input = 'select top 10 * from users'
        const result = formatSQL(input, {
          dialect: 'sqlserver',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('SELECT')
      })
    })

    describe('different indent sizes', () => {
      it('uses 2-space indentation', () => {
        const input = 'select * from users'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toBeTruthy()
      })

      it('uses 4-space indentation', () => {
        const input = 'select * from users'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 4,
          uppercaseKeywords: true,
        })

        expect(result).toBeTruthy()
      })

      it('uses 8-space indentation', () => {
        const input = 'select * from users'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 8,
          uppercaseKeywords: true,
        })

        expect(result).toBeTruthy()
      })
    })

    describe('complex queries', () => {
      it('formats JOIN queries', () => {
        const input = 'select u.name, o.total from users u inner join orders o on u.id = o.user_id'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('SELECT')
        expect(result).toContain('JOIN')
        expect(result).toContain('ON')
      })

      it('formats GROUP BY queries', () => {
        const input = 'select status, count(*) from orders group by status having count(*) > 10'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('GROUP')
        expect(result).toContain('HAVING')
      })

      it('formats ORDER BY queries', () => {
        const input = 'select * from users order by name asc, created_at desc'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('ORDER')
        expect(result).toContain('ASC')
        expect(result).toContain('DESC')
      })

      it('formats UNION queries', () => {
        const input = 'select name from users union select name from admins'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('UNION')
      })

      it('formats CASE WHEN queries', () => {
        const input =
          'select name, case when age >= 18 then "adult" else "minor" end as age_group from users'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('CASE')
        expect(result).toContain('WHEN')
        expect(result).toContain('THEN')
        expect(result).toContain('ELSE')
        expect(result).toContain('END')
      })
    })

    describe('DDL statements', () => {
      it('formats CREATE TABLE statements', () => {
        const input = 'create table users (id int primary key, name varchar(100))'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('CREATE')
        expect(result).toContain('TABLE')
        expect(result).toContain('PRIMARY')
        expect(result).toContain('KEY')
      })

      it('formats INSERT statements', () => {
        const input = 'insert into users (name, email) values ("John", "john@example.com")'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('INSERT')
        expect(result).toContain('INTO')
        expect(result).toContain('VALUES')
      })

      it('formats UPDATE statements', () => {
        const input = 'update users set name = "John" where id = 1'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('UPDATE')
        expect(result).toContain('SET')
        expect(result).toContain('WHERE')
      })

      it('formats DELETE statements', () => {
        const input = 'delete from users where id = 1'
        const result = formatSQL(input, {
          dialect: 'standard',
          indentSize: 2,
          uppercaseKeywords: true,
        })

        expect(result).toContain('DELETE')
        expect(result).toContain('FROM')
        expect(result).toContain('WHERE')
      })
    })
  })

  describe('minifySQL', () => {
    it('minifies a simple SELECT query', () => {
      const input = 'SELECT  *  FROM  users'
      const result = minifySQL(input)

      expect(result).not.toContain('  ')
    })

    it('handles empty input by throwing error', () => {
      expect(() => minifySQL('')).toThrow('SQL query cannot be empty')
    })

    it('handles whitespace-only input by throwing error', () => {
      expect(() => minifySQL('   ')).toThrow('SQL query cannot be empty')
    })

    it('removes single-line comments', () => {
      const input = 'SELECT * FROM users -- this is a comment\nWHERE id = 1'
      const result = minifySQL(input)

      expect(result).not.toContain('--')
      expect(result).not.toContain('this is a comment')
    })

    it('removes multi-line comments', () => {
      const input = 'SELECT /* this is\na multi-line\ncomment */ * FROM users'
      const result = minifySQL(input)

      expect(result).not.toContain('/*')
      expect(result).not.toContain('*/')
      expect(result).not.toContain('multi-line')
    })

    it('removes extra whitespace', () => {
      const input = 'SELECT    *    FROM    users    WHERE    id    =    1'
      const result = minifySQL(input)

      expect(result).not.toMatch(/\s{2,}/)
    })

    it('removes whitespace around operators', () => {
      const input = 'SELECT * FROM users WHERE id = 1'
      const result = minifySQL(input)

      expect(result).toContain('id=1')
    })

    it('adds space after comma for readability', () => {
      const input = 'SELECT id,name,email FROM users'
      const result = minifySQL(input)

      expect(result).toContain(', ')
    })

    it('preserves query functionality', () => {
      const input = 'SELECT * FROM users WHERE status = "active"'
      const result = minifySQL(input)

      expect(result).toContain('SELECT')
      expect(result).toContain('FROM')
      expect(result).toContain('WHERE')
    })
  })

  describe('detectDialect', () => {
    it('detects MySQL dialect from AUTO_INCREMENT', () => {
      const sql = 'CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY)'
      expect(detectDialect(sql)).toBe('mysql')
    })

    it('detects MySQL dialect from LIMIT OFFSET', () => {
      const sql = 'SELECT * FROM users LIMIT 10 OFFSET 5'
      expect(detectDialect(sql)).toBe('mysql')
    })

    it('detects PostgreSQL dialect from SERIAL', () => {
      const sql = 'CREATE TABLE users (id SERIAL PRIMARY KEY)'
      expect(detectDialect(sql)).toBe('postgresql')
    })

    it('detects PostgreSQL dialect from RETURNING', () => {
      const sql = 'INSERT INTO users (name) VALUES ("John") RETURNING id'
      expect(detectDialect(sql)).toBe('postgresql')
    })

    it('detects PostgreSQL dialect from type casting (::)', () => {
      const sql = 'SELECT id::text FROM users'
      expect(detectDialect(sql)).toBe('postgresql')
    })

    it('detects SQL Server dialect from TOP', () => {
      const sql = 'SELECT TOP 10 * FROM users'
      expect(detectDialect(sql)).toBe('sqlserver')
    })

    it('detects SQL Server dialect from IDENTITY', () => {
      const sql = 'CREATE TABLE users (id INT IDENTITY(1,1) PRIMARY KEY)'
      expect(detectDialect(sql)).toBe('sqlserver')
    })

    it('detects SQL Server dialect from GETDATE', () => {
      const sql = 'SELECT GETDATE()'
      expect(detectDialect(sql)).toBe('sqlserver')
    })

    it('detects SQLite dialect from AUTOINCREMENT', () => {
      const sql = 'CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT)'
      expect(detectDialect(sql)).toBe('sqlite')
    })

    it('detects SQLite dialect from PRAGMA', () => {
      const sql = 'PRAGMA table_info(users)'
      expect(detectDialect(sql)).toBe('sqlite')
    })

    it('returns standard for generic SQL', () => {
      const sql = 'SELECT * FROM users WHERE id = 1'
      expect(detectDialect(sql)).toBe('standard')
    })

    it('handles case-insensitive detection', () => {
      const sql = 'create table users (id int auto_increment primary key)'
      expect(detectDialect(sql)).toBe('mysql')
    })
  })

  describe('validateSQL', () => {
    describe('parentheses validation', () => {
      it('validates balanced parentheses', () => {
        const sql = 'SELECT * FROM users WHERE (id = 1)'
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('detects unbalanced parentheses (more open)', () => {
        const sql = 'SELECT * FROM users WHERE ((id = 1)'
        const result = validateSQL(sql)

        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Unbalanced parentheses')
      })

      it('detects unbalanced parentheses (more close)', () => {
        const sql = 'SELECT * FROM users WHERE (id = 1))'
        const result = validateSQL(sql)

        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Unbalanced parentheses')
      })
    })

    describe('quote validation', () => {
      it('validates balanced single quotes', () => {
        const sql = "SELECT * FROM users WHERE name = 'John'"
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
        expect(result.errors).not.toContain('Unbalanced single quotes')
      })

      it('detects unbalanced single quotes', () => {
        const sql = "SELECT * FROM users WHERE name = 'John"
        const result = validateSQL(sql)

        expect(result.valid).toBe(false)
        expect(result.errors).toContain('Unbalanced single quotes')
      })
    })

    describe('SELECT FROM validation', () => {
      it('validates SELECT with FROM clause', () => {
        const sql = 'SELECT * FROM users'
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
        expect(result.errors).not.toContain('SELECT statement should typically include FROM clause')
      })

      it('warns about SELECT without FROM', () => {
        const sql = 'SELECT name'
        const result = validateSQL(sql)

        expect(result.valid).toBe(false)
        expect(result.errors).toContain('SELECT statement should typically include FROM clause')
      })

      it('allows SELECT with number (no FROM needed)', () => {
        const sql = 'SELECT 1'
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
      })
    })

    describe('multiple errors', () => {
      it('can detect multiple errors at once', () => {
        const sql = "SELECT name WHERE ((id = 1 AND name = 'John)"
        const result = validateSQL(sql)

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThanOrEqual(2)
      })
    })

    describe('valid queries', () => {
      it('validates a complex valid query', () => {
        const sql =
          "SELECT u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE o.status = 'completed'"
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })

      it('validates INSERT statement', () => {
        const sql = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com')"
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
      })

      it('validates UPDATE statement', () => {
        const sql = "UPDATE users SET name = 'John' WHERE id = 1"
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
      })

      it('validates DELETE statement', () => {
        const sql = 'DELETE FROM users WHERE id = 1'
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
      })

      it('validates CREATE TABLE statement', () => {
        const sql = 'CREATE TABLE users (id INT PRIMARY KEY, name VARCHAR(100))'
        const result = validateSQL(sql)

        expect(result.valid).toBe(true)
      })
    })
  })
})
