// Platform configurations
export const PLATFORMS = {
  instagram: {
    name: 'Instagram',
    maxHashtags: 30,
    recommended: { min: 5, max: 11 },
    description: 'Up to 30 hashtags, 5-11 recommended for best engagement',
  },
  twitter: {
    name: 'Twitter/X',
    maxHashtags: 280, // Character limit applies
    recommended: { min: 1, max: 3 },
    description: '1-3 hashtags recommended, more can reduce engagement',
  },
  tiktok: {
    name: 'TikTok',
    maxHashtags: 100, // Character limit for caption
    recommended: { min: 3, max: 5 },
    description: '3-5 targeted hashtags work best',
  },
  linkedin: {
    name: 'LinkedIn',
    maxHashtags: 30,
    recommended: { min: 3, max: 5 },
    description: '3-5 professional, industry-specific hashtags',
  },
  facebook: {
    name: 'Facebook',
    maxHashtags: 30,
    recommended: { min: 1, max: 3 },
    description: '1-3 hashtags, less is more on Facebook',
  },
  youtube: {
    name: 'YouTube',
    maxHashtags: 15,
    recommended: { min: 3, max: 5 },
    description: '3-5 hashtags in description, first 3 shown above title',
  },
  pinterest: {
    name: 'Pinterest',
    maxHashtags: 20,
    recommended: { min: 2, max: 5 },
    description: '2-5 relevant hashtags in pin description',
  },
} as const

export type PlatformId = keyof typeof PLATFORMS

// Hashtag categories
export const CATEGORIES = {
  general: { name: 'General', icon: 'Hash' },
  trending: { name: 'Trending', icon: 'TrendingUp' },
  niche: { name: 'Niche', icon: 'Target' },
  branded: { name: 'Branded', icon: 'Star' },
  community: { name: 'Community', icon: 'Users' },
  location: { name: 'Location', icon: 'MapPin' },
} as const

export type CategoryId = keyof typeof CATEGORIES

// Popularity levels
export type PopularityLevel = 'low' | 'medium' | 'high' | 'viral'

export interface Hashtag {
  tag: string
  category: CategoryId
  popularity: PopularityLevel
  posts?: string // e.g., "1.2M posts"
  relevanceScore: number // 0-100
}

