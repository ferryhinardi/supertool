import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'
import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('security')

export default function SecurityCategoryPage() {
  return (
    <>
      <CategoryToolsHub category="security" />
      <CategoryHubJsonLd category="security" />
    </>
  )
}
