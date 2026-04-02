import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile, ContactSubmission } from '@/lib/types/database'
import { SubmissionEditor } from './submission-editor'

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

        <SubmissionEditor submission={submission} />
      </div>
    </>
  )
}
