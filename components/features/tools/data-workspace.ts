import { css } from '@/styled-system/css'

export const dataPageMainClass = css({
  mx: 'auto',
  maxW: '7xl',
  w: 'full',
  px: { base: '4', sm: '6', md: '8' },
  py: { base: '6', sm: '8', md: '10' },
  spaceY: { base: '6', sm: '8', md: '10' },
})

export const dataPanelClass = css({
  rounded: 'xl',
  border: '1px solid',
  borderColor: 'brand.line',
  bg: 'brand.surface',
  w: 'full',
  overflow: 'hidden',
})

export const dataPanelHeaderClass = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '3',
  minH: '11',
  borderBottom: '1px solid',
  borderColor: 'brand.line',
  bg: 'brand.surfaceRaised',
  px: { base: '4', sm: '5' },
  py: '3',
})

export const dataPanelTitleClass = css({
  fontSize: { base: 'sm', sm: 'md' },
  fontWeight: 'semibold',
  color: 'brand.ink',
})

export const dataConfigClass = css({
  rounded: 'xl',
  border: '1px solid',
  borderColor: 'brand.line',
  bg: 'brand.surface',
  p: { base: '4', sm: '5', md: '6' },
  w: 'full',
})

export const dataActionBarClass = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: { base: '2', sm: '3' },
  w: 'full',
})

export const dataSplitClass = css({
  display: 'grid',
  gridTemplateColumns: { base: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
  gap: { base: '4', lg: '6' },
  w: 'full',
})
