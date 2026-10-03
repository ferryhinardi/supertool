import { ProductivityWorkspaceChrome } from '@/components/features/tools/ProductivityWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function ProductivityToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ mx: 'auto', w: 'full', maxW: '7xl' })}>
      <ProductivityWorkspaceChrome />
      {children}
    </div>
  )
}
