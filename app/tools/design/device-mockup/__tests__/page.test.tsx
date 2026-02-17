import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  DEVICE_FRAMES,
  getDeviceById,
  getDevicesByCategory,
  getPopularDevices,
} from '../device-frames'
import DeviceMockupPage from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock analytics
vi.mock('@/lib/services/analytics', () => ({
  trackToolEvent: vi.fn(),
}))

// Mock URL APIs
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()
Object.defineProperty(URL, 'createObjectURL', { value: mockCreateObjectURL })
Object.defineProperty(URL, 'revokeObjectURL', { value: mockRevokeObjectURL })

// Mock canvas context
const mockCanvasContext = {
  fillStyle: '',
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  roundRect: vi.fn(),
  fill: vi.fn(),
  arc: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  clip: vi.fn(),
  drawImage: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
}

// Mock canvas element
HTMLCanvasElement.prototype.getContext = vi.fn(
  () => mockCanvasContext
) as unknown as typeof HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.toBlob = vi.fn((callback) => {
  callback(new Blob(['mock-blob'], { type: 'image/png' }))
}) as unknown as typeof HTMLCanvasElement.prototype.toBlob

// Helper to create mock file
const createMockFile = (name: string, type: string, size: number = 1024) => {
  const buffer = new ArrayBuffer(size)
  const file = new File([buffer], name, { type })
  return file
}

// Store original FileReader
const OriginalFileReader = global.FileReader

// Mock FileReader class
class MockFileReader {
  onload: ((event: ProgressEvent<FileReader>) => void) | null = null
  onerror: ((event: ProgressEvent<FileReader>) => void) | null = null
  result: string | ArrayBuffer | null = null

  readAsDataURL(_file: Blob) {
    // Simulate async file reading
    setTimeout(() => {
      this.result = 'data:image/png;base64,mockdata'
      if (this.onload) {
        this.onload({ target: { result: this.result } } as unknown as ProgressEvent<FileReader>)
      }
    }, 10)
  }
}

