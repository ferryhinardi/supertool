import { AlertCircle, Check } from 'lucide-react'
import type { ChangeEvent } from 'react'
import { Input } from '@/components/ui/input'
import { css } from '@/styled-system/css'
import type { PersonalInfo } from '../types'
import {
  validateEmail,
  validateGitHub,
  validateLinkedIn,
  validatePhone,
  validateUrl,
} from '../utils'

interface PersonalInfoFormProps {
  data: PersonalInfo
  onChange: (data: PersonalInfo) => void
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const handleChange =
    (field: keyof PersonalInfo) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({
        ...data,
        [field]: e.target.value,
      })
    }

  // Validation states
  const emailValid = data.email ? validateEmail(data.email) : true
  const phoneValid = data.phone ? validatePhone(data.phone) : true
  const websiteValid = data.website ? validateUrl(data.website) : true
  const linkedinValid = data.linkedin ? validateLinkedIn(data.linkedin) : true
  const githubValid = data.github ? validateGitHub(data.github) : true
  const portfolioValid = data.portfolio ? validateUrl(data.portfolio) : true

  return (
    <div className={css({ display: 'flex', flexDirection: 'column', gap: '6' })}>
      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
        >
          Full Name <span className={css({ color: 'red.400' })}>*</span>
        </label>
        <Input
          id="fullName"
          type="text"
          value={data.fullName}
          onChange={handleChange('fullName')}
          placeholder="John Doe"
          required
          className={css({ w: 'full' })}
        />
      </div>

      {/* Professional Title */}
      <div>
        <label
          htmlFor="professionalTitle"
          className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
        >
          Professional Title <span className={css({ color: 'red.400' })}>*</span>
        </label>
        <Input
          id="professionalTitle"
          type="text"
          value={data.professionalTitle}
          onChange={handleChange('professionalTitle')}
          placeholder="Senior Software Engineer"
          required
          className={css({ w: 'full' })}
        />
        <p className={css({ mt: '1', fontSize: 'xs', color: 'gray.400' })}>
          Your current or target job title
        </p>
      </div>

      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
        >
          Email <span className={css({ color: 'red.400' })}>*</span>
        </label>
        <div className={css({ position: 'relative' })}>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={handleChange('email')}
            placeholder="john.doe@example.com"
            required
            className={css({ w: 'full', pr: '10' })}
          />
          {data.email && (
            <div
              className={css({
                position: 'absolute',
                right: '3',
                top: '50%',
                transform: 'translateY(-50%)',
              })}
            >
              {emailValid ? (
                <Check className={css({ w: '4', h: '4', color: 'green.500' })} />
              ) : (
                <AlertCircle className={css({ w: '4', h: '4', color: 'red.500' })} />
              )}
            </div>
          )}
        </div>
        {data.email && !emailValid && (
          <p className={css({ mt: '1', fontSize: 'xs', color: 'red.400' })}>
            Please enter a valid email address
          </p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
        >
          Phone Number <span className={css({ color: 'red.400' })}>*</span>
        </label>
        <div className={css({ position: 'relative' })}>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={handleChange('phone')}
            placeholder="+1 (555) 123-4567"
            required
            className={css({ w: 'full', pr: '10' })}
          />
          {data.phone && (
            <div
              className={css({
                position: 'absolute',
                right: '3',
                top: '50%',
                transform: 'translateY(-50%)',
              })}
            >
              {phoneValid ? (
                <Check className={css({ w: '4', h: '4', color: 'green.500' })} />
              ) : (
                <AlertCircle className={css({ w: '4', h: '4', color: 'red.500' })} />
              )}
            </div>
          )}
        </div>
        {data.phone && !phoneValid && (
          <p className={css({ mt: '1', fontSize: 'xs', color: 'red.400' })}>
            Please enter a valid phone number with area code
          </p>
        )}
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="location"
          className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
        >
          Location <span className={css({ color: 'red.400' })}>*</span>
        </label>
        <Input
          id="location"
          type="text"
          value={data.location}
          onChange={handleChange('location')}
          placeholder="San Francisco, CA"
          required
          className={css({ w: 'full' })}
        />
        <p className={css({ mt: '1', fontSize: 'xs', color: 'gray.400' })}>
          City, State or City, Country
        </p>
      </div>

      {/* Optional Links */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
          gap: '4',
        })}
      >
        {/* Website */}
        <div>
          <label
            htmlFor="website"
            className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
          >
            Website
          </label>
          <div className={css({ position: 'relative' })}>
            <Input
              id="website"
              type="url"
              value={data.website || ''}
              onChange={handleChange('website')}
              placeholder="https://example.com"
              className={css({ w: 'full', pr: '10' })}
            />
            {data.website && (
              <div
                className={css({
                  position: 'absolute',
                  right: '3',
                  top: '50%',
                  transform: 'translateY(-50%)',
                })}
              >
                {websiteValid ? (
                  <Check className={css({ w: '4', h: '4', color: 'green.500' })} />
                ) : (
                  <AlertCircle className={css({ w: '4', h: '4', color: 'red.500' })} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* LinkedIn */}
        <div>
          <label
            htmlFor="linkedin"
            className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
          >
            LinkedIn
          </label>
          <div className={css({ position: 'relative' })}>
            <Input
              id="linkedin"
              type="url"
              value={data.linkedin || ''}
              onChange={handleChange('linkedin')}
              placeholder="https://linkedin.com/in/username"
              className={css({ w: 'full', pr: '10' })}
            />
            {data.linkedin && (
              <div
                className={css({
                  position: 'absolute',
                  right: '3',
                  top: '50%',
                  transform: 'translateY(-50%)',
                })}
              >
                {linkedinValid ? (
                  <Check className={css({ w: '4', h: '4', color: 'green.500' })} />
                ) : (
                  <AlertCircle className={css({ w: '4', h: '4', color: 'red.500' })} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* GitHub */}
        <div>
          <label
            htmlFor="github"
            className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
          >
            GitHub
          </label>
          <div className={css({ position: 'relative' })}>
            <Input
              id="github"
              type="url"
              value={data.github || ''}
              onChange={handleChange('github')}
              placeholder="https://github.com/username"
              className={css({ w: 'full', pr: '10' })}
            />
            {data.github && (
              <div
                className={css({
                  position: 'absolute',
                  right: '3',
                  top: '50%',
                  transform: 'translateY(-50%)',
                })}
              >
                {githubValid ? (
                  <Check className={css({ w: '4', h: '4', color: 'green.500' })} />
                ) : (
                  <AlertCircle className={css({ w: '4', h: '4', color: 'red.500' })} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Portfolio */}
        <div>
          <label
            htmlFor="portfolio"
            className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
          >
            Portfolio
          </label>
          <div className={css({ position: 'relative' })}>
            <Input
              id="portfolio"
              type="url"
              value={data.portfolio || ''}
              onChange={handleChange('portfolio')}
              placeholder="https://portfolio.com"
              className={css({ w: 'full', pr: '10' })}
            />
            {data.portfolio && (
              <div
                className={css({
                  position: 'absolute',
                  right: '3',
                  top: '50%',
                  transform: 'translateY(-50%)',
                })}
              >
                {portfolioValid ? (
                  <Check className={css({ w: '4', h: '4', color: 'green.500' })} />
                ) : (
                  <AlertCircle className={css({ w: '4', h: '4', color: 'red.500' })} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Professional Summary */}
      <div>
        <label
          htmlFor="summary"
          className={css({ display: 'block', fontSize: 'sm', fontWeight: 'medium', mb: '2' })}
        >
          Professional Summary <span className={css({ color: 'red.400' })}>*</span>
        </label>
        <textarea
          id="summary"
          value={data.summary}
          onChange={handleChange('summary')}
          placeholder="A results-driven software engineer with 5+ years of experience building scalable web applications..."
          required
          rows={5}
          className={css({
            w: 'full',
            px: '3',
            py: '2',
            bg: 'gray.900',
            border: '1px solid',
            borderColor: 'gray.800',
            rounded: 'md',
            fontSize: 'sm',
            color: 'gray.50',
            _focus: {
              outline: 'none',
              borderColor: 'blue.500',
              ring: '2px',
              ringColor: 'blue.500/20',
            },
            _placeholder: {
              color: 'gray.400',
            },
          })}
        />
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            mt: '1',
          })}
        >
          <p
            className={css({
              fontSize: 'xs',
              color:
                data.summary.length < 100
                  ? 'yellow.400'
                  : data.summary.length > 500
                    ? 'red.400'
                    : 'green.500',
            })}
          >
            {data.summary.length < 100
              ? 'Too short - aim for 100-300 characters'
              : data.summary.length > 500
                ? 'Too long - keep it under 500 characters'
                : 'Good length'}
          </p>
          <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
            {data.summary.length} characters
          </p>
        </div>
      </div>
    </div>
  )
}