// Hashtag database by topic/niche
export const HASHTAG_DATABASE: Record<string, Hashtag[]> = {
  // Technology
  technology: [
    { tag: 'tech', category: 'general', popularity: 'viral', posts: '150M+', relevanceScore: 95 },
    {
      tag: 'technology',
      category: 'general',
      popularity: 'viral',
      posts: '80M+',
      relevanceScore: 90,
    },
    {
      tag: 'innovation',
      category: 'trending',
      popularity: 'high',
      posts: '25M+',
      relevanceScore: 85,
    },
    { tag: 'ai', category: 'trending', popularity: 'viral', posts: '50M+', relevanceScore: 92 },
    {
      tag: 'artificialintelligence',
      category: 'niche',
      popularity: 'high',
      posts: '15M+',
      relevanceScore: 88,
    },
    {
      tag: 'machinelearning',
      category: 'niche',
      popularity: 'high',
      posts: '10M+',
      relevanceScore: 85,
    },
    { tag: 'coding', category: 'general', popularity: 'high', posts: '30M+', relevanceScore: 80 },
    {
      tag: 'programming',
      category: 'general',
      popularity: 'high',
      posts: '25M+',
      relevanceScore: 82,
    },
    {
      tag: 'developer',
      category: 'community',
      popularity: 'high',
      posts: '20M+',
      relevanceScore: 78,
    },
    { tag: 'webdev', category: 'niche', popularity: 'medium', posts: '5M+', relevanceScore: 75 },
    { tag: 'software', category: 'general', popularity: 'high', posts: '15M+', relevanceScore: 77 },
    { tag: 'startup', category: 'trending', popularity: 'high', posts: '35M+', relevanceScore: 80 },
    {
      tag: 'techlife',
      category: 'community',
      popularity: 'medium',
      posts: '2M+',
      relevanceScore: 65,
    },
    {
      tag: 'futuretech',
      category: 'niche',
      popularity: 'medium',
      posts: '1M+',
      relevanceScore: 70,
    },
    {
      tag: 'digitaltransformation',
      category: 'niche',
      popularity: 'medium',
      posts: '3M+',
      relevanceScore: 72,
    },
  ],

  // Food & Cooking
  food: [
    { tag: 'food', category: 'general', popularity: 'viral', posts: '500M+', relevanceScore: 95 },
    {
      tag: 'foodie',
      category: 'community',
      popularity: 'viral',
      posts: '200M+',
      relevanceScore: 92,
    },
    {
      tag: 'foodporn',
      category: 'trending',
      popularity: 'viral',
      posts: '300M+',
      relevanceScore: 90,
    },
    {
      tag: 'instafood',
      category: 'general',
      popularity: 'viral',
      posts: '250M+',
      relevanceScore: 88,
    },
    { tag: 'yummy', category: 'general', popularity: 'high', posts: '100M+', relevanceScore: 82 },
    {
      tag: 'delicious',
      category: 'general',
      popularity: 'high',
      posts: '80M+',
      relevanceScore: 80,
    },
    { tag: 'homemade', category: 'niche', popularity: 'high', posts: '50M+', relevanceScore: 78 },
    { tag: 'cooking', category: 'general', popularity: 'high', posts: '60M+', relevanceScore: 85 },
    { tag: 'recipe', category: 'niche', popularity: 'high', posts: '40M+', relevanceScore: 83 },
    {
      tag: 'healthyfood',
      category: 'niche',
      popularity: 'high',
      posts: '70M+',
      relevanceScore: 80,
    },
    {
      tag: 'foodstagram',
      category: 'community',
      popularity: 'high',
      posts: '30M+',
      relevanceScore: 75,
    },
    {
      tag: 'foodlover',
      category: 'community',
      popularity: 'high',
      posts: '45M+',
      relevanceScore: 77,
    },
    { tag: 'dinner', category: 'general', popularity: 'high', posts: '55M+', relevanceScore: 72 },
    { tag: 'lunch', category: 'general', popularity: 'high', posts: '40M+', relevanceScore: 70 },
    {
      tag: 'breakfast',
      category: 'general',
      popularity: 'high',
      posts: '60M+',
      relevanceScore: 75,
    },
  ],

  // Fitness & Health
  fitness: [
    {
      tag: 'fitness',
      category: 'general',
      popularity: 'viral',
      posts: '450M+',
      relevanceScore: 95,
    },
    { tag: 'gym', category: 'general', popularity: 'viral', posts: '200M+', relevanceScore: 90 },
    {
      tag: 'workout',
      category: 'general',
      popularity: 'viral',
      posts: '180M+',
      relevanceScore: 92,
    },
    {
      tag: 'fitfam',
      category: 'community',
      popularity: 'high',
      posts: '100M+',
      relevanceScore: 85,
    },
    { tag: 'health', category: 'general', popularity: 'viral', posts: '150M+', relevanceScore: 88 },
    {
      tag: 'healthy',
      category: 'general',
      popularity: 'viral',
      posts: '200M+',
      relevanceScore: 85,
    },
    {
      tag: 'motivation',
      category: 'trending',
      popularity: 'viral',
      posts: '250M+',
      relevanceScore: 80,
    },
    {
      tag: 'fitnessmotivation',
      category: 'niche',
      popularity: 'high',
      posts: '70M+',
      relevanceScore: 82,
    },
    {
      tag: 'bodybuilding',
      category: 'niche',
      popularity: 'high',
      posts: '50M+',
      relevanceScore: 78,
    },
    { tag: 'cardio', category: 'niche', popularity: 'medium', posts: '15M+', relevanceScore: 70 },
    { tag: 'yoga', category: 'niche', popularity: 'high', posts: '100M+', relevanceScore: 80 },
    {
      tag: 'personaltrainer',
      category: 'niche',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 72,
    },
    {
      tag: 'gains',
      category: 'community',
      popularity: 'medium',
      posts: '10M+',
      relevanceScore: 68,
    },
    {
      tag: 'legday',
      category: 'community',
      popularity: 'medium',
      posts: '8M+',
      relevanceScore: 65,
    },
    {
      tag: 'wellness',
      category: 'trending',
      popularity: 'high',
      posts: '80M+',
      relevanceScore: 82,
    },
  ],

  // Travel
  travel: [
    { tag: 'travel', category: 'general', popularity: 'viral', posts: '600M+', relevanceScore: 95 },
    {
      tag: 'travelphotography',
      category: 'niche',
      popularity: 'viral',
      posts: '200M+',
      relevanceScore: 90,
    },
    {
      tag: 'travelgram',
      category: 'community',
      popularity: 'viral',
      posts: '150M+',
      relevanceScore: 88,
    },
    {
      tag: 'wanderlust',
      category: 'trending',
      popularity: 'viral',
      posts: '130M+',
      relevanceScore: 92,
    },
    { tag: 'vacation', category: 'general', popularity: 'high', posts: '80M+', relevanceScore: 82 },
    {
      tag: 'adventure',
      category: 'trending',
      popularity: 'viral',
      posts: '150M+',
      relevanceScore: 85,
    },
    {
      tag: 'explore',
      category: 'general',
      popularity: 'viral',
      posts: '180M+',
      relevanceScore: 83,
    },
    {
      tag: 'instatravel',
      category: 'community',
      popularity: 'high',
      posts: '70M+',
      relevanceScore: 78,
    },
    {
      tag: 'travelblogger',
      category: 'niche',
      popularity: 'high',
      posts: '40M+',
      relevanceScore: 75,
    },
    { tag: 'roadtrip', category: 'niche', popularity: 'high', posts: '35M+', relevanceScore: 77 },
    {
      tag: 'backpacking',
      category: 'niche',
      popularity: 'medium',
      posts: '15M+',
      relevanceScore: 72,
    },
    {
      tag: 'traveltheworld',
      category: 'trending',
      popularity: 'high',
      posts: '30M+',
      relevanceScore: 80,
    },
    {
      tag: 'digitalnomad',
      category: 'niche',
      popularity: 'medium',
      posts: '8M+',
      relevanceScore: 70,
    },
    {
      tag: 'solotravel',
      category: 'niche',
      popularity: 'medium',
      posts: '10M+',
      relevanceScore: 73,
    },
    {
      tag: 'luxurytravel',
      category: 'niche',
      popularity: 'medium',
      posts: '12M+',
      relevanceScore: 68,
    },
  ],

  // Fashion
  fashion: [
    {
      tag: 'fashion',
      category: 'general',
      popularity: 'viral',
      posts: '800M+',
      relevanceScore: 95,
    },
    { tag: 'style', category: 'general', popularity: 'viral', posts: '400M+', relevanceScore: 92 },
    { tag: 'ootd', category: 'trending', popularity: 'viral', posts: '350M+', relevanceScore: 90 },
    {
      tag: 'fashionblogger',
      category: 'niche',
      popularity: 'high',
      posts: '100M+',
      relevanceScore: 85,
    },
    {
      tag: 'streetstyle',
      category: 'niche',
      popularity: 'high',
      posts: '80M+',
      relevanceScore: 82,
    },
    {
      tag: 'outfitoftheday',
      category: 'community',
      popularity: 'high',
      posts: '60M+',
      relevanceScore: 78,
    },
    {
      tag: 'fashionista',
      category: 'community',
      popularity: 'high',
      posts: '70M+',
      relevanceScore: 80,
    },
    {
      tag: 'instafashion',
      category: 'general',
      popularity: 'high',
      posts: '90M+',
      relevanceScore: 77,
    },
    {
      tag: 'styleinspo',
      category: 'trending',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 75,
    },
    {
      tag: 'fashionstyle',
      category: 'general',
      popularity: 'high',
      posts: '50M+',
      relevanceScore: 73,
    },
    { tag: 'outfit', category: 'general', popularity: 'high', posts: '120M+', relevanceScore: 82 },
    { tag: 'clothing', category: 'general', popularity: 'high', posts: '40M+', relevanceScore: 70 },
    {
      tag: 'mensfashion',
      category: 'niche',
      popularity: 'high',
      posts: '30M+',
      relevanceScore: 75,
    },
    {
      tag: 'womensfashion',
      category: 'niche',
      popularity: 'high',
      posts: '25M+',
      relevanceScore: 74,
    },
    {
      tag: 'lookoftheday',
      category: 'community',
      popularity: 'medium',
      posts: '15M+',
      relevanceScore: 68,
    },
  ],

  // Photography
  photography: [
    {
      tag: 'photography',
      category: 'general',
      popularity: 'viral',
      posts: '700M+',
      relevanceScore: 95,
    },
    {
      tag: 'photooftheday',
      category: 'trending',
      popularity: 'viral',
      posts: '900M+',
      relevanceScore: 92,
    },
    { tag: 'photo', category: 'general', popularity: 'viral', posts: '500M+', relevanceScore: 88 },
    {
      tag: 'photographer',
      category: 'niche',
      popularity: 'high',
      posts: '150M+',
      relevanceScore: 85,
    },
    {
      tag: 'instagood',
      category: 'general',
      popularity: 'viral',
      posts: '1B+',
      relevanceScore: 75,
    },
    { tag: 'portrait', category: 'niche', popularity: 'high', posts: '100M+', relevanceScore: 82 },
    {
      tag: 'naturephotography',
      category: 'niche',
      popularity: 'high',
      posts: '80M+',
      relevanceScore: 80,
    },
    {
      tag: 'streetphotography',
      category: 'niche',
      popularity: 'high',
      posts: '60M+',
      relevanceScore: 78,
    },
    {
      tag: 'photoshoot',
      category: 'general',
      popularity: 'high',
      posts: '90M+',
      relevanceScore: 77,
    },
    { tag: 'canon', category: 'branded', popularity: 'high', posts: '70M+', relevanceScore: 72 },
    { tag: 'nikon', category: 'branded', popularity: 'high', posts: '50M+', relevanceScore: 70 },
    { tag: 'sony', category: 'branded', popularity: 'high', posts: '40M+', relevanceScore: 68 },
    {
      tag: 'goldenhour',
      category: 'niche',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 75,
    },
    {
      tag: 'landscapephotography',
      category: 'niche',
      popularity: 'high',
      posts: '45M+',
      relevanceScore: 78,
    },
    {
      tag: 'visualsoflife',
      category: 'community',
      popularity: 'medium',
      posts: '10M+',
      relevanceScore: 70,
    },
  ],

  // Business & Entrepreneurship
  business: [
    {
      tag: 'business',
      category: 'general',
      popularity: 'viral',
      posts: '100M+',
      relevanceScore: 95,
    },
    {
      tag: 'entrepreneur',
      category: 'general',
      popularity: 'viral',
      posts: '80M+',
      relevanceScore: 92,
    },
    {
      tag: 'entrepreneurship',
      category: 'niche',
      popularity: 'high',
      posts: '40M+',
      relevanceScore: 88,
    },
    {
      tag: 'success',
      category: 'trending',
      popularity: 'viral',
      posts: '150M+',
      relevanceScore: 82,
    },
    { tag: 'money', category: 'trending', popularity: 'viral', posts: '100M+', relevanceScore: 78 },
    { tag: 'marketing', category: 'niche', popularity: 'high', posts: '50M+', relevanceScore: 85 },
    {
      tag: 'smallbusiness',
      category: 'niche',
      popularity: 'high',
      posts: '60M+',
      relevanceScore: 88,
    },
    {
      tag: 'businessowner',
      category: 'community',
      popularity: 'high',
      posts: '30M+',
      relevanceScore: 82,
    },
    { tag: 'hustle', category: 'trending', popularity: 'high', posts: '40M+', relevanceScore: 75 },
    {
      tag: 'motivation',
      category: 'general',
      popularity: 'viral',
      posts: '250M+',
      relevanceScore: 70,
    },
    {
      tag: 'leadership',
      category: 'niche',
      popularity: 'medium',
      posts: '15M+',
      relevanceScore: 77,
    },
    {
      tag: 'networking',
      category: 'niche',
      popularity: 'medium',
      posts: '10M+',
      relevanceScore: 72,
    },
    {
      tag: 'investment',
      category: 'niche',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 75,
    },
    { tag: 'mindset', category: 'trending', popularity: 'high', posts: '60M+', relevanceScore: 73 },
    {
      tag: 'growthmindset',
      category: 'niche',
      popularity: 'medium',
      posts: '8M+',
      relevanceScore: 70,
    },
  ],

  // Art & Design
  art: [
    { tag: 'art', category: 'general', popularity: 'viral', posts: '800M+', relevanceScore: 95 },
    {
      tag: 'artist',
      category: 'community',
      popularity: 'viral',
      posts: '200M+',
      relevanceScore: 92,
    },
    {
      tag: 'artwork',
      category: 'general',
      popularity: 'viral',
      posts: '150M+',
      relevanceScore: 88,
    },
    { tag: 'design', category: 'general', popularity: 'viral', posts: '250M+', relevanceScore: 90 },
    { tag: 'drawing', category: 'niche', popularity: 'high', posts: '100M+', relevanceScore: 85 },
    {
      tag: 'illustration',
      category: 'niche',
      popularity: 'high',
      posts: '80M+',
      relevanceScore: 83,
    },
    { tag: 'painting', category: 'niche', popularity: 'high', posts: '90M+', relevanceScore: 82 },
    {
      tag: 'creative',
      category: 'trending',
      popularity: 'high',
      posts: '120M+',
      relevanceScore: 78,
    },
    {
      tag: 'graphicdesign',
      category: 'niche',
      popularity: 'high',
      posts: '50M+',
      relevanceScore: 80,
    },
    { tag: 'digitalart', category: 'niche', popularity: 'high', posts: '60M+', relevanceScore: 82 },
    {
      tag: 'artistsoninstagram',
      category: 'community',
      popularity: 'high',
      posts: '40M+',
      relevanceScore: 75,
    },
    { tag: 'sketch', category: 'niche', popularity: 'high', posts: '70M+', relevanceScore: 77 },
    {
      tag: 'artoftheday',
      category: 'community',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 72,
    },
    {
      tag: 'contemporaryart',
      category: 'niche',
      popularity: 'medium',
      posts: '15M+',
      relevanceScore: 70,
    },
    {
      tag: 'abstractart',
      category: 'niche',
      popularity: 'medium',
      posts: '25M+',
      relevanceScore: 73,
    },
  ],

  // Beauty & Skincare
  beauty: [
    { tag: 'beauty', category: 'general', popularity: 'viral', posts: '500M+', relevanceScore: 95 },
    { tag: 'makeup', category: 'general', popularity: 'viral', posts: '400M+', relevanceScore: 92 },
    {
      tag: 'skincare',
      category: 'trending',
      popularity: 'viral',
      posts: '150M+',
      relevanceScore: 90,
    },
    { tag: 'mua', category: 'niche', popularity: 'high', posts: '80M+', relevanceScore: 85 },
    {
      tag: 'makeupartist',
      category: 'niche',
      popularity: 'high',
      posts: '70M+',
      relevanceScore: 83,
    },
    {
      tag: 'beautyblogger',
      category: 'community',
      popularity: 'high',
      posts: '50M+',
      relevanceScore: 80,
    },
    { tag: 'glam', category: 'trending', popularity: 'high', posts: '60M+', relevanceScore: 78 },
    {
      tag: 'skincareroutine',
      category: 'niche',
      popularity: 'high',
      posts: '30M+',
      relevanceScore: 82,
    },
    {
      tag: 'beautytips',
      category: 'niche',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 75,
    },
    {
      tag: 'makeuplover',
      category: 'community',
      popularity: 'high',
      posts: '40M+',
      relevanceScore: 77,
    },
    {
      tag: 'cosmetics',
      category: 'general',
      popularity: 'high',
      posts: '45M+',
      relevanceScore: 73,
    },
    { tag: 'lipstick', category: 'niche', popularity: 'high', posts: '55M+', relevanceScore: 70 },
    {
      tag: 'eyeshadow',
      category: 'niche',
      popularity: 'medium',
      posts: '25M+',
      relevanceScore: 68,
    },
    {
      tag: 'naturalmakeup',
      category: 'niche',
      popularity: 'medium',
      posts: '15M+',
      relevanceScore: 72,
    },
    {
      tag: 'selfcare',
      category: 'trending',
      popularity: 'high',
      posts: '100M+',
      relevanceScore: 80,
    },
  ],

  // Music
  music: [
    { tag: 'music', category: 'general', popularity: 'viral', posts: '500M+', relevanceScore: 95 },
    {
      tag: 'musician',
      category: 'community',
      popularity: 'viral',
      posts: '100M+',
      relevanceScore: 90,
    },
    { tag: 'singer', category: 'niche', popularity: 'high', posts: '80M+', relevanceScore: 85 },
    { tag: 'song', category: 'general', popularity: 'high', posts: '60M+', relevanceScore: 82 },
    {
      tag: 'newmusic',
      category: 'trending',
      popularity: 'high',
      posts: '40M+',
      relevanceScore: 88,
    },
    { tag: 'hiphop', category: 'niche', popularity: 'high', posts: '70M+', relevanceScore: 80 },
    { tag: 'rap', category: 'niche', popularity: 'high', posts: '50M+', relevanceScore: 78 },
    { tag: 'rock', category: 'niche', popularity: 'high', posts: '45M+', relevanceScore: 75 },
    { tag: 'producer', category: 'niche', popularity: 'medium', posts: '30M+', relevanceScore: 77 },
    { tag: 'dj', category: 'niche', popularity: 'high', posts: '55M+', relevanceScore: 76 },
    { tag: 'spotify', category: 'branded', popularity: 'high', posts: '35M+', relevanceScore: 72 },
    {
      tag: 'soundcloud',
      category: 'branded',
      popularity: 'medium',
      posts: '15M+',
      relevanceScore: 68,
    },
    { tag: 'guitar', category: 'niche', popularity: 'high', posts: '60M+', relevanceScore: 73 },
    { tag: 'piano', category: 'niche', popularity: 'medium', posts: '25M+', relevanceScore: 70 },
    {
      tag: 'livemusic',
      category: 'community',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 75,
    },
  ],

  // Pets
  pets: [
    { tag: 'pet', category: 'general', popularity: 'viral', posts: '200M+', relevanceScore: 90 },
    { tag: 'dog', category: 'general', popularity: 'viral', posts: '350M+', relevanceScore: 95 },
    { tag: 'cat', category: 'general', popularity: 'viral', posts: '250M+', relevanceScore: 93 },
    {
      tag: 'dogsofinstagram',
      category: 'community',
      popularity: 'viral',
      posts: '300M+',
      relevanceScore: 92,
    },
    {
      tag: 'catsofinstagram',
      category: 'community',
      popularity: 'viral',
      posts: '200M+',
      relevanceScore: 90,
    },
    { tag: 'puppy', category: 'trending', popularity: 'viral', posts: '150M+', relevanceScore: 88 },
    { tag: 'kitten', category: 'trending', popularity: 'high', posts: '80M+', relevanceScore: 85 },
    { tag: 'pets', category: 'general', popularity: 'high', posts: '100M+', relevanceScore: 82 },
    { tag: 'cute', category: 'general', popularity: 'viral', posts: '600M+', relevanceScore: 75 },
    { tag: 'animals', category: 'general', popularity: 'high', posts: '120M+', relevanceScore: 78 },
    {
      tag: 'petsofinstagram',
      category: 'community',
      popularity: 'high',
      posts: '60M+',
      relevanceScore: 80,
    },
    {
      tag: 'doglife',
      category: 'community',
      popularity: 'medium',
      posts: '30M+',
      relevanceScore: 72,
    },
    {
      tag: 'catlife',
      category: 'community',
      popularity: 'medium',
      posts: '25M+',
      relevanceScore: 70,
    },
    {
      tag: 'petlovers',
      category: 'community',
      popularity: 'medium',
      posts: '20M+',
      relevanceScore: 68,
    },
    {
      tag: 'adoptdontshop',
      category: 'trending',
      popularity: 'medium',
      posts: '15M+',
      relevanceScore: 75,
    },
  ],

  // General/Engagement
  general: [
    { tag: 'love', category: 'general', popularity: 'viral', posts: '2B+', relevanceScore: 70 },
    {
      tag: 'instagood',
      category: 'general',
      popularity: 'viral',
      posts: '1.5B+',
      relevanceScore: 72,
    },
    {
      tag: 'photooftheday',
      category: 'trending',
      popularity: 'viral',
      posts: '900M+',
      relevanceScore: 75,
    },
    {
      tag: 'beautiful',
      category: 'general',
      popularity: 'viral',
      posts: '700M+',
      relevanceScore: 68,
    },
    { tag: 'happy', category: 'general', popularity: 'viral', posts: '600M+', relevanceScore: 65 },
    {
      tag: 'followme',
      category: 'community',
      popularity: 'viral',
      posts: '500M+',
      relevanceScore: 50,
    },
    {
      tag: 'like4like',
      category: 'community',
      popularity: 'high',
      posts: '400M+',
      relevanceScore: 40,
    },
    {
      tag: 'follow',
      category: 'community',
      popularity: 'viral',
      posts: '550M+',
      relevanceScore: 45,
    },
    {
      tag: 'instadaily',
      category: 'general',
      popularity: 'high',
      posts: '300M+',
      relevanceScore: 60,
    },
    {
      tag: 'instalike',
      category: 'general',
      popularity: 'high',
      posts: '350M+',
      relevanceScore: 55,
    },
    {
      tag: 'picoftheday',
      category: 'trending',
      popularity: 'high',
      posts: '400M+',
      relevanceScore: 70,
    },
    {
      tag: 'bestoftheday',
      category: 'trending',
      popularity: 'medium',
      posts: '100M+',
      relevanceScore: 65,
    },
    { tag: 'life', category: 'general', popularity: 'viral', posts: '400M+', relevanceScore: 55 },
    { tag: 'amazing', category: 'general', popularity: 'high', posts: '200M+', relevanceScore: 58 },
    {
      tag: 'lifestyle',
      category: 'general',
      popularity: 'viral',
      posts: '300M+',
      relevanceScore: 75,
    },
  ],
}

