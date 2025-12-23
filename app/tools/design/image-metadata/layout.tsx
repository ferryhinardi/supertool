import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/data/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Image Metadata Viewer - Extract EXIF, GPS & Camera Settings',
  description:
    'Free online image metadata viewer to extract EXIF data, GPS location, camera settings, and technical metadata from photos. View aperture, shutter speed, ISO, focal length, date taken, and more. Perfect for photographers and image professionals.',
  keywords: [
    'exif viewer',
    'image metadata',
    'photo metadata',
    'exif data',
    'gps location',
    'camera settings',
    'exif reader',
    'image properties',
    'photo information',
    'camera exif',
    'metadata extractor',
    'photo exif viewer',
    'image exif',
    'jpeg metadata',
    'photo details',
  ],
  category: 'design',
  path: '/tools/image-metadata',
})

export default function ImageMetadataLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