describe('DeviceMockupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Setup FileReader mock
    global.FileReader = MockFileReader as unknown as typeof FileReader
  })

  afterEach(() => {
    global.FileReader = OriginalFileReader
  })

  describe('Initial Render', () => {
    it('renders the page title and description', () => {
      render(<DeviceMockupPage />)

      expect(screen.getByText('Device Mockup Generator')).toBeInTheDocument()
      expect(screen.getByText('Create Professional Device Mockups')).toBeInTheDocument()
      expect(
        screen.getByText(/Upload your screenshot and showcase it in realistic device frames/i)
      ).toBeInTheDocument()
    })

    it('renders upload section when no image is uploaded', () => {
      render(<DeviceMockupPage />)

      expect(screen.getByText('Upload Screenshot')).toBeInTheDocument()
      expect(
        screen.getByText('Upload your app or website screenshot to get started')
      ).toBeInTheDocument()
      expect(screen.getByText(/Click to upload or drag and drop/i)).toBeInTheDocument()
      expect(screen.getByText('PNG, JPG, WebP (Max 10MB)')).toBeInTheDocument()
    })

    it('does not show device selection or preview before image upload', () => {
      render(<DeviceMockupPage />)

      expect(screen.queryByText('Device Frame')).not.toBeInTheDocument()
      expect(screen.queryByText('Preview')).not.toBeInTheDocument()
      expect(screen.queryByText('Background')).not.toBeInTheDocument()
    })
  })

  describe('File Upload', () => {
    it('uploads image successfully', async () => {
      render(<DeviceMockupPage />)

      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    })

    it('rejects non-image files', async () => {
      render(<DeviceMockupPage />)

      const file = createMockFile('test.pdf', 'application/pdf')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please upload a valid image file')
      })
    })

    it('rejects files larger than 10MB', async () => {
      render(<DeviceMockupPage />)

      const file = createMockFile('large.png', 'image/png', 11 * 1024 * 1024)
      const input = document.querySelector('input[type="file"]') as HTMLInputElement

      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Image size must be less than 10MB')
      })
    })

    it('opens file input when upload area is clicked', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)

      const uploadButton = screen.getByText(/Click to upload or drag and drop/i).closest('button')
      expect(uploadButton).toBeInTheDocument()

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      const clickSpy = vi.spyOn(fileInput, 'click')

      await user.click(uploadButton!)

      expect(clickSpy).toHaveBeenCalled()
    })

    it('handles empty file selection gracefully', () => {
      render(<DeviceMockupPage />)

      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [] } })

      // Should not crash, and no toasts should be called
      expect(toast.success).not.toHaveBeenCalled()
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  describe('Device Selection', () => {
    const uploadImage = async () => {
      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    }

    it('shows device selection after image upload', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Device Frame')).toBeInTheDocument()
        expect(screen.getByText('Choose a device to showcase your screenshot')).toBeInTheDocument()
      })
    })

    it('shows all category filters', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('All Devices')).toBeInTheDocument()
        expect(screen.getByText('Phones')).toBeInTheDocument()
        expect(screen.getByText('Tablets')).toBeInTheDocument()
        expect(screen.getByText('Laptops')).toBeInTheDocument()
        expect(screen.getByText('Desktops')).toBeInTheDocument()
      })
    })

    it('displays device list with all devices', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
        expect(screen.getByText('Samsung Galaxy S24')).toBeInTheDocument()
        expect(screen.getByText('iPad Pro 12.9"')).toBeInTheDocument()
        expect(screen.getByText('MacBook Pro 16"')).toBeInTheDocument()
      })
    })

    it('shows Popular badge for popular devices', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        const popularBadges = screen.getAllByText('Popular')
        expect(popularBadges.length).toBeGreaterThan(0)
      })
    })

    it('filters devices by phone category', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Phones')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Phones'))

      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
        expect(screen.getByText('Samsung Galaxy S24')).toBeInTheDocument()
        // Should not show tablets/laptops/desktops
        expect(screen.queryByText('iPad Pro 12.9"')).not.toBeInTheDocument()
        expect(screen.queryByText('MacBook Pro 16"')).not.toBeInTheDocument()
      })
    })

    it('filters devices by tablet category', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Tablets')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Tablets'))

      await waitFor(() => {
        expect(screen.getByText('iPad Pro 12.9"')).toBeInTheDocument()
        expect(screen.getByText('iPad Air')).toBeInTheDocument()
        // Should not show phones
        expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument()
      })
    })

    it('filters devices by laptop category', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Laptops')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Laptops'))

      await waitFor(() => {
        expect(screen.getByText('MacBook Pro 16"')).toBeInTheDocument()
        expect(screen.getByText('MacBook Air')).toBeInTheDocument()
        // Should not show phones
        expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument()
      })
    })

    it('filters devices by desktop category', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Desktops')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Desktops'))

      await waitFor(() => {
        expect(screen.getByText('iMac 24"')).toBeInTheDocument()
        expect(screen.getByText('Studio Display')).toBeInTheDocument()
        // Should not show phones
        expect(screen.queryByText('iPhone 15 Pro')).not.toBeInTheDocument()
      })
    })

    it('shows device dimensions', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        // Check for iPhone 15 Pro dimensions
        expect(screen.getByText('393 × 852')).toBeInTheDocument()
      })
    })

    it('selects device when clicked', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
      })

      await user.click(screen.getByText('iPhone 15 Pro'))

      // The Preview card description should update to show device name
      await waitFor(() => {
        // Device should now be selected - check for Rotate button (only shows when device selected)
        expect(screen.getByRole('button', { name: /Rotate/i })).toBeInTheDocument()
      })
    })
  })

  describe('Preview and Canvas', () => {
    const uploadImage = async () => {
      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    }

    it('shows preview section after image upload', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument()
        expect(screen.getByText('Select a device frame')).toBeInTheDocument()
      })
    })

    it('shows message to select device before selection', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Select a device frame to preview your mockup')).toBeInTheDocument()
      })
    })

    it('shows Export button after image upload', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument()
      })
    })

    it('Export button is disabled when no device is selected', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Export/i })
        expect(exportButton).toBeDisabled()
      })
    })

    it('hides the select device message after device is selected', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
      })

      await user.click(screen.getByText('iPhone 15 Pro'))

      await waitFor(() => {
        expect(
          screen.queryByText('Select a device frame to preview your mockup')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('Background Customization', () => {
    const uploadImage = async () => {
      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    }

    it('shows background customization section', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Background')).toBeInTheDocument()
        expect(screen.getByText('Customize the background appearance')).toBeInTheDocument()
      })
    })

    it('shows background type options', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Type')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /none/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /solid/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /gradient/i })).toBeInTheDocument()
      })
    })

    it('defaults to gradient background type', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        // Gradient should be selected by default
        expect(screen.getByText('Gradient Start')).toBeInTheDocument()
        expect(screen.getByText('Gradient End')).toBeInTheDocument()
      })
    })

    it('switches to solid color mode when clicked', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /solid/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /solid/i }))

      await waitFor(() => {
        expect(screen.getByText('Color')).toBeInTheDocument()
        // Gradient options should disappear
        expect(screen.queryByText('Gradient Start')).not.toBeInTheDocument()
      })
    })

    it('switches to none mode when clicked', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /none/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /none/i }))

      await waitFor(() => {
        // No color options should be shown
        expect(screen.queryByText('Color')).not.toBeInTheDocument()
        expect(screen.queryByText('Gradient Start')).not.toBeInTheDocument()
      })
    })

    it('shows gradient angle slider', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText(/Angle: 135°/i)).toBeInTheDocument()
      })
    })

    it('updates gradient angle when slider is changed', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByLabelText(/Angle: 135°/i)).toBeInTheDocument()
      })

      const slider = screen.getByLabelText(/Angle: 135°/i)
      fireEvent.change(slider, { target: { value: '90' } })

      await waitFor(() => {
        expect(screen.getByText(/Angle: 90°/i)).toBeInTheDocument()
      })
    })
  })

  describe('Orientation Toggle', () => {
    const uploadImage = async () => {
      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    }

    it('shows rotate button when device is selected', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
      })

      await user.click(screen.getByText('iPhone 15 Pro'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Rotate/i })).toBeInTheDocument()
      })
    })

    it('does not show rotate button when no device is selected', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('Preview')).toBeInTheDocument()
      })

      expect(screen.queryByRole('button', { name: /Rotate/i })).not.toBeInTheDocument()
    })
  })

  describe('Change Image', () => {
    const uploadImage = async () => {
      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    }

    it('shows Change Image button after image upload', async () => {
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Change Image/i })).toBeInTheDocument()
      })
    })

    it('resets to upload state when Change Image is clicked', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Change Image/i })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: /Change Image/i }))

      await waitFor(() => {
        expect(screen.getByText('Upload Screenshot')).toBeInTheDocument()
        expect(screen.queryByText('Device Frame')).not.toBeInTheDocument()
      })
    })
  })

  describe('Export Functionality', () => {
    const uploadImage = async () => {
      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Image uploaded successfully!')
      })
    }

    it('enables Export button when device is selected', async () => {
      const user = userEvent.setup()
      render(<DeviceMockupPage />)
      await uploadImage()

      await waitFor(() => {
        expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument()
      })

      await user.click(screen.getByText('iPhone 15 Pro'))

      await waitFor(() => {
        const exportButton = screen.getByRole('button', { name: /Export/i })
        expect(exportButton).not.toBeDisabled()
      })
    })
  })

  describe('Accessibility', () => {
    it('has accessible upload button', () => {
      render(<DeviceMockupPage />)

      const uploadButton = screen.getByText(/Click to upload or drag and drop/i).closest('button')
      expect(uploadButton).toHaveAttribute('type', 'button')
    })

    it('has accessible file input', () => {
      render(<DeviceMockupPage />)

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('renders color inputs with labels', async () => {
      render(<DeviceMockupPage />)

      const file = createMockFile('test.png', 'image/png')
      const input = document.querySelector('input[type="file"]') as HTMLInputElement
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => {
        expect(screen.getByLabelText('Gradient Start')).toBeInTheDocument()
        expect(screen.getByLabelText('Gradient End')).toBeInTheDocument()
      })
    })
  })
})

