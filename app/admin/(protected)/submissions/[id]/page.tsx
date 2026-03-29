import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { StatusBadge } from '@/components/admin/status-badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile, ContactSubmission } from '@/lib/types/database'
import { StatusUpdate } from './status-update'

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: submission } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('id', id)
    .single<ContactSubmission>()

  if (!submission) {
    return (
      <>
        <Topbar user={profile} title="Submission Not Found" />
        <div className="p-6">
          <p className="text-neutral-500">Submission not found.</p>
          <Link href="/admin/submissions" className="text-sm text-white hover:underline mt-2 inline-block">
            Back to submissions
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar user={profile} title="Submission Detail" />
      <div className="p-6">
        <Link href="/admin/submissions" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to submissions
        </Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">{submission.name}</h2>
            <StatusBadge status={submission.status} />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</label>
              <p className="text-sm text-white mt-1">{submission.email}</p>
            </div>

            {submission.phone && (
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</label>
                <p className="text-sm text-white mt-1">{submission.phone}</p>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Message</label>
              <p className="text-sm text-white mt-1 whitespace-pre-wrap">{submission.message || 'No message'}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Form Source</label>
              <p className="text-sm text-white mt-1">{submission.form_source}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Newsletter Opt-in</label>
              <p className="text-sm text-white mt-1">{submission.checkbox_newsletter ? 'Yes' : 'No'}</p>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Submitted</label>
              <p className="text-sm text-white mt-1">{formatDate(submission.created_at)}</p>
            </div>

            <div className="pt-4 border-t border-neutral-800">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Update Status</label>
              <StatusUpdate submissionId={submission.id} currentStatus={submission.status} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
