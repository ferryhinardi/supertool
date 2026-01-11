/**
 * Mock for @ark-ui/react/portal
 */
import type * as React from 'react'

// Portal - renders children directly without portaling
export const Portal = ({ children }: { children: React.ReactNode }) => children

export default Portal
