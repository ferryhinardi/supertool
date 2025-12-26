'use client'

import { motion } from 'framer-motion'
import {
  ArrowLeftRight,
  ArrowRight,
  Bolt,
  Clock,
  Download,
  Droplet,
  Gauge,
  GitBranch,
  HardDrive,
  History,
  Info,
  Lightbulb,
  Plus,
  Repeat,
  RotateCcw,
  Ruler,
  Save,
  Sparkles,
  Square,
  Star,
  Thermometer,
  Trash2,
  TrendingUp,
  Weight,
  X,
  Zap,
} from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  TOOL_COLORS,
  ToolMobilePicker,
  type ToolOperation,
  ToolOperationGrid,
} from '@/components/features/tool-components'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'
import {
  convertUnit,
  getAllCategories,
  getUnitInfo,
  getUnitsForCategory,
  type UnitCategory,
  unitDefinitions,
} from './utils'

interface Favorite {
  id: string
  category: UnitCategory
  fromUnit: string
  toUnit: string
  name?: string
}

interface ConversionHistoryItem {
  id: string
  timestamp: number
  category: UnitCategory
  fromValue: string
  fromUnit: string
  toValue: string
  toUnit: string
}

interface ConversionStep {
  id: string
  unit: string
  value: string
}

interface SavedChain {
  id: string
  name: string
  category: UnitCategory
  steps: { unit: string }[]
  createdAt: number
}

interface ChainPreset {
  id: string
  name: string
  description: string
  category: UnitCategory
  steps: string[]
  defaultValue?: string // Optional predefined starting value
}

const chainPresets: ChainPreset[] = [
  {
    id: 'metric-length',
    name: 'Metric Length Ladder',
    description: 'From kilometers down to millimeters',
    category: 'length',
    steps: ['kilometer', 'meter', 'centimeter', 'millimeter'],
  },
  {
    id: 'imperial-length',
    name: 'Imperial Length Ladder',
    description: 'From miles to inches',
    category: 'length',
    steps: ['mile', 'yard', 'foot', 'inch'],
  },
  {
    id: 'metric-weight',
    name: 'Metric Weight Ladder',
    description: 'From tonnes to milligrams',
    category: 'weight',
    steps: ['metric_ton', 'kilogram', 'gram', 'milligram'],
  },
  {
    id: 'imperial-weight',
    name: 'Imperial Weight Ladder',
    description: 'From tons to ounces',
    category: 'weight',
    steps: ['ton', 'pound', 'ounce'],
  },
  {
    id: 'temperature-all',
    name: 'Temperature Scale Tour',
    description: 'All temperature scales',
    category: 'temperature',
    steps: ['celsius', 'fahrenheit', 'kelvin'],
  },
  {
    id: 'metric-volume',
    name: 'Metric Volume Ladder',
    description: 'From liters to milliliters',
    category: 'volume',
    steps: ['liter', 'deciliter', 'centiliter', 'milliliter'],
  },
  {
    id: 'time-cascade',
    name: 'Time Cascade',
    description: 'From days to seconds',
    category: 'time',
    steps: ['day', 'hour', 'minute', 'second'],
  },
  {
    id: 'data-storage',
    name: 'Data Storage Scale',
    description: 'From terabytes to bytes',
    category: 'digital',
    steps: ['terabyte', 'gigabyte', 'megabyte', 'kilobyte', 'byte'],
  },
]

// Chain Templates with Predefined Values
const _chainTemplates: ChainPreset[] = [
  {
    id: 'marathon-distance',
    name: 'Marathon Distance',
    description: 'Convert marathon distance (42.195 km)',
    category: 'length',
    steps: ['kilometer', 'meter', 'mile', 'foot'],
    defaultValue: '42.195',
  },
  {
    id: '5k-run',
    name: '5K Run Distance',
    description: 'Convert 5K run distance',
    category: 'length',
    steps: ['meter', 'kilometer', 'mile', 'yard'],
    defaultValue: '5000',
  },
  {
    id: 'human-body-temp',
    name: 'Human Body Temperature',
    description: 'Normal body temperature (37°C)',
    category: 'temperature',
    steps: ['celsius', 'fahrenheit', 'kelvin'],
    defaultValue: '37',
  },
  {
    id: 'water-boiling',
    name: 'Water Boiling Point',
    description: 'Water boiling temperature at sea level',
    category: 'temperature',
    steps: ['celsius', 'fahrenheit', 'kelvin'],
    defaultValue: '100',
  },
  {
    id: 'gallon-conversion',
    name: 'One Gallon Conversion',
    description: 'Convert one gallon to metric',
    category: 'volume',
    steps: ['gallon', 'liter', 'milliliter', 'cup'],
    defaultValue: '1',
  },
  {
    id: 'pound-weight',
    name: 'One Pound Weight',
    description: 'Convert one pound to metric weights',
    category: 'weight',
    steps: ['pound', 'kilogram', 'gram', 'ounce'],
    defaultValue: '1',
  },
  {
    id: 'movie-length',
    name: 'Average Movie Length',
    description: 'Convert 2 hour movie duration',
    category: 'time',
    steps: ['hour', 'minute', 'second'],
    defaultValue: '2',
  },
  {
    id: 'usb-drive',
    name: '32GB USB Drive',
    description: 'Convert 32GB storage capacity',
    category: 'digital',
    steps: ['gigabyte', 'megabyte', 'kilobyte', 'byte'],
    defaultValue: '32',
  },
]

const faqs = [
  {
    question: 'What types of units can I convert with this tool?',
    answer:
      'Our converter supports 30+ unit categories including: length/distance (meters, feet, miles, kilometers), weight/mass (grams, pounds, kilograms, ounces), temperature (Celsius, Fahrenheit, Kelvin), volume (liters, gallons, cups, milliliters), area (square meters, acres, hectares), speed (mph, km/h, knots), time, pressure, energy, power, and data storage units.',
  },
  {
    question: 'How accurate are the unit conversions?',
    answer:
      'All conversions use precise mathematical formulas and industry-standard conversion factors with up to 10 decimal places of precision. For example, temperature conversions use exact formulas: °C = (°F - 32) × 5/9. We regularly verify conversion accuracy against scientific standards to ensure reliability for both casual and professional use.',
  },
  {
    question: 'Can I convert between metric and imperial units?',
    answer:
      'Yes! The converter seamlessly handles conversions between metric (SI) and imperial (US/UK) measurement systems. Convert pounds to kilograms, miles to kilometers, Fahrenheit to Celsius, gallons to liters, and vice versa. This is especially useful for international travel, recipe conversions, or working with specifications from different countries.',
  },
  {
    question: 'How do I convert Celsius to Fahrenheit or vice versa?',
    answer:
      'Select Temperature from the category dropdown, enter your value, choose Celsius or Fahrenheit as the source unit, and select the target unit. The conversion happens instantly. Formula: °F = (°C × 9/5) + 32 or °C = (°F - 32) × 5/9. Our tool also supports Kelvin for scientific calculations.',
  },
  {
    question: 'Can I save my favorite unit conversions?',
    answer:
      'Yes! You can mark frequently used conversions as favorites for quick access. Simply click the star icon next to any conversion pair (e.g., kg to lbs, miles to km) and it will appear in your favorites list. Favorites are saved locally in your browser for instant loading on future visits.',
  },
  {
    question: 'Does this unit converter work offline?',
    answer:
      'Once the page loads, all conversions happen locally in your browser using JavaScript - no internet connection required for calculations. The conversion formulas are built into the application, so you can use it on flights, in areas with poor connectivity, or completely offline after the initial page load. Your favorites are also stored locally and accessible offline.',
  },
  {
    question: 'What is the difference between weight and mass units?',
    answer:
      'Mass (kilograms, grams) measures the amount of matter in an object and remains constant regardless of location. Weight (newtons, pounds-force) measures the force of gravity on that mass and varies with gravitational field strength. In everyday usage, pounds and kilograms are often used interchangeably for "weight," though technically they measure different properties. Our converter handles both mass and force units appropriately.',
  },
  {
    question: 'Can I convert cooking measurements like cups, tablespoons, and teaspoons?',
    answer:
      'Yes! The volume category includes cooking and baking measurements: cups, tablespoons, teaspoons, fluid ounces, milliliters, and liters. This is perfect for converting recipes between US and metric measurements. Note that dry ingredients (flour, sugar) have different densities, so volume conversions work best for liquids. For dry goods, use weight measurements (grams, ounces) for accuracy.',
  },
  {
    question: 'How do I convert data storage units like GB, TB, and MB?',
    answer:
      'Select "Data Storage" or "Digital Storage" from categories, then choose your units: bytes, kilobytes (KB), megabytes (MB), gigabytes (GB), terabytes (TB), petabytes (PB), or bits. The converter handles both decimal (1 KB = 1000 bytes) and binary (1 KiB = 1024 bytes) standards. This is useful for understanding file sizes, storage capacity, internet speeds, and data transfer calculations.',
  },
  {
    question: 'Why do I need a unit converter when I can calculate manually?',
    answer:
      'While simple conversions like meters to centimeters are easy, complex conversions (e.g., acre-feet to cubic meters, BTU to joules, knots to meters per second) require memorizing specific formulas and factors. Our converter eliminates calculation errors, saves time, provides instant results, handles precision automatically, and supports dozens of units you might not encounter regularly. It is especially valuable for professionals, students, travelers, and anyone working with international standards.',
  },
]

