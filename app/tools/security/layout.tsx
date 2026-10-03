import { CategoryWorkspaceLayout } from '@/components/features/tools/workspace/CategoryWorkspaceLayout'

export default function SecurityToolsLayout({ children }: { children: React.ReactNode }) {
  return <CategoryWorkspaceLayout category="security">{children}</CategoryWorkspaceLayout>
}
