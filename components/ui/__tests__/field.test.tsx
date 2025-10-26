import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { Field, FieldLabel, FieldHelperText, FieldErrorText, FieldInput } from '../field'

describe('Field Component', () => {
  it('renders field with label', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldInput name="email" type="email" />
      </Field>
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders helper text', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldInput name="email" type="email" />
        <FieldHelperText>Enter your email address</FieldHelperText>
      </Field>
    )
    expect(screen.getByText('Enter your email address')).toBeInTheDocument()
  })

  it('renders error text', () => {
    render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <FieldInput name="email" type="email" />
        <FieldErrorText>Email is required</FieldErrorText>
      </Field>
    )
    expect(screen.getByText('Email is required')).toBeInTheDocument()
  })

  it('associates label with input via htmlFor', () => {
    render(
      <Field>
        <FieldLabel htmlFor="email-input">Email</FieldLabel>
        <FieldInput id="email-input" name="email" type="email" />
      </Field>
    )
    const label = screen.getByText('Email')
    const input = screen.getByRole('textbox')
    expect(label).toHaveAttribute('for', 'email-input')
    expect(input).toHaveAttribute('id', 'email-input')
  })

  it('applies invalid state to input', () => {
    render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <FieldInput name="email" type="email" aria-invalid="true" />
        <FieldErrorText>Email is required</FieldErrorText>
      </Field>
    )
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('applies disabled state to input', () => {
    render(
      <Field disabled>
        <FieldLabel>Email</FieldLabel>
        <FieldInput name="email" type="email" disabled />
      </Field>
    )
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('renders field with all sub-components', () => {
    render(
      <Field>
        <FieldLabel>Email</FieldLabel>
        <FieldInput name="email" type="email" placeholder="you@example.com" />
        <FieldHelperText>We&apos;ll never share your email</FieldHelperText>
        <FieldErrorText>This field is required</FieldErrorText>
      </Field>
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByText("We'll never share your email")).toBeInTheDocument()
  })
})
