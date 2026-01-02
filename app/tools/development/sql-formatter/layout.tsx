import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SQL Formatter - Format & Beautify SQL Queries Online | SuperTool',
  description:
    'Free online SQL formatter and beautifier. Format, beautify, and minify SQL queries with syntax highlighting. Supports MySQL, PostgreSQL, SQLite, and SQL Server dialects. Perfect for database developers and SQL optimization.',
  keywords: [
    'sql formatter',
    'sql beautifier',
    'format sql',
    'sql pretty print',
    'sql minifier',
    'mysql formatter',
    'postgresql formatter',
    'sql syntax highlighting',
    'database tools',
    'sql query formatter',
    'sql online tool',
    'beautify sql',
    'sql code formatter',
    'sql query beautifier',
  ],
  openGraph: {
    title: 'SQL Formatter - Format & Beautify SQL Queries',
    description:
      'Format, beautify, and minify SQL queries with support for multiple SQL dialects. Free online SQL formatter with syntax highlighting.',
    type: 'website',
  },
}

export default function SQLFormatterLayout({ children }: { children: React.ReactNode }) {
  return children
}
