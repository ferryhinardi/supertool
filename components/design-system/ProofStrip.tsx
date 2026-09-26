import { css } from '@/styled-system/css'

export interface ProofItem {
  value: string
  label: string
}

interface ProofStripProps {
  items: ProofItem[]
}

export function ProofStrip({ items }: ProofStripProps) {
  return (
    <section
      aria-label="SuperTool facts"
      className={css({
        display: 'grid',
        gridTemplateColumns: { base: '1fr 1fr', md: 'repeat(4, 1fr)' },
        mt: '2',
        px: '2.5',
        py: '5',
        backgroundImage:
          'linear-gradient(90deg, rgba(139, 108, 255, 0.045), rgba(17, 20, 29, 0.5), rgba(78, 224, 174, 0.035))',
        border: '1px solid',
        borderColor: 'brand.lineSoft',
        rounded: '13px',
      })}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          className={css({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1',
            py: { base: '2.5', md: '0' },
            borderRight: { md: '1px solid' },
            borderColor: { md: 'brand.line' },
            borderBottom: {
              base: index < 2 ? '1px solid' : '0',
              md: '0',
            },
            _last: { borderRight: '0', borderBottom: '0' },
          })}
        >
          <strong
            className={css({
              fontFamily: 'display',
              fontSize: 'sm',
              letterSpacing: '-0.02em',
              color: 'brand.ink',
            })}
          >
            {item.value}
          </strong>
          <span className={css({ color: 'brand.muted', fontSize: 'xs' })}>{item.label}</span>
        </div>
      ))}
    </section>
  )
}
