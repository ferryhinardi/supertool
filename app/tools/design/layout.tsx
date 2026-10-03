import { CategoryWorkspaceLayout } from '@/components/features/tools/workspace/CategoryWorkspaceLayout'

export default function DesignToolsLayout({ children }: { children: React.ReactNode }) {
  return <CategoryWorkspaceLayout category="design">{children}</CategoryWorkspaceLayout>
}
