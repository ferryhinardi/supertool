import { supabase } from '../auth/supabaseClient'

export interface RatingStats {
  toolId: string
  totalRatings: number
  averageRating: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

export interface SubmitRatingParams {
  toolId: string
  rating: number
  userFingerprint: string
  userIp?: string
  comment?: string
}

/**
 * Get rating statistics for a specific tool
 */
export async function getRatingStats(toolId: string): Promise<RatingStats | null> {
  try {
    const { data, error } = await supabase
      .from('tool_rating_stats')
      .select('*')
      .eq('tool_id', toolId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No ratings yet for this tool
        return {
          toolId,
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        }
      }
      throw error
    }

    return {
      toolId: data.tool_id,
      totalRatings: data.total_ratings,
      averageRating: Number.parseFloat(data.average_rating),
      ratingDistribution: {
        1: data.rating_1_count,
        2: data.rating_2_count,
        3: data.rating_3_count,
        4: data.rating_4_count,
        5: data.rating_5_count,
      },
    }
  } catch (error) {
    console.error('Error fetching rating stats:', error)
    return null
  }
}

/**
 * Check if a user has already rated a tool
 */
export async function checkUserHasRated(toolId: string, userFingerprint: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('tool_ratings')
      .select('id')
      .eq('tool_id', toolId)
      .eq('user_fingerprint', userFingerprint)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return !!data
  } catch (error) {
    console.error('Error checking user rating:', error)
    return false
  }
}

/**
 * Submit a new rating for a tool
 */
export async function submitRating({
  toolId,
  rating,
  userFingerprint,
  userIp,
  comment,
}: SubmitRatingParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate rating
    if (rating < 1 || rating > 5) {
      return { success: false, error: 'Rating must be between 1 and 5' }
    }

    // Check if user has already rated
    const hasRated = await checkUserHasRated(toolId, userFingerprint)
    if (hasRated) {
      return { success: false, error: 'You have already rated this tool' }
    }

    // Insert rating
    const { error } = await supabase.from('tool_ratings').insert({
      tool_id: toolId,
      rating,
      user_fingerprint: userFingerprint,
      user_ip: userIp,
      comment,
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Error submitting rating:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Generate a simple browser fingerprint for rating tracking
 * This is a basic implementation - consider using a library like FingerprintJS for production
 */
export function generateBrowserFingerprint(): string {
  if (typeof window === 'undefined') return 'server'

  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
  ]

  // Simple hash function
  const str = components.join('|')
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}
