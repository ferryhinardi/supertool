import { type DBSchema, type IDBPDatabase, openDB } from 'idb'

export interface RecentTool {
  toolId: string
  title: string
  href: string
  iconName: string // Store icon name as string instead of component
  gradient: string
  timestamp: number
}

interface RecentToolsDB extends DBSchema {
  'recent-tools': {
    key: string
    value: RecentTool
    indexes: { 'by-timestamp': number }
  }
}

const DB_NAME = 'supertool-db'
const STORE_NAME = 'recent-tools'
const DB_VERSION = 1
const MAX_RECENT_TOOLS = 10

let dbInstance: IDBPDatabase<RecentToolsDB> | null = null

/**
 * Initialize and get the IndexedDB database instance
 */
async function getDB(): Promise<IDBPDatabase<RecentToolsDB>> {
  if (dbInstance) {
    return dbInstance
  }

  dbInstance = await openDB<RecentToolsDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'toolId' })
        store.createIndex('by-timestamp', 'timestamp')
      }
    },
  })

  return dbInstance
}

/**
 * Add a tool to recent tools history
 * @param tool - The tool to add to recent history
 */
export async function addRecentTool(tool: Omit<RecentTool, 'timestamp'>): Promise<void> {
  try {
    const db = await getDB()
    const timestamp = Date.now()

    // Update or add the tool with new timestamp
    await db.put(STORE_NAME, {
      ...tool,
      timestamp,
    })

    // Get all tools sorted by timestamp (newest first)
    const allTools = await db.getAllFromIndex(STORE_NAME, 'by-timestamp')
    const sortedTools = allTools.sort((a, b) => b.timestamp - a.timestamp)

    // Remove oldest tools if we exceed the limit
    if (sortedTools.length > MAX_RECENT_TOOLS) {
      const toolsToRemove = sortedTools.slice(MAX_RECENT_TOOLS)
      const tx = db.transaction(STORE_NAME, 'readwrite')
      await Promise.all([...toolsToRemove.map((t) => tx.store.delete(t.toolId)), tx.done])
    }
  } catch (error) {
    console.error('Failed to add recent tool:', error)
    // Fail silently - don't break the app if IndexedDB fails
  }
}

/**
 * Get all recent tools sorted by most recent first
 * @returns Array of recent tools
 */
export async function getRecentTools(): Promise<RecentTool[]> {
  try {
    const db = await getDB()
    const tools = await db.getAllFromIndex(STORE_NAME, 'by-timestamp')
    // Sort by timestamp descending (newest first)
    return tools.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_RECENT_TOOLS)
  } catch (error) {
    console.error('Failed to get recent tools:', error)
    return []
  }
}

/**
 * Clear all recent tools from history
 */
export async function clearRecentTools(): Promise<void> {
  try {
    const db = await getDB()
    await db.clear(STORE_NAME)
  } catch (error) {
    console.error('Failed to clear recent tools:', error)
  }
}

/**
 * Check if IndexedDB is supported in the current environment
 */
export function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window
}

/**
 * Reset the database instance (for testing purposes only)
 * @internal
 */
export function __resetDBForTesting(): void {
  dbInstance = null
}
