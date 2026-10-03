import { CategoryWorkspaceLayout } from '@/components/features/tools/workspace/CategoryWorkspaceLayout'

export default function ProductivityToolsLayout({ children }: { children: React.ReactNode }) {
  return <CategoryWorkspaceLayout category="productivity">{children}</CategoryWorkspaceLayout>
}
