import { CategoryWorkspaceLayout } from '@/components/features/tools/workspace/CategoryWorkspaceLayout'

export default function DataToolsLayout({ children }: { children: React.ReactNode }) {
  return <CategoryWorkspaceLayout category="data">{children}</CategoryWorkspaceLayout>
}
