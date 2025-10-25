import { defineRecipe, definePattern } from '@pandacss/dev'

export const buttonRecipe = defineRecipe({
  className: 'button',
  description: 'Button component styles',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2',
    whiteSpace: 'nowrap',
    borderRadius: 'md',
    fontSize: 'sm',
    fontWeight: 'medium',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    _focusVisible: {
      outline: 'none',
      ring: '2px',
      ringColor: 'ring',
      ringOffset: '2px',
    },
    _disabled: {
      pointerEvents: 'none',
      opacity: '0.5',
    },
    _hover: {
      transform: 'translateY(-1px)',
    },
    _active: {
      transform: 'translateY(0)',
    },
    '& svg': {
      pointerEvents: 'none',
      width: '4',
      height: '4',
      flexShrink: '0',
      transition: 'transform 0.2s ease',
    },
    '&:hover svg': {
      transform: 'scale(1.1)',
    },
  },
  variants: {
    variant: {
      default: {
        bg: 'primary',
        color: 'primary-foreground',
        shadow: 'sm',
        _hover: { bg: 'primary', opacity: '0.9' },
      },
      destructive: {
        bg: 'destructive',
        color: 'destructive-foreground',
        shadow: 'sm',
        _hover: { bg: 'destructive', opacity: '0.9' },
      },
      outline: {
        border: '1px solid',
        borderColor: 'input',
        bg: 'background',
        shadow: 'sm',
        _hover: { bg: 'accent', color: 'accent-foreground' },
      },
      secondary: {
        bg: 'secondary',
        color: 'secondary-foreground',
        shadow: 'sm',
        _hover: { bg: 'secondary', opacity: '0.8' },
      },
      ghost: {
        _hover: { bg: 'accent', color: 'accent-foreground' },
      },
      link: {
        color: 'primary',
        textDecoration: 'underline',
        textUnderlineOffset: '4px',
        _hover: { textDecoration: 'underline' },
      },
    },
    size: {
      default: { h: '9', px: '4', py: '2' },
      sm: { h: '8', rounded: 'md', px: '3', fontSize: 'xs' },
      lg: {
        h: { base: '11', sm: '12', md: '14' },
        rounded: 'lg',
        px: { base: '6', sm: '7', md: '8' },
        fontSize: { base: 'base', sm: 'lg', md: 'xl' },
      },
      icon: { h: '9', w: '9' },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

export const cardRecipe = defineRecipe({
  className: 'card',
  description: 'Card component styles',
  base: {
    rounded: { base: 'xl', sm: '2xl' },
    border: '1px solid',
    borderColor: 'border',
    bg: 'card',
    color: 'card-foreground',
    shadow: 'sm',
    transition: 'all 0.3s ease',
    _hover: {
      shadow: 'lg',
      transform: 'translateY(-2px)',
    },
  },
  variants: {
    glass: {
      true: {
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.06) 50%, rgba(59, 130, 246, 0.06) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        boxShadow:
          '0 20px 25px -5px rgba(139, 92, 246, 0.15), 0 8px 10px -6px rgba(59, 130, 246, 0.15)',
        _hover: {
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow:
            '0 25px 30px -5px rgba(139, 92, 246, 0.2), 0 10px 15px -6px rgba(59, 130, 246, 0.2)',
        },
      },
    },
  },
})

export const badgeRecipe = defineRecipe({
  className: 'badge',
  description: 'Badge component styles',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    rounded: 'full',
    border: '1px solid',
    px: '2.5',
    py: '0.5',
    fontSize: 'xs',
    fontWeight: 'semibold',
    transition: 'colors 0.2s',
    _focus: {
      outline: 'none',
      ring: '2px',
      ringColor: 'ring',
      ringOffset: '2px',
    },
  },
  variants: {
    variant: {
      default: {
        borderColor: 'transparent',
        bg: 'primary',
        color: 'primary-foreground',
        shadow: 'sm',
        _hover: { bg: 'primary', opacity: '0.8' },
      },
      secondary: {
        borderColor: 'transparent',
        bg: 'secondary',
        color: 'secondary-foreground',
        _hover: { bg: 'secondary', opacity: '0.8' },
      },
      destructive: {
        borderColor: 'transparent',
        bg: 'destructive',
        color: 'destructive-foreground',
        shadow: 'sm',
        _hover: { bg: 'destructive', opacity: '0.8' },
      },
      outline: {
        color: 'foreground',
        borderColor: 'input',
      },
      success: {
        borderColor: 'rgba(34, 197, 94, 0.2)',
        bg: 'rgba(34, 197, 94, 0.1)',
        color: 'rgb(34, 197, 94)',
        _hover: { bg: 'rgba(34, 197, 94, 0.2)' },
      },
      warning: {
        borderColor: 'rgba(234, 179, 8, 0.2)',
        bg: 'rgba(234, 179, 8, 0.1)',
        color: 'rgb(234, 179, 8)',
        _hover: { bg: 'rgba(234, 179, 8, 0.2)' },
      },
      info: {
        borderColor: 'rgba(59, 130, 246, 0.2)',
        bg: 'rgba(59, 130, 246, 0.1)',
        color: 'rgb(59, 130, 246)',
        _hover: { bg: 'rgba(59, 130, 246, 0.2)' },
      },
      gradient: {
        borderColor: 'transparent',
        bgGradient: 'to-r',
        gradientFrom: 'purple.500',
        gradientTo: 'blue.500',
        color: 'white',
        shadow: 'lg',
      },
    },
    size: {
      sm: { fontSize: 'xs', px: '2', py: '0.5' },
      md: { fontSize: 'sm', px: '2.5', py: '0.5' },
      lg: { fontSize: 'base', px: '3', py: '1' },
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

export const inputRecipe = defineRecipe({
  className: 'input',
  description: 'Input component styles',
  base: {
    display: 'flex',
    h: '9',
    w: 'full',
    rounded: 'md',
    border: '1px solid',
    borderColor: 'input',
    bg: 'transparent',
    px: '3',
    py: '1',
    fontSize: 'sm',
    shadow: 'sm',
    transition: 'colors 0.2s',
    _placeholder: {
      color: 'muted-foreground',
    },
    _focusVisible: {
      outline: 'none',
      ring: '1px',
      ringColor: 'ring',
    },
    _disabled: {
      cursor: 'not-allowed',
      opacity: '0.5',
    },
  },
})

export const textareaRecipe = defineRecipe({
  className: 'textarea',
  description: 'Textarea component styles',
  base: {
    display: 'flex',
    minH: '20',
    w: 'full',
    rounded: 'md',
    border: '1px solid',
    borderColor: 'input',
    bg: 'transparent',
    px: '3',
    py: '2',
    fontSize: 'sm',
    shadow: 'sm',
    _placeholder: {
      color: 'muted-foreground',
    },
    _focusVisible: {
      outline: 'none',
      ring: '1px',
      ringColor: 'ring',
    },
    _disabled: {
      cursor: 'not-allowed',
      opacity: '0.5',
    },
  },
})

export const progressRecipe = defineRecipe({
  className: 'progress',
  description: 'Progress component styles',
  base: {
    position: 'relative',
    h: '2',
    w: 'full',
    overflow: 'hidden',
    rounded: 'full',
    bg: 'primary',
    opacity: '0.2',
  },
})

// Define Patterns for common UI patterns
export const glassCardPattern = definePattern({
  description: 'Glass morphism card with backdrop blur',
  properties: {
    intensity: { type: 'enum', value: ['light', 'medium', 'strong'] },
  },
  transform: (props) => {
    const intensityMap = {
      light: {
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(236, 72, 153, 0.04) 50%, rgba(59, 130, 246, 0.04) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.15)',
        shadow: 'glass-sm',
      },
      medium: {
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.06) 50%, rgba(59, 130, 246, 0.06) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        shadow: 'glass-md',
      },
      strong: {
        bg: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(236, 72, 153, 0.10) 50%, rgba(59, 130, 246, 0.10) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        shadow: 'glass-lg',
      },
    }
    const intensity = props.intensity || 'medium'
    return {
      ...intensityMap[intensity as keyof typeof intensityMap],
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      rounded: 'xl',
      overflow: 'hidden',
    }
  },
})

export const gradientTextPattern = definePattern({
  description: 'Gradient text with background-clip',
  properties: {
    gradient: { type: 'enum', value: ['purple-pink', 'blue-cyan', 'orange-red', 'rainbow'] },
  },
  transform: (props) => {
    const gradientMap = {
      'purple-pink': {
        bgGradient: 'to-r',
        gradientFrom: 'purple.400',
        gradientVia: 'pink.400',
        gradientTo: 'blue.400',
      },
      'blue-cyan': {
        bgGradient: 'to-r',
        gradientFrom: 'blue.400',
        gradientTo: 'cyan.400',
      },
      'orange-red': {
        bgGradient: 'to-r',
        gradientFrom: 'orange.500',
        gradientTo: 'red.500',
      },
      rainbow: {
        bgGradient: 'to-r',
        gradientFrom: 'purple.500',
        gradientVia: 'pink.500',
        gradientTo: 'orange.500',
      },
    }
    const gradient = props.gradient || 'purple-pink'
    return {
      ...gradientMap[gradient as keyof typeof gradientMap],
      bgClip: 'text',
      color: 'transparent',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }
  },
})

export const hoverGlowPattern = definePattern({
  description: 'Hover state with glow effect',
  properties: {
    color: { type: 'enum', value: ['purple', 'blue', 'pink', 'cyan'] },
  },
  transform: (props) => {
    const color = props.color || 'purple'
    const colorMap = {
      purple: 'rgba(139, 92, 246, 0.3)',
      blue: 'rgba(59, 130, 246, 0.3)',
      pink: 'rgba(236, 72, 153, 0.3)',
      cyan: 'rgba(6, 182, 212, 0.3)',
    }
    return {
      transition: 'all 0.3s ease',
      _hover: {
        transform: 'translateY(-2px)',
        boxShadow: `0 20px 40px ${colorMap[color as keyof typeof colorMap]}`,
      },
    }
  },
})

export const focusRingPattern = definePattern({
  description: 'Accessible focus ring',
  transform: () => ({
    _focusVisible: {
      outline: 'none',
      ring: '2px',
      ringColor: 'ring',
      ringOffset: '2px',
    },
  }),
})

// Export all patterns as an object
export const patterns = {
  glassCard: glassCardPattern,
  gradientText: gradientTextPattern,
  hoverGlow: hoverGlowPattern,
  focusRing: focusRingPattern,
}

// Export all recipes as an object
export const recipes = {
  button: buttonRecipe,
  card: cardRecipe,
  badge: badgeRecipe,
  input: inputRecipe,
  textarea: textareaRecipe,
  progress: progressRecipe,
}
