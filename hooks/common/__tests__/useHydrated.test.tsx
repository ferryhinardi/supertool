import { render, screen } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { useHydrated } from '../useHydrated'

function Probe() {
  return <span>{useHydrated() ? 'client' : 'server'}</span>
}

describe('useHydrated', () => {
  it('is false in server HTML', () => {
    expect(renderToString(<Probe />)).toContain('server')
  })

  it('is true for client renders', () => {
    render(<Probe />)
    expect(screen.getByText('client')).toBeInTheDocument()
  })
})
