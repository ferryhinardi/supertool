import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WorkspaceHeader } from '@/components/layout/WorkspaceHeader'

describe('WorkspaceHeader', () => {
  it('names the data workspace and the local processing promise', () => {
    render(<WorkspaceHeader />)

    expect(screen.getByText('Data Processing')).toBeInTheDocument()
    expect(screen.getByText('Runs in your browser')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })
})
