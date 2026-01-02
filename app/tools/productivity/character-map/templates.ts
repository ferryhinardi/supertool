/**
 * Character Map - Special Characters and Symbols
 * Comprehensive collection of Unicode characters organized by category
 */

export interface Character {
  char: string
  name: string
  code: string
  category: string
}

export interface CharacterCategory {
  id: string
  name: string
  description: string
  characters: Character[]
}

/**
 * All character categories with their characters
 */
export const characterCategories: CharacterCategory[] = [
  {
    id: 'arrows',
    name: 'Arrows',
    description: 'Directional arrows and pointer symbols',
    characters: [
      { char: '←', name: 'Leftwards Arrow', code: 'U+2190', category: 'arrows' },
      { char: '→', name: 'Rightwards Arrow', code: 'U+2192', category: 'arrows' },
      { char: '↑', name: 'Upwards Arrow', code: 'U+2191', category: 'arrows' },
      { char: '↓', name: 'Downwards Arrow', code: 'U+2193', category: 'arrows' },
      { char: '↔', name: 'Left Right Arrow', code: 'U+2194', category: 'arrows' },
      { char: '↕', name: 'Up Down Arrow', code: 'U+2195', category: 'arrows' },
      { char: '↖', name: 'North West Arrow', code: 'U+2196', category: 'arrows' },
      { char: '↗', name: 'North East Arrow', code: 'U+2197', category: 'arrows' },
      { char: '↘', name: 'South East Arrow', code: 'U+2198', category: 'arrows' },
      { char: '↙', name: 'South West Arrow', code: 'U+2199', category: 'arrows' },
      { char: '⇐', name: 'Leftwards Double Arrow', code: 'U+21D0', category: 'arrows' },
      { char: '⇒', name: 'Rightwards Double Arrow', code: 'U+21D2', category: 'arrows' },
      { char: '⇑', name: 'Upwards Double Arrow', code: 'U+21D1', category: 'arrows' },
      { char: '⇓', name: 'Downwards Double Arrow', code: 'U+21D3', category: 'arrows' },
      { char: '⇔', name: 'Left Right Double Arrow', code: 'U+21D4', category: 'arrows' },
      { char: '⇕', name: 'Up Down Double Arrow', code: 'U+21D5', category: 'arrows' },
      { char: '⟵', name: 'Long Leftwards Arrow', code: 'U+27F5', category: 'arrows' },
      { char: '⟶', name: 'Long Rightwards Arrow', code: 'U+27F6', category: 'arrows' },
      { char: '⟷', name: 'Long Left Right Arrow', code: 'U+27F7', category: 'arrows' },
      { char: '➔', name: 'Heavy Wide-Headed Rightwards Arrow', code: 'U+2794', category: 'arrows' },
      {
        char: '➜',
        name: 'Heavy Round-Tipped Rightwards Arrow',
        code: 'U+279C',
        category: 'arrows',
      },
      { char: '➝', name: 'Triangle-Headed Rightwards Arrow', code: 'U+279D', category: 'arrows' },
      {
        char: '➞',
        name: 'Heavy Triangle-Headed Rightwards Arrow',
        code: 'U+279E',
        category: 'arrows',
      },
      {
        char: '➟',
        name: 'Dashed Triangle-Headed Rightwards Arrow',
        code: 'U+279F',
        category: 'arrows',
      },
    ],
  },
  {
    id: 'math',
    name: 'Math Symbols',
    description: 'Mathematical operators and symbols',
    characters: [
      { char: '+', name: 'Plus Sign', code: 'U+002B', category: 'math' },
      { char: '−', name: 'Minus Sign', code: 'U+2212', category: 'math' },
      { char: '×', name: 'Multiplication Sign', code: 'U+00D7', category: 'math' },
      { char: '÷', name: 'Division Sign', code: 'U+00F7', category: 'math' },
      { char: '=', name: 'Equals Sign', code: 'U+003D', category: 'math' },
      { char: '≠', name: 'Not Equal To', code: 'U+2260', category: 'math' },
      { char: '≈', name: 'Almost Equal To', code: 'U+2248', category: 'math' },
      { char: '≡', name: 'Identical To', code: 'U+2261', category: 'math' },
      { char: '<', name: 'Less-Than Sign', code: 'U+003C', category: 'math' },
      { char: '>', name: 'Greater-Than Sign', code: 'U+003E', category: 'math' },
      { char: '≤', name: 'Less-Than or Equal To', code: 'U+2264', category: 'math' },
      { char: '≥', name: 'Greater-Than or Equal To', code: 'U+2265', category: 'math' },
      { char: '±', name: 'Plus-Minus Sign', code: 'U+00B1', category: 'math' },
      { char: '∓', name: 'Minus-or-Plus Sign', code: 'U+2213', category: 'math' },
      { char: '∞', name: 'Infinity', code: 'U+221E', category: 'math' },
      { char: '∑', name: 'N-Ary Summation', code: 'U+2211', category: 'math' },
      { char: '∏', name: 'N-Ary Product', code: 'U+220F', category: 'math' },
      { char: '∫', name: 'Integral', code: 'U+222B', category: 'math' },
      { char: '√', name: 'Square Root', code: 'U+221A', category: 'math' },
      { char: '∛', name: 'Cube Root', code: 'U+221B', category: 'math' },
      { char: '∜', name: 'Fourth Root', code: 'U+221C', category: 'math' },
      { char: '∝', name: 'Proportional To', code: 'U+221D', category: 'math' },
      { char: '∴', name: 'Therefore', code: 'U+2234', category: 'math' },
      { char: '∵', name: 'Because', code: 'U+2235', category: 'math' },
      { char: '∈', name: 'Element Of', code: 'U+2208', category: 'math' },
      { char: '∉', name: 'Not an Element Of', code: 'U+2209', category: 'math' },
      { char: '∩', name: 'Intersection', code: 'U+2229', category: 'math' },
      { char: '∪', name: 'Union', code: 'U+222A', category: 'math' },
      { char: '∅', name: 'Empty Set', code: 'U+2205', category: 'math' },
      { char: '∀', name: 'For All', code: 'U+2200', category: 'math' },
      { char: '∃', name: 'There Exists', code: 'U+2203', category: 'math' },
      { char: '∄', name: 'There Does Not Exist', code: 'U+2204', category: 'math' },
    ],
  },
  {
    id: 'currency',
    name: 'Currency',
    description: 'Currency symbols from around the world',
    characters: [
      { char: '$', name: 'Dollar Sign', code: 'U+0024', category: 'currency' },
      { char: '¢', name: 'Cent Sign', code: 'U+00A2', category: 'currency' },
      { char: '£', name: 'Pound Sign', code: 'U+00A3', category: 'currency' },
      { char: '¤', name: 'Currency Sign', code: 'U+00A4', category: 'currency' },
      { char: '¥', name: 'Yen Sign', code: 'U+00A5', category: 'currency' },
      { char: '€', name: 'Euro Sign', code: 'U+20AC', category: 'currency' },
      { char: '₹', name: 'Indian Rupee Sign', code: 'U+20B9', category: 'currency' },
      { char: '₽', name: 'Ruble Sign', code: 'U+20BD', category: 'currency' },
      { char: '₩', name: 'Won Sign', code: 'U+20A9', category: 'currency' },
      { char: '₪', name: 'New Sheqel Sign', code: 'U+20AA', category: 'currency' },
      { char: '₨', name: 'Rupee Sign', code: 'U+20A8', category: 'currency' },
      { char: '฿', name: 'Baht Sign', code: 'U+0E3F', category: 'currency' },
      { char: '₦', name: 'Naira Sign', code: 'U+20A6', category: 'currency' },
      { char: '₱', name: 'Peso Sign', code: 'U+20B1', category: 'currency' },
      { char: '₡', name: 'Colon Sign', code: 'U+20A1', category: 'currency' },
      { char: '₴', name: 'Hryvnia Sign', code: 'U+20B4', category: 'currency' },
    ],
  },
  {
    id: 'greek',
    name: 'Greek Letters',
    description: 'Greek alphabet characters',
    characters: [
      { char: 'α', name: 'Greek Small Letter Alpha', code: 'U+03B1', category: 'greek' },
      { char: 'β', name: 'Greek Small Letter Beta', code: 'U+03B2', category: 'greek' },
      { char: 'γ', name: 'Greek Small Letter Gamma', code: 'U+03B3', category: 'greek' },
      { char: 'δ', name: 'Greek Small Letter Delta', code: 'U+03B4', category: 'greek' },
      { char: 'ε', name: 'Greek Small Letter Epsilon', code: 'U+03B5', category: 'greek' },
      { char: 'ζ', name: 'Greek Small Letter Zeta', code: 'U+03B6', category: 'greek' },
      { char: 'η', name: 'Greek Small Letter Eta', code: 'U+03B7', category: 'greek' },
      { char: 'θ', name: 'Greek Small Letter Theta', code: 'U+03B8', category: 'greek' },
      { char: 'ι', name: 'Greek Small Letter Iota', code: 'U+03B9', category: 'greek' },
      { char: 'κ', name: 'Greek Small Letter Kappa', code: 'U+03BA', category: 'greek' },
      { char: 'λ', name: 'Greek Small Letter Lambda', code: 'U+03BB', category: 'greek' },
      { char: 'μ', name: 'Greek Small Letter Mu', code: 'U+03BC', category: 'greek' },
      { char: 'ν', name: 'Greek Small Letter Nu', code: 'U+03BD', category: 'greek' },
      { char: 'ξ', name: 'Greek Small Letter Xi', code: 'U+03BE', category: 'greek' },
      { char: 'ο', name: 'Greek Small Letter Omicron', code: 'U+03BF', category: 'greek' },
      { char: 'π', name: 'Greek Small Letter Pi', code: 'U+03C0', category: 'greek' },
      { char: 'ρ', name: 'Greek Small Letter Rho', code: 'U+03C1', category: 'greek' },
      { char: 'σ', name: 'Greek Small Letter Sigma', code: 'U+03C3', category: 'greek' },
      { char: 'τ', name: 'Greek Small Letter Tau', code: 'U+03C4', category: 'greek' },
      { char: 'υ', name: 'Greek Small Letter Upsilon', code: 'U+03C5', category: 'greek' },
      { char: 'φ', name: 'Greek Small Letter Phi', code: 'U+03C6', category: 'greek' },
      { char: 'χ', name: 'Greek Small Letter Chi', code: 'U+03C7', category: 'greek' },
      { char: 'ψ', name: 'Greek Small Letter Psi', code: 'U+03C8', category: 'greek' },
      { char: 'ω', name: 'Greek Small Letter Omega', code: 'U+03C9', category: 'greek' },
      { char: 'Α', name: 'Greek Capital Letter Alpha', code: 'U+0391', category: 'greek' },
      { char: 'Β', name: 'Greek Capital Letter Beta', code: 'U+0392', category: 'greek' },
      { char: 'Γ', name: 'Greek Capital Letter Gamma', code: 'U+0393', category: 'greek' },
      { char: 'Δ', name: 'Greek Capital Letter Delta', code: 'U+0394', category: 'greek' },
      { char: 'Θ', name: 'Greek Capital Letter Theta', code: 'U+0398', category: 'greek' },
      { char: 'Λ', name: 'Greek Capital Letter Lambda', code: 'U+039B', category: 'greek' },
      { char: 'Ξ', name: 'Greek Capital Letter Xi', code: 'U+039E', category: 'greek' },
      { char: 'Π', name: 'Greek Capital Letter Pi', code: 'U+03A0', category: 'greek' },
      { char: 'Σ', name: 'Greek Capital Letter Sigma', code: 'U+03A3', category: 'greek' },
      { char: 'Φ', name: 'Greek Capital Letter Phi', code: 'U+03A6', category: 'greek' },
      { char: 'Ψ', name: 'Greek Capital Letter Psi', code: 'U+03A8', category: 'greek' },
      { char: 'Ω', name: 'Greek Capital Letter Omega', code: 'U+03A9', category: 'greek' },
    ],
  },
  {
    id: 'punctuation',
    name: 'Punctuation',
    description: 'Special punctuation marks and quotation marks',
    characters: [
      { char: '•', name: 'Bullet', code: 'U+2022', category: 'punctuation' },
      { char: '·', name: 'Middle Dot', code: 'U+00B7', category: 'punctuation' },
      { char: '…', name: 'Horizontal Ellipsis', code: 'U+2026', category: 'punctuation' },
      {
        char: '‹',
        name: 'Single Left-Pointing Angle Quotation Mark',
        code: 'U+2039',
        category: 'punctuation',
      },
      {
        char: '›',
        name: 'Single Right-Pointing Angle Quotation Mark',
        code: 'U+203A',
        category: 'punctuation',
      },
      {
        char: '«',
        name: 'Left-Pointing Double Angle Quotation Mark',
        code: 'U+00AB',
        category: 'punctuation',
      },
      {
        char: '»',
        name: 'Right-Pointing Double Angle Quotation Mark',
        code: 'U+00BB',
        category: 'punctuation',
      },
      {
        char: '\u201C',
        name: 'Left Double Quotation Mark',
        code: 'U+201C',
        category: 'punctuation',
      },
      {
        char: '\u201D',
        name: 'Right Double Quotation Mark',
        code: 'U+201D',
        category: 'punctuation',
      },
      {
        char: '\u2018',
        name: 'Left Single Quotation Mark',
        code: 'U+2018',
        category: 'punctuation',
      },
      {
        char: '\u2019',
        name: 'Right Single Quotation Mark',
        code: 'U+2019',
        category: 'punctuation',
      },
      {
        char: '\u201A',
        name: 'Single Low-9 Quotation Mark',
        code: 'U+201A',
        category: 'punctuation',
      },
      {
        char: '\u201E',
        name: 'Double Low-9 Quotation Mark',
        code: 'U+201E',
        category: 'punctuation',
      },
      { char: '†', name: 'Dagger', code: 'U+2020', category: 'punctuation' },
      { char: '‡', name: 'Double Dagger', code: 'U+2021', category: 'punctuation' },
      { char: '‰', name: 'Per Mille Sign', code: 'U+2030', category: 'punctuation' },
      { char: '′', name: 'Prime', code: 'U+2032', category: 'punctuation' },
      { char: '″', name: 'Double Prime', code: 'U+2033', category: 'punctuation' },
      { char: '‴', name: 'Triple Prime', code: 'U+2034', category: 'punctuation' },
      { char: '§', name: 'Section Sign', code: 'U+00A7', category: 'punctuation' },
      { char: '¶', name: 'Pilcrow Sign', code: 'U+00B6', category: 'punctuation' },
      { char: '©', name: 'Copyright Sign', code: 'U+00A9', category: 'punctuation' },
      { char: '®', name: 'Registered Sign', code: 'U+00AE', category: 'punctuation' },
      { char: '™', name: 'Trade Mark Sign', code: 'U+2122', category: 'punctuation' },
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    description: 'Miscellaneous symbols and special characters',
    characters: [
      { char: '☀', name: 'Black Sun with Rays', code: 'U+2600', category: 'symbols' },
      { char: '☁', name: 'Cloud', code: 'U+2601', category: 'symbols' },
      { char: '☂', name: 'Umbrella', code: 'U+2602', category: 'symbols' },
      { char: '☃', name: 'Snowman', code: 'U+2603', category: 'symbols' },
      { char: '☄', name: 'Comet', code: 'U+2604', category: 'symbols' },
      { char: '★', name: 'Black Star', code: 'U+2605', category: 'symbols' },
      { char: '☆', name: 'White Star', code: 'U+2606', category: 'symbols' },
      { char: '☎', name: 'Black Telephone', code: 'U+260E', category: 'symbols' },
      { char: '☏', name: 'White Telephone', code: 'U+260F', category: 'symbols' },
      { char: '☐', name: 'Ballot Box', code: 'U+2610', category: 'symbols' },
      { char: '☑', name: 'Ballot Box with Check', code: 'U+2611', category: 'symbols' },
      { char: '☒', name: 'Ballot Box with X', code: 'U+2612', category: 'symbols' },
      { char: '☚', name: 'Black Left Pointing Index', code: 'U+261A', category: 'symbols' },
      { char: '☛', name: 'Black Right Pointing Index', code: 'U+261B', category: 'symbols' },
      { char: '☜', name: 'White Left Pointing Index', code: 'U+261C', category: 'symbols' },
      { char: '☝', name: 'White Up Pointing Index', code: 'U+261D', category: 'symbols' },
      { char: '☞', name: 'White Right Pointing Index', code: 'U+261E', category: 'symbols' },
      { char: '☟', name: 'White Down Pointing Index', code: 'U+261F', category: 'symbols' },
      { char: '☠', name: 'Skull and Crossbones', code: 'U+2620', category: 'symbols' },
      { char: '☢', name: 'Radioactive Sign', code: 'U+2622', category: 'symbols' },
      { char: '☣', name: 'Biohazard Sign', code: 'U+2623', category: 'symbols' },
      { char: '☮', name: 'Peace Symbol', code: 'U+262E', category: 'symbols' },
      { char: '☯', name: 'Yin Yang', code: 'U+262F', category: 'symbols' },
      { char: '☸', name: 'Wheel of Dharma', code: 'U+2638', category: 'symbols' },
      { char: '♀', name: 'Female Sign', code: 'U+2640', category: 'symbols' },
      { char: '♂', name: 'Male Sign', code: 'U+2642', category: 'symbols' },
      { char: '♠', name: 'Black Spade Suit', code: 'U+2660', category: 'symbols' },
      { char: '♣', name: 'Black Club Suit', code: 'U+2663', category: 'symbols' },
      { char: '♥', name: 'Black Heart Suit', code: 'U+2665', category: 'symbols' },
      { char: '♦', name: 'Black Diamond Suit', code: 'U+2666', category: 'symbols' },
      { char: '♩', name: 'Quarter Note', code: 'U+2669', category: 'symbols' },
      { char: '♪', name: 'Eighth Note', code: 'U+266A', category: 'symbols' },
      { char: '♫', name: 'Beamed Eighth Notes', code: 'U+266B', category: 'symbols' },
      { char: '♬', name: 'Beamed Sixteenth Notes', code: 'U+266C', category: 'symbols' },
      { char: '✓', name: 'Check Mark', code: 'U+2713', category: 'symbols' },
      { char: '✔', name: 'Heavy Check Mark', code: 'U+2714', category: 'symbols' },
      { char: '✗', name: 'Ballot X', code: 'U+2717', category: 'symbols' },
      { char: '✘', name: 'Heavy Ballot X', code: 'U+2718', category: 'symbols' },
    ],
  },
]

/**
 * Get all characters flattened
 */
export function getAllCharacters(): Character[] {
  return characterCategories.flatMap((category) => category.characters)
}

/**
 * Search characters by name or character
 */
export function searchCharacters(query: string): Character[] {
  if (!query || query.trim().length === 0) {
    return getAllCharacters()
  }

  const searchTerm = query.toLowerCase().trim()
  return getAllCharacters().filter(
    (char) =>
      char.name.toLowerCase().includes(searchTerm) ||
      char.char.includes(searchTerm) ||
      char.code.toLowerCase().includes(searchTerm)
  )
}

/**
 * Get characters by category
 */
export function getCharactersByCategory(categoryId: string): Character[] {
  const category = characterCategories.find((cat) => cat.id === categoryId)
  return category ? category.characters : []
}
