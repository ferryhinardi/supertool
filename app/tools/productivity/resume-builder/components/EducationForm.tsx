import { AlertCircle, GraduationCap, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { css } from '@/styled-system/css'
import type { Education } from '../types'
import { calculateDuration, formatDateRange, generateId } from '../utils'

interface EducationFormProps {
  data: Education[]
  onChange: (data: Education[]) => void
}

export function EducationForm({ data, onChange }: EducationFormProps) {
  // Add new education entry
  const handleAdd = () => {
    const newEducation: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      current: true,
      gpa: '',
      honors: '',
      achievements: [''],
    }
    onChange([...data, newEducation])
  }

  // Remove education entry
  const handleRemove = (id: string) => {
    onChange(data.filter((edu) => edu.id !== id))
  }

  // Update field in specific education entry
  const handleFieldChange = (id: string, field: keyof Education, value: unknown) => {
    onChange(
      data.map((edu) =>
        edu.id === id
          ? {
              ...edu,
              [field]: value,
              // Auto-update current flag when endDate changes
              ...(field === 'endDate' && { current: value === 'Present' }),
            }
          : edu
      )
    )
  }

  // Add achievement/honor bullet point
  const handleAddAchievement = (id: string) => {
    onChange(
      data.map((edu) =>
        edu.id === id
          ? {
              ...edu,
              achievements: [...(edu.achievements || []), ''],
            }
          : edu
      )
    )
  }

  // Remove achievement/honor bullet point
  const handleRemoveAchievement = (id: string, index: number) => {
    onChange(
      data.map((edu) =>
        edu.id === id
          ? {
              ...edu,
              achievements: (edu.achievements || []).filter((_, i) => i !== index),
            }
          : edu
      )
    )
  }

  // Update specific achievement
  const handleAchievementChange = (id: string, index: number, value: string) => {
    onChange(
      data.map((edu) =>
        edu.id === id
          ? {
              ...edu,
              achievements: (edu.achievements || []).map((ach, i) => (i === index ? value : ach)),
            }
          : edu
      )
    )
  }

  // Calculate duration for display
  const getDuration = (startDate: string, endDate: string | 'Present'): string => {
    if (!startDate) return ''
    const duration = calculateDuration(startDate, endDate)
    return Number(duration) > 0 ? `(${duration} ${Number(duration) === 1 ? 'year' : 'years'})` : ''
  }

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      {/* Header */}
      <div
        className={css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between' })}
      >
        <div>
          <h2
            className={css({
              fontSize: 'xl',
              fontWeight: 'semibold',
              color: 'gray.50',
            })}
          >
            Education
          </h2>
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.400',
              mt: '1',
            })}
          >
            Add your academic background and achievements
          </p>
        </div>
        <Button onClick={handleAdd} variant="outline" size="sm">
          <Plus className={css({ w: '4', h: '4', mr: '2' })} />
          Add Education
        </Button>
      </div>

      {/* Empty state */}
      {data.length === 0 && (
        <div
          className={css({
            border: '2px dashed',
            borderColor: 'gray.700',
            borderRadius: 'lg',
            p: '8',
            textAlign: 'center',
          })}
        >
          <GraduationCap
            className={css({
              w: '12',
              h: '12',
              mx: 'auto',
              mb: '4',
              color: 'gray.600',
            })}
          />
          <h3
            className={css({
              fontSize: 'lg',
              fontWeight: 'medium',
              color: 'gray.300',
              mb: '2',
            })}
          >
            No education added yet
          </h3>
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.400',
              mb: '4',
            })}
          >
            Add your degrees, certifications, and academic achievements
          </p>
          <Button onClick={handleAdd} variant="outline">
            <Plus className={css({ w: '4', h: '4', mr: '2' })} />
            Add Your First Education Entry
          </Button>
        </div>
      )}

      {/* Education entries */}
      {data.map((edu, eduIndex) => (
        <div
          key={edu.id}
          className={css({
            bg: 'gray.900',
            border: '1px solid',
            borderColor: 'gray.800',
            borderRadius: 'lg',
            p: '6',
            position: 'relative',
          })}
        >
          {/* Delete button */}
          <button
            type="button"
            onClick={() => handleRemove(edu.id)}
            className={css({
              position: 'absolute',
              top: '4',
              right: '4',
              p: '2',
              color: 'gray.400',
              _hover: { color: 'red.400' },
              borderRadius: 'md',
              transition: 'colors 0.2s',
            })}
            aria-label="Remove education entry"
          >
            <Trash2 className={css({ w: '4', h: '4' })} />
          </button>

          {/* Entry number badge */}
          <div
            className={css({
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2',
              bg: 'blue.500/10',
              color: 'blue.400',
              px: '3',
              py: '1',
              borderRadius: 'full',
              fontSize: 'xs',
              fontWeight: 'medium',
              mb: '4',
            })}
          >
            <GraduationCap className={css({ w: '3', h: '3' })} />
            Education {eduIndex + 1}
          </div>

          {/* Basic Information */}
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
              gap: '4',
              mb: '4',
            })}
          >
            {/* Institution */}
            <div className={css({ gridColumn: { base: '1', sm: 'span 2' } })}>
              <label
                htmlFor={`institution-${edu.id}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Institution <span className={css({ color: 'red.400' })}>*</span>
              </label>
              <Input
                id={`institution-${edu.id}`}
                value={edu.institution}
                onChange={(e) => handleFieldChange(edu.id, 'institution', e.target.value)}
                placeholder="e.g., Stanford University"
                required
              />
            </div>

            {/* Degree */}
            <div>
              <label
                htmlFor={`degree-${edu.id}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Degree <span className={css({ color: 'red.400' })}>*</span>
              </label>
              <Input
                id={`degree-${edu.id}`}
                value={edu.degree}
                onChange={(e) => handleFieldChange(edu.id, 'degree', e.target.value)}
                placeholder="e.g., Bachelor of Science"
                required
              />
            </div>

            {/* Field of Study */}
            <div>
              <label
                htmlFor={`field-${edu.id}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Field of Study
              </label>
              <Input
                id={`field-${edu.id}`}
                value={edu.field || ''}
                onChange={(e) => handleFieldChange(edu.id, 'field', e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor={`location-${edu.id}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Location <span className={css({ color: 'red.400' })}>*</span>
              </label>
              <Input
                id={`location-${edu.id}`}
                value={edu.location}
                onChange={(e) => handleFieldChange(edu.id, 'location', e.target.value)}
                placeholder="e.g., Stanford, CA"
                required
              />
            </div>

            {/* GPA */}
            <div>
              <label
                htmlFor={`gpa-${edu.id}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                GPA (Optional)
              </label>
              <Input
                id={`gpa-${edu.id}`}
                value={edu.gpa || ''}
                onChange={(e) => handleFieldChange(edu.id, 'gpa', e.target.value)}
                placeholder="e.g., 3.8/4.0"
              />
            </div>
          </div>

          {/* Date Range */}
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
              gap: '4',
              mb: '4',
            })}
          >
            {/* Start Date */}
            <div>
              <label
                htmlFor={`startDate-${edu.id}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Start Date <span className={css({ color: 'red.400' })}>*</span>
              </label>
              <Input
                id={`startDate-${edu.id}`}
                type="month"
                value={edu.startDate}
                onChange={(e) => handleFieldChange(edu.id, 'startDate', e.target.value)}
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor={`endDate-${edu.id}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                End Date
              </label>
              <div className={css({ display: 'flex', gap: '2', alignItems: 'center' })}>
                <Input
                  id={`endDate-${edu.id}`}
                  type="month"
                  value={edu.endDate === 'Present' ? '' : edu.endDate}
                  onChange={(e) =>
                    handleFieldChange(edu.id, 'endDate', e.target.value || 'Present')
                  }
                  disabled={edu.current}
                />
                <label
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    fontSize: 'sm',
                    color: 'gray.300',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  })}
                >
                  <input
                    type="checkbox"
                    checked={edu.current}
                    onChange={(e) => {
                      handleFieldChange(edu.id, 'current', e.target.checked)
                      if (e.target.checked) {
                        handleFieldChange(edu.id, 'endDate', 'Present')
                      }
                    }}
                    className={css({ cursor: 'pointer' })}
                  />
                  Current
                </label>
              </div>
            </div>
          </div>

          {/* Duration display */}
          {edu.startDate && (
            <div
              className={css({
                fontSize: 'sm',
                color: 'gray.400',
                mb: '4',
              })}
            >
              {formatDateRange(edu.startDate, edu.endDate)}{' '}
              {getDuration(edu.startDate, edu.endDate)}
            </div>
          )}

          {/* Honors */}
          <div className={css({ mb: '4' })}>
            <label
              htmlFor={`honors-${edu.id}`}
              className={css({
                display: 'block',
                fontSize: 'sm',
                fontWeight: 'medium',
                color: 'gray.300',
                mb: '2',
              })}
            >
              Honors & Awards (Optional)
            </label>
            <Input
              id={`honors-${edu.id}`}
              value={edu.honors || ''}
              onChange={(e) => handleFieldChange(edu.id, 'honors', e.target.value)}
              placeholder="e.g., Summa Cum Laude, Dean's List"
            />
            <p className={css({ fontSize: 'xs', color: 'gray.400', mt: '1' })}>
              Add major honors, scholarships, or distinctions
            </p>
          </div>

          {/* Achievements/Activities */}
          <div>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: '3',
              })}
            >
              <span className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}>
                Achievements & Activities (Optional)
              </span>
              <Button onClick={() => handleAddAchievement(edu.id)} variant="ghost" size="sm">
                <Plus className={css({ w: '3', h: '3', mr: '1' })} />
                Add
              </Button>
            </div>

            <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
              {(edu.achievements || []).map((achievement, achIndex) => (
                <div
                  key={`${edu.id}-ach-${achIndex}`}
                  className={css({ display: 'flex', gap: '2', alignItems: 'start' })}
                >
                  <div className={css({ flex: '1' })}>
                    <Input
                      value={achievement}
                      onChange={(e) => handleAchievementChange(edu.id, achIndex, e.target.value)}
                      placeholder="e.g., President of Computer Science Club, Published research paper..."
                    />
                  </div>
                  {(edu.achievements?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveAchievement(edu.id, achIndex)}
                      className={css({
                        p: '2',
                        color: 'gray.400',
                        _hover: { color: 'red.400' },
                        borderRadius: 'md',
                        transition: 'colors 0.2s',
                      })}
                      aria-label="Remove achievement"
                    >
                      <X className={css({ w: '4', h: '4' })} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {(!edu.achievements || edu.achievements.length === 0) && (
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  p: '3',
                  bg: 'gray.800/50',
                  borderRadius: 'md',
                  fontSize: 'sm',
                  color: 'gray.400',
                })}
              >
                <AlertCircle className={css({ w: '4', h: '4' })} />
                Click "Add" to include relevant academic achievements, leadership roles, or
                activities
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
