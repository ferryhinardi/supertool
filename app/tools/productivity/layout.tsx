import { ProductivityWorkspaceChrome } from '@/components/features/tools/ProductivityWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function ProductivityToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ w: 'full' })}>
      <ProductivityWorkspaceChrome />
      {children}
    </div>
  )
}
