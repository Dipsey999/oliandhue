import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { StatusBadge } from '@/components/admin/status-badge'
import { formatDate } from '@/lib/utils'
import { REQUIREMENT_LABELS } from '@/lib/constants'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile, ProjectInquiry } from '@/lib/types/database'
import { InquiryActions } from './inquiry-actions'

export default async function InquiryDetailPage({
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

  const { data: inquiry } = await supabase
    .from('project_inquiries')
    .select('*')
    .eq('id', id)
    .single<ProjectInquiry>()

  if (!inquiry) {
    return (
      <>
        <Topbar user={profile} title="Inquiry Not Found" />
        <div className="p-6">
          <p className="text-neutral-500">Inquiry not found.</p>
          <Link href="/admin/inquiries" className="text-sm text-white hover:underline mt-2 inline-block">
            Back to inquiries
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar user={profile} title="Inquiry Detail" />
      <div className="p-6">
        <Link href="/admin/inquiries" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to inquiries
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl">
          {/* Main details */}
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">{inquiry.name}</h2>
              <StatusBadge status={inquiry.status} />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Email</label>
                <p className="text-sm text-white mt-1">{inquiry.email}</p>
              </div>

              {inquiry.phone && (
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Phone</label>
                  <p className="text-sm text-white mt-1">{inquiry.phone}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Requirement</label>
                <p className="text-sm text-white mt-1">
                  {inquiry.requirement ? REQUIREMENT_LABELS[inquiry.requirement] || inquiry.requirement : '-'}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Budget</label>
                <p className="text-sm text-white mt-1">{inquiry.budget || '-'}</p>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Project Details</label>
                <p className="text-sm text-white mt-1 whitespace-pre-wrap">{inquiry.project_details || 'No details provided'}</p>
              </div>

              {inquiry.project_links && (
                <div>
                  <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Project Links</label>
                  <p className="text-sm text-white mt-1 whitespace-pre-wrap">{inquiry.project_links}</p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Submitted</label>
                <p className="text-sm text-white mt-1">{formatDate(inquiry.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Sidebar actions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Actions</h3>
            <InquiryActions
              inquiryId={inquiry.id}
              currentStatus={inquiry.status}
              currentAssignedTo={inquiry.assigned_to}
              currentNotes={inquiry.notes}
            />
          </div>
        </div>
      </div>
    </>
  )
}
