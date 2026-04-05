/**
 * Mock for @ark-ui/react
 * This prevents the real library from loading in jsdom test environment where it hangs.
 */
import * as React from 'react'

type AsChildProps = {
  asChild?: boolean
  children?: React.ReactNode
  className?: string
}

function mergeClassName(existingClassName: unknown, nextClassName: unknown) {
  const classes = [existingClassName, nextClassName].filter(
    (value): value is string => typeof value === 'string' && value.length > 0
  )

  return classes.length > 0 ? classes.join(' ') : undefined
}

function createButtonTrigger() {
  return React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & AsChildProps
  >(({ asChild, children, className, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<{
        className?: string
        children?: React.ReactNode
      }>

      return React.cloneElement(child, {
        ...props,
        className: mergeClassName(className, child.props.className),
      })
    }

    return React.createElement('button', { ...props, className, ref, type: 'button' }, children)
  })
}

// Portal - renders children directly
export const Portal = ({ children }: { children: React.ReactNode }) => children

// Dialog components
export const Dialog = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Trigger: createButtonTrigger(),
  Backdrop: () => null,
  Positioner: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'dialog-positioner' }, children),
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref, role: 'dialog' })
  ),
  Title: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    (props, ref) => React.createElement('h2', { ...props, ref })
  ),
  Description: React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    (props, ref) => React.createElement('p', { ...props, ref })
  ),
  CloseTrigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
}

// Tooltip components
export const Tooltip = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Trigger: createButtonTrigger(),
  Positioner: ({ children }: { children: React.ReactNode }) => children,
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  Arrow: () => null,
  ArrowTip: () => null,
}

// Tabs components
export const Tabs = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  List: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref, role: 'tablist' })
  ),
  Trigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, role: 'tab', type: 'button' })
  ),
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref, role: 'tabpanel' })
  ),
  Indicator: () => null,
}

// Select components
export const Select = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Control: ({ children }: { children: React.ReactNode }) => children,
  Trigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
  ValueText: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  Indicator: () => null,
  Positioner: ({ children }: { children: React.ReactNode }) => children,
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  ItemGroup: ({ children }: { children: React.ReactNode }) => children,
  ItemGroupLabel: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  Item: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  ItemText: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  ItemIndicator: () => null,
  Label: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    (props, ref) => React.createElement('label', { ...props, ref })
  ),
  ClearTrigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
  HiddenSelect: () => null,
}

// Menu components
export const Menu = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Trigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
  TriggerItem: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    (props, ref) => React.createElement('div', { ...props, ref })
  ),
  Positioner: ({ children }: { children: React.ReactNode }) => children,
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  ItemGroup: ({ children }: { children: React.ReactNode }) => children,
  ItemGroupLabel: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  Item: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  Separator: () => React.createElement('hr'),
  Arrow: () => null,
  ArrowTip: () => null,
}

// Popover components
export const Popover = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Trigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
  Anchor: ({ children }: { children: React.ReactNode }) => children,
  Positioner: ({ children }: { children: React.ReactNode }) => children,
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  Title: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    (props, ref) => React.createElement('h3', { ...props, ref })
  ),
  Description: React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    (props, ref) => React.createElement('p', { ...props, ref })
  ),
  CloseTrigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
  Arrow: () => null,
  ArrowTip: () => null,
}

// Switch components
export const Switch = {
  Root: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    (props, ref) => React.createElement('label', { ...props, ref })
  ),
  Control: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) =>
    React.createElement('span', { ...props, ref })
  ),
  Thumb: () => React.createElement('span'),
  Label: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  HiddenInput: () => null,
}

// Checkbox components
export const Checkbox = {
  Root: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    (props, ref) => React.createElement('label', { ...props, ref })
  ),
  Control: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>((props, ref) =>
    React.createElement('span', { ...props, ref })
  ),
  Indicator: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  Label: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  HiddenInput: () => null,
}

