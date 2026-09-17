import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('design')

export default function DesignToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CategoryHubJsonLd category="design" />
    </>
  )
}
