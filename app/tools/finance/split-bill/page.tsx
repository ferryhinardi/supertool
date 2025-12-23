'use client'

import {
  Banknote,
  Check,
  CircleDollarSign,
  Clock,
  Coins,
  Command,
  Copy,
  DollarSign,
  Download,
  Euro,
  FileText,
  Link2,
  Plus,
  PoundSterling,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { CurrencyConverter } from '@/components/features/CurrencyConverter'
import { ShortcutsHelp } from '@/components/features/ShortcutsHelp'
import { TemplatesSelector } from '@/components/features/TemplatesSelector'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { SwipeableItem, SwipeHint } from '@/components/ui/swipeable-item'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackToolEvent } from '@/lib/analytics'
import {
  CURRENCIES,
  type Currency,
  formatCurrency as formatCurrencyUtil,
  getDefaultCurrency,
} from '@/lib/currency'
import {
  announceToScreenReader,
  formatCurrencyForScreenReader,
  getPaymentStatusMessage,
  getSplitTypeDescription,
} from '@/lib/split-bill-a11y'
import {
  copyToClipboard,
  downloadCSV,
  exportAsText,
  generatePaymentRequest,
} from '@/lib/split-bill-export-legacy'
import { createBill } from '@/lib/split-bill-service'
import { useKeyboardShortcuts } from '@/lib/split-bill-shortcuts'
import {
  clearBillDraft,
  hasUnsavedDraft,
  loadBillDraft,
  saveBillDraft,
  saveBillTemplate,
} from '@/lib/split-bill-storage'
import type { CreateParticipantData } from '@/lib/split-bill-types'
import { css } from '@/styled-system/css'

// Dynamic import for ReceiptScanner to avoid loading Tesseract.js (~2-3MB) on initial page load
const ReceiptScanner = dynamic(
  () =>
    import('@/components/features/ReceiptScanner').then((mod) => ({ default: mod.ReceiptScanner })),
  { ssr: false }
)

interface Person {
  id: string
  name: string
  hasPaid: boolean
  percentage?: number
}

interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  assignedTo: string[] // Person IDs who share this item
}

type PageMode = 'calculator' | 'create'
type SplitType = 'equal' | 'percentage' | 'items'

const faqs = [
  {
    question: 'How do I split a bill with this calculator?',
    answer:
      'Simply add all participants, enter the total bill amount, select tip percentage, and our calculator automatically divides the total equally among all people. You can also use the receipt scanner feature to quickly extract items from a photo of your receipt. The calculator supports both equal splits and custom percentage splits for flexible bill sharing.',
  },
  {
    question: 'Can I split bills unequally among people?',
    answer:
      'Yes! We offer three split options: 1) Equal Split - divides equally among all participants, 2) Percentage Split - assign custom percentages to each person, and 3) Item-Based Split - add individual items and assign who ordered what. The item-based split is perfect for restaurant bills where each person ordered different dishes.',
  },
  {
    question: 'How does the tip calculation work?',
    answer:
      "You can choose from preset tip percentages (10%, 15%, 18%, 20%) or enter a custom amount. The tip is added to the total bill before splitting among participants. The calculator automatically shows the tip amount in your selected currency and includes it in each person's share.",
  },
  {
    question: 'Does the receipt scanner work with any receipt?',
    answer:
      'The receipt scanner works best with clear, well-lit photos of printed receipts. It uses OCR technology to extract item names and prices. While it works with most standard restaurant receipts, you may need to verify and adjust the extracted data for best accuracy. Supported formats include restaurant bills, cafe receipts, and itemized invoices.',
  },
  {
    question: 'How do I create a shareable bill link?',
    answer:
      'Switch to "Create Shareable Bill" mode, enter the bill details including title, organizer name, and optional bank account info. Set up the split amounts, then click "Create & Share Bill" to generate a unique link. Share this link with participants so they can track payment status in real-time and mark when they\'ve paid.',
  },
  {
    question: 'What currencies does the calculator support?',
    answer:
      'The split bill calculator supports 30+ currencies including USD, EUR, GBP, JPY, CNY, IDR, INR, AUD, CAD, and more. Select your currency from the dropdown menu and all amounts will be formatted correctly with proper symbols and thousand separators. The calculator remembers your preferred currency for future use.',
  },
  {
    question: "Can I track who has paid and who hasn't?",
    answer:
      "Yes! Each participant has a payment status toggle. Click the checkmark button next to any person to mark them as paid. The calculator shows a real-time summary of who has paid, who hasn't, and the total amount still owed. This makes it easy to track payment progress for group expenses.",
  },
  {
    question: 'How do I share the bill split with my group?',
    answer:
      'Click the "Share Summary" button to generate a formatted text summary of the entire bill split including everyone\'s amounts and payment status. You can share this via any messaging app, email, or social media. The summary includes all details: subtotal, tip, tax, total, and each person\'s share with their payment status.',
  },
]

