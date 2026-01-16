'use client'

import {
  Box,
  ChevronDown,
  ChevronUp,
  Copy,
  Database,
  Download,
  Globe,
  HardDrive,
  Layers,
  Network,
  Plus,
  RotateCcw,
  Server,
  Settings,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { useTrackToolView } from '@/hooks/tools/useRecentTools'
import { css } from '@/styled-system/css'

interface EnvVar {
  key: string
  value: string
}

interface Volume {
  host: string
  container: string
}

interface Port {
  host: string
  container: string
}

interface DockerService {
  id: string
  name: string
  image: string
  ports: Port[]
  volumes: Volume[]
  environment: EnvVar[]
  dependsOn: string[]
  restart: string
  networks: string[]
  command?: string
}

interface DockerNetwork {
  name: string
  driver: string
}

const SERVICE_PRESETS: Record<string, Partial<DockerService>> = {
  nginx: {
    image: 'nginx:alpine',
    ports: [{ host: '80', container: '80' }],
    volumes: [{ host: './nginx.conf', container: '/etc/nginx/nginx.conf:ro' }],
    restart: 'unless-stopped',
  },
  postgres: {
    image: 'postgres:16-alpine',
    ports: [{ host: '5432', container: '5432' }],
    environment: [
      { key: 'POSTGRES_USER', value: 'postgres' },
      { key: 'POSTGRES_PASSWORD', value: 'postgres' },
      { key: 'POSTGRES_DB', value: 'mydb' },
    ],
    volumes: [{ host: 'postgres_data', container: '/var/lib/postgresql/data' }],
    restart: 'unless-stopped',
  },
  mysql: {
    image: 'mysql:8',
    ports: [{ host: '3306', container: '3306' }],
    environment: [
      { key: 'MYSQL_ROOT_PASSWORD', value: 'root' },
      { key: 'MYSQL_DATABASE', value: 'mydb' },
      { key: 'MYSQL_USER', value: 'user' },
      { key: 'MYSQL_PASSWORD', value: 'password' },
    ],
    volumes: [{ host: 'mysql_data', container: '/var/lib/mysql' }],
    restart: 'unless-stopped',
  },
  redis: {
    image: 'redis:alpine',
    ports: [{ host: '6379', container: '6379' }],
    volumes: [{ host: 'redis_data', container: '/data' }],
    restart: 'unless-stopped',
  },
  mongodb: {
    image: 'mongo:7',
    ports: [{ host: '27017', container: '27017' }],
    environment: [
      { key: 'MONGO_INITDB_ROOT_USERNAME', value: 'root' },
      { key: 'MONGO_INITDB_ROOT_PASSWORD', value: 'root' },
    ],
    volumes: [{ host: 'mongo_data', container: '/data/db' }],
    restart: 'unless-stopped',
  },
  node: {
    image: 'node:20-alpine',
    ports: [{ host: '3000', container: '3000' }],
    volumes: [{ host: '.', container: '/app' }],
    environment: [{ key: 'NODE_ENV', value: 'development' }],
    command: 'npm run dev',
    restart: 'unless-stopped',
  },
  python: {
    image: 'python:3.12-slim',
    ports: [{ host: '8000', container: '8000' }],
    volumes: [{ host: '.', container: '/app' }],
    command: 'python app.py',
    restart: 'unless-stopped',
  },
  adminer: {
    image: 'adminer',
    ports: [{ host: '8080', container: '8080' }],
    restart: 'unless-stopped',
  },
  mailhog: {
    image: 'mailhog/mailhog',
    ports: [
      { host: '1025', container: '1025' },
      { host: '8025', container: '8025' },
    ],
    restart: 'unless-stopped',
  },
  rabbitmq: {
    image: 'rabbitmq:3-management-alpine',
    ports: [
      { host: '5672', container: '5672' },
      { host: '15672', container: '15672' },
    ],
    environment: [
      { key: 'RABBITMQ_DEFAULT_USER', value: 'guest' },
      { key: 'RABBITMQ_DEFAULT_PASS', value: 'guest' },
    ],
    restart: 'unless-stopped',
  },
}

const STACK_TEMPLATES: Record<string, string[]> = {
  'MERN Stack': ['mongodb', 'node', 'nginx'],
  'LAMP Stack': ['mysql', 'python', 'nginx'],
  WordPress: ['mysql', 'nginx'],
  'Node + PostgreSQL': ['postgres', 'node', 'redis'],
  'Python + PostgreSQL': ['postgres', 'python', 'redis'],
  'Full Dev Stack': ['postgres', 'redis', 'mailhog', 'adminer'],
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function createEmptyService(name = 'service'): DockerService {
  return {
    id: generateId(),
    name,
    image: '',
    ports: [],
    volumes: [],
    environment: [],
    dependsOn: [],
    restart: 'unless-stopped',
    networks: [],
  }
}

function generateYaml(services: DockerService[], networks: DockerNetwork[]): string {
  const lines: string[] = ['version: "3.8"', '', 'services:']

  for (const service of services) {
    lines.push(`  ${service.name}:`)
    lines.push(`    image: ${service.image || 'your-image:tag'}`)

    if (service.command) {
      lines.push(`    command: ${service.command}`)
    }

    if (service.ports.length > 0) {
      lines.push('    ports:')
      for (const port of service.ports) {
        lines.push(`      - "${port.host}:${port.container}"`)
      }
    }

    if (service.volumes.length > 0) {
      lines.push('    volumes:')
      for (const vol of service.volumes) {
        lines.push(`      - ${vol.host}:${vol.container}`)
      }
    }

    if (service.environment.length > 0) {
      lines.push('    environment:')
      for (const env of service.environment) {
        lines.push(`      ${env.key}: ${env.value}`)
      }
    }

    if (service.dependsOn.length > 0) {
      lines.push('    depends_on:')
      for (const dep of service.dependsOn) {
        lines.push(`      - ${dep}`)
      }
    }

    if (service.networks.length > 0) {
      lines.push('    networks:')
      for (const net of service.networks) {
        lines.push(`      - ${net}`)
      }
    }

    if (service.restart) {
      lines.push(`    restart: ${service.restart}`)
    }

    lines.push('')
  }

  // Add volumes section if any services use named volumes
  const namedVolumes = new Set<string>()
  for (const service of services) {
    for (const vol of service.volumes) {
      if (!vol.host.startsWith('.') && !vol.host.startsWith('/') && !vol.host.includes(':')) {
        namedVolumes.add(vol.host)
      }
    }
  }

  if (namedVolumes.size > 0) {
    lines.push('volumes:')
    for (const vol of namedVolumes) {
      lines.push(`  ${vol}:`)
    }
    lines.push('')
  }

  // Add networks section
  if (networks.length > 0) {
    lines.push('networks:')
    for (const net of networks) {
      lines.push(`  ${net.name}:`)
      if (net.driver !== 'bridge') {
        lines.push(`    driver: ${net.driver}`)
      }
    }
  }

  return lines.join('\n')
}

const faqs = [
  {
    question: 'What is Docker Compose?',
    answer:
      "Docker Compose is a tool for defining and running multi-container Docker applications. You use a YAML file to configure your application's services, networks, and volumes. With a single command (docker-compose up), you can create and start all the services from your configuration.",
  },
  {
    question: 'What version of Docker Compose format is generated?',
    answer:
      'This tool generates version 3.8 of the Docker Compose file format, which is compatible with Docker Engine 19.03.0+ and supports features like configs, secrets, and deploy configurations for swarm mode.',
  },
  {
    question: 'How do I use the generated docker-compose.yml?',
    answer:
      'Save the generated YAML content to a file named docker-compose.yml in your project directory. Then run "docker-compose up -d" to start all services in detached mode. Use "docker-compose down" to stop and remove containers.',
  },
  {
    question: 'What are named volumes vs bind mounts?',
    answer:
      'Named volumes (like "postgres_data:/var/lib/postgresql/data") are managed by Docker and persist data even when containers are removed. Bind mounts (like "./app:/app") directly map a host directory to a container path, useful for development.',
  },
  {
    question: 'Is my configuration stored anywhere?',
    answer:
      'No! All processing happens entirely in your browser. Your Docker configuration never leaves your device. This tool is completely client-side for maximum security.',
  },
]

export default function DockerComposeGenerator() {
  useTrackToolView({
    toolId: 'docker-compose-generator',
    title: 'Docker Compose Generator',
    href: '/tools/development/docker-compose-generator',
    iconName: 'Box',
    gradient: 'from-blue-500 to-indigo-500',
  })

  const [services, setServices] = useState<DockerService[]>([])
  const [networks, setNetworks] = useState<DockerNetwork[]>([])
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set())

  // Generate YAML output
  const yamlOutput = useMemo(() => {
    if (services.length === 0) return ''
    return generateYaml(services, networks)
  }, [services, networks])

  // Add a new empty service
  const handleAddService = useCallback(() => {
    const newService = createEmptyService(`service${services.length + 1}`)
    setServices([...services, newService])
    setExpandedServices(new Set([...expandedServices, newService.id]))
    toast.success('Service added')
  }, [services, expandedServices])

  // Add service from preset
  const handleAddPreset = useCallback(
    (presetName: string) => {
      const preset = SERVICE_PRESETS[presetName]
      if (!preset) return

      const newService: DockerService = {
        ...createEmptyService(presetName),
        ...preset,
        ports: preset.ports || [],
        volumes: preset.volumes || [],
        environment: preset.environment || [],
        dependsOn: [],
        networks: [],
      }

      setServices([...services, newService])
      setExpandedServices(new Set([...expandedServices, newService.id]))
      toast.success(`${presetName} service added`)
    },
    [services, expandedServices]
  )

  // Load stack template
  const handleLoadTemplate = useCallback((templateName: string) => {
    const serviceNames = STACK_TEMPLATES[templateName]
    if (!serviceNames) return

    const newServices: DockerService[] = serviceNames.map((name) => {
      const preset = SERVICE_PRESETS[name]
      return {
        ...createEmptyService(name),
        ...preset,
        ports: preset?.ports || [],
        volumes: preset?.volumes || [],
        environment: preset?.environment || [],
        dependsOn: [],
        networks: [],
      }
    })

    setServices(newServices)
    setExpandedServices(new Set(newServices.map((s) => s.id)))
    toast.success(`${templateName} template loaded with ${newServices.length} services`)
  }, [])

  // Delete service
  const handleDeleteService = useCallback(
    (id: string) => {
      setServices(services.filter((s) => s.id !== id))
      const newExpanded = new Set(expandedServices)
      newExpanded.delete(id)
      setExpandedServices(newExpanded)
      toast.success('Service deleted')
    },
    [services, expandedServices]
  )

  // Update service
  const handleUpdateService = useCallback(
    (id: string, updates: Partial<DockerService>) => {
      setServices(services.map((s) => (s.id === id ? { ...s, ...updates } : s)))
    },
    [services]
  )

  // Toggle service expansion
  const toggleExpand = useCallback(
    (id: string) => {
      const newExpanded = new Set(expandedServices)
      if (newExpanded.has(id)) {
        newExpanded.delete(id)
      } else {
        newExpanded.add(id)
      }
      setExpandedServices(newExpanded)
    },
    [expandedServices]
  )

  // Add port to service
  const handleAddPort = useCallback(
    (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return
      handleUpdateService(serviceId, {
        ports: [...service.ports, { host: '', container: '' }],
      })
    },
    [services, handleUpdateService]
  )

  // Add volume to service
  const handleAddVolume = useCallback(
    (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return
      handleUpdateService(serviceId, {
        volumes: [...service.volumes, { host: '', container: '' }],
      })
    },
    [services, handleUpdateService]
  )

  // Add env var to service
  const handleAddEnvVar = useCallback(
    (serviceId: string) => {
      const service = services.find((s) => s.id === serviceId)
      if (!service) return
      handleUpdateService(serviceId, {
        environment: [...service.environment, { key: '', value: '' }],
      })
    },
    [services, handleUpdateService]
  )

  // Add network
  const handleAddNetwork = useCallback(() => {
    const newNetwork: DockerNetwork = {
      name: `network${networks.length + 1}`,
      driver: 'bridge',
    }
    setNetworks([...networks, newNetwork])
    toast.success('Network added')
  }, [networks])

  // Copy output
  const handleCopy = useCallback(() => {
    if (!yamlOutput) {
      toast.error('No services configured')
      return
    }
    navigator.clipboard.writeText(yamlOutput)
    toast.success('Copied to clipboard!')
  }, [yamlOutput])

  // Download output
  const handleDownload = useCallback(() => {
    if (!yamlOutput) {
      toast.error('No services configured')
      return
    }
    const blob = new Blob([yamlOutput], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'docker-compose.yml'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('File downloaded')
  }, [yamlOutput])

  // Clear all
  const handleClear = useCallback(() => {
    setServices([])
    setNetworks([])
    setExpandedServices(new Set())
    toast.info('Cleared all configuration')
  }, [])

  // Get available services for depends_on
  const availableServices = useMemo(() => {
    return services.map((s) => s.name)
  }, [services])

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '1400px',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div className={css({ textAlign: 'center', spaceY: '4' })}>
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Box className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'blue.300',
            })}
          >
            Docker Compose
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'indigo.400',
            gradientTo: 'violet.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Docker Compose Generator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Visually build docker-compose.yml files. Add services from presets, configure ports,
          volumes, and environment variables, then export valid YAML.
        </p>
      </div>

      {/* Quick Actions */}
      <Card
        className={css({
          border: '1px solid',
          borderColor: 'blue.500/20',
          bg: 'gray.900/50',
          backdropFilter: 'blur(16px)',
        })}
      >
        <CardHeader>
          <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
            <Sparkles className={css({ h: '5', w: '5', color: 'blue.400' })} />
            Quick Start
          </CardTitle>
          <CardDescription>Add services from presets or load a stack template</CardDescription>
        </CardHeader>
        <CardContent className={css({ spaceY: '4' })}>
          {/* Service Presets */}
          <div className={css({ spaceY: '2' })}>
            <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.400' })}>
              Service Presets
            </span>
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              {Object.keys(SERVICE_PRESETS).map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddPreset(preset)}
                  className={css({ gap: '2', minH: '9' })}
                >
                  {preset === 'nginx' && <Globe className={css({ h: '4', w: '4' })} />}
                  {preset === 'postgres' && <Database className={css({ h: '4', w: '4' })} />}
                  {preset === 'mysql' && <Database className={css({ h: '4', w: '4' })} />}
                  {preset === 'redis' && <HardDrive className={css({ h: '4', w: '4' })} />}
                  {preset === 'mongodb' && <Database className={css({ h: '4', w: '4' })} />}
                  {preset === 'node' && <Server className={css({ h: '4', w: '4' })} />}
                  {preset === 'python' && <Server className={css({ h: '4', w: '4' })} />}
                  {!['nginx', 'postgres', 'mysql', 'redis', 'mongodb', 'node', 'python'].includes(
                    preset
                  ) && <Box className={css({ h: '4', w: '4' })} />}
                  {preset}
                </Button>
              ))}
            </div>
          </div>

          {/* Stack Templates */}
          <div className={css({ spaceY: '2' })}>
            <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.400' })}>
              Stack Templates
            </span>
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
              {Object.keys(STACK_TEMPLATES).map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLoadTemplate(template)}
                  className={css({ gap: '2', minH: '9' })}
                >
                  <Layers className={css({ h: '4', w: '4' })} />
                  {template}
                </Button>
              ))}
            </div>
          </div>

          {/* Manual Add / Clear */}
          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2', pt: '2' })}>
            <Button onClick={handleAddService} className={css({ gap: '2', minH: '11' })}>
              <Plus className={css({ h: '4', w: '4' })} />
              Add Empty Service
            </Button>
            <Button
              onClick={handleAddNetwork}
              variant="outline"
              className={css({ gap: '2', minH: '11' })}
            >
              <Network className={css({ h: '4', w: '4' })} />
              Add Network
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              className={css({ gap: '2', minH: '11' })}
            >
              <RotateCcw className={css({ h: '4', w: '4' })} />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Tool Area */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(2, 1fr)' },
          gap: '6',
          w: 'full',
        })}
      >
        {/* Services Panel */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'indigo.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Settings className={css({ h: '5', w: '5', color: 'indigo.400' })} />
              <span>Services</span>
              {services.length > 0 && (
                <Badge
                  variant="default"
                  className={css({ bg: 'indigo.500/20', color: 'indigo.400', ml: 'auto' })}
                >
                  {services.length} service{services.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Configure your Docker services</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4', maxH: '600px', overflow: 'auto' })}>
            {services.length === 0 ? (
              <div
                className={css({
                  textAlign: 'center',
                  py: '8',
                  color: 'gray.500',
                })}
              >
                No services added yet. Use the presets above or add an empty service.
              </div>
            ) : (
              services.map((service) => (
                <div
                  key={service.id}
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700/50',
                    spaceY: '3',
                  })}
                >
                  {/* Service Header */}
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                    <button
                      type="button"
                      onClick={() => toggleExpand(service.id)}
                      className={css({
                        p: '1',
                        rounded: 'md',
                        _hover: { bg: 'gray.700/50' },
                        cursor: 'pointer',
                      })}
                    >
                      {expandedServices.has(service.id) ? (
                        <ChevronUp className={css({ h: '4', w: '4', color: 'gray.400' })} />
                      ) : (
                        <ChevronDown className={css({ h: '4', w: '4', color: 'gray.400' })} />
                      )}
                    </button>
                    <Input
                      value={service.name}
                      onChange={(e) => handleUpdateService(service.id, { name: e.target.value })}
                      className={css({ flex: '1', fontFamily: 'mono', fontWeight: 'semibold' })}
                      placeholder="service-name"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteService(service.id)}
                      className={css({
                        color: 'red.400',
                        _hover: { bg: 'red.500/10' },
                      })}
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                    </Button>
                  </div>

                  {/* Expanded Content */}
                  {expandedServices.has(service.id) && (
                    <div className={css({ spaceY: '4', pl: '8' })}>
                      {/* Image */}
                      <div className={css({ spaceY: '1' })}>
                        <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Image</span>
                        <Input
                          value={service.image}
                          onChange={(e) =>
                            handleUpdateService(service.id, { image: e.target.value })
                          }
                          placeholder="nginx:alpine"
                          className={css({ fontFamily: 'mono', fontSize: 'sm' })}
                        />
                      </div>

                      {/* Command */}
                      <div className={css({ spaceY: '1' })}>
                        <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          Command (optional)
                        </span>
                        <Input
                          value={service.command || ''}
                          onChange={(e) =>
                            handleUpdateService(service.id, { command: e.target.value })
                          }
                          placeholder="npm run dev"
                          className={css({ fontFamily: 'mono', fontSize: 'sm' })}
                        />
                      </div>

                      {/* Ports */}
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'gray.400' })}>Ports</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddPort(service.id)}
                            className={css({ h: '7', px: '2' })}
                          >
                            <Plus className={css({ h: '3', w: '3' })} />
                          </Button>
                        </div>
                        {service.ports.map((port, idx) => (
                          <div
                            key={`port-${idx}-${port.host}-${port.container}`}
                            className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
                          >
                            <Input
                              value={port.host}
                              onChange={(e) => {
                                const newPorts = [...service.ports]
                                newPorts[idx] = { ...port, host: e.target.value }
                                handleUpdateService(service.id, { ports: newPorts })
                              }}
                              placeholder="8080"
                              className={css({ flex: '1', fontFamily: 'mono', fontSize: 'sm' })}
                            />
                            <span className={css({ color: 'gray.500' })}>:</span>
                            <Input
                              value={port.container}
                              onChange={(e) => {
                                const newPorts = [...service.ports]
                                newPorts[idx] = { ...port, container: e.target.value }
                                handleUpdateService(service.id, { ports: newPorts })
                              }}
                              placeholder="80"
                              className={css({ flex: '1', fontFamily: 'mono', fontSize: 'sm' })}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newPorts = service.ports.filter((_, i) => i !== idx)
                                handleUpdateService(service.id, { ports: newPorts })
                              }}
                              className={css({ h: '8', w: '8', color: 'red.400' })}
                            >
                              <Trash2 className={css({ h: '3', w: '3' })} />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Volumes */}
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                            Volumes
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddVolume(service.id)}
                            className={css({ h: '7', px: '2' })}
                          >
                            <Plus className={css({ h: '3', w: '3' })} />
                          </Button>
                        </div>
                        {service.volumes.map((vol, idx) => (
                          <div
                            key={`vol-${idx}-${vol.host}-${vol.container}`}
                            className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
                          >
                            <Input
                              value={vol.host}
                              onChange={(e) => {
                                const newVols = [...service.volumes]
                                newVols[idx] = { ...vol, host: e.target.value }
                                handleUpdateService(service.id, { volumes: newVols })
                              }}
                              placeholder="./data"
                              className={css({ flex: '1', fontFamily: 'mono', fontSize: 'sm' })}
                            />
                            <span className={css({ color: 'gray.500' })}>:</span>
                            <Input
                              value={vol.container}
                              onChange={(e) => {
                                const newVols = [...service.volumes]
                                newVols[idx] = { ...vol, container: e.target.value }
                                handleUpdateService(service.id, { volumes: newVols })
                              }}
                              placeholder="/app/data"
                              className={css({ flex: '1', fontFamily: 'mono', fontSize: 'sm' })}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newVols = service.volumes.filter((_, i) => i !== idx)
                                handleUpdateService(service.id, { volumes: newVols })
                              }}
                              className={css({ h: '8', w: '8', color: 'red.400' })}
                            >
                              <Trash2 className={css({ h: '3', w: '3' })} />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Environment Variables */}
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          })}
                        >
                          <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                            Environment
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddEnvVar(service.id)}
                            className={css({ h: '7', px: '2' })}
                          >
                            <Plus className={css({ h: '3', w: '3' })} />
                          </Button>
                        </div>
                        {service.environment.map((env, idx) => (
                          <div
                            key={`env-${idx}-${env.key}`}
                            className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
                          >
                            <Input
                              value={env.key}
                              onChange={(e) => {
                                const newEnvs = [...service.environment]
                                newEnvs[idx] = { ...env, key: e.target.value }
                                handleUpdateService(service.id, { environment: newEnvs })
                              }}
                              placeholder="KEY"
                              className={css({ flex: '1', fontFamily: 'mono', fontSize: 'sm' })}
                            />
                            <span className={css({ color: 'gray.500' })}>=</span>
                            <Input
                              value={env.value}
                              onChange={(e) => {
                                const newEnvs = [...service.environment]
                                newEnvs[idx] = { ...env, value: e.target.value }
                                handleUpdateService(service.id, { environment: newEnvs })
                              }}
                              placeholder="value"
                              className={css({ flex: '1', fontFamily: 'mono', fontSize: 'sm' })}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newEnvs = service.environment.filter((_, i) => i !== idx)
                                handleUpdateService(service.id, { environment: newEnvs })
                              }}
                              className={css({ h: '8', w: '8', color: 'red.400' })}
                            >
                              <Trash2 className={css({ h: '3', w: '3' })} />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Depends On */}
                      <div className={css({ spaceY: '1' })}>
                        <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          Depends On
                        </span>
                        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                          {availableServices
                            .filter((s) => s !== service.name)
                            .map((svcName) => (
                              <Button
                                key={svcName}
                                variant={
                                  service.dependsOn.includes(svcName) ? 'default' : 'outline'
                                }
                                size="sm"
                                onClick={() => {
                                  const newDeps = service.dependsOn.includes(svcName)
                                    ? service.dependsOn.filter((d) => d !== svcName)
                                    : [...service.dependsOn, svcName]
                                  handleUpdateService(service.id, { dependsOn: newDeps })
                                }}
                                className={css({ minH: '8' })}
                              >
                                {svcName}
                              </Button>
                            ))}
                        </div>
                      </div>

                      {/* Restart Policy */}
                      <div className={css({ spaceY: '1' })}>
                        <span className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          Restart Policy
                        </span>
                        <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                          {['no', 'always', 'on-failure', 'unless-stopped'].map((policy) => (
                            <Button
                              key={policy}
                              variant={service.restart === policy ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleUpdateService(service.id, { restart: policy })}
                              className={css({ minH: '8' })}
                            >
                              {policy}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'violet.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Download className={css({ h: '5', w: '5', color: 'violet.400' })} />
              <span>docker-compose.yml</span>
            </CardTitle>
            <CardDescription>Generated YAML output</CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div
              className={css({
                p: '4',
                rounded: 'lg',
                bg: 'gray.800/50',
                border: '1px solid',
                borderColor: 'gray.700/50',
                minH: '400px',
                maxH: '500px',
                overflow: 'auto',
              })}
            >
              {yamlOutput ? (
                <pre
                  className={css({
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    color: 'violet.300',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                  })}
                >
                  {yamlOutput}
                </pre>
              ) : (
                <span className={css({ color: 'gray.500', fontSize: 'sm' })}>
                  Add services to generate docker-compose.yml...
                </span>
              )}
            </div>

            <div className={css({ display: 'flex', gap: '2' })}>
              <Button
                onClick={handleCopy}
                disabled={!yamlOutput}
                className={css({ gap: '2', flex: '1', minH: '11' })}
              >
                <Copy className={css({ h: '4', w: '4' })} />
                Copy
              </Button>
              <Button
                onClick={handleDownload}
                disabled={!yamlOutput}
                variant="outline"
                className={css({ gap: '2', flex: '1', minH: '11' })}
              >
                <Download className={css({ h: '4', w: '4' })} />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Networks Section */}
      {networks.length > 0 && (
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Network className={css({ h: '5', w: '5', color: 'cyan.400' })} />
              Networks
            </CardTitle>
            <CardDescription>Configure Docker networks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '4' })}>
              {networks.map((network, idx) => (
                <div
                  key={`network-${idx}-${network.name}`}
                  className={css({
                    p: '4',
                    rounded: 'lg',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700/50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3',
                  })}
                >
                  <Input
                    value={network.name}
                    onChange={(e) => {
                      const newNetworks = [...networks]
                      newNetworks[idx] = { ...network, name: e.target.value }
                      setNetworks(newNetworks)
                    }}
                    placeholder="network-name"
                    className={css({ w: '150px', fontFamily: 'mono' })}
                  />
                  <select
                    value={network.driver}
                    onChange={(e) => {
                      const newNetworks = [...networks]
                      newNetworks[idx] = { ...network, driver: e.target.value }
                      setNetworks(newNetworks)
                    }}
                    className={css({
                      bg: 'gray.800',
                      border: '1px solid',
                      borderColor: 'gray.600',
                      rounded: 'md',
                      px: '3',
                      py: '2',
                      color: 'white',
                      fontSize: 'sm',
                    })}
                  >
                    <option value="bridge">bridge</option>
                    <option value="host">host</option>
                    <option value="overlay">overlay</option>
                    <option value="none">none</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setNetworks(networks.filter((_, i) => i !== idx))
                      toast.success('Network deleted')
                    }}
                    className={css({ color: 'red.400', _hover: { bg: 'red.500/10' } })}
                  >
                    <Trash2 className={css({ h: '4', w: '4' })} />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FAQ */}
      <FAQAccordion faqs={faqs} />

      {/* Related Tools */}
      <RelatedTools
        currentToolPath="/tools/development/docker-compose-generator"
        category="development"
      />

      {/* Rating */}
      <ToolRating toolId="docker-compose-generator" toolName="Docker Compose Generator" />

      {/* Search */}
      <ToolSearch />
    </main>
  )
}
