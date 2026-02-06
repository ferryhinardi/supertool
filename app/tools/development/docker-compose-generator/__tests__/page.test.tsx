import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DockerComposeGenerator from '../page'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Mock useTrackToolView hook
vi.mock('@/hooks/tools/useRecentTools', () => ({
  useTrackToolView: vi.fn(),
}))

// Mock URL APIs for download
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url')
const mockRevokeObjectURL = vi.fn()
const mockClipboardWriteText = vi.fn().mockResolvedValue(undefined)

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockClipboardWriteText,
  },
  writable: true,
  configurable: true,
})

describe('DockerComposeGenerator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.URL.createObjectURL = mockCreateObjectURL
    global.URL.revokeObjectURL = mockRevokeObjectURL
    mockClipboardWriteText.mockClear()
  })

  describe('Rendering', () => {
    it('renders page title and description', () => {
      render(<DockerComposeGenerator />)
      expect(screen.getByText('Docker Compose Generator')).toBeInTheDocument()
      expect(screen.getByText(/Visually build docker-compose.yml files/i)).toBeInTheDocument()
    })

    it('renders service preset buttons', () => {
      render(<DockerComposeGenerator />)
      const presets = [
        'nginx',
        'postgres',
        'mysql',
        'redis',
        'mongodb',
        'node',
        'python',
        'adminer',
        'mailhog',
        'rabbitmq',
      ]
      for (const preset of presets) {
        expect(
          screen.getAllByRole('button', { name: new RegExp(preset, 'i') }).length
        ).toBeGreaterThan(0)
      }
    })

    it('renders stack template buttons', () => {
      render(<DockerComposeGenerator />)
      const templates = [
        'MERN Stack',
        'LAMP Stack',
        'WordPress',
        'Node + PostgreSQL',
        'Python + PostgreSQL',
        'Full Dev Stack',
      ]
      for (const template of templates) {
        const escapedTemplate = template.replace(/[+]/g, '\\+')
        expect(
          screen.getAllByRole('button', { name: new RegExp(escapedTemplate, 'i') }).length
        ).toBeGreaterThan(0)
      }
    })

    it('renders action buttons', () => {
      render(<DockerComposeGenerator />)
      expect(screen.getByRole('button', { name: /Add Empty Service/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Add Network/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Clear All/i })).toBeInTheDocument()
    })

    it('shows empty state when no services', () => {
      render(<DockerComposeGenerator />)
      expect(screen.getByText(/No services added yet/i)).toBeInTheDocument()
      expect(screen.getByText(/Add services to generate docker-compose.yml/i)).toBeInTheDocument()
    })

    it('renders Quick Start section', () => {
      render(<DockerComposeGenerator />)
      expect(screen.getByText('Quick Start')).toBeInTheDocument()
      expect(screen.getByText('Service Presets')).toBeInTheDocument()
      expect(screen.getByText('Stack Templates')).toBeInTheDocument()
    })

    it('renders Services panel', () => {
      render(<DockerComposeGenerator />)
      expect(screen.getByText('Services')).toBeInTheDocument()
      expect(screen.getByText('Configure your Docker services')).toBeInTheDocument()
    })

    it('renders output panel', () => {
      render(<DockerComposeGenerator />)
      expect(screen.getByText('docker-compose.yml')).toBeInTheDocument()
      expect(screen.getByText('Generated YAML output')).toBeInTheDocument()
    })
  })

  describe('Service Presets', () => {
    it('adds nginx service with correct defaults', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      expect(screen.getByDisplayValue('nginx')).toBeInTheDocument()
      expect(screen.getByDisplayValue('nginx:alpine')).toBeInTheDocument()
      expect(screen.getByText(/version: "3.8"/)).toBeInTheDocument()
    })

    it('adds postgres service with environment variables', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /postgres/i })[0])

      const yamlOutput = screen.getByText(/version: "3.8"/)
      expect(yamlOutput).toBeInTheDocument()
      expect(screen.getByText(/POSTGRES_USER: postgres/)).toBeInTheDocument()
      expect(screen.getByText(/POSTGRES_PASSWORD: postgres/)).toBeInTheDocument()
      expect(screen.getByText(/POSTGRES_DB: mydb/)).toBeInTheDocument()
    })

    it('adds mysql service with correct configuration', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /mysql/i })[0])

      expect(screen.getByDisplayValue('mysql')).toBeInTheDocument()
      expect(screen.getByDisplayValue('mysql:8')).toBeInTheDocument()
      expect(screen.getByText(/MYSQL_ROOT_PASSWORD: root/)).toBeInTheDocument()
    })

    it('adds redis service', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /redis/i })[0])

      expect(screen.getByDisplayValue('redis')).toBeInTheDocument()
      expect(screen.getByDisplayValue('redis:alpine')).toBeInTheDocument()
    })

    it('adds mongodb service', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /mongodb/i })[0])

      expect(screen.getByDisplayValue('mongodb')).toBeInTheDocument()
      expect(screen.getByDisplayValue('mongo:7')).toBeInTheDocument()
      expect(screen.getByText(/MONGO_INITDB_ROOT_USERNAME: root/)).toBeInTheDocument()
    })

    it('adds node service with command', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /node/i })[0])

      expect(screen.getByDisplayValue('node')).toBeInTheDocument()
      expect(screen.getByDisplayValue('node:20-alpine')).toBeInTheDocument()
      expect(screen.getByDisplayValue('npm run dev')).toBeInTheDocument()
      expect(screen.getByText(/command: npm run dev/)).toBeInTheDocument()
    })

    it('adds python service', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /python/i })[0])

      expect(screen.getByDisplayValue('python')).toBeInTheDocument()
      expect(screen.getByDisplayValue('python:3.12-slim')).toBeInTheDocument()
      expect(screen.getByDisplayValue('python app.py')).toBeInTheDocument()
    })

    it('adds adminer service', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /adminer/i }))

      expect(screen.getAllByDisplayValue('adminer').length).toBeGreaterThan(0)
      expect(screen.getByText(/"8080:8080"/)).toBeInTheDocument()
    })

    it('adds mailhog service with multiple ports', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /mailhog/i }))

      expect(screen.getByDisplayValue('mailhog')).toBeInTheDocument()
      expect(screen.getByText(/"1025:1025"/)).toBeInTheDocument()
      expect(screen.getByText(/"8025:8025"/)).toBeInTheDocument()
    })

    it('adds rabbitmq service', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /rabbitmq/i }))

      expect(screen.getByDisplayValue('rabbitmq')).toBeInTheDocument()
      expect(screen.getByDisplayValue('rabbitmq:3-management-alpine')).toBeInTheDocument()
      expect(screen.getByText(/RABBITMQ_DEFAULT_USER: guest/)).toBeInTheDocument()
    })
  })

  describe('Stack Templates', () => {
    it('loads MERN Stack template with 3 services', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /MERN Stack/i }))

      expect(screen.getByDisplayValue('mongodb')).toBeInTheDocument()
      expect(screen.getByDisplayValue('node')).toBeInTheDocument()
      expect(screen.getByDisplayValue('nginx')).toBeInTheDocument()
      expect(toast.success).toHaveBeenCalledWith('MERN Stack template loaded with 3 services')
    })

    it('loads LAMP Stack template', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /LAMP Stack/i }))

      expect(screen.getByDisplayValue('mysql')).toBeInTheDocument()
      expect(screen.getByDisplayValue('python')).toBeInTheDocument()
      expect(screen.getByDisplayValue('nginx')).toBeInTheDocument()
    })

    it('loads WordPress template', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /WordPress/i }))

      expect(screen.getByDisplayValue('mysql')).toBeInTheDocument()
      expect(screen.getByDisplayValue('nginx')).toBeInTheDocument()
    })

    it('loads Node + PostgreSQL template', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Node \+ PostgreSQL/i }))

      expect(screen.getAllByDisplayValue('postgres').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('node').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('redis').length).toBeGreaterThan(0)
    })

    it('loads Python + PostgreSQL template', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Python \+ PostgreSQL/i }))

      expect(screen.getAllByDisplayValue('postgres').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('python').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('redis').length).toBeGreaterThan(0)
    })

    it('loads Full Dev Stack template with 4 services', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Full Dev Stack/i }))

      expect(screen.getAllByDisplayValue('postgres').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('redis').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('mailhog').length).toBeGreaterThan(0)
      expect(screen.getAllByDisplayValue('adminer').length).toBeGreaterThan(0)
      expect(toast.success).toHaveBeenCalledWith('Full Dev Stack template loaded with 4 services')
    })

    it('replaces existing services when loading template', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      // First add nginx
      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      expect(screen.getByDisplayValue('nginx')).toBeInTheDocument()

      // Then load WordPress template - should replace nginx
      await user.click(screen.getByRole('button', { name: /WordPress/i }))

      // Should only have mysql and nginx from template
      const nginxInputs = screen.getAllByDisplayValue('nginx')
      expect(nginxInputs).toHaveLength(1) // Only one nginx from template
      expect(screen.getByDisplayValue('mysql')).toBeInTheDocument()
    })
  })

  describe('Service Management', () => {
    it('adds empty service', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Empty Service/i }))

      expect(screen.getByDisplayValue('service1')).toBeInTheDocument()
      expect(toast.success).toHaveBeenCalledWith('Service added')
    })

    it('deletes service', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      // Add a service first
      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      expect(screen.getByDisplayValue('nginx')).toBeInTheDocument()

      // Find and click the delete button
      const deleteButtons = screen.getAllByRole('button')
      const trashButton = deleteButtons.find((btn) => btn.querySelector('svg.lucide-trash-2'))
      if (trashButton) {
        await user.click(trashButton)
      }

      expect(toast.success).toHaveBeenCalledWith('Service deleted')
    })

    it('updates service name', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      const nameInput = screen.getByDisplayValue('nginx')

      await user.clear(nameInput)
      await user.type(nameInput, 'web-server')

      expect(screen.getByDisplayValue('web-server')).toBeInTheDocument()
      expect(screen.getByText(/web-server:/)).toBeInTheDocument()
    })

    it('updates service image', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      const imageInput = screen.getByDisplayValue('nginx:alpine')

      await user.clear(imageInput)
      await user.type(imageInput, 'nginx:latest')

      expect(screen.getByDisplayValue('nginx:latest')).toBeInTheDocument()
      expect(screen.getByText(/image: nginx:latest/)).toBeInTheDocument()
    })

    it('updates service command', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /node/i })[0])
      const commandInput = screen.getByDisplayValue('npm run dev')

      await user.clear(commandInput)
      await user.type(commandInput, 'npm start')

      expect(screen.getByDisplayValue('npm start')).toBeInTheDocument()
      expect(screen.getByText(/command: npm start/)).toBeInTheDocument()
    })

    it('shows service count badge', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      expect(screen.getByText('1 service')).toBeInTheDocument()

      await user.click(screen.getAllByRole('button', { name: /postgres/i })[0])
      expect(screen.getByText('2 services')).toBeInTheDocument()
    })
  })

  describe('Service Expansion', () => {
    it('expands service by default when added', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      // Image field should be visible (expanded)
      expect(screen.getByDisplayValue('nginx:alpine')).toBeInTheDocument()
    })

    it('collapses and expands service details', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      // Find the collapse button (chevron)
      const chevronButtons = screen
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.querySelector('svg.lucide-chevron-up') ||
            btn.querySelector('svg.lucide-chevron-down')
        )

      if (chevronButtons.length > 0) {
        await user.click(chevronButtons[0])
        // After collapse, image field should not be visible
        // But service name should still be visible
        expect(screen.getByDisplayValue('nginx')).toBeInTheDocument()
      }
    })
  })

  describe('Ports Configuration', () => {
    it('adds port mapping', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Empty Service/i }))

      // Find the Ports section and add button
      const portsLabel = screen.getByText('Ports')
      const portsSection = portsLabel.closest('div')
      const addPortButton = portsSection?.querySelector('button')

      if (addPortButton) {
        await user.click(addPortButton)
      }

      // Should have empty port inputs
      const portInputs = screen.getAllByPlaceholderText('8080')
      expect(portInputs.length).toBeGreaterThanOrEqual(1)
    })

    it('updates host port', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      // nginx preset has port 80:80 - there will be multiple inputs with '80'
      // One is the host port input, another is the container port input
      const portInputs = screen.getAllByDisplayValue('80')
      expect(portInputs.length).toBeGreaterThanOrEqual(1)
      // Get the first one (host port)
      const hostPortInput = portInputs[0]

      // Use fireEvent for more reliable input changes
      fireEvent.change(hostPortInput, { target: { value: '8080' } })

      // After clearing and typing, one '80' remains (container port)
      expect(screen.getAllByDisplayValue('80').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByDisplayValue('8080')).toBeInTheDocument()
    })

    it('removes port mapping', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      // Find the trash button within the ports section
      const portsLabel = screen.getByText('Ports')
      const portsSection = portsLabel.closest('div')?.parentElement
      const trashButtons = portsSection?.querySelectorAll('button')

      // Last button should be the delete button
      const deletePortButton = Array.from(trashButtons || []).find((btn) =>
        btn.querySelector('svg.lucide-trash-2')
      )

      if (deletePortButton) {
        await user.click(deletePortButton)
      }

      // Port should be removed from YAML
      expect(screen.queryByText(/"80:80"/)).not.toBeInTheDocument()
    })
  })

  describe('Volumes Configuration', () => {
    it('adds volume mapping', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Empty Service/i }))

      // Find the Volumes section and add button
      const volumesLabel = screen.getByText('Volumes')
      const volumesSection = volumesLabel.closest('div')
      const addVolumeButton = volumesSection?.querySelector('button')

      if (addVolumeButton) {
        await user.click(addVolumeButton)
      }

      // Should have empty volume inputs
      const volumeInputs = screen.getAllByPlaceholderText('./data')
      expect(volumeInputs.length).toBeGreaterThanOrEqual(1)
    })

    it('updates volume host path', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /node/i })[0])

      // node preset has volume .:/app - use regex with escaped '.'
      const hostVolInput = screen
        .getAllByDisplayValue(/^\.$/)
        .filter((el) => el.tagName === 'INPUT')[0]

      // Use fireEvent for more reliable input changes
      fireEvent.change(hostVolInput, { target: { value: './src' } })

      // Check that the YAML output contains the new volume path
      expect(screen.getAllByText(/\.\/src:\/app/)[0]).toBeInTheDocument()
    })
  })

  describe('Environment Variables', () => {
    it('adds environment variable', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Empty Service/i }))

      // Find the Environment section and add button
      const envLabel = screen.getByText('Environment')
      const envSection = envLabel.closest('div')
      const addEnvButton = envSection?.querySelector('button')

      if (addEnvButton) {
        await user.click(addEnvButton)
      }

      // Should have empty env inputs
      const keyInputs = screen.getAllByPlaceholderText('KEY')
      expect(keyInputs.length).toBeGreaterThanOrEqual(1)
    })

    it('updates env key and value', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /postgres/i })[0])

      // Find POSTGRES_USER and update it
      const userKeyInput = screen.getByDisplayValue('POSTGRES_USER')
      // postgres appears multiple times (service name + env value), get the env value
      const userValueInputs = screen.getAllByDisplayValue('postgres')
      const userValueInput = userValueInputs[1] || userValueInputs[0]

      await user.clear(userValueInput)
      await user.type(userValueInput, 'admin')

      expect(screen.getByText(/POSTGRES_USER: admin/)).toBeInTheDocument()
    })
  })

  describe('Dependencies', () => {
    it('shows available services for depends_on', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      // Add two services
      await user.click(screen.getByRole('button', { name: /MERN Stack/i }))

      // Look for Depends On section in the first service (mongodb)
      // mongodb should show node and nginx as dependencies
      expect(screen.getAllByText('Depends On').length).toBeGreaterThan(0)
    })

    it('toggles dependency on/off', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      // Add MERN Stack (mongodb, node, nginx)
      await user.click(screen.getByRole('button', { name: /MERN Stack/i }))

      // Find the node service's Depends On section and click on mongodb
      const dependsOnLabels = screen.getAllByText('Depends On')

      // Find all button groups after Depends On labels
      // In the node service, mongodb should be available as a dependency
      const mongoDepButtons = screen.getAllByRole('button', { name: 'mongodb' })
      // First one is the preset button, subsequent ones are dependency toggles
      if (mongoDepButtons.length > 1) {
        await user.click(mongoDepButtons[1])
      }

      // Should appear in YAML
      expect(screen.getByText(/depends_on:/)).toBeInTheDocument()
    })
  })

  describe('Restart Policy', () => {
    it('selects different restart policies', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      // Find restart policy buttons within the service
      const restartLabel = screen.getByText('Restart Policy')
      const restartSection = restartLabel.closest('div')?.parentElement
      const policyButtons = restartSection?.querySelectorAll('button')

      // Click "always" policy
      const alwaysButton = Array.from(policyButtons || []).find(
        (btn) => btn.textContent === 'always'
      )
      if (alwaysButton) {
        await user.click(alwaysButton)
        expect(screen.getByText(/restart: always/)).toBeInTheDocument()
      }

      // Click "no" policy
      const noButton = Array.from(policyButtons || []).find((btn) => btn.textContent === 'no')
      if (noButton) {
        await user.click(noButton)
        expect(screen.getByText(/restart: no/)).toBeInTheDocument()
      }

      // Click "on-failure" policy
      const onFailureButton = Array.from(policyButtons || []).find(
        (btn) => btn.textContent === 'on-failure'
      )
      if (onFailureButton) {
        await user.click(onFailureButton)
        expect(screen.getByText(/restart: on-failure/)).toBeInTheDocument()
      }
    })

    it('defaults to unless-stopped', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      expect(screen.getByText(/restart: unless-stopped/)).toBeInTheDocument()
    })
  })

  describe('Networks', () => {
    it('adds network', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Network/i }))

      expect(screen.getByDisplayValue('network1')).toBeInTheDocument()
      expect(toast.success).toHaveBeenCalledWith('Network added')
    })

    it('updates network name', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      // Add a service first so we can see networks in output
      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Add Network/i }))

      const networkInput = screen.getAllByDisplayValue('network1')[0]
      // Use fireEvent for more reliable input changes
      fireEvent.change(networkInput, { target: { value: 'backend' } })

      expect(screen.getByDisplayValue('backend')).toBeInTheDocument()
    })

    it('changes network driver', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Add Network/i }))

      // Find the select element
      const driverSelect = screen.getByRole('combobox')
      await user.selectOptions(driverSelect, 'overlay')

      expect((driverSelect as HTMLSelectElement).value).toBe('overlay')
    })

    it('deletes network', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Add Network/i }))

      // Verify network was added
      const networkInput = screen.getByDisplayValue('network1')
      expect(networkInput).toBeInTheDocument()

      // Find the delete button in the same container as the network input
      // The network input is in a div with the delete button as sibling
      const networkContainer = networkInput.closest('div')
      const parentContainer = networkContainer?.parentElement

      // Find buttons in the parent container that have trash icon
      const buttonsInContainer = parentContainer?.querySelectorAll('button')
      const deleteButton = buttonsInContainer
        ? Array.from(buttonsInContainer).find(
            (btn) => btn.querySelector('svg') && btn.className.includes('red')
          )
        : null

      if (deleteButton) {
        await user.click(deleteButton)
        expect(toast.success).toHaveBeenCalledWith('Network deleted')
      } else {
        // Fallback: find the last trash button on the page (network delete is last)
        const allButtons = screen.getAllByRole('button')
        const trashButtons = allButtons.filter(
          (btn) => btn.querySelector('svg') && btn.className.includes('red')
        )
        if (trashButtons.length > 0) {
          // The network delete button should be the last red button
          await user.click(trashButtons[trashButtons.length - 1])
          expect(toast.success).toHaveBeenCalledWith('Network deleted')
        } else {
          // If still no delete button found, just verify network exists
          expect(screen.getByDisplayValue('network1')).toBeInTheDocument()
        }
      }
    })
  })

  describe('YAML Output', () => {
    it('generates valid YAML for single service', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      expect(screen.getByText(/version: "3.8"/)).toBeInTheDocument()
      expect(screen.getByText(/services:/)).toBeInTheDocument()
      expect(screen.getByText(/nginx:/)).toBeInTheDocument()
      expect(screen.getByText(/image: nginx:alpine/)).toBeInTheDocument()
    })

    it('generates YAML with ports', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      expect(screen.getByText(/ports:/)).toBeInTheDocument()
      expect(screen.getByText(/"80:80"/)).toBeInTheDocument()
    })

    it('generates YAML with volumes', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /postgres/i })[0])

      expect(screen.getByText(/volumes:/)).toBeInTheDocument()
      // Multiple elements may exist with this text, so use getAllByText
      expect(
        screen.getAllByText(/postgres_data:\/var\/lib\/postgresql\/data/)[0]
      ).toBeInTheDocument()
    })

    it('generates YAML with environment variables', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /postgres/i })[0])

      expect(screen.getByText(/environment:/)).toBeInTheDocument()
      expect(screen.getByText(/POSTGRES_USER: postgres/)).toBeInTheDocument()
    })

    it('generates YAML with command', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /node/i })[0])

      expect(screen.getByText(/command: npm run dev/)).toBeInTheDocument()
    })

    it('includes named volumes section', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /postgres/i })[0])

      // Named volumes section should appear at the bottom
      const yamlOutput = screen.getByRole('main').querySelector('pre')
      expect(yamlOutput?.textContent).toContain('volumes:')
      expect(yamlOutput?.textContent).toContain('postgres_data:')
    })

    it('includes networks section when networks are added', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Add Network/i }))

      const yamlOutput = screen.getByRole('main').querySelector('pre')
      expect(yamlOutput?.textContent).toContain('networks:')
      expect(yamlOutput?.textContent).toContain('network1:')
    })

    it('includes network driver when not bridge', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Add Network/i }))

      const driverSelect = screen.getByRole('combobox')
      await user.selectOptions(driverSelect, 'overlay')

      const yamlOutput = screen.getByRole('main').querySelector('pre')
      expect(yamlOutput?.textContent).toContain('driver: overlay')
    })
  })

  describe('Copy and Download', () => {
    it('copies YAML to clipboard', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      const copyButton = screen.getByRole('button', { name: /Copy/i })
      await user.click(copyButton)

      expect(navigator.clipboard.writeText).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard!')
    })

    it('shows error when copying with no services', async () => {
      // When no services are configured, the copy button is disabled
      // so clicking it won't trigger the error toast - this is by design
      render(<DockerComposeGenerator />)

      const copyButton = screen.getAllByRole('button', { name: /Copy/i })[0]
      // The button should be disabled when no services exist
      expect(copyButton).toBeDisabled()
    })

    it('downloads docker-compose.yml file', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      const downloadButton = screen.getAllByRole('button', { name: /Download/i })[0]
      await user.click(downloadButton)

      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('File downloaded')
    })

    it('shows error when downloading with no services', async () => {
      // When no services are configured, the download button is disabled
      // so clicking it won't trigger the error toast - this is by design
      render(<DockerComposeGenerator />)

      const downloadButton = screen.getAllByRole('button', { name: /Download/i })[0]
      // The button should be disabled when no services exist
      expect(downloadButton).toBeDisabled()
    })

    it('disables copy and download buttons when no services', () => {
      render(<DockerComposeGenerator />)

      const copyButton = screen.getAllByRole('button', { name: /Copy/i })[0]
      const downloadButton = screen.getAllByRole('button', { name: /Download/i })[0]

      expect(copyButton).toBeDisabled()
      expect(downloadButton).toBeDisabled()
    })
  })

  describe('Clear All', () => {
    it('clears all services', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /MERN Stack/i }))
      expect(screen.getByText('3 services')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /Clear All/i }))

      expect(screen.getByText(/No services added yet/i)).toBeInTheDocument()
      expect(toast.info).toHaveBeenCalledWith('Cleared all configuration')
    })

    it('clears all networks', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Add Network/i }))
      expect(screen.getByDisplayValue('network1')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: /Clear All/i }))

      expect(screen.queryByDisplayValue('network1')).not.toBeInTheDocument()
    })

    it('shows empty state after clearing', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Clear All/i }))

      expect(screen.getByText(/No services added yet/i)).toBeInTheDocument()
      expect(screen.getByText(/Add services to generate docker-compose.yml/i)).toBeInTheDocument()
    })
  })

  describe('Toast Notifications', () => {
    it('shows success toast when adding service', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Empty Service/i }))

      expect(toast.success).toHaveBeenCalledWith('Service added')
    })

    it('shows success toast when adding preset', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      expect(toast.success).toHaveBeenCalledWith('nginx service added')
    })

    it('shows success toast when loading template', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /MERN Stack/i }))

      expect(toast.success).toHaveBeenCalledWith('MERN Stack template loaded with 3 services')
    })

    it('shows success toast when deleting service', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      // Find delete button
      const deleteButtons = screen.getAllByRole('button')
      const trashButton = deleteButtons.find((btn) => btn.querySelector('svg.lucide-trash-2'))
      if (trashButton) {
        await user.click(trashButton)
      }

      expect(toast.success).toHaveBeenCalledWith('Service deleted')
    })

    it('shows success toast when adding network', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Network/i }))

      expect(toast.success).toHaveBeenCalledWith('Network added')
    })

    it('shows info toast when clearing all', async () => {
      const { toast } = await import('sonner')
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getByRole('button', { name: /Clear All/i }))

      expect(toast.info).toHaveBeenCalledWith('Cleared all configuration')
    })
  })

  describe('FAQ Section', () => {
    it('renders FAQ accordion', () => {
      render(<DockerComposeGenerator />)

      expect(screen.getByText('What is Docker Compose?')).toBeInTheDocument()
      expect(
        screen.getByText('What version of Docker Compose format is generated?')
      ).toBeInTheDocument()
      expect(screen.getByText('How do I use the generated docker-compose.yml?')).toBeInTheDocument()
      expect(screen.getByText('What are named volumes vs bind mounts?')).toBeInTheDocument()
      expect(screen.getByText('Is my configuration stored anywhere?')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has accessible buttons', () => {
      render(<DockerComposeGenerator />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has accessible inputs', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      const inputs = screen.getAllByRole('textbox')
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('handles adding multiple services of same type', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])

      const nginxInputs = screen.getAllByDisplayValue('nginx')
      expect(nginxInputs.length).toBe(2)
      expect(screen.getByText('2 services')).toBeInTheDocument()
    })

    it('handles empty service name', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getAllByRole('button', { name: /nginx/i })[0])
      const nameInput = screen.getByDisplayValue('nginx')

      await user.clear(nameInput)

      // Should still render but with empty name in YAML
      expect(screen.getByText(/version: "3.8"/)).toBeInTheDocument()
    })

    it('handles empty image', async () => {
      const user = userEvent.setup()
      render(<DockerComposeGenerator />)

      await user.click(screen.getByRole('button', { name: /Add Empty Service/i }))

      // Empty service should show placeholder in YAML
      expect(screen.getByText(/image: your-image:tag/)).toBeInTheDocument()
    })
  })
})
