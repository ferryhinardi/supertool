'use client'

import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowDownToLine,
  Calculator,
  Check,
  ChevronDown,
  CircleDollarSign,
  Copy,
  DollarSign,
  Download,
  FileText,
  Folder,
  Heart,
  Home,
  Lightbulb,
  PiggyBank,
  Plus,
  RefreshCw,
  Save,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  Utensils,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
import { trackToolEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

// Types
interface Expense {
  id: string
  name: string
  amount: number
  category: 'needs' | 'wants' | 'savings'
}

interface Budget {
  id: string
  name: string
  income: number
  currency: string
  expenses: Expense[]
  createdAt: string
  updatedAt: string
}

interface BudgetTip {
  id: string
  category: 'needs' | 'wants' | 'savings' | 'general'
  title: string
  description: string
  icon: React.ReactNode
}

// Constants
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
]

const EXPENSE_CATEGORIES = [
  {
    id: 'needs',
    name: 'Needs',
    percentage: 50,
    color: 'blue',
    description: 'Essential expenses like housing, utilities, groceries, and transportation',
    icon: Home,
  },
  {
    id: 'wants',
    name: 'Wants',
    percentage: 30,
    color: 'purple',
    description: 'Non-essential expenses like entertainment, dining out, and hobbies',
    icon: Heart,
  },
  {
    id: 'savings',
    name: 'Savings',
    percentage: 20,
    color: 'green',
    description: 'Savings, investments, and debt repayment beyond minimums',
    icon: PiggyBank,
  },
] as const

const PRESET_EXPENSES = {
  needs: [
    { name: 'Rent/Mortgage', icon: Home },
    { name: 'Utilities', icon: Zap },
    { name: 'Groceries', icon: Utensils },
    { name: 'Transportation', icon: CircleDollarSign },
    { name: 'Insurance', icon: FileText },
    { name: 'Healthcare', icon: Heart },
  ],
  wants: [
    { name: 'Dining Out', icon: Utensils },
    { name: 'Entertainment', icon: Sparkles },
    { name: 'Shopping', icon: ShoppingBag },
    { name: 'Subscriptions', icon: FileText },
    { name: 'Hobbies', icon: Heart },
    { name: 'Travel', icon: TrendingUp },
  ],
  savings: [
    { name: 'Emergency Fund', icon: PiggyBank },
    { name: 'Retirement', icon: TrendingUp },
    { name: 'Investments', icon: TrendingUp },
    { name: 'Debt Repayment', icon: Wallet },
    { name: 'Vacation Fund', icon: Heart },
    { name: 'Education', icon: Lightbulb },
  ],
}

const STORAGE_KEY = 'budget-planner-budgets'

// Budget Operations
const budgetOperations: ToolOperation[] = [
  {
    id: 'calculate',
    label: 'Calculate Budget',
    description: 'Calculate your 50/30/20 budget breakdown',
    icon: Calculator,
    color: TOOL_COLORS.secondary,
  },
  {
    id: 'track',
    label: 'Track Expenses',
    description: 'Add and categorize your expenses',
    icon: Wallet,
    color: TOOL_COLORS.purple,
  },
  {
    id: 'analyze',
    label: 'Analyze Spending',
    description: 'Compare actual vs recommended spending',
    icon: TrendingUp,
    color: TOOL_COLORS.success,
  },
  {
    id: 'save',
    label: 'Save Budget',
    description: 'Save your budget for future reference',
    icon: Save,
    color: TOOL_COLORS.warning,
  },
  {
    id: 'export',
    label: 'Export Budget',
    description: 'Export your budget as CSV or PDF',
    icon: Download,
    color: TOOL_COLORS.info,
  },
  {
    id: 'tips',
    label: 'Budget Tips',
    description: 'Get personalized saving recommendations',
    icon: Lightbulb,
    color: TOOL_COLORS.pink,
  },
]

// FAQ Data
const budgetFAQs = [
  {
    question: 'What is the 50/30/20 budget rule?',
    answer:
      'The 50/30/20 rule is a simple budgeting framework where you allocate 50% of your after-tax income to needs (essentials like housing, utilities, groceries), 30% to wants (non-essentials like entertainment, dining out), and 20% to savings and debt repayment. This rule helps create a balanced approach to managing your money.',
  },
  {
    question: 'How do I determine what counts as a need vs a want?',
    answer:
      "Needs are essential expenses required for basic living - housing, utilities, groceries, transportation to work, insurance, and minimum debt payments. Wants are everything else that enhances your lifestyle but isn't essential - dining out, entertainment, hobbies, vacations, and upgrades to basic needs (like a luxury car instead of basic transportation).",
  },
  {
    question: "What if I can't meet the 50/30/20 percentages?",
    answer:
      "The 50/30/20 rule is a guideline, not a strict requirement. If your needs exceed 50% (common in high cost-of-living areas), adjust by reducing wants first, then work on long-term solutions like increasing income or reducing fixed expenses. The key is to always prioritize some savings, even if it's less than 20%.",
  },
  {
    question: 'Should I use gross or net income for budgeting?',
    answer:
      "Use your net (after-tax) income for the 50/30/20 rule. This is your take-home pay after taxes, health insurance, and retirement contributions are deducted. If you're self-employed, estimate your tax obligations and subtract them from your gross income.",
  },
  {
    question: 'How often should I review my budget?',
    answer:
      'Review your budget monthly to track actual spending against your plan. Do a more thorough review quarterly to adjust categories and goals. Major life changes (new job, moving, having a child) warrant an immediate budget revision.',
  },
  {
    question: 'Is my budget data saved securely?',
    answer:
      "All budget data is stored locally in your browser's localStorage. Your financial information never leaves your device and is not sent to any server. You can export your data anytime and clear it from browser settings.",
  },
]

