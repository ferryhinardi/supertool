import { AlertCircle, Briefcase, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { css } from '@/styled-system/css'
import type { WorkExperience } from '../types'
import { calculateDuration, formatDateRange, generateId, optimizeBulletPoint } from '../utils'

interface ExperienceFormProps {
  data: WorkExperience[]
  onChange: (data: WorkExperience[]) => void
}

export function ExperienceForm({ data, onChange }: ExperienceFormProps) {
  // Add new experience entry
  const handleAdd = () => {
    const newExperience: WorkExperience = {
      id: generateId(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      current: true,
      achievements: [''],
      description: '',
      technologies: [],
    }
    onChange([...data, newExperience])
  }

  // Remove experience entry
  const handleRemove = (id: string) => {
    onChange(data.filter((exp) => exp.id !== id))
  }

  // Update field in specific experience
  const handleFieldChange = (id: string, field: keyof WorkExperience, value: unknown) => {
    onChange(
      data.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              [field]: value,
              // Auto-update current flag when endDate changes
              ...(field === 'endDate' && { current: value === 'Present' }),
            }
          : exp
      )
    )
  }

  // Add achievement bullet point
  const handleAddAchievement = (id: string) => {
    onChange(
      data.map((exp) => (exp.id === id ? { ...exp, achievements: [...exp.achievements, ''] } : exp))
    )
  }

  // Remove achievement bullet point
  const handleRemoveAchievement = (id: string, index: number) => {
    onChange(
      data.map((exp) =>
        exp.id === id
          ? { ...exp, achievements: exp.achievements.filter((_, i) => i !== index) }
          : exp
      )
    )
  }

  // Update achievement text
  const handleAchievementChange = (id: string, index: number, value: string) => {
    onChange(
      data.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              achievements: exp.achievements.map((a, i) => (i === index ? value : a)),
            }
          : exp
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
          <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', mb: '1' })}>
            Work Experience
          </h3>
          <p className={css({ fontSize: 'sm', color: 'gray.500' })}>
            Add your work history, starting with most recent
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" variant="outline">
          <Plus className={css({ w: '4', h: '4', mr: '2' })} />
          Add Experience
        </Button>
      </div>

      {/* Experience Entries */}
      {data.length === 0 ? (
        <div
          className={css({
            textAlign: 'center',
            py: '12',
            border: '2px dashed',
            borderColor: 'gray.800',
            rounded: 'lg',
          })}
        >
          <Briefcase
            className={css({ w: '12', h: '12', mx: 'auto', mb: '3', color: 'gray.700' })}
          />
          <p className={css({ color: 'gray.500', mb: '4' })}>No work experience added yet</p>
          <Button onClick={handleAdd} size="sm">
            <Plus className={css({ w: '4', h: '4', mr: '2' })} />
            Add Your First Job
          </Button>
        </div>
      ) : (
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
          {data.map((experience, expIndex) => (
            <div
              key={experience.id}
              className={css({
                p: '6',
                bg: 'gray.900',
                border: '1px solid',
                borderColor: 'gray.800',
                rounded: 'lg',
              })}
            >
              {/* Entry Header */}
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '4' })}>
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Briefcase className={css({ w: '5', h: '5', color: 'blue.400' })} />
                  <span className={css({ fontWeight: 'medium' })}>Experience #{expIndex + 1}</span>
                </div>
                <Button
                  onClick={() => handleRemove(experience.id)}
                  size="sm"
                  variant="ghost"
                  className={css({ color: 'red.400', _hover: { color: 'red.300' } })}
                >
                  <Trash2 className={css({ w: '4', h: '4' })} />
                </Button>
              </div>

              {/* Company & Position */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '4',
                  mb: '4',
                })}
              >
                <div>
                  <label
                    htmlFor={`company-${experience.id}`}
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Company <span className={css({ color: 'red.400' })}>*</span>
                  </label>
                  <Input
                    id={`company-${experience.id}`}
                    type="text"
                    value={experience.company}
                    onChange={(e) => handleFieldChange(experience.id, 'company', e.target.value)}
                    placeholder="Acme Corp"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`position-${experience.id}`}
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Position <span className={css({ color: 'red.400' })}>*</span>
                  </label>
                  <Input
                    id={`position-${experience.id}`}
                    type="text"
                    value={experience.position}
                    onChange={(e) => handleFieldChange(experience.id, 'position', e.target.value)}
                    placeholder="Senior Software Engineer"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className={css({ mb: '4' })}>
                <label
                  htmlFor={`location-${experience.id}`}
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Location <span className={css({ color: 'red.400' })}>*</span>
                </label>
                <Input
                  id={`location-${experience.id}`}
                  type="text"
                  value={experience.location}
                  onChange={(e) => handleFieldChange(experience.id, 'location', e.target.value)}
                  placeholder="San Francisco, CA"
                  required
                />
              </div>

              {/* Dates */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: '4',
                  mb: '4',
                })}
              >
                <div>
                  <label
                    htmlFor={`startDate-${experience.id}`}
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    Start Date <span className={css({ color: 'red.400' })}>*</span>
                  </label>
                  <Input
                    id={`startDate-${experience.id}`}
                    type="month"
                    value={experience.startDate}
                    onChange={(e) => handleFieldChange(experience.id, 'startDate', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor={`endDate-${experience.id}`}
                    className={css({
                      display: 'block',
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      mb: '2',
                    })}
                  >
                    End Date
                  </label>
                  <div className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                    <Input
                      id={`endDate-${experience.id}`}
                      type="month"
                      value={experience.endDate === 'Present' ? '' : experience.endDate}
                      onChange={(e) => handleFieldChange(experience.id, 'endDate', e.target.value)}
                      disabled={experience.current}
                      className={css({ flex: '1' })}
                    />
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        fontSize: 'sm',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      <input
                        type="checkbox"
                        id={`current-${experience.id}`}
                        checked={experience.current}
                        onChange={(e) => {
                          handleFieldChange(experience.id, 'current', e.target.checked)
                          if (e.target.checked) {
                            handleFieldChange(experience.id, 'endDate', 'Present')
                          }
                        }}
                        className={css({ w: '4', h: '4' })}
                      />
                      <label htmlFor={`current-${experience.id}`}>Current</label>
                    </div>
                  </div>
                  {experience.startDate && (
                    <p className={css({ mt: '1', fontSize: 'xs', color: 'gray.500' })}>
                      {experience.endDate === 'Present'
                        ? formatDateRange(experience.startDate, 'Present')
                        : experience.endDate
                          ? formatDateRange(experience.startDate, experience.endDate)
                          : ''}{' '}
                      {experience.endDate &&
                        `(${calculateDuration(experience.startDate, experience.endDate)})`}
                    </p>
                  )}
                </div>
              </div>

              {/* Achievements */}
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
                    Key Achievements <span className={css({ color: 'red.400' })}>*</span>
                  </span>
                  <Button
                    onClick={() => handleAddAchievement(experience.id)}
                    size="sm"
                    variant="ghost"
                    className={css({ fontSize: 'xs' })}
                  >
                    <Plus className={css({ w: '3', h: '3', mr: '1' })} />
                    Add Achievement
                  </Button>
                </div>

                <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                  {experience.achievements.map((achievement, achIndex) => {
                    const validation = optimizeBulletPoint(achievement)
                    return (
                      <div key={`${experience.id}-achievement-${achIndex}`}>
                        <div className={css({ display: 'flex', gap: '2' })}>
                          <div
                            className={css({
                              flex: '1',
                              position: 'relative',
                            })}
                          >
                            <textarea
                              value={achievement}
                              onChange={(e) =>
                                handleAchievementChange(experience.id, achIndex, e.target.value)
                              }
                              placeholder="• Led development of microservices architecture, reducing response time by 40%"
                              rows={2}
                              className={css({
                                w: 'full',
                                px: '3',
                                py: '2',
                                bg: 'gray.950',
                                border: '1px solid',
                                borderColor:
                                  achievement && !validation.isOptimized
                                    ? 'yellow.500/50'
                                    : 'gray.800',
                                rounded: 'md',
                                fontSize: 'sm',
                                color: 'gray.50',
                                _focus: {
                                  outline: 'none',
                                  borderColor: 'blue.500',
                                  ring: '2px',
                                  ringColor: 'blue.500/20',
                                },
                                _placeholder: {
                                  color: 'gray.600',
                                },
                              })}
                            />
                          </div>
                          {experience.achievements.length > 1 && (
                            <Button
                              onClick={() => handleRemoveAchievement(experience.id, achIndex)}
                              size="sm"
                              variant="ghost"
                              className={css({ color: 'gray.500', _hover: { color: 'red.400' } })}
                            >
                              <X className={css({ w: '4', h: '4' })} />
                            </Button>
                          )}
                        </div>

                        {/* Achievement Optimization Suggestions */}
                        {achievement &&
                          !validation.isOptimized &&
                          validation.suggestions.length > 0 && (
                            <div
                              className={css({
                                mt: '1',
                                p: '2',
                                bg: 'yellow.500/10',
                                border: '1px solid',
                                borderColor: 'yellow.500/30',
                                rounded: 'md',
                              })}
                            >
                              <div
                                className={css({ display: 'flex', gap: '2', alignItems: 'start' })}
                              >
                                <AlertCircle
                                  className={css({
                                    w: '4',
                                    h: '4',
                                    color: 'yellow.500',
                                    flexShrink: '0',
                                    mt: '0.5',
                                  })}
                                />
                                <div className={css({ fontSize: 'xs', color: 'yellow.400' })}>
                                  <div className={css({ fontWeight: 'medium', mb: '1' })}>
                                    Suggestions to improve:
                                  </div>
                                  <ul className={css({ pl: '4', spaceY: '0.5' })}>
                                    {validation.suggestions.map((suggestion) => (
                                      <li key={suggestion}>{suggestion}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    )
                  })}
                </div>
                <p className={css({ mt: '2', fontSize: 'xs', color: 'gray.500' })}>
                  💡 Start with action verbs, include metrics and impact. Aim for 3-5 bullet points
                  per role.
                </p>
              </div>

              {/* Optional: Technologies */}
              <div>
                <label
                  htmlFor={`description-${experience.id}`}
                  className={css({
                    display: 'block',
                    fontSize: 'sm',
                    fontWeight: 'medium',
                    mb: '2',
                  })}
                >
                  Role Description (Optional)
                </label>
                <textarea
                  id={`description-${experience.id}`}
                  value={experience.description || ''}
                  onChange={(e) => handleFieldChange(experience.id, 'description', e.target.value)}
                  placeholder="Brief overview of your role and responsibilities..."
                  rows={2}
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
                    _focus: {
                      outline: 'none',
                      borderColor: 'blue.500',
                      ring: '2px',
                      ringColor: 'blue.500/20',
                    },
                    _placeholder: {
                      color: 'gray.600',
                    },
                  })}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
