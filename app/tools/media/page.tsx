import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'
import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('media')

export default function MediaCategoryPage() {
  return (
    <>
      <CategoryToolsHub category="media" />
      <CategoryHubJsonLd category="media" />
    </>
  )
}
