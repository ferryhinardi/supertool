/**
 * Creative Resume Template
 * Bold, vibrant design for creative professionals (designers, marketers, artists)
 * Unique layout with personality while maintaining professionalism
 */

import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface CreativeTemplateProps {
  data: ResumeData
}

export function CreativeTemplate({ data }: CreativeTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  // Creative color scheme - vibrant purple/teal
  const primaryColor = 'rgb(139, 92, 246)' // Purple-500
  const accentColor = 'rgb(20, 184, 166)' // Teal-500
  const darkColor = 'rgb(17, 24, 39)' // Gray-900

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: darkColor,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '9px',
        lineHeight: '1.5',
        overflow: 'auto',
      })}
    >
      {/* Sidebar with colored background */}
      <div className={css({ display: 'flex', h: 'full' })}>
        {/* Left Sidebar - Colored Section */}
        <div
          className={css({
            w: '35%',
            bg: primaryColor,
            color: 'white',
            p: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          })}
        >
          {/* Header in Sidebar */}
          <div>
            <h1
              className={css({
                fontSize: '22px',
                fontWeight: 'bold',
                mb: '4px',
                letterSpacing: 'tight',
              })}
            >
              {personal.fullName || 'Your Name'}
            </h1>
            <p
              className={css({
                fontSize: '11px',
                fontWeight: '600',
                opacity: 0.9,
                letterSpacing: 'wide',
              })}
            >
              {personal.professionalTitle || 'Professional Title'}
            </p>
          </div>

          {/* Contact Info */}
          <div className={css({ fontSize: '8px', opacity: 0.95, spaceY: '3px' })}>
            {personal.email && <p className={css({ wordBreak: 'break-word' })}>{personal.email}</p>}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.location && <p>{personal.location}</p>}
            {personal.website && (
              <p className={css({ wordBreak: 'break-word' })}>{personal.website}</p>
            )}
            {personal.linkedin && (
              <p className={css({ wordBreak: 'break-word' })}>{personal.linkedin}</p>
            )}
            {personal.github && (
              <p className={css({ wordBreak: 'break-word' })}>{personal.github}</p>
            )}
          </div>

          {/* Skills in Sidebar - Visual Display */}
          {skills && skills.length > 0 && (
            <div className={css({ mt: '8px' })}>
              <h2
                className={css({
                  fontSize: '11px',
                  fontWeight: 'bold',
                  mb: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: 'wider',
                  borderBottom: '2px solid',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  pb: '4px',
                })}
              >
                Skills
              </h2>
              {skills.map((group) => (
                <div key={`skill-${group.category}`} className={css({ mb: '8px' })}>
                  <p
                    className={css({
                      fontSize: '9px',
                      fontWeight: 'bold',
                      mb: '3px',
                      opacity: 0.95,
                    })}
                  >
                    {group.category}
                  </p>
                  <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '4px' })}>
                    {group.skills
                      .filter(Boolean)
                      .slice(0, 6)
                      .map((skill, idx) => (
                        <span
                          key={`${group.category}-skill-${idx}`}
                          className={css({
                            fontSize: '7px',
                            bg: 'rgba(255, 255, 255, 0.2)',
                            px: '6px',
                            py: '2px',
                            borderRadius: '4px',
                            fontWeight: '600',
                          })}
                        >
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education in Sidebar */}
          {education && education.length > 0 && (
            <div className={css({ mt: '8px' })}>
              <h2
                className={css({
                  fontSize: '11px',
                  fontWeight: 'bold',
                  mb: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: 'wider',
                  borderBottom: '2px solid',
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  pb: '4px',
                })}
              >
                Education
              </h2>
              {education.map((edu) => (
                <div key={edu.id} className={css({ mb: '8px', fontSize: '8px' })}>
                  <p className={css({ fontWeight: 'bold', mb: '2px' })}>
                    {edu.degree}
                    {edu.field && `, ${edu.field}`}
                  </p>
                  <p className={css({ opacity: 0.9, mb: '1px' })}>{edu.institution}</p>
                  <p className={css({ opacity: 0.8, fontSize: '7px' })}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </p>
                  {edu.gpa && (
                    <p className={css({ opacity: 0.85, mt: '1px', fontSize: '7px' })}>
                      GPA: {edu.gpa}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className={css({ flex: '1', p: '20px', bg: 'white' })}>
          {/* Professional Summary with Accent */}
          {personal.summary && (
            <section className={css({ mb: '20px' })}>
              <div
                className={css({
                  borderLeft: '4px solid',
                  borderColor: accentColor,
                  pl: '12px',
                  py: '8px',
                })}
              >
                <h2
                  className={css({
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: primaryColor,
                    mb: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: 'wider',
                  })}
                >
                  About Me
                </h2>
                <p
                  className={css({
                    fontSize: '10px',
                    color: 'rgb(55, 65, 81)',
                    lineHeight: '1.6',
                  })}
                >
                  {personal.summary}
                </p>
              </div>
            </section>
          )}

          {/* Projects Section - Prominent for Creatives */}
          {projects && projects.length > 0 && (
            <section className={css({ mb: '20px' })}>
              <h2
                className={css({
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: primaryColor,
                  mb: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: 'wider',
                  position: 'relative',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-4px',
                    left: '0',
                    w: '40px',
                    h: '3px',
                    bg: accentColor,
                  },
                })}
              >
                Portfolio
              </h2>

              {projects.map((project) => (
                <div
                  key={project.id}
                  className={css({
                    mb: '14px',
                    borderLeft: '3px solid',
                    borderColor: 'rgb(229, 231, 235)',
                    pl: '10px',
                    _hover: { borderColor: accentColor },
                  })}
                >
                  <h3
                    className={css({
                      fontSize: '11px',
                      fontWeight: 'bold',
                      color: darkColor,
                      mb: '2px',
                    })}
                  >
                    {project.name}
                    {project.role && (
                      <span
                        className={css({
                          fontSize: '9px',
                          fontWeight: 'normal',
                          color: primaryColor,
                          ml: '4px',
                        })}
                      >
                        — {project.role}
                      </span>
                    )}
                  </h3>

                  <p
                    className={css({
                      fontSize: '9px',
                      color: 'rgb(75, 85, 99)',
                      mb: '4px',
                      lineHeight: '1.5',
                    })}
                  >
                    {project.description}
                  </p>

                  {project.highlights && project.highlights.length > 0 && (
                    <ul className={css({ listStyle: 'none', pl: '0', mt: '3px', spaceY: '1px' })}>
                      {project.highlights.map(
                        (highlight, idx) =>
                          highlight && (
                            <li
                              key={`${project.id}-hl-${idx}`}
                              className={css({
                                fontSize: '8px',
                                color: 'rgb(107, 114, 128)',
                                position: 'relative',
                                pl: '10px',
                              })}
                            >
                              <span
                                className={css({
                                  position: 'absolute',
                                  left: '0',
                                  color: accentColor,
                                  fontWeight: 'bold',
                                })}
                              >
                                ▸
                              </span>
                              {highlight}
                            </li>
                          )
                      )}
                    </ul>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <div
                      className={css({ display: 'flex', flexWrap: 'wrap', gap: '4px', mt: '4px' })}
                    >
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={`${project.id}-tech-${idx}`}
                          className={css({
                            fontSize: '7px',
                            bg: 'rgb(243, 244, 246)',
                            color: primaryColor,
                            px: '6px',
                            py: '2px',
                            borderRadius: '4px',
                            fontWeight: '600',
                          })}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {(project.url || project.github) && (
                    <p className={css({ fontSize: '7px', color: accentColor, mt: '3px' })}>
                      {project.url && <span>{project.url}</span>}
                      {project.url && project.github && <span> • </span>}
                      {project.github && <span>{project.github}</span>}
                    </p>
                  )}
                </div>
              ))}
            </section>
          )}

          {/* Experience Section */}
          {experience && experience.length > 0 && (
            <section className={css({ mb: '20px' })}>
              <h2
                className={css({
                  fontSize: '13px',
                  fontWeight: 'bold',
                  color: primaryColor,
                  mb: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: 'wider',
                  position: 'relative',
                  _after: {
                    content: '""',
                    position: 'absolute',
                    bottom: '-4px',
                    left: '0',
                    w: '40px',
                    h: '3px',
                    bg: accentColor,
                  },
                })}
              >
                Experience
              </h2>

              {experience.map((exp) => (
                <div key={exp.id} className={css({ mb: '12px' })}>
                  <div className={css({ mb: '4px' })}>
                    <h3
                      className={css({
                        fontSize: '11px',
                        fontWeight: 'bold',
                        color: darkColor,
                      })}
                    >
                      {exp.position}
                    </h3>
                    <div
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                      })}
                    >
                      <p
                        className={css({
                          fontSize: '9px',
                          color: primaryColor,
                          fontWeight: '600',
                        })}
                      >
                        {exp.company} • {exp.location}
                      </p>
                      <p
                        className={css({
                          fontSize: '8px',
                          color: 'rgb(107, 114, 128)',
                          whiteSpace: 'nowrap',
                        })}
                      >
                        {formatDateRange(exp.startDate, exp.endDate)}
                      </p>
                    </div>
                  </div>

                  {exp.description && (
                    <p
                      className={css({
                        fontSize: '9px',
                        color: 'rgb(75, 85, 99)',
                        mb: '3px',
                        fontStyle: 'italic',
                      })}
                    >
                      {exp.description}
                    </p>
                  )}

                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className={css({ listStyle: 'none', pl: '0', mt: '3px', spaceY: '1px' })}>
                      {exp.achievements.map(
                        (achievement, idx) =>
                          achievement && (
                            <li
                              key={`${exp.id}-ach-${idx}`}
                              className={css({
                                fontSize: '8px',
                                color: 'rgb(55, 65, 81)',
                                position: 'relative',
                                pl: '10px',
                              })}
                            >
                              <span
                                className={css({
                                  position: 'absolute',
                                  left: '0',
                                  color: accentColor,
                                  fontWeight: 'bold',
                                })}
                              >
                                ▸
                              </span>
                              {achievement}
                            </li>
                          )
                      )}
                    </ul>
                  )}

                  {exp.technologies && exp.technologies.length > 0 && (
                    <div
                      className={css({ display: 'flex', flexWrap: 'wrap', gap: '4px', mt: '3px' })}
                    >
                      {exp.technologies.slice(0, 8).map((tech, idx) => (
                        <span
                          key={`${exp.id}-tech-${idx}`}
                          className={css({
                            fontSize: '7px',
                            bg: 'rgb(243, 244, 246)',
                            color: primaryColor,
                            px: '6px',
                            py: '2px',
                            borderRadius: '4px',
                            fontWeight: '600',
                          })}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
