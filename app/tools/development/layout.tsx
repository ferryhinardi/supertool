import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('development')

export default function DevelopmentToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CategoryHubJsonLd category="development" />
    </>
  )
}
