import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('media')

export default function MediaToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CategoryHubJsonLd category="media" />
    </>
  )
}