// Unit Category Operations
const UNIT_CATEGORY_OPERATIONS: ToolOperation[] = [
  {
    id: 'length',
    label: 'Length',
    icon: Ruler,
    color: TOOL_COLORS.primary,
    description: 'Distance & height',
  },
  {
    id: 'weight',
    label: 'Weight / Mass',
    icon: Weight,
    color: TOOL_COLORS.secondary,
    description: 'Mass & weight',
  },
  {
    id: 'temperature',
    label: 'Temperature',
    icon: Thermometer,
    color: TOOL_COLORS.error,
    description: 'Celsius, Fahrenheit, Kelvin',
  },
  {
    id: 'volume',
    label: 'Volume',
    icon: Droplet,
    color: TOOL_COLORS.info,
    description: 'Liquid capacity',
  },
  {
    id: 'area',
    label: 'Area',
    icon: Square,
    color: TOOL_COLORS.success,
    description: 'Surface measurement',
  },
  {
    id: 'speed',
    label: 'Speed',
    icon: Gauge,
    color: TOOL_COLORS.warning,
    description: 'Velocity & pace',
  },
  {
    id: 'time',
    label: 'Time',
    icon: Clock,
    color: TOOL_COLORS.purple,
    description: 'Duration & intervals',
  },
  {
    id: 'pressure',
    label: 'Pressure',
    icon: Gauge,
    color: TOOL_COLORS.teal,
    description: 'Force per unit area',
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: Zap,
    color: TOOL_COLORS.yellow,
    description: 'Work & heat',
  },
  {
    id: 'power',
    label: 'Power',
    icon: Bolt,
    color: TOOL_COLORS.orange,
    description: 'Energy rate',
  },
  {
    id: 'digital',
    label: 'Digital Storage',
    icon: HardDrive,
    color: TOOL_COLORS.indigo,
    description: 'Data storage',
  },
]

