'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Payment } from '@/lib/types/database'
import {
  PAYMENT_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_COLORS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from './confirm-dialog'

interface PaymentManagerProps {
  entityType: 'submission' | 'inquiry'
  entityId: string
}

type PaymentFormData = {
  amount: string
  currency: 'INR' | 'USD'
  status: Payment['status']
  payment_date: string
  due_date: string
  method: Payment['method'] | ''
  invoice_number: string
  notes: string
}

const emptyForm: PaymentFormData = {
  amount: '',
  currency: 'INR',
  status: 'pending',
  payment_date: '',
  due_date: '',
  method: '',
  invoice_number: '',
  notes: '',
}

export function PaymentManager({ entityType, entityId }: PaymentManagerProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PaymentFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchPayments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityType, entityId])

  async function fetchPayments() {
    const supabase = createClient()
    const { data } = await supabase
      .from('payments')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })

    if (data) setPayments(data)
    setLoading(false)
  }

  function openAddForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEditForm(payment: Payment) {
    setEditingId(payment.id)
    setForm({
      amount: String(payment.amount),
      currency: payment.currency,
      status: payment.status,
      payment_date: payment.payment_date ?? '',
      due_date: payment.due_date ?? '',
      method: payment.method ?? '',
      invoice_number: payment.invoice_number ?? '',
      notes: payment.notes ?? '',
    })
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()

    const payload = {
      entity_type: entityType,
      entity_id: entityId,
      amount: parseFloat(form.amount) || 0,
      currency: form.currency,
      status: form.status,
      payment_date: form.payment_date || null,
      due_date: form.due_date || null,
      method: form.method || null,
      invoice_number: form.invoice_number || null,
      notes: form.notes || null,
    }

    if (editingId) {
      await supabase.from('payments').update(payload).eq('id', editingId)
    } else {
      await supabase.from('payments').insert(payload)
    }

    setSaving(false)
    cancelForm()
    fetchPayments()
  }

  async function handleDelete() {
    if (!deleteId) return
    const supabase = createClient()
    await supabase.from('payments').delete().eq('id', deleteId)
    setDeleteId(null)
    fetchPayments()
  }

  function updateField<K extends keyof PaymentFormData>(key: K, value: PaymentFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading payments...</p>
  }

  const inputClass =
    'w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600'
  const labelClass = 'block text-xs font-medium text-neutral-400 mb-1'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Payments</h4>
        {!showForm && (
          <button
            onClick={openAddForm}
            className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700"
          >
            Add Payment
          </button>
        )}
      </div>

      {/* Payment Form */}
      {showForm && (
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Amount</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => updateField('amount', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <select
                value={form.currency}
                onChange={(e) => updateField('currency', e.target.value as 'INR' | 'USD')}
                className={inputClass}
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value as Payment['status'])}
                className={inputClass}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Method</label>
              <select
                value={form.method || ''}
                onChange={(e) => updateField('method', e.target.value as Payment['method'] | '')}
                className={inputClass}
              >
                <option value="">Select method</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {PAYMENT_METHOD_LABELS[m]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Payment Date</label>
              <input
                type="date"
                value={form.payment_date}
                onChange={(e) => updateField('payment_date', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Due Date</label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => updateField('due_date', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Invoice Number</label>
            <input
              type="text"
              placeholder="INV-001"
              value={form.invoice_number}
              onChange={(e) => updateField('invoice_number', e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <input
              type="text"
              placeholder="Optional notes"
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={cancelForm}
              disabled={saving}
              className="rounded-md border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
          </div>
        </div>
      )}

      {/* Payments List */}
      {payments.length === 0 ? (
        <p className="text-sm text-neutral-500">No payments recorded.</p>
      ) : (
        <div className="space-y-2">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {payment.currency === 'INR' ? '\u20B9' : '$'}
                    {payment.amount.toLocaleString()}
                  </span>
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                      PAYMENT_STATUS_COLORS[payment.status] || 'bg-neutral-800 text-neutral-400'
                    )}
                  >
                    {payment.status}
                  </span>
                  {payment.method && (
                    <span className="text-xs text-neutral-500">
                      {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500">
                  {payment.invoice_number && <span>#{payment.invoice_number}</span>}
                  {payment.payment_date && (
                    <span>Paid: {new Date(payment.payment_date).toLocaleDateString('en-IN')}</span>
                  )}
                  {payment.due_date && (
                    <span>Due: {new Date(payment.due_date).toLocaleDateString('en-IN')}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditForm(payment)}
                  className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  title="Edit"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => setDeleteId(payment.id)}
                  className="rounded p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-red-400"
                  title="Delete"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Payment"
        description="Are you sure you want to delete this payment record? This action cannot be undone."
      />
    </div>
  )
}
