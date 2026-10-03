'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ToolPageHeader } from '@/components/features/tools/workspace/ToolPageHeader'

export interface DesignToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function DesignToolHeader(props: DesignToolHeaderProps) {
  return <ToolPageHeader category="design" {...props} />
}
