'use client'

import {
  Banknote,
  Check,
  CircleDollarSign,
  Clock,
  Coins,
  DollarSign,
  Euro,
  Link2,
  Plus,
  PoundSterling,
  RefreshCw,
  Save,
  Share2,
  Users,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { ReceiptScanner } from '@/components/features/ReceiptScanner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FAQAccordion } from '@/components/ui/faq-accordion'
import { Field, FieldInput, FieldLabel } from '@/components/ui/field'
import { RelatedTools } from '@/components/ui/related-tools'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { trackToolEvent } from '@/lib/analytics'
import {
  CURRENCIES,
  type Currency,
  formatCurrency as formatCurrencyUtil,
  getDefaultCurrency,
} from '@/lib/currency'
import { calculateEqualSplit, createBill } from '@/lib/split-bill-service'
import type { CreateParticipantData } from '@/lib/split-bill-types'
import { css } from '@/styled-system/css'

interface Person {
  id: string
  name: string
  hasPaid: boolean
  percentage?: number
}

type PageMode = 'calculator' | 'create'
type SplitType = 'equal' | 'percentage'

const faqs = [
  {
    question: 'How do I split a bill with this calculator?',
    answer:
      'Simply add all participants, enter the total bill amount, select tip percentage, and our calculator automatically divides the total equally among all people. You can also use the receipt scanner feature to quickly extract items from a photo of your receipt.',
  },
  {
    question: 'Can I split bills unequally among people?',
    answer:
      'Yes! Our advanced split mode allows you to assign different amounts or specific items to different people. This is perfect when some people ordered more expensive items or when splitting by what each person actually consumed.',
  },
  {
    question: 'How does the tip calculation work?',
    answer:
      'You can choose from preset tip percentages (10%, 15%, 18%, 20%, 25%) or enter a custom amount. The tip is added to the total bill before splitting among participants. You can also choose whether to apply tip before or after tax.',
  },
  {
    question: 'Does the receipt scanner work with any receipt?',
    answer:
      'The receipt scanner works best with clear, well-lit photos of printed receipts. It uses OCR technology to extract item names and prices. While it works with most standard restaurant receipts, you may need to verify and adjust the extracted data for best accuracy.',
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
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Person 1', hasPaid: false, percentage: 50 },
    { id: '2', name: 'Person 2', hasPaid: false, percentage: 50 },
  ])

  // Create Shareable Bill fields
  const [billTitle, setBillTitle] = useState('')
  const [billDescription, setBillDescription] = useState('')
  const [organizerName, setOrganizerName] = useState('')
  const [organizerBankAccount, setOrganizerBankAccount] = useState('')
  const [organizerBankName, setOrganizerBankName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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

  // Calculate totals
  const calculations = useMemo(() => {
    const bill = parseFloat(billAmount) || 0
    const tip = parseFloat(tipPercent) || 0
    const tax = parseFloat(taxPercent) || 0
    const numPeople = people.length

    const tipAmount = (bill * tip) / 100
    const taxAmount = (bill * tax) / 100
    const total = bill + tipAmount + taxAmount

    // Calculate per person based on split type
    let perPerson = 0
    let peopleWithAmounts: { id: string; amount: number }[] = []

    if (splitType === 'equal') {
      perPerson = numPeople > 0 ? total / numPeople : 0
      peopleWithAmounts = people.map((p) => ({ id: p.id, amount: perPerson }))
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
  }, [billAmount, tipPercent, taxPercent, people, splitType])

  // Add person
  const addPerson = () => {
    const newId = String(Date.now())
    const defaultPercentage = splitType === 'percentage' ? 0 : undefined
    setPeople([
      ...people,
      {
        id: newId,
        name: `Person ${people.length + 1}`,
        hasPaid: false,
        percentage: defaultPercentage,
      },
    ])
    toast.success('Person added')
    trackToolEvent('split_bill_add_person', {
      total_people: people.length + 1,
    })
  }

  // Remove person
  const removePerson = (id: string) => {
    if (people.length <= 2) {
      toast.error('Minimum 2 people required')
      return
    }
    setPeople(people.filter((p) => p.id !== id))
    toast.success('Person removed')
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
    setPeople(people.map((p) => (p.id === id ? { ...p, hasPaid: !p.hasPaid } : p)))
  }

  // Handle split type change
  const handleSplitTypeChange = (newSplitType: SplitType) => {
    setSplitType(newSplitType)
    if (newSplitType === 'percentage') {
      // Initialize equal percentages
      const equalPercentage = people.length > 0 ? 100 / people.length : 0
      setPeople(people.map((p) => ({ ...p, percentage: equalPercentage })))
      toast.success('Switched to percentage split')
    } else {
      // Clear percentages
      setPeople(people.map((p) => ({ ...p, percentage: undefined })))
      toast.success('Switched to equal split')
    }
  }

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
    toast.success('Reset to defaults')
    trackToolEvent('split_bill_reset', {})
  }

  // Generate shareable summary
  const generateSummary = () => {
    const splitTypeText = splitType === 'percentage' ? 'Custom Percentage' : 'Equal Split'
    const summary = `
💰 Bill Split Summary

📋 Bill Details:
- Subtotal: ${currency.symbol}${formatCurrency(calculations.bill)}
- Tip (${tipPercent}%): ${currency.symbol}${formatCurrency(calculations.tipAmount)}
- Tax (${taxPercent}%): ${currency.symbol}${formatCurrency(calculations.taxAmount)}
- Total: ${currency.symbol}${formatCurrency(calculations.total)}

👥 Split Among ${people.length} People (${splitTypeText}):
${people
  .map((p) => {
    const personAmount = calculations.peopleWithAmounts.find((pa) => pa.id === p.id)?.amount || 0
    const percentageText = splitType === 'percentage' ? ` (${p.percentage?.toFixed(1)}%)` : ''
    return `- ${p.name}: ${currency.symbol}${formatCurrency(
      personAmount
    )}${percentageText} ${p.hasPaid ? '✅ Paid' : '⏳ Pending'}`
  })
  .join('\n')}

💵 Per Person (Average): ${currency.symbol}${formatCurrency(calculations.perPerson)}
✅ Paid: ${calculations.paidCount} (${currency.symbol}${formatCurrency(calculations.totalPaid)})
⏳ Unpaid: ${calculations.unpaidCount} (${currency.symbol}${formatCurrency(
      calculations.totalUnpaid
    )})

Currency: ${currency.code} (${currency.name})
Generated by SuperTool Split Bill Calculator
    `.trim()

    return summary
  }

  // Handle receipt data extraction
  const handleReceiptData = (data: {
    subtotal?: number
    tax?: number
    tip?: number
    total?: number
  }) => {
    const appliedFields: string[] = []

    // If we have a subtotal, use it as the bill amount
    if (data.subtotal !== undefined) {
      setBillAmount(String(data.subtotal))
      appliedFields.push('subtotal')
    } else if (data.total !== undefined) {
      // If no subtotal but we have total, use it
      setBillAmount(String(data.total))
      appliedFields.push('total as subtotal')
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
      <main
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
              className="animate-pulse rounded-xl bg-gradient-to-br from-green-600 via-emerald-600 to-teal-700 p-2.5 shadow-2xl shadow-green-500/60 sm:rounded-2xl sm:p-4"
              style={{ animationDuration: '2s' }}
            >
              <Users className="h-6 w-6 text-white sm:h-8 sm:w-8" />
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300 bg-clip-text text-2xl font-extrabold text-transparent drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                Split Bill Calculator
              </h1>
              <p className="text-sm text-gray-200 sm:text-base md:text-lg">
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
              <Link2 className="h-4 w-4" />
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
                <Clock className="h-4 w-4" />
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
                className="text-3xl font-bold text-green-400"
                aria-live="polite"
                aria-atomic="true"
              >
                {currency.symbol}
                {formatCurrency(calculations.total)}
              </div>
              <div className="text-sm text-gray-400">Total Bill</div>
            </div>
            <div className={css({ textAlign: 'center' })}>
              <div
                className="text-3xl font-bold text-emerald-400"
                aria-live="polite"
                aria-atomic="true"
              >
                {currency.symbol}
                {formatCurrency(calculations.perPerson)}
              </div>
              <div className="text-sm text-gray-400">Per Person</div>
            </div>
            <div className={css({ textAlign: 'center' })}>
              <div className="text-3xl font-bold text-teal-400">{people.length}</div>
              <div className="text-sm text-gray-400">People</div>
            </div>
            <div className={css({ textAlign: 'center' })}>
              <div className="text-3xl font-bold text-green-400">
                {calculations.paidCount}/{people.length}
              </div>
              <div className="text-sm text-gray-400">Paid</div>
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
              <FieldLabel className="text-sm font-medium text-gray-300">Bill Title *</FieldLabel>
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
              <FieldLabel className="text-sm font-medium text-gray-300">
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
              <FieldLabel className="text-sm font-medium text-gray-300">
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
              <FieldLabel className="text-sm font-medium text-gray-300">
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
              <FieldLabel className="text-sm font-medium text-gray-300">
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
            <FieldLabel className="text-sm font-medium text-gray-300">Currency</FieldLabel>
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

          <Field>
            <FieldLabel className="text-sm font-medium text-gray-300">
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
              <FieldLabel className="text-sm font-medium text-gray-300">Tip (%)</FieldLabel>
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
            <div className="mt-1 text-xs text-gray-400">
              Tip Amount: {currency.symbol}
              {formatCurrency(calculations.tipAmount)}
            </div>
          </Field>

          <Field>
            <FieldLabel className="text-sm font-medium text-gray-300">Tax (%)</FieldLabel>
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
            <div className="mt-1 text-xs text-gray-400">
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
              <span className="text-sm text-gray-300">Subtotal:</span>
              <span className="text-sm font-semibold text-gray-200">
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
              <span className="text-sm text-gray-300">Tip ({tipPercent}%):</span>
              <span className="text-sm font-semibold text-green-400">
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
              <span className="text-sm text-gray-300">Tax ({taxPercent}%):</span>
              <span className="text-sm font-semibold text-green-400">
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
              <span className="text-base font-bold text-white">Total:</span>
              <span className="text-base font-bold text-green-400">
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
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '1',
              })}
            >
              <Plus className="h-4 w-4" />
              Add Person
            </Button>
          </div>

          {/* Split Type Toggle */}
          <div
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
          </div>

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
              <div className="text-sm font-semibold text-yellow-400 mb-1">⚠️ Invalid Split</div>
              <div className="text-xs text-gray-400">
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
              <div className="text-sm font-semibold text-green-400">✅ Valid Split (100%)</div>
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
              <div
                key={person.id}
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
                          <Check className="h-4 w-4" />
                        ) : (
                          <CurrencyIcon className="h-4 w-4" />
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
                        <X className="h-4 w-4" />
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
                    <span className="text-xs text-gray-400 flex-1">Percentage:</span>
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
                      <span className="text-xs text-gray-400">%</span>
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
                  <span className="text-xs text-gray-400">Amount to pay:</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {currency.symbol}
                    {formatCurrency(
                      calculations.peopleWithAmounts.find((pa) => pa.id === person.id)?.amount || 0
                    )}
                  </span>
                </div>
                {person.hasPaid && (
                  <Badge size="sm" className="mt-2 bg-green-600 text-white">
                    ✅ Paid
                  </Badge>
                )}
              </div>
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
              <div className="text-sm font-semibold text-yellow-400 mb-1">💰 Still Owed</div>
              <div className="text-xs text-gray-400">
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
              <div className="text-sm font-semibold text-green-400">🎉 All Paid!</div>
              <div className="text-xs text-gray-400">Everyone has paid their share</div>
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
                    <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
                    Share Summary
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share or copy summary to clipboard</TooltipContent>
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
                    <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset to default values</TooltipContent>
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
              <Save className="h-4 w-4 sm:h-5 sm:w-5" />
              {isCreating ? 'Creating...' : 'Create & Share Bill'}
            </Button>
          )}
        </div>

        {/* Help Section */}
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'green.500/20',
            bg: 'rgba(34, 197, 94, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h3
            className={css({
              mb: '3',
              fontSize: { base: 'base', sm: 'lg' },
              fontWeight: 'bold',
              color: 'green.300',
            })}
          >
            How to Use
          </h3>
          {mode === 'calculator' && (
            <ul
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '2',
                pl: '5',
                color: 'gray.400',
                listStyle: 'disc',
              })}
            >
              <li className="text-sm sm:text-base">
                Enter the total bill amount before tip and tax
              </li>
              <li className="text-sm sm:text-base">
                Set tip percentage (quick presets: 10%, 15%, 18%, 20%)
              </li>
              <li className="text-sm sm:text-base">Set tax percentage if applicable</li>
              <li className="text-sm sm:text-base">
                Add or remove people using the + and × buttons
              </li>
              <li className="text-sm sm:text-base">Mark people as paid by clicking the $ button</li>
              <li className="text-sm sm:text-base">
                Share the summary with everyone via the Share button
              </li>
            </ul>
          )}
          {mode === 'create' && (
            <ul
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '2',
                pl: '5',
                color: 'gray.400',
                listStyle: 'disc',
              })}
            >
              <li className="text-sm sm:text-base">
                Enter bill details (title, organizer name, bank account for payment)
              </li>
              <li className="text-sm sm:text-base">
                Set the bill amount, tip, and tax using the fields above
              </li>
              <li className="text-sm sm:text-base">Add participants who will share this bill</li>
              <li className="text-sm sm:text-base">
                Click "Create & Share Bill" to generate a shareable link
              </li>
              <li className="text-sm sm:text-base">
                Participants can track their payment status via the shared link
              </li>
              <li className="text-sm sm:text-base">
                Real-time updates when anyone marks their payment as complete
              </li>
            </ul>
          )}
        </div>

        <FAQAccordion faqs={faqs} />
        <RelatedTools currentToolPath="/tools/split-bill" category="finance" />
      </main>
    </TooltipProvider>
  )
}