// Topic keywords mapping for content analysis
export const TOPIC_KEYWORDS: Record<string, string[]> = {
  technology: [
    'tech',
    'code',
    'coding',
    'programming',
    'developer',
    'software',
    'app',
    'ai',
    'machine learning',
    'data',
    'computer',
    'digital',
    'innovation',
    'startup',
    'saas',
    'api',
    'javascript',
    'python',
    'react',
    'web',
  ],
  food: [
    'food',
    'recipe',
    'cooking',
    'cook',
    'eat',
    'eating',
    'meal',
    'dinner',
    'lunch',
    'breakfast',
    'delicious',
    'yummy',
    'tasty',
    'chef',
    'kitchen',
    'homemade',
    'baking',
    'restaurant',
    'foodie',
  ],
  fitness: [
    'fitness',
    'gym',
    'workout',
    'exercise',
    'training',
    'health',
    'healthy',
    'muscle',
    'cardio',
    'yoga',
    'running',
    'weight',
    'bodybuilding',
    'strength',
    'wellness',
    'nutrition',
  ],
  travel: [
    'travel',
    'trip',
    'vacation',
    'holiday',
    'explore',
    'adventure',
    'journey',
    'destination',
    'flight',
    'hotel',
    'beach',
    'mountain',
    'city',
    'wanderlust',
    'backpack',
    'tourism',
  ],
  fashion: [
    'fashion',
    'style',
    'outfit',
    'clothes',
    'clothing',
    'wear',
    'wearing',
    'dress',
    'shoes',
    'accessories',
    'designer',
    'trend',
    'ootd',
    'streetwear',
    'vintage',
  ],
  photography: [
    'photo',
    'photography',
    'photographer',
    'camera',
    'shot',
    'capture',
    'portrait',
    'landscape',
    'sunset',
    'nature',
    'shoot',
    'lens',
    'canon',
    'nikon',
    'sony',
  ],
  business: [
    'business',
    'entrepreneur',
    'marketing',
    'money',
    'success',
    'work',
    'career',
    'job',
    'company',
    'startup',
    'investment',
    'finance',
    'sales',
    'brand',
    'leadership',
  ],
  art: [
    'art',
    'artist',
    'design',
    'draw',
    'drawing',
    'paint',
    'painting',
    'illustration',
    'creative',
    'artwork',
    'sketch',
    'digital art',
    'graphic',
    'canvas',
  ],
  beauty: [
    'beauty',
    'makeup',
    'skincare',
    'cosmetics',
    'lipstick',
    'foundation',
    'skin',
    'glow',
    'glam',
    'mua',
    'lashes',
    'nails',
    'hair',
    'selfcare',
  ],
  music: [
    'music',
    'song',
    'singer',
    'musician',
    'band',
    'album',
    'concert',
    'guitar',
    'piano',
    'rap',
    'hiphop',
    'rock',
    'pop',
    'dj',
    'producer',
  ],
  pets: [
    'pet',
    'dog',
    'cat',
    'puppy',
    'kitten',
    'animal',
    'cute',
    'furry',
    'paw',
    'adopt',
    'rescue',
    'breed',
    'vet',
    'walk',
  ],
}

