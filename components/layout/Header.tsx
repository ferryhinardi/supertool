'use client'

import { FeedbackDialog } from '@/components/features/shared/FeedbackDialog'
import { css } from '@/styled-system/css'

export default function Header() {
  return (
    <header
      className={css({
        position: 'sticky',
        top: '0',
        zIndex: '10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'gray.800',
        bg: 'gray.900',
        p: '4',
      })}
    >
      <h1 className={css({ fontSize: 'lg', fontWeight: 'semibold' })}>Dashboard</h1>
      <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
        <FeedbackDialog />
      </div>
    </header>
  )
}
