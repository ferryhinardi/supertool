# Invoice Generator

**Created**: January 6, 2026
**Last Updated**: January 6, 2026
**Tool Path**: `/tools/productivity/invoice-generator`
**Category**: Productivity Tools
**Complexity**: Very Complex (1446 lines)

## Overview

The Invoice Generator is a comprehensive invoicing solution that creates professional PDF invoices with customizable templates, multi-currency support, tax calculations, and client management. All data is stored locally in your browser, and invoices can be exported as PDFs or printed directly.

## Key Features

### 1. Complete Invoice Creation

- Auto-generated invoice numbers
- Customizable invoice and due dates
- Your company details (From)
- Client details (Bill To)
- Unlimited line items
- Notes/Terms section

### 2. Multi-Currency Support

Supports all major currencies including:

| Currency | Symbol | Region |
|----------|--------|--------|
| IDR | Rp | Indonesia |
| USD | $ | United States |
| EUR | € | Europe |
| GBP | £ | United Kingdom |
| JPY | ¥ | Japan |
| CNY | ¥ | China |
| And many more... |

### 3. Financial Calculations

- **Subtotal**: Sum of all line items (quantity × rate)
- **Tax Rate**: Configurable percentage (0-100%)
- **Discount**: Fixed amount deduction
- **Grand Total**: Automatic calculation

### 4. Export Options

- **PDF Download**: Professional PDF with @react-pdf/renderer
- **Print**: Native browser print dialog
- **Save Draft**: Local storage persistence

### 5. Draft Management

- Save unlimited invoice drafts
- Load and edit saved invoices
- Delete unwanted drafts
- Quick access sidebar

## How to Use

### Creating a New Invoice

1. **Invoice Details**:
   - Invoice number auto-generates (or customize)
   - Select currency
   - Set invoice date and due date

2. **Your Company (From)**:
   - Enter company name (required)
   - Add email, phone, address

3. **Client (Bill To)**:
   - Enter client name (required)
   - Add contact details

4. **Line Items**:
   - Add description for each item
   - Set quantity and rate
   - Amount calculates automatically
   - Click "Add Item" for more lines

5. **Tax & Discount**:
   - Set tax rate percentage
   - Apply discount amount

6. **Notes**:
   - Add payment terms
   - Include thank you message

### Exporting Your Invoice

**Download as PDF:**
1. Fill in all invoice details
2. Click "Download PDF" button
3. PDF saves with invoice number as filename

**Print Invoice:**
1. Complete your invoice
2. Click "Print" button
3. Use browser print dialog

**Save as Draft:**
1. Click "Save Draft" button
2. Invoice saved to browser storage
3. Access later from "Saved Drafts" sidebar

## Use Cases

### Freelancers

- Invoice clients for completed projects
- Track multiple ongoing invoices
- Maintain professional billing records

### Small Businesses

- Bill customers for products/services
- Generate recurring invoice templates
- Manage multiple client invoices

### Consultants

- Bill hourly consulting fees
- Include detailed service breakdowns
- Apply project-based pricing

### Service Providers

- Invoice for services rendered
- Include itemized service lists
- Apply appropriate tax rates

### Contract Workers

- Bill for completed milestones
- Track project-based payments
- Maintain payment records

## Tips & Tricks

1. **Save Templates**: Create a base invoice and save as draft for future use
2. **Invoice Numbering**: Use consistent numbering (INV-001, INV-002)
3. **Clear Descriptions**: Write detailed line item descriptions
4. **Payment Terms**: Include due date and payment methods in notes
5. **Tax Compliance**: Set appropriate tax rate for your jurisdiction
6. **Client Records**: Save common client details by saving drafts

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| PDF generation fails | Large data or browser issue | Clear cache, try again |
| Draft not saving | Storage full | Clear old drafts |
| Currency not updating | Page not refreshed | Refresh after changes |
| Print looks different | Browser print settings | Check margins/scale |
| Line item won't delete | Only one item | Must have at least 1 item |

