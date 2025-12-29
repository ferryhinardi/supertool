import type { MemeTemplate } from './types'

/**
 * Popular meme templates
 * Images sourced from ImgFlip public API (https://imgflip.com/api)
 * These are widely-used meme templates available for non-commercial use
 */
export const MEME_TEMPLATES: MemeTemplate[] = [
  // Classic Memes
  {
    id: '181913649',
    name: 'Drake Hotline Bling',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/30b1gx.jpg',
    width: 1200,
    height: 1200,
    boxCount: 2,
    keywords: ['drake', 'choice', 'prefer', 'reject', 'accept'],
    popularity: 10,
  },
  {
    id: '87743020',
    name: 'Two Buttons',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/1g8my4.jpg',
    width: 600,
    height: 908,
    boxCount: 3,
    keywords: ['choice', 'decision', 'buttons', 'stress'],
    popularity: 9,
  },
  {
    id: '112126428',
    name: 'Distracted Boyfriend',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/1ur9b0.jpg',
    width: 1200,
    height: 800,
    boxCount: 3,
    keywords: ['distracted', 'boyfriend', 'girlfriend', 'choice', 'looking'],
    popularity: 10,
  },
  {
    id: '131087935',
    name: 'Running Away Balloon',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/261o3j.jpg',
    width: 761,
    height: 1024,
    boxCount: 5,
    keywords: ['balloon', 'running', 'escape', 'fear'],
    popularity: 8,
  },
  {
    id: '124822590',
    name: 'Left Exit 12 Off Ramp',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/22bdq6.jpg',
    width: 804,
    height: 767,
    boxCount: 3,
    keywords: ['exit', 'choice', 'car', 'highway', 'decision'],
    popularity: 9,
  },
  {
    id: '89370399',
    name: 'Roll Safe Think About It',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/1h7in3.jpg',
    width: 702,
    height: 395,
    boxCount: 2,
    keywords: ['smart', 'think', 'genius', 'clever'],
    popularity: 8,
  },
  {
    id: '129242436',
    name: 'Change My Mind',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/24y43o.jpg',
    width: 482,
    height: 361,
    boxCount: 2,
    keywords: ['crowder', 'debate', 'opinion', 'change my mind'],
    popularity: 9,
  },
  {
    id: '438680',
    name: 'Batman Slapping Robin',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/9ehk.jpg',
    width: 400,
    height: 387,
    boxCount: 2,
    keywords: ['batman', 'robin', 'slap', 'shut up'],
    popularity: 8,
  },

  // Reaction Memes
  {
    id: '102156234',
    name: 'Mocking Spongebob',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/1otk96.jpg',
    width: 502,
    height: 353,
    boxCount: 2,
    keywords: ['spongebob', 'mocking', 'chicken', 'mock'],
    popularity: 9,
  },
  {
    id: '93895088',
    name: 'Expanding Brain',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/1jwhww.jpg',
    width: 857,
    height: 1202,
    boxCount: 4,
    keywords: ['brain', 'smart', 'intelligence', 'galaxy brain'],
    popularity: 9,
  },
  {
    id: '178591752',
    name: 'Tuxedo Winnie The Pooh',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/2ybua0.jpg',
    width: 800,
    height: 800,
    boxCount: 2,
    keywords: ['winnie', 'pooh', 'fancy', 'sophisticated', 'classy'],
    popularity: 9,
  },
  {
    id: '175540452',
    name: 'UNO Draw 25 Cards',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/2wifvo.jpg',
    width: 500,
    height: 494,
    boxCount: 2,
    keywords: ['uno', 'cards', 'choice', 'rather'],
    popularity: 8,
  },
  {
    id: '101288',
    name: 'Third World Skeptical Kid',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/265k.jpg',
    width: 426,
    height: 426,
    boxCount: 2,
    keywords: ['skeptical', 'kid', 'doubt', 'really'],
    popularity: 7,
  },
  {
    id: '4087833',
    name: 'Waiting Skeleton',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/2fm6x.jpg',
    width: 298,
    height: 403,
    boxCount: 2,
    keywords: ['waiting', 'skeleton', 'still waiting', 'patience'],
    popularity: 8,
  },

  // Wholesome Memes
  {
    id: '188390779',
    name: 'Woman Yelling At Cat',
    category: 'wholesome',
    imageUrl: 'https://i.imgflip.com/345v97.jpg',
    width: 680,
    height: 438,
    boxCount: 2,
    keywords: ['cat', 'yelling', 'woman', 'confused'],
    popularity: 10,
  },
  {
    id: '247375501',
    name: 'Buff Doge vs. Cheems',
    category: 'wholesome',
    imageUrl: 'https://i.imgflip.com/43a45p.jpg',
    width: 937,
    height: 720,
    boxCount: 4,
    keywords: ['doge', 'cheems', 'strong', 'weak', 'comparison'],
    popularity: 9,
  },
  {
    id: '135256802',
    name: 'Epic Handshake',
    category: 'wholesome',
    imageUrl: 'https://i.imgflip.com/28j0te.jpg',
    width: 900,
    height: 645,
    boxCount: 3,
    keywords: ['handshake', 'agreement', 'unity', 'together'],
    popularity: 8,
  },
  {
    id: '100777631',
    name: 'Is This A Pigeon',
    category: 'relatable',
    imageUrl: 'https://i.imgflip.com/1o00in.jpg',
    width: 1587,
    height: 1425,
    boxCount: 3,
    keywords: ['pigeon', 'butterfly', 'is this', 'confused'],
    popularity: 9,
  },

  // Animals
  {
    id: '222403160',
    name: 'Bernie I Am Once Again Asking For Your Support',
    category: 'animals',
    imageUrl: 'https://i.imgflip.com/3oevdk.jpg',
    width: 750,
    height: 750,
    boxCount: 2,
    keywords: ['bernie', 'asking', 'support', 'request'],
    popularity: 8,
  },
  {
    id: '226297822',
    name: 'Panik Kalm Panik',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/3qqcim.jpg',
    width: 640,
    height: 881,
    boxCount: 3,
    keywords: ['panik', 'kalm', 'panic', 'calm', 'stress'],
    popularity: 9,
  },
  {
    id: '217743513',
    name: 'UNO Draw 25 Cards',
    category: 'classic',
    imageUrl: 'https://i.imgflip.com/3lmzyx.jpg',
    width: 500,
    height: 494,
    boxCount: 2,
    keywords: ['uno', 'rather', 'choice'],
    popularity: 8,
  },
  {
    id: '80707627',
    name: 'Sad Pablo Escobar',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/1c1uej.jpg',
    width: 720,
    height: 709,
    boxCount: 3,
    keywords: ['pablo', 'sad', 'waiting', 'alone'],
    popularity: 7,
  },
  {
    id: '27813981',
    name: 'Hide the Pain Harold',
    category: 'reaction',
    imageUrl: 'https://i.imgflip.com/gk5el.jpg',
    width: 480,
    height: 601,
    boxCount: 2,
    keywords: ['harold', 'pain', 'smile', 'hiding pain'],
    popularity: 8,
  },
  {
    id: '8072285',
    name: 'Doge',
    category: 'animals',
    imageUrl: 'https://i.imgflip.com/4t0m5.jpg',
    width: 620,
    height: 620,
    boxCount: 5,
    keywords: ['doge', 'shiba', 'wow', 'much', 'such'],
    popularity: 10,
  },
]

export const TEMPLATE_CATEGORIES = [
  'all',
  'classic',
  'reaction',
  'wholesome',
  'relatable',
  'trending',
  'animals',
  'office',
  'political',
] as const

export function getTemplatesByCategory(category: string): MemeTemplate[] {
  if (category === 'all') {
    return MEME_TEMPLATES
  }
  return MEME_TEMPLATES.filter((t) => t.category === category)
}

export function searchTemplates(query: string): MemeTemplate[] {
  const lowerQuery = query.toLowerCase()
  return MEME_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.keywords.some((k) => k.toLowerCase().includes(lowerQuery))
  )
}

export function getPopularTemplates(limit = 10): MemeTemplate[] {
  return [...MEME_TEMPLATES].sort((a, b) => b.popularity - a.popularity).slice(0, limit)
}
