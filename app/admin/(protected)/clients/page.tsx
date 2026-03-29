import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Profile, Client } from '@/lib/types/database'

export default async function ClientsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Client[]>()

  return (
    <>
      <Topbar user={profile} title="Clients" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Clients</h1>
            <p className="text-sm text-neutral-500 mt-1">{clients?.length ?? 0} total clients</p>
          </div>
          <Link
            href="/admin/clients/new"
            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-neutral-800 transition"
          >
            <Plus className="w-4 h-4" />
            New Client
          </Link>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Phone</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(clients ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No clients yet
                  </td>
                </tr>
              ) : (
                (clients ?? []).map((c) => (
                  <tr key={c.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${c.id}`} className="text-sm font-medium text-white hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{c.company || '-'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{c.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{c.phone || '-'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(c.created_at)}</td>
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
