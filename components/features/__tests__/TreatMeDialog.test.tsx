import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TreatMeDialog } from '../TreatMeDialog'

describe('TreatMeDialog', () => {
  it('renders without crashing', () => {
    const { container } = render(<TreatMeDialog />)
    expect(container).toBeInTheDocument()
  })
})
