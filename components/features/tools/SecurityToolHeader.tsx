'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { ToolPageHeader } from '@/components/features/tools/workspace/ToolPageHeader'

export interface SecurityToolHeaderProps {
  title: ReactNode
  description: string
  eyebrow?: string
  icon: LucideIcon
  highlights?: string[]
}

export function SecurityToolHeader(props: SecurityToolHeaderProps) {
  return <ToolPageHeader category="security" {...props} />
}
