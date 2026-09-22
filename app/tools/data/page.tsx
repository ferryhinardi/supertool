import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'
import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('data')

export default function DataCategoryPage() {
  return (
    <>
      <CategoryToolsHub category="data" />
      <CategoryHubJsonLd category="data" />
    </>
  )
}
