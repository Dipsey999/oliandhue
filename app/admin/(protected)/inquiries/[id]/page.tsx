import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile, ProjectInquiry } from '@/lib/types/database'
import { InquiryEditor } from './inquiry-editor'

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

        <InquiryEditor inquiry={inquiry} />
      </div>
    </>
  )
}
