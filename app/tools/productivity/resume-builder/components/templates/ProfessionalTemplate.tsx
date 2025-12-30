/**
 * Professional Resume Template
 * Elegant, executive-level design for senior professionals and C-level positions
 * Emphasis on leadership, achievements, and impact over duties
 */

import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface ProfessionalTemplateProps {
  data: ResumeData
}

export function ProfessionalTemplate({ data }: ProfessionalTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'gray.900',
        fontFamily: 'Georgia, "Palatino Linotype", "Book Antiqua", serif',
        fontSize: '10px',
        lineHeight: '1.6',
        p: '24px',
        overflow: 'auto',
      })}
    >
      {/* Header Section - Large and Prominent */}
      <header
        className={css({
          mb: '18px',
          borderBottom: '3px solid',
          borderColor: 'rgb(30, 58, 138)', // Navy blue
          pb: '12px',
        })}
      >
        <h1
          className={css({
            fontSize: '28px',
            fontWeight: 'bold',
            color: 'rgb(30, 58, 138)', // Navy blue
            mb: '4px',
            letterSpacing: 'wider',
          })}
        >
          {personal.fullName || 'Your Name'}
        </h1>
        <p
          className={css({
            fontSize: '14px',
            color: 'rgb(51, 65, 85)', // Charcoal
            fontWeight: '600',
            mb: '8px',
            fontStyle: 'italic',
          })}
        >
          {personal.professionalTitle || 'Professional Title'}
        </p>

        {/* Contact Information - Elegant Single Line */}
        <div
          className={css({
            fontSize: '10px',
            color: 'rgb(71, 85, 105)', // Slate
            fontFamily: 'system-ui, sans-serif',
          })}
        >
          {[personal.email, personal.phone, personal.location, personal.linkedin, personal.website]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </header>

      {/* Professional Summary - Very Prominent */}
      {personal.summary && (
        <section
          className={css({
            mb: '18px',
            p: '12px',
            bg: 'rgb(241, 245, 249)', // Very light blue-gray
            borderLeft: '4px solid',
            borderColor: 'rgb(30, 58, 138)', // Navy blue
          })}
        >
          <h2
            className={css({
              fontSize: '13px',
              fontWeight: 'bold',
              color: 'rgb(30, 58, 138)',
              mb: '6px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
            })}
          >
            Executive Summary
          </h2>
          <p
            className={css({
              fontSize: '11px',
              color: 'rgb(15, 23, 42)', // Very dark slate
              lineHeight: '1.7',
            })}
          >
            {personal.summary}
          </p>
        </section>
      )}

      {/* Experience Section - Achievement-Focused */}
      {experience && experience.length > 0 && (
        <section className={css({ mb: '18px' })}>
          <h2
            className={css({
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'rgb(30, 58, 138)',
              mb: '10px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
              borderBottom: '2px solid',
              borderColor: 'rgb(203, 213, 225)', // Light slate
              pb: '4px',
            })}
          >
            Professional Experience
          </h2>

          {experience.map((exp) => (
            <div key={exp.id} className={css({ mb: '12px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '3px' })}>
                <div>
                  <h3
                    className={css({
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'rgb(15, 23, 42)',
                    })}
                  >
                    {exp.position}
                  </h3>
                  <p
                    className={css({
                      fontSize: '11px',
                      color: 'rgb(30, 58, 138)',
                      fontWeight: '600',
                      fontStyle: 'italic',
                    })}
                  >
                    {exp.company}
                  </p>
                </div>
                <div className={css({ textAlign: 'right' })}>
                  <p
                    className={css({
                      fontSize: '10px',
                      color: 'rgb(71, 85, 105)',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </p>
                  <p className={css({ fontSize: '9px', color: 'rgb(100, 116, 139)' })}>
                    {exp.location}
                  </p>
                </div>
              </div>

              {exp.description && (
                <p
                  className={css({
                    fontSize: '10px',
                    color: 'rgb(51, 65, 85)',
                    mb: '4px',
                    fontStyle: 'italic',
                    lineHeight: '1.6',
                  })}
                >
                  {exp.description}
                </p>
              )}

              {/* Achievements with emphasis on impact */}
              {exp.achievements && exp.achievements.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '0', mt: '4px', spaceY: '2px' })}>
                  {exp.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${exp.id}-ach-${idx}`}
                          className={css({
                            fontSize: '10px',
                            color: 'rgb(30, 41, 59)',
                            lineHeight: '1.6',
                            position: 'relative',
                            pl: '14px',
                          })}
                        >
                          <span
                            className={css({
                              position: 'absolute',
                              left: '0',
                              color: 'rgb(30, 58, 138)',
                              fontWeight: 'bold',
                            })}
                          >
                            •
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
                    fontSize: '9px',
                    color: 'rgb(100, 116, 139)',
                    mt: '4px',
                    fontFamily: 'system-ui, sans-serif',
                  })}
                >
                  <strong>Technologies:</strong> {exp.technologies.join(' • ')}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className={css({ mb: '18px' })}>
          <h2
            className={css({
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'rgb(30, 58, 138)',
              mb: '10px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
              borderBottom: '2px solid',
              borderColor: 'rgb(203, 213, 225)',
              pb: '4px',
            })}
          >
            Education
          </h2>

          {education.map((edu) => (
            <div key={edu.id} className={css({ mb: '8px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}>
                <div>
                  <h3
                    className={css({
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'rgb(15, 23, 42)',
                    })}
                  >
                    {edu.degree}
                    {edu.field && `, ${edu.field}`}
                  </h3>
                  <p
                    className={css({
                      fontSize: '10px',
                      color: 'rgb(30, 58, 138)',
                      fontWeight: '600',
                    })}
                  >
                    {edu.institution}
                  </p>
                </div>
                <div className={css({ textAlign: 'right' })}>
                  <p
                    className={css({
                      fontSize: '10px',
                      color: 'rgb(71, 85, 105)',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                  <p className={css({ fontSize: '9px', color: 'rgb(100, 116, 139)' })}>
                    {edu.location}
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '12px', fontSize: '10px', mt: '2px' })}>
                {edu.gpa && (
                  <p className={css({ color: 'rgb(51, 65, 85)' })}>
                    <strong>GPA:</strong> {edu.gpa}
                  </p>
                )}
                {edu.honors && (
                  <p className={css({ color: 'rgb(51, 65, 85)' })}>
                    <strong>Honors:</strong> {edu.honors}
                  </p>
                )}
              </div>

              {edu.achievements && edu.achievements.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '0', mt: '3px', spaceY: '1px' })}>
                  {edu.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${edu.id}-ach-${idx}`}
                          className={css({
                            fontSize: '9px',
                            color: 'rgb(51, 65, 85)',
                            position: 'relative',
                            pl: '12px',
                          })}
                        >
                          <span
                            className={css({
                              position: 'absolute',
                              left: '0',
                              color: 'rgb(30, 58, 138)',
                            })}
                          >
                            •
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

      {/* Two-Column Layout for Skills and Projects */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '16px',
        })}
      >
        {/* Skills Section */}
        {skills && skills.length > 0 && (
          <section>
            <h2
              className={css({
                fontSize: '15px',
                fontWeight: 'bold',
                color: 'rgb(30, 58, 138)',
                mb: '8px',
                textTransform: 'uppercase',
                letterSpacing: 'widest',
                borderBottom: '2px solid',
                borderColor: 'rgb(203, 213, 225)',
                pb: '4px',
              })}
            >
              Core Competencies
            </h2>

            {skills.map((group) => (
              <div key={`skill-${group.category}`} className={css({ mb: '4px' })}>
                <span
                  className={css({
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'rgb(30, 58, 138)',
                  })}
                >
                  {group.category}:
                </span>{' '}
                <span className={css({ fontSize: '10px', color: 'rgb(51, 65, 85)' })}>
                  {group.skills.filter(Boolean).join(' • ')}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* Projects Section */}
        {projects && projects.length > 0 && (
          <section>
            <h2
              className={css({
                fontSize: '15px',
                fontWeight: 'bold',
                color: 'rgb(30, 58, 138)',
                mb: '8px',
                textTransform: 'uppercase',
                letterSpacing: 'widest',
                borderBottom: '2px solid',
                borderColor: 'rgb(203, 213, 225)',
                pb: '4px',
              })}
            >
              Key Projects & Initiatives
            </h2>

            {projects.map((project) => (
              <div key={project.id} className={css({ mb: '8px' })}>
                <h3
                  className={css({
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'rgb(15, 23, 42)',
                  })}
                >
                  {project.name}
                  {project.role && (
                    <span
                      className={css({
                        fontSize: '10px',
                        fontWeight: 'normal',
                        color: 'rgb(71, 85, 105)',
                        fontStyle: 'italic',
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
                    color: 'rgb(51, 65, 85)',
                    mb: '2px',
                    lineHeight: '1.5',
                  })}
                >
                  {project.description}
                </p>

                {project.highlights && project.highlights.length > 0 && (
                  <ul className={css({ listStyle: 'none', pl: '0', mt: '2px', spaceY: '1px' })}>
                    {project.highlights.map(
                      (highlight, idx) =>
                        highlight && (
                          <li
                            key={`${project.id}-hl-${idx}`}
                            className={css({
                              fontSize: '9px',
                              color: 'rgb(51, 65, 85)',
                              position: 'relative',
                              pl: '12px',
                            })}
                          >
                            <span
                              className={css({
                                position: 'absolute',
                                left: '0',
                                color: 'rgb(30, 58, 138)',
                              })}
                            >
                              •
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
                      color: 'rgb(100, 116, 139)',
                      mt: '2px',
                      fontFamily: 'system-ui, sans-serif',
                    })}
                  >
                    <strong>Stack:</strong> {project.technologies.join(' • ')}
                  </p>
                )}

                {(project.url || project.github) && (
                  <p
                    className={css({
                      fontSize: '8px',
                      color: 'rgb(30, 58, 138)',
                      mt: '2px',
                      fontFamily: 'system-ui, sans-serif',
                    })}
                  >
                    {project.url && <span>{project.url}</span>}
                    {project.url && project.github && <span> • </span>}
                    {project.github && <span>{project.github}</span>}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  )
}