// Helper Functions
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function formatCurrency(amount: number, currency: string): string {
  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  return `${currencyInfo.symbol}${formatted}`
}

function getBudgetTips(budget: Budget): BudgetTip[] {
  const tips: BudgetTip[] = []
  const { income, expenses } = budget

  const needsTotal = expenses
    .filter((e) => e.category === 'needs')
    .reduce((sum, e) => sum + e.amount, 0)
  const wantsTotal = expenses
    .filter((e) => e.category === 'wants')
    .reduce((sum, e) => sum + e.amount, 0)
  const savingsTotal = expenses
    .filter((e) => e.category === 'savings')
    .reduce((sum, e) => sum + e.amount, 0)

  const needsPercentage = income > 0 ? (needsTotal / income) * 100 : 0
  const wantsPercentage = income > 0 ? (wantsTotal / income) * 100 : 0
  const savingsPercentage = income > 0 ? (savingsTotal / income) * 100 : 0

  if (needsPercentage > 50) {
    tips.push({
      id: 'needs-high',
      category: 'needs',
      title: 'Needs Exceeding 50%',
      description: `Your needs are at ${needsPercentage.toFixed(1)}%. Consider negotiating bills, finding cheaper housing, or carpooling to reduce essential costs.`,
      icon: <AlertCircle className={css({ w: '5', h: '5', color: 'red.400' })} />,
    })
  }

  if (wantsPercentage > 30) {
    tips.push({
      id: 'wants-high',
      category: 'wants',
      title: 'Wants Exceeding 30%',
      description: `Your wants are at ${wantsPercentage.toFixed(1)}%. Try cutting subscriptions you don't use, cooking more at home, or finding free entertainment options.`,
      icon: <AlertCircle className={css({ w: '5', h: '5', color: 'amber.400' })} />,
    })
  }

  if (savingsPercentage < 20 && income > 0) {
    tips.push({
      id: 'savings-low',
      category: 'savings',
      title: 'Boost Your Savings',
      description: `Your savings are at ${savingsPercentage.toFixed(1)}%. Try automating transfers to savings, starting with even 1% more of your income.`,
      icon: <PiggyBank className={css({ w: '5', h: '5', color: 'green.400' })} />,
    })
  }

  if (savingsPercentage >= 20) {
    tips.push({
      id: 'savings-good',
      category: 'savings',
      title: 'Great Savings Rate!',
      description: `You're saving ${savingsPercentage.toFixed(1)}% of your income. Consider diversifying between emergency fund, retirement, and investments.`,
      icon: <Check className={css({ w: '5', h: '5', color: 'green.400' })} />,
    })
  }

  if (expenses.length === 0) {
    tips.push({
      id: 'no-expenses',
      category: 'general',
      title: 'Add Your Expenses',
      description:
        'Start by adding your regular expenses to get personalized recommendations and track your spending patterns.',
      icon: <Plus className={css({ w: '5', h: '5', color: 'blue.400' })} />,
    })
  }

  tips.push({
    id: 'emergency-fund',
    category: 'general',
    title: 'Emergency Fund Goal',
    description: `Aim to save 3-6 months of expenses (${formatCurrency(needsTotal * 3, budget.currency)} - ${formatCurrency(needsTotal * 6, budget.currency)}) for emergencies.`,
    icon: <Lightbulb className={css({ w: '5', h: '5', color: 'amber.400' })} />,
  })

  return tips
}

