import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { StatusBadge } from '@/components/admin/status-badge'
import { formatDate, truncate } from '@/lib/utils'
import Link from 'next/link'
import type { Profile, ContactSubmission } from '@/lib/types/database'
import { SubmissionsSearch } from './search'

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  let query = supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: submissions, count } = await query.returns<ContactSubmission[]>()

  return (
    <>
      <Topbar user={profile} title="Submissions" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Contact Submissions</h1>
            <p className="text-sm text-neutral-500 mt-1">{submissions?.length ?? 0} total submissions</p>
          </div>
        </div>

        <SubmissionsSearch defaultValue={q} />

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Message</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(submissions ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No submissions found
                  </td>
                </tr>
              ) : (
                (submissions ?? []).map((s) => (
                  <tr key={s.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3">
                      <Link href={`/admin/submissions/${s.id}`} className="text-sm font-medium text-white hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{truncate(s.message || '', 50)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(s.created_at)}</td>
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