export default function SplitBillPage() {
  const router = useRouter()
  const [mode, setMode] = useState<PageMode>('calculator')
  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [billAmount, setBillAmount] = useState('100000')
  const [tipPercent, setTipPercent] = useState('15')
  const [taxPercent, setTaxPercent] = useState('10')
  const [currency, setCurrency] = useState<Currency>(getDefaultCurrency())
  const [targetCurrency, setTargetCurrency] = useState<string>('USD')
  const [showCurrencyConverter, setShowCurrencyConverter] = useState(false)
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Person 1', hasPaid: false, percentage: 50 },
    { id: '2', name: 'Person 2', hasPaid: false, percentage: 50 },
  ])
  const [items, setItems] = useState<BillItem[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Mobile/touch detection
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [showSwipeHint, setShowSwipeHint] = useState(false)

  // Detect touch device
  useEffect(() => {
    const hasTouchScreen =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-expect-error - legacy check
      navigator.msMaxTouchPoints > 0

    setIsTouchDevice(hasTouchScreen)

    // Show swipe hint on first visit for touch devices
    if (hasTouchScreen && !localStorage.getItem('supertool_split_bill_swipe_hint_shown')) {
      setShowSwipeHint(true)
      localStorage.setItem('supertool_split_bill_swipe_hint_shown', 'true')

      // Auto-hide hint after 5 seconds
      setTimeout(() => {
        setShowSwipeHint(false)
      }, 5000)
    }
  }, [])

  // New item form state
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState('1')

  // Create Shareable Bill fields
  const [billTitle, setBillTitle] = useState('')
  const [billDescription, setBillDescription] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [organizerBankAccount, setOrganizerBankAccount] = useState('')
  const [organizerBankName, setOrganizerBankName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Load saved draft on mount
  useEffect(() => {
    const draft = loadBillDraft()
    if (draft && hasUnsavedDraft()) {
      const shouldRestore = window.confirm(
        'Found an unsaved bill draft. Would you like to restore it?'
      )
      if (shouldRestore) {
        setBillAmount(draft.billAmount)
        setTipPercent(draft.tipPercent)
        setTaxPercent(draft.taxPercent)
        setCurrency(CURRENCIES.find((c) => c.code === draft.currency) || getDefaultCurrency())
        setPeople(draft.people)
        setItems(draft.items || [])
        setSplitType(draft.splitType)
        toast.success('Draft restored successfully! 📋')
        trackToolEvent('split_bill_draft_restored', {})
      } else {
        clearBillDraft()
      }
    }
  }, [])

  // Auto-save draft whenever data changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveBillDraft({
        billAmount,
        tipPercent,
        taxPercent,
        currency: currency.code,
        people,
        items,
        splitType,
      })
      setHasUnsavedChanges(false)
    }, 2000) // Auto-save after 2 seconds of inactivity

    setHasUnsavedChanges(true)

    return () => clearTimeout(timeoutId)
  }, [billAmount, tipPercent, taxPercent, currency, people, items, splitType])

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Get currency icon component based on currency
  const getCurrencyIcon = () => {
    const iconMap = {
      Banknote,
      DollarSign,
      Euro,
      PoundSterling,
      Coins,
      CircleDollarSign,
    }
    return iconMap[currency.iconName]
  }

  const CurrencyIcon = getCurrencyIcon()

  // Format currency with proper thousand separators and decimals
  const formatCurrency = (amount: number): string => {
    return formatCurrencyUtil(amount, currency.code)
  }

  // Calculate item-based amounts (must be before calculations)
  const calculateItemBasedAmounts = useMemo(() => {
    if (splitType !== 'items') return {}

    const personAmounts: Record<string, number> = {}
    people.forEach((p) => {
      personAmounts[p.id] = 0
    })

    items.forEach((item) => {
      const totalItemPrice = item.price * item.quantity
      const shareCount = item.assignedTo.length

      if (shareCount > 0) {
        const pricePerPerson = totalItemPrice / shareCount
        item.assignedTo.forEach((personId) => {
          personAmounts[personId] = (personAmounts[personId] || 0) + pricePerPerson
        })
      }
    })

    return personAmounts
  }, [items, people, splitType])

  // Calculate totals
  const calculations = useMemo(() => {
    let bill = parseFloat(billAmount) || 0
    const tip = parseFloat(tipPercent) || 0
    const tax = parseFloat(taxPercent) || 0
    const numPeople = people.length

    // For items mode, calculate bill from items
    if (splitType === 'items') {
      bill = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    const tipAmount = (bill * tip) / 100
    const taxAmount = (bill * tax) / 100
    const total = bill + tipAmount + taxAmount

    // Calculate per person based on split type
    let perPerson = 0
    let peopleWithAmounts: { id: string; amount: number }[] = []

    if (splitType === 'equal') {
      perPerson = numPeople > 0 ? total / numPeople : 0
      peopleWithAmounts = people.map((p) => ({ id: p.id, amount: perPerson }))
    } else if (splitType === 'items') {
      // Item-based split
      const itemAmounts = calculateItemBasedAmounts
      const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const multiplier = itemsSubtotal > 0 ? total / itemsSubtotal : 0

      peopleWithAmounts = people.map((p) => ({
        id: p.id,
        amount: (itemAmounts[p.id] || 0) * multiplier,
      }))
      perPerson = numPeople > 0 ? total / numPeople : 0
    } else {
      // Percentage split
      peopleWithAmounts = people.map((p) => ({
        id: p.id,
        amount: total * ((p.percentage || 0) / 100),
      }))
    }

    const paidCount = people.filter((p) => p.hasPaid).length
    const unpaidCount = numPeople - paidCount

    const totalPaid = people
      .filter((p) => p.hasPaid)
      .reduce((sum, p) => {
        const personAmount = peopleWithAmounts.find((pa) => pa.id === p.id)?.amount || 0
        return sum + personAmount
      }, 0)

    const totalUnpaid = people
      .filter((p) => !p.hasPaid)
      .reduce((sum, p) => {
        const personAmount = peopleWithAmounts.find((pa) => pa.id === p.id)?.amount || 0
        return sum + personAmount
      }, 0)

    return {
      bill,
      tipAmount,
      taxAmount,
      total,
      perPerson,
      paidCount,
      unpaidCount,
      totalPaid,
      totalUnpaid,
      peopleWithAmounts,
    }
  }, [billAmount, tipPercent, taxPercent, people, splitType, items, calculateItemBasedAmounts])

  // Add person
  const addPerson = () => {
    const newId = String(Date.now())
    const defaultPercentage = splitType === 'percentage' ? 0 : undefined
    const newPersonName = `Person ${people.length + 1}`
    setPeople([
      ...people,
      {
        id: newId,
        name: newPersonName,
        hasPaid: false,
        percentage: defaultPercentage,
      },
    ])
    toast.success('Person added')
    announceToScreenReader(`${newPersonName} added to the bill. Total ${people.length + 1} people.`)
    trackToolEvent('split_bill_add_person', {
      total_people: people.length + 1,
    })
  }

  // Bulk select all items for a person
  const handleSelectAllItems = (personId: string) => {
    const person = people.find((p) => p.id === personId)
    setItems(
      items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.includes(personId)
          ? item.assignedTo
          : [...item.assignedTo, personId],
      }))
    )
    toast.success('All items assigned!')
    announceToScreenReader(`All ${items.length} items assigned to ${person?.name || 'person'}.`)
  }

  // Bulk deselect all items for a person
  const handleDeselectAllItems = (personId: string) => {
    const person = people.find((p) => p.id === personId)
    setItems(
      items.map((item) => ({
        ...item,
        assignedTo: item.assignedTo.filter((id) => id !== personId),
      }))
    )
    toast.success('All items unassigned!')
    announceToScreenReader(`All items removed from ${person?.name || 'person'}.`)
  }

  // Duplicate an item
  const handleDuplicateItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    if (!item) return

    const duplicated: BillItem = {
      ...item,
      id: String(Date.now()),
      name: `${item.name} (Copy)`,
    }
    setItems([...items, duplicated])
    toast.success('Item duplicated!')
    announceToScreenReader(`${item.name} duplicated. Total ${items.length + 1} items.`)
  }

  // Remove person
  const removePerson = (id: string) => {
    if (people.length <= 2) {
      toast.error('Minimum 2 people required')
      announceToScreenReader('Cannot remove person. Minimum 2 people required.', 'assertive')
      return
    }
    const person = people.find((p) => p.id === id)
    setPeople(people.filter((p) => p.id !== id))
    toast.success('Person removed')
    announceToScreenReader(
      `${person?.name || 'Person'} removed from bill. ${people.length - 1} people remaining.`
    )
    trackToolEvent('split_bill_remove_person', {
      total_people: people.length - 1,
    })
  }

  // Update person name
  const updatePersonName = (id: string, name: string) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, name } : p)))
  }

  // Update person percentage
  const updatePersonPercentage = (id: string, percentage: number) => {
    setPeople(people.map((p) => (p.id === id ? { ...p, percentage } : p)))
  }

  // Calculate total percentage
  const totalPercentage = useMemo(() => {
    return people.reduce((sum, p) => sum + (p.percentage || 0), 0)
  }, [people])

  // Toggle payment status
  const togglePaid = (id: string) => {
    const person = people.find((p) => p.id === id)
    const newStatus = !person?.hasPaid
    setPeople(people.map((p) => (p.id === id ? { ...p, hasPaid: newStatus } : p)))
    if (person) {
      announceToScreenReader(getPaymentStatusMessage(newStatus, person.name))
    }
  }

  // Handle split type change
  const handleSplitTypeChange = (newSplitType: SplitType) => {
    setSplitType(newSplitType)
    if (newSplitType === 'percentage') {
      // Initialize equal percentages
      const equalPercentage = people.length > 0 ? 100 / people.length : 0
      setPeople(people.map((p) => ({ ...p, percentage: equalPercentage })))
      toast.success('Switched to percentage split')
      announceToScreenReader(
        `${getSplitTypeDescription('percentage')}. Each person starts with ${equalPercentage.toFixed(1)}%.`
      )
    } else if (newSplitType === 'items') {
      setPeople(people.map((p) => ({ ...p, percentage: undefined })))
      toast.success('Switched to item-based split')
      announceToScreenReader(getSplitTypeDescription('items'))
    } else {
      // Clear percentages
      setPeople(people.map((p) => ({ ...p, percentage: undefined })))
      toast.success('Switched to equal split')
      announceToScreenReader(getSplitTypeDescription('equal'))
    }
  }

  // Item management functions
  const addItem = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter item name')
      return
    }
    const price = parseFloat(newItemPrice)
    if (Number.isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price')
      return
    }
    const quantity = parseInt(newItemQuantity, 10)
    if (Number.isNaN(quantity) || quantity <= 0) {
      toast.error('Please enter a valid quantity')
      return
    }

    const newItem: BillItem = {
      id: String(Date.now()),
      name: newItemName.trim(),
      price,
      quantity,
      assignedTo: [],
    }

    setItems([...items, newItem])
    setNewItemName('')
    setNewItemPrice('')
    setNewItemQuantity('1')
    toast.success(`Added "${newItem.name}"`)
    announceToScreenReader(
      `Added ${newItem.name}, quantity ${newItem.quantity}, price ${formatCurrencyForScreenReader(newItem.price, currency.code, currency.symbol)}. Total ${items.length + 1} items.`
    )
  }

  const removeItem = (itemId: string) => {
    const item = items.find((i) => i.id === itemId)
    setItems(items.filter((i) => i.id !== itemId))
    toast.success(`Removed "${item?.name}"`)
    announceToScreenReader(`Removed ${item?.name || 'item'}. ${items.length - 1} items remaining.`)
  }

  const toggleItemAssignment = (itemId: string, personId: string) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const isAssigned = item.assignedTo.includes(personId)
          return {
            ...item,
            assignedTo: isAssigned
              ? item.assignedTo.filter((id) => id !== personId)
              : [...item.assignedTo, personId],
          }
        }
        return item
      })
    )
  }

  // Calculate item-based totals
  // Quick tip presets
  const setQuickTip = (percent: number) => {
    setTipPercent(String(percent))
    toast.success(`Tip set to ${percent}%`)
  }

  // Reset all
  const handleReset = () => {
    setBillAmount('100000')
    setTipPercent('15')
    setTaxPercent('10')
    setCurrency(getDefaultCurrency())
    setSplitType('equal')
    setPeople([
      { id: '1', name: 'Person 1', hasPaid: false, percentage: undefined },
      { id: '2', name: 'Person 2', hasPaid: false, percentage: undefined },
    ])
    setItems([])
    setNewItemName('')
    setNewItemPrice('')
    setNewItemQuantity('1')
    toast.success('Reset to defaults')
    trackToolEvent('split_bill_reset', {})
  }

  // Generate shareable summary
  const generateSummary = () => {
    return exportAsText({
      title: billTitle || undefined,
      billAmount: calculations.bill,
      tipAmount: calculations.tipAmount,
      tipPercent,
      taxAmount: calculations.taxAmount,
      taxPercent,
      total: calculations.total,
      currency,
      people: people.map((p) => ({
        name: p.name,
        amount: calculations.peopleWithAmounts.find((pa) => pa.id === p.id)?.amount || 0,
        hasPaid: p.hasPaid,
        percentage: p.percentage,
      })),
      splitType,
      items: splitType === 'items' ? items : undefined,
    })
  }

  // Export bill as CSV
  const handleExportCSV = () => {
    downloadCSV(
      {
        title: billTitle || 'Split Bill',
        billAmount: calculations.bill,
        tipAmount: calculations.tipAmount,
        tipPercent,
        taxAmount: calculations.taxAmount,
        taxPercent,
        total: calculations.total,
        currency,
        people: people.map((p) => ({
          name: p.name,
          amount: calculations.peopleWithAmounts.find((pa) => pa.id === p.id)?.amount || 0,
          hasPaid: p.hasPaid,
          percentage: p.percentage,
        })),
        splitType,
        items: splitType === 'items' ? items : undefined,
        createdAt: new Date().toISOString(),
      },
      `split-bill-${new Date().toISOString().split('T')[0]}.csv`
    )
    toast.success('Bill exported as CSV! 📊')
    announceToScreenReader(
      `Bill exported as CSV file with ${people.length} people and ${calculations.total.toFixed(2)} ${currency.code} total.`
    )
    trackToolEvent('split_bill_export', { format: 'csv' })
  }

  // Copy payment request for a specific person
  const handleCopyPaymentRequest = async (personId: string) => {
    const person = people.find((p) => p.id === personId)
    if (!person) return

    const amount = calculations.peopleWithAmounts.find((pa) => pa.id === personId)?.amount || 0
    const request = generatePaymentRequest(
      person.name,
      amount,
      currency,
      organizerName || undefined,
      organizerBankAccount || undefined,
      organizerBankName || undefined
    )

    const success = await copyToClipboard(request)
    if (success) {
      toast.success(`Payment request for ${person.name} copied! 💸`)
      announceToScreenReader(
        `Payment request for ${person.name} copied to clipboard. Amount: ${formatCurrencyForScreenReader(amount, currency.code, currency.symbol)}`
      )
      trackToolEvent('split_bill_payment_request', { person: personId })
    }
  }

  // Save current bill as template
  const handleSaveTemplate = () => {
    const templateName = prompt('Enter a name for this template:')
    if (!templateName) return

    const templateId = saveBillTemplate({
      name: templateName,
      description: `${people.length} people, ${currency.code}`,
      billAmount,
      tipPercent,
      taxPercent,
      currency: currency.code,
      people: people.map((p) => ({ name: p.name, percentage: p.percentage })),
      splitType,
    })

    if (templateId) {
      toast.success(`Template "${templateName}" saved! 💾`)
      announceToScreenReader(
        `Template ${templateName} saved with ${people.length} people and ${splitType} split type.`
      )
      trackToolEvent('split_bill_template_saved', { template_id: templateId })
    }
  }

  // Load template
  const handleLoadTemplate = (template: {
    id: string
    name: string
    billAmount: string
    tipPercent: string
    taxPercent: string
    currency: string
    people: Array<{ name: string; percentage?: number }>
    splitType: 'equal' | 'percentage' | 'items'
  }) => {
    // Apply template data
    setBillAmount(template.billAmount)
    setTipPercent(template.tipPercent)
    setTaxPercent(template.taxPercent)
    setSplitType(template.splitType)

    // Find and set currency
    const templateCurrency = CURRENCIES.find((c) => c.code === template.currency)
    if (templateCurrency) {
      setCurrency(templateCurrency)
    }

    // Set people
    const loadedPeople: Person[] = template.people.map((p, index) => ({
      id: `person-${Date.now()}-${index}`,
      name: p.name,
      hasPaid: false,
      percentage: p.percentage,
    }))
    setPeople(loadedPeople)

    // Clear items when loading template
    setItems([])

    setHasUnsavedChanges(true)
    announceToScreenReader(
      `Template ${template.name} loaded with ${template.people.length} people and ${template.splitType} split type.`
    )
    trackToolEvent('split_bill_template_loaded', { template_id: template.id })
  }

  // Clear form
  const handleClearForm = () => {
    setNewItemName('')
    setNewItemPrice('')
    setNewItemQuantity('1')
  }

  // Share summary
  const handleShare = async () => {
    const summary = generateSummary()

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bill Split Summary',
          text: summary,
        })
        toast.success('Shared successfully 📤')
        trackToolEvent('split_bill_share', { total_people: people.length })
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          await navigator.clipboard.writeText(summary)
          toast.success('Copied to clipboard 📋')
          trackToolEvent('split_bill_copy', { total_people: people.length })
        }
      }
    } else {
      await navigator.clipboard.writeText(summary)
      toast.success('Summary copied to clipboard 📋')
      trackToolEvent('split_bill_copy', { total_people: people.length })
    }
  }

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onAddPerson: addPerson,
    onAddItem: splitType === 'items' ? addItem : undefined,
    onReset: handleReset,
    onShare: handleShare,
    onSwitchToEqual: () => handleSplitTypeChange('equal'),
    onSwitchToPercentage: () => handleSplitTypeChange('percentage'),
    onSwitchToItems: () => handleSplitTypeChange('items'),
    onClearForm: handleClearForm,
    onExport: handleExportCSV,
    enabled: true,
  })

  // Handle receipt data extraction
  const handleReceiptData = (data: {
    items?: Array<{ name: string; price: number; quantity: number }>
    subtotal?: number
    tax?: number
    tip?: number
    total?: number
  }) => {
    const appliedFields: string[] = []

    // If we have line items, switch to items mode and populate them
    if (data.items && data.items.length > 0) {
      setSplitType('items')
      const newItems: BillItem[] = data.items.map((item, index) => ({
        id: String(Date.now() + index),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        assignedTo: [],
      }))
      setItems(newItems)
      appliedFields.push(`${data.items.length} items`)

      // Clear bill amount since it will be calculated from items
      setBillAmount('')
    } else {
      // Original logic for non-item mode
      // If we have a subtotal, use it as the bill amount
      if (data.subtotal !== undefined) {
        setBillAmount(String(data.subtotal))
        appliedFields.push('subtotal')
      } else if (data.total !== undefined) {
        // If no subtotal but we have total, use it
        setBillAmount(String(data.total))
        appliedFields.push('total as subtotal')
      }
    }

    // If we have tax amount, calculate percentage from subtotal
    if (data.tax !== undefined && data.subtotal !== undefined && data.subtotal > 0) {
      const taxPercent = (data.tax / data.subtotal) * 100
      if (taxPercent >= 0 && taxPercent <= 50) {
        // Reasonable tax range
        setTaxPercent(String(taxPercent.toFixed(1)))
        appliedFields.push('tax')
      }
    } else if (data.tax !== undefined && data.total !== undefined && data.total > 0) {
      // Calculate tax percentage from total if no subtotal
      const taxPercent = (data.tax / data.total) * 100
      if (taxPercent >= 0 && taxPercent <= 30) {
        setTaxPercent(String(taxPercent.toFixed(1)))
        appliedFields.push('tax (estimated)')
      }
    }

    // If we have tip amount, calculate percentage from subtotal
    if (data.tip !== undefined && data.subtotal !== undefined && data.subtotal > 0) {
      const tipPct = (data.tip / data.subtotal) * 100
      if (tipPct >= 0 && tipPct <= 40) {
        // Reasonable tip range
        setTipPercent(String(tipPct.toFixed(1)))
        appliedFields.push('tip')
      }
    } else if (data.tip !== undefined && data.total !== undefined && data.total > 0) {
      // Calculate tip percentage from total if no subtotal
      const tipPct = (data.tip / data.total) * 100
      if (tipPct >= 0 && tipPct <= 30) {
        setTipPercent(String(tipPct.toFixed(1)))
        appliedFields.push('tip (estimated)')
      }
    }

    // Show success message with applied fields
    if (appliedFields.length > 0) {
      toast.success(`Receipt processed! Applied: ${appliedFields.join(', ')}`, {
        duration: 5000,
        description: 'Review the values and adjust if needed',
      })
      trackToolEvent('split_bill_ocr_success', {
        fields_applied: appliedFields.length,
      })
    } else {
      toast.warning('Receipt processed but no valid amounts found', {
        description: 'Please enter the amounts manually',
      })
      trackToolEvent('split_bill_ocr_error', { reason: 'no_valid_amounts' })
    }
  }

  // Create shareable bill
  const handleCreateShareableBill = async () => {
    // Validation
    if (!billTitle.trim()) {
      toast.error('Please enter a bill title')
      return
    }
    if (!organizerName.trim()) {
      toast.error('Please enter organizer name')
      return
    }
    if (people.length < 2) {
      toast.error('Please add at least 2 participants')
      return
    }
    if (people.some((p) => !p.name.trim())) {
      toast.error('All participants must have names')
      return
    }

    // Validate percentages if in percentage mode
    if (splitType === 'percentage') {
      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast.error(`Percentages must total 100% (currently ${totalPercentage.toFixed(1)}%)`)
        return
      }
    }

    setIsCreating(true)

    try {
      const totalAmount = calculations.total

      const participants: CreateParticipantData[] = people.map((person) => {
        const personAmount =
          calculations.peopleWithAmounts.find((pa) => pa.id === person.id)?.amount || 0
        return {
          name: person.name,
          share_amount: personAmount,
        }
      })

      const result = await createBill({
        title: billTitle,
        description: billDescription || undefined,
        total_amount: totalAmount,
        currency: currency.code,
        organizer_name: organizerName,
        organizer_bank_account: organizerBankAccount || undefined,
        organizer_bank_name: organizerBankName || undefined,
        split_type: splitType === 'percentage' ? 'custom' : 'equal',
        participants,
      })

      toast.success('Bill created successfully! 🎉')
      trackToolEvent('split_bill_share', {
        total_amount: totalAmount,
        participants: people.length,
        currency: currency.code,
      })

      // Redirect to the bill page
      router.push(`/split-bill/${result.bill.id}`)
    } catch (error) {
      console.error('Error creating bill:', error)
      toast.error('Failed to create bill. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <TooltipProvider>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#split-calculator"
        className={css({
          position: 'absolute',
          left: '-9999px',
          zIndex: '999',
          padding: '4',
          bg: 'emerald.600',
          color: 'white',
          fontWeight: 'bold',
          rounded: 'md',
          _focus: {
            left: '4',
            top: '4',
          },
        })}
      >
        Skip to calculator
      </a>
      <main
        id="split-calculator"
        aria-label="Split bill calculator"
        className={css({
          mx: 'auto',
          maxW: '1400px',
          w: 'full',
          px: { base: '4', sm: '6', md: '8' },
          py: { base: '6', sm: '8', md: '10' },
          display: 'flex',
          flexDirection: 'column',
          gap: { base: '4', sm: '6', md: '8' },
        })}
      >
        {/* Header */}
        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '3',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: { base: '3', sm: '4' },
            })}
          >
            <div
              className={css({
                animation: 'pulse 2s infinite',
                rounded: { base: 'xl', sm: '2xl' },
                bgGradient: 'to-br',
                gradientFrom: 'green.600',
                gradientVia: 'emerald.600',
                gradientTo: 'teal.700',
                p: { base: '2.5', sm: '4' },
                shadow: '2xl',
                boxShadow: '0 25px 50px rgba(34, 197, 94, 0.6)',
              })}
            >
              <Users
                className={css({
                  h: { base: '6', sm: '8' },
                  w: { base: '6', sm: '8' },
                  color: 'white',
                })}
              />
            </div>
            <div>
              <h1
                className={css({
                  bgGradient: 'to-r',
                  gradientFrom: 'green.300',
                  gradientVia: 'emerald.400',
                  gradientTo: 'teal.300',
                  bgClip: 'text',
                  fontSize: { base: '2xl', sm: '3xl', md: '4xl', lg: '5xl' },
                  fontWeight: 'extrabold',
                  textShadow: '0 10px 15px rgba(0, 0, 0, 0.1)',
                })}
                style={{
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Split Bill Calculator
              </h1>
              <p
                className={css({
                  fontSize: { base: 'sm', sm: 'base', md: 'lg' },
                  color: 'gray.200',
                })}
              >
                Split bills fairly with tip and tax calculations
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div
            className={css({
              display: 'flex',
              gap: '2',
              justifyContent: 'center',
              flexWrap: 'wrap',
            })}
          >
            <Button
              onClick={() => setMode('calculator')}
              variant={mode === 'calculator' ? 'default' : 'outline'}
              size="sm"
              className={css({
                flex: { base: '1', sm: 'initial' },
              })}
            >
              Calculator
            </Button>
            <Button
              onClick={() => setMode('create')}
              variant={mode === 'create' ? 'default' : 'outline'}
              size="sm"
              className={css({
                flex: { base: '1', sm: 'initial' },
                display: 'flex',
                alignItems: 'center',
                gap: '2',
              })}
            >
              <Link2 className={css({ h: '4', w: '4' })} />
              Create Shareable Bill
            </Button>
            <Link href="/tools/split-bill/history">
              <Button
                variant="outline"
                size="sm"
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                })}
              >
                <Clock className={css({ h: '4', w: '4' })} />
                View History
              </Button>
            </Link>
          </div>
        </div>

        {/* Summary Stats */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'green.500/30',
            bg: 'rgba(34, 197, 94, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            shadow: 'xl',
            boxShadow: '0 20px 25px rgba(34, 197, 94, 0.2)',
            backdropFilter: 'blur(16px)',
          })}
        >
          <div
            className={css({
              display: 'grid',
              gridTemplateColumns: {
                base: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: '4',
            })}
          >
            <div className={css({ textAlign: 'center' })}>
              <div
                className={css({
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  color: 'green.400',
                })}
                aria-live="polite"
                aria-atomic="true"
              >
                {currency.symbol}
                {formatCurrency(calculations.total)}
              </div>
              <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Total Bill</div>
            </div>
            <div className={css({ textAlign: 'center' })}>
              <div
                className={css({
                  fontSize: '3xl',
                  fontWeight: 'bold',
                  color: 'emerald.400',
                })}
                aria-live="polite"
                aria-atomic="true"
              >
                {currency.symbol}
                {formatCurrency(calculations.perPerson)}
              </div>
              <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Per Person</div>
            </div>
            <div className={css({ textAlign: 'center' })}>
              <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'teal.400' })}>
                {people.length}
              </div>
              <div className={css({ fontSize: 'sm', color: 'gray.400' })}>People</div>
            </div>
            <div className={css({ textAlign: 'center' })}>
              <div className={css({ fontSize: '3xl', fontWeight: 'bold', color: 'green.400' })}>
                {calculations.paidCount}/{people.length}
              </div>
              <div className={css({ fontSize: 'sm', color: 'gray.400' })}>Paid</div>
            </div>
          </div>
        </div>

        {/* Receipt Scanner - Full Width */}
        {mode === 'calculator' && <ReceiptScanner onDataExtracted={handleReceiptData} />}

        {/* Create Shareable Bill Form */}
        {mode === 'create' && (
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'green.500/20',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '4', sm: '5', md: '6' },
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4',
            })}
          >
            <h2
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'green.300',
              })}
            >
              Bill Information
            </h2>

            <Field>
              <FieldLabel
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Bill Title *
              </FieldLabel>
              <FieldInput
                type="text"
                value={billTitle}
                onChange={(e) => setBillTitle(e.target.value)}
                placeholder="e.g., Dinner at Restaurant"
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  fontSize: 'base',
                  _focus: {
                    borderColor: 'green.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(34, 197, 94, 0.3)',
                  },
                })}
              />
            </Field>

            <Field>
              <FieldLabel
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Description (Optional)
              </FieldLabel>
              <textarea
                value={billDescription}
                onChange={(e) => setBillDescription(e.target.value)}
                placeholder="Add notes about this bill..."
                rows={3}
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  fontSize: 'base',
                  w: 'full',
                  _focus: {
                    borderColor: 'green.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(34, 197, 94, 0.3)',
                  },
                })}
              />
            </Field>

            <Field>
              <FieldLabel
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Organizer Name *
              </FieldLabel>
              <FieldInput
                type="text"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                placeholder="Your name"
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  fontSize: 'base',
                  _focus: {
                    borderColor: 'green.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(34, 197, 94, 0.3)',
                  },
                })}
              />
            </Field>

            <Field>
              <FieldLabel
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Bank Account Number (Optional)
              </FieldLabel>
              <FieldInput
                type="text"
                value={organizerBankAccount}
                onChange={(e) => setOrganizerBankAccount(e.target.value)}
                placeholder="e.g., 1234567890"
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  fontSize: 'base',
                  _focus: {
                    borderColor: 'green.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(34, 197, 94, 0.3)',
                  },
                })}
              />
            </Field>

            <Field>
              <FieldLabel
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Bank Name (Optional)
              </FieldLabel>
              <FieldInput
                type="text"
                value={organizerBankName}
                onChange={(e) => setOrganizerBankName(e.target.value)}
                placeholder="e.g., Bank of America"
                className={css({
                  rounded: 'lg',
                  border: '2px solid',
                  borderColor: 'gray.700',
                  bg: 'rgba(17, 24, 39, 0.7)',
                  px: '4',
                  py: '2',
                  color: 'white',
                  fontSize: 'base',
                  _focus: {
                    borderColor: 'green.500',
                    outline: 'none',
                    ring: '2px',
                    ringColor: 'rgba(34, 197, 94, 0.3)',
                  },
                })}
              />
            </Field>
          </div>
        )}

        {/* Bill Details */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'green.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
          })}
        >
          <h2
            className={css({
              fontSize: { base: 'lg', sm: 'xl' },
              fontWeight: 'bold',
              color: 'green.300',
            })}
          >
            Bill Details
          </h2>

          <Field>
            <FieldLabel
              className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
            >
              Currency
            </FieldLabel>
            <select
              value={currency.code}
              onChange={(e) => {
                const selected = CURRENCIES.find((c) => c.code === e.target.value)
                if (selected) {
                  setCurrency(selected)
                  toast.success(`Currency changed to ${selected.name}`)
                  trackToolEvent('split_bill_currency_change', {
                    currency: selected.code,
                  })
                }
              }}
              className={css({
                rounded: 'lg',
                border: '2px solid',
                borderColor: 'gray.700',
                bg: 'rgba(17, 24, 39, 0.7)',
                px: '4',
                py: '2',
                color: 'white',
                fontSize: 'base',
                fontWeight: 'medium',
                cursor: 'pointer',
                _focus: {
                  borderColor: 'green.500',
                  outline: 'none',
                  ring: '2px',
                  ringColor: 'rgba(34, 197, 94, 0.3)',
                },
              })}
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Currency Converter Toggle */}
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              p: '3',
              rounded: 'lg',
              bg: 'blue.500/10',
              border: '1px solid',
              borderColor: 'blue.500/30',
            })}
          >
            <input
              type="checkbox"
              id="currency-converter-toggle"
              checked={showCurrencyConverter}
              onChange={(e) => {
                setShowCurrencyConverter(e.target.checked)
                trackToolEvent('split_bill_currency_converter_toggled', {
                  enabled: e.target.checked,
                })
              }}
              className={css({
                h: '4',
                w: '4',
                rounded: 'sm',
                border: '2px solid',
                borderColor: 'blue.500',
                bg: 'transparent',
                cursor: 'pointer',
                _checked: { bg: 'blue.500' },
              })}
            />
            <label
              htmlFor="currency-converter-toggle"
              className={css({
                fontSize: 'sm',
                color: 'blue.300',
                cursor: 'pointer',
                fontWeight: 'medium',
              })}
            >
              💱 Show Currency Converter
            </label>
          </div>

          {/* Currency Converter */}
          {showCurrencyConverter && (
            <CurrencyConverter
              baseCurrency={currency.code}
              targetCurrency={targetCurrency}
              onBaseCurrencyChange={(newCurrency) => {
                const curr = CURRENCIES.find((c) => c.code === newCurrency)
                if (curr) setCurrency(curr)
              }}
              onTargetCurrencyChange={setTargetCurrency}
              amounts={[
                { label: 'Bill Amount', value: parseFloat(billAmount) || 0 },
                { label: 'Total with Tax & Tip', value: calculations.total },
              ]}
            />
          )}

          <Field>
            <FieldLabel
              className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
            >
              Bill Amount ({currency.symbol})
            </FieldLabel>
            <FieldInput
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              min="0"
              step="0.01"
              className={css({
                rounded: 'lg',
                border: '2px solid',
                borderColor: 'gray.700',
                bg: 'rgba(17, 24, 39, 0.7)',
                px: '4',
                py: '2',
                color: 'white',
                fontSize: 'lg',
                fontWeight: 'semibold',
                _focus: {
                  borderColor: 'green.500',
                  outline: 'none',
                  ring: '2px',
                  ringColor: 'rgba(34, 197, 94, 0.3)',
                },
              })}
            />
          </Field>

          <Field>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: '2',
              })}
            >
              <FieldLabel
                className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
              >
                Tip (%)
              </FieldLabel>
              <div className={css({ display: 'flex', gap: '1' })}>
                {[10, 15, 18, 20].map((percent) => (
                  <button
                    type="button"
                    key={percent}
                    onClick={() => setQuickTip(percent)}
                    className={css({
                      px: '2',
                      py: '1',
                      fontSize: 'xs',
                      rounded: 'md',
                      bg: tipPercent === String(percent) ? 'green.600' : 'gray.700',
                      color: 'white',
                      transition: 'all 0.2s',
                      _hover: { bg: 'green.500' },
                    })}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
            </div>
            <FieldInput
              type="number"
              value={tipPercent}
              onChange={(e) => setTipPercent(e.target.value)}
              min="0"
              step="0.1"
              className={css({
                rounded: 'lg',
                border: '2px solid',
                borderColor: 'gray.700',
                bg: 'rgba(17, 24, 39, 0.7)',
                px: '4',
                py: '2',
                color: 'white',
                _focus: {
                  borderColor: 'green.500',
                  outline: 'none',
                  ring: '2px',
                  ringColor: 'rgba(34, 197, 94, 0.3)',
                },
              })}
            />
            <div className={css({ mt: '1', fontSize: 'xs', color: 'gray.400' })}>
              Tip Amount: {currency.symbol}
              {formatCurrency(calculations.tipAmount)}
            </div>
          </Field>

          <Field>
            <FieldLabel
              className={css({ fontSize: 'sm', fontWeight: 'medium', color: 'gray.300' })}
            >
              Tax (%)
            </FieldLabel>
            <FieldInput
              type="number"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
              min="0"
              step="0.1"
              className={css({
                rounded: 'lg',
                border: '2px solid',
                borderColor: 'gray.700',
                bg: 'rgba(17, 24, 39, 0.7)',
                px: '4',
                py: '2',
                color: 'white',
                _focus: {
                  borderColor: 'green.500',
                  outline: 'none',
                  ring: '2px',
                  ringColor: 'rgba(34, 197, 94, 0.3)',
                },
              })}
            />
            <div className={css({ mt: '1', fontSize: 'xs', color: 'gray.400' })}>
              Tax Amount: {currency.symbol}
              {formatCurrency(calculations.taxAmount)}
            </div>
          </Field>

          <div
            className={css({
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'green.500/30',
              bg: 'rgba(34, 197, 94, 0.1)',
              p: '4',
            })}
          >
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                mb: '2',
              })}
            >
              <span className={css({ fontSize: 'sm', color: 'gray.300' })}>Subtotal:</span>
              <span
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'gray.200',
                })}
              >
                {currency.symbol}
                {formatCurrency(calculations.bill)}
              </span>
            </div>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                mb: '2',
              })}
            >
              <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                Tip ({tipPercent}%):
              </span>
              <span
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'green.400',
                })}
              >
                +{currency.symbol}
                {formatCurrency(calculations.tipAmount)}
              </span>
            </div>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                mb: '2',
                pb: '2',
                borderBottom: '1px solid',
                borderColor: 'green.500/20',
              })}
            >
              <span className={css({ fontSize: 'sm', color: 'gray.300' })}>
                Tax ({taxPercent}%):
              </span>
              <span
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'green.400',
                })}
              >
                +{currency.symbol}
                {formatCurrency(calculations.taxAmount)}
              </span>
            </div>
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
              })}
            >
              <span
                className={css({
                  fontSize: 'base',
                  fontWeight: 'bold',
                  color: 'white',
                })}
              >
                Total:
              </span>
              <span
                className={css({
                  fontSize: 'base',
                  fontWeight: 'bold',
                  color: 'green.400',
                })}
              >
                {currency.symbol}
                {formatCurrency(calculations.total)}
              </span>
            </div>
          </div>
        </div>

        {/* People Management */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'emerald.500/20',
            bg: 'rgba(17, 24, 39, 0.5)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
          })}
        >
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            })}
          >
            <h2
              id="people-section"
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'emerald.300',
              })}
            >
              People ({people.length})
            </h2>
            <Button
              onClick={addPerson}
              size="sm"
              aria-label={`Add person to bill. Currently ${people.length} people.`}
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
              })}
            >
              <Plus className={css({ h: '4', w: '4' })} aria-hidden="true" />
              Add Person
            </Button>
          </div>

          {/* Split Type Toggle */}
          <fieldset
            aria-label="Split type selection"
            className={css({
              display: 'flex',
              gap: '2',
              p: '2',
              bg: 'rgba(17, 24, 39, 0.7)',
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'gray.700',
            })}
          >
            <button
              type="button"
              onClick={() => handleSplitTypeChange('equal')}
              aria-pressed={splitType === 'equal'}
              aria-label={getSplitTypeDescription('equal')}
              className={css({
                flex: '1',
                py: '2',
                px: '3',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                transition: 'all 0.2s',
                bg: splitType === 'equal' ? 'emerald.600' : 'transparent',
                color: splitType === 'equal' ? 'white' : 'gray.400',
                _hover: {
                  bg: splitType === 'equal' ? 'emerald.500' : 'rgba(16, 185, 129, 0.1)',
                },
              })}
            >
              Equal Split
            </button>
            <button
              type="button"
              onClick={() => handleSplitTypeChange('percentage')}
              aria-pressed={splitType === 'percentage'}
              aria-label={getSplitTypeDescription('percentage')}
              className={css({
                flex: '1',
                py: '2',
                px: '3',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                transition: 'all 0.2s',
                bg: splitType === 'percentage' ? 'emerald.600' : 'transparent',
                color: splitType === 'percentage' ? 'white' : 'gray.400',
                _hover: {
                  bg: splitType === 'percentage' ? 'emerald.500' : 'rgba(16, 185, 129, 0.1)',
                },
              })}
            >
              Percentage Split
            </button>
            <button
              type="button"
              onClick={() => handleSplitTypeChange('items')}
              aria-pressed={splitType === 'items'}
              aria-label={getSplitTypeDescription('items')}
              className={css({
                flex: '1',
                py: '2',
                px: '3',
                rounded: 'md',
                fontSize: 'sm',
                fontWeight: 'medium',
                transition: 'all 0.2s',
                bg: splitType === 'items' ? 'emerald.600' : 'transparent',
                color: splitType === 'items' ? 'white' : 'gray.400',
                _hover: {
                  bg: splitType === 'items' ? 'emerald.500' : 'rgba(16, 185, 129, 0.1)',
                },
              })}
            >
              <span
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1',
                  justifyContent: 'center',
                })}
              >
                <Sparkles className={css({ h: '3', w: '3' })} aria-hidden="true" />
                Item-Based
              </span>
            </button>
          </fieldset>

          {/* Item-Based Split UI */}
          {splitType === 'items' && (
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'purple.500/30',
                bg: 'rgba(147, 51, 234, 0.05)',
                p: '4',
                display: 'flex',
                flexDirection: 'column',
                gap: '3',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2',
                  fontSize: 'sm',
                  fontWeight: 'medium',
                  color: 'purple.300',
                })}
              >
                <Sparkles className={css({ h: '4', w: '4' })} />
                Add Bill Items
              </div>

              {/* Add Item Form */}
              <div
                className={css({
                  display: 'grid',
                  gridTemplateColumns: { base: '1fr', sm: '2fr 1fr 1fr auto' },
                  gap: '2',
                  alignItems: 'end',
                })}
              >
                <Field>
                  <FieldLabel
                    htmlFor="item-name-input"
                    className={css({ fontSize: 'xs', color: 'gray.400' })}
                  >
                    Item Name
                  </FieldLabel>
                  <FieldInput
                    id="item-name-input"
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="e.g., Burger"
                    aria-label="Item name"
                    aria-required="true"
                    className={css({
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'rgba(17, 24, 39, 0.7)',
                      px: '3',
                      py: '2',
                      color: 'white',
                      fontSize: 'sm',
                      _focus: {
                        borderColor: 'purple.500',
                        outline: 'none',
                        ring: '1px',
                        ringColor: 'rgba(147, 51, 234, 0.3)',
                      },
                    })}
                  />
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="item-price-input"
                    className={css({ fontSize: 'xs', color: 'gray.400' })}
                  >
                    Price
                  </FieldLabel>
                  <FieldInput
                    id="item-price-input"
                    type="number"
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    aria-label="Item price"
                    aria-required="true"
                    className={css({
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'rgba(17, 24, 39, 0.7)',
                      px: '3',
                      py: '2',
                      color: 'white',
                      fontSize: 'sm',
                      _focus: {
                        borderColor: 'purple.500',
                        outline: 'none',
                        ring: '1px',
                        ringColor: 'rgba(147, 51, 234, 0.3)',
                      },
                    })}
                  />
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="item-quantity-input"
                    className={css({ fontSize: 'xs', color: 'gray.400' })}
                  >
                    Qty
                  </FieldLabel>
                  <FieldInput
                    id="item-quantity-input"
                    type="number"
                    value={newItemQuantity}
                    onChange={(e) => setNewItemQuantity(e.target.value)}
                    min="1"
                    aria-label="Item quantity"
                    aria-required="true"
                    className={css({
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'rgba(17, 24, 39, 0.7)',
                      px: '3',
                      py: '2',
                      color: 'white',
                      fontSize: 'sm',
                      _focus: {
                        borderColor: 'purple.500',
                        outline: 'none',
                        ring: '1px',
                        ringColor: 'rgba(147, 51, 234, 0.3)',
                      },
                    })}
                  />
                </Field>
                <Button
                  onClick={addItem}
                  size="sm"
                  className={css({
                    bg: 'purple.600',
                    _hover: { bg: 'purple.500' },
                  })}
                >
                  <Plus className={css({ h: '4', w: '4' })} />
                </Button>
              </div>

              {/* Items List */}
              {items.length > 0 && (
                <>
                  {/* Bulk Operations for Items */}
                  <div
                    className={css({
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '2',
                      mt: '2',
                      p: '2',
                      bg: 'gray.800/30',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    <span className={css({ fontSize: 'xs', color: 'gray.400', mr: 'auto' })}>
                      Bulk assign:
                    </span>
                    {people.map((person) => (
                      <div key={person.id} className={css({ display: 'flex', gap: '1' })}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleSelectAllItems(person.id)}
                              size="sm"
                              variant="ghost"
                              className={css({
                                h: '6',
                                px: '2',
                                fontSize: 'xs',
                                color: 'purple.400',
                                _hover: { bg: 'purple.500/20' },
                              })}
                            >
                              {person.name} ✓
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Assign all items to {person.name}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              onClick={() => handleDeselectAllItems(person.id)}
                              size="sm"
                              variant="ghost"
                              className={css({
                                h: '6',
                                px: '2',
                                fontSize: 'xs',
                                color: 'gray.500',
                                _hover: { bg: 'gray.700' },
                              })}
                            >
                              ✗
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Unassign all items from {person.name}</TooltipContent>
                        </Tooltip>
                      </div>
                    ))}
                  </div>

                  <div
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2',
                      mt: '2',
                    })}
                  >
                    {items.map((item) => (
                      <SwipeableItem
                        key={item.id}
                        onDelete={() => removeItem(item.id)}
                        disabled={!isTouchDevice}
                        deleteLabel={`Remove ${item.name}`}
                        className={css({
                          rounded: 'md',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          bg: 'rgba(17, 24, 39, 0.5)',
                          p: '3',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2',
                        })}
                      >
                        <div
                          className={css({
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          })}
                        >
                          <div className={css({ flex: '1' })}>
                            <div
                              className={css({
                                fontSize: 'sm',
                                fontWeight: 'medium',
                                color: 'white',
                              })}
                            >
                              {item.name} × {item.quantity}
                            </div>
                            <div className={css({ fontSize: 'xs', color: 'gray.400' })}>
                              {currency.symbol}
                              {formatCurrency(item.price)} each = {currency.symbol}
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                          <div className={css({ display: 'flex', gap: '1' })}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateItem(item.id)}
                                  className={css({
                                    color: 'blue.400',
                                    _hover: { color: 'blue.300' },
                                  })}
                                >
                                  <Copy className={css({ h: '4', w: '4' })} />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>Duplicate item</TooltipContent>
                            </Tooltip>
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className={css({
                                color: 'red.400',
                                _hover: { color: 'red.300' },
                              })}
                            >
                              <X className={css({ h: '4', w: '4' })} />
                            </button>
                          </div>
                        </div>

                        {/* Assign to people */}
                        <div>
                          <div className={css({ fontSize: 'xs', color: 'gray.400', mb: '1' })}>
                            Assigned to:
                          </div>
                          <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '1' })}>
                            {people.map((person) => {
                              const isAssigned = item.assignedTo.includes(person.id)
                              return (
                                <button
                                  key={person.id}
                                  type="button"
                                  onClick={() => toggleItemAssignment(item.id, person.id)}
                                  className={css({
                                    px: '2',
                                    py: '1',
                                    rounded: 'md',
                                    fontSize: 'xs',
                                    fontWeight: 'medium',
                                    transition: 'all 0.2s',
                                    bg: isAssigned ? 'purple.600' : 'gray.700',
                                    color: isAssigned ? 'white' : 'gray.400',
                                    border: '1px solid',
                                    borderColor: isAssigned ? 'purple.500' : 'gray.600',
                                    _hover: {
                                      bg: isAssigned ? 'purple.500' : 'gray.600',
                                    },
                                  })}
                                >
                                  {person.name} {isAssigned && '✓'}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </SwipeableItem>
                    ))}
                  </div>
                </>
              )}

              {items.length === 0 && (
                <div
                  className={css({
                    fontSize: 'xs',
                    color: 'gray.500',
                    textAlign: 'center',
                    py: '2',
                  })}
                >
                  No items added yet. Add items from your bill above.
                </div>
              )}
            </div>
          )}

          {/* Percentage Validation Warning */}
          {splitType === 'percentage' && Math.abs(totalPercentage - 100) > 0.01 && (
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'yellow.500/40',
                bg: 'rgba(234, 179, 8, 0.1)',
                p: '3',
              })}
            >
              <div
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'yellow.400',
                  mb: '1',
                })}
              >
                ⚠️ Invalid Split
              </div>
              <div
                className={css({
                  fontSize: 'xs',
                  color: 'gray.400',
                })}
              >
                Percentages must total 100% (currently {totalPercentage.toFixed(1)}%)
              </div>
            </div>
          )}

          {splitType === 'percentage' && Math.abs(totalPercentage - 100) <= 0.01 && (
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'green.500/30',
                bg: 'rgba(34, 197, 94, 0.1)',
                p: '3',
              })}
            >
              <div
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'green.400',
                })}
              >
                ✅ Valid Split (100%)
              </div>
            </div>
          )}

          {/* Swipe hint for mobile users */}
          {isTouchDevice && showSwipeHint && (
            <div className={css({ display: 'flex', justifyContent: 'center', mb: '2' })}>
              <SwipeHint />
            </div>
          )}

          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '3',
              maxH: '500px',
              overflowY: 'auto',
              pr: '2',
            })}
          >
            {people.map((person) => (
              <SwipeableItem
                key={person.id}
                onDelete={() => removePerson(person.id)}
                disabled={!isTouchDevice || people.length <= 2}
                deleteLabel={`Remove ${person.name}`}
                className={css({
                  rounded: 'lg',
                  border: '1px solid',
                  borderColor: person.hasPaid ? 'green.500/40' : 'gray.700',
                  bg: person.hasPaid ? 'rgba(34, 197, 94, 0.1)' : 'rgba(17, 24, 39, 0.5)',
                  p: '3',
                  transition: 'all 0.2s',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    gap: '2',
                    alignItems: 'center',
                  })}
                >
                  <FieldInput
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePersonName(person.id, e.target.value)}
                    aria-label={`Person name: ${person.name}`}
                    className={css({
                      flex: '1',
                      rounded: 'md',
                      border: '1px solid',
                      borderColor: 'gray.600',
                      bg: 'rgba(17, 24, 39, 0.7)',
                      px: '3',
                      py: '1.5',
                      color: 'white',
                      fontSize: 'sm',
                      _focus: {
                        borderColor: 'emerald.500',
                        outline: 'none',
                        ring: '1px',
                        ringColor: 'rgba(16, 185, 129, 0.3)',
                      },
                    })}
                  />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => togglePaid(person.id)}
                        aria-label={
                          person.hasPaid
                            ? `Mark ${person.name} as unpaid`
                            : `Mark ${person.name} as paid`
                        }
                        aria-pressed={person.hasPaid}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          h: '8',
                          w: '8',
                          rounded: 'md',
                          bg: person.hasPaid ? 'green.600' : 'gray.700',
                          color: 'white',
                          transition: 'all 0.2s',
                          _hover: {
                            bg: person.hasPaid ? 'green.500' : 'gray.600',
                          },
                        })}
                      >
                        {person.hasPaid ? (
                          <Check className={css({ h: '4', w: '4' })} aria-hidden="true" />
                        ) : (
                          <CurrencyIcon className={css({ h: '4', w: '4' })} aria-hidden="true" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {person.hasPaid ? 'Mark as unpaid' : 'Mark as paid'}
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => removePerson(person.id)}
                        disabled={people.length <= 2}
                        aria-label={`Remove ${person.name} from bill`}
                        aria-disabled={people.length <= 2}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          h: '8',
                          w: '8',
                          rounded: 'md',
                          bg: 'red.600',
                          color: 'white',
                          transition: 'all 0.2s',
                          _hover: { bg: 'red.500' },
                          _disabled: {
                            opacity: 0.5,
                            cursor: 'not-allowed',
                          },
                        })}
                      >
                        <X className={css({ h: '4', w: '4' })} aria-hidden="true" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remove person (min 2 required)</TooltipContent>
                  </Tooltip>
                </div>

                {/* Percentage Input */}
                {splitType === 'percentage' && (
                  <div
                    className={css({
                      mt: '2',
                      display: 'flex',
                      gap: '2',
                      alignItems: 'center',
                    })}
                  >
                    <span
                      className={css({
                        fontSize: 'xs',
                        color: 'gray.400',
                        flex: '1',
                      })}
                    >
                      Percentage:
                    </span>
                    <div className={css({ display: 'flex', gap: '1', alignItems: 'center' })}>
                      <FieldInput
                        type="number"
                        value={person.percentage || 0}
                        onChange={(e) =>
                          updatePersonPercentage(person.id, parseFloat(e.target.value) || 0)
                        }
                        min="0"
                        max="100"
                        step="0.1"
                        className={css({
                          w: '20',
                          rounded: 'md',
                          border: '1px solid',
                          borderColor: 'gray.600',
                          bg: 'rgba(17, 24, 39, 0.7)',
                          px: '2',
                          py: '1',
                          color: 'white',
                          fontSize: 'sm',
                          _focus: {
                            borderColor: 'emerald.500',
                            outline: 'none',
                            ring: '1px',
                            ringColor: 'rgba(16, 185, 129, 0.3)',
                          },
                        })}
                      />
                      <span
                        className={css({
                          fontSize: 'xs',
                          color: 'gray.400',
                        })}
                      >
                        %
                      </span>
                    </div>
                  </div>
                )}

                <div
                  className={css({
                    mt: '2',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <span
                    className={css({
                      fontSize: 'xs',
                      color: 'gray.400',
                    })}
                  >
                    Amount to pay:
                  </span>
                  <span
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'bold',
                      color: 'emerald.400',
                    })}
                  >
                    {currency.symbol}
                    {formatCurrency(
                      calculations.peopleWithAmounts.find((pa) => pa.id === person.id)?.amount || 0
                    )}
                  </span>
                </div>

                {/* Payment Request Button */}
                {!person.hasPaid && mode === 'create' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => handleCopyPaymentRequest(person.id)}
                        size="sm"
                        variant="outline"
                        className={css({
                          mt: '2',
                          w: 'full',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                          fontSize: 'xs',
                        })}
                      >
                        <Wallet className={css({ h: '3', w: '3' })} />
                        Copy Payment Request
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copy payment request message for {person.name}</TooltipContent>
                  </Tooltip>
                )}

                {person.hasPaid && (
                  <Badge
                    size="sm"
                    className={css({
                      mt: '2',
                      bg: 'green.600',
                      color: 'white',
                    })}
                  >
                    ✅ Paid
                  </Badge>
                )}
              </SwipeableItem>
            ))}
          </div>

          {/* Payment Summary */}
          {calculations.unpaidCount > 0 && (
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'yellow.500/30',
                bg: 'rgba(234, 179, 8, 0.1)',
                p: '3',
              })}
              aria-live="polite"
              aria-atomic="true"
            >
              <div
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'yellow.400',
                  mb: '1',
                })}
              >
                💰 Still Owed
              </div>
              <div
                className={css({
                  fontSize: 'xs',
                  color: 'gray.400',
                })}
              >
                {calculations.unpaidCount} {calculations.unpaidCount === 1 ? 'person' : 'people'}{' '}
                need to pay {currency.symbol}
                {formatCurrency(calculations.totalUnpaid)}
              </div>
            </div>
          )}

          {calculations.unpaidCount === 0 && people.length > 0 && (
            <div
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor: 'green.500/30',
                bg: 'rgba(34, 197, 94, 0.1)',
                p: '3',
              })}
              aria-live="polite"
              aria-atomic="true"
            >
              <div
                className={css({
                  fontSize: 'sm',
                  fontWeight: 'semibold',
                  color: 'green.400',
                })}
              >
                🎉 All Paid!
              </div>
              <div
                className={css({
                  fontSize: 'xs',
                  color: 'gray.400',
                })}
              >
                Everyone has paid their share
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: { base: '2', sm: '3' },
            justifyContent: 'center',
          })}
        >
          {mode === 'calculator' && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleShare}
                    size="lg"
                    variant="default"
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: { base: 'sm', sm: 'base' },
                    })}
                  >
                    <Share2
                      className={css({
                        h: { base: '4', sm: '5' },
                        w: { base: '4', sm: '5' },
                      })}
                    />
                    Share Summary
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share or copy summary (Ctrl+S)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleExportCSV}
                    size="lg"
                    variant="outline"
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: { base: 'sm', sm: 'base' },
                    })}
                  >
                    <Download
                      className={css({
                        h: { base: '4', sm: '5' },
                        w: { base: '4', sm: '5' },
                      })}
                    />
                    Export CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export as CSV file (Ctrl+E)</TooltipContent>
              </Tooltip>

              {/* Template Management */}
              <TemplatesSelector onSelectTemplate={handleLoadTemplate} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleSaveTemplate}
                    size="lg"
                    variant="outline"
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: { base: 'sm', sm: 'base' },
                    })}
                  >
                    <FileText
                      className={css({
                        h: { base: '4', sm: '5' },
                        w: { base: '4', sm: '5' },
                      })}
                    />
                    Save Template
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save current setup as template</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleReset}
                    size="lg"
                    variant="outline"
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: { base: 'sm', sm: 'base' },
                    })}
                  >
                    <RefreshCw
                      className={css({
                        h: { base: '4', sm: '5' },
                        w: { base: '4', sm: '5' },
                      })}
                    />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to default values (Ctrl+R)</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => window.dispatchEvent(new CustomEvent('show-shortcuts-help'))}
                    size="lg"
                    variant="ghost"
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      fontSize: { base: 'sm', sm: 'base' },
                    })}
                  >
                    <Command
                      className={css({
                        h: { base: '4', sm: '5' },
                        w: { base: '4', sm: '5' },
                      })}
                    />
                    Shortcuts
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View keyboard shortcuts (?)</TooltipContent>
              </Tooltip>
            </>
          )}

          {mode === 'create' && (
            <Button
              onClick={handleCreateShareableBill}
              disabled={isCreating}
              size="lg"
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '2',
                fontSize: { base: 'sm', sm: 'base' },
              })}
            >
              <Save
                className={css({
                  h: { base: '4', sm: '5' },
                  w: { base: '4', sm: '5' },
                })}
              />
              {isCreating ? 'Creating...' : 'Create & Share Bill'}
            </Button>
          )}
        </div>

        {/* Pro Tips */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'cyan.500/20',
            bg: 'cyan.500/5',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
            animation: 'fadeInUp 0.4s ease-out 0.1s both',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              mb: '3',
            })}
          >
            <Sparkles className={css({ h: '5', w: '5', color: 'cyan.400' })} />
            <h3
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
                color: 'cyan.300',
              })}
            >
              Pro Tips
            </h3>
          </div>
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.300',
              mb: '4',
            })}
          >
            Expert techniques for fair and efficient bill splitting
          </p>

          <div className={css({ spaceY: '3' })}>
            <div
              className={css({
                p: '3',
                rounded: 'md',
                border: '1px solid',
                borderColor: 'gray.800',
                borderLeft: '3px solid',
                borderLeftColor: 'cyan.500',
                bg: 'gray.900/50',
              })}
            >
              <strong className={css({ color: 'cyan.400' })}>Receipt Scanner Magic:</strong>
              <p className={css({ mt: '1', fontSize: 'sm', color: 'gray.400' })}>
                Take a clear, well-lit photo of your receipt to automatically extract items and
                amounts using OCR technology - saves time and reduces errors
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'md',
                border: '1px solid',
                borderColor: 'gray.800',
                borderLeft: '3px solid',
                borderLeftColor: 'cyan.500',
                bg: 'gray.900/50',
              })}
            >
              <strong className={css({ color: 'cyan.400' })}>Shareable Links:</strong>
              <p className={css({ mt: '1', fontSize: 'sm', color: 'gray.400' })}>
                Create unique URLs that let participants view and track payment status in real-time
                - perfect for group dinners and events
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'md',
                border: '1px solid',
                borderColor: 'gray.800',
                borderLeft: '3px solid',
                borderLeftColor: 'cyan.500',
                bg: 'gray.900/50',
              })}
            >
              <strong className={css({ color: 'cyan.400' })}>Item-Based Splitting:</strong>
              <p className={css({ mt: '1', fontSize: 'sm', color: 'gray.400' })}>
                Add individual items and assign who ordered what for precise splitting - tip and tax
                are distributed proportionally
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'md',
                border: '1px solid',
                borderColor: 'gray.800',
                borderLeft: '3px solid',
                borderLeftColor: 'cyan.500',
                bg: 'gray.900/50',
              })}
            >
              <strong className={css({ color: 'cyan.400' })}>Multi-Currency Support:</strong>
              <p className={css({ mt: '1', fontSize: 'sm', color: 'gray.400' })}>
                Choose from 30+ currencies with proper formatting - automatically remembers your
                preference for future use
              </p>
            </div>
            <div
              className={css({
                p: '3',
                rounded: 'md',
                border: '1px solid',
                borderColor: 'gray.800',
                borderLeft: '3px solid',
                borderLeftColor: 'cyan.500',
                bg: 'gray.900/50',
              })}
            >
              <strong className={css({ color: 'cyan.400' })}>Payment Tracking:</strong>
              <p className={css({ mt: '1', fontSize: 'sm', color: 'gray.400' })}>
                Mark participants as paid in real-time to see who still owes money at a glance -
                eliminates confusion
              </p>
            </div>
          </div>
        </div>

        {/* How to Use */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'gray.800',
            bg: 'gray.900/50',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
            animation: 'fadeInUp 0.4s ease-out 0.2s both',
          })}
        >
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
              mb: '3',
            })}
          >
            <h3
              className={css({
                fontSize: { base: 'lg', sm: 'xl' },
                fontWeight: 'bold',
              })}
            >
              How to Use
            </h3>
          </div>
          <p
            className={css({
              fontSize: 'sm',
              color: 'gray.400',
              mb: '4',
            })}
          >
            Calculate and share bill splits in 3 simple steps
          </p>

          <div
            className={css({
              display: 'grid',
              gap: '4',
              gridTemplateColumns: { base: '1fr', md: '1fr 1fr' },
            })}
          >
            <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
              <div
                className={css({
                  display: 'flex',
                  h: '10',
                  w: '10',
                  minH: '10',
                  minW: '10',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'full',
                  border: '2px solid',
                  borderColor: 'purple.500',
                  bg: 'purple.500/10',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'purple.400',
                  flexShrink: 0,
                })}
              >
                1
              </div>
              <div className={css({ flex: '1', minW: '0' })}>
                <h4
                  className={css({
                    mb: '1',
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                  })}
                >
                  Enter Bill Details
                </h4>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Input the total amount, select currency, and set tip & tax percentages with quick
                  presets
                </p>
              </div>
            </div>
            <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
              <div
                className={css({
                  display: 'flex',
                  h: '10',
                  w: '10',
                  minH: '10',
                  minW: '10',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'full',
                  border: '2px solid',
                  borderColor: 'pink.500',
                  bg: 'pink.500/10',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'pink.400',
                  flexShrink: 0,
                })}
              >
                2
              </div>
              <div className={css({ flex: '1', minW: '0' })}>
                <h4
                  className={css({
                    mb: '1',
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                  })}
                >
                  Add Participants & Split
                </h4>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Add people and choose equal split, percentage split, or item-based splitting
                </p>
              </div>
            </div>
            <div className={css({ display: 'flex', gap: '3', alignItems: 'flex-start' })}>
              <div
                className={css({
                  display: 'flex',
                  h: '10',
                  w: '10',
                  minH: '10',
                  minW: '10',
                  alignItems: 'center',
                  justifyContent: 'center',
                  rounded: 'full',
                  border: '2px solid',
                  borderColor: 'blue.500',
                  bg: 'blue.500/10',
                  fontSize: 'lg',
                  fontWeight: 'bold',
                  color: 'blue.400',
                  flexShrink: 0,
                })}
              >
                3
              </div>
              <div className={css({ flex: '1', minW: '0' })}>
                <h4
                  className={css({
                    mb: '1',
                    fontSize: 'sm',
                    fontWeight: 'semibold',
                  })}
                >
                  Track & Share
                </h4>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Mark payments as complete and share the summary or create a shareable link
                </p>
              </div>
            </div>
          </div>
        </div>

        <SocialShare
          toolName="Split Bill Calculator"
          toolUrl="/tools/split-bill"
          description="Free bill splitting calculator with receipt scanner and tip calculation - perfect for restaurants and group expenses"
          hashtags={['SplitBill', 'Finance', 'Calculator', 'MoneySaving']}
        />

        <FAQAccordion faqs={faqs} />
        <RelatedTools currentToolPath="/tools/split-bill" category="finance" />
        <ToolRating toolId="/tools/split-bill" toolName="Split Bill Calculator" />

        {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}
        <ToolSearch />

        {/* Keyboard Shortcuts Help Modal */}
        <ShortcutsHelp />
      </main>
    </TooltipProvider>
  )
}
