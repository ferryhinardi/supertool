'use client'

import { Clock, Eye, Link2, Plus, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/analytics'
import { formatCurrency as formatCurrencyUtil, getCurrencySymbol } from '@/lib/currency'
import { getAllBills } from '@/lib/split-bill-service'
import type { SplitBillSummary } from '@/lib/split-bill-types'
import { css } from '@/styled-system/css'

type SortField = 'created_at' | 'total_amount' | 'title'
type SortOrder = 'asc' | 'desc'
type FilterStatus = 'all' | 'active' | 'completed' | 'cancelled'

export default function BillHistoryPage() {
  const [bills, setBills] = useState<SplitBillSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  // Load bills
  useEffect(() => {
    const loadBills = async () => {
      try {
        setLoading(true)
        const data = await getAllBills()
        setBills(data)
        trackToolEvent('split_bill_view', {
          bill_count: data.length,
        })
      } catch (error) {
        console.error('Error loading bills:', error)
        toast.error('Failed to load bill history')
      } finally {
        setLoading(false)
      }
    }

    loadBills()
  }, [])

  // Filter bills by status
  const filteredBills = bills.filter((bill) => {
    if (filterStatus === 'all') return true
    return bill.status === filterStatus
  })

  // Sort bills
  const sortedBills = [...filteredBills].sort((a, b) => {
    let comparison = 0

    switch (sortField) {
      case 'created_at':
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        break
      case 'total_amount':
        comparison = a.total_amount - b.total_amount
        break
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Format currency
  const formatCurrency = (amount: number, currencyCode: string) => {
    return formatCurrencyUtil(amount, currencyCode)
  }

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return { variant: 'default' as const, text: '🟢 Active', color: 'green' }
      case 'completed':
        return { variant: 'default' as const, text: '✅ Completed', color: 'blue' }
      case 'cancelled':
        return { variant: 'outline' as const, text: '❌ Cancelled', color: 'gray' }
      default:
        return { variant: 'outline' as const, text: status, color: 'gray' }
    }
  }

  // Get payment completion percentage
  const getPaymentPercentage = (bill: SplitBillSummary) => {
    if (bill.total_participants === 0) return 0
    return Math.round((bill.paid_count / bill.total_participants) * 100)
  }

  // Calculate total stats
  const totalStats = {
    totalBills: bills.length,
    activeBills: bills.filter((b) => b.status === 'active').length,
    completedBills: bills.filter((b) => b.status === 'completed').length,
    totalAmount: bills.reduce((sum, b) => sum + b.total_amount, 0),
  }

  return (
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
          flexDirection: { base: 'column', sm: 'row' },
          alignItems: { base: 'start', sm: 'center' },
          justifyContent: 'space-between',
          gap: '4',
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
            <Clock className="h-6 w-6 text-white sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-green-300 via-emerald-400 to-teal-300 bg-clip-text text-2xl font-extrabold text-transparent drop-shadow-lg sm:text-3xl md:text-4xl">
              Bill History
            </h1>
            <p className="text-sm text-gray-200 sm:text-base">
              View and manage all your split bills
            </p>
          </div>
        </div>

        <Link href="/tools/split-bill">
          <Button
            size="lg"
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '2',
            })}
          >
            <Plus className="h-5 w-5" />
            Create New Bill
          </Button>
        </Link>
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
              base: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: '4',
          })}
        >
          <div className={css({ textAlign: 'center' })}>
            <div className="text-3xl font-bold text-green-400">{totalStats.totalBills}</div>
            <div className="text-sm text-gray-400">Total Bills</div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div className="text-3xl font-bold text-emerald-400">{totalStats.activeBills}</div>
            <div className="text-sm text-gray-400">Active</div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div className="text-3xl font-bold text-teal-400">{totalStats.completedBills}</div>
            <div className="text-sm text-gray-400">Completed</div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div className="text-3xl font-bold text-green-400">
              {totalStats.totalAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total Value</div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div
        className={css({
          rounded: { base: 'xl', sm: '2xl' },
          border: '2px solid',
          borderColor: 'green.500/20',
          bg: 'rgba(17, 24, 39, 0.5)',
          p: { base: '4', sm: '5' },
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: { base: 'column', md: 'row' },
          gap: '4',
          alignItems: { base: 'stretch', md: 'center' },
          justifyContent: 'space-between',
        })}
      >
        {/* Status Filter */}
        <div
          className={css({
            display: 'flex',
            gap: '2',
            flexWrap: 'wrap',
          })}
        >
          <Button
            size="sm"
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
          >
            Active
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </Button>
          <Button
            size="sm"
            variant={filterStatus === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('cancelled')}
          >
            Cancelled
          </Button>
        </div>

        {/* Sort Options */}
        <div
          className={css({
            display: 'flex',
            gap: '2',
            alignItems: 'center',
          })}
        >
          <span className="text-sm text-gray-400">Sort by:</span>
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
            className={css({
              rounded: 'lg',
              border: '2px solid',
              borderColor: 'gray.700',
              bg: 'rgba(17, 24, 39, 0.7)',
              px: '3',
              py: '1.5',
              color: 'white',
              fontSize: 'sm',
              cursor: 'pointer',
              _focus: {
                borderColor: 'green.500',
                outline: 'none',
              },
            })}
          >
            <option value="created_at">Date</option>
            <option value="total_amount">Amount</option>
            <option value="title">Title</option>
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            <TrendingUp
              className={css({
                h: '4',
                w: '4',
                transform: sortOrder === 'desc' ? 'rotate(180deg)' : 'rotate(0)',
                transition: 'transform 0.2s',
              })}
            />
          </Button>
        </div>
      </div>

      {/* Bills List */}
      <div
        className={css({
          display: 'flex',
          flexDirection: 'column',
          gap: '3',
        })}
      >
        {loading ? (
          <div
            className={css({
              textAlign: 'center',
              py: '12',
              color: 'gray.400',
            })}
          >
            Loading bills...
          </div>
        ) : sortedBills.length === 0 ? (
          <div
            className={css({
              rounded: { base: 'xl', sm: '2xl' },
              border: '2px solid',
              borderColor: 'gray.700',
              bg: 'rgba(17, 24, 39, 0.5)',
              p: { base: '8', sm: '12' },
              textAlign: 'center',
              backdropFilter: 'blur(16px)',
            })}
          >
            <Users className="mx-auto h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">No bills found</h3>
            <p className="text-gray-400 mb-6">
              {filterStatus === 'all'
                ? "You haven't created any bills yet"
                : `No ${filterStatus} bills found`}
            </p>
            <Link href="/tools/split-bill">
              <Button size="lg">Create Your First Bill</Button>
            </Link>
          </div>
        ) : (
          sortedBills.map((bill) => {
            const statusBadge = getStatusBadge(bill.status)
            const paymentPercentage = getPaymentPercentage(bill)
            const currencySymbol = getCurrencySymbol(bill.currency || 'USD')

            return (
              <div
                key={bill.id}
                className={css({
                  rounded: { base: 'xl', sm: '2xl' },
                  border: '2px solid',
                  borderColor: 'green.500/20',
                  bg: 'rgba(17, 24, 39, 0.5)',
                  p: { base: '4', sm: '5' },
                  backdropFilter: 'blur(16px)',
                  transition: 'all 0.2s',
                  _hover: {
                    borderColor: 'green.500/40',
                    bg: 'rgba(17, 24, 39, 0.7)',
                  },
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    flexDirection: { base: 'column', sm: 'row' },
                    gap: '4',
                    justifyContent: 'space-between',
                  })}
                >
                  {/* Left Section */}
                  <div className={css({ flex: '1', minW: '0' })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'start',
                        gap: '2',
                        mb: '2',
                      })}
                    >
                      <h3
                        className={css({
                          fontSize: { base: 'lg', sm: 'xl' },
                          fontWeight: 'bold',
                          color: 'white',
                          flex: '1',
                          minW: '0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        })}
                      >
                        {bill.title}
                      </h3>
                      <Badge
                        size="sm"
                        className={css({
                          bg: `${statusBadge.color}.600`,
                          color: 'white',
                        })}
                      >
                        {statusBadge.text}
                      </Badge>
                    </div>

                    {bill.description && (
                      <p className="text-sm text-gray-400 mb-3 line-clamp-2">{bill.description}</p>
                    )}

                    <div
                      className={css({
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '3',
                        color: 'gray.400',
                        fontSize: 'sm',
                      })}
                    >
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(bill.created_at)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {bill.total_participants}{' '}
                        {bill.total_participants === 1 ? 'person' : 'people'}
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-green-400">
                        {currencySymbol}
                        {formatCurrency(bill.total_amount, bill.currency)}
                      </div>
                    </div>

                    {/* Payment Progress */}
                    <div className="mt-3">
                      <div
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: '1',
                        })}
                      >
                        <span className="text-xs text-gray-400">Payment Progress</span>
                        <span className="text-xs text-gray-400">
                          {bill.paid_count}/{bill.total_participants} paid
                        </span>
                      </div>
                      <div
                        className={css({
                          h: '2',
                          rounded: 'full',
                          bg: 'gray.700',
                          overflow: 'hidden',
                        })}
                      >
                        <div
                          className={css({
                            h: 'full',
                            bg: 'green.500',
                            transition: 'width 0.3s',
                          })}
                          style={{ width: `${paymentPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Actions */}
                  <div
                    className={css({
                      display: 'flex',
                      flexDirection: { base: 'row', sm: 'column' },
                      gap: '2',
                      alignItems: { base: 'stretch', sm: 'end' },
                    })}
                  >
                    <Link
                      href={`/split-bill/${bill.id}`}
                      className={css({ flex: { base: '1', sm: 'initial' } })}
                    >
                      <Button
                        size="sm"
                        variant="default"
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                          w: 'full',
                        })}
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const url = `${window.location.origin}/split-bill/${bill.id}`
                        await navigator.clipboard.writeText(url)
                        toast.success('Link copied to clipboard!')
                        trackToolEvent('split_bill_copy_link', {
                          action: 'copy_link',
                        })
                      }}
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2',
                        w: { base: 'auto', sm: 'full' },
                      })}
                    >
                      <Link2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Organizer Info */}
                <div
                  className={css({
                    mt: '3',
                    pt: '3',
                    borderTop: '1px solid',
                    borderColor: 'gray.700',
                    fontSize: 'xs',
                    color: 'gray.500',
                  })}
                >
                  Organized by{' '}
                  <span className="font-medium text-gray-400">{bill.organizer_name}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
