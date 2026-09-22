import { CategoryToolsHub } from '@/components/features/tools/CategoryToolsHub'
import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('finance')

export default function FinanceCategoryPage() {
  return (
    <>
      <CategoryToolsHub category="finance" />
      <CategoryHubJsonLd category="finance" />
    </>
  )
}