// RadioGroup components
export const RadioGroup = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Item: React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    (props, ref) => React.createElement('label', { ...props, ref })
  ),
  ItemControl: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
    (props, ref) => React.createElement('span', { ...props, ref })
  ),
  ItemText: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  ItemHiddenInput: () => null,
  Indicator: () => null,
  Label: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
}

// Slider components
export const Slider = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Control: ({ children }: { children: React.ReactNode }) => children,
  Track: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  Range: () => React.createElement('div'),
  Thumb: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  Label: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  ValueText: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  MarkerGroup: ({ children }: { children: React.ReactNode }) => children,
  Marker: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  HiddenInput: () => null,
}

// Progress components
export const Progress = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Track: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref })
  ),
  Range: () => React.createElement('div'),
  Label: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  ValueText: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
  Circle: () => null,
  CircleTrack: () => null,
  CircleRange: () => null,
}

// Accordion components
export const Accordion = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Item: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  ItemTrigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
  ItemContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', null, children),
  ItemIndicator: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
}

// Avatar components
export const Avatar = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Image: React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
    (props, ref) => React.createElement('img', { ...props, ref })
  ),
  Fallback: ({ children }: { children: React.ReactNode }) =>
    React.createElement('span', null, children),
}

// Drawer components (similar to Dialog)
export const Drawer = {
  Root: ({ children }: { children: React.ReactNode }) => children,
  Trigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
  Backdrop: () => null,
  Positioner: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'drawer-positioner' }, children),
  Content: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) =>
    React.createElement('div', { ...props, ref, role: 'dialog' })
  ),
  Title: React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    (props, ref) => React.createElement('h2', { ...props, ref })
  ),
  Description: React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    (props, ref) => React.createElement('p', { ...props, ref })
  ),
  CloseTrigger: React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    (props, ref) => React.createElement('button', { ...props, ref, type: 'button' })
  ),
}

// The main `ark` namespace export that is used by UI components
type ArkComponent = React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLElement> & React.RefAttributes<HTMLElement>
>

// Create proxy that returns simple HTML elements for any ark.* usage
const createArkElement = (element: string): ArkComponent => {
  return React.forwardRef((props, ref) => React.createElement(element, { ...props, ref }))
}

// The ark object that maps to HTML elements
export const ark = {
  div: createArkElement('div'),
  span: createArkElement('span'),
  button: createArkElement('button'),
  input: createArkElement('input'),
  label: createArkElement('label'),
  p: createArkElement('p'),
  h1: createArkElement('h1'),
  h2: createArkElement('h2'),
  h3: createArkElement('h3'),
  h4: createArkElement('h4'),
  h5: createArkElement('h5'),
  h6: createArkElement('h6'),
  ul: createArkElement('ul'),
  ol: createArkElement('ol'),
  li: createArkElement('li'),
  a: createArkElement('a'),
  img: createArkElement('img'),
  form: createArkElement('form'),
  textarea: createArkElement('textarea'),
  select: createArkElement('select'),
  option: createArkElement('option'),
  table: createArkElement('table'),
  thead: createArkElement('thead'),
  tbody: createArkElement('tbody'),
  tr: createArkElement('tr'),
  th: createArkElement('th'),
  td: createArkElement('td'),
  nav: createArkElement('nav'),
  header: createArkElement('header'),
  footer: createArkElement('footer'),
  main: createArkElement('main'),
  section: createArkElement('section'),
  article: createArkElement('article'),
  aside: createArkElement('aside'),
  fieldset: createArkElement('fieldset'),
  legend: createArkElement('legend'),
  svg: createArkElement('svg'),
  path: createArkElement('path'),
}

// Default export with all components
export default {
  Portal,
  Dialog,
  Tooltip,
  Tabs,
  Select,
  Menu,
  Popover,
  Switch,
  Checkbox,
  RadioGroup,
  Slider,
  Progress,
  Accordion,
  Avatar,
  Drawer,
  ark,
}