### PDF Generation Tips

- Keep notes/descriptions reasonable length
- Verify all required fields are filled
- Try different browser if issues persist
- Check browser console for errors

## Technical Details

### Architecture

- **Frontend**: React 19 with Panda CSS
- **PDF Generation**: @react-pdf/renderer
- **Storage**: Browser localStorage
- **Currencies**: Shared currency library

### Data Structure

```typescript
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
  // Financial
  lineItems: LineItem[]
  taxRate: number
  discountAmount: number
  notes: string
  currency: string
}
```

### Calculation Logic

```typescript
// Subtotal: Sum of (quantity × rate) for all items
const subtotal = lineItems.reduce((sum, item) => 
  sum + item.quantity * item.rate, 0)

// Tax: Percentage of subtotal
const taxAmount = (subtotal * taxRate) / 100

// Grand Total: Subtotal + Tax - Discount
const total = subtotal + taxAmount - discountAmount
```

### Storage Pattern

```typescript
// Save to localStorage
localStorage.setItem('invoiceGenerator', JSON.stringify(invoices))

// Load from localStorage
const saved = localStorage.getItem('invoiceGenerator')
const invoices = saved ? JSON.parse(saved) : []
```

### PDF Structure

Generated PDFs include:

1. Header with "INVOICE" title
2. Invoice metadata (number, dates)
3. From/To sections
4. Line items table
5. Totals section (subtotal, tax, discount, total)
6. Notes section

## Analytics Events

| Event | Description | Properties |
|-------|-------------|------------|
| `invoice_generator_open` | Page loaded | None |
| `invoice_generator_new` | New invoice created | None |
| `invoice_generator_save` | Draft saved | None |
| `invoice_generator_load` | Draft loaded | None |
| `invoice_generator_delete` | Draft deleted | None |
| `invoice_generator_download` | PDF downloaded | `format: 'pdf'` |
| `invoice_generator_print` | Print initiated | None |
| `invoice_generator_add_item` | Line item added | None |
| `invoice_generator_remove_item` | Line item removed | None |

## Related Tools

- [Currency Converter](/tools/finance/currency-converter) - Convert amounts between currencies
- [PDF Tools](/tools/productivity/pdf-tools) - Work with PDF files
- [Percentage Calculator](/tools/finance/percentage-calculator) - Calculate tax percentages
- [Tip Calculator](/tools/finance/tip-calculator) - Calculate service tips

## FAQ

### Q: Is my invoice data secure?

A: Yes, all data is stored locally in your browser's localStorage. Nothing is sent to external servers.

### Q: Can I customize the PDF template?

A: The current version uses a fixed professional template. Custom templates may be added in future updates.

### Q: What happens if I clear my browser data?

A: Saved drafts are stored in localStorage and will be deleted if you clear browser data. Export important invoices as PDF first.

### Q: Can I import existing invoices?

A: Currently, invoices must be created manually. Import functionality may be added in future versions.

### Q: Is there a limit to saved drafts?

A: There's no hard limit, but localStorage has a ~5MB limit per domain. Each invoice is relatively small.

### Q: Can I send invoices directly to clients?

A: The tool generates PDFs for you to send via your preferred method (email, messenger, etc.).

### Q: Does it support recurring invoices?

A: Not yet. Save draft invoices as templates and modify for recurring billing.

## Best Practices

1. **Complete Information**: Fill in all company and client details
2. **Clear Descriptions**: Write detailed line item descriptions
3. **Verify Calculations**: Double-check totals before sending
4. **Professional Notes**: Include payment instructions and terms
5. **Consistent Numbering**: Maintain sequential invoice numbers
6. **Backup Important Invoices**: Download PDFs of important invoices
7. **Regular Cleanup**: Delete old drafts you no longer need

## Changelog

- **January 2026**: Initial release with multi-currency support, PDF export, draft management
