import type { ReactNode } from 'react'
import { ToolPageFrame } from '@/components/features/tools/workspace/ToolPageFrame'
import {
  ToolPageHeader,
  type ToolPageHeaderProps,
} from '@/components/features/tools/workspace/ToolPageHeader'

export interface ToolPageProps extends ToolPageHeaderProps {
  children: ReactNode
}

export function ToolPage({ children, ...header }: ToolPageProps) {
  return (
    <ToolPageFrame>
      <ToolPageHeader {...header} />
      {children}
    </ToolPageFrame>
  )
}