describe('device-frames utilities', () => {
  describe('DEVICE_FRAMES', () => {
    it('contains expected number of devices', () => {
      expect(DEVICE_FRAMES.length).toBeGreaterThan(0)
    })

    it('all devices have required properties', () => {
      DEVICE_FRAMES.forEach((device) => {
        expect(device.id).toBeDefined()
        expect(device.name).toBeDefined()
        expect(device.category).toBeDefined()
        expect(device.screenWidth).toBeGreaterThan(0)
        expect(device.screenHeight).toBeGreaterThan(0)
        expect(device.frameWidth).toBeGreaterThan(0)
        expect(device.frameHeight).toBeGreaterThan(0)
        expect(device.screenX).toBeGreaterThanOrEqual(0)
        expect(device.screenY).toBeGreaterThanOrEqual(0)
        expect(device.borderRadius).toBeGreaterThanOrEqual(0)
        expect(device.shadowColor).toBeDefined()
        expect(device.frameColor).toBeDefined()
      })
    })

    it('frame dimensions are larger than screen dimensions', () => {
      DEVICE_FRAMES.forEach((device) => {
        expect(device.frameWidth).toBeGreaterThan(device.screenWidth)
        expect(device.frameHeight).toBeGreaterThan(device.screenHeight)
      })
    })

    it('contains all categories', () => {
      const categories = new Set(DEVICE_FRAMES.map((d) => d.category))
      expect(categories.has('phone')).toBe(true)
      expect(categories.has('tablet')).toBe(true)
      expect(categories.has('laptop')).toBe(true)
      expect(categories.has('desktop')).toBe(true)
    })
  })

  describe('getDevicesByCategory', () => {
    it('filters phone devices correctly', () => {
      const phones = getDevicesByCategory('phone')
      expect(phones.length).toBeGreaterThan(0)
      phones.forEach((device) => {
        expect(device.category).toBe('phone')
      })
    })

    it('filters tablet devices correctly', () => {
      const tablets = getDevicesByCategory('tablet')
      expect(tablets.length).toBeGreaterThan(0)
      tablets.forEach((device) => {
        expect(device.category).toBe('tablet')
      })
    })

    it('filters laptop devices correctly', () => {
      const laptops = getDevicesByCategory('laptop')
      expect(laptops.length).toBeGreaterThan(0)
      laptops.forEach((device) => {
        expect(device.category).toBe('laptop')
      })
    })

    it('filters desktop devices correctly', () => {
      const desktops = getDevicesByCategory('desktop')
      expect(desktops.length).toBeGreaterThan(0)
      desktops.forEach((device) => {
        expect(device.category).toBe('desktop')
      })
    })
  })

  describe('getPopularDevices', () => {
    it('returns only popular devices', () => {
      const popular = getPopularDevices()
      expect(popular.length).toBeGreaterThan(0)
      popular.forEach((device) => {
        expect(device.popular).toBe(true)
      })
    })

    it('includes expected popular devices', () => {
      const popular = getPopularDevices()
      const popularIds = popular.map((d) => d.id)
      expect(popularIds).toContain('iphone-15-pro')
      expect(popularIds).toContain('macbook-pro-16')
    })
  })

  describe('getDeviceById', () => {
    it('finds device by id', () => {
      const device = getDeviceById('iphone-15-pro')
      expect(device).toBeDefined()
      expect(device?.name).toBe('iPhone 15 Pro')
    })

    it('returns undefined for unknown id', () => {
      const device = getDeviceById('unknown-device')
      expect(device).toBeUndefined()
    })

    it('finds all devices by their ids', () => {
      DEVICE_FRAMES.forEach((device) => {
        const found = getDeviceById(device.id)
        expect(found).toBeDefined()
        expect(found?.id).toBe(device.id)
      })
    })
  })
})
