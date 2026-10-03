import { CategoryWorkspaceLayout } from '@/components/features/tools/workspace/CategoryWorkspaceLayout'

export default function MediaToolsLayout({ children }: { children: React.ReactNode }) {
  return <CategoryWorkspaceLayout category="media">{children}</CategoryWorkspaceLayout>
}
