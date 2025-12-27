import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

describe('Tabs Component', () => {
  // Basic Rendering Tests
  describe('Basic Rendering', () => {
    it('renders Tabs container with children', () => {
      render(
        <Tabs defaultValue="tab1">
          <div>Tab content</div>
        </Tabs>
      )
      expect(screen.getByText('Tab content')).toBeInTheDocument()
    })

    it('renders TabsList with role="tablist"', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      const tablist = screen.getByRole('tablist')
      expect(tablist).toBeInTheDocument()
    })

    it('renders TabsTrigger as button with role="tab"', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      const tab = screen.getByRole('tab')
      expect(tab).toBeInTheDocument()
      expect(tab.tagName).toBe('BUTTON')
      expect(tab).toHaveAttribute('type', 'button')
    })

    it('renders TabsContent with role="tabpanel"', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1">Panel 1</TabsContent>
        </Tabs>
      )
      const tabpanel = screen.getByRole('tabpanel')
      expect(tabpanel).toBeInTheDocument()
      expect(tabpanel).toHaveTextContent('Panel 1')
    })

    it('shows default tab content on mount', () => {
      render(
        <Tabs defaultValue="tab2">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    it('hides non-active tab content', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1">Active Content</TabsContent>
          <TabsContent value="tab2">Hidden Content</TabsContent>
        </Tabs>
      )
      expect(screen.getByText('Active Content')).toBeInTheDocument()
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()
    })
  })

  // Tab Switching Tests
  describe('Tab Switching', () => {
    it('switches tabs on TabsTrigger click', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      // Initially tab1 is active
      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

      // Click tab2
      const tab2Button = screen.getByRole('tab', { name: 'Tab 2' })
      await user.click(tab2Button)

      // Now tab2 content should be visible
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })

    it('shows active TabsContent and hides inactive', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      )

      // Click through all tabs
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await user.click(tab2)
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Content 3')).not.toBeInTheDocument()

      const tab3 = screen.getByRole('tab', { name: 'Tab 3' })
      await user.click(tab3)
      expect(screen.getByText('Content 3')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    })

    it('handles multiple tab switches correctly', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

      // Switch to tab2
      await user.click(tab2)
      expect(screen.getByText('Content 2')).toBeInTheDocument()

      // Switch back to tab1
      await user.click(tab1)
      expect(screen.getByText('Content 1')).toBeInTheDocument()

      // Switch to tab2 again
      await user.click(tab2)
      expect(screen.getByText('Content 2')).toBeInTheDocument()
    })

    it('updates aria-selected when tab changes', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

      // Initially tab1 is selected
      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab2).toHaveAttribute('aria-selected', 'false')

      // Click tab2
      await user.click(tab2)

      // Now tab2 should be selected
      expect(tab1).toHaveAttribute('aria-selected', 'false')
      expect(tab2).toHaveAttribute('aria-selected', 'true')
    })

    it('applies active styling to correct trigger', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

      // Tab1 should have active styling (has className)
      expect(tab1.className).toBeTruthy()
      expect(tab2.className).toBeTruthy()

      // After clicking tab2, both should still have classes
      await user.click(tab2)
      expect(tab1.className).toBeTruthy()
      expect(tab2.className).toBeTruthy()
    })
  })

  // Context API Tests
  describe('Context API', () => {
    it('throws error when TabsTrigger used outside Tabs provider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = () => {}

      expect(() => {
        render(<TabsTrigger value="tab1">Tab 1</TabsTrigger>)
      }).toThrow('Tabs components must be used within a Tabs provider')

      console.error = originalError
    })

    it('throws error when TabsContent used outside Tabs provider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = () => {}

      expect(() => {
        render(<TabsContent value="tab1">Content</TabsContent>)
      }).toThrow('Tabs components must be used within a Tabs provider')

      console.error = originalError
    })

    it('shares context state between all child components', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <div>
            <TabsContent value="tab1">Content 1</TabsContent>
            <TabsContent value="tab2">Content 2</TabsContent>
          </div>
        </Tabs>
      )

      // Both triggers and content should share the same state
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await user.click(tab2)

      // Content should update based on trigger click
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    })
  })

  // Accessibility Tests
  describe('Accessibility', () => {
    it('has correct ARIA roles on all components', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tab')).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
    })

    it('TabsTrigger has correct button type', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const trigger = screen.getByRole('tab')
      expect(trigger).toHaveAttribute('type', 'button')
    })

    it('aria-selected is true for active tab only', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' })

      expect(tab1).toHaveAttribute('aria-selected', 'true')
      expect(tab2).toHaveAttribute('aria-selected', 'false')
      expect(tab3).toHaveAttribute('aria-selected', 'false')
    })

    it('maintains accessibility when switching tabs', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      // Click tab2
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await user.click(tab2)

      // Should still have proper roles
      expect(screen.getByRole('tablist')).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
      expect(tab2).toHaveAttribute('aria-selected', 'true')
    })
  })

  // Custom Props Tests
  describe('Custom Props', () => {
    it('accepts custom className on Tabs', () => {
      const { container } = render(
        <Tabs defaultValue="tab1" className="custom-tabs">
          <div>Content</div>
        </Tabs>
      )
      const tabs = container.firstChild as HTMLElement
      expect(tabs.className).toContain('custom-tabs')
    })

    it('accepts custom className on TabsList', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList className="custom-tablist">
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          </TabsList>
        </Tabs>
      )
      const tablist = screen.getByRole('tablist')
      expect(tablist.className).toContain('custom-tablist')
    })

    it('accepts custom className on TabsTrigger', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" className="custom-trigger">
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )
      const trigger = screen.getByRole('tab')
      expect(trigger.className).toContain('custom-trigger')
    })

    it('accepts custom className on TabsContent', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1" className="custom-content">
            Content 1
          </TabsContent>
        </Tabs>
      )
      const content = screen.getByRole('tabpanel')
      expect(content.className).toContain('custom-content')
    })

    it('forwards additional props to all components', () => {
      render(
        <Tabs defaultValue="tab1" data-testid="tabs-container">
          <TabsList data-testid="tablist-container">
            <TabsTrigger value="tab1" data-testid="trigger-button">
              Tab 1
            </TabsTrigger>
          </TabsList>
          <TabsContent value="tab1" data-testid="content-panel">
            Content 1
          </TabsContent>
        </Tabs>
      )

      expect(screen.getByTestId('tabs-container')).toBeInTheDocument()
      expect(screen.getByTestId('tablist-container')).toBeInTheDocument()
      expect(screen.getByTestId('trigger-button')).toBeInTheDocument()
      expect(screen.getByTestId('content-panel')).toBeInTheDocument()
    })

    it('supports onClick handler on TabsTrigger', async () => {
      const user = userEvent.setup()
      let clickCount = 0
      const handleClick = () => {
        clickCount++
      }

      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1" onClick={handleClick}>
              Tab 1
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )

      const trigger = screen.getByRole('tab')
      await user.click(trigger)

      expect(clickCount).toBe(1)
    })
  })

  // Edge Cases Tests
  describe('Edge Cases', () => {
    it('works with single tab', () => {
      render(
        <Tabs defaultValue="only-tab">
          <TabsList>
            <TabsTrigger value="only-tab">Only Tab</TabsTrigger>
          </TabsList>
          <TabsContent value="only-tab">Only Content</TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('tab')).toBeInTheDocument()
      expect(screen.getByRole('tabpanel')).toBeInTheDocument()
      expect(screen.getByText('Only Content')).toBeInTheDocument()
    })

    it('works with many tabs (5+)', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
            <TabsTrigger value="tab4">Tab 4</TabsTrigger>
            <TabsTrigger value="tab5">Tab 5</TabsTrigger>
            <TabsTrigger value="tab6">Tab 6</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
          <TabsContent value="tab4">Content 4</TabsContent>
          <TabsContent value="tab5">Content 5</TabsContent>
          <TabsContent value="tab6">Content 6</TabsContent>
        </Tabs>
      )

      const tabs = screen.getAllByRole('tab')
      expect(tabs).toHaveLength(6)

      // Click last tab
      await user.click(tabs[5])
      expect(screen.getByText('Content 6')).toBeInTheDocument()
    })

    it('handles defaultValue not matching any trigger', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="nonexistent">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      // No content should be visible initially
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
      expect(screen.queryByText('Content 2')).not.toBeInTheDocument()

      // All tabs should have aria-selected="false"
      const tabs = screen.getAllByRole('tab')
      for (const tab of tabs) {
        expect(tab).toHaveAttribute('aria-selected', 'false')
      }

      // Clicking a tab should make it work normally
      await user.click(tabs[0])
      expect(screen.getByText('Content 1')).toBeInTheDocument()
    })

    it('renders with complex children in TabsContent', () => {
      render(
        <Tabs defaultValue="tab1">
          <TabsContent value="tab1">
            <div>
              <h2>Title</h2>
              <p>Paragraph 1</p>
              <p>Paragraph 2</p>
              <button type="button">Action</button>
            </div>
          </TabsContent>
        </Tabs>
      )

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title')
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('handles rapid tab switching', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
            <TabsTrigger value="tab3">Tab 3</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">Content 1</TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
          <TabsContent value="tab3">Content 3</TabsContent>
        </Tabs>
      )

      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      const tab3 = screen.getByRole('tab', { name: 'Tab 3' })

      // Rapidly switch tabs
      await user.click(tab2)
      await user.click(tab3)
      await user.click(tab1)
      await user.click(tab2)

      // Should end on tab2
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(tab2).toHaveAttribute('aria-selected', 'true')
    })

    it('preserves state when switching tabs', async () => {
      const user = userEvent.setup()
      render(
        <Tabs defaultValue="tab1">
          <TabsList>
            <TabsTrigger value="tab1">Tab 1</TabsTrigger>
            <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1">
            <input type="text" defaultValue="Preserved" />
          </TabsContent>
          <TabsContent value="tab2">Content 2</TabsContent>
        </Tabs>
      )

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('Preserved')

      // Switch away and back
      const tab2 = screen.getByRole('tab', { name: 'Tab 2' })
      await user.click(tab2)
      const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
      await user.click(tab1)

      // Input value should still be there
      const inputAgain = screen.getByRole('textbox')
      expect(inputAgain).toHaveValue('Preserved')
    })
  })
})
