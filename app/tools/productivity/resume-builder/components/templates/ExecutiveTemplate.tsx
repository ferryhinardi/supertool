/**
 * Executive Resume Template
 * Premium C-level design emphasizing leadership and strategic impact
 * Perfect for CEO, CFO, VP positions and board members
 */

import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface ExecutiveTemplateProps {
  data: ResumeData
}

export function ExecutiveTemplate({ data }: ExecutiveTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'rgb(17, 24, 39)', // Gray-900
        fontFamily: 'Georgia, Garamond, serif',
        fontSize: '10px',
        lineHeight: '1.7',
        p: '28px',
        overflow: 'auto',
      })}
    >
      {/* Premium Header */}
      <header
        className={css({
          mb: '24px',
          textAlign: 'center',
          borderBottom: '1px solid',
          borderColor: 'rgb(17, 24, 39)',
          pb: '16px',
        })}
      >
        <h1
          className={css({
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'rgb(17, 24, 39)',
            mb: '6px',
            letterSpacing: 'wider',
            textTransform: 'uppercase',
          })}
        >
          {personal.fullName || 'Your Name'}
        </h1>
        <p
          className={css({
            fontSize: '15px',
            color: 'rgb(55, 65, 81)', // Gray-700
            fontWeight: '600',
            mb: '10px',
            fontStyle: 'italic',
            letterSpacing: 'wide',
          })}
        >
          {personal.professionalTitle || 'C-Level Executive'}
        </p>

        {/* Contact - Elegant Single Line */}
        <div
          className={css({
            fontSize: '10px',
            color: 'rgb(107, 114, 128)', // Gray-500
            letterSpacing: 'wide',
          })}
        >
          {[personal.email, personal.phone, personal.location, personal.linkedin]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </header>

      {/* Executive Summary - Large and Prominent */}
      {personal.summary && (
        <section
          className={css({
            mb: '24px',
            p: '16px',
            border: '1px solid',
            borderColor: 'rgb(209, 213, 219)', // Gray-300
            bg: 'rgb(249, 250, 251)', // Gray-50
          })}
        >
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'rgb(17, 24, 39)',
              mb: '8px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
              textAlign: 'center',
            })}
          >
            Executive Profile
          </h2>
          <p
            className={css({
              fontSize: '11px',
              color: 'rgb(31, 41, 55)', // Gray-800
              lineHeight: '1.8',
              textAlign: 'justify',
            })}
          >
            {personal.summary}
          </p>
        </section>
      )}

      {/* Core Competencies / Skills - Prominent for Executives */}
      {skills && skills.length > 0 && (
        <section className={css({ mb: '24px' })}>
          <h2
            className={css({
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'rgb(17, 24, 39)',
              mb: '12px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
              textAlign: 'center',
              borderBottom: '2px solid',
              borderColor: 'rgb(17, 24, 39)',
              pb: '6px',
            })}
          >
            Core Competencies
          </h2>

          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
            })}
          >
            {skills.map((group) => (
              <div key={`skill-${group.category}`}>
                <p
                  className={css({
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: 'rgb(17, 24, 39)',
                    mb: '4px',
                  })}
                >
                  {group.category}
                </p>
                <p
                  className={css({
                    fontSize: '10px',
                    color: 'rgb(75, 85, 99)', // Gray-600
                    lineHeight: '1.6',
                  })}
                >
                  {group.skills.filter(Boolean).join(' • ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Executive Experience - Achievement-Heavy */}
      {experience && experience.length > 0 && (
        <section className={css({ mb: '24px' })}>
          <h2
            className={css({
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'rgb(17, 24, 39)',
              mb: '16px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
              textAlign: 'center',
              borderBottom: '2px solid',
              borderColor: 'rgb(17, 24, 39)',
              pb: '6px',
            })}
          >
            Leadership Experience
          </h2>

          {experience.map((exp) => (
            <div key={exp.id} className={css({ mb: '16px' })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  mb: '4px',
                  pb: '4px',
                  borderBottom: '1px solid',
                  borderColor: 'rgb(229, 231, 235)', // Gray-200
                })}
              >
                <div>
                  <h3
                    className={css({
                      fontSize: '13px',
                      fontWeight: 'bold',
                      color: 'rgb(17, 24, 39)',
                    })}
                  >
                    {exp.position}
                  </h3>
                  <p
                    className={css({
                      fontSize: '11px',
                      color: 'rgb(55, 65, 81)',
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
                      color: 'rgb(107, 114, 128)',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </p>
                  <p
                    className={css({
                      fontSize: '9px',
                      color: 'rgb(156, 163, 175)', // Gray-400
                    })}
                  >
                    {exp.location}
                  </p>
                </div>
              </div>

              {exp.description && (
                <p
                  className={css({
                    fontSize: '10px',
                    color: 'rgb(55, 65, 81)',
                    mb: '6px',
                    fontStyle: 'italic',
                    lineHeight: '1.7',
                  })}
                >
                  {exp.description}
                </p>
              )}

              {/* Key Achievements - Prominent */}
              {exp.achievements && exp.achievements.length > 0 && (
                <div className={css({ mt: '6px' })}>
                  <p
                    className={css({
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'rgb(17, 24, 39)',
                      mb: '3px',
                    })}
                  >
                    Key Achievements:
                  </p>
                  <ul className={css({ listStyle: 'none', pl: '0', spaceY: '3px' })}>
                    {exp.achievements.map(
                      (achievement, idx) =>
                        achievement && (
                          <li
                            key={`${exp.id}-ach-${idx}`}
                            className={css({
                              fontSize: '10px',
                              color: 'rgb(31, 41, 55)',
                              lineHeight: '1.7',
                              position: 'relative',
                              pl: '16px',
                            })}
                          >
                            <span
                              className={css({
                                position: 'absolute',
                                left: '0',
                                color: 'rgb(17, 24, 39)',
                                fontWeight: 'bold',
                              })}
                            >
                              ▪
                            </span>
                            {achievement}
                          </li>
                        )
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education & Credentials */}
      {education && education.length > 0 && (
        <section className={css({ mb: '24px' })}>
          <h2
            className={css({
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'rgb(17, 24, 39)',
              mb: '12px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
              textAlign: 'center',
              borderBottom: '2px solid',
              borderColor: 'rgb(17, 24, 39)',
              pb: '6px',
            })}
          >
            Education & Credentials
          </h2>

          {education.map((edu) => (
            <div key={edu.id} className={css({ mb: '10px' })}>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  mb: '2px',
                })}
              >
                <div>
                  <h3
                    className={css({
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: 'rgb(17, 24, 39)',
                    })}
                  >
                    {edu.degree}
                    {edu.field && `, ${edu.field}`}
                  </h3>
                  <p
                    className={css({
                      fontSize: '10px',
                      color: 'rgb(55, 65, 81)',
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
                      color: 'rgb(107, 114, 128)',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                </div>
              </div>

              {(edu.gpa || edu.honors) && (
                <div
                  className={css({
                    display: 'flex',
                    gap: '12px',
                    fontSize: '10px',
                    color: 'rgb(75, 85, 99)',
                    mt: '2px',
                  })}
                >
                  {edu.gpa && (
                    <p>
                      <strong>GPA:</strong> {edu.gpa}
                    </p>
                  )}
                  {edu.honors && (
                    <p>
                      <strong>Honors:</strong> {edu.honors}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Strategic Projects & Initiatives */}
      {projects && projects.length > 0 && (
        <section>
          <h2
            className={css({
              fontSize: '15px',
              fontWeight: 'bold',
              color: 'rgb(17, 24, 39)',
              mb: '12px',
              textTransform: 'uppercase',
              letterSpacing: 'widest',
              textAlign: 'center',
              borderBottom: '2px solid',
              borderColor: 'rgb(17, 24, 39)',
              pb: '6px',
            })}
          >
            Strategic Initiatives
          </h2>

          {projects.map((project) => (
            <div key={project.id} className={css({ mb: '10px' })}>
              <h3
                className={css({
                  fontSize: '11px',
                  fontWeight: 'bold',
                  color: 'rgb(17, 24, 39)',
                })}
              >
                {project.name}
                {project.role && (
                  <span
                    className={css({
                      fontSize: '10px',
                      fontWeight: 'normal',
                      color: 'rgb(75, 85, 99)',
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
                  color: 'rgb(55, 65, 81)',
                  mb: '3px',
                  lineHeight: '1.6',
                })}
              >
                {project.description}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '0', mt: '3px', spaceY: '2px' })}>
                  {project.highlights.map(
                    (highlight, idx) =>
                      highlight && (
                        <li
                          key={`${project.id}-hl-${idx}`}
                          className={css({
                            fontSize: '9px',
                            color: 'rgb(75, 85, 99)',
                            position: 'relative',
                            pl: '14px',
                          })}
                        >
                          <span
                            className={css({
                              position: 'absolute',
                              left: '0',
                              color: 'rgb(17, 24, 39)',
                            })}
                          >
                            ▪
                          </span>
                          {highlight}
                        </li>
                      )
                  )}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
