'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TestimonialSubmission } from '@/lib/types/database'

export function SubmissionActions({ submission }: { submission: TestimonialSubmission }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  async function handleApprove() {
    setLoading(true)

    // Create a testimonial from the submission (unpublished so admin can review)
    const { error: insertError } = await supabase.from('testimonials').insert({
      client_name: submission.client_name,
      client_role: submission.client_role,
      company: submission.company,
      content: submission.content,
      rating: submission.rating,
      is_featured: false,
      published: false,
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (insertError) {
      alert('Failed to create testimonial')
      setLoading(false)
      return
    }

    // Update submission status
    const { error: updateError } = await supabase
      .from('testimonial_submissions')
      .update({ status: 'approved' })
      .eq('id', submission.id)

    if (updateError) {
      alert('Failed to update submission status')
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  async function handleReject() {
    setLoading(true)

    const { error } = await supabase
      .from('testimonial_submissions')
      .update({ status: 'rejected' })
      .eq('id', submission.id)

    if (error) {
      alert('Failed to reject submission')
      setLoading(false)
      return
    }

    setLoading(false)
    router.refresh()
  }

  if (submission.status !== 'pending') {
    return null
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleApprove}
        disabled={loading}
        className="text-xs font-medium text-green-400 hover:text-green-300 transition disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="text-xs font-medium text-red-400 hover:text-red-300 transition disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}
