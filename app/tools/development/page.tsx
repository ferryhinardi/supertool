import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'
import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('development')

export default function DevelopmentCategoryPage() {
  return (
    <>
      <CategoryToolsHub category="development" />
      <CategoryHubJsonLd category="development" />
    </>
  )
}
