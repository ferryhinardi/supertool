import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface CompactTemplateProps {
  data: ResumeData
}

export function CompactTemplate({ data }: CompactTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'rgb(17, 24, 39)',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '8px',
        lineHeight: '1.35',
        p: '12px',
      })}
    >
      {/* Header Section - Compact */}
      <div
        className={css({
          borderBottom: '1px solid rgb(107, 114, 128)',
          pb: '4px',
          mb: '8px',
        })}
      >
        {/* Name and Title - Single Line */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px',
            mb: '3px',
          })}
        >
          <h1
            className={css({
              fontSize: '14px',
              fontWeight: '700',
              color: 'rgb(17, 24, 39)',
              letterSpacing: '0.5px',
            })}
          >
            {personal.fullName}
          </h1>
          {personal.professionalTitle && (
            <span
              className={css({
                fontSize: '9px',
                color: 'rgb(75, 85, 99)',
                fontWeight: '500',
              })}
            >
              | {personal.professionalTitle}
            </span>
          )}
        </div>

        {/* Contact Info - Compact, Single Line */}
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '7px',
            color: 'rgb(75, 85, 99)',
          })}
        >
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>• {personal.phone}</span>}
          {personal.location && <span>• {personal.location}</span>}
          {personal.linkedin && <span>• {personal.linkedin}</span>}
          {personal.website && <span>• {personal.website}</span>}
        </div>
      </div>

      {/* Professional Summary - Compact */}
      {personal.summary && (
        <div className={css({ mb: '8px' })}>
          <h2
            className={css({
              fontSize: '9px',
              fontWeight: '700',
              color: 'rgb(17, 24, 39)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: '3px',
            })}
          >
            Summary
          </h2>
          <p
            className={css({
              fontSize: '7.5px',
              lineHeight: '1.4',
              color: 'rgb(55, 65, 81)',
            })}
          >
            {personal.summary}
          </p>
        </div>
      )}

      {/* Experience Section - Very Compact */}
      {experience.length > 0 && (
        <div className={css({ mb: '8px' })}>
          <h2
            className={css({
              fontSize: '9px',
              fontWeight: '700',
              color: 'rgb(17, 24, 39)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: '3px',
              borderBottom: '1px solid rgb(209, 213, 219)',
              pb: '2px',
            })}
          >
            Experience
          </h2>
          <div className={css({ spaceY: '4px' })}>
            {experience.map((exp, index) => (
              <div key={index}>
                {/* Job Title and Company - Single Line */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mb: '1px',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '4px',
                    })}
                  >
                    <span
                      className={css({
                        fontSize: '8.5px',
                        fontWeight: '600',
                        color: 'rgb(17, 24, 39)',
                      })}
                    >
                      {exp.position}
                    </span>
                    <span
                      className={css({
                        fontSize: '7.5px',
                        color: 'rgb(75, 85, 99)',
                      })}
                    >
                      | {exp.company}
                    </span>
                    {exp.location && (
                      <span
                        className={css({
                          fontSize: '7px',
                          color: 'rgb(107, 114, 128)',
                        })}
                      >
                        • {exp.location}
                      </span>
                    )}
                  </div>
                  <span
                    className={css({
                      fontSize: '7px',
                      color: 'rgb(107, 114, 128)',
                      fontStyle: 'italic',
                    })}
                  >
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>

                {/* Description - Compact */}
                {exp.description && (
                  <p
                    className={css({
                      fontSize: '7.5px',
                      lineHeight: '1.3',
                      color: 'rgb(55, 65, 81)',
                      mb: '2px',
                    })}
                  >
                    {exp.description}
                  </p>
                )}

                {/* Achievements - Dense Bullets */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul
                    className={css({
                      listStyleType: 'disc',
                      ml: '10px',
                      spaceY: '0.5px',
                    })}
                  >
                    {exp.achievements.map((achievement, i) => (
                      <li
                        key={i}
                        className={css({
                          fontSize: '7.5px',
                          lineHeight: '1.3',
                          color: 'rgb(55, 65, 81)',
                        })}
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section - Compact */}
      {education.length > 0 && (
        <div className={css({ mb: '8px' })}>
          <h2
            className={css({
              fontSize: '9px',
              fontWeight: '700',
              color: 'rgb(17, 24, 39)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: '3px',
              borderBottom: '1px solid rgb(209, 213, 219)',
              pb: '2px',
            })}
          >
            Education
          </h2>
          <div className={css({ spaceY: '3px' })}>
            {education.map((edu, index) => (
              <div key={index}>
                {/* Degree and School - Single Line */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '4px',
                    })}
                  >
                    <span
                      className={css({
                        fontSize: '8.5px',
                        fontWeight: '600',
                        color: 'rgb(17, 24, 39)',
                      })}
                    >
                      {edu.degree}
                    </span>
                    {edu.field && (
                      <span
                        className={css({
                          fontSize: '7.5px',
                          color: 'rgb(75, 85, 99)',
                        })}
                      >
                        in {edu.field}
                      </span>
                    )}
                  </div>
                  <span
                    className={css({
                      fontSize: '7px',
                      color: 'rgb(107, 114, 128)',
                      fontStyle: 'italic',
                    })}
                  >
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </span>
                </div>

                {/* School and GPA - Single Line */}
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '4px',
                    fontSize: '7.5px',
                    color: 'rgb(75, 85, 99)',
                  })}
                >
                  <span>{edu.institution}</span>
                  {edu.gpa && <span>• GPA: {edu.gpa}</span>}
                  {edu.location && <span>• {edu.location}</span>}
                </div>

                {/* Achievements - Compact */}
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul
                    className={css({
                      listStyleType: 'disc',
                      ml: '10px',
                      spaceY: '0.5px',
                      mt: '1px',
                    })}
                  >
                    {edu.achievements.map((achievement, i) => (
                      <li
                        key={i}
                        className={css({
                          fontSize: '7px',
                          lineHeight: '1.3',
                          color: 'rgb(55, 65, 81)',
                        })}
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills Section - Very Compact Grid */}
      {skills.length > 0 && (
        <div className={css({ mb: '8px' })}>
          <h2
            className={css({
              fontSize: '9px',
              fontWeight: '700',
              color: 'rgb(17, 24, 39)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: '3px',
              borderBottom: '1px solid rgb(209, 213, 219)',
              pb: '2px',
            })}
          >
            Skills
          </h2>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '4px',
            })}
          >
            {skills.map((skillGroup, index) => (
              <div key={index}>
                <span
                  className={css({
                    fontSize: '8px',
                    fontWeight: '600',
                    color: 'rgb(17, 24, 39)',
                  })}
                >
                  {skillGroup.category}:
                </span>{' '}
                <span
                  className={css({
                    fontSize: '7.5px',
                    color: 'rgb(55, 65, 81)',
                  })}
                >
                  {skillGroup.skills.join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section - Compact */}
      {projects.length > 0 && (
        <div>
          <h2
            className={css({
              fontSize: '9px',
              fontWeight: '700',
              color: 'rgb(17, 24, 39)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              mb: '3px',
              borderBottom: '1px solid rgb(209, 213, 219)',
              pb: '2px',
            })}
          >
            Projects
          </h2>
          <div className={css({ spaceY: '3px' })}>
            {projects.map((project, index) => (
              <div key={index}>
                {/* Project Name and Link - Single Line */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mb: '1px',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '4px',
                    })}
                  >
                    <span
                      className={css({
                        fontSize: '8.5px',
                        fontWeight: '600',
                        color: 'rgb(17, 24, 39)',
                      })}
                    >
                      {project.name}
                    </span>
                    {project.url && (
                      <span
                        className={css({
                          fontSize: '7px',
                          color: 'rgb(107, 114, 128)',
                        })}
                      >
                        • {project.url}
                      </span>
                    )}
                  </div>
                  {(project.startDate || project.endDate) && (
                    <span
                      className={css({
                        fontSize: '7px',
                        color: 'rgb(107, 114, 128)',
                        fontStyle: 'italic',
                      })}
                    >
                      {formatDateRange(project.startDate || '', project.endDate || '')}
                    </span>
                  )}
                </div>

                {/* Description - Compact */}
                {project.description && (
                  <p
                    className={css({
                      fontSize: '7.5px',
                      lineHeight: '1.3',
                      color: 'rgb(55, 65, 81)',
                      mb: '1px',
                    })}
                  >
                    {project.description}
                  </p>
                )}

                {/* Technologies - Inline */}
                {project.technologies && project.technologies.length > 0 && (
                  <div
                    className={css({
                      fontSize: '7px',
                      color: 'rgb(107, 114, 128)',
                    })}
                  >
                    <span className={css({ fontWeight: '600' })}>Tech:</span>{' '}
                    {project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
