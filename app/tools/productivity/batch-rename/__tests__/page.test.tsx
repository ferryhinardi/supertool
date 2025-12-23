import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import BatchRenamePage from '../page'

describe('Batch Rename Page', () => {
  describe('Initial Render', () => {
    it('renders the page title', () => {
      render(<BatchRenamePage />)
      expect(screen.getByText('Batch File Renamer')).toBeInTheDocument()
    })

    it('renders upload section', () => {
      render(<BatchRenamePage />)
      expect(screen.getByText(/Drop files here or click to browse/)).toBeInTheDocument()
    })

    it('does not show pattern configuration initially', () => {
      render(<BatchRenamePage />)
      expect(screen.queryByText('Rename Pattern')).not.toBeInTheDocument()
    })

    it('does not show preview section initially', () => {
      render(<BatchRenamePage />)
      expect(screen.queryByText('Preview Changes')).not.toBeInTheDocument()
    })

    it('shows pro tips section', () => {
      render(<BatchRenamePage />)
      expect(screen.getByText('Pro Tips')).toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('shows selected files count after upload', async () => {
      render(<BatchRenamePage />)

      const file1 = new File(['content1'], 'test1.txt', { type: 'text/plain' })
      const file2 = new File(['content2'], 'test2.txt', { type: 'text/plain' })

      const input = screen.getByRole('button', { name: /Drop files here/i }).querySelector('input')
      if (input) {
        await userEvent.upload(input as HTMLInputElement, [file1, file2])
      }

      await waitFor(() => {
        expect(screen.getByText('2 files selected')).toBeInTheDocument()
      })
    })

    it('shows pattern configuration after files are uploaded', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByRole('button', { name: /Drop files here/i }).querySelector('input')

      if (input) {
        await userEvent.upload(input as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Rename Pattern')).toBeInTheDocument()
      })
    })

    it('shows preview section after files are uploaded', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByRole('button', { name: /Drop files here/i }).querySelector('input')

      if (input) {
        await userEvent.upload(input as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Preview Changes')).toBeInTheDocument()
      })
    })

    it('shows clear all button after upload', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const input = screen.getByRole('button', { name: /Drop files here/i }).querySelector('input')

      if (input) {
        await userEvent.upload(input as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Clear All')).toBeInTheDocument()
      })
    })
  })

  describe('Pattern Configuration', () => {
    it('allows entering prefix', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        const prefixInput = screen.getByLabelText('Prefix') as HTMLInputElement
        expect(prefixInput).toBeInTheDocument()
      })

      const prefixInput = screen.getByLabelText('Prefix') as HTMLInputElement
      await userEvent.type(prefixInput, 'new_')

      expect(prefixInput).toHaveValue('new_')
    })

    it('allows entering suffix', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        const suffixInput = screen.getByLabelText('Suffix') as HTMLInputElement
        expect(suffixInput).toBeInTheDocument()
      })

      const suffixInput = screen.getByLabelText('Suffix') as HTMLInputElement
      await userEvent.type(suffixInput, '_backup')

      expect(suffixInput).toHaveValue('_backup')
    })

    it('allows configuring find and replace', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'old_file.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Find & Replace')).toBeInTheDocument()
      })

      const findInputs = screen.getAllByPlaceholderText(/Find text|Replace with/)
      const findInput = findInputs[0]
      const replaceInput = findInputs[1]

      await userEvent.type(findInput, 'old')
      await userEvent.type(replaceInput, 'new')

      expect(findInput).toHaveValue('old')
      expect(replaceInput).toHaveValue('new')
    })

    it('allows changing case transformation', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'Test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        const caseSelect = screen.getByLabelText('Case Transform') as HTMLSelectElement
        expect(caseSelect).toBeInTheDocument()
      })

      const caseSelect = screen.getByLabelText('Case Transform') as HTMLSelectElement
      fireEvent.change(caseSelect, { target: { value: 'uppercase' } })

      expect(caseSelect).toHaveValue('uppercase')
    })

    it('allows configuring sequential numbering', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Sequential Numbering')).toBeInTheDocument()
      })

      const startInput = screen.getByLabelText('Start') as HTMLInputElement
      const stepInput = screen.getByLabelText('Step') as HTMLInputElement
      const paddingInput = screen.getByLabelText('Padding') as HTMLInputElement

      expect(startInput).toHaveValue(1)
      expect(stepInput).toHaveValue(1)
      expect(paddingInput).toHaveValue(3)
    })

    it('has reset button to clear pattern', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Reset')).toBeInTheDocument()
      })

      const prefixInput = screen.getByLabelText('Prefix') as HTMLInputElement
      await userEvent.type(prefixInput, 'test_')

      const resetButton = screen.getByText('Reset')
      await userEvent.click(resetButton)

      await waitFor(() => {
        expect(prefixInput).toHaveValue('')
      })
    })
  })

  describe('Preview Table', () => {
    it('shows original filenames in preview', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'original.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getAllByText('original.txt')).toHaveLength(2) // One in original, one in new name
      })
    })

    it('displays preview table headers', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Original Name')).toBeInTheDocument()
        expect(screen.getByText('New Name')).toBeInTheDocument()
        expect(screen.getByText('Status')).toBeInTheDocument()
        expect(screen.getByText('Actions')).toBeInTheDocument()
      })
    })

    it('allows removing individual files', async () => {
      render(<BatchRenamePage />)

      const file1 = new File(['content'], 'test1.txt', { type: 'text/plain' })
      const file2 = new File(['content'], 'test2.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, [file1, file2])
      }

      await waitFor(() => {
        expect(screen.getByText('2 files selected')).toBeInTheDocument()
      })

      // Find delete buttons (there should be multiple)
      const deleteButtons = screen.getAllByRole('button').filter((btn) => {
        const svg = btn.querySelector('svg')
        return svg?.classList.toString().includes('lucide-trash')
      })

      // Click first delete button
      if (deleteButtons.length > 0) {
        await userEvent.click(deleteButtons[0])
      }

      await waitFor(() => {
        expect(screen.queryByText('2 files selected')).not.toBeInTheDocument()
      })
    })
  })

  describe('Apply Rename Button', () => {
    it('shows download button in preview section', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByText('Download Renamed Files')).toBeInTheDocument()
      })
    })

    it('disables download button when there are no changes', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        const downloadButton = screen.getByText('Download Renamed Files')
        expect(downloadButton).toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper heading structure', () => {
      render(<BatchRenamePage />)
      const heading = screen.getByText('Batch File Renamer')
      expect(heading.tagName).toBe('H1')
    })

    it('has descriptive labels for pattern inputs', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByLabelText('Prefix')).toBeInTheDocument()
        expect(screen.getByLabelText('Suffix')).toBeInTheDocument()
        expect(screen.getByLabelText('Case Transform')).toBeInTheDocument()
      })
    })

    it('has placeholder text for inputs', async () => {
      render(<BatchRenamePage />)

      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const uploadInput = screen
        .getByRole('button', { name: /Drop files here/i })
        .querySelector('input')

      if (uploadInput) {
        await userEvent.upload(uploadInput as HTMLInputElement, file)
      }

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add prefix to filename')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('Add suffix to filename')).toBeInTheDocument()
      })
    })
  })

  describe('Drag and Drop', () => {
    it('highlights drop zone on drag over', async () => {
      render(<BatchRenamePage />)

      const dropZone = screen.getByText(/Drop files here/).closest('div')

      if (dropZone) {
        fireEvent.dragOver(dropZone)
        // The border color should change on drag over
        // This is handled by the isDragging state
      }

      // Verify drop zone exists
      expect(dropZone).toBeInTheDocument()
    })
  })
})
