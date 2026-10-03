import { css } from '@/styled-system/css'

export const toolWorkspaceFrameClass = css({
  mx: 'auto',
  w: 'full',
  maxW: '7xl',
})

export const toolWorkspaceStickyClass = css({
  position: 'sticky',
  top: { base: '20', md: '0' },
  zIndex: '30',
})

export const toolPageMainClass = css({
  mx: 'auto',
  maxW: '7xl',
  w: 'full',
  px: { base: '4', sm: '6', md: '8' },
  py: { base: '6', sm: '8', md: '10' },
  spaceY: { base: '6', sm: '8', md: '10' },
})
