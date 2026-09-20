import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('finance')

export default function FinanceToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CategoryHubJsonLd category="finance" />
    </>
  )
}
