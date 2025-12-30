/**
 * Classic Resume Template
 * 100% ATS-friendly - traditional black & white design with no colors or icons
 * Perfect for conservative industries (finance, law, government)
 */

import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface ClassicTemplateProps {
  data: ResumeData
}

export function ClassicTemplate({ data }: ClassicTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'black',
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '10px',
        lineHeight: '1.5',
        p: '20px',
        overflow: 'auto',
      })}
    >
      {/* Header Section */}
      <header
        className={css({
          mb: '16px',
          textAlign: 'center',
          borderBottom: '2px solid black',
          pb: '10px',
        })}
      >
        <h1
          className={css({
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'black',
            mb: '4px',
            textTransform: 'uppercase',
            letterSpacing: 'wide',
          })}
        >
          {personal.fullName || 'YOUR NAME'}
        </h1>

        {personal.professionalTitle && (
          <p
            className={css({
              fontSize: '12px',
              fontWeight: 'normal',
              mb: '6px',
              fontStyle: 'italic',
            })}
          >
            {personal.professionalTitle}
          </p>
        )}

        {/* Contact Information - Single Line */}
        <div
          className={css({
            fontSize: '10px',
            color: 'black',
          })}
        >
          {[
            personal.email,
            personal.phone,
            personal.location,
            personal.linkedin && `LinkedIn: ${personal.linkedin}`,
            personal.github && `GitHub: ${personal.github}`,
            personal.website,
          ]
            .filter(Boolean)
            .join(' • ')}
        </div>
      </header>

      {/* Professional Summary */}
      {personal.summary && (
        <section className={css({ mb: '14px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'black',
              mb: '6px',
              textTransform: 'uppercase',
              letterSpacing: 'wider',
              borderBottom: '1px solid black',
              pb: '2px',
            })}
          >
            PROFESSIONAL SUMMARY
          </h2>
          <p className={css({ fontSize: '10px', color: 'black', lineHeight: '1.6' })}>
            {personal.summary}
          </p>
        </section>
      )}

      {/* Experience Section */}
      {experience && experience.length > 0 && (
        <section className={css({ mb: '14px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'black',
              mb: '8px',
              textTransform: 'uppercase',
              letterSpacing: 'wider',
              borderBottom: '1px solid black',
              pb: '2px',
            })}
          >
            WORK EXPERIENCE
          </h2>

          {experience.map((exp) => (
            <div key={exp.id} className={css({ mb: '10px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}>
                <div>
                  <h3 className={css({ fontSize: '11px', fontWeight: 'bold', color: 'black' })}>
                    {exp.position}
                  </h3>
                  <p className={css({ fontSize: '10px', color: 'black', fontStyle: 'italic' })}>
                    {exp.company}, {exp.location}
                  </p>
                </div>
                <span
                  className={css({
                    fontSize: '10px',
                    color: 'black',
                    whiteSpace: 'nowrap',
                    fontStyle: 'italic',
                  })}
                >
                  {formatDateRange(exp.startDate, exp.endDate)}
                </span>
              </div>

              {exp.description && (
                <p
                  className={css({
                    fontSize: '10px',
                    color: 'black',
                    mb: '3px',
                    lineHeight: '1.5',
                  })}
                >
                  {exp.description}
                </p>
              )}

              {exp.achievements && exp.achievements.length > 0 && (
                <ul className={css({ listStyle: 'disc', pl: '16px', mt: '2px' })}>
                  {exp.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${exp.id}-ach-${idx}`}
                          className={css({ fontSize: '10px', color: 'black', mb: '1px' })}
                        >
                          {achievement}
                        </li>
                      )
                  )}
                </ul>
              )}

              {exp.technologies && exp.technologies.length > 0 && (
                <p className={css({ fontSize: '9px', color: 'black', mt: '3px' })}>
                  <strong>Technologies:</strong> {exp.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education Section */}
      {education && education.length > 0 && (
        <section className={css({ mb: '14px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'black',
              mb: '8px',
              textTransform: 'uppercase',
              letterSpacing: 'wider',
              borderBottom: '1px solid black',
              pb: '2px',
            })}
          >
            EDUCATION
          </h2>

          {education.map((edu) => (
            <div key={edu.id} className={css({ mb: '8px' })}>
              <div className={css({ display: 'flex', justifyContent: 'space-between', mb: '2px' })}>
                <div>
                  <h3 className={css({ fontSize: '11px', fontWeight: 'bold', color: 'black' })}>
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </h3>
                  <p className={css({ fontSize: '10px', color: 'black', fontStyle: 'italic' })}>
                    {edu.institution}, {edu.location}
                  </p>
                </div>
                <span
                  className={css({
                    fontSize: '10px',
                    color: 'black',
                    whiteSpace: 'nowrap',
                    fontStyle: 'italic',
                  })}
                >
                  {formatDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>

              {edu.gpa && (
                <p className={css({ fontSize: '10px', color: 'black' })}>
                  <strong>GPA:</strong> {edu.gpa}
                </p>
              )}

              {edu.honors && (
                <p className={css({ fontSize: '10px', color: 'black' })}>
                  <strong>Honors:</strong> {edu.honors}
                </p>
              )}

              {edu.achievements && edu.achievements.length > 0 && (
                <ul className={css({ listStyle: 'disc', pl: '16px', mt: '2px' })}>
                  {edu.achievements.map(
                    (achievement, idx) =>
                      achievement && (
                        <li
                          key={`${edu.id}-ach-${idx}`}
                          className={css({ fontSize: '10px', color: 'black' })}
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
        <section className={css({ mb: '14px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'black',
              mb: '8px',
              textTransform: 'uppercase',
              letterSpacing: 'wider',
              borderBottom: '1px solid black',
              pb: '2px',
            })}
          >
            SKILLS
          </h2>

          {skills.map((group, idx) => (
            <div key={`skill-group-${idx}`} className={css({ mb: '4px' })}>
              <span className={css({ fontSize: '10px', fontWeight: 'bold', color: 'black' })}>
                {group.category}:
              </span>{' '}
              <span className={css({ fontSize: '10px', color: 'black' })}>
                {group.skills.filter(Boolean).join(', ')}
              </span>
            </div>
          ))}
        </section>
      )}

      {/* Projects Section */}
      {projects && projects.length > 0 && (
        <section className={css({ mb: '14px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: 'bold',
              color: 'black',
              mb: '8px',
              textTransform: 'uppercase',
              letterSpacing: 'wider',
              borderBottom: '1px solid black',
              pb: '2px',
            })}
          >
            PROJECTS
          </h2>

          {projects.map((project) => (
            <div key={project.id} className={css({ mb: '8px' })}>
              <h3 className={css({ fontSize: '11px', fontWeight: 'bold', color: 'black' })}>
                {project.name}
              </h3>
              <p className={css({ fontSize: '10px', color: 'black', mb: '2px' })}>
                {project.description}
              </p>

              {project.highlights && project.highlights.length > 0 && (
                <ul className={css({ listStyle: 'disc', pl: '16px', mt: '2px' })}>
                  {project.highlights.map(
                    (highlight, idx) =>
                      highlight && (
                        <li
                          key={`${project.id}-hl-${idx}`}
                          className={css({ fontSize: '10px', color: 'black' })}
                        >
                          {highlight}
                        </li>
                      )
                  )}
                </ul>
              )}

              {project.technologies && project.technologies.length > 0 && (
                <p className={css({ fontSize: '9px', color: 'black', mt: '3px' })}>
                  <strong>Technologies:</strong> {project.technologies.join(', ')}
                </p>
              )}

              {(project.url || project.github) && (
                <p className={css({ fontSize: '9px', color: 'black', mt: '2px' })}>
                  {project.url && <span>Project URL: {project.url}</span>}
                  {project.url && project.github && <span> | </span>}
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
