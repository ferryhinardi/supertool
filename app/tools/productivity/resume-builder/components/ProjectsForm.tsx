import { ExternalLink, Github, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { css } from '@/styled-system/css'
import type { Project } from '../types'
import { formatDateRange, generateId } from '../utils'

interface ProjectsFormProps {
  data: Project[]
  onChange: (data: Project[]) => void
}

export function ProjectsForm({ data, onChange }: ProjectsFormProps) {
  // Add new project entry
  const handleAdd = () => {
    const newProject: Project = {
      id: generateId(),
      name: '',
      description: '',
      role: '',
      startDate: '',
      endDate: '',
      technologies: [],
      url: '',
      github: '',
      highlights: [''],
    }
    onChange([...data, newProject])
  }

  // Remove project entry
  const handleRemove = (id: string) => {
    onChange(data.filter((proj) => proj.id !== id))
  }

  // Update field in specific project
  const handleFieldChange = (id: string, field: keyof Project, value: unknown) => {
    onChange(data.map((proj) => (proj.id === id ? { ...proj, [field]: value } : proj)))
  }

  // Add highlight bullet point
  const handleAddHighlight = (id: string) => {
    onChange(
      data.map((proj) =>
        proj.id === id ? { ...proj, highlights: [...proj.highlights, ''] } : proj
      )
    )
  }

  // Remove highlight bullet point
  const handleRemoveHighlight = (id: string, index: number) => {
    onChange(
      data.map((proj) =>
        proj.id === id
          ? { ...proj, highlights: proj.highlights.filter((_, i) => i !== index) }
          : proj
      )
    )
  }

  // Update highlight text
  const handleHighlightChange = (id: string, index: number, value: string) => {
    onChange(
      data.map((proj) =>
        proj.id === id
          ? {
              ...proj,
              highlights: proj.highlights.map((h, i) => (i === index ? value : h)),
            }
          : proj
      )
    )
  }

  // Add technology tag
  const handleAddTechnology = (id: string) => {
    onChange(
      data.map((proj) =>
        proj.id === id ? { ...proj, technologies: [...proj.technologies, ''] } : proj
      )
    )
  }

  // Remove technology tag
  const handleRemoveTechnology = (id: string, index: number) => {
    onChange(
      data.map((proj) =>
        proj.id === id
          ? { ...proj, technologies: proj.technologies.filter((_, i) => i !== index) }
          : proj
      )
    )
  }

  // Update technology text
  const handleTechnologyChange = (id: string, index: number, value: string) => {
    onChange(
      data.map((proj) =>
        proj.id === id
          ? {
              ...proj,
              technologies: proj.technologies.map((t, i) => (i === index ? value : t)),
            }
          : proj
      )
    )
  }

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      {/* Header */}
      <div
        className={css({ display: 'flex', justifyContent: 'space-between', alignItems: 'center' })}
      >
        <div>
          <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '1' })}>Projects</h3>
          <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
            Showcase your portfolio projects, side projects, or contributions
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className={css({ w: '4', h: '4', mr: '2' })} />
          Add Project
        </Button>
      </div>

      {/* Show message if no projects */}
      {data.length === 0 && (
        <div
          className={css({
            p: '8',
            textAlign: 'center',
            bg: 'gray.900',
            rounded: 'lg',
            border: '1px dashed',
            borderColor: 'gray.800',
          })}
        >
          <Sparkles className={css({ w: '12', h: '12', mx: 'auto', mb: '3', color: 'gray.600' })} />
          <p className={css({ fontSize: 'sm', color: 'gray.400', mb: '2' })}>
            No projects added yet
          </p>
          <p className={css({ fontSize: 'xs', color: 'gray.400', mb: '4' })}>
            Projects demonstrate your hands-on experience and technical skills
          </p>
          <Button onClick={handleAdd} size="sm" variant="outline">
            <Plus className={css({ w: '4', h: '4', mr: '2' })} />
            Add Your First Project
          </Button>
        </div>
      )}

      {/* Project Entries */}
      {data.map((project, index) => {
        const duration =
          project.startDate && project.endDate
            ? formatDateRange(project.startDate, project.endDate)
            : null

        return (
          <div
            key={project.id}
            className={css({
              p: '6',
              bg: 'gray.900',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.800',
            })}
          >
            {/* Entry Header */}
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                mb: '4',
              })}
            >
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Sparkles className={css({ w: '5', h: '5', color: 'purple.400' })} />
                <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                  Project {index + 1}
                </span>
                {duration && (
                  <span className={css({ fontSize: 'xs', color: 'gray.400' })}>• {duration}</span>
                )}
              </div>
              <Button
                onClick={() => handleRemove(project.id)}
                size="sm"
                variant="ghost"
                className={css({ color: 'red.400', _hover: { color: 'red.300', bg: 'red.950' } })}
              >
                <Trash2 className={css({ w: '4', h: '4' })} />
              </Button>
            </div>

            {/* Project Name & Role */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: '2fr 1fr' },
                gap: '4',
                mb: '4',
              })}
            >
              <div>
                <label
                  htmlFor={`project-name-${project.id}`}
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Project Name *
                </label>
                <Input
                  id={`project-name-${project.id}`}
                  value={project.name}
                  onChange={(e) => handleFieldChange(project.id, 'name', e.target.value)}
                  placeholder="E-Commerce Platform"
                  className={css({ bg: 'gray.950', border: '1px solid', borderColor: 'gray.800' })}
                />
              </div>

              <div>
                <label
                  htmlFor={`project-role-${project.id}`}
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Your Role
                </label>
                <Input
                  id={`project-role-${project.id}`}
                  value={project.role || ''}
                  onChange={(e) => handleFieldChange(project.id, 'role', e.target.value)}
                  placeholder="Lead Developer"
                  className={css({ bg: 'gray.950', border: '1px solid', borderColor: 'gray.800' })}
                />
              </div>
            </div>

            {/* Project Description */}
            <div className={css({ mb: '4' })}>
              <label
                htmlFor={`project-description-${project.id}`}
                className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
              >
                Description *
              </label>
              <textarea
                id={`project-description-${project.id}`}
                value={project.description}
                onChange={(e) => handleFieldChange(project.id, 'description', e.target.value)}
                placeholder="Brief overview of the project and its purpose..."
                rows={3}
                className={css({
                  w: 'full',
                  px: '3',
                  py: '2',
                  bg: 'gray.950',
                  border: '1px solid',
                  borderColor: 'gray.800',
                  rounded: 'md',
                  fontSize: 'sm',
                  color: 'gray.50',
                  resize: 'vertical',
                  _focus: {
                    outline: 'none',
                    borderColor: 'blue.500',
                    ring: '2px',
                    ringColor: 'blue.500/20',
                  },
                })}
              />
            </div>

            {/* Date Range */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: '1fr 1fr' },
                gap: '4',
                mb: '4',
              })}
            >
              <div>
                <label
                  htmlFor={`project-start-${project.id}`}
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Start Date
                </label>
                <Input
                  id={`project-start-${project.id}`}
                  type="month"
                  value={project.startDate || ''}
                  onChange={(e) => handleFieldChange(project.id, 'startDate', e.target.value)}
                  className={css({ bg: 'gray.950', border: '1px solid', borderColor: 'gray.800' })}
                />
              </div>

              <div>
                <label
                  htmlFor={`project-end-${project.id}`}
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  End Date
                </label>
                <Input
                  id={`project-end-${project.id}`}
                  type="month"
                  value={project.endDate || ''}
                  onChange={(e) => handleFieldChange(project.id, 'endDate', e.target.value)}
                  className={css({ bg: 'gray.950', border: '1px solid', borderColor: 'gray.800' })}
                />
              </div>
            </div>

            {/* Project Links */}
            <div
              className={css({
                display: 'grid',
                gridTemplateColumns: { base: '1fr', sm: '1fr 1fr' },
                gap: '4',
                mb: '4',
              })}
            >
              <div>
                <label
                  htmlFor={`project-url-${project.id}`}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  <ExternalLink className={css({ w: '4', h: '4' })} />
                  Live Demo URL
                </label>
                <Input
                  id={`project-url-${project.id}`}
                  type="url"
                  value={project.url || ''}
                  onChange={(e) => handleFieldChange(project.id, 'url', e.target.value)}
                  placeholder="https://project-demo.com"
                  className={css({ bg: 'gray.950', border: '1px solid', borderColor: 'gray.800' })}
                />
              </div>

              <div>
                <label
                  htmlFor={`project-github-${project.id}`}
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  <Github className={css({ w: '4', h: '4' })} />
                  GitHub Repository
                </label>
                <Input
                  id={`project-github-${project.id}`}
                  type="url"
                  value={project.github || ''}
                  onChange={(e) => handleFieldChange(project.id, 'github', e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className={css({ bg: 'gray.950', border: '1px solid', borderColor: 'gray.800' })}
                />
              </div>
            </div>

            {/* Technologies Used */}
            <div className={css({ mb: '4' })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: '2',
                })}
              >
                <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                  Technologies Used
                </span>
                <Button
                  onClick={() => handleAddTechnology(project.id)}
                  size="sm"
                  variant="ghost"
                  className={css({ fontSize: 'xs', h: 'auto', py: '1' })}
                >
                  <Plus className={css({ w: '3', h: '3', mr: '1' })} />
                  Add Tech
                </Button>
              </div>

              <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                {project.technologies.map((tech, techIndex) => (
                  <div
                    key={`${project.id}-tech-${techIndex}`}
                    className={css({ display: 'flex', gap: '2' })}
                  >
                    <Input
                      value={tech}
                      onChange={(e) =>
                        handleTechnologyChange(project.id, techIndex, e.target.value)
                      }
                      placeholder="React, TypeScript, Node.js..."
                      className={css({
                        flex: '1',
                        bg: 'gray.950',
                        border: '1px solid',
                        borderColor: 'gray.800',
                      })}
                    />
                    <Button
                      onClick={() => handleRemoveTechnology(project.id, techIndex)}
                      size="sm"
                      variant="ghost"
                      className={css({
                        color: 'gray.400',
                        _hover: { color: 'red.400', bg: 'red.950' },
                      })}
                    >
                      <X className={css({ w: '4', h: '4' })} />
                    </Button>
                  </div>
                ))}

                {project.technologies.length === 0 && (
                  <p className={css({ fontSize: 'xs', color: 'gray.400', fontStyle: 'italic' })}>
                    Click "Add Tech" to list technologies used in this project
                  </p>
                )}
              </div>
            </div>

            {/* Project Highlights */}
            <div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: '2',
                })}
              >
                <span className={css({ fontSize: 'sm', fontWeight: 'medium' })}>
                  Key Highlights / Features
                </span>
                <Button
                  onClick={() => handleAddHighlight(project.id)}
                  size="sm"
                  variant="ghost"
                  className={css({ fontSize: 'xs', h: 'auto', py: '1' })}
                >
                  <Plus className={css({ w: '3', h: '3', mr: '1' })} />
                  Add Highlight
                </Button>
              </div>

              <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
                {project.highlights.map((highlight, highlightIndex) => (
                  <div
                    key={`${project.id}-highlight-${highlightIndex}`}
                    className={css({ display: 'flex', gap: '2' })}
                  >
                    <Input
                      value={highlight}
                      onChange={(e) =>
                        handleHighlightChange(project.id, highlightIndex, e.target.value)
                      }
                      placeholder="Built real-time chat with WebSocket, reducing latency by 60%"
                      className={css({
                        flex: '1',
                        bg: 'gray.950',
                        border: '1px solid',
                        borderColor: 'gray.800',
                      })}
                    />
                    <Button
                      onClick={() => handleRemoveHighlight(project.id, highlightIndex)}
                      size="sm"
                      variant="ghost"
                      className={css({
                        color: 'gray.400',
                        _hover: { color: 'red.400', bg: 'red.950' },
                      })}
                    >
                      <X className={css({ w: '4', h: '4' })} />
                    </Button>
                  </div>
                ))}
              </div>

              <p
                className={css({
                  fontSize: 'xs',
                  color: 'gray.400',
                  mt: '2',
                  fontStyle: 'italic',
                })}
              >
                💡 Tip: Include metrics and impact (e.g., "Increased performance by 40%")
              </p>
            </div>
          </div>
        )
      })}

      {/* Best Practices Tips */}
      {data.length > 0 && (
        <div
          className={css({
            p: '4',
            bg: 'blue.950/20',
            border: '1px solid',
            borderColor: 'blue.900',
            rounded: 'lg',
          })}
        >
          <h4
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'blue.400',
              mb: '2',
            })}
          >
            Project Tips
          </h4>
          <ul className={css({ fontSize: 'xs', color: 'gray.400', spaceY: '1', pl: '4' })}>
            <li>List projects in reverse chronological order (most recent first)</li>
            <li>Include live demos or GitHub links to showcase your work</li>
            <li>Highlight technical challenges solved and their business impact</li>
            <li>For team projects, clarify your specific role and contributions</li>
            <li>Personal projects show initiative and passion for coding</li>
          </ul>
        </div>
      )}
    </div>
  )
}