function UnitConverterContent() {
  const [category, setCategory] = useQueryState(
    'category',
    parseAsStringEnum<UnitCategory>(getAllCategories()).withDefault('length')
  )
  const [fromUnit, setFromUnit] = useQueryState('from', { defaultValue: 'meter' })
  const [toUnit, setToUnit] = useQueryState('to', { defaultValue: 'foot' })
  const [fromValue, setFromValue] = useQueryState('value', { defaultValue: '1' })
  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    // Lazy initialization - only runs once on mount (client-side safe)
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem('unitConverterFavorites')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load favorites:', error)
        return []
      }
    }
    return []
  })

  const [history, setHistory] = useState<ConversionHistoryItem[]>(() => {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem('unitConverterHistory')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load history:', error)
        return []
      }
    }
    return []
  })

  const [showFormulaDetails, setShowFormulaDetails] = useState(false)
  const [conversionChain, setConversionChain] = useState<ConversionStep[]>([])
  const [chainInputValue, setChainInputValue] = useState('100')
  const [savedChains, setSavedChains] = useState<SavedChain[]>(() => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('unitConverterSavedChains')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.error('Failed to load saved chains:', error)
        return []
      }
    }
    return []
  })
  const [showSaveChainDialog, setShowSaveChainDialog] = useState(false)
  const [chainNameInput, setChainNameInput] = useState('')

  // History search/filter state
  const [_historySearchQuery, _setHistorySearchQuery] = useState('')
  const [_historyFilterCategory, _setHistoryFilterCategory] = useState<UnitCategory | 'all'>('all')

  // Save favorites to localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (favorites.length > 0) {
        localStorage.setItem('unitConverterFavorites', JSON.stringify(favorites))
      } else {
        localStorage.removeItem('unitConverterFavorites')
      }
    }
  }, [favorites])

  // Track page visit
  useEffect(() => {
    trackToolEvent('unit_converter_open', {})
  }, [])

  // Save history to localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (history.length > 0) {
        localStorage.setItem('unitConverterHistory', JSON.stringify(history))
      } else {
        localStorage.removeItem('unitConverterHistory')
      }
    }
  }, [history])

  // Compute conversion result (derived value, not state)
  const toValue = useMemo(() => {
    if (!fromValue || fromValue === '' || Number.isNaN(Number(fromValue))) {
      return ''
    }

    try {
      const result = convertUnit(Number(fromValue), fromUnit, toUnit, category)
      return result.toFixed(8).replace(/\.?0+$/, '')
    } catch (error) {
      console.error('Conversion error:', error)
      return 'Error'
    }
  }, [fromValue, fromUnit, toUnit, category])

  const handleSwapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setFromValue(toValue)

    trackToolEvent('unit_converter_swap', { category })
  }

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory)
    // Update units for new category
    const units = getUnitsForCategory(newCategory)
    if (units.length >= 2) {
      setFromUnit(units[0])
      setToUnit(units[1])
    }
  }

  const handleAddFavorite = () => {
    const newFavorite: Favorite = {
      id: Date.now().toString(),
      category,
      fromUnit,
      toUnit,
    }

    setFavorites([...favorites, newFavorite])
    toast.success('Added to favorites! ⭐')

    trackToolEvent('unit_converter_favorite_add', {
      category,
      from_unit: fromUnit,
      to_unit: toUnit,
    })
  }

  const handleRemoveFavorite = (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id))
    toast.success('Removed from favorites')

    trackToolEvent('unit_converter_favorite_remove', {})
  }

  const handleLoadFavorite = (favorite: Favorite) => {
    setCategory(favorite.category)
    setFromUnit(favorite.fromUnit)
    setToUnit(favorite.toUnit)
    toast.success('Loaded favorite conversion')

    trackToolEvent('unit_converter_favorite_load', {
      category: favorite.category,
    })
  }

  const isFavorite = useMemo(() => {
    return favorites.some(
      (f) => f.category === category && f.fromUnit === fromUnit && f.toUnit === toUnit
    )
  }, [favorites, category, fromUnit, toUnit])

  const availableUnits = useMemo(() => {
    return getUnitsForCategory(category)
  }, [category])

  const fromUnitInfo = getUnitInfo(category, fromUnit)
  const toUnitInfo = getUnitInfo(category, toUnit)

  const _categories = getAllCategories()
  const categoryInfo = unitDefinitions[category]

  // Save history to localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (history.length > 0) {
        localStorage.setItem('unitConverterHistory', JSON.stringify(history))
      } else {
        localStorage.removeItem('unitConverterHistory')
      }
    }
  }, [history])

  // Save savedChains to localStorage (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (savedChains.length > 0) {
        localStorage.setItem('unitConverterSavedChains', JSON.stringify(savedChains))
      } else {
        localStorage.removeItem('unitConverterSavedChains')
      }
    }
  }, [savedChains])

  // Add conversion to history when values change
  useEffect(() => {
    if (fromValue && toValue && toValue !== 'Error' && toValue !== '') {
      const newHistoryItem: ConversionHistoryItem = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        category,
        fromValue,
        fromUnit,
        toValue,
        toUnit,
      }

      setHistory((prev) => {
        // Avoid duplicate consecutive entries
        if (prev.length > 0) {
          const last = prev[0]
          if (
            last.category === category &&
            last.fromUnit === fromUnit &&
            last.toUnit === toUnit &&
            last.fromValue === fromValue
          ) {
            return prev
          }
        }

        // Keep only last 50 items
        const updated = [newHistoryItem, ...prev].slice(0, 50)
        return updated
      })
    }
  }, [fromValue, toValue, category, fromUnit, toUnit])

  const handleClearHistory = () => {
    setHistory([])
    toast.success('History cleared')
    trackToolEvent('unit_converter_history_clear', {})
  }

  const handleExportHistory = () => {
    const csv = [
      ['Timestamp', 'Category', 'From Value', 'From Unit', 'To Value', 'To Unit'].join(','),
      ...history.map((item) =>
        [
          new Date(item.timestamp).toISOString(),
          item.category,
          item.fromValue,
          getUnitInfo(item.category, item.fromUnit)?.symbol || item.fromUnit,
          item.toValue,
          getUnitInfo(item.category, item.toUnit)?.symbol || item.toUnit,
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `unit-converter-history-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('History exported!')
    trackToolEvent('unit_converter_history_export', {})
  }

  const handleReplayHistory = (item: ConversionHistoryItem) => {
    setCategory(item.category)
    setFromUnit(item.fromUnit)
    setToUnit(item.toUnit)
    setFromValue(item.fromValue)
    toast.success('Conversion loaded from history')
    trackToolEvent('unit_converter_history_replay', { category: item.category })
  }

  // Generate detailed formula explanation
  const getFormulaExplanation = useCallback(() => {
    if (!fromValue || !toValue || toValue === 'Error') return null

    const baseUnit = Object.entries(categoryInfo.units).find(
      ([, unit]) => unit.toBase.toString().includes('=> v') && !unit.toBase.toString().includes('*')
    )?.[0]

    // Special handling for temperature
    if (category === 'temperature') {
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        return {
          formula: '°F = (°C × 9/5) + 32',
          steps: [
            `Multiply ${fromValue}°C by 9/5: ${fromValue} × 1.8 = ${(Number(fromValue) * 1.8).toFixed(4)}`,
            `Add 32: ${(Number(fromValue) * 1.8).toFixed(4)} + 32 = ${toValue}°F`,
          ],
          explanation:
            'Fahrenheit and Celsius scales have different zero points and degree sizes. This formula accounts for both the scaling factor (9/5) and the offset (32).',
        }
      }
      if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        return {
          formula: '°C = (°F - 32) × 5/9',
          steps: [
            `Subtract 32 from ${fromValue}°F: ${fromValue} - 32 = ${(Number(fromValue) - 32).toFixed(4)}`,
            `Multiply by 5/9: ${(Number(fromValue) - 32).toFixed(4)} × 0.5556 = ${toValue}°C`,
          ],
          explanation:
            'Converting from Fahrenheit requires first removing the 32-degree offset, then scaling by 5/9 to account for different degree sizes.',
        }
      }
      if (fromUnit === 'celsius' && toUnit === 'kelvin') {
        return {
          formula: 'K = °C + 273.15',
          steps: [`Add 273.15 to ${fromValue}°C: ${fromValue} + 273.15 = ${toValue}K`],
          explanation:
            'Kelvin and Celsius have the same degree size but different zero points. Absolute zero (0K) equals -273.15°C.',
        }
      }
      if (fromUnit === 'kelvin' && toUnit === 'celsius') {
        return {
          formula: '°C = K - 273.15',
          steps: [`Subtract 273.15 from ${fromValue}K: ${fromValue} - 273.15 = ${toValue}°C`],
          explanation:
            'Converting from Kelvin to Celsius simply requires subtracting the offset of 273.15 degrees.',
        }
      }
    }

    // For other conversions via base unit
    const fromInfo = getUnitInfo(category, fromUnit)
    const toInfo = getUnitInfo(category, toUnit)

    if (!fromInfo || !toInfo) return null

    const baseValue = fromInfo.toBase(Number(fromValue))
    const factor1 = fromInfo.toBase(1)
    const factor2 = toInfo.fromBase(1)

    if (factor1 === 1 && factor2 !== 1) {
      // From base to target
      return {
        formula: `${toInfo.symbol} = ${fromInfo.symbol} × ${factor2.toFixed(6)}`,
        steps: [
          `Multiply ${fromValue} ${fromInfo.symbol} by conversion factor: ${fromValue} × ${factor2.toFixed(6)} = ${toValue} ${toInfo.symbol}`,
        ],
        explanation: `1 ${fromInfo.symbol} equals ${factor2.toFixed(6)} ${toInfo.symbol}. This direct conversion multiplies your value by this factor.`,
      }
    }

    if (factor1 !== 1 && factor2 === 1) {
      // From source to base
      return {
        formula: `${toInfo.symbol} = ${fromInfo.symbol} × ${factor1.toFixed(6)}`,
        steps: [
          `Multiply ${fromValue} ${fromInfo.symbol} by conversion factor: ${fromValue} × ${factor1.toFixed(6)} = ${toValue} ${toInfo.symbol}`,
        ],
        explanation: `1 ${fromInfo.symbol} equals ${factor1.toFixed(6)} ${toInfo.symbol}. This direct conversion multiplies your value by this factor.`,
      }
    }

    // Two-step conversion via base unit
    return {
      formula: `${toInfo.symbol} = (${fromInfo.symbol} × ${factor1.toFixed(6)}) × ${factor2.toFixed(6)}`,
      steps: [
        `Step 1: Convert ${fromValue} ${fromInfo.symbol} to base unit: ${fromValue} × ${factor1.toFixed(6)} = ${baseValue.toFixed(6)}`,
        `Step 2: Convert base unit to ${toInfo.symbol}: ${baseValue.toFixed(6)} × ${factor2.toFixed(6)} = ${toValue} ${toInfo.symbol}`,
      ],
      explanation: `This conversion uses a two-step process through the base unit (${baseUnit || 'base'}). First, convert from ${fromInfo.name} to the base unit, then from base to ${toInfo.name}.`,
    }
  }, [fromValue, toValue, categoryInfo, category, fromUnit, toUnit])

  const formulaExplanation = useMemo(() => getFormulaExplanation(), [getFormulaExplanation])

  // Multi-Step Conversion Handlers
  const handleAddChainStep = () => {
    if (conversionChain.length === 0) {
      // Initialize chain with current from and to units
      setConversionChain([
        { id: Date.now().toString(), unit: fromUnit, value: chainInputValue },
        { id: (Date.now() + 1).toString(), unit: toUnit, value: '' },
      ])
    } else {
      // Add a new step with the last unit from the chain
      const lastUnit = conversionChain[conversionChain.length - 1].unit
      const availableUnits = getUnitsForCategory(category)
      const nextUnit = availableUnits.find((u) => u !== lastUnit) || availableUnits[0]
      setConversionChain([
        ...conversionChain,
        { id: Date.now().toString(), unit: nextUnit, value: '' },
      ])
    }
    trackToolEvent('unit_converter_chain_add_step', { category })
  }

  const handleRemoveChainStep = (id: string) => {
    setConversionChain(conversionChain.filter((step) => step.id !== id))
    trackToolEvent('unit_converter_chain_remove_step', { category })
  }

  const handleClearChain = () => {
    setConversionChain([])
    setChainInputValue('100')
    trackToolEvent('unit_converter_chain_clear', { category })
  }

  const handleChainUnitChange = (id: string, newUnit: string) => {
    setConversionChain(
      conversionChain.map((step) => (step.id === id ? { ...step, unit: newUnit } : step))
    )
  }

  // Calculate chain values
  useEffect(() => {
    if (conversionChain.length === 0) return

    const updatedChain = [...conversionChain]
    updatedChain[0].value = chainInputValue

    for (let i = 1; i < updatedChain.length; i++) {
      const prevStep = updatedChain[i - 1]
      const currentStep = updatedChain[i]

      try {
        const result = convertUnit(
          Number(prevStep.value),
          prevStep.unit,
          currentStep.unit,
          category
        )
        currentStep.value = result.toFixed(8).replace(/\.?0+$/, '')
      } catch (error) {
        console.error('Chain conversion error:', error)
        currentStep.value = 'Error'
      }
    }

    setConversionChain(updatedChain)
  }, [chainInputValue, category, conversionChain])

  // Recalculate chain when units change
  useEffect(() => {
    if (conversionChain.length === 0) return

    const updatedChain = [...conversionChain]

    for (let i = 1; i < updatedChain.length; i++) {
      const prevStep = updatedChain[i - 1]
      const currentStep = updatedChain[i]

      try {
        const result = convertUnit(
          Number(prevStep.value),
          prevStep.unit,
          currentStep.unit,
          category
        )
        currentStep.value = result.toFixed(8).replace(/\.?0+$/, '')
      } catch (error) {
        console.error('Chain conversion error:', error)
        currentStep.value = 'Error'
      }
    }

    setConversionChain(updatedChain)
  }, [category, conversionChain])

  // Enhanced Chain Handlers
  const handleSaveChain = (name: string) => {
    if (conversionChain.length < 2) {
      toast.error('Chain must have at least 2 steps to save')
      return
    }

    const newSavedChain: SavedChain = {
      id: Date.now().toString(),
      name,
      category,
      steps: conversionChain.map((step) => ({ unit: step.unit })),
      createdAt: Date.now(),
    }

    setSavedChains([...savedChains, newSavedChain])
    toast.success(`Chain "${name}" saved!`)
    trackToolEvent('unit_converter_chain_save', { category, steps: conversionChain.length })
  }

  const handleLoadSavedChain = (chain: SavedChain) => {
    setCategory(chain.category)
    setConversionChain(
      chain.steps.map((step, index) => ({
        id: `${Date.now()}-${index}`,
        unit: step.unit,
        value: index === 0 ? chainInputValue : '',
      }))
    )
    toast.success(`Loaded chain: ${chain.name}`)
    trackToolEvent('unit_converter_chain_load', { category: chain.category })
  }

  const handleDeleteSavedChain = (id: string) => {
    setSavedChains(savedChains.filter((c) => c.id !== id))
    toast.success('Chain deleted')
    trackToolEvent('unit_converter_chain_delete', {})
  }

  const handleLoadPreset = (preset: ChainPreset) => {
    setCategory(preset.category)

    // If preset has a default value, use it and update the input
    if (preset.defaultValue) {
      setChainInputValue(preset.defaultValue)
    }

    setConversionChain(
      preset.steps.map((unit, index) => ({
        id: `${Date.now()}-${index}`,
        unit,
        value: index === 0 ? preset.defaultValue || chainInputValue : '',
      }))
    )

    const toastMessage = preset.defaultValue
      ? `Loaded template: ${preset.name} (${preset.defaultValue})`
      : `Loaded preset: ${preset.name}`
    toast.success(toastMessage)
    trackToolEvent('unit_converter_preset_load', {
      category: preset.category,
      hasDefaultValue: !!preset.defaultValue,
    })
  }

  const handleExportChainResults = () => {
    if (conversionChain.length === 0) {
      toast.error('No chain to export')
      return
    }

    const csv = [
      ['Step', 'Unit', 'Value', 'Symbol'].join(','),
      ...conversionChain.map((step, index) => {
        const unitInfo = getUnitInfo(category, step.unit)
        return [index + 1, unitInfo?.name || step.unit, step.value, unitInfo?.symbol || ''].join(
          ','
        )
      }),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `unit-converter-chain-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Chain results exported!')
    trackToolEvent('unit_converter_chain_export', { category })
  }

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({ textAlign: 'center', spaceY: '4' })}
      >
        <div
          className={css({
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3',
            rounded: 'full',
            border: '1px solid',
            borderColor: 'blue.500/30',
            bg: 'blue.500/10',
            px: '5',
            py: '2',
            backdropFilter: 'blur(8px)',
          })}
        >
          <Repeat className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span className={css({ fontSize: 'sm', fontWeight: 'semibold', color: 'blue.300' })}>
            11 Categories • 100+ Units
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'cyan.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Unit Converter
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'white',
          })}
        >
          Convert between metric, imperial, and scientific units instantly. Support for length,
          weight, temperature, volume, area, speed, time, and more.
        </p>
      </motion.div>

      {/* Category Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle>Select Category</CardTitle>
            <CardDescription>Choose the type of unit you want to convert</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Desktop: Operation Grid */}
            <div className={css({ display: { base: 'none', md: 'block' } })}>
              <ToolOperationGrid
                operations={UNIT_CATEGORY_OPERATIONS}
                selectedOperation={category}
                onOperationChange={(newCategory) =>
                  handleCategoryChange(newCategory as UnitCategory)
                }
                columns={{ base: 1, sm: 2, md: 3, lg: 6 }}
                analyticsCategory="unit_converter"
              />
            </div>

            {/* Mobile: Bottom Sheet Picker */}
            <div className={css({ display: { base: 'block', md: 'none' } })}>
              <ToolMobilePicker
                label={`Category: ${
                  UNIT_CATEGORY_OPERATIONS.find((op) => op.id === category)?.label || 'Length'
                }`}
                title="Choose Unit Category"
                description="Select the type of unit you want to convert"
                color={UNIT_CATEGORY_OPERATIONS.find((op) => op.id === category)?.color}
              >
                <ToolOperationGrid
                  operations={UNIT_CATEGORY_OPERATIONS}
                  selectedOperation={category}
                  onOperationChange={(newCategory) =>
                    handleCategoryChange(newCategory as UnitCategory)
                  }
                  columns={{ base: 1, sm: 2 }}
                  analyticsCategory="unit_converter"
                />
              </ToolMobilePicker>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Converter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
              <CardTitle>Convert {categoryInfo.name}</CardTitle>
              {!isFavorite && (
                <Button
                  onClick={handleAddFavorite}
                  size="sm"
                  className={css({
                    gap: '2',
                    bg: 'gray.800',
                    color: 'white',
                    _hover: { bg: 'gray.700', color: 'yellow.400' },
                  })}
                >
                  <Star className={css({ h: '4', w: '4' })} />
                  Add to Favorites
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className={css({ spaceY: '6' })}>
            {/* From Unit */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="from-value"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
              >
                From
              </label>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3' })}>
                <Input
                  id="from-value"
                  type="text"
                  inputMode="decimal"
                  value={fromValue}
                  onChange={(e) => {
                    setFromValue(e.target.value)
                  }}
                  placeholder="Enter value"
                  className={css({
                    h: '14',
                    fontSize: 'xl',
                    bg: 'gray.800/50',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    _focus: { borderColor: 'blue.500', ring: '2px', ringColor: 'blue.500/20' },
                  })}
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className={css({
                    h: '14',
                    minW: '40',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'base',
                    color: 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    _focus: {
                      outline: 'none',
                      borderColor: 'blue.500',
                      ring: '2px',
                      ringColor: 'blue.500/20',
                    },
                  })}
                >
                  {availableUnits.map((unit) => {
                    const info = getUnitInfo(category, unit)
                    return (
                      <option key={unit} value={unit}>
                        {info?.name} ({info?.symbol})
                      </option>
                    )
                  })}
                </select>
              </div>
              {fromUnitInfo && (
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Info className={css({ h: '4', w: '4', color: 'white' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    {fromUnitInfo.name} ({fromUnitInfo.symbol})
                  </span>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <div className={css({ display: 'flex', justifyContent: 'center' })}>
              <Button
                onClick={handleSwapUnits}
                className={css({
                  gap: '2',
                  rounded: 'full',
                  bg: 'blue.500/20',
                  border: '1px solid',
                  borderColor: 'blue.500/50',
                  color: 'blue.300',
                  _hover: {
                    bg: 'blue.500/30',
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s',
                  },
                })}
              >
                <ArrowLeftRight className={css({ h: '5', w: '5' })} />
                Swap Units
              </Button>
            </div>

            {/* To Unit */}
            <div className={css({ spaceY: '3' })}>
              <label
                htmlFor="to-value"
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
              >
                To
              </label>
              <div className={css({ display: 'grid', gridTemplateColumns: '1fr auto', gap: '3' })}>
                <Input
                  id="to-value"
                  type="text"
                  readOnly
                  value={toValue}
                  placeholder="Result"
                  className={css({
                    h: '14',
                    fontSize: 'xl',
                    fontWeight: 'bold',
                    bg: 'blue.500/10',
                    border: '1px solid',
                    borderColor: 'blue.500/30',
                    color: 'blue.300',
                    cursor: 'default',
                  })}
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className={css({
                    h: '14',
                    minW: '40',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '4',
                    fontSize: 'base',
                    color: 'gray.200',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    _hover: { bg: 'gray.800', borderColor: 'gray.600' },
                    _focus: {
                      outline: 'none',
                      borderColor: 'blue.500',
                      ring: '2px',
                      ringColor: 'blue.500/20',
                    },
                  })}
                >
                  {availableUnits.map((unit) => {
                    const info = getUnitInfo(category, unit)
                    return (
                      <option key={unit} value={unit}>
                        {info?.name} ({info?.symbol})
                      </option>
                    )
                  })}
                </select>
              </div>
              {toUnitInfo && (
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <Info className={css({ h: '4', w: '4', color: 'white' })} />
                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                    {toUnitInfo.name} ({toUnitInfo.symbol})
                  </span>
                </div>
              )}
            </div>

            {/* Enhanced Formula Display */}
            {fromValue && toValue && toValue !== 'Error' && formulaExplanation && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: 'blue.500/20',
                  bg: 'blue.500/5',
                  p: '4',
                  spaceY: '3',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <TrendingUp className={css({ h: '4', w: '4', color: 'blue.400' })} />
                    <span
                      className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'blue.300' })}
                    >
                      Conversion Formula
                    </span>
                  </div>
                  <Button
                    onClick={() => {
                      setShowFormulaDetails(!showFormulaDetails)
                      trackToolEvent('unit_converter_convert', { action: 'toggle_formula' })
                    }}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'transparent',
                      color: 'blue.400',
                      fontSize: 'xs',
                      h: 'auto',
                      p: '1',
                      _hover: { bg: 'blue.500/10' },
                    })}
                  >
                    <Info className={css({ h: '3', w: '3' })} />
                    {showFormulaDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                </div>

                <div
                  className={css({
                    fontFamily: 'mono',
                    fontSize: 'sm',
                    color: 'white',
                    bg: 'gray.800/50',
                    p: '3',
                    rounded: 'md',
                    border: '1px solid',
                    borderColor: 'gray.700',
                  })}
                >
                  {formulaExplanation.formula}
                </div>

                <p className={css({ fontSize: 'sm', color: 'white' })}>
                  Quick reference: 1 {fromUnitInfo?.symbol} ={' '}
                  {convertUnit(1, fromUnit, toUnit, category).toFixed(6)} {toUnitInfo?.symbol}
                </p>

                {showFormulaDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={css({
                      spaceY: '3',
                      pt: '2',
                      borderTop: '1px solid',
                      borderColor: 'blue.500/20',
                    })}
                  >
                    <div>
                      <h4
                        className={css({
                          fontSize: 'xs',
                          fontWeight: 'semibold',
                          color: 'blue.300',
                          mb: '2',
                          textTransform: 'uppercase',
                        })}
                      >
                        Step-by-Step Calculation
                      </h4>
                      <div className={css({ spaceY: '2' })}>
                        {formulaExplanation.steps.map((step, index) => (
                          <div
                            key={index}
                            className={css({ display: 'flex', gap: '2', alignItems: 'start' })}
                          >
                            <Badge
                              className={css({
                                bg: 'blue.500/20',
                                color: 'blue.300',
                                border: '1px solid',
                                borderColor: 'blue.500/30',
                                fontSize: 'xs',
                                h: '5',
                                w: '5',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: '0',
                              })}
                            >
                              {index + 1}
                            </Badge>
                            <p className={css({ fontSize: 'xs', color: 'white', flex: '1' })}>
                              {step}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      className={css({
                        bg: 'cyan.500/10',
                        border: '1px solid',
                        borderColor: 'cyan.500/20',
                        rounded: 'md',
                        p: '3',
                      })}
                    >
                      <div className={css({ display: 'flex', alignItems: 'start', gap: '2' })}>
                        <Lightbulb
                          className={css({
                            h: '4',
                            w: '4',
                            color: 'cyan.400',
                            flexShrink: '0',
                            mt: '0.5',
                          })}
                        />
                        <div>
                          <h4
                            className={css({
                              fontSize: 'xs',
                              fontWeight: 'semibold',
                              color: 'cyan.300',
                              mb: '1',
                            })}
                          >
                            How This Works
                          </h4>
                          <p className={css({ fontSize: 'xs', color: 'white' })}>
                            {formulaExplanation.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Multi-Step Conversions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'teal.500/20',
            bg: 'gray.900/50',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              })}
            >
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <GitBranch className={css({ h: '5', w: '5', color: 'teal.400' })} />
                <div>
                  <CardTitle>Multi-Step Conversions</CardTitle>
                  <CardDescription>
                    Chain multiple conversions to see how values transform through different units
                  </CardDescription>
                </div>
              </div>
              <div className={css({ display: 'flex', gap: '2' })}>
                {conversionChain.length === 0 ? (
                  <Button
                    onClick={handleAddChainStep}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'teal.500/20',
                      color: 'teal.300',
                      border: '1px solid',
                      borderColor: 'teal.500/30',
                      _hover: { bg: 'teal.500/30' },
                    })}
                  >
                    <Plus className={css({ h: '4', w: '4' })} />
                    Start Chain
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleAddChainStep}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'teal.500/20',
                        color: 'teal.300',
                        border: '1px solid',
                        borderColor: 'teal.500/30',
                        _hover: { bg: 'teal.500/30' },
                      })}
                    >
                      <Plus className={css({ h: '4', w: '4' })} />
                      Add Step
                    </Button>
                    <Button
                      onClick={handleClearChain}
                      size="sm"
                      className={css({
                        gap: '2',
                        bg: 'gray.800',
                        color: 'white',
                        _hover: { bg: 'red.500/20', color: 'red.400' },
                      })}
                    >
                      <Trash2 className={css({ h: '4', w: '4' })} />
                      Clear Chain
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {conversionChain.length === 0 ? (
              <div
                className={css({
                  textAlign: 'center',
                  py: '8',
                  px: '4',
                  rounded: 'lg',
                  border: '2px dashed',
                  borderColor: 'gray.700',
                  bg: 'gray.800/30',
                })}
              >
                <GitBranch
                  className={css({
                    h: '12',
                    w: '12',
                    color: 'gray.600',
                    mx: 'auto',
                    mb: '3',
                  })}
                />
                <h3
                  className={css({
                    fontSize: 'lg',
                    fontWeight: 'semibold',
                    color: 'white',
                    mb: '2',
                  })}
                >
                  Create a Conversion Chain
                </h3>
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'white',
                    mb: '4',
                    maxW: 'md',
                    mx: 'auto',
                  })}
                >
                  Chain multiple unit conversions together to see step-by-step transformations. For
                  example: Miles → Kilometers → Meters → Centimeters
                </p>
                <Button
                  onClick={handleAddChainStep}
                  className={css({
                    gap: '2',
                    bg: 'teal.500/20',
                    color: 'teal.300',
                    border: '1px solid',
                    borderColor: 'teal.500/30',
                    _hover: { bg: 'teal.500/30' },
                  })}
                >
                  <Plus className={css({ h: '4', w: '4' })} />
                  Start Chain
                </Button>
              </div>
            ) : (
              <div className={css({ spaceY: '4' })}>
                {/* Input Value */}
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="chain-input"
                    className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'white' })}
                  >
                    Starting Value
                  </label>
                  <Input
                    id="chain-input"
                    type="text"
                    inputMode="decimal"
                    value={chainInputValue}
                    onChange={(e) => setChainInputValue(e.target.value)}
                    placeholder="Enter value"
                    className={css({
                      h: '12',
                      fontSize: 'lg',
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      _focus: { borderColor: 'teal.500', ring: '2px', ringColor: 'teal.500/20' },
                    })}
                  />
                </div>

                {/* Conversion Chain Flow */}
                <div className={css({ position: 'relative', spaceY: '0' })}>
                  {conversionChain.map((step, index) => {
                    const unitInfo = getUnitInfo(category, step.unit)
                    const isFirst = index === 0
                    const isLast = index === conversionChain.length - 1

                    return (
                      <div key={step.id}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={css({
                            position: 'relative',
                            rounded: 'lg',
                            border: '1px solid',
                            borderColor: isFirst
                              ? 'teal.500/40'
                              : isLast
                                ? 'cyan.500/40'
                                : 'gray.700',
                            bg: isFirst ? 'teal.500/10' : isLast ? 'cyan.500/10' : 'gray.800/50',
                            p: '4',
                          })}
                        >
                          <div
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3',
                              justifyContent: 'space-between',
                            })}
                          >
                            <div className={css({ flex: '1', spaceY: '2' })}>
                              <div
                                className={css({ display: 'flex', alignItems: 'center', gap: '2' })}
                              >
                                <Badge
                                  className={css({
                                    bg: isFirst
                                      ? 'teal.500/30'
                                      : isLast
                                        ? 'cyan.500/30'
                                        : 'gray.700',
                                    color: isFirst ? 'teal.200' : isLast ? 'cyan.200' : 'gray.300',
                                    border: '1px solid',
                                    borderColor: isFirst
                                      ? 'teal.500/40'
                                      : isLast
                                        ? 'cyan.500/40'
                                        : 'gray.600',
                                  })}
                                >
                                  {isFirst ? 'Start' : isLast ? 'Result' : `Step ${index}`}
                                </Badge>
                              </div>

                              <div
                                className={css({ display: 'flex', alignItems: 'center', gap: '3' })}
                              >
                                <select
                                  value={step.unit}
                                  onChange={(e) => handleChainUnitChange(step.id, e.target.value)}
                                  className={css({
                                    flex: '1',
                                    h: '10',
                                    rounded: 'md',
                                    border: '1px solid',
                                    borderColor: 'gray.600',
                                    bg: 'gray.800',
                                    px: '3',
                                    fontSize: 'sm',
                                    color: 'gray.200',
                                    cursor: 'pointer',
                                    _hover: { bg: 'gray.750', borderColor: 'gray.500' },
                                    _focus: {
                                      outline: 'none',
                                      borderColor: 'teal.500',
                                      ring: '1px',
                                      ringColor: 'teal.500/20',
                                    },
                                  })}
                                >
                                  {availableUnits.map((unit) => {
                                    const info = getUnitInfo(category, unit)
                                    return (
                                      <option key={unit} value={unit}>
                                        {info?.name} ({info?.symbol})
                                      </option>
                                    )
                                  })}
                                </select>

                                <div
                                  className={css({
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2',
                                    minW: '32',
                                  })}
                                >
                                  <span
                                    className={css({
                                      fontSize: 'lg',
                                      fontWeight: 'bold',
                                      color: isFirst
                                        ? 'teal.300'
                                        : isLast
                                          ? 'cyan.300'
                                          : 'gray.300',
                                    })}
                                  >
                                    {step.value || '—'}
                                  </span>
                                  <span className={css({ fontSize: 'sm', color: 'white' })}>
                                    {unitInfo?.symbol}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {!isFirst && (
                              <Button
                                onClick={() => handleRemoveChainStep(step.id)}
                                size="sm"
                                className={css({
                                  bg: 'transparent',
                                  color: 'white',
                                  p: '2',
                                  h: 'auto',
                                  _hover: { bg: 'red.500/20', color: 'red.400' },
                                })}
                              >
                                <X className={css({ h: '4', w: '4' })} />
                              </Button>
                            )}
                          </div>
                        </motion.div>

                        {/* Arrow between steps */}
                        {!isLast && (
                          <div
                            className={css({ display: 'flex', justifyContent: 'center', py: '2' })}
                          >
                            <ArrowRight className={css({ h: '5', w: '5', color: 'teal.500/50' })} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Summary */}
                {conversionChain.length >= 2 &&
                  conversionChain[conversionChain.length - 1].value && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={css({
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'teal.500/30',
                        bg: 'teal.500/5',
                        p: '4',
                        spaceY: '3',
                      })}
                    >
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                        })}
                      >
                        <Info className={css({ h: '4', w: '4', color: 'teal.400' })} />
                        <span
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: 'teal.300',
                          })}
                        >
                          Chain Summary
                        </span>
                      </div>
                      <p className={css({ fontSize: 'sm', color: 'white' })}>
                        {chainInputValue} {getUnitInfo(category, conversionChain[0].unit)?.symbol} →{' '}
                        {conversionChain.length - 1} step{conversionChain.length > 2 ? 's' : ''} →{' '}
                        <span className={css({ fontWeight: 'bold', color: 'cyan.300' })}>
                          {conversionChain[conversionChain.length - 1].value}{' '}
                          {
                            getUnitInfo(category, conversionChain[conversionChain.length - 1].unit)
                              ?.symbol
                          }
                        </span>
                      </p>
                      {/* Chain Actions */}
                      <div className={css({ display: 'flex', gap: '2', pt: '2' })}>
                        <Button
                          onClick={() => setShowSaveChainDialog(true)}
                          size="sm"
                          className={css({
                            gap: '2',
                            bg: 'teal.500/20',
                            color: 'teal.300',
                            border: '1px solid',
                            borderColor: 'teal.500/30',
                            _hover: { bg: 'teal.500/30' },
                          })}
                        >
                          <Save className={css({ h: '4', w: '4' })} />
                          Save Chain
                        </Button>
                        <Button
                          onClick={handleExportChainResults}
                          size="sm"
                          className={css({
                            gap: '2',
                            bg: 'gray.800',
                            color: 'white',
                            _hover: { bg: 'gray.700', color: 'cyan.400' },
                          })}
                        >
                          <Download className={css({ h: '4', w: '4' })} />
                          Export CSV
                        </Button>
                      </div>
                    </motion.div>
                  )}

                {/* Save Chain Dialog */}
                {showSaveChainDialog && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={css({
                      position: 'fixed',
                      inset: '0',
                      bg: 'black/60',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: '50',
                      px: '4',
                    })}
                    onClick={() => setShowSaveChainDialog(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={css({
                        bg: 'gray.900',
                        rounded: 'xl',
                        border: '1px solid',
                        borderColor: 'teal.500/30',
                        p: '6',
                        maxW: 'md',
                        w: 'full',
                        spaceY: '4',
                      })}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div>
                        <h3
                          className={css({
                            fontSize: 'lg',
                            fontWeight: 'semibold',
                            color: 'teal.300',
                            mb: '2',
                          })}
                        >
                          Save Conversion Chain
                        </h3>
                        <p className={css({ fontSize: 'sm', color: 'white' })}>
                          Give your chain a name to save it for later use
                        </p>
                      </div>
                      <Input
                        value={chainNameInput}
                        onChange={(e) => setChainNameInput(e.target.value)}
                        placeholder="e.g., My Length Conversion"
                        className={css({
                          h: '12',
                          bg: 'gray.800/50',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          _focus: {
                            borderColor: 'teal.500',
                            ring: '2px',
                            ringColor: 'teal.500/20',
                          },
                        })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && chainNameInput.trim()) {
                            handleSaveChain(chainNameInput.trim())
                            setShowSaveChainDialog(false)
                            setChainNameInput('')
                          }
                        }}
                      />
                      <div
                        className={css({ display: 'flex', gap: '2', justifyContent: 'flex-end' })}
                      >
                        <Button
                          onClick={() => {
                            setShowSaveChainDialog(false)
                            setChainNameInput('')
                          }}
                          className={css({
                            bg: 'gray.800',
                            color: 'white',
                            _hover: { bg: 'gray.700' },
                          })}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={() => {
                            if (chainNameInput.trim()) {
                              handleSaveChain(chainNameInput.trim())
                              setShowSaveChainDialog(false)
                              setChainNameInput('')
                            }
                          }}
                          disabled={!chainNameInput.trim()}
                          className={css({
                            gap: '2',
                            bg: 'teal.500/20',
                            color: 'teal.300',
                            border: '1px solid',
                            borderColor: 'teal.500/30',
                            _hover: { bg: 'teal.500/30' },
                            _disabled: { opacity: '0.5', cursor: 'not-allowed' },
                          })}
                        >
                          <Save className={css({ h: '4', w: '4' })} />
                          Save Chain
                        </Button>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Preset Chains Section */}
                <div
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'yellow.500/20',
                    bg: 'yellow.500/5',
                    p: '4',
                    spaceY: '3',
                  })}
                >
                  <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                    <Zap className={css({ h: '4', w: '4', color: 'yellow.400' })} />
                    <span
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'semibold',
                        color: 'yellow.300',
                      })}
                    >
                      Quick Start Presets
                    </span>
                  </div>
                  <p className={css({ fontSize: 'sm', color: 'white' })}>
                    Load common conversion chains instantly
                  </p>
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: '1fr', md: 'repeat(2, 1fr)' },
                      gap: '2',
                    })}
                  >
                    {chainPresets.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleLoadPreset(preset)}
                        className={css({
                          textAlign: 'left',
                          rounded: 'md',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'gray.800/50',
                          p: '3',
                          transition: 'all 0.2s',
                          cursor: 'pointer',
                          _hover: { bg: 'gray.800', borderColor: 'yellow.500/50' },
                        })}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2',
                            mb: '1',
                          })}
                        >
                          <Badge
                            className={css({
                              bg: 'yellow.500/20',
                              color: 'yellow.300',
                              border: '1px solid',
                              borderColor: 'yellow.500/30',
                              fontSize: 'xs',
                            })}
                          >
                            {unitDefinitions[preset.category].name}
                          </Badge>
                          <span
                            className={css({
                              fontSize: 'sm',
                              fontWeight: 'semibold',
                              color: 'gray.200',
                            })}
                          >
                            {preset.name}
                          </span>
                        </div>
                        <p className={css({ fontSize: 'xs', color: 'white' })}>
                          {preset.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saved Chains Section */}
                {savedChains.length > 0 && (
                  <div
                    className={css({
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'purple.500/20',
                      bg: 'purple.500/5',
                      p: '4',
                      spaceY: '3',
                    })}
                  >
                    <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                      <Star className={css({ h: '4', w: '4', color: 'purple.400' })} />
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: 'purple.300',
                        })}
                      >
                        Your Saved Chains
                      </span>
                      <Badge
                        className={css({
                          bg: 'purple.500/20',
                          color: 'purple.300',
                          border: '1px solid',
                          borderColor: 'purple.500/30',
                        })}
                      >
                        {savedChains.length}
                      </Badge>
                    </div>
                    <div className={css({ spaceY: '2' })}>
                      {savedChains.map((chain) => (
                        <div
                          key={chain.id}
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            rounded: 'md',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            bg: 'gray.800/50',
                            p: '3',
                            transition: 'all 0.2s',
                            _hover: { bg: 'gray.800', borderColor: 'purple.500/50' },
                          })}
                        >
                          <button
                            type="button"
                            onClick={() => handleLoadSavedChain(chain)}
                            className={css({
                              flex: '1',
                              textAlign: 'left',
                              bg: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              p: '0',
                            })}
                          >
                            <div
                              className={css({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2',
                                mb: '1',
                              })}
                            >
                              <Badge
                                className={css({
                                  bg: 'purple.500/20',
                                  color: 'purple.300',
                                  border: '1px solid',
                                  borderColor: 'purple.500/30',
                                  fontSize: 'xs',
                                })}
                              >
                                {unitDefinitions[chain.category].name}
                              </Badge>
                              <span
                                className={css({
                                  fontSize: 'sm',
                                  fontWeight: 'semibold',
                                  color: 'gray.200',
                                })}
                              >
                                {chain.name}
                              </span>
                            </div>
                            <p className={css({ fontSize: 'xs', color: 'white' })}>
                              {chain.steps.length} steps •{' '}
                              {new Date(chain.createdAt).toLocaleDateString()}
                            </p>
                          </button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSavedChain(chain.id)
                            }}
                            size="sm"
                            className={css({
                              bg: 'transparent',
                              color: 'white',
                              p: '2',
                              h: 'auto',
                              _hover: { bg: 'red.500/20', color: 'red.400' },
                            })}
                          >
                            <Trash2 className={css({ h: '4', w: '4' })} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'yellow.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                <Star
                  className={css({ h: '5', w: '5', color: 'yellow.400' })}
                  fill="currentColor"
                />
                <CardTitle>Favorite Conversions</CardTitle>
                <Badge
                  className={css({
                    bg: 'yellow.500/20',
                    color: 'yellow.300',
                    border: '1px solid',
                    borderColor: 'yellow.500/30',
                  })}
                >
                  {favorites.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ display: 'grid', gap: '3' })}>
                {favorites.map((favorite) => {
                  const catDef = unitDefinitions[favorite.category]
                  const fromInfo = catDef.units[favorite.fromUnit]
                  const toInfo = catDef.units[favorite.toUnit]

                  return (
                    <div
                      key={favorite.id}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '4',
                        transition: 'all 0.2s',
                        w: 'full',
                        _hover: { bg: 'gray.800', borderColor: 'blue.500/50' },
                      })}
                    >
                      <button
                        type="button"
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          flex: '1',
                          bg: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          p: '0',
                        })}
                        onClick={() => handleLoadFavorite(favorite)}
                      >
                        <Badge
                          className={css({
                            bg: 'blue.500/20',
                            color: 'blue.300',
                            border: '1px solid',
                            borderColor: 'blue.500/30',
                          })}
                        >
                          {catDef.name}
                        </Badge>
                        <span className={css({ fontSize: 'sm', color: 'white' })}>
                          {fromInfo?.name} ({fromInfo?.symbol})
                        </span>
                        <ArrowRight className={css({ h: '4', w: '4', color: 'white' })} />
                        <span className={css({ fontSize: 'sm', color: 'white' })}>
                          {toInfo?.name} ({toInfo?.symbol})
                        </span>
                      </button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveFavorite(favorite.id)
                        }}
                        size="sm"
                        className={css({
                          gap: '2',
                          bg: 'transparent',
                          color: 'white',
                          _hover: { bg: 'red.500/20', color: 'red.400' },
                        })}
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Conversion History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                })}
              >
                <div className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
                  <History className={css({ h: '5', w: '5', color: 'purple.400' })} />
                  <CardTitle>Conversion History</CardTitle>
                  <Badge
                    className={css({
                      bg: 'purple.500/20',
                      color: 'purple.300',
                      border: '1px solid',
                      borderColor: 'purple.500/30',
                    })}
                  >
                    {history.length}
                  </Badge>
                </div>
                <div className={css({ display: 'flex', gap: '2' })}>
                  <Button
                    onClick={handleExportHistory}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'white',
                      _hover: { bg: 'gray.700', color: 'purple.400' },
                    })}
                  >
                    <Download className={css({ h: '4', w: '4' })} />
                    Export CSV
                  </Button>
                  <Button
                    onClick={handleClearHistory}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'gray.800',
                      color: 'white',
                      _hover: { bg: 'red.500/20', color: 'red.400' },
                    })}
                  >
                    <Trash2 className={css({ h: '4', w: '4' })} />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={css({ spaceY: '2', maxH: '96', overflowY: 'auto' })}>
                {history.slice(0, 20).map((item) => {
                  const catDef = unitDefinitions[item.category]
                  const fromInfo = catDef?.units[item.fromUnit]
                  const toInfo = catDef?.units[item.toUnit]
                  const timeAgo = new Date(item.timestamp).toLocaleString()

                  return (
                    <div
                      key={item.id}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        p: '3',
                        transition: 'all 0.2s',
                        _hover: { bg: 'gray.800', borderColor: 'purple.500/50' },
                      })}
                    >
                      <button
                        type="button"
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3',
                          flex: '1',
                          bg: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          p: '0',
                        })}
                        onClick={() => handleReplayHistory(item)}
                      >
                        <Clock
                          className={css({ h: '4', w: '4', color: 'white', flexShrink: '0' })}
                        />
                        <div className={css({ flex: '1', minW: '0' })}>
                          <div
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2',
                              flexWrap: 'wrap',
                            })}
                          >
                            <Badge
                              className={css({
                                bg: 'purple.500/20',
                                color: 'purple.300',
                                border: '1px solid',
                                borderColor: 'purple.500/30',
                                fontSize: 'xs',
                              })}
                            >
                              {catDef?.name}
                            </Badge>
                            <span
                              className={css({
                                fontSize: 'sm',
                                color: 'white',
                                fontWeight: 'semibold',
                              })}
                            >
                              {item.fromValue} {fromInfo?.symbol}
                            </span>
                            <ArrowRight className={css({ h: '3', w: '3', color: 'white' })} />
                            <span
                              className={css({
                                fontSize: 'sm',
                                color: 'white',
                                fontWeight: 'semibold',
                              })}
                            >
                              {item.toValue} {toInfo?.symbol}
                            </span>
                          </div>
                          <span
                            className={css({
                              fontSize: 'xs',
                              color: 'white',
                              display: 'block',
                              mt: '1',
                            })}
                          >
                            {timeAgo}
                          </span>
                        </div>
                        <RotateCcw
                          className={css({ h: '4', w: '4', color: 'white', flexShrink: '0' })}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
              {history.length > 20 && (
                <p
                  className={css({
                    fontSize: 'sm',
                    color: 'white',
                    textAlign: 'center',
                    mt: '3',
                  })}
                >
                  Showing 20 of {history.length} conversions
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardContent withTopPadding className={css({ pt: '6', pb: '6' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
              <Sparkles className={css({ h: '6', w: '6', color: 'cyan.400', flexShrink: '0' })} />
              <div className={css({ spaceY: '2' })}>
                <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'cyan.300' })}>
                  Pro Tips
                </h3>
                <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'white' })}>
                  <li>• Use the swap button to quickly reverse conversions</li>
                  <li>• Save frequently used conversions as favorites for quick access</li>
                  <li>• All conversions are instant and work offline</li>
                  <li>• Supports scientific notation for very large or small numbers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card
          className={css({
            border: '2px solid',
            borderColor: 'blue.500/30',
            bg: 'rgba(59, 130, 246, 0.05)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <CardHeader>
            <CardTitle className={css({ display: 'flex', alignItems: 'center', gap: '2' })}>
              <Lightbulb className={css({ h: '5', w: '5' })} />
              How to Use Unit Converter
            </CardTitle>
            <CardDescription>
              Follow these simple steps to convert between any units instantly
            </CardDescription>
          </CardHeader>
          <CardContent className={css({ spaceY: '4' })}>
            <div className={css({ spaceY: '3' })}>
              <div className={css({ display: 'flex', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    h: '6',
                    w: '6',
                    rounded: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: 'purple.500/20',
                    borderColor: 'purple.500/50',
                    flexShrink: 0,
                  })}
                >
                  1
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.100', mb: '1' })}>
                    Select Unit Category
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'white' })}>
                    Choose from 30+ categories including Length, Weight, Temperature, Volume, Area,
                    Speed, Time, Pressure, Energy, Power, and Data Storage. Each category contains
                    relevant measurement units for that type.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    h: '6',
                    w: '6',
                    rounded: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: 'pink.500/20',
                    borderColor: 'pink.500/50',
                    flexShrink: 0,
                  })}
                >
                  2
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.100', mb: '1' })}>
                    Enter Value and Choose Units
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'white' })}>
                    Type your number in the input field, select the source unit (what you have), and
                    choose the target unit (what you want). The conversion happens instantly as you
                    type with up to 10 decimal places of precision.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    h: '6',
                    w: '6',
                    rounded: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: 'blue.500/20',
                    borderColor: 'blue.500/50',
                    flexShrink: 0,
                  })}
                >
                  3
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.100', mb: '1' })}>
                    View Results and Formula
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'white' })}>
                    The converted value appears immediately below. Click the info icon to see the
                    conversion formula and learn how the calculation works. Use the swap button to
                    reverse the conversion direction quickly.
                  </p>
                </div>
              </div>

              <div className={css({ display: 'flex', gap: '3' })}>
                <Badge
                  variant="outline"
                  className={css({
                    h: '6',
                    w: '6',
                    rounded: 'full',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bg: 'green.500/20',
                    borderColor: 'green.500/50',
                    flexShrink: 0,
                  })}
                >
                  4
                </Badge>
                <div>
                  <h3 className={css({ fontWeight: 'semibold', color: 'gray.100', mb: '1' })}>
                    Save Favorites (Optional)
                  </h3>
                  <p className={css({ fontSize: 'sm', color: 'white' })}>
                    Click the star icon to save frequently used conversions like kg to lbs, miles to
                    km, or Celsius to Fahrenheit. Your favorites appear at the top for instant
                    access on future visits. All data is stored locally in your browser.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <SocialShare
          toolName="Unit Converter"
          toolUrl="/tools/unit-converter"
          description="Convert between 30+ unit types instantly - length, weight, temperature, volume, and more with high precision"
          hashtags={['UnitConverter', 'Productivity', 'Tools', 'Conversion']}
        />
      </motion.div>

      <FAQAccordion faqs={faqs} />
      <RelatedTools currentToolPath="/tools/unit-converter" category="productivity" />
      <ToolRating toolId="/tools/unit-converter" toolName="Unit Converter" />

      {/* Global Tool Search - Cmd+K */}
      <ToolSearch />
    </main>
  )
}

export default function UnitConverterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnitConverterContent />
    </Suspense>
  )
}
