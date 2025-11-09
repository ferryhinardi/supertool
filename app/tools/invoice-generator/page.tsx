'use client'

import { motion } from 'framer-motion'
import {
  Building2,
  Download,
  FileSpreadsheet,
  Plus,
  Printer,
  Save,
  Trash2,
  User,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackToolEvent } from '@/lib/analytics'
import { CURRENCIES } from '@/lib/currency'
import { css } from '@/styled-system/css'

interface LineItem {
  id: string
  description: string
  quantity: number
  rate: number
}

interface InvoiceData {
  id: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  // From (Your Company)
  fromCompany: string
  fromEmail: string
  fromAddress: string
  fromPhone: string
  // To (Client)
  toCompany: string
  toEmail: string
  toAddress: string
  toPhone: string
  // Line Items
  lineItems: LineItem[]
  // Calculations
  taxRate: number
  discountAmount: number
  notes: string
  currency: string
}

const DEFAULT_INVOICE: InvoiceData = {
  id: '',
  invoiceNumber: `INV-${Date.now()}`,
  invoiceDate: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  fromCompany: '',
  fromEmail: '',
  fromAddress: '',
  fromPhone: '',
  toCompany: '',
  toEmail: '',
  toAddress: '',
  toPhone: '',
  lineItems: [{ id: '1', description: '', quantity: 1, rate: 0 }],
  taxRate: 0,
  discountAmount: 0,
  notes: '',
  currency: 'IDR',
}