/**
 * Analyze text content and identify relevant topics
 */
export function analyzeContent(text: string): string[] {
  const lowerText = text.toLowerCase()
  const topics: string[] = []

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const matchCount = keywords.filter((keyword) => lowerText.includes(keyword)).length
    if (matchCount >= 1) {
      topics.push(topic)
    }
  }

  // If no specific topic found, return general
  if (topics.length === 0) {
    topics.push('general')
  }

  return topics
}

/**
 * Generate hashtags based on content and filters
 */
export function generateHashtags(
  content: string,
  options: {
    platform?: PlatformId
    categories?: CategoryId[]
    maxCount?: number
    includeGeneral?: boolean
  } = {}
): Hashtag[] {
  const { platform = 'instagram', categories, maxCount, includeGeneral = true } = options

  const platformConfig = PLATFORMS[platform]
  const limit = maxCount || platformConfig.recommended.max

  // Analyze content to find relevant topics
  const topics = analyzeContent(content)

  // Collect hashtags from relevant topics
  let hashtags: Hashtag[] = []

  for (const topic of topics) {
    const topicHashtags = HASHTAG_DATABASE[topic] || []
    hashtags = [...hashtags, ...topicHashtags]
  }

  // Optionally include general hashtags for broader reach
  if (includeGeneral && !topics.includes('general')) {
    const generalHashtags = HASHTAG_DATABASE.general || []
    // Add fewer general hashtags, prioritize niche ones
    hashtags = [...hashtags, ...generalHashtags.slice(0, 5)]
  }

  // Remove duplicates
  const uniqueHashtags = Array.from(new Map(hashtags.map((h) => [h.tag, h])).values())

  // Filter by categories if specified
  const filtered = categories
    ? uniqueHashtags.filter((h) => categories.includes(h.category))
    : uniqueHashtags

  // Sort by relevance score
  filtered.sort((a, b) => b.relevanceScore - a.relevanceScore)

  // Return limited results
  return filtered.slice(0, limit)
}

/**
 * Format hashtags for display with # prefix
 */
export function formatHashtag(tag: string): string {
  return tag.startsWith('#') ? tag : `#${tag}`
}

/**
 * Format hashtags for copying
 */
export function formatHashtagsForCopy(
  hashtags: Hashtag[],
  separator: 'space' | 'newline' = 'space'
): string {
  const formatted = hashtags.map((h) => formatHashtag(h.tag))
  return separator === 'newline' ? formatted.join('\n') : formatted.join(' ')
}

/**
 * Get popularity color based on level
 */
export function getPopularityColor(popularity: PopularityLevel): string {
  switch (popularity) {
    case 'viral':
      return 'pink.400'
    case 'high':
      return 'green.400'
    case 'medium':
      return 'yellow.400'
    case 'low':
      return 'gray.400'
    default:
      return 'gray.400'
  }
}

/**
 * Get popularity label
 */
export function getPopularityLabel(popularity: PopularityLevel): string {
  switch (popularity) {
    case 'viral':
      return 'Viral'
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    default:
      return 'Unknown'
  }
}
