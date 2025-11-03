import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { BillDetailResponse } from './split-bill-types'

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #22C55E',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 5,
  },
  description: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    borderBottom: '1 solid #E5E7EB',
    paddingBottom: 4,
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  infoBox: {
    flex: '1 1 45%',
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 4,
    border: '1 solid #E5E7EB',
  },
  infoLabel: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 10,
  },
  tableHeader: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontWeight: 'bold',
    borderBottom: '1 solid #D1D5DB',
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #E5E7EB',
  },
  tableRowEven: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    fontSize: 10,
  },
  statusBadge: {
    fontSize: 8,
    padding: '2 6',
    borderRadius: 3,
    fontWeight: 'bold',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusPaid: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  statusConfirmed: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  footer: {
    marginTop: 20,
    paddingTop: 10,
    borderTop: '1 solid #E5E7EB',
    fontSize: 8,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  itemBox: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
    border: '1 solid #E5E7EB',
  },
  itemName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 9,
    color: '#6B7280',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 9,
    color: '#4B5563',
  },
  itemAssignedTo: {
    fontSize: 8,
    color: '#7C3AED',
    marginTop: 3,
    paddingTop: 3,
    borderTop: '1 solid #E5E7EB',
  },
})

// Format currency helper
const formatCurrency = (amount: number, currency: string): string => {
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
  const symbol = symbolMap[currency] || currency
  return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Format date helper
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Get split type label
const getSplitTypeLabel = (splitType: string): string => {
  switch (splitType) {
    case 'equal':
      return 'Equal Split'
    case 'percentage':
      return 'Percentage-Based Split'
    case 'custom':
      return 'Per-Item Split'
    default:
      return splitType
  }
}

// PDF Document Component
export function BillPDFDocument({ billData }: { billData: BillDetailResponse }) {
  const { bill, participants, items } = billData

  const totalPaid = participants
    .filter((p) => p.payment_status === 'paid' || p.payment_status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.share_amount), 0)

  const totalPending = participants
    .filter((p) => p.payment_status === 'pending')
    .reduce((sum, p) => sum + Number(p.share_amount), 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{bill.title}</Text>
          {bill.description && <Text style={styles.description}>{bill.description}</Text>}
          <Text style={styles.subtitle}>
            Created: {formatDate(bill.created_at || new Date().toISOString())} • Bill ID:{' '}
            {bill.id || 'N/A'}
          </Text>
        </View>

        {/* Bill Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Amount</Text>
              <Text style={styles.infoValue}>
                {formatCurrency(Number(bill.total_amount), bill.currency)}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Currency</Text>
              <Text style={styles.infoValue}>{bill.currency}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Split Type</Text>
              <Text style={styles.infoValue}>{getSplitTypeLabel(bill.split_type)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={styles.infoValue}>{bill.status.toUpperCase()}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Paid/Confirmed</Text>
              <Text style={styles.infoValue}>{formatCurrency(totalPaid, bill.currency)}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Total Pending</Text>
              <Text style={styles.infoValue}>{formatCurrency(totalPending, bill.currency)}</Text>
            </View>
          </View>
        </View>

        {/* Organizer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Organizer Name</Text>
              <Text style={styles.infoValue}>{bill.organizer_name}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Bank Name</Text>
              <Text style={styles.infoValue}>{bill.organizer_bank_name}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Account Number</Text>
              <Text style={styles.infoValue}>{bill.organizer_bank_account}</Text>
            </View>
          </View>
        </View>

        {/* Items Breakdown (if exists) */}
        {items && items.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items ({items.length})</Text>
            {items.map((item) => {
              const itemTotal = Number(item.price) * Number(item.quantity)
              return (
                <View key={item.id} style={styles.itemBox}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.description && (
                    <Text style={styles.itemDescription}>{item.description}</Text>
                  )}
                  <Text style={styles.itemPrice}>
                    {formatCurrency(Number(item.price), bill.currency)} × {item.quantity} ={' '}
                    {formatCurrency(itemTotal, bill.currency)}
                  </Text>
                  {item.assigned_to && item.assigned_to.length > 0 && (
                    <Text style={styles.itemAssignedTo}>
                      Shared by: {item.assigned_to.join(', ')}
                    </Text>
                  )}
                </View>
              )
            })}
          </View>
        )}

        {/* Participants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Participants ({participants.length})</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, { flex: 2 }]}>Name</Text>
              <Text style={[styles.tableCell, { flex: 1 }]}>Amount</Text>
              {bill.split_type === 'percentage' && (
                <Text style={[styles.tableCell, { flex: 1 }]}>Share %</Text>
              )}
              <Text style={[styles.tableCell, { flex: 1 }]}>Status</Text>
            </View>
            {participants.map((participant, index) => (
              <View
                key={participant.id}
                style={[styles.tableRow, index % 2 === 1 ? styles.tableRowEven : {}]}
              >
                <Text style={[styles.tableCell, { flex: 2 }]}>{participant.name}</Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  {formatCurrency(Number(participant.share_amount), bill.currency)}
                </Text>
                {bill.split_type === 'percentage' && (
                  <Text style={[styles.tableCell, { flex: 1 }]}>
                    {participant.share_percentage
                      ? `${participant.share_percentage.toFixed(2)}%`
                      : 'N/A'}
                  </Text>
                )}
                <Text
                  style={[
                    styles.tableCell,
                    { flex: 1 },
                    participant.payment_status === 'pending'
                      ? styles.statusPending
                      : participant.payment_status === 'paid'
                        ? styles.statusPaid
                        : styles.statusConfirmed,
                  ]}
                >
                  {participant.payment_status.toUpperCase()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Generated from SuperTool - Split Bill Calculator</Text>
          <Text>Visit: https://supertool.app/tools/split-bill</Text>
        </View>
      </Page>
    </Document>
  )
}

// Export to CSV function
export function exportBillToCSV(billData: BillDetailResponse): string {
  const { bill, participants, items } = billData

  // CSV Header
  const lines: string[] = []
  lines.push(`"Bill Information"`)
  lines.push(`"Title","${bill.title}"`)
  lines.push(`"Description","${bill.description || ''}"`)
  lines.push(`"Total Amount","${formatCurrency(Number(bill.total_amount), bill.currency)}"`)
  lines.push(`"Currency","${bill.currency}"`)
  lines.push(`"Split Type","${getSplitTypeLabel(bill.split_type)}"`)
  lines.push(`"Status","${bill.status}"`)
  lines.push(`"Created","${formatDate(bill.created_at || new Date().toISOString())}"`)
  lines.push(``)

  // Organizer Information
  lines.push(`"Organizer Information"`)
  lines.push(`"Name","${bill.organizer_name}"`)
  lines.push(`"Bank Name","${bill.organizer_bank_name}"`)
  lines.push(`"Account Number","${bill.organizer_bank_account}"`)
  lines.push(``)

  // Items (if exists)
  if (items && items.length > 0) {
    lines.push(`"Items"`)
    lines.push(`"Name","Description","Price","Quantity","Total","Assigned To"`)
    items.forEach((item) => {
      const itemTotal = Number(item.price) * Number(item.quantity)
      const assignedTo =
        item.assigned_to && item.assigned_to.length > 0 ? item.assigned_to.join('; ') : 'N/A'
      lines.push(
        `"${item.name}","${item.description || ''}","${formatCurrency(Number(item.price), bill.currency)}","${item.quantity}","${formatCurrency(itemTotal, bill.currency)}","${assignedTo}"`
      )
    })
    lines.push(``)
  }

  // Participants
  lines.push(`"Participants"`)
  if (bill.split_type === 'percentage') {
    lines.push(`"Name","Email","Amount","Share %","Status"`)
    participants.forEach((p) => {
      const sharePercentage = p.share_percentage ? `${p.share_percentage.toFixed(2)}%` : 'N/A'
      lines.push(
        `"${p.name}","${p.email || ''}","${formatCurrency(Number(p.share_amount), bill.currency)}","${sharePercentage}","${p.payment_status}"`
      )
    })
  } else {
    lines.push(`"Name","Email","Amount","Status"`)
    participants.forEach((p) => {
      lines.push(
        `"${p.name}","${p.email || ''}","${formatCurrency(Number(p.share_amount), bill.currency)}","${p.payment_status}"`
      )
    })
  }

  return lines.join('\n')
}

// Download CSV helper
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Generate shareable summary text
export function generateBillSummary(billData: BillDetailResponse): string {
  const { bill, participants } = billData

  const confirmedCount = participants.filter((p) => p.payment_status === 'confirmed').length
  const totalPaid = participants
    .filter((p) => p.payment_status === 'paid' || p.payment_status === 'confirmed')
    .reduce((sum, p) => sum + Number(p.share_amount), 0)

  const summary: string[] = []
  summary.push(`📋 ${bill.title}`)
  if (bill.description) {
    summary.push(`${bill.description}`)
  }
  summary.push(``)
  summary.push(`💰 Total: ${formatCurrency(Number(bill.total_amount), bill.currency)}`)
  summary.push(`👥 People: ${participants.length}`)
  summary.push(`✅ Confirmed: ${confirmedCount}/${participants.length}`)
  summary.push(`💳 Paid: ${formatCurrency(totalPaid, bill.currency)}`)
  summary.push(``)
  summary.push(`🏦 Payment to: ${bill.organizer_name}`)
  summary.push(`   ${bill.organizer_bank_name} - ${bill.organizer_bank_account}`)
  summary.push(``)
  summary.push(`👤 Participants:`)
  participants.forEach((p) => {
    const status =
      p.payment_status === 'confirmed' ? '✅' : p.payment_status === 'paid' ? '💳' : '⏳'
    const percentage =
      bill.split_type === 'percentage' && p.share_percentage
        ? ` (${p.share_percentage.toFixed(2)}%)`
        : ''
    summary.push(
      `   ${status} ${p.name}: ${formatCurrency(Number(p.share_amount), bill.currency)}${percentage}`
    )
  })
  summary.push(``)
  summary.push(`🔗 View & update: ${typeof window !== 'undefined' ? window.location.href : ''}`)

  return summary.join('\n')
}

// Copy to clipboard helper
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}
