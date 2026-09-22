import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'
import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('productivity')

export default function ProductivityCategoryPage() {
  return (
    <>
      <CategoryToolsHub category="productivity" />
      <CategoryHubJsonLd category="productivity" />
    </>
  )
}
