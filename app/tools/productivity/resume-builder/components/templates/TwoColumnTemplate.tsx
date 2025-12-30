/**
 * Two-Column Resume Template
 * Space-efficient layout with sidebar for contact/skills and main content area
 * Maximizes content while maintaining readability
 */

import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface TwoColumnTemplateProps {
  data: ResumeData
}

export function TwoColumnTemplate({ data }: TwoColumnTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'rgb(31, 41, 55)', // Gray-800
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '9px',
        lineHeight: '1.5',
        display: 'flex',
        overflow: 'auto',
      })}
    >
      {/* Left Sidebar - 30% width */}
      <aside
        className={css({
          w: '30%',
          bg: 'rgb(249, 250, 251)', // Gray-50
          p: '16px',
          borderRight: '2px solid',
          borderColor: 'rgb(229, 231, 235)', // Gray-200
        })}
      >
        {/* Personal Info in Sidebar */}
        <div className={css({ mb: '16px' })}>
          <h1
            className={css({
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'rgb(17, 24, 39)', // Gray-900
              mb: '4px',
              wordBreak: 'break-word',
            })}
          >
            {personal.fullName || 'Your Name'}
          </h1>
          <p
            className={css({
              fontSize: '10px',
              color: 'rgb(79, 70, 229)', // Indigo-600
              fontWeight: '600',
              mb: '8px',
              wordBreak: 'break-word',
            })}
          >
            {personal.professionalTitle || 'Professional Title'}
          </p>

          {/* Contact Info - Stacked */}
          <div className={css({ fontSize: '8px', color: 'rgb(75, 85, 99)', spaceY: '2px' })}>
            {personal.email && <p className={css({ wordBreak: 'break-all' })}>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.website && (
              <p className={css({ wordBreak: 'break-all' })}>{personal.website}</p>
            )}
            {personal.linkedin && (
              <p className={css({ wordBreak: 'break-all' })}>{personal.linkedin}</p>
            )}
            {personal.github && (
              <p className={css({ wordBreak: 'break-all' })}>{personal.github}</p>
            )}
          </div>
        </div>

        {/* Skills in Sidebar */}
        {skills && skills.length > 0 && (
          <div className={css({ mb: '16px' })}>
            <h2
              className={css({
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'rgb(17, 24, 39)',
                mb: '8px',
                textTransform: 'uppercase',
                letterSpacing: 'wide',
                borderBottom: '2px solid',
                borderColor: 'rgb(79, 70, 229)',
                pb: '3px',
              })}
            >
              Skills
            </h2>
            {skills.map((group) => (
              <div key={`skill-${group.category}`} className={css({ mb: '6px' })}>
                <p
                  className={css({
                    fontSize: '9px',
                    fontWeight: 'bold',
                    color: 'rgb(55, 65, 81)',
                    mb: '2px',
                  })}
                >
                  {group.category}
                </p>
                <div className={css({ fontSize: '8px', color: 'rgb(107, 114, 128)' })}>
                  {group.skills.filter(Boolean).map((skill, idx) => (
                    <span key={`${group.category}-skill-${idx}`}>
                      {skill}
                      {idx < group.skills.filter(Boolean).length - 1 && ' • '}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education in Sidebar */}
        {education && education.length > 0 && (
          <div className={css({ mb: '16px' })}>
            <h2
              className={css({
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'rgb(17, 24, 39)',
                mb: '8px',
                textTransform: 'uppercase',
                letterSpacing: 'wide',
                borderBottom: '2px solid',
                borderColor: 'rgb(79, 70, 229)',
                pb: '3px',
              })}
            >
              Education
            </h2>
            {education.map((edu) => (
              <div key={edu.id} className={css({ mb: '8px', fontSize: '8px' })}>
                <p
                  className={css({
                    fontWeight: 'bold',
                    color: 'rgb(17, 24, 39)',
                    mb: '2px',
                    wordBreak: 'break-word',
                  })}
                >
                  {edu.degree}
                </p>
                {edu.field && (
                  <p className={css({ color: 'rgb(75, 85, 99)', mb: '1px' })}>{edu.field}</p>
                )}
                <p className={css({ color: 'rgb(107, 114, 128)', mb: '1px' })}>{edu.institution}</p>
                <p className={css({ fontSize: '7px', color: 'rgb(156, 163, 175)' })}>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </p>
                {edu.gpa && (
                  <p className={css({ fontSize: '7px', color: 'rgb(107, 114, 128)', mt: '1px' })}>
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.honors && (
                  <p className={css({ fontSize: '7px', color: 'rgb(107, 114, 128)', mt: '1px' })}>
                    {edu.honors}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Additional Projects Link if exists */}
        {projects && projects.length > 0 && (
          <div>
            <h2
              className={css({
                fontSize: '11px',
                fontWeight: 'bold',
                color: 'rgb(17, 24, 39)',
                mb: '6px',
                textTransform: 'uppercase',
                letterSpacing: 'wide',
                borderBottom: '2px solid',
                borderColor: 'rgb(79, 70, 229)',
                pb: '3px',
              })}
            >
              Portfolio
            </h2>
            <div className={css({ fontSize: '7px', color: 'rgb(79, 70, 229)', spaceY: '2px' })}>
              {projects.slice(0, 3).map((project) => (
                <div key={project.id}>
                  {project.url && <p className={css({ wordBreak: 'break-all' })}>{project.url}</p>}
                  {project.github && (
                    <p className={css({ wordBreak: 'break-all' })}>{project.github}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main Content Area - 70% width */}
      <main className={css({ flex: '1', p: '16px', bg: 'white' })}>
        {/* Professional Summary */}
        {personal.summary && (
          <section className={css({ mb: '14px' })}>
            <h2
              className={css({
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'rgb(79, 70, 229)',
                mb: '5px',
                textTransform: 'uppercase',
                letterSpacing: 'wide',
              })}
            >
              Professional Summary
            </h2>
            <p
              className={css({
                fontSize: '9px',
                color: 'rgb(55, 65, 81)',
                lineHeight: '1.6',
              })}
            >
              {personal.summary}
            </p>
          </section>
        )}

        {/* Experience Section */}
        {experience && experience.length > 0 && (
          <section className={css({ mb: '14px' })}>
            <h2
              className={css({
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'rgb(79, 70, 229)',
                mb: '8px',
                textTransform: 'uppercase',
                letterSpacing: 'wide',
              })}
            >
              Work Experience
            </h2>

            {experience.map((exp) => (
              <div key={exp.id} className={css({ mb: '10px' })}>
                <div
                  className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}
                >
                  <div>
                    <h3
                      className={css({
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: 'rgb(17, 24, 39)',
                      })}
                    >
                      {exp.position}
                    </h3>
                    <p
                      className={css({
                        fontSize: '9px',
                        color: 'rgb(79, 70, 229)',
                        fontWeight: '600',
                      })}
                    >
                      {exp.company} • {exp.location}
                    </p>
                  </div>
                  <span
                    className={css({
                      fontSize: '8px',
                      color: 'rgb(107, 114, 128)',
                      whiteSpace: 'nowrap',
                    })}
                  >
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>

                {exp.description && (
                  <p
                    className={css({
                      fontSize: '8px',
                      color: 'rgb(75, 85, 99)',
                      mb: '3px',
                      fontStyle: 'italic',
                    })}
                  >
                    {exp.description}
                  </p>
                )}

                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className={css({ listStyle: 'disc', pl: '12px', mt: '2px', spaceY: '1px' })}>
                    {exp.achievements.map(
                      (achievement, idx) =>
                        achievement && (
                          <li
                            key={`${exp.id}-ach-${idx}`}
                            className={css({
                              fontSize: '8px',
                              color: 'rgb(55, 65, 81)',
                            })}
                          >
                            {achievement}
                          </li>
                        )
                    )}
                  </ul>
                )}

                {exp.technologies && exp.technologies.length > 0 && (
                  <p className={css({ fontSize: '7px', color: 'rgb(107, 114, 128)', mt: '2px' })}>
                    <strong>Tech:</strong> {exp.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Projects Section - Detailed in Main Content */}
        {projects && projects.length > 0 && (
          <section>
            <h2
              className={css({
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'rgb(79, 70, 229)',
                mb: '8px',
                textTransform: 'uppercase',
                letterSpacing: 'wide',
              })}
            >
              Key Projects
            </h2>

            {projects.map((project) => (
              <div key={project.id} className={css({ mb: '8px' })}>
                <h3
                  className={css({
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'rgb(17, 24, 39)',
                  })}
                >
                  {project.name}
                  {project.role && (
                    <span
                      className={css({
                        fontSize: '8px',
                        fontWeight: 'normal',
                        color: 'rgb(107, 114, 128)',
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
                    fontSize: '8px',
                    color: 'rgb(75, 85, 99)',
                    mb: '2px',
                  })}
                >
                  {project.description}
                </p>

                {project.highlights && project.highlights.length > 0 && (
                  <ul className={css({ listStyle: 'disc', pl: '12px', mt: '2px', spaceY: '1px' })}>
                    {project.highlights.map(
                      (highlight, idx) =>
                        highlight && (
                          <li
                            key={`${project.id}-hl-${idx}`}
                            className={css({
                              fontSize: '7px',
                              color: 'rgb(107, 114, 128)',
                            })}
                          >
                            {highlight}
                          </li>
                        )
                    )}
                  </ul>
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <p className={css({ fontSize: '7px', color: 'rgb(107, 114, 128)', mt: '2px' })}>
                    <strong>Stack:</strong> {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