export default function BudgetPlannerPage() {
  // State
  const [mounted, setMounted] = useState(false)
  const [selectedOperation, setSelectedOperation] = useState<string>('calculate')
  const [income, setIncome] = useState<string>('')
  const [currency, setCurrency] = useState<string>('USD')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [savedBudgets, setSavedBudgets] = useState<Budget[]>([])
  const [budgetName, setBudgetName] = useState<string>('')
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null)
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [showSavedBudgets, setShowSavedBudgets] = useState(false)
  const [newExpenseName, setNewExpenseName] = useState<string>('')
  const [newExpenseAmount, setNewExpenseAmount] = useState<string>('')
  const [newExpenseCategory, setNewExpenseCategory] = useState<'needs' | 'wants' | 'savings'>(
    'needs'
  )
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  // Calculations
  const incomeNum = useMemo(() => Number.parseFloat(income) || 0, [income])

  const budgetBreakdown = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => ({
      ...cat,
      recommended: (incomeNum * cat.percentage) / 100,
      actual: expenses.filter((e) => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0),
    }))
  }, [incomeNum, expenses])

  const totalExpenses = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])

  const remainingBudget = useMemo(() => incomeNum - totalExpenses, [incomeNum, totalExpenses])

  const currentBudget: Budget = useMemo(
    () => ({
      id: currentBudgetId || generateId(),
      name: budgetName || 'Untitled Budget',
      income: incomeNum,
      currency,
      expenses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [currentBudgetId, budgetName, incomeNum, currency, expenses]
  )

  const tips = useMemo(() => getBudgetTips(currentBudget), [currentBudget])

  // Load saved budgets on mount
  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setSavedBudgets(JSON.parse(saved))
      }
    } catch {
      console.error('Failed to load saved budgets')
    }
    trackToolEvent('budget_planner_open', { currency })
  }, [currency])

  // Save budgets to localStorage when changed
  useEffect(() => {
    if (mounted && savedBudgets.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedBudgets))
    }
  }, [savedBudgets, mounted])

  // Handlers
  const handleIncomeChange = useCallback(
    (value: string) => {
      const numericValue = value.replace(/[^0-9.]/g, '')
      setIncome(numericValue)
      trackToolEvent('budget_planner_income_change', {
        currency,
        hasIncome: numericValue.length > 0,
      })
    },
    [currency]
  )

  const handleAddExpense = useCallback(() => {
    if (!newExpenseName.trim() || !newExpenseAmount) {
      toast.error('Please enter expense name and amount')
      return
    }

    const amount = Number.parseFloat(newExpenseAmount)
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    const newExpense: Expense = {
      id: generateId(),
      name: newExpenseName.trim(),
      amount,
      category: newExpenseCategory,
    }

    setExpenses((prev) => [...prev, newExpense])
    setNewExpenseName('')
    setNewExpenseAmount('')
    toast.success('Expense added')
    trackToolEvent('budget_planner_add_expense', {
      category: newExpenseCategory,
      currency,
    })
  }, [newExpenseName, newExpenseAmount, newExpenseCategory, currency])

  const handleAddPresetExpense = useCallback(
    (name: string, category: 'needs' | 'wants' | 'savings') => {
      setNewExpenseName(name)
      setNewExpenseCategory(category)
      setSelectedOperation('track')
      toast.info(`Added "${name}" - enter the amount`)
    },
    []
  )

  const handleRemoveExpense = useCallback(
    (id: string) => {
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      toast.success('Expense removed')
      trackToolEvent('budget_planner_remove_expense', { currency })
    },
    [currency]
  )

  const handleSaveBudget = useCallback(() => {
    if (!budgetName.trim()) {
      toast.error('Please enter a budget name')
      return
    }

    if (incomeNum <= 0) {
      toast.error('Please enter your income first')
      return
    }

    const budget: Budget = {
      ...currentBudget,
      name: budgetName.trim(),
      updatedAt: new Date().toISOString(),
    }

    setSavedBudgets((prev) => {
      const existing = prev.findIndex((b) => b.id === budget.id)
      if (existing >= 0) {
        const updated = [...prev]
        updated[existing] = budget
        return updated
      }
      return [...prev, budget]
    })

    setCurrentBudgetId(budget.id)
    toast.success('Budget saved!')
    trackToolEvent('budget_planner_save', { currency, expenseCount: expenses.length })
  }, [budgetName, incomeNum, currentBudget, currency, expenses.length])

  const handleLoadBudget = useCallback((budget: Budget) => {
    setCurrentBudgetId(budget.id)
    setBudgetName(budget.name)
    setIncome(budget.income.toString())
    setCurrency(budget.currency)
    setExpenses(budget.expenses)
    setShowSavedBudgets(false)
    toast.success(`Loaded "${budget.name}"`)
    trackToolEvent('budget_planner_load', { currency: budget.currency })
  }, [])

  const handleDeleteBudget = useCallback(
    (id: string) => {
      setSavedBudgets((prev) => prev.filter((b) => b.id !== id))
      if (currentBudgetId === id) {
        setCurrentBudgetId(null)
        setBudgetName('')
      }
      toast.success('Budget deleted')
      trackToolEvent('budget_planner_delete', { currency })
    },
    [currentBudgetId, currency]
  )

  const handleReset = useCallback(() => {
    setIncome('')
    setExpenses([])
    setBudgetName('')
    setCurrentBudgetId(null)
    setNewExpenseName('')
    setNewExpenseAmount('')
    toast.success('Budget reset')
    trackToolEvent('budget_planner_reset', { currency })
  }, [currency])

  const handleExportCSV = useCallback(() => {
    const headers = ['Category', 'Name', 'Amount', 'Percentage of Income']
    const rows = expenses.map((e) => [
      e.category,
      e.name,
      formatCurrency(e.amount, currency),
      incomeNum > 0 ? `${((e.amount / incomeNum) * 100).toFixed(1)}%` : '0%',
    ])

    const summary = [
      ['', '', '', ''],
      ['Summary', '', '', ''],
      ['Total Income', '', formatCurrency(incomeNum, currency), '100%'],
      [
        'Total Expenses',
        '',
        formatCurrency(totalExpenses, currency),
        `${((totalExpenses / incomeNum) * 100).toFixed(1)}%`,
      ],
      [
        'Remaining',
        '',
        formatCurrency(remainingBudget, currency),
        `${((remainingBudget / incomeNum) * 100).toFixed(1)}%`,
      ],
      ['', '', '', ''],
      ...budgetBreakdown.map((cat) => [
        `${cat.name} (${cat.percentage}%)`,
        '',
        formatCurrency(cat.actual, currency),
        `${cat.actual > 0 && incomeNum > 0 ? ((cat.actual / incomeNum) * 100).toFixed(1) : 0}%`,
      ]),
    ]

    const csv = [headers, ...rows, ...summary].map((row) => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${budgetName || 'budget'}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Budget exported as CSV')
    trackToolEvent('budget_planner_export', { format: 'csv', currency })
  }, [expenses, currency, incomeNum, totalExpenses, remainingBudget, budgetBreakdown, budgetName])

  const handleCopyToClipboard = useCallback(() => {
    const text = `Budget: ${budgetName || 'Untitled'}
Income: ${formatCurrency(incomeNum, currency)}
${budgetBreakdown.map((cat) => `${cat.name}: ${formatCurrency(cat.actual, currency)} / ${formatCurrency(cat.recommended, currency)} (${cat.actual > 0 && incomeNum > 0 ? ((cat.actual / incomeNum) * 100).toFixed(1) : 0}%)`).join('\n')}
Total Expenses: ${formatCurrency(totalExpenses, currency)}
Remaining: ${formatCurrency(remainingBudget, currency)}`

    navigator.clipboard.writeText(text)
    toast.success('Budget copied to clipboard')
    trackToolEvent('budget_planner_export', { format: 'clipboard', currency })
  }, [budgetName, incomeNum, currency, budgetBreakdown, totalExpenses, remainingBudget])

  // Render helpers
  const getCategoryColor = (category: 'needs' | 'wants' | 'savings') => {
    switch (category) {
      case 'needs':
        return 'blue'
      case 'wants':
        return 'purple'
      case 'savings':
        return 'green'
    }
  }

  const currencyInfo = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0]

  if (!mounted) {
    return (
      <main
        className={css({
          mx: 'auto',
          maxW: '7xl',
          w: 'full',
          px: { base: '4', sm: '6', md: '8' },
          py: { base: '6', sm: '8', md: '10' },
        })}
      >
        <div
          className={css({
            h: '96',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <div
            className={css({
              animation: 'spin 1s linear infinite',
              w: '8',
              h: '8',
              border: '2px solid',
              borderColor: 'blue.500',
              borderTopColor: 'transparent',
              borderRadius: 'full',
            })}
          />
        </div>
      </main>
    )
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
            mb: '4',
          })}
        >
          <div
            className={css({
              p: '3',
              bg: 'green.500/20',
              borderRadius: 'xl',
              border: '1px solid',
              borderColor: 'green.500/30',
            })}
          >
            <PiggyBank className={css({ w: '8', h: '8', color: 'green.400' })} />
          </div>
        </div>
        <h1
          className={css({
            fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
            fontWeight: 'bold',
            bgGradient: 'to-r',
            gradientFrom: 'green.400',
            gradientVia: 'emerald.400',
            gradientTo: 'teal.400',
            bgClip: 'text',
            color: 'transparent',
          })}
        >
          Budget Planner
        </h1>
        <p
          className={css({
            fontSize: { base: 'md', sm: 'lg' },
            color: 'gray.400',
            maxW: '2xl',
            mx: 'auto',
          })}
        >
          Master your finances with the 50/30/20 rule. Allocate 50% to needs, 30% to wants, and 20%
          to savings for a balanced budget.
        </p>
        <div
          className={css({
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2',
            justifyContent: 'center',
            mt: '4',
          })}
        >
          <Badge
            variant="outline"
            className={css({ borderColor: 'blue.500/50', color: 'blue.400' })}
          >
            <Home className={css({ w: '3', h: '3', mr: '1' })} />
            50% Needs
          </Badge>
          <Badge
            variant="outline"
            className={css({ borderColor: 'purple.500/50', color: 'purple.400' })}
          >
            <Heart className={css({ w: '3', h: '3', mr: '1' })} />
            30% Wants
          </Badge>
          <Badge
            variant="outline"
            className={css({ borderColor: 'green.500/50', color: 'green.400' })}
          >
            <PiggyBank className={css({ w: '3', h: '3', mr: '1' })} />
            20% Savings
          </Badge>
        </div>
      </motion.div>

      {/* Operations Grid - Desktop */}
      <div className={css({ display: { base: 'none', md: 'block' } })}>
        <ToolOperationGrid
          operations={budgetOperations}
          selectedOperation={selectedOperation}
          onOperationChange={setSelectedOperation}
          columns={{ base: 1, sm: 2, lg: 3 }}
        />
      </div>

      {/* Operations - Mobile */}
      <div className={css({ display: { base: 'block', md: 'none' } })}>
        <ToolMobilePicker
          label={
            budgetOperations.find((op) => op.id === selectedOperation)?.label || 'Select Operation'
          }
          title="Select Operation"
          description="Choose a budget operation"
          color={TOOL_COLORS.success}
        >
          <div className={css({ spaceY: '2' })}>
            {budgetOperations.map((op) => (
              <button
                key={op.id}
                type="button"
                onClick={() => setSelectedOperation(op.id)}
                className={css({
                  w: 'full',
                  p: '3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3',
                  borderRadius: 'lg',
                  bg: selectedOperation === op.id ? 'gray.800' : 'transparent',
                  border: '1px solid',
                  borderColor: selectedOperation === op.id ? 'green.500/50' : 'gray.700',
                  cursor: 'pointer',
                  _hover: { bg: 'gray.800/50' },
                })}
              >
                <op.icon className={css({ w: '5', h: '5' })} style={{ color: op.color }} />
                <div className={css({ textAlign: 'left' })}>
                  <p className={css({ fontWeight: 'medium', color: 'white' })}>{op.label}</p>
                  {op.description && (
                    <p className={css({ fontSize: 'xs', color: 'gray.400' })}>{op.description}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </ToolMobilePicker>
      </div>

      {/* Main Content */}
      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: 'repeat(3, 1fr)' },
          gap: '6',
        })}
      >
        {/* Left Column - Income & Expenses */}
        <div className={css({ gridColumn: { lg: 'span 2' }, spaceY: '6' })}>
          {/* Income Card */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'green.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle
                className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'white' })}
              >
                <DollarSign className={css({ w: '5', h: '5', color: 'green.400' })} />
                Monthly Income
              </CardTitle>
              <CardDescription>Enter your after-tax monthly income</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div className={css({ display: 'flex', gap: '3' })}>
                {/* Currency Selector */}
                <div className={css({ position: 'relative' })}>
                  <Button
                    variant="outline"
                    onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                    className={css({
                      minW: '24',
                      justifyContent: 'space-between',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                    })}
                  >
                    <span>
                      {currencyInfo.symbol} {currency}
                    </span>
                    <ChevronDown className={css({ w: '4', h: '4', ml: '2' })} />
                  </Button>
                  {showCurrencyDropdown && (
                    <>
                      {/* biome-ignore lint/a11y/noStaticElementInteractions: Modal backdrop */}
                      <div
                        role="presentation"
                        className={css({ position: 'fixed', inset: '0', zIndex: '40' })}
                        onClick={() => setShowCurrencyDropdown(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') setShowCurrencyDropdown(false)
                        }}
                      />
                      <div
                        className={css({
                          position: 'absolute',
                          top: '100%',
                          left: '0',
                          mt: '1',
                          w: '48',
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'gray.700',
                          borderRadius: 'lg',
                          shadow: 'xl',
                          zIndex: '50',
                          maxH: '64',
                          overflow: 'auto',
                        })}
                      >
                        {CURRENCIES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCurrency(c.code)
                              setShowCurrencyDropdown(false)
                            }}
                            className={css({
                              w: 'full',
                              px: '3',
                              py: '2',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2',
                              _hover: { bg: 'gray.700' },
                              color: currency === c.code ? 'green.400' : 'white',
                              cursor: 'pointer',
                            })}
                          >
                            <span className={css({ w: '6', fontFamily: 'mono' })}>{c.symbol}</span>
                            <span>{c.code}</span>
                            <span
                              className={css({ color: 'gray.400', fontSize: 'sm', ml: 'auto' })}
                            >
                              {c.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {/* Income Input */}
                <div className={css({ flex: '1', position: 'relative' })}>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter your monthly income"
                    value={income}
                    onChange={(e) => handleIncomeChange(e.target.value)}
                    className={css({
                      pl: '10',
                      fontSize: 'lg',
                      h: '12',
                      borderColor: 'gray.700',
                      bg: 'gray.800/50',
                    })}
                  />
                  <span
                    className={css({
                      position: 'absolute',
                      left: '3',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'gray.400',
                      fontSize: 'lg',
                    })}
                  >
                    {currencyInfo.symbol}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '2' })}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavedBudgets(true)}
                  className={css({ borderColor: 'gray.700' })}
                >
                  <Folder className={css({ w: '4', h: '4', mr: '2' })} />
                  Load Budget ({savedBudgets.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className={css({ borderColor: 'gray.700' })}
                >
                  <RefreshCw className={css({ w: '4', h: '4', mr: '2' })} />
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Budget Breakdown Visualization */}
          {incomeNum > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
                  <CardTitle
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2',
                      color: 'white',
                    })}
                  >
                    <TrendingUp className={css({ w: '5', h: '5', color: 'blue.400' })} />
                    Budget Breakdown
                  </CardTitle>
                  <CardDescription>
                    Your 50/30/20 allocation based on {formatCurrency(incomeNum, currency)} monthly
                    income
                  </CardDescription>
                </CardHeader>
                <CardContent className={css({ spaceY: '6' })}>
                  {/* Visual Bar */}
                  <div
                    className={css({
                      h: '8',
                      borderRadius: 'full',
                      overflow: 'hidden',
                      display: 'flex',
                      bg: 'gray.800',
                    })}
                  >
                    <div
                      className={css({ h: 'full', bg: 'blue.500', transition: 'all 0.3s' })}
                      style={{ width: '50%' }}
                    />
                    <div
                      className={css({ h: 'full', bg: 'purple.500', transition: 'all 0.3s' })}
                      style={{ width: '30%' }}
                    />
                    <div
                      className={css({ h: 'full', bg: 'green.500', transition: 'all 0.3s' })}
                      style={{ width: '20%' }}
                    />
                  </div>

                  {/* Category Cards */}
                  <div
                    className={css({
                      display: 'grid',
                      gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                      gap: '4',
                    })}
                  >
                    {budgetBreakdown.map((cat) => {
                      const Icon = cat.icon
                      const percentage =
                        cat.actual > 0 && incomeNum > 0 ? (cat.actual / incomeNum) * 100 : 0
                      const isOverBudget = percentage > cat.percentage
                      const progressPercent = Math.min((cat.actual / cat.recommended) * 100, 100)

                      return (
                        <div
                          key={cat.id}
                          className={css({
                            p: '4',
                            bg: 'gray.800/50',
                            borderRadius: 'xl',
                            border: '1px solid',
                            borderColor: `${cat.color}.500/20`,
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
                            <div
                              className={css({
                                p: '2',
                                bg: `${cat.color}.500/20`,
                                borderRadius: 'lg',
                              })}
                            >
                              <Icon
                                className={css({ w: '4', h: '4', color: `${cat.color}.400` })}
                              />
                            </div>
                            <div>
                              <p className={css({ fontWeight: 'semibold', color: 'white' })}>
                                {cat.name}
                              </p>
                              <p className={css({ fontSize: 'xs', color: 'gray.400' })}>
                                {cat.percentage}% recommended
                              </p>
                            </div>
                          </div>
                          <div className={css({ spaceY: '2' })}>
                            <div
                              className={css({
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 'sm',
                              })}
                            >
                              <span className={css({ color: 'gray.400' })}>Actual</span>
                              <span
                                className={css({
                                  color: isOverBudget ? 'red.400' : 'white',
                                  fontWeight: 'medium',
                                })}
                              >
                                {formatCurrency(cat.actual, currency)}
                              </span>
                            </div>
                            <div
                              className={css({
                                h: '2',
                                bg: 'gray.700',
                                borderRadius: 'full',
                                overflow: 'hidden',
                              })}
                            >
                              <div
                                className={css({
                                  h: 'full',
                                  borderRadius: 'full',
                                  transition: 'all 0.3s',
                                  bg: isOverBudget ? 'red.500' : `${cat.color}.500`,
                                })}
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                            <div
                              className={css({
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: 'xs',
                              })}
                            >
                              <span className={css({ color: 'gray.500' })}>Budget</span>
                              <span className={css({ color: 'gray.400' })}>
                                {formatCurrency(cat.recommended, currency)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Actual vs Recommended Bar */}
                  <div
                    className={css({ p: '4', bg: 'gray.800/30', borderRadius: 'xl', spaceY: '3' })}
                  >
                    <p className={css({ fontSize: 'sm', color: 'gray.400', mb: '2' })}>
                      Actual Spending Distribution
                    </p>
                    <div
                      className={css({
                        h: '6',
                        borderRadius: 'full',
                        overflow: 'hidden',
                        display: 'flex',
                        bg: 'gray.700',
                      })}
                    >
                      {budgetBreakdown.map((cat) => {
                        const width = totalExpenses > 0 ? (cat.actual / totalExpenses) * 100 : 0
                        return (
                          <div
                            key={cat.id}
                            className={css({
                              h: 'full',
                              transition: 'all 0.3s',
                              bg: `${cat.color}.500`,
                            })}
                            style={{ width: `${width}%` }}
                          />
                        )
                      })}
                    </div>
                    <div
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '2',
                      })}
                    >
                      {budgetBreakdown.map((cat) => {
                        const percentage =
                          totalExpenses > 0 ? (cat.actual / totalExpenses) * 100 : 0
                        return (
                          <div
                            key={cat.id}
                            className={css({
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1',
                              fontSize: 'xs',
                            })}
                          >
                            <div
                              className={css({
                                w: '3',
                                h: '3',
                                borderRadius: 'full',
                                bg: `${cat.color}.500`,
                              })}
                            />
                            <span className={css({ color: 'gray.400' })}>
                              {cat.name}: {percentage.toFixed(1)}%
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Add Expense Card */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'purple.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
            })}
          >
            <CardHeader>
              <CardTitle
                className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'white' })}
              >
                <Wallet className={css({ w: '5', h: '5', color: 'purple.400' })} />
                Track Expenses
              </CardTitle>
              <CardDescription>Add your monthly expenses and categorize them</CardDescription>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              {/* Preset Expenses */}
              <div className={css({ spaceY: '3' })}>
                <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                  Quick Add Common Expenses:
                </p>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: '3',
                  })}
                >
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <div key={cat.id} className={css({ spaceY: '2' })}>
                      <p
                        className={css({
                          fontSize: 'xs',
                          color: `${cat.color}.400`,
                          fontWeight: 'medium',
                        })}
                      >
                        {cat.name}
                      </p>
                      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '1' })}>
                        {PRESET_EXPENSES[cat.id].slice(0, 4).map((preset) => (
                          <Button
                            key={preset.name}
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddPresetExpense(preset.name, cat.id)}
                            className={css({
                              h: '7',
                              px: '2',
                              fontSize: 'xs',
                              borderRadius: 'full',
                              border: '1px solid',
                              borderColor: `${cat.color}.500/30`,
                              _hover: { bg: `${cat.color}.500/20` },
                            })}
                          >
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Expense Form */}
              <div className={css({ p: '4', bg: 'gray.800/30', borderRadius: 'xl', spaceY: '3' })}>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: '2fr 1fr 1fr' },
                    gap: '3',
                  })}
                >
                  <Input
                    placeholder="Expense name"
                    value={newExpenseName}
                    onChange={(e) => setNewExpenseName(e.target.value)}
                    className={css({ borderColor: 'gray.700', bg: 'gray.800/50' })}
                  />
                  <div className={css({ position: 'relative' })}>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="Amount"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                      className={css({ pl: '8', borderColor: 'gray.700', bg: 'gray.800/50' })}
                    />
                    <span
                      className={css({
                        position: 'absolute',
                        left: '3',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'gray.400',
                      })}
                    >
                      {currencyInfo.symbol}
                    </span>
                  </div>
                  <div className={css({ position: 'relative' })}>
                    <Button
                      variant="outline"
                      onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                      className={css({
                        w: 'full',
                        justifyContent: 'space-between',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                      })}
                    >
                      <span className={css({ textTransform: 'capitalize' })}>
                        {newExpenseCategory}
                      </span>
                      <ChevronDown className={css({ w: '4', h: '4' })} />
                    </Button>
                    {showCategoryDropdown && (
                      <>
                        {/* biome-ignore lint/a11y/noStaticElementInteractions: Modal backdrop */}
                        <div
                          role="presentation"
                          className={css({ position: 'fixed', inset: '0', zIndex: '40' })}
                          onClick={() => setShowCategoryDropdown(false)}
                          onKeyDown={(e) => {
                            if (e.key === 'Escape') setShowCategoryDropdown(false)
                          }}
                        />
                        <div
                          className={css({
                            position: 'absolute',
                            top: '100%',
                            left: '0',
                            mt: '1',
                            w: 'full',
                            bg: 'gray.800',
                            border: '1px solid',
                            borderColor: 'gray.700',
                            borderRadius: 'lg',
                            shadow: 'xl',
                            zIndex: '50',
                          })}
                        >
                          {EXPENSE_CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => {
                                setNewExpenseCategory(cat.id)
                                setShowCategoryDropdown(false)
                              }}
                              className={css({
                                w: 'full',
                                px: '3',
                                py: '2',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '2',
                                _hover: { bg: 'gray.700' },
                                color: newExpenseCategory === cat.id ? `${cat.color}.400` : 'white',
                                cursor: 'pointer',
                              })}
                            >
                              <div
                                className={css({
                                  w: '3',
                                  h: '3',
                                  borderRadius: 'full',
                                  bg: `${cat.color}.500`,
                                })}
                              />
                              <span className={css({ textTransform: 'capitalize' })}>
                                {cat.name}
                              </span>
                              <span
                                className={css({ color: 'gray.400', fontSize: 'xs', ml: 'auto' })}
                              >
                                {cat.percentage}%
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleAddExpense}
                  className={css({ w: 'full', bg: 'purple.600', _hover: { bg: 'purple.500' } })}
                >
                  <Plus className={css({ w: '4', h: '4', mr: '2' })} />
                  Add Expense
                </Button>
              </div>

              {/* Expense List */}
              {expenses.length > 0 && (
                <div className={css({ spaceY: '2', maxH: '80', overflow: 'auto' })}>
                  {expenses.map((expense) => (
                    <motion.div
                      key={expense.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: '3',
                        bg: 'gray.800/30',
                        borderRadius: 'lg',
                        border: '1px solid',
                        borderColor: `${getCategoryColor(expense.category)}.500/20`,
                      })}
                    >
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                        <div
                          className={css({
                            w: '2',
                            h: '8',
                            borderRadius: 'full',
                            bg: `${getCategoryColor(expense.category)}.500`,
                          })}
                        />
                        <div>
                          <p className={css({ fontWeight: 'medium', color: 'white' })}>
                            {expense.name}
                          </p>
                          <p
                            className={css({
                              fontSize: 'xs',
                              color: 'gray.400',
                              textTransform: 'capitalize',
                            })}
                          >
                            {expense.category}
                          </p>
                        </div>
                      </div>
                      <div className={css({ display: 'flex', alignItems: 'center', gap: '3' })}>
                        <span className={css({ fontWeight: 'semibold', color: 'white' })}>
                          {formatCurrency(expense.amount, currency)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveExpense(expense.id)}
                          className={css({
                            color: 'gray.400',
                            _hover: { color: 'red.400', bg: 'red.500/10' },
                          })}
                        >
                          <Trash2 className={css({ w: '4', h: '4' })} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary & Actions */}
        <div className={css({ spaceY: '6' })}>
          {/* Summary Card */}
          <Card
            className={css({
              border: '1px solid',
              borderColor: 'amber.500/20',
              bg: 'gray.900/50',
              backdropFilter: 'blur(16px)',
              position: 'sticky',
              top: '24',
            })}
          >
            <CardHeader>
              <CardTitle
                className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'white' })}
              >
                <Calculator className={css({ w: '5', h: '5', color: 'amber.400' })} />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className={css({ spaceY: '4' })}>
              <div className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <span className={css({ color: 'gray.400' })}>Monthly Income</span>
                  <span className={css({ fontWeight: 'semibold', color: 'white' })}>
                    {formatCurrency(incomeNum, currency)}
                  </span>
                </div>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <span className={css({ color: 'gray.400' })}>Total Expenses</span>
                  <span className={css({ fontWeight: 'semibold', color: 'red.400' })}>
                    -{formatCurrency(totalExpenses, currency)}
                  </span>
                </div>
                <div className={css({ h: 'px', bg: 'gray.700' })} />
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  })}
                >
                  <span className={css({ color: 'gray.400' })}>Remaining</span>
                  <span
                    className={css({
                      fontWeight: 'bold',
                      fontSize: 'lg',
                      color: remainingBudget >= 0 ? 'green.400' : 'red.400',
                    })}
                  >
                    {formatCurrency(remainingBudget, currency)}
                  </span>
                </div>
              </div>

              {/* Save Budget */}
              <div
                className={css({
                  pt: '4',
                  borderTop: '1px solid',
                  borderColor: 'gray.700',
                  spaceY: '3',
                })}
              >
                <Input
                  placeholder="Budget name"
                  value={budgetName}
                  onChange={(e) => setBudgetName(e.target.value)}
                  className={css({ borderColor: 'gray.700', bg: 'gray.800/50' })}
                />
                <Button
                  onClick={handleSaveBudget}
                  className={css({ w: 'full', bg: 'amber.600', _hover: { bg: 'amber.500' } })}
                  disabled={!budgetName.trim() || incomeNum <= 0}
                >
                  <Save className={css({ w: '4', h: '4', mr: '2' })} />
                  Save Budget
                </Button>
              </div>

              {/* Export Options */}
              <div className={css({ spaceY: '2' })}>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className={css({ w: 'full', borderColor: 'gray.700' })}
                  disabled={expenses.length === 0}
                >
                  <ArrowDownToLine className={css({ w: '4', h: '4', mr: '2' })} />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyToClipboard}
                  className={css({ w: 'full', borderColor: 'gray.700' })}
                >
                  <Copy className={css({ w: '4', h: '4', mr: '2' })} />
                  Copy Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          {tips.length > 0 && (
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'cyan.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                    color: 'white',
                  })}
                >
                  <Lightbulb className={css({ w: '5', h: '5', color: 'cyan.400' })} />
                  Budget Tips
                </CardTitle>
              </CardHeader>
              <CardContent className={css({ spaceY: '3' })}>
                {tips.slice(0, 4).map((tip) => (
                  <div
                    key={tip.id}
                    className={css({
                      display: 'flex',
                      gap: '3',
                      p: '3',
                      bg: 'gray.800/30',
                      borderRadius: 'lg',
                    })}
                  >
                    <div className={css({ flexShrink: '0', mt: '0.5' })}>{tip.icon}</div>
                    <div>
                      <p className={css({ fontWeight: 'medium', color: 'white', fontSize: 'sm' })}>
                        {tip.title}
                      </p>
                      <p className={css({ fontSize: 'xs', color: 'gray.400', mt: '1' })}>
                        {tip.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Saved Budgets Modal */}
      {showSavedBudgets && (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Modal backdrop */}
          <div
            role="presentation"
            className={css({
              position: 'fixed',
              inset: '0',
              bg: 'black/70',
              backdropFilter: 'blur(4px)',
              zIndex: '50',
            })}
            onClick={() => setShowSavedBudgets(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setShowSavedBudgets(false)
            }}
          />
          <div
            className={css({
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              w: 'full',
              maxW: 'md',
              maxH: '80vh',
              overflow: 'auto',
              bg: 'gray.900',
              border: '1px solid',
              borderColor: 'gray.700',
              borderRadius: '2xl',
              p: '6',
              zIndex: '50',
            })}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: '4',
              })}
            >
              <h3 className={css({ fontSize: 'lg', fontWeight: 'semibold', color: 'white' })}>
                Saved Budgets
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowSavedBudgets(false)}>
                <X className={css({ w: '4', h: '4' })} />
              </Button>
            </div>
            {savedBudgets.length === 0 ? (
              <p className={css({ color: 'gray.400', textAlign: 'center', py: '8' })}>
                No saved budgets yet. Create and save a budget to see it here.
              </p>
            ) : (
              <div className={css({ spaceY: '3' })}>
                {savedBudgets.map((budget) => (
                  <div
                    key={budget.id}
                    className={css({
                      p: '4',
                      bg: 'gray.800/50',
                      borderRadius: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'start',
                        mb: '2',
                      })}
                    >
                      <div>
                        <p className={css({ fontWeight: 'semibold', color: 'white' })}>
                          {budget.name}
                        </p>
                        <p className={css({ fontSize: 'sm', color: 'gray.400' })}>
                          {formatCurrency(budget.income, budget.currency)} income •{' '}
                          {budget.expenses.length} expenses
                        </p>
                      </div>
                      <div className={css({ display: 'flex', gap: '1' })}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLoadBudget(budget)}
                          className={css({ color: 'green.400', _hover: { bg: 'green.500/10' } })}
                        >
                          <Check className={css({ w: '4', h: '4' })} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBudget(budget.id)}
                          className={css({ color: 'red.400', _hover: { bg: 'red.500/10' } })}
                        >
                          <Trash2 className={css({ w: '4', h: '4' })} />
                        </Button>
                      </div>
                    </div>
                    <p className={css({ fontSize: 'xs', color: 'gray.500' })}>
                      Last updated: {new Date(budget.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'gray.700/50',
            bg: 'gray.900/30',
            backdropFilter: 'blur(8px)',
          })}
        >
          <CardHeader>
            <CardTitle
              className={css({ display: 'flex', alignItems: 'center', gap: '2', color: 'white' })}
            >
              <FileText className={css({ w: '5', h: '5', color: 'blue.400' })} />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FAQAccordion faqs={budgetFAQs} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Tool Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={css({ display: 'flex', justifyContent: 'center' })}
      >
        <ToolRating toolId="budget-planner" toolName="Budget Planner" />
      </motion.div>

      {/* Social Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SocialShare
          toolName="Budget Planner"
          toolUrl="/tools/finance/budget-planner"
          description="Plan your budget with the 50/30/20 rule - allocate 50% to needs, 30% to wants, and 20% to savings for financial success."
        />
      </motion.div>

      {/* Related Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <RelatedTools currentToolPath="/tools/finance/budget-planner" category="finance" />
      </motion.div>
    </main>
  )
}
