import type { ReactNode } from 'react'
import { toolPageMainClass } from '@/components/features/tools/workspace/tool-page-styles'

export interface ToolPageFrameProps {
  children: ReactNode
}

export function ToolPageFrame({ children }: ToolPageFrameProps) {
  return <main className={toolPageMainClass}>{children}</main>
}
