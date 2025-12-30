import { css } from '@/styled-system/css'
import type { ResumeData } from '../../types'
import { formatDateRange } from '../../utils'

interface ElegantTemplateProps {
  data: ResumeData
}

export function ElegantTemplate({ data }: ElegantTemplateProps) {
  const { personal, experience, education, skills, projects } = data

  return (
    <div
      className={css({
        w: 'full',
        h: 'full',
        bg: 'white',
        color: 'rgb(31, 41, 55)',
        fontFamily: 'Garamond, Georgia, "Times New Roman", serif',
        fontSize: '10px',
        lineHeight: '1.7',
        p: '40px',
      })}
    >
      {/* Header Section - Elegant and Centered */}
      <div
        className={css({
          textAlign: 'center',
          borderBottom: '1px solid rgb(156, 163, 175)',
          pb: '20px',
          mb: '30px',
        })}
      >
        {/* Name with Elegant Styling */}
        <h1
          className={css({
            fontSize: '32px',
            fontWeight: '300',
            color: 'rgb(79, 70, 229)',
            letterSpacing: '2px',
            mb: '8px',
            fontFamily: 'Georgia, serif',
          })}
        >
          {personal.fullName}
        </h1>

        {/* Professional Title */}
        {personal.professionalTitle && (
          <div
            className={css({
              fontSize: '13px',
              fontWeight: '400',
              color: 'rgb(107, 114, 128)',
              letterSpacing: '1px',
              fontStyle: 'italic',
              mb: '12px',
            })}
          >
            {personal.professionalTitle}
          </div>
        )}

        {/* Decorative Divider */}
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            mb: '12px',
          })}
        >
          <div
            className={css({
              w: '60px',
              h: '1px',
              bg: 'rgb(156, 163, 175)',
            })}
          />
          <div
            className={css({
              w: '4px',
              h: '4px',
              borderRadius: '50%',
              bg: 'rgb(79, 70, 229)',
            })}
          />
          <div
            className={css({
              w: '60px',
              h: '1px',
              bg: 'rgb(156, 163, 175)',
            })}
          />
        </div>

        {/* Contact Information - Elegant Layout */}
        <div
          className={css({
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            fontSize: '9px',
            color: 'rgb(107, 114, 128)',
            letterSpacing: '0.5px',
          })}
        >
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && (
            <>
              <span>•</span>
              <span>{personal.phone}</span>
            </>
          )}
          {personal.location && (
            <>
              <span>•</span>
              <span>{personal.location}</span>
            </>
          )}
          {personal.linkedin && (
            <>
              <span>•</span>
              <span>{personal.linkedin}</span>
            </>
          )}
          {personal.website && (
            <>
              <span>•</span>
              <span>{personal.website}</span>
            </>
          )}
        </div>
      </div>

      {/* Professional Summary - Drop Cap Style */}
      {personal.summary && (
        <div className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: '400',
              color: 'rgb(79, 70, 229)',
              textAlign: 'center',
              letterSpacing: '1.5px',
              mb: '16px',
              textTransform: 'uppercase',
            })}
          >
            Professional Profile
          </h2>
          <p
            className={css({
              fontSize: '10.5px',
              lineHeight: '1.8',
              color: 'rgb(55, 65, 81)',
              textAlign: 'justify',
              px: '20px',
            })}
          >
            {personal.summary}
          </p>
        </div>
      )}

      {/* Experience Section */}
      {experience.length > 0 && (
        <div className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: '400',
              color: 'rgb(79, 70, 229)',
              textAlign: 'center',
              letterSpacing: '1.5px',
              mb: '20px',
              textTransform: 'uppercase',
              position: 'relative',
              _after: {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                w: '40px',
                h: '1px',
                bg: 'rgb(79, 70, 229)',
              },
            })}
          >
            Professional Experience
          </h2>
          <div className={css({ spaceY: '24px', mt: '24px' })}>
            {experience.map((exp, index) => (
              <div key={index}>
                {/* Position and Company */}
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mb: '6px',
                  })}
                >
                  <div>
                    <h3
                      className={css({
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgb(31, 41, 55)',
                        mb: '2px',
                      })}
                    >
                      {exp.position}
                    </h3>
                    <div
                      className={css({
                        fontSize: '10px',
                        fontStyle: 'italic',
                        color: 'rgb(107, 114, 128)',
                      })}
                    >
                      {exp.company}
                      {exp.location && ` • ${exp.location}`}
                    </div>
                  </div>
                  <span
                    className={css({
                      fontSize: '9px',
                      color: 'rgb(107, 114, 128)',
                      fontStyle: 'italic',
                    })}
                  >
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </span>
                </div>

                {/* Description */}
                {exp.description && (
                  <p
                    className={css({
                      fontSize: '10px',
                      lineHeight: '1.7',
                      color: 'rgb(55, 65, 81)',
                      mb: '8px',
                      fontStyle: 'italic',
                    })}
                  >
                    {exp.description}
                  </p>
                )}

                {/* Achievements */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul
                    className={css({
                      listStyleType: 'none',
                      pl: '0',
                      spaceY: '4px',
                    })}
                  >
                    {exp.achievements.map((achievement, i) => (
                      <li
                        key={i}
                        className={css({
                          fontSize: '10px',
                          lineHeight: '1.7',
                          color: 'rgb(55, 65, 81)',
                          position: 'relative',
                          pl: '20px',
                          _before: {
                            content: '"◆"',
                            position: 'absolute',
                            left: '0',
                            color: 'rgb(79, 70, 229)',
                            fontSize: '8px',
                          },
                        })}
                      >
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Technologies */}
                {exp.technologies && exp.technologies.length > 0 && (
                  <div
                    className={css({
                      mt: '8px',
                      fontSize: '9px',
                      color: 'rgb(107, 114, 128)',
                      fontStyle: 'italic',
                    })}
                  >
                    <span className={css({ fontWeight: '600' })}>Technologies:</span>{' '}
                    {exp.technologies.join(' • ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education Section */}
      {education.length > 0 && (
        <div className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: '400',
              color: 'rgb(79, 70, 229)',
              textAlign: 'center',
              letterSpacing: '1.5px',
              mb: '20px',
              textTransform: 'uppercase',
              position: 'relative',
              _after: {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                w: '40px',
                h: '1px',
                bg: 'rgb(79, 70, 229)',
              },
            })}
          >
            Education
          </h2>
          <div className={css({ spaceY: '20px', mt: '24px' })}>
            {education.map((edu, index) => (
              <div key={index}>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mb: '6px',
                  })}
                >
                  <div>
                    <h3
                      className={css({
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'rgb(31, 41, 55)',
                        mb: '2px',
                      })}
                    >
                      {edu.degree}
                      {edu.field && ` in ${edu.field}`}
                    </h3>
                    <div
                      className={css({
                        fontSize: '10px',
                        fontStyle: 'italic',
                        color: 'rgb(107, 114, 128)',
                      })}
                    >
                      {edu.institution}
                      {edu.location && ` • ${edu.location}`}
                    </div>
                  </div>
                  <span
                    className={css({
                      fontSize: '9px',
                      color: 'rgb(107, 114, 128)',
                      fontStyle: 'italic',
                    })}
                  >
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </span>
                </div>

                {/* GPA and Honors */}
                {(edu.gpa || edu.honors) && (
                  <div
                    className={css({
                      fontSize: '9px',
                      color: 'rgb(107, 114, 128)',
                      mb: '6px',
                    })}
                  >
                    {edu.gpa && <span>GPA: {edu.gpa}</span>}
                    {edu.gpa && edu.honors && <span> • </span>}
                    {edu.honors && <span>{edu.honors}</span>}
                  </div>
                )}

                {/* Achievements */}
                {edu.achievements && edu.achievements.length > 0 && (
                  <ul
                    className={css({
                      listStyleType: 'none',
                      pl: '0',
                      spaceY: '3px',
                    })}
                  >
                    {edu.achievements.map((achievement, i) => (
                      <li
                        key={i}
                        className={css({
                          fontSize: '10px',
                          lineHeight: '1.6',
                          color: 'rgb(55, 65, 81)',
                          position: 'relative',
                          pl: '20px',
                          _before: {
                            content: '"◆"',
                            position: 'absolute',
                            left: '0',
                            color: 'rgb(79, 70, 229)',
                            fontSize: '8px',
                          },
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

      {/* Skills Section */}
      {skills.length > 0 && (
        <div className={css({ mb: '32px' })}>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: '400',
              color: 'rgb(79, 70, 229)',
              textAlign: 'center',
              letterSpacing: '1.5px',
              mb: '20px',
              textTransform: 'uppercase',
              position: 'relative',
              _after: {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                w: '40px',
                h: '1px',
                bg: 'rgb(79, 70, 229)',
              },
            })}
          >
            Expertise
          </h2>
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              mt: '24px',
            })}
          >
            {skills.map((skillGroup, index) => (
              <div key={index}>
                <h3
                  className={css({
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'rgb(31, 41, 55)',
                    mb: '6px',
                    letterSpacing: '0.5px',
                  })}
                >
                  {skillGroup.category}
                </h3>
                <p
                  className={css({
                    fontSize: '10px',
                    lineHeight: '1.7',
                    color: 'rgb(75, 85, 99)',
                  })}
                >
                  {skillGroup.skills.join(' • ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects Section */}
      {projects.length > 0 && (
        <div>
          <h2
            className={css({
              fontSize: '14px',
              fontWeight: '400',
              color: 'rgb(79, 70, 229)',
              textAlign: 'center',
              letterSpacing: '1.5px',
              mb: '20px',
              textTransform: 'uppercase',
              position: 'relative',
              _after: {
                content: '""',
                position: 'absolute',
                bottom: '-8px',
                left: '50%',
                transform: 'translateX(-50%)',
                w: '40px',
                h: '1px',
                bg: 'rgb(79, 70, 229)',
              },
            })}
          >
            Notable Projects
          </h2>
          <div className={css({ spaceY: '20px', mt: '24px' })}>
            {projects.map((project, index) => (
              <div key={index}>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    mb: '6px',
                  })}
                >
                  <h3
                    className={css({
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'rgb(31, 41, 55)',
                    })}
                  >
                    {project.name}
                  </h3>
                  {(project.startDate || project.endDate) && (
                    <span
                      className={css({
                        fontSize: '9px',
                        color: 'rgb(107, 114, 128)',
                        fontStyle: 'italic',
                      })}
                    >
                      {formatDateRange(project.startDate || '', project.endDate || '')}
                    </span>
                  )}
                </div>

                {project.role && (
                  <div
                    className={css({
                      fontSize: '10px',
                      fontStyle: 'italic',
                      color: 'rgb(107, 114, 128)',
                      mb: '6px',
                    })}
                  >
                    {project.role}
                  </div>
                )}

                <p
                  className={css({
                    fontSize: '10px',
                    lineHeight: '1.7',
                    color: 'rgb(55, 65, 81)',
                    mb: '8px',
                  })}
                >
                  {project.description}
                </p>

                {/* Highlights */}
                {project.highlights && project.highlights.length > 0 && (
                  <ul
                    className={css({
                      listStyleType: 'none',
                      pl: '0',
                      spaceY: '3px',
                      mb: '8px',
                    })}
                  >
                    {project.highlights.map((highlight, i) => (
                      <li
                        key={i}
                        className={css({
                          fontSize: '10px',
                          lineHeight: '1.6',
                          color: 'rgb(55, 65, 81)',
                          position: 'relative',
                          pl: '20px',
                          _before: {
                            content: '"◆"',
                            position: 'absolute',
                            left: '0',
                            color: 'rgb(79, 70, 229)',
                            fontSize: '8px',
                          },
                        })}
                      >
                        {highlight}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Technologies and Links */}
                <div
                  className={css({
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '9px',
                    color: 'rgb(107, 114, 128)',
                    fontStyle: 'italic',
                  })}
                >
                  {project.technologies && project.technologies.length > 0 && (
                    <span>
                      <span className={css({ fontWeight: '600' })}>Tech:</span>{' '}
                      {project.technologies.join(' • ')}
                    </span>
                  )}
                  {project.url && (
                    <span>
                      <span className={css({ fontWeight: '600' })}>URL:</span> {project.url}
                    </span>
                  )}
                  {project.github && (
                    <span>
                      <span className={css({ fontWeight: '600' })}>GitHub:</span> {project.github}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