export default function InvoiceGeneratorPage() {
  const [invoice, setInvoice] = useState<InvoiceData>(DEFAULT_INVOICE)
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([])

  // Load saved invoices from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('invoiceGenerator')
      if (saved) {
        try {
          setSavedInvoices(JSON.parse(saved))
        } catch (error) {
          console.error('Failed to load saved invoices:', error)
        }
      }
    }
  }, [])

  // Track page visit
  useEffect(() => {
    trackToolEvent('invoice_generator_open', {})
  }, [])

  // Calculate totals
  const subtotal = invoice.lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.rate
  }, 0)

  const taxAmount = (subtotal * invoice.taxRate) / 100
  const total = subtotal + taxAmount - invoice.discountAmount

  const selectedCurrency = CURRENCIES.find((c) => c.code === invoice.currency) || CURRENCIES[0]

  const formatCurrency = (amount: number) => {
    return `${selectedCurrency.symbol}${amount.toFixed(2)}`
  }

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
    }
    setInvoice({ ...invoice, lineItems: [...invoice.lineItems, newItem] })
    trackToolEvent('invoice_generator_add_item', {})
  }

  const handleRemoveLineItem = (id: string) => {
    if (invoice.lineItems.length === 1) {
      toast.error('Invoice must have at least one line item')
      return
    }
    setInvoice({
      ...invoice,
      lineItems: invoice.lineItems.filter((item) => item.id !== id),
    })
    trackToolEvent('invoice_generator_remove_item', {})
  }

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setInvoice({
      ...invoice,
      lineItems: invoice.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    })
  }

  const handleSaveInvoice = () => {
    const invoiceToSave = {
      ...invoice,
      id: invoice.id || Date.now().toString(),
    }
    const existingIndex = savedInvoices.findIndex((inv) => inv.id === invoiceToSave.id)

    let updatedInvoices: InvoiceData[]
    if (existingIndex >= 0) {
      updatedInvoices = [...savedInvoices]
      updatedInvoices[existingIndex] = invoiceToSave
      toast.success('Invoice updated!')
    } else {
      updatedInvoices = [...savedInvoices, invoiceToSave]
      toast.success('Invoice saved!')
    }

    setSavedInvoices(updatedInvoices)
    localStorage.setItem('invoiceGenerator', JSON.stringify(updatedInvoices))
    setInvoice(invoiceToSave)
    trackToolEvent('invoice_generator_save', {})
  }

  const handleLoadInvoice = (loadedInvoice: InvoiceData) => {
    setInvoice(loadedInvoice)
    toast.success('Invoice loaded!')
    trackToolEvent('invoice_generator_load', {})
  }

  const handleDeleteInvoice = (id: string) => {
    const updatedInvoices = savedInvoices.filter((inv) => inv.id !== id)
    setSavedInvoices(updatedInvoices)
    localStorage.setItem('invoiceGenerator', JSON.stringify(updatedInvoices))
    toast.success('Invoice deleted!')
    trackToolEvent('invoice_generator_delete', {})
  }

  const handleNewInvoice = () => {
    setInvoice({
      ...DEFAULT_INVOICE,
      invoiceNumber: `INV-${Date.now()}`,
    })
    toast.success('New invoice created')
    trackToolEvent('invoice_generator_new', {})
  }

  const handlePrint = () => {
    window.print()
    trackToolEvent('invoice_generator_print', {})
  }

  const handleDownloadPDF = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const { pdf, Document, Page, Text, View, StyleSheet } = await import('@react-pdf/renderer')

      const styles = StyleSheet.create({
        page: {
          padding: 40,
          fontSize: 12,
          fontFamily: 'Helvetica',
        },
        header: {
          marginBottom: 20,
          flexDirection: 'row',
          justifyContent: 'space-between',
        },
        title: {
          fontSize: 28,
          fontWeight: 'bold',
          marginBottom: 10,
        },
        section: {
          marginBottom: 15,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 5,
        },
        label: {
          fontWeight: 'bold',
          color: '#374151',
        },
        value: {
          color: '#111827',
        },
        table: {
          marginTop: 20,
          marginBottom: 20,
        },
        tableHeader: {
          flexDirection: 'row',
          borderBottomWidth: 2,
          borderBottomColor: '#111827',
          paddingBottom: 8,
          marginBottom: 8,
          fontWeight: 'bold',
        },
        tableRow: {
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderBottomColor: '#e5e7eb',
          paddingVertical: 8,
        },
        col1: { width: '50%' },
        col2: { width: '15%', textAlign: 'right' },
        col3: { width: '15%', textAlign: 'right' },
        col4: { width: '20%', textAlign: 'right' },
        totals: {
          marginTop: 20,
          marginLeft: 'auto',
          width: '40%',
        },
        totalRow: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 5,
        },
        grandTotal: {
          fontSize: 16,
          fontWeight: 'bold',
          borderTopWidth: 2,
          borderTopColor: '#111827',
          paddingTop: 10,
          marginTop: 10,
        },
        notes: {
          marginTop: 30,
          padding: 15,
          backgroundColor: '#f9fafb',
          borderRadius: 5,
        },
      })

      const InvoiceDocument = () => (
        <Document>
          <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>INVOICE</Text>
                <Text>Invoice #: {invoice.invoiceNumber}</Text>
                <Text>Date: {invoice.invoiceDate}</Text>
                <Text>Due Date: {invoice.dueDate}</Text>
              </View>
            </View>

            {/* From Section */}
            <View style={styles.section}>
              <Text style={styles.label}>From:</Text>
              <Text>{invoice.fromCompany}</Text>
              {invoice.fromEmail && <Text>{invoice.fromEmail}</Text>}
              {invoice.fromPhone && <Text>{invoice.fromPhone}</Text>}
              {invoice.fromAddress && <Text>{invoice.fromAddress}</Text>}
            </View>

            {/* To Section */}
            <View style={styles.section}>
              <Text style={styles.label}>Bill To:</Text>
              <Text>{invoice.toCompany}</Text>
              {invoice.toEmail && <Text>{invoice.toEmail}</Text>}
              {invoice.toPhone && <Text>{invoice.toPhone}</Text>}
              {invoice.toAddress && <Text>{invoice.toAddress}</Text>}
            </View>

            {/* Line Items Table */}
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Description</Text>
                <Text style={styles.col2}>Qty</Text>
                <Text style={styles.col3}>Rate</Text>
                <Text style={styles.col4}>Amount</Text>
              </View>
              {invoice.lineItems.map((item) => (
                <View key={item.id} style={styles.tableRow}>
                  <Text style={styles.col1}>{item.description}</Text>
                  <Text style={styles.col2}>{item.quantity}</Text>
                  <Text style={styles.col3}>{formatCurrency(item.rate)}</Text>
                  <Text style={styles.col4}>{formatCurrency(item.quantity * item.rate)}</Text>
                </View>
              ))}
            </View>

            {/* Totals */}
            <View style={styles.totals}>
              <View style={styles.totalRow}>
                <Text>Subtotal:</Text>
                <Text>{formatCurrency(subtotal)}</Text>
              </View>
              {invoice.taxRate > 0 && (
                <View style={styles.totalRow}>
                  <Text>Tax ({invoice.taxRate}%):</Text>
                  <Text>{formatCurrency(taxAmount)}</Text>
                </View>
              )}
              {invoice.discountAmount > 0 && (
                <View style={styles.totalRow}>
                  <Text>Discount:</Text>
                  <Text>-{formatCurrency(invoice.discountAmount)}</Text>
                </View>
              )}
              <View style={[styles.totalRow, styles.grandTotal]}>
                <Text>Total:</Text>
                <Text>{formatCurrency(total)}</Text>
              </View>
            </View>

            {/* Notes */}
            {invoice.notes && (
              <View style={styles.notes}>
                <Text style={styles.label}>Notes:</Text>
                <Text>{invoice.notes}</Text>
              </View>
            )}
          </Page>
        </Document>
      )

      const blob = await pdf(<InvoiceDocument />).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${invoice.invoiceNumber}.pdf`
      link.click()
      URL.revokeObjectURL(url)

      toast.success('Invoice downloaded as PDF!')
      trackToolEvent('invoice_generator_download', { format: 'pdf' })
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    }
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
          <FileSpreadsheet className={css({ h: '5', w: '5', color: 'blue.400' })} />
          <span
            className={css({
              fontSize: 'sm',
              fontWeight: 'semibold',
              color: 'blue.300',
            })}
          >
            Professional Invoicing
          </span>
        </div>

        <h1
          className={css({
            fontSize: { base: '4xl', sm: '5xl', md: '6xl' },
            fontWeight: 'extrabold',
            bgGradient: 'to-r',
            gradientFrom: 'blue.400',
            gradientVia: 'indigo.400',
            gradientTo: 'purple.400',
            bgClip: 'text',
          })}
          style={{
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Invoice Generator
        </h1>

        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'lg', sm: 'xl' },
            color: 'gray.400',
          })}
        >
          Create professional invoices with custom templates, tax calculations, and client
          management. Export to PDF or print instantly.
        </p>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className={css({
          display: 'flex',
          gap: '3',
          flexWrap: 'wrap',
          justifyContent: 'center',
        })}
      >
        <Button
          onClick={handleNewInvoice}
          className={css({
            gap: '2',
            bg: 'blue.500',
            color: 'white',
            _hover: { bg: 'blue.600' },
          })}
        >
          <Plus className={css({ h: '4', w: '4' })} />
          New Invoice
        </Button>
        <Button
          onClick={handleSaveInvoice}
          className={css({
            gap: '2',
            bg: 'green.500',
            color: 'white',
            _hover: { bg: 'green.600' },
          })}
        >
          <Save className={css({ h: '4', w: '4' })} />
          Save Draft
        </Button>
        <Button
          onClick={handleDownloadPDF}
          className={css({
            gap: '2',
            bg: 'purple.500',
            color: 'white',
            _hover: { bg: 'purple.600' },
          })}
        >
          <Download className={css({ h: '4', w: '4' })} />
          Download PDF
        </Button>
        <Button
          onClick={handlePrint}
          className={css({
            gap: '2',
            bg: 'gray.700',
            color: 'white',
            _hover: { bg: 'gray.600' },
          })}
        >
          <Printer className={css({ h: '4', w: '4' })} />
          Print
        </Button>
      </motion.div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: {
            base: '1fr',
            lg: 'minmax(0, 2fr) minmax(0, 1fr)',
          },
          gap: '6',
        })}
      >
        {/* Main Invoice Form */}
        <div className={css({ spaceY: '6' })}>
          {/* Invoice Details */}
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
                <CardTitle>Invoice Details</CardTitle>
                <CardDescription>Basic invoice information</CardDescription>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="invoice-number"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Invoice Number
                    </label>
                    <Input
                      id="invoice-number"
                      value={invoice.invoiceNumber}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          invoiceNumber: e.target.value,
                        })
                      }
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="currency"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={invoice.currency}
                      onChange={(e) => setInvoice({ ...invoice, currency: e.target.value })}
                      className={css({
                        w: 'full',
                        h: '10',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/50',
                        px: '3',
                        fontSize: 'sm',
                        color: 'gray.200',
                        cursor: 'pointer',
                        _focus: {
                          outline: 'none',
                          borderColor: 'blue.500',
                          ring: '2px',
                          ringColor: 'blue.500/20',
                        },
                      })}
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} - {curr.name} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="invoice-date"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Invoice Date
                    </label>
                    <Input
                      id="invoice-date"
                      type="date"
                      value={invoice.invoiceDate}
                      onChange={(e) => setInvoice({ ...invoice, invoiceDate: e.target.value })}
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="due-date"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Due Date
                    </label>
                    <Input
                      id="due-date"
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* From (Your Company) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
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
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <Building2 className={css({ h: '5', w: '5', color: 'blue.400' })} />
                  <CardTitle>From (Your Company)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="from-company"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Company Name *
                  </label>
                  <Input
                    id="from-company"
                    value={invoice.fromCompany}
                    onChange={(e) => setInvoice({ ...invoice, fromCompany: e.target.value })}
                    placeholder="Your Company Name"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="from-email"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Email
                    </label>
                    <Input
                      id="from-email"
                      type="email"
                      value={invoice.fromEmail}
                      onChange={(e) => setInvoice({ ...invoice, fromEmail: e.target.value })}
                      placeholder="company@example.com"
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="from-phone"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Phone
                    </label>
                    <Input
                      id="from-phone"
                      type="tel"
                      value={invoice.fromPhone}
                      onChange={(e) => setInvoice({ ...invoice, fromPhone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                </div>
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="from-address"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Address
                  </label>
                  <Input
                    id="from-address"
                    value={invoice.fromAddress}
                    onChange={(e) => setInvoice({ ...invoice, fromAddress: e.target.value })}
                    placeholder="123 Business St, City, Country"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* To (Client) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'indigo.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <div
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2',
                  })}
                >
                  <User className={css({ h: '5', w: '5', color: 'indigo.400' })} />
                  <CardTitle>Bill To (Client)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="to-company"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Client Name *
                  </label>
                  <Input
                    id="to-company"
                    value={invoice.toCompany}
                    onChange={(e) => setInvoice({ ...invoice, toCompany: e.target.value })}
                    placeholder="Client Company Name"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="to-email"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Email
                    </label>
                    <Input
                      id="to-email"
                      type="email"
                      value={invoice.toEmail}
                      onChange={(e) => setInvoice({ ...invoice, toEmail: e.target.value })}
                      placeholder="client@example.com"
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="to-phone"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Phone
                    </label>
                    <Input
                      id="to-phone"
                      type="tel"
                      value={invoice.toPhone}
                      onChange={(e) => setInvoice({ ...invoice, toPhone: e.target.value })}
                      placeholder="+1 234 567 8900"
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                </div>
                <div className={css({ spaceY: '2' })}>
                  <label
                    htmlFor="to-address"
                    className={css({
                      fontSize: 'sm',
                      fontWeight: 'medium',
                      color: 'gray.300',
                    })}
                  >
                    Address
                  </label>
                  <Input
                    id="to-address"
                    value={invoice.toAddress}
                    onChange={(e) => setInvoice({ ...invoice, toAddress: e.target.value })}
                    placeholder="456 Client Ave, City, Country"
                    className={css({
                      bg: 'gray.800/50',
                      border: '1px solid',
                      borderColor: 'gray.700',
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Line Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
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
                  <CardTitle>Line Items</CardTitle>
                  <Button
                    onClick={handleAddLineItem}
                    size="sm"
                    className={css({
                      gap: '2',
                      bg: 'purple.500',
                      color: 'white',
                      _hover: { bg: 'purple.600' },
                    })}
                  >
                    <Plus className={css({ h: '4', w: '4' })} />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={css({ spaceY: '4' })}>
                {invoice.lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={css({
                      p: '4',
                      rounded: 'lg',
                      border: '1px solid',
                      borderColor: 'gray.700',
                      bg: 'gray.800/30',
                      spaceY: '3',
                    })}
                  >
                    <div
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      })}
                    >
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.400',
                        })}
                      >
                        Item #{index + 1}
                      </span>
                      {invoice.lineItems.length > 1 && (
                        <Button
                          onClick={() => handleRemoveLineItem(item.id)}
                          size="sm"
                          className={css({
                            gap: '2',
                            bg: 'transparent',
                            color: 'gray.500',
                            _hover: { bg: 'red.500/20', color: 'red.400' },
                          })}
                        >
                          <Trash2 className={css({ h: '4', w: '4' })} />
                        </Button>
                      )}
                    </div>
                    <div className={css({ spaceY: '2' })}>
                      <label
                        htmlFor={`description-${item.id}`}
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'medium',
                          color: 'gray.300',
                        })}
                      >
                        Description *
                      </label>
                      <Input
                        id={`description-${item.id}`}
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(item.id, 'description', e.target.value)
                        }
                        placeholder="Service or product description"
                        className={css({
                          bg: 'gray.800/50',
                          border: '1px solid',
                          borderColor: 'gray.700',
                        })}
                      />
                    </div>
                    <div
                      className={css({
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '3',
                      })}
                    >
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor={`quantity-${item.id}`}
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'gray.300',
                          })}
                        >
                          Quantity
                        </label>
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleLineItemChange(item.id, 'quantity', Number(e.target.value))
                          }
                          className={css({
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                          })}
                        />
                      </div>
                      <div className={css({ spaceY: '2' })}>
                        <label
                          htmlFor={`rate-${item.id}`}
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'gray.300',
                          })}
                        >
                          Rate ({selectedCurrency.symbol})
                        </label>
                        <Input
                          id={`rate-${item.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) =>
                            handleLineItemChange(item.id, 'rate', Number(e.target.value))
                          }
                          className={css({
                            bg: 'gray.800/50',
                            border: '1px solid',
                            borderColor: 'gray.700',
                          })}
                        />
                      </div>
                      <div className={css({ spaceY: '2' })}>
                        <div
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'gray.300',
                          })}
                        >
                          Amount
                        </div>
                        <div
                          className={css({
                            h: '10',
                            px: '3',
                            rounded: 'lg',
                            border: '1px solid',
                            borderColor: 'purple.500/30',
                            bg: 'purple.500/10',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: 'purple.300',
                          })}
                        >
                          {formatCurrency(item.quantity * item.rate)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tax & Discount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>Tax & Discount</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={css({
                    display: 'grid',
                    gridTemplateColumns: { base: '1fr', sm: 'repeat(2, 1fr)' },
                    gap: '4',
                  })}
                >
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="tax-rate"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Tax Rate (%)
                    </label>
                    <Input
                      id="tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={invoice.taxRate}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          taxRate: Number(e.target.value),
                        })
                      }
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                  <div className={css({ spaceY: '2' })}>
                    <label
                      htmlFor="discount"
                      className={css({
                        fontSize: 'sm',
                        fontWeight: 'medium',
                        color: 'gray.300',
                      })}
                    >
                      Discount ({selectedCurrency.symbol})
                    </label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={invoice.discountAmount}
                      onChange={(e) =>
                        setInvoice({
                          ...invoice,
                          discountAmount: Number(e.target.value),
                        })
                      }
                      className={css({
                        bg: 'gray.800/50',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'cyan.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Payment terms, thank you message, etc.</CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  value={invoice.notes}
                  onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                  placeholder="Thank you for your business! Payment is due within 30 days."
                  rows={4}
                  className={css({
                    w: 'full',
                    rounded: 'lg',
                    border: '1px solid',
                    borderColor: 'gray.700',
                    bg: 'gray.800/50',
                    px: '3',
                    py: '2',
                    fontSize: 'sm',
                    color: 'gray.200',
                    resize: 'vertical',
                    _focus: {
                      outline: 'none',
                      borderColor: 'cyan.500',
                      ring: '2px',
                      ringColor: 'cyan.500/20',
                    },
                  })}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar - Summary & Saved Invoices */}
        <div className={css({ spaceY: '6' })}>
          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card
              className={css({
                border: '1px solid',
                borderColor: 'blue.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
                position: { lg: 'sticky' },
                top: { lg: '6' },
              })}
            >
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className={css({ spaceY: '3' })}>
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'sm',
                    color: 'gray.400',
                  })}
                >
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {invoice.taxRate > 0 && (
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'sm',
                      color: 'gray.400',
                    })}
                  >
                    <span>Tax ({invoice.taxRate}%):</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {invoice.discountAmount > 0 && (
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'sm',
                      color: 'green.400',
                    })}
                  >
                    <span>Discount:</span>
                    <span>-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                <div
                  className={css({
                    pt: '3',
                    mt: '3',
                    borderTop: '2px solid',
                    borderTopColor: 'gray.700',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 'lg',
                    fontWeight: 'bold',
                    color: 'blue.300',
                  })}
                >
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Saved Invoices */}
          {savedInvoices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Card
                className={css({
                  border: '1px solid',
                  borderColor: 'green.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <CardHeader>
                  <CardTitle>Saved Drafts ({savedInvoices.length})</CardTitle>
                </CardHeader>
                <CardContent className={css({ spaceY: '2' })}>
                  {savedInvoices.map((savedInvoice) => (
                    <div
                      key={savedInvoice.id}
                      className={css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: '3',
                        rounded: 'lg',
                        border: '1px solid',
                        borderColor: 'gray.700',
                        bg: 'gray.800/30',
                        transition: 'all 0.2s',
                        _hover: { bg: 'gray.800', borderColor: 'green.500/50' },
                      })}
                    >
                      <button
                        type="button"
                        onClick={() => handleLoadInvoice(savedInvoice)}
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
                            fontSize: 'sm',
                            fontWeight: 'medium',
                            color: 'gray.200',
                          })}
                        >
                          {savedInvoice.invoiceNumber}
                        </div>
                        <div className={css({ fontSize: 'xs', color: 'gray.500' })}>
                          {savedInvoice.toCompany || 'No client'}
                        </div>
                      </button>
                      <Button
                        onClick={() => handleDeleteInvoice(savedInvoice.id)}
                        size="sm"
                        className={css({
                          gap: '2',
                          bg: 'transparent',
                          color: 'gray.500',
                          _hover: { bg: 'red.500/20', color: 'red.400' },
                        })}
                      >
                        <Trash2 className={css({ h: '3', w: '3' })} />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

    {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

    <ToolSearch />

    
    </main>
  )
}
