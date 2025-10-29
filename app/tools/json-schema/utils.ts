export interface JSONSchema {
  $schema?: string
  type: string | string[]
  title?: string
  description?: string
  properties?: Record<string, JSONSchema>
  items?: JSONSchema
  required?: string[]
  enum?: unknown[]
  minimum?: number
  maximum?: number
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  additionalProperties?: boolean | JSONSchema
}

/**
 * Infer JSON Schema type from a JavaScript value
 */
function inferType(value: unknown): string | string[] {
  if (value === null) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  const jsType = typeof value
  switch (jsType) {
    case 'string':
      return 'string'
    case 'number':
      return Number.isInteger(value) ? 'integer' : 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      return 'object'
    default:
      return 'string'
  }
}

/**
 * Detect string format (email, date-time, uri, etc.)
 */
function detectStringFormat(value: string): string | undefined {
  // Email pattern
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return 'email'
  }

  // URI pattern
  if (/^https?:\/\/.+/.test(value)) {
    return 'uri'
  }

  // Date-time pattern (ISO 8601)
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
    return 'date-time'
  }

  // Date pattern
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return 'date'
  }

  // Time pattern
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return 'time'
  }

  // UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    return 'uuid'
  }

  return undefined
}

/**
 * Generate JSON Schema from a sample value
 */
export function generateSchemaFromValue(
  value: unknown,
  options: {
    detectRequired?: boolean
    detectFormats?: boolean
  } = {}
): JSONSchema {
  const { detectRequired = true, detectFormats = true } = options

  const type = inferType(value)
  const schema: JSONSchema = { type }

  // Handle null
  if (value === null) {
    return schema
  }

  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length > 0) {
      // Merge schemas from all array items to support heterogeneous arrays
      const itemSchemas = value.map((item) => generateSchemaFromValue(item, options))

      // If all items have the same type, use that type
      const types = itemSchemas.map((s) => s.type)
      const uniqueTypes = [...new Set(types.flat())]

      if (uniqueTypes.length === 1) {
        schema.items = itemSchemas[0]
      } else {
        // Multiple types - create a union schema
        schema.items = {
          type: uniqueTypes as string[],
        }
      }
    } else {
      // Empty array - can't infer item type
      schema.items = { type: 'string' }
    }
    return schema
  }

  // Handle objects
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    schema.properties = {}
    const required: string[] = []

    for (const [key, val] of Object.entries(obj)) {
      schema.properties[key] = generateSchemaFromValue(val, options)

      // Mark as required if value is not null/undefined
      if (detectRequired && val !== null && val !== undefined) {
        required.push(key)
      }
    }

    if (required.length > 0) {
      schema.required = required
    }

    schema.additionalProperties = false

    return schema
  }

  // Handle strings
  if (typeof value === 'string') {
    schema.minLength = 0

    if (detectFormats) {
      const format = detectStringFormat(value)
      if (format) {
        schema.format = format
      }
    }

    return schema
  }

  // Handle numbers
  if (typeof value === 'number') {
    // Don't set minimum/maximum from a single value
    // These would be too restrictive
    return schema
  }

  // Handle booleans
  if (typeof value === 'boolean') {
    return schema
  }

  return schema
}

/**
 * Generate JSON Schema from JSON string
 */
export function generateSchema(
  jsonString: string,
  options: {
    includeSchema?: boolean
    title?: string
    description?: string
    detectRequired?: boolean
    detectFormats?: boolean
  } = {}
): JSONSchema {
  const {
    includeSchema = true,
    title,
    description,
    detectRequired = true,
    detectFormats = true,
  } = options

  // Parse JSON
  const data = JSON.parse(jsonString)

  // Generate schema from value
  const schema = generateSchemaFromValue(data, { detectRequired, detectFormats })

  // Add metadata
  if (includeSchema) {
    schema.$schema = 'https://json-schema.org/draft/2020-12/schema'
  }

  if (title) {
    schema.title = title
  }

  if (description) {
    schema.description = description
  }

  return schema
}

/**
 * Validate JSON Schema structure
 */
export function validateSchema(schema: unknown): { valid: boolean; error?: string } {
  if (typeof schema !== 'object' || schema === null) {
    return { valid: false, error: 'Schema must be an object' }
  }

  const s = schema as Record<string, unknown>

  // Must have type
  if (!s.type) {
    return { valid: false, error: 'Schema must have a "type" property' }
  }

  // Type must be valid
  const validTypes = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null']
  const types = Array.isArray(s.type) ? s.type : [s.type]

  for (const type of types) {
    if (typeof type !== 'string' || !validTypes.includes(type)) {
      return { valid: false, error: `Invalid type: ${type}` }
    }
  }

  return { valid: true }
}

/**
 * Format schema for display (pretty print)
 */
export function formatSchema(schema: JSONSchema): string {
  return JSON.stringify(schema, null, 2)
}
