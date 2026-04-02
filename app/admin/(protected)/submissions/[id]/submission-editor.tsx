'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PIPELINE_STATUSES, PRIORITIES, STATUS_COLORS } from '@/lib/constants'
import { PriorityBadge } from '@/components/admin/priority-badge'
import { PaymentManager } from '@/components/admin/payment-manager'
import { Timeline } from '@/components/admin/timeline'
import { ConfirmDialog } from '@/components/admin/confirm-dialog'
import { cn, formatDate } from '@/lib/utils'
import type { ContactSubmission } from '@/lib/types/database'

interface SubmissionEditorProps {
  submission: ContactSubmission
}

export function SubmissionEditor({ submission }: SubmissionEditorProps) {
  const router = useRouter()
  const supabase = createClient()

  // Contact info fields
  const [name, setName] = useState(submission.name)
  const [email, setEmail] = useState(submission.email)
  const [phone, setPhone] = useState(submission.phone ?? '')
  const [company, setCompany] = useState(submission.company ?? '')

  // Project info fields
  const [requirement, setRequirement] = useState(submission.requirement ?? '')
  const [projectValue, setProjectValue] = useState(submission.project_value ?? '')
  const [priority, setPriority] = useState(submission.priority ?? 'medium')
  const [assignedTo, setAssignedTo] = useState(submission.assigned_to ?? '')
  const [followUpDate, setFollowUpDate] = useState(submission.follow_up_date ?? '')
  const [tags, setTags] = useState(submission.tags?.join(', ') ?? '')

  // Status
  const [status, setStatus] = useState(submission.status)

  // Notes
  const [notes, setNotes] = useState(submission.notes ?? '')

  // UI state
  const [saving, setSaving] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleStatusChange(newStatus: string) {
    const oldStatus = status
    setStatus(newStatus as ContactSubmission['status'])

    const { error } = await supabase
      .from('contact_submissions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', submission.id)

    if (error) {
      setStatus(oldStatus as ContactSubmission['status'])
      alert('Failed to update status')
      return
    }

    // Insert into status_history
    await supabase.from('status_history').insert({
      entity_type: 'submission',
      entity_id: submission.id,
      old_status: oldStatus,
      new_status: newStatus,
    })

    router.refresh()
  }

  async function handleSave() {
    setSaving(true)
    const tagsArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const { error } = await supabase
      .from('contact_submissions')
      .update({
        name,
        email,
        phone: phone || null,
        company: company || null,
        requirement: requirement || null,
        project_value: projectValue || null,
        priority,
        assigned_to: assignedTo || null,
        follow_up_date: followUpDate || null,
        tags: tagsArray.length > 0 ? tagsArray : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submission.id)

    if (error) {
      alert('Failed to save changes')
    }
    setSaving(false)
    router.refresh()
  }

  async function handleSaveNotes() {
    setSavingNotes(true)
    const { error } = await supabase
      .from('contact_submissions')
      .update({ notes: notes || null, updated_at: new Date().toISOString() })
      .eq('id', submission.id)

    if (error) {
      alert('Failed to save notes')
    }
    setSavingNotes(false)
    router.refresh()
  }

  async function handleDelete() {
    // Delete payments first
    await supabase
      .from('payments')
      .delete()
      .eq('entity_type', 'submission')
      .eq('entity_id', submission.id)

    // Delete status history
    await supabase
      .from('status_history')
      .delete()
      .eq('entity_type', 'submission')
      .eq('entity_id', submission.id)

    // Delete the submission
    await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', submission.id)

    router.push('/admin/submissions')
  }

  const inputClass =
    'w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-neutral-600 focus:outline-none focus:ring-1 focus:ring-neutral-600'
  const labelClass = 'block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5'

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-white">{submission.name}</h1>
          <PriorityBadge priority={priority} />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-600',
              STATUS_COLORS[status] || 'bg-neutral-800 text-neutral-400'
            )}
          >
            {PIPELINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-Column Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Contact Info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Contact Info</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Company</label>
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Right Column - Project Info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Project Info</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Requirement</label>
              <input type="text" value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="Requirement" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Project Value</label>
              <input type="text" value={projectValue} onChange={(e) => setProjectValue(e.target.value)} placeholder="e.g. $5,000" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ContactSubmission['priority'])}
                className={inputClass}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Assigned To</label>
              <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Team member" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Follow-up Date</label>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tags</label>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma-separated tags" className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Save Changes */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-md bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200 disabled:opacity-50 transition"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Notes Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Internal notes..."
          className={cn(inputClass, 'resize-none')}
        />
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="rounded-md bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 transition"
          >
            {savingNotes ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>

      {/* Payments Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <PaymentManager entityType="submission" entityId={submission.id} />
      </div>

      {/* Timeline Section */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Timeline</h3>
        <Timeline entityType="submission" entityId={submission.id} />
      </div>

      {/* Meta Info */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center gap-6 text-xs text-neutral-500">
          <span>Form Source: {submission.form_source}</span>
          <span>Newsletter: {submission.checkbox_newsletter ? 'Yes' : 'No'}</span>
          <span>Created: {formatDate(submission.created_at)}</span>
          <span>Updated: {formatDate(submission.updated_at)}</span>
        </div>
      </div>

      {/* Delete Section */}
      <div className="border border-red-900/30 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
        <p className="text-xs text-neutral-500 mb-4">
          Permanently delete this submission and all associated data including payments and status history.
        </p>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition"
        >
          Delete Submission
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Submission"
        description="Are you sure you want to permanently delete this submission? This will also remove all associated payments and status history. This action cannot be undone."
      />
    </div>
  )
}
