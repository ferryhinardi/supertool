import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'
import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('design')

export default function DesignCategoryPage() {
  return (
    <>
      <CategoryToolsHub category="design" />
      <CategoryHubJsonLd category="design" />
    </>
  )
}
