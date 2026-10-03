import { CategoryWorkspaceLayout } from '@/components/features/tools/workspace/CategoryWorkspaceLayout'

export default function FinanceToolsLayout({ children }: { children: React.ReactNode }) {
  return <CategoryWorkspaceLayout category="finance">{children}</CategoryWorkspaceLayout>
}
