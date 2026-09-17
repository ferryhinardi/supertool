import { CategoryHubJsonLd, createCategoryHubMetadata } from '@/lib/data/category-hub-layout'

export const metadata = createCategoryHubMetadata('security')

export default function SecurityToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CategoryHubJsonLd category="security" />
    </>
  )
}
