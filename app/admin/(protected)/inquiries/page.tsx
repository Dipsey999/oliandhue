import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { StatusBadge } from '@/components/admin/status-badge'
import { PriorityBadge } from '@/components/admin/priority-badge'
import { formatDate } from '@/lib/utils'
import { REQUIREMENT_LABELS } from '@/lib/constants'
import Link from 'next/link'
import type { Profile, ProjectInquiry } from '@/lib/types/database'
import { InquiriesSearch } from './search'

export default async function InquiriesPage({
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
    .from('project_inquiries')
    .select('*')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: inquiries } = await query.returns<ProjectInquiry[]>()

  return (
    <>
      <Topbar user={profile} title="Inquiries" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">One-time Plan Submissions</h1>
            <p className="text-sm text-neutral-500 mt-1">{inquiries?.length ?? 0} total submissions</p>
          </div>
        </div>

        <InquiriesSearch defaultValue={q} />

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Requirement</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Priority</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Project Value</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(inquiries ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No inquiries found
                  </td>
                </tr>
              ) : (
                (inquiries ?? []).map((i) => (
                  <tr key={i.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3">
                      <Link href={`/admin/inquiries/${i.id}`} className="text-sm font-medium text-white hover:underline">
                        {i.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{i.email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-400">
                      {i.requirement ? REQUIREMENT_LABELS[i.requirement] || i.requirement : '-'}
                    </td>
                    <td className="px-4 py-3"><PriorityBadge priority={i.priority ?? 'medium'} /></td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{i.project_value || '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(i.created_at)}</td>
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
