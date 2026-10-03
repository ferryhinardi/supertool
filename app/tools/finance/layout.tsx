import { FinanceWorkspaceChrome } from '@/components/features/tools/FinanceWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function FinanceToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ mx: 'auto', w: 'full', maxW: '7xl' })}>
      <FinanceWorkspaceChrome />
      {children}
    </div>
  )
}
