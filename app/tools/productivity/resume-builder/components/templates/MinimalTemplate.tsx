/**
 * Minimal Resume Template
 * Ultra-clean, Scandinavian-inspired design with maximum whitespace
 * Perfect for creative professionals seeking understated elegance
 */

import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface MinimalTemplateProps {
  data: ResumeData
}

export function MinimalTemplate({ data }: MinimalTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'rgb(15, 23, 42)', // Very dark slate for maximum contrast
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontSize: '10px',
        lineHeight: '1.7',
        p: '32px',
        overflow: 'auto',
      })}
    >
      {/* Header - Large Name, Minimal Contact */}
      <header className={css({ mb: '32px' })}>
        <h1
          className={css({
            fontSize: '32px',
            fontWeight: '300', // Light weight for elegance
            color: 'rgb(15, 23, 42)',
            mb: '6px',
            letterSpacing: 'tight',
          })}
        >
          {personal.fullName || 'Your Name'}
        </h1>
        <p
          className={css({
            fontSize: '13px',
            color: 'rgb(100, 116, 139)', // Medium slate
            fontWeight: '400',
            mb: '12px',
            letterSpacing: 'wide',
          })}
        >
          {personal.professionalTitle || 'Professional Title'}
        </p>

        {/* Contact - Minimal, spaced out */}
        <div
          className={css({
            fontSize: '9px',
            color: 'rgb(148, 163, 184)', // Light slate
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            letterSpacing: 'wide',
          })}
        >
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.location && <span>{personal.location}</span>}
          {personal.website && <span>{personal.website}</span>}
          {personal.linkedin && <span>{personal.linkedin}</span>}
        </div>
      </header>

      {/* Professional Summary - Clean, Ample Spacing */}
      {personal.summary && (
        <section className={css({ mb: '32px' })}>
          <p
            className={css({
              fontSize: '11px',
              color: 'rgb(51, 65, 85)',
              lineHeight: '1.9',
              maxW: '90%',
            })}
          >
            {personal.summary}
          </p>
        </section>
      )}

      {/* Experience Section - Generous Whitespace */}
      {experience && experience.length > 0 && (
        <section className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgb(100, 116, 139)',
              mb: '20px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
            })}
          >
            Experience
          </h2>

          {experience.map((exp) => (
            <div key={exp.id} className={css({ mb: '24px' })}>
              <div className={css({ mb: '8px' })}>
                <h3
                  className={css({
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'rgb(15, 23, 42)',
                    mb: '2px',
                  })}
                >
                  {exp.position}
                </h3>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontSize: '10px',
                    color: 'rgb(100, 116, 139)',
                  })}
                >
                  <p>
                    {exp.company} · {exp.location}
                  </p>
                  <p className={css({ fontSize: '9px', whiteSpace: 'nowrap', ml: '8px' })}>
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </p>
                </div>
              </div>

              {exp.description && (
                <p
                  className={css({
                    fontSize: '10px',
                    color: 'rgb(71, 85, 105)',
                    mb: '6px',
                    lineHeight: '1.7',
                  })}
                >
                  {exp.description}
                </p>
              )}

              {exp.achievements && exp.achievements.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '0', spaceY: '3px' })}>
                  {exp.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${exp.id}-ach-${idx}`}
                          className={css({
                            fontSize: '10px',
                            color: 'rgb(51, 65, 85)',
                            lineHeight: '1.7',
                            position: 'relative',
                            pl: '12px',
                          })}
                        >
                          <span
                            className={css({
                              position: 'absolute',
                              left: '0',
                              color: 'rgb(148, 163, 184)',
                              fontSize: '8px',
                            })}
                          >
                            —
                          </span>
                          {achievement}
                        </li>
                      )
                  )}
                </ul>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <p
                  className={css({
                    fontSize: '8px',
                    color: 'rgb(148, 163, 184)',
                    mt: '6px',
                    letterSpacing: 'wide',
                  })}
                >
                  {exp.technologies.join(' · ')}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgb(100, 116, 139)',
              mb: '20px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
            })}
          >
            Education
          </h2>

          {education.map((edu) => (
            <div key={edu.id} className={css({ mb: '16px' })}>
              <div className={css({ mb: '4px' })}>
                <h3
                  className={css({
                    fontSize: '12px',
                    fontWeight: '500',
                    color: 'rgb(15, 23, 42)',
                    mb: '2px',
                  })}
                >
                  {edu.degree}
                  {edu.field && `, ${edu.field}`}
                </h3>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    fontSize: '10px',
                    color: 'rgb(100, 116, 139)',
                  })}
                >
                  <p>
                    {edu.institution} · {edu.location}
                  </p>
                  <p className={css({ fontSize: '9px', whiteSpace: 'nowrap', ml: '8px' })}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                </div>
              </div>

              {(edu.gpa || edu.honors) && (
                <div
                  className={css({
                    display: 'flex',
                    gap: '16px',
                    fontSize: '9px',
                    color: 'rgb(100, 116, 139)',
                    mt: '3px',
                  })}
                >
                  {edu.gpa && <span>GPA {edu.gpa}</span>}
                  {edu.honors && <span>{edu.honors}</span>}
                </div>
              )}

              {edu.achievements && edu.achievements.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '0', mt: '4px', spaceY: '2px' })}>
                  {edu.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${edu.id}-ach-${idx}`}
                          className={css({
                            fontSize: '9px',
                            color: 'rgb(71, 85, 105)',
                            position: 'relative',
                            pl: '10px',
                          })}
                        >
                          <span
                            className={css({
                              position: 'absolute',
                              left: '0',
                              color: 'rgb(148, 163, 184)',
                              fontSize: '7px',
                            })}
                          >
                            —
                          </span>
                          {achievement}
                        </li>
                      )
                  )}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Skills Section - Clean Grid Layout */}
      {skills && skills.length > 0 && (
        <section className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgb(100, 116, 139)',
              mb: '20px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
            })}
          >
            Skills
          </h2>

          <div className={css({ display: 'grid', gap: '12px' })}>
            {skills.map((group) => (
              <div key={`skill-${group.category}`}>
                <p
                  className={css({
                    fontSize: '10px',
                    fontWeight: '500',
                    color: 'rgb(51, 65, 85)',
                    mb: '4px',
                  })}
                >
                  {group.category}
                </p>
                <p
                  className={css({
                    fontSize: '10px',
                    color: 'rgb(100, 116, 139)',
                    lineHeight: '1.6',
                  })}
                >
                  {group.skills.filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '11px',
              fontWeight: '500',
              color: 'rgb(100, 116, 139)',
              mb: '20px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
            })}
          >
            Projects
          </h2>

          {projects.map((project) => (
            <div key={project.id} className={css({ mb: '20px' })}>
              <h3
                className={css({
                  fontSize: '12px',
                  fontWeight: '500',
                  color: 'rgb(15, 23, 42)',
                  mb: '4px',
                })}
              >
                {project.name}
                {project.role && (
                  <span
                    className={css({
                      fontSize: '10px',
                      fontWeight: '400',
                      color: 'rgb(100, 116, 139)',
                    })}
                  >
                    {' '}
                    — {project.role}
                  </span>
                )}
              </h3>

              <p
                className={css({
                  fontSize: '10px',
                  color: 'rgb(71, 85, 105)',
                  mb: '6px',
                  lineHeight: '1.7',
                })}
              >
                {project.description}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '0', spaceY: '2px' })}>
                  {project.highlights.map(
                    (highlight, idx) =>
                      highlight && (
                        <li
                          key={`${project.id}-hl-${idx}`}
                          className={css({
                            fontSize: '10px',
                            color: 'rgb(51, 65, 85)',
                            lineHeight: '1.7',
                            position: 'relative',
                            pl: '12px',
                          })}
                        >
                          <span
                            className={css({
                              position: 'absolute',
                              left: '0',
                              color: 'rgb(148, 163, 184)',
                              fontSize: '8px',
                            })}
                          >
                            —
                          </span>
                          {highlight}
                        </li>
                      )
                  )}
                </ul>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <p
                  className={css({
                    fontSize: '8px',
                    color: 'rgb(148, 163, 184)',
                    mt: '6px',
                    letterSpacing: 'wide',
                  })}
                >
                  {project.technologies.join(' · ')}
                </p>
              )}

              {(project.url || project.github) && (
                <p
                  className={css({
                    fontSize: '8px',
                    color: 'rgb(100, 116, 139)',
                    mt: '4px',
                  })}
                >
                  {project.url && <span>{project.url}</span>}
                  {project.url && project.github && <span> · </span>}
                  {project.github && <span>{project.github}</span>}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
