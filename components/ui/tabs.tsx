import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { css } from '@/styled-system/css'

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

function useTabsContext() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs provider')
  }
  return context
}

interface TabsProps extends ComponentPropsWithoutRef<'div'> {
  defaultValue: string
  children: ReactNode
}

export function Tabs({ defaultValue, children, className = '', ...props }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
}

export function TabsList({ children, className = '', ...props }: TabsListProps) {
  return (
    <div
      className={`${css({
        display: 'flex',
        gap: '2',
        borderBottomWidth: '1px',
        borderColor: 'gray.700',
        mb: '4',
      })} ${className}`}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps extends ComponentPropsWithoutRef<'button'> {
  value: string
  children: ReactNode
}

export function TabsTrigger({ value, children, className = '', ...props }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext()
  const isActive = activeTab === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={`${css({
        px: '4',
        py: '2',
        fontSize: 'sm',
        fontWeight: 'medium',
        color: isActive ? 'blue.400' : 'gray.400',
        borderBottomWidth: '2px',
        borderColor: isActive ? 'blue.400' : 'transparent',
        transition: 'all 0.2s',
        cursor: 'pointer',
        bg: 'transparent',
        _hover: {
          color: isActive ? 'blue.300' : 'gray.300',
        },
      })} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

interface TabsContentProps extends ComponentPropsWithoutRef<'div'> {
  value: string
  children: ReactNode
}

export function TabsContent({ value, children, className = '', ...props }: TabsContentProps) {
  const { activeTab } = useTabsContext()

  if (activeTab !== value) {
    return null
  }

  return (
    <div role="tabpanel" className={className} {...props}>
      {children}
    </div>
  )
}
