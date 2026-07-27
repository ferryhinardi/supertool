import { AlertCircle, Plus, Trash2, Wrench, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { css } from '@/styled-system/css'
import type { SkillGroup } from '../types'

interface SkillsFormProps {
  data: SkillGroup[]
  onChange: (data: SkillGroup[]) => void
}

export function SkillsForm({ data, onChange }: SkillsFormProps) {
  // Add new skill group
  const handleAddGroup = () => {
    const newGroup: SkillGroup = {
      category: '',
      skills: [''],
    }
    onChange([...data, newGroup])
  }

  // Remove skill group
  const handleRemoveGroup = (index: number) => {
    onChange(data.filter((_, i) => i !== index))
  }

  // Update group category name
  const handleCategoryChange = (index: number, category: string) => {
    onChange(data.map((group, i) => (i === index ? { ...group, category } : group)))
  }

  // Add skill to group
  const handleAddSkill = (groupIndex: number) => {
    onChange(
      data.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              skills: [...group.skills, ''],
            }
          : group
      )
    )
  }

  // Remove skill from group
  const handleRemoveSkill = (groupIndex: number, skillIndex: number) => {
    onChange(
      data.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              skills: group.skills.filter((_, si) => si !== skillIndex),
            }
          : group
      )
    )
  }

  // Update specific skill in group
  const handleSkillChange = (groupIndex: number, skillIndex: number, value: string) => {
    onChange(
      data.map((group, i) =>
        i === groupIndex
          ? {
              ...group,
              skills: group.skills.map((skill, si) => (si === skillIndex ? value : skill)),
            }
          : group
      )
    )
  }

  // Suggested skill categories for quick start
  const suggestedCategories = [
    { name: 'Programming Languages', skills: ['JavaScript', 'TypeScript', 'Python', 'Java'] },
    { name: 'Frontend Technologies', skills: ['React', 'Next.js', 'Vue.js', 'HTML/CSS'] },
    { name: 'Backend Technologies', skills: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB'] },
    { name: 'Tools & Platforms', skills: ['Git', 'Docker', 'AWS', 'CI/CD'] },
    {
      name: 'Soft Skills',
      skills: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'],
    },
  ]

  const handleAddSuggestedCategory = (suggested: { name: string; skills: string[] }) => {
    const newGroup: SkillGroup = {
      category: suggested.name,
      skills: suggested.skills,
    }
    onChange([...data, newGroup])
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
            Skills
          </h2>
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.400',
              mt: '1',
            })}
          >
            Organize your skills into categories for better readability
          </p>
        </div>
        <Button onClick={handleAddGroup} variant="outline" size="sm">
          <Plus className={css({ w: '4', h: '4', mr: '2' })} />
          Add Category
        </Button>
      </div>

      {/* Quick Start Suggestions */}
      {data.length === 0 && (
        <div
          className={css({
            border: '1px solid',
            borderColor: 'gray.800',
            borderRadius: 'lg',
            p: '6',
            bg: 'gray.900/50',
          })}
        >
          <h3
            className={css({
              fontSize: 'md',
              fontWeight: 'medium',
              color: 'gray.300',
              mb: '3',
            })}
          >
            Quick Start: Add Common Categories
          </h3>
          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
            {suggestedCategories.map((category) => (
              <Button
                key={`suggested-${category.name}`}
                onClick={() => handleAddSuggestedCategory(category)}
                variant="outline"
                size="sm"
              >
                <Plus className={css({ w: '3', h: '3', mr: '1' })} />
                {category.name}
              </Button>
            ))}
          </div>
          <p
            className={css({
              fontSize: 'xs',
              color: 'gray.400',
              mt: '3',
            })}
          >
            Or click "Add Category" to create your own custom skill categories
          </p>
        </div>
      )}

      {/* Empty state (after suggestions) */}
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
          <Wrench
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
            No skills added yet
          </h3>
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.400',
              mb: '4',
            })}
          >
            Organize your skills by category for a cleaner, more professional resume
          </p>
        </div>
      )}

      {/* Skill Groups */}
      {data.map((group, groupIndex) => {
        // Use category as stable identifier, fallback to index for empty categories
        const groupKey = group.category ? `group-${group.category}` : `group-index-${groupIndex}`
        return (
          <div
            key={groupKey}
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
              onClick={() => handleRemoveGroup(groupIndex)}
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
              aria-label="Remove skill category"
            >
              <Trash2 className={css({ w: '4', h: '4' })} />
            </button>

            {/* Category name */}
            <div className={css({ mb: '4', pr: '10' })}>
              <label
                htmlFor={`category-${groupIndex}`}
                className={css({
                  display: 'block',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'gray.300',
                  mb: '2',
                })}
              >
                Category Name <span className={css({ color: 'red.400' })}>*</span>
              </label>
              <Input
                id={`category-${groupIndex}`}
                value={group.category}
                onChange={(e) => handleCategoryChange(groupIndex, e.target.value)}
                placeholder="e.g., Programming Languages, Frontend Technologies, Soft Skills"
                required
              />
            </div>

            {/* Skills */}
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
                  Skills <span className={css({ color: 'red.400' })}>*</span>
                </span>
                <Button onClick={() => handleAddSkill(groupIndex)} variant="ghost" size="sm">
                  <Plus className={css({ w: '3', h: '3', mr: '1' })} />
                  Add Skill
                </Button>
              </div>

              <div className={css({ display: 'flex', flexDirection: 'column', gap: '3' })}>
                {group.skills.map((skill, skillIndex) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: Skills are dynamic form items without stable IDs
                    key={`${groupKey}-skill-${skillIndex}`}
                    className={css({ display: 'flex', gap: '2', alignItems: 'center' })}
                  >
                    <div className={css({ flex: '1' })}>
                      <Input
                        value={skill}
                        onChange={(e) => handleSkillChange(groupIndex, skillIndex, e.target.value)}
                        placeholder="e.g., JavaScript, React, Leadership"
                      />
                    </div>
                    {group.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(groupIndex, skillIndex)}
                        className={css({
                          p: '2',
                          color: 'gray.400',
                          _hover: { color: 'red.400' },
                          borderRadius: 'md',
                          transition: 'colors 0.2s',
                        })}
                        aria-label="Remove skill"
                      >
                        <X className={css({ w: '4', h: '4' })} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {group.skills.length === 0 && (
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
                  Click "Add Skill" to add skills to this category
                </div>
              )}
            </div>

            {/* Tips for this category */}
            <div
              className={css({
                mt: '4',
                p: '3',
                bg: 'blue.500/10',
                border: '1px solid',
                borderColor: 'blue.500/20',
                borderRadius: 'md',
                fontSize: 'xs',
                color: 'blue.300',
              })}
            >
              💡 <strong>Tip:</strong> List {group.skills.length || '3-6'} skills per category.
              Focus on relevant, in-demand skills that match job requirements.
            </div>
          </div>
        )
      })}

      {/* Overall tips */}
      {data.length > 0 && (
        <div
          className={css({
            p: '4',
            bg: 'gray.800/50',
            border: '1px solid',
            borderColor: 'gray.700',
            borderRadius: 'lg',
            fontSize: 'sm',
            color: 'gray.300',
          })}
        >
          <h4 className={css({ fontWeight: 'medium', mb: '2' })}>Skills Section Best Practices:</h4>
          <ul className={css({ listStyle: 'disc', pl: '5', spaceY: '1', color: 'gray.400' })}>
            <li>Organize skills by relevance (most important categories first)</li>
            <li>Use industry-standard terminology and acronyms</li>
            <li>Include both technical and soft skills</li>
            <li>Tailor skills to match the job description keywords</li>
            <li>Keep each category focused (avoid mixing unrelated skills)</li>
          </ul>
        </div>
      )}
    </div>
  )
}
