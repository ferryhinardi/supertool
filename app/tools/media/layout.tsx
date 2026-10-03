import { MediaWorkspaceChrome } from '@/components/features/tools/MediaWorkspaceChrome'
import { css } from '@/styled-system/css'

export default function MediaToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css({ mx: 'auto', w: 'full', maxW: '7xl' })}>
      <MediaWorkspaceChrome />
      {children}
    </div>
  )
}
