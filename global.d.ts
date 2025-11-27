declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

declare module '*.sass' {
  const content: { [className: string]: string }
  export default content
}

// Speculation Rules API type declarations
interface Document {
  prerendering: boolean
}

interface HTMLScriptElement {
  supports?: (feature: string) => boolean
}
