/**
 * Tech Resume Template
 * Optimized for software engineers and developers
 * Prominent tech stack, monospace accents, clean modern design
 */

import { Code, ExternalLink, Github, Globe, Mail, MapPin, Phone } from 'lucide-react'
import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface TechTemplateProps {
  data: ResumeData
}

export function TechTemplate({ data }: TechTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'gray.900',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '9px',
        lineHeight: '1.4',
        p: '16px',
        overflow: 'auto',
      })}
    >
      {/* Header Section */}
      <header
        className={css({
          mb: '12px',
          pb: '8px',
          borderBottom: '3px solid',
          borderColor: 'gray.900',
        })}
      >
        <h1
          className={css({
            fontSize: '22px',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '2px',
            letterSpacing: 'tight',
            fontFamily: '"Courier New", Courier, monospace',
          })}
        >
          {personal.fullName || 'YOUR_NAME'}
        </h1>
        <p
          className={css({
            fontSize: '11px',
            color: 'gray.700',
            fontWeight: '600',
            mb: '6px',
            fontFamily: 'monospace',
          })}
        >
          {`<${personal.professionalTitle || 'Software Engineer'} />`}
        </p>

        {/* Contact Information */}
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '8px',
            color: 'gray.700',
          })}
        >
          {personal.email && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <Mail className={css({ w: '8px', h: '8px' })} />
              <span>{personal.email}</span>
            </div>
          )}
          {personal.phone && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <Phone className={css({ w: '8px', h: '8px' })} />
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.location && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <MapPin className={css({ w: '8px', h: '8px' })} />
              <span>{personal.location}</span>
            </div>
          )}
          {personal.github && (
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: 'bold',
              })}
            >
              <Github className={css({ w: '8px', h: '8px' })} />
              <span>{personal.github}</span>
            </div>
          )}
          {personal.website && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <Globe className={css({ w: '8px', h: '8px' })} />
              <span>{personal.website}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <span>in/{personal.linkedin}</span>
            </div>
          )}
        </div>
      </header>

      {/* Skills Section - Prominent at top */}
      {skills && skills.length > 0 && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '6px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            })}
          >
            <Code className={css({ w: '12px', h: '12px' })} />
            TECH_STACK
          </h2>

          {skills.map((group, idx) => (
            <div key={`skill-group-${idx}`} className={css({ mb: '3px' })}>
              <span
                className={css({
                  fontSize: '9px',
                  fontWeight: 'bold',
                  color: 'gray.900',
                  fontFamily: 'monospace',
                })}
              >
                {group.category}:
              </span>{' '}
              <span
                className={css({
                  fontSize: '9px',
                  color: 'gray.700',
                  fontFamily: 'monospace',
                })}
              >
                {group.skills.filter(Boolean).map((skill, i) => (
                  <span
                    key={`skill-${i}`}
                    className={css({
                      display: 'inline-block',
                      bg: 'gray.100',
                      px: '4px',
                      py: '1px',
                      rounded: 'sm',
                      mr: '3px',
                      mb: '2px',
                      fontSize: '8px',
                    })}
                  >
                    {skill}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Professional Summary */}
      {personal.summary && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '4px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
            })}
          >
            ABOUT_ME
          </h2>
          <p className={css({ fontSize: '9px', color: 'gray.800', lineHeight: '1.5' })}>
            {personal.summary}
          </p>
        </section>
      )}

      {/* Projects Section - Prominent for developers */}
      {projects && projects.length > 0 && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '6px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
            })}
          >
            PROJECTS
          </h2>

          {projects.map((project) => (
            <div key={project.id} className={css({ mb: '8px' })}>
              <div
                className={css({ display: 'flex', alignItems: 'center', gap: '4px', mb: '2px' })}
              >
                <h3
                  className={css({
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: 'gray.900',
                    fontFamily: 'monospace',
                  })}
                >
                  {project.name}
                </h3>
                {project.github && (
                  <a
                    href={project.github}
                    className={css({ display: 'inline-flex', alignItems: 'center', gap: '1px' })}
                  >
                    <Github className={css({ w: '8px', h: '8px', color: 'gray.600' })} />
                  </a>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    className={css({ display: 'inline-flex', alignItems: 'center', gap: '1px' })}
                  >
                    <ExternalLink className={css({ w: '8px', h: '8px', color: 'gray.600' })} />
                  </a>
                )}
              </div>

              <p className={css({ fontSize: '8px', color: 'gray.700', mb: '2px' })}>
                {project.description}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '8px', mt: '2px' })}>
                  {project.highlights.map(
                    (highlight, idx) =>
                      highlight && (
                        <li
                          key={`${project.id}-hl-${idx}`}
                          className={css({ fontSize: '8px', color: 'gray.800', mb: '1px' })}
                        >
                          <span className={css({ color: 'gray.500', mr: '4px' })}>→</span>
                          {highlight}
                        </li>
                      )
                  )}
                </ul>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <div className={css({ mt: '3px', display: 'flex', flexWrap: 'wrap', gap: '2px' })}>
                  {project.technologies.map((tech, i) => (
                    <span
                      key={`tech-${i}`}
                      className={css({
                        fontSize: '7px',
                        bg: 'gray.800',
                        color: 'white',
                        px: '4px',
                        py: '1px',
                        rounded: 'sm',
                        fontFamily: 'monospace',
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

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '6px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
            })}
          >
            EXPERIENCE
          </h2>

          {experience.map((exp) => (
            <div key={exp.id} className={css({ mb: '8px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}>
                <div>
                  <h3
                    className={css({
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'gray.900',
                      fontFamily: 'monospace',
                    })}
                  >
                    {exp.position}
                  </h3>
                  <p className={css({ fontSize: '9px', color: 'gray.700', fontWeight: '600' })}>
                    {exp.company} • {exp.location}
                  </p>
                </div>
                <span
                  className={css({
                    fontSize: '8px',
                    color: 'gray.600',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                  })}
                >
                  {formatDateRange(exp.startDate, exp.endDate)}
                </span>
              </div>

              {exp.description && (
                <p
                  className={css({
                    fontSize: '8px',
                    color: 'gray.700',
                    mb: '2px',
                  })}
                >
                  {exp.description}
                </p>
              )}

              {exp.achievements && exp.achievements.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '8px', mt: '2px' })}>
                  {exp.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${exp.id}-ach-${idx}`}
                          className={css({ fontSize: '8px', color: 'gray.800', mb: '1px' })}
                        >
                          <span className={css({ color: 'gray.500', mr: '4px' })}>▸</span>
                          {achievement}
                        </li>
                      )
                  )}
                </ul>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <div className={css({ mt: '3px', display: 'flex', flexWrap: 'wrap', gap: '2px' })}>
                  {exp.technologies.map((tech, i) => (
                    <span
                      key={`exp-tech-${i}`}
                      className={css({
                        fontSize: '7px',
                        bg: 'gray.100',
                        color: 'gray.800',
                        px: '4px',
                        py: '1px',
                        rounded: 'sm',
                        fontFamily: 'monospace',
                        border: '1px solid',
                        borderColor: 'gray.300',
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

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'gray.900',
              mb: '6px',
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
            })}
          >
            EDUCATION
          </h2>

          {education.map((edu) => (
            <div key={edu.id} className={css({ mb: '6px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}>
                <div>
                  <h3
                    className={css({
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'gray.900',
                      fontFamily: 'monospace',
                    })}
                  >
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </h3>
                  <p className={css({ fontSize: '9px', color: 'gray.700', fontWeight: '600' })}>
                    {edu.institution} • {edu.location}
                  </p>
                </div>
                <span
                  className={css({
                    fontSize: '8px',
                    color: 'gray.600',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                  })}
                >
                  {formatDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>

              {(edu.gpa || edu.honors) && (
                <div className={css({ fontSize: '8px', color: 'gray.700' })}>
                  {edu.gpa && <span>GPA: {edu.gpa}</span>}
                  {edu.gpa && edu.honors && <span> • </span>}
                  {edu.honors && <span>{edu.honors}</span>}
                </div>
              )}

              {edu.achievements && edu.achievements.length > 0 && (
                <ul className={css({ listStyle: 'none', pl: '8px', mt: '2px' })}>
                  {edu.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${edu.id}-ach-${idx}`}
                          className={css({ fontSize: '8px', color: 'gray.800' })}
                        >
                          <span className={css({ color: 'gray.500', mr: '4px' })}>•</span>
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
    </div>
  )
}
