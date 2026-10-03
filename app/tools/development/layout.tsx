import { CategoryWorkspaceLayout } from '@/components/features/tools/workspace/CategoryWorkspaceLayout'

export default function DevelopmentToolsLayout({ children }: { children: React.ReactNode }) {
  return <CategoryWorkspaceLayout category="development">{children}</CategoryWorkspaceLayout>
}
