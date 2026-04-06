import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { StatusBadge } from '@/components/admin/status-badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Star } from 'lucide-react'
import type { Profile, TestimonialSubmission } from '@/lib/types/database'
import { SubmissionActions } from './submission-actions'

export default async function TestimonialSubmissionsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: submissions } = await supabase
    .from('testimonial_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<TestimonialSubmission[]>()

  return (
    <>
      <Topbar user={profile} title="Testimonial Submissions" />
      <div className="p-6">
        <Link href="/admin/testimonials" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to testimonials
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Testimonial Submissions</h1>
          <p className="text-sm text-neutral-500 mt-1">{submissions?.length ?? 0} total submissions</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Client Name</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Rating</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(submissions ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No submissions yet
                  </td>
                </tr>
              ) : (
                (submissions ?? []).map((s) => (
                  <tr key={s.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3 text-sm font-medium text-white">{s.client_name}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{s.client_email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{s.company || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < s.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-700'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(s.created_at)}</td>
                    <td className="px-4 py-3">
                      <SubmissionActions submission={s} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
