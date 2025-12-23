'use client'

import { Check, Edit2, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { css } from '@/styled-system/css'

export interface ExtractedItem {
  id: string
  name: string
  price: number
  quantity: number
  confidence: 'high' | 'medium' | 'low'
  rawText?: string
}

interface ItemPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  items: ExtractedItem[]
  onConfirm: (items: ExtractedItem[]) => void
}

export function ItemPreviewModal({ isOpen, onClose, items, onConfirm }: ItemPreviewModalProps) {
  const [editedItems, setEditedItems] = useState<ExtractedItem[]>(items)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', price: '', quantity: '' })

  const startEdit = (item: ExtractedItem) => {
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      price: String(item.price),
      quantity: String(item.quantity),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: '', price: '', quantity: '' })
  }

  const saveEdit = (itemId: string) => {
    const price = parseFloat(editForm.price)
    const quantity = parseInt(editForm.quantity, 10)

    if (!editForm.name.trim() || Number.isNaN(price) || Number.isNaN(quantity)) {
      return
    }

    setEditedItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              name: editForm.name.trim(),
              price,
              quantity,
              confidence: 'high', // User-edited items are high confidence
            }
          : item
      )
    )
    cancelEdit()
  }

  const deleteItem = (itemId: string) => {
    setEditedItems((prev) => prev.filter((item) => item.id !== itemId))
  }

  const handleConfirm = () => {
    onConfirm(editedItems)
    onClose()
  }

  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return { bg: 'green.500/10', border: 'green.500/30', text: 'green.400' }
      case 'medium':
        return { bg: 'yellow.500/10', border: 'yellow.500/30', text: 'yellow.400' }
      case 'low':
        return { bg: 'red.500/10', border: 'red.500/30', text: 'red.400' }
    }
  }

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const colors = getConfidenceColor(confidence)
    return (
      <span
        className={css({
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1',
          px: '2',
          py: '0.5',
          rounded: 'full',
          fontSize: 'xs',
          fontWeight: 'semibold',
          border: '1px solid',
          bg: colors.bg,
          borderColor: colors.border,
          color: colors.text,
        })}
      >
        {confidence === 'high' && '✓'}
        {confidence === 'medium' && '⚠'}
        {confidence === 'low' && '?'}
        {confidence.toUpperCase()}
      </span>
    )
  }

  const totalAmount = editedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const highConfidenceCount = editedItems.filter((item) => item.confidence === 'high').length
  const mediumConfidenceCount = editedItems.filter((item) => item.confidence === 'medium').length
  const lowConfidenceCount = editedItems.filter((item) => item.confidence === 'low').length

  return (
    <Dialog open={isOpen} onOpenChange={(details) => details.open === false && onClose()}>
      <DialogContent
        className={css({
          maxW: '3xl',
          maxH: '85vh',
          bg: 'gray.900',
          border: '1px solid',
          borderColor: 'purple.500/30',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
        })}
      >
        <DialogHeader>
          <DialogTitle
            className={css({
              fontSize: 'xl',
              fontWeight: 'bold',
              color: 'purple.300',
            })}
          >
            Review Scanned Items
          </DialogTitle>
          <DialogDescription className={css({ color: 'gray.400' })}>
            {editedItems.length} items detected. Review and edit before importing.
          </DialogDescription>
        </DialogHeader>

        {/* Confidence Summary */}
        <div
          className={css({
            display: 'flex',
            gap: '2',
            p: '3',
            rounded: 'lg',
            bg: 'gray.800/50',
            border: '1px solid',
            borderColor: 'gray.700',
          })}
        >
          <div className={css({ flex: '1', textAlign: 'center' })}>
            <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
              High Confidence
            </div>
            <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'green.400' })}>
              {highConfidenceCount}
            </div>
          </div>
          <div className={css({ flex: '1', textAlign: 'center' })}>
            <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
              Medium Confidence
            </div>
            <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'yellow.400' })}>
              {mediumConfidenceCount}
            </div>
          </div>
          <div className={css({ flex: '1', textAlign: 'center' })}>
            <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>
              Low Confidence
            </div>
            <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'red.400' })}>
              {lowConfidenceCount}
            </div>
          </div>
          <div className={css({ flex: '1', textAlign: 'center' })}>
            <div className={css({ fontSize: 'xs', color: 'gray.500', mb: '1' })}>Total Amount</div>
            <div className={css({ fontSize: 'lg', fontWeight: 'bold', color: 'purple.400' })}>
              ${totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Items List */}
        <div
          className={css({
            flex: '1',
            overflowY: 'auto',
            spaceY: '2',
            pr: '2',
            minH: '300px',
            maxH: '450px',
          })}
        >
          {editedItems.map((item) => {
            const isEditing = editingId === item.id
            const colors = getConfidenceColor(item.confidence)

            return (
              <div
                key={item.id}
                className={css({
                  p: '3',
                  rounded: 'lg',
                  border: '1px solid',
                  bg: colors.bg,
                  borderColor: colors.border,
                  transition: 'all 0.2s',
                  _hover: { borderColor: 'purple.500/50' },
                })}
              >
                {!isEditing ? (
                  <div className={css({ display: 'flex', gap: '3', alignItems: 'start' })}>
                    <div className={css({ flex: '1', minW: '0' })}>
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2',
                          mb: '1',
                        })}
                      >
                        <h4
                          className={css({
                            fontSize: 'sm',
                            fontWeight: 'semibold',
                            color: 'white',
                            truncate: true,
                          })}
                        >
                          {item.name}
                        </h4>
                        {getConfidenceBadge(item.confidence)}
                      </div>
                      <div className={css({ display: 'flex', gap: '4', fontSize: 'sm' })}>
                        <span className={css({ color: 'gray.400' })}>
                          Price:{' '}
                          <span className={css({ color: 'white' })}>${item.price.toFixed(2)}</span>
                        </span>
                        <span className={css({ color: 'gray.400' })}>
                          Qty: <span className={css({ color: 'white' })}>{item.quantity}</span>
                        </span>
                        <span className={css({ color: 'gray.400' })}>
                          Total:{' '}
                          <span className={css({ fontWeight: 'semibold', color: 'purple.400' })}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </span>
                      </div>
                      {item.rawText && (
                        <div
                          className={css({
                            mt: '1',
                            fontSize: 'xs',
                            color: 'gray.500',
                            fontFamily: 'mono',
                          })}
                        >
                          Raw: {item.rawText}
                        </div>
                      )}
                    </div>
                    <div className={css({ display: 'flex', gap: '1' })}>
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className={css({
                          p: '1.5',
                          rounded: 'md',
                          bg: 'gray.800/50',
                          color: 'gray.400',
                          transition: 'all 0.2s',
                          _hover: { bg: 'blue.500/20', color: 'blue.400' },
                        })}
                        title="Edit item"
                      >
                        <Edit2 className={css({ h: '4', w: '4' })} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className={css({
                          p: '1.5',
                          rounded: 'md',
                          bg: 'gray.800/50',
                          color: 'gray.400',
                          transition: 'all 0.2s',
                          _hover: { bg: 'red.500/20', color: 'red.400' },
                        })}
                        title="Delete item"
                      >
                        <Trash2 className={css({ h: '4', w: '4' })} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={css({ spaceY: '2' })}>
                    <Input
                      type="text"
                      placeholder="Item name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={css({
                        bg: 'gray.800',
                        border: '1px solid',
                        borderColor: 'gray.700',
                      })}
                    />
                    <div
                      className={css({ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2' })}
                    >
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className={css({
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'gray.700',
                        })}
                      />
                      <Input
                        type="number"
                        min="1"
                        placeholder="Quantity"
                        value={editForm.quantity}
                        onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                        className={css({
                          bg: 'gray.800',
                          border: '1px solid',
                          borderColor: 'gray.700',
                        })}
                      />
                    </div>
                    <div className={css({ display: 'flex', gap: '2', justifyContent: 'flex-end' })}>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1',
                          px: '3',
                          py: '1.5',
                          rounded: 'md',
                          bg: 'gray.800/50',
                          fontSize: 'sm',
                          color: 'gray.400',
                          transition: 'all 0.2s',
                          _hover: { bg: 'gray.700' },
                        })}
                      >
                        <X className={css({ h: '3.5', w: '3.5' })} />
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEdit(item.id)}
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1',
                          px: '3',
                          py: '1.5',
                          rounded: 'md',
                          bg: 'green.500/20',
                          fontSize: 'sm',
                          color: 'green.400',
                          transition: 'all 0.2s',
                          _hover: { bg: 'green.500/30' },
                        })}
                      >
                        <Check className={css({ h: '3.5', w: '3.5' })} />
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Help Text */}
        <div
          className={css({
            p: '2.5',
            rounded: 'lg',
            bg: 'blue.500/10',
            border: '1px solid',
            borderColor: 'blue.500/30',
          })}
        >
          <p className={css({ fontSize: 'xs', color: 'blue.300' })}>
            💡 <strong>Tip:</strong> Items with low confidence may need correction. Click the edit
            button to adjust names, prices, or quantities before importing.
          </p>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleConfirm}
            size="sm"
            disabled={editedItems.length === 0}
            className={css({
              bg: 'purple.500/20',
              border: '1px solid',
              borderColor: 'purple.500/50',
              color: 'purple.300',
              _hover: { bg: 'purple.500/30' },
              _disabled: { opacity: 0.5, cursor: 'not-allowed' },
            })}
          >
            Import {editedItems.length} Items
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
