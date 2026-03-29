import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/lib/types/database'
import { InviteMemberForm } from './invite-form'

export default async function TeamPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })
    .returns<Profile[]>()

  const isAdmin = profile?.role === 'admin'

  return (
    <>
      <Topbar user={profile} title="Team" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Team Members</h1>
            <p className="text-sm text-neutral-500 mt-1">{members?.length ?? 0} members</p>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Role</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(members ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No team members found
                  </td>
                </tr>
              ) : (
                (members ?? []).map((m) => (
                  <tr key={m.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                          {(m.full_name || m.email || '?')[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-white">{m.full_name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{m.email}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${m.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(m.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {isAdmin && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Invite New Member</h3>
            <InviteMemberForm />
          </div>
        )}
      </div>
    </>
  )
}
