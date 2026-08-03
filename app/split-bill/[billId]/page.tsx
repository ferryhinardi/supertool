'use client'

import { pdf } from '@react-pdf/renderer'
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Receipt,
  RefreshCw,
  Share2,
  Users,
  X,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { trackToolEvent } from '@/lib/services/analytics'
import { formatCurrency as formatCurrencyUtil } from '@/lib/tools/currency/currency'
import {
  BillPDFDocument,
  copyToClipboard,
  downloadCSV,
  exportBillToCSV,
  generateBillSummary,
} from '@/lib/tools/split-bill/split-bill-export'
import {
  getBillById,
  subscribeToBillUpdates,
  updateParticipantPaymentStatus,
} from '@/lib/tools/split-bill/split-bill-service'
import type { BillDetailResponse } from '@/lib/tools/split-bill/split-bill-types'
import { css } from '@/styled-system/css'

export default function SharedBillPage() {
  const params = useParams()
  const billId = params.billId as string

  const [billData, setBillData] = useState<BillDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  // Format currency
  const formatCurrency = (amount: number, currencyCode: string = 'IDR'): string => {
    return formatCurrencyUtil(amount, currencyCode)
  }

  // Get currency symbol
  const getCurrencySymbol = (code: string): string => {
    const symbolMap: Record<string, string> = {
      IDR: 'Rp',
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      SGD: 'S$',
      MYR: 'RM',
      THB: '฿',
    }
    return symbolMap[code] || code
  }

  // Load bill data
  useEffect(() => {
    if (!billId) return

    const loadBill = async () => {
      setLoading(true)
      setError(null)

      try {
        const data = await getBillById(billId)
        if (!data) {
          setError('Bill not found')
          trackToolEvent('split_bill_view_error', { billId, error: 'not_found' })
        } else {
          setBillData(data)
          trackToolEvent('split_bill_view', { billId, status: data.bill.status })
        }
      } catch (err) {
        console.error('Error loading bill:', err)
        setError('Failed to load bill')
        trackToolEvent('split_bill_view_error', { billId, error: 'load_failed' })
      } finally {
        setLoading(false)
      }
    }

    loadBill()
  }, [billId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!billId) return

    const unsubscribe = subscribeToBillUpdates(billId, () => {
      // Reload bill data to get latest state
      getBillById(billId).then((data) => {
        if (data) {
          setBillData(data)
          toast.success('Bill updated', {
            description: 'Someone updated their payment status',
          })
        }
      })
    })

    return () => {
      unsubscribe()
    }
  }, [billId])

  // Handle payment status toggle
  const handleTogglePayment = async (participantId: string, currentStatus: string) => {
    setUpdating(participantId)

    try {
      // Cycle through statuses: pending -> paid -> confirmed -> pending
      let newStatus: 'pending' | 'paid' | 'confirmed' = 'paid'
      if (currentStatus === 'pending') {
        newStatus = 'paid'
      } else if (currentStatus === 'paid') {
        newStatus = 'confirmed'
      } else {
        newStatus = 'pending'
      }

      const success = await updateParticipantPaymentStatus(participantId, newStatus)

      if (success) {
        toast.success(`Payment status updated to ${newStatus}`)
        trackToolEvent('split_bill_payment_update', {
          billId,
          participantId,
          status: newStatus,
        })

        // Reload bill data
        const data = await getBillById(billId)
        if (data) {
          setBillData(data)
        }
      } else {
        toast.error('Failed to update payment status')
      }
    } catch (err) {
      console.error('Error updating payment status:', err)
      toast.error('Failed to update payment status')
    } finally {
      setUpdating(null)
    }
  }

  // Copy share link
  const handleCopyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
      trackToolEvent('split_bill_copy_link', { billId })
    } catch (_err) {
      toast.error('Failed to copy link')
    }
  }

  // Refresh bill data
  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = await getBillById(billId)
      if (data) {
        setBillData(data)
        toast.success('Bill refreshed')
      }
    } catch (_err) {
      toast.error('Failed to refresh bill')
    } finally {
      setLoading(false)
    }
  }

  // Export to PDF
  const handleExportPDF = async () => {
    if (!billData) return

    try {
      toast.loading('Generating PDF...', { id: 'pdf-export' })
      const pdfDoc = <BillPDFDocument billData={billData} />
      const blob = await pdf(pdfDoc).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bill-${billData.bill.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${billId}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('PDF exported successfully!', { id: 'pdf-export' })
      trackToolEvent('split_bill_export_pdf', { billId })
    } catch (err) {
      console.error('Error exporting PDF:', err)
      toast.error('Failed to export PDF', { id: 'pdf-export' })
    }
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (!billData) return

    try {
      const csv = exportBillToCSV(billData)
      const filename = `bill-${billData.bill.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${billId}.csv`
      downloadCSV(csv, filename)
      toast.success('CSV exported successfully!')
      trackToolEvent('split_bill_export_csv', { billId })
    } catch (err) {
      console.error('Error exporting CSV:', err)
      toast.error('Failed to export CSV')
    }
  }

  // Share bill summary
  const handleShareSummary = async () => {
    if (!billData) return

    try {
      const summary = generateBillSummary(billData)
      const success = await copyToClipboard(summary)
      if (success) {
        toast.success('Bill summary copied to clipboard!')
        trackToolEvent('split_bill_share_summary', { billId })
      } else {
        toast.error('Failed to copy summary')
      }
    } catch (err) {
      console.error('Error sharing summary:', err)
      toast.error('Failed to copy summary')
    }
  }

  // Render payment status badge
  const renderStatusBadge = (status: string) => {
    if (status === 'pending') {
      return (
        <Badge size="sm" className="bg-yellow-600 text-white">
          ⏳ Pending
        </Badge>
      )
    } else if (status === 'paid') {
      return (
        <Badge size="sm" className="bg-blue-600 text-white">
          💳 Paid
        </Badge>
      )
    } else {
      return (
        <Badge size="sm" className="bg-green-600 text-white">
          ✅ Confirmed
        </Badge>
      )
    }
  }

  // Loading state
  if (loading) {
    return (
      <main
        className={css({
          mx: 'auto',
          maxW: '800px',
          w: 'full',
          px: { base: '4', sm: '6' },
          py: { base: '8', sm: '12' },
          minH: 'screen',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <div className={css({ textAlign: 'center' })}>
          <Loader2
            className={css({
              h: '12',
              w: '12',
              mx: 'auto',
              mb: '4',
              animation: 'spin 1s linear infinite',
              color: 'green.500',
            })}
          />
          <p className={css({ fontSize: 'lg', color: 'gray.300' })}>Loading bill...</p>
        </div>
      </main>
    )
  }

  // Error state
  if (error || !billData) {
    return (
      <main
        className={css({
          mx: 'auto',
          maxW: '800px',
          w: 'full',
          px: { base: '4', sm: '6' },
          py: { base: '8', sm: '12' },
          minH: 'screen',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <div className={css({ textAlign: 'center' })}>
          <X className={css({ h: '16', w: '16', mx: 'auto', mb: '4', color: 'red.500' })} />
          <h1 className={css({ mb: '2', fontSize: '2xl', fontWeight: 'bold', color: 'white' })}>
            Bill Not Found
          </h1>
          <p className={css({ mb: '6', color: 'gray.400' })}>
            {error || 'This bill does not exist or has been deleted'}
          </p>
          <Button
            onClick={() => {
              window.location.href = '/tools/split-bill'
            }}
            className={css({ minH: '11' })}
          >
            <ExternalLink className={css({ mr: '2', h: '4', w: '4' })} />
            Create New Bill
          </Button>
        </div>
      </main>
    )
  }

  const { bill, participants } = billData
  const currencySymbol = getCurrencySymbol(bill.currency)

  // Calculate statistics
  const pendingCount = participants.filter((p) => p.payment_status === 'pending').length
  const confirmedCount = participants.filter((p) => p.payment_status === 'confirmed').length
  const totalPaid = participants
    .filter((p) => p.payment_status === 'paid' || p.payment_status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.share_amount), 0)
  const totalPending = participants
    .filter((p) => p.payment_status === 'pending')
    .reduce((sum, p) => sum + Number(p.share_amount), 0)

  return (
    <main
      className={css({
        mx: 'auto',
        maxW: '800px',
        w: 'full',
        px: { base: '4', sm: '6' },
        py: { base: '6', sm: '8', md: '10' },
        display: 'flex',
        flexDirection: 'column',
        gap: { base: '4', sm: '6' },
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
              flexShrink: 0,
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
          <div className={css({ minW: 0, flex: '1' })}>
            <h1
              className={css({
                overflowWrap: 'anywhere',
                bgGradient: 'to-r',
                gradientFrom: 'green.300',
                gradientVia: 'emerald.400',
                gradientTo: 'teal.300',
                bgClip: 'text',
                fontSize: { base: '2xl', sm: '3xl', md: '4xl' },
                fontWeight: 'extrabold',
                color: 'transparent',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
              })}
            >
              {bill.title}
            </h1>
            {bill.description && (
              <p
                className={css({
                  mt: '1',
                  overflowWrap: 'anywhere',
                  fontSize: { base: 'sm', sm: 'base' },
                  color: 'gray.300',
                })}
              >
                {bill.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(5, auto)' },
            gap: '2',
          })}
        >
          <Button
            onClick={handleCopyLink}
            size="sm"
            variant="outline"
            className={css({ minH: '11' })}
          >
            <Copy className={css({ mr: '1', h: '4', w: '4' })} />
            Copy Link
          </Button>
          <Button
            onClick={handleRefresh}
            size="sm"
            variant="outline"
            className={css({ minH: '11' })}
          >
            <RefreshCw className={css({ mr: '1', h: '4', w: '4' })} />
            Refresh
          </Button>
          <Button
            onClick={handleExportPDF}
            size="sm"
            variant="outline"
            className={css({ minH: '11' })}
          >
            <Download className={css({ mr: '1', h: '4', w: '4' })} />
            Export PDF
          </Button>
          <Button
            onClick={handleExportCSV}
            size="sm"
            variant="outline"
            className={css({ minH: '11' })}
          >
            <FileText className={css({ mr: '1', h: '4', w: '4' })} />
            Export CSV
          </Button>
          <Button
            onClick={handleShareSummary}
            size="sm"
            variant="outline"
            className={css({ minH: '11' })}
          >
            <Share2 className={css({ mr: '1', h: '4', w: '4' })} />
            Share Summary
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      {bill.status === 'completed' && (
        <div
          className={css({
            rounded: 'lg',
            border: '1px solid',
            borderColor: 'green.500/30',
            bg: 'rgba(34, 197, 94, 0.1)',
            p: '4',
          })}
        >
          <div className="text-lg font-semibold text-green-400">🎉 Bill Completed!</div>
          <div className="text-sm text-gray-400 mt-1">
            All participants have confirmed their payments
          </div>
        </div>
      )}

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
            },
            gap: '4',
          })}
        >
          <div className={css({ textAlign: 'center' })}>
            <div
              className={css({
                overflowWrap: 'anywhere',
                fontSize: { base: '2xl', sm: '3xl' },
                fontWeight: 'bold',
                color: 'green.400',
              })}
            >
              {currencySymbol}
              {formatCurrency(Number(bill.total_amount), bill.currency)}
            </div>
            <div className="text-sm text-gray-400">Total Bill</div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div
              className={css({
                fontSize: { base: '2xl', sm: '3xl' },
                fontWeight: 'bold',
                color: 'emerald.400',
              })}
            >
              {participants.length}
            </div>
            <div className="text-sm text-gray-400">People</div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div className="text-3xl font-bold text-green-400">
              {confirmedCount}/{participants.length}
            </div>
            <div className="text-sm text-gray-400">Confirmed</div>
          </div>
          <div className={css({ textAlign: 'center' })}>
            <div className="text-3xl font-bold text-yellow-400">
              {pendingCount}/{participants.length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>
      </div>

      {/* Items Breakdown (if items exist) */}
      {billData.items && billData.items.length > 0 && (
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'purple.500/20',
            bg: 'rgba(139, 92, 246, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4',
          })}
        >
          <h2 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'purple.300' })}>
            <Receipt
              className={css({ display: 'inline', mr: '2', h: '5', w: '5' })}
              style={{ display: 'inline', marginBottom: '-4px' }}
            />
            Items Breakdown ({billData.items.length})
          </h2>

          <div
            className={css({
              display: 'flex',
              flexDirection: 'column',
              gap: '3',
            })}
          >
            {billData.items.map((item) => {
              const itemTotal = Number(item.price) * Number(item.quantity)
              return (
                <div
                  key={item.id}
                  className={css({
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'rgba(17, 24, 39, 0.5)',
                    p: '3',
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
                    <div className="flex-1">
                      <div className="text-base font-semibold text-white">{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                      )}
                      <div className="text-sm text-gray-400 mt-1">
                        {currencySymbol}
                        {formatCurrency(Number(item.price), bill.currency)} × {item.quantity} ={' '}
                        <span className="font-semibold text-purple-400">
                          {currencySymbol}
                          {formatCurrency(itemTotal, bill.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Show who this item is assigned to */}
                  {item.assigned_to && item.assigned_to.length > 0 && (
                    <div
                      className={css({
                        mt: '2',
                        pt: '2',
                        borderTop: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    >
                      <div className="text-xs text-gray-400 mb-1">Shared by:</div>
                      <div className={css({ display: 'flex', flexWrap: 'wrap', gap: '1' })}>
                        {item.assigned_to.map((name) => (
                          <span
                            key={name}
                            className={css({
                              px: '2',
                              py: '0.5',
                              rounded: 'md',
                              fontSize: 'xs',
                              bg: 'rgba(139, 92, 246, 0.2)',
                              color: 'purple.300',
                              border: '1px solid',
                              borderColor: 'purple.500/30',
                            })}
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                      {item.assigned_count > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {currencySymbol}
                          {formatCurrency(itemTotal / item.assigned_count, bill.currency)} per
                          person
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Items Total Summary */}
          <div
            className={css({
              rounded: 'lg',
              border: '1px solid',
              borderColor: 'purple.500/30',
              bg: 'rgba(139, 92, 246, 0.1)',
              p: '3',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            })}
          >
            <span className="text-sm font-semibold text-gray-300">Items Subtotal:</span>
            <span className="text-base font-bold text-purple-400">
              {currencySymbol}
              {formatCurrency(
                billData.items.reduce(
                  (sum, item) => sum + Number(item.price) * Number(item.quantity),
                  0
                ),
                bill.currency
              )}
            </span>
          </div>
        </div>
      )}

      {/* Bank Account Info */}
      {(bill.organizer_bank_account || bill.organizer_bank_name) && (
        <div
          className={css({
            rounded: { base: 'xl', sm: '2xl' },
            border: '2px solid',
            borderColor: 'blue.500/20',
            bg: 'rgba(59, 130, 246, 0.05)',
            p: { base: '4', sm: '5', md: '6' },
            backdropFilter: 'blur(16px)',
          })}
        >
          <h2 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'blue.300', mb: '3' })}>
            💳 Payment Details
          </h2>
          <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
            <div>
              <span className="text-sm text-gray-400">Organizer:</span>
              <p className="text-base font-semibold text-white">{bill.organizer_name}</p>
            </div>
            {bill.organizer_bank_name && (
              <div>
                <span className="text-sm text-gray-400">Bank:</span>
                <p className="text-base font-semibold text-white">{bill.organizer_bank_name}</p>
              </div>
            )}
            {bill.organizer_bank_account && (
              <div>
                <span className="text-sm text-gray-400">Account Number:</span>
                <p className="text-base font-semibold text-white font-mono">
                  {bill.organizer_bank_account}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Participants List */}
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
        <h2 className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'emerald.300' })}>
          👥 Participants ({participants.length})
        </h2>

        <div
          className={css({
            display: 'flex',
            flexDirection: 'column',
            gap: '3',
          })}
        >
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={css({
                rounded: 'lg',
                border: '1px solid',
                borderColor:
                  participant.payment_status === 'confirmed'
                    ? 'green.500/40'
                    : participant.payment_status === 'paid'
                      ? 'blue.500/40'
                      : 'gray.700',
                bg:
                  participant.payment_status === 'confirmed'
                    ? 'rgba(34, 197, 94, 0.1)'
                    : participant.payment_status === 'paid'
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'rgba(17, 24, 39, 0.5)',
                p: '4',
                transition: 'all 0.2s',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: '2',
                })}
              >
                <div>
                  <p className="text-base font-semibold text-white">{participant.name}</p>
                  {participant.email && (
                    <p className="text-xs text-gray-400 mt-0.5">{participant.email}</p>
                  )}
                </div>
                {renderStatusBadge(participant.payment_status)}
              </div>

              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: '3',
                })}
              >
                <span className="text-sm text-gray-400">Amount:</span>
                <span className="text-lg font-bold text-emerald-400">
                  {currencySymbol}
                  {formatCurrency(Number(participant.share_amount), bill.currency)}
                </span>
              </div>

              <Button
                onClick={() => handleTogglePayment(participant.id, participant.payment_status)}
                disabled={updating === participant.id}
                size="sm"
                className={css({ w: 'full' })}
                variant={participant.payment_status === 'confirmed' ? 'outline' : 'default'}
              >
                {updating === participant.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : participant.payment_status === 'confirmed' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Mark as Pending
                  </>
                ) : participant.payment_status === 'paid' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Payment
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Mark as Paid
                  </>
                )}
              </Button>

              {participant.notes && (
                <p className="text-xs text-gray-400 mt-2 italic">Note: {participant.notes}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
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
        <h3 className={css({ fontSize: 'base', fontWeight: 'bold', color: 'green.300', mb: '3' })}>
          Payment Summary
        </h3>
        <div className={css({ display: 'flex', flexDirection: 'column', gap: '2' })}>
          <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
            <span className="text-sm text-gray-400">Total Paid & Confirmed:</span>
            <span className="text-sm font-semibold text-green-400">
              {currencySymbol}
              {formatCurrency(totalPaid, bill.currency)}
            </span>
          </div>
          <div className={css({ display: 'flex', justifyContent: 'space-between' })}>
            <span className="text-sm text-gray-400">Total Pending:</span>
            <span className="text-sm font-semibold text-yellow-400">
              {currencySymbol}
              {formatCurrency(totalPending, bill.currency)}
            </span>
          </div>
          <div
            className={css({
              display: 'flex',
              justifyContent: 'space-between',
              pt: '2',
              borderTop: '1px solid',
              borderColor: 'green.500/20',
            })}
          >
            <span className="text-base font-bold text-white">Total Bill:</span>
            <span className="text-base font-bold text-green-400">
              {currencySymbol}
              {formatCurrency(Number(bill.total_amount), bill.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={css({ textAlign: 'center', py: '4' })}>
        <p className="text-sm text-gray-500">
          Created on {new Date(bill.created_at || '').toLocaleDateString()}
        </p>
        <a
          href="/tools/split-bill"
          className="text-sm text-green-400 hover:text-green-300 underline mt-2 inline-block"
        >
          Create your own split bill
        </a>
      </div>
    </main>
  )
}
