import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { setupUserEvent } from '@/test-utils/userEvent'

function ControlledTextareaWithMotion() {
  const [value, setValue] = useState('')
  return (
    <motion.div animate={{ opacity: 1 }} initial={{ opacity: 0 }}>
      <textarea
        placeholder="Motion textarea"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={4}
      />
    </motion.div>
  )
}

describe('Framer Motion Mock Investigation', () => {
  it('should check if motion is mocked', async () => {
    console.log('motion.div type:', typeof motion.div)
    console.log('motion.div:', motion.div)

    const user = setupUserEvent()
    const { container } = render(<ControlledTextareaWithMotion />)

    console.log('Rendered HTML:', container.innerHTML)

    const textarea = screen.getByPlaceholderText('Motion textarea') as HTMLTextAreaElement

    console.log('Before typing, value:', textarea.value)
    await user.type(textarea, 'Cover')
    console.log('After typing, value:', textarea.value)

    expect(textarea.value).toBe('Cover')
  })
})
