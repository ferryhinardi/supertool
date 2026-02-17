export type Platform =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'youtube'
  | 'tiktok'
  | 'pinterest'
  | 'snapchat'

export interface PlatformInfo {
  id: Platform
  name: string
  color: string
}

export interface PlatformPreset {
  id: string
  platform: Platform
  name: string
  width: number
  height: number
  aspectRatio: string
}

export const PLATFORMS: PlatformInfo[] = [
  { id: 'instagram', name: 'Instagram', color: '#E1306C' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'twitter', name: 'Twitter / X', color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
  { id: 'youtube', name: 'YouTube', color: '#FF0000' },
  { id: 'tiktok', name: 'TikTok', color: '#00F2EA' },
  { id: 'pinterest', name: 'Pinterest', color: '#E60023' },
  { id: 'snapchat', name: 'Snapchat', color: '#FFFC00' },
]

export const PLATFORM_PRESETS: PlatformPreset[] = [
  // Instagram
  {
    id: 'ig-post-square',
    platform: 'instagram',
    name: 'Post (Square)',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
  },
  {
    id: 'ig-post-portrait',
    platform: 'instagram',
    name: 'Post (Portrait)',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
  },
  {
    id: 'ig-post-landscape',
    platform: 'instagram',
    name: 'Post (Landscape)',
    width: 1080,
    height: 566,
    aspectRatio: '1.91:1',
  },
  {
    id: 'ig-story',
    platform: 'instagram',
    name: 'Story / Reel',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
  },
  {
    id: 'ig-profile',
    platform: 'instagram',
    name: 'Profile Picture',
    width: 320,
    height: 320,
    aspectRatio: '1:1',
  },
  // Facebook
  {
    id: 'fb-post',
    platform: 'facebook',
    name: 'Post',
    width: 1200,
    height: 630,
    aspectRatio: '1.91:1',
  },
  {
    id: 'fb-cover',
    platform: 'facebook',
    name: 'Cover Photo',
    width: 820,
    height: 312,
    aspectRatio: '2.63:1',
  },
  {
    id: 'fb-profile',
    platform: 'facebook',
    name: 'Profile Picture',
    width: 170,
    height: 170,
    aspectRatio: '1:1',
  },
  {
    id: 'fb-event',
    platform: 'facebook',
    name: 'Event Cover',
    width: 1920,
    height: 1005,
    aspectRatio: '1.91:1',
  },
  // Twitter / X
  {
    id: 'tw-post',
    platform: 'twitter',
    name: 'Post Image',
    width: 1200,
    height: 675,
    aspectRatio: '16:9',
  },
  {
    id: 'tw-header',
    platform: 'twitter',
    name: 'Header / Banner',
    width: 1500,
    height: 500,
    aspectRatio: '3:1',
  },
  {
    id: 'tw-profile',
    platform: 'twitter',
    name: 'Profile Picture',
    width: 400,
    height: 400,
    aspectRatio: '1:1',
  },
  // LinkedIn
  {
    id: 'li-post',
    platform: 'linkedin',
    name: 'Post Image',
    width: 1200,
    height: 627,
    aspectRatio: '1.91:1',
  },
  {
    id: 'li-banner',
    platform: 'linkedin',
    name: 'Banner',
    width: 1584,
    height: 396,
    aspectRatio: '4:1',
  },
  {
    id: 'li-profile',
    platform: 'linkedin',
    name: 'Profile Picture',
    width: 400,
    height: 400,
    aspectRatio: '1:1',
  },
  // YouTube
  {
    id: 'yt-thumbnail',
    platform: 'youtube',
    name: 'Thumbnail',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
  },
  {
    id: 'yt-banner',
    platform: 'youtube',
    name: 'Channel Banner',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
  },
  {
    id: 'yt-profile',
    platform: 'youtube',
    name: 'Profile Picture',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
  },
  // TikTok
  {
    id: 'tt-cover',
    platform: 'tiktok',
    name: 'Video Cover',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
  },
  {
    id: 'tt-profile',
    platform: 'tiktok',
    name: 'Profile Picture',
    width: 200,
    height: 200,
    aspectRatio: '1:1',
  },
  // Pinterest
  {
    id: 'pin-standard',
    platform: 'pinterest',
    name: 'Standard Pin',
    width: 1000,
    height: 1500,
    aspectRatio: '2:3',
  },
  {
    id: 'pin-long',
    platform: 'pinterest',
    name: 'Long Pin',
    width: 1000,
    height: 2100,
    aspectRatio: '1:2.1',
  },
  // Snapchat
  {
    id: 'snap-story',
    platform: 'snapchat',
    name: 'Story / Ad',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
  },
]

export function getPresetsByPlatform(platform: Platform): PlatformPreset[] {
  return PLATFORM_PRESETS.filter((p) => p.platform === platform)
}

export function getPresetById(id: string): PlatformPreset | undefined {
  return PLATFORM_PRESETS.find((p) => p.id === id)
}
