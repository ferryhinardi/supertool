/**
 * Modern Professional Resume Template
 * Clean, contemporary design with subtle color accents
 */

import { Briefcase, Globe, GraduationCap, Mail, MapPin, Phone } from 'lucide-react'
import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface ModernTemplateProps {
  data: ResumeData
}

export function ModernTemplate({ data }: ModernTemplateProps) {
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
          borderBottom: '2px solid',
          borderColor: 'blue.600',
          pb: '8px',
        })}
      >
        <h1
          className={css({
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'gray.900',
            mb: '2px',
            letterSpacing: 'tight',
          })}
        >
          {personal.fullName || 'Your Name'}
        </h1>
        <p
          className={css({
            fontSize: '11px',
            color: 'blue.600',
            fontWeight: '600',
            mb: '4px',
          })}
        >
          {personal.professionalTitle || 'Professional Title'}
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
          {personal.website && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <Globe className={css({ w: '8px', h: '8px' })} />
              <span>{personal.website}</span>
            </div>
          )}
          {personal.linkedin && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <span>LinkedIn: {personal.linkedin}</span>
            </div>
          )}
          {personal.github && (
            <div className={css({ display: 'flex', alignItems: 'center', gap: '2px' })}>
              <span>GitHub: {personal.github}</span>
            </div>
          )}
        </div>
      </header>

      {/* Professional Summary */}
      {personal.summary && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'blue.600',
              mb: '4px',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
            })}
          >
            Professional Summary
          </h2>
          <p className={css({ fontSize: '9px', color: 'gray.800', lineHeight: '1.5' })}>
            {personal.summary}
          </p>
        </section>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'blue.600',
              mb: '6px',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            })}
          >
            <Briefcase className={css({ w: '12px', h: '12px' })} />
            Work Experience
          </h2>

          {experience.map((exp) => (
            <div key={exp.id} className={css({ mb: '8px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}>
                <div>
                  <h3 className={css({ fontSize: '10px', fontWeight: 'bold', color: 'gray.900' })}>
                    {exp.position}
                  </h3>
                  <p className={css({ fontSize: '9px', color: 'gray.700', fontWeight: '600' })}>
                    {exp.company} • {exp.location}
                  </p>
                </div>
                <span className={css({ fontSize: '8px', color: 'gray.600', whiteSpace: 'nowrap' })}>
                  {formatDateRange(exp.startDate, exp.endDate)}
                </span>
              </div>

              {exp.description && (
                <p
                  className={css({
                    fontSize: '8px',
                    color: 'gray.700',
                    mb: '2px',
                    fontStyle: 'italic',
                  })}
                >
                  {exp.description}
                </p>
              )}

              {exp.achievements && exp.achievements.length > 0 && (
                <ul className={css({ listStyle: 'disc', pl: '12px', mt: '2px' })}>
                  {exp.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${exp.id}-ach-${idx}`}
                          className={css({ fontSize: '8px', color: 'gray.800', mb: '1px' })}
                        >
                          {achievement}
                        </li>
                      )
                  )}
                </ul>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <p className={css({ fontSize: '7px', color: 'gray.600', mt: '2px' })}>
                  <strong>Technologies:</strong> {exp.technologies.join(', ')}
                </p>
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
              color: 'blue.600',
              mb: '6px',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            })}
          >
            <GraduationCap className={css({ w: '12px', h: '12px' })} />
            Education
          </h2>

          {education.map((edu) => (
            <div key={edu.id} className={css({ mb: '6px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}>
                <div>
                  <h3 className={css({ fontSize: '10px', fontWeight: 'bold', color: 'gray.900' })}>
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </h3>
                  <p className={css({ fontSize: '9px', color: 'gray.700', fontWeight: '600' })}>
                    {edu.institution} • {edu.location}
                  </p>
                </div>
                <span className={css({ fontSize: '8px', color: 'gray.600', whiteSpace: 'nowrap' })}>
                  {formatDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>

              {edu.gpa && (
                <p className={css({ fontSize: '8px', color: 'gray.700' })}>
                  <strong>GPA:</strong> {edu.gpa}
                </p>
              )}

              {edu.honors && (
                <p className={css({ fontSize: '8px', color: 'gray.700' })}>
                  <strong>Honors:</strong> {edu.honors}
                </p>
              )}

              {edu.achievements && edu.achievements.length > 0 && (
                <ul className={css({ listStyle: 'disc', pl: '12px', mt: '2px' })}>
                  {edu.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${edu.id}-ach-${idx}`}
                          className={css({ fontSize: '8px', color: 'gray.800' })}
                        >
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

      {/* Skills Section */}
      {skills && skills.length > 0 && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'blue.600',
              mb: '6px',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
            })}
          >
            Skills
          </h2>

          {skills.map((group, idx) => (
            <div key={`skill-group-${idx}`} className={css({ mb: '3px' })}>
              <span className={css({ fontSize: '9px', fontWeight: 'bold', color: 'gray.900' })}>
                {group.category}:
              </span>{' '}
              <span className={css({ fontSize: '9px', color: 'gray.800' })}>
                {group.skills.filter(Boolean).join(' • ')}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className={css({ mb: '12px' })}>
          <h2
            className={css({
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'blue.600',
              mb: '6px',
              textTransform: 'uppercase',
              letterSpacing: 'wide',
            })}
          >
            Projects
          </h2>

          {projects.map((project) => (
            <div key={project.id} className={css({ mb: '6px' })}>
              <h3 className={css({ fontSize: '10px', fontWeight: 'bold', color: 'gray.900' })}>
                {project.name}
              </h3>
              <p className={css({ fontSize: '8px', color: 'gray.700', mb: '2px' })}>
                {project.description}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <ul className={css({ listStyle: 'disc', pl: '12px', mt: '2px' })}>
                  {project.highlights.map(
                    (highlight, idx) =>
                      highlight && (
                        <li
                          key={`${project.id}-hl-${idx}`}
                          className={css({ fontSize: '8px', color: 'gray.800' })}
                        >
                          {highlight}
                        </li>
                      )
                  )}
                </ul>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <p className={css({ fontSize: '7px', color: 'gray.600', mt: '2px' })}>
                  <strong>Tech Stack:</strong> {project.technologies.join(', ')}
                </p>
              )}

              {(project.url || project.github) && (
                <p className={css({ fontSize: '7px', color: 'blue.600', mt: '2px' })}>
                  {project.url && <span>Live: {project.url}</span>}
                  {project.url && project.github && <span> • </span>}
                  {project.github && <span>GitHub: {project.github}</span>}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
