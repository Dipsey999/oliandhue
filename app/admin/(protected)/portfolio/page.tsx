import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import type { Profile, PortfolioItem } from '@/lib/types/database'

export default async function PortfolioPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: items } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('display_order', { ascending: true })
    .returns<PortfolioItem[]>()

  return (
    <>
      <Topbar user={profile} title="Portfolio" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Portfolio Items</h1>
            <p className="text-sm text-neutral-500 mt-1">{items?.length ?? 0} total items</p>
          </div>
          <Link
            href="/admin/portfolio/new"
            className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-neutral-800 transition"
          >
            <Plus className="w-4 h-4" />
            New Item
          </Link>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Slug</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Published</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Order</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(items ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No portfolio items yet
                  </td>
                </tr>
              ) : (
                (items ?? []).map((item) => (
                  <tr key={item.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3">
                      <Link href={`/admin/portfolio/${item.id}`} className="text-sm font-medium text-white hover:underline">
                        {item.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500 font-mono">{item.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${item.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {item.published ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{item.display_order}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(item.created_at)}</td>
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
