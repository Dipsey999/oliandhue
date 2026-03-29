import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { formatDate } from '@/lib/utils'
import type { Profile, NewsletterSubscriber } from '@/lib/types/database'
import { SubscriberActions, DeleteSubscriberButton } from './subscriber-actions'

export default async function SubscribersPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*')
    .is('unsubscribed_at', null)
    .order('subscribed_at', { ascending: false })
    .returns<NewsletterSubscriber[]>()

  return (
    <>
      <Topbar user={profile} title="Subscribers" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Newsletter Subscribers</h1>
            <p className="text-sm text-neutral-500 mt-1">{subscribers?.length ?? 0} active subscribers</p>
          </div>
          <SubscriberActions subscribers={subscribers ?? []} />
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Source</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Subscribed</th>
                <th className="text-right text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(subscribers ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No subscribers yet
                  </td>
                </tr>
              ) : (
                (subscribers ?? []).map((s) => (
                  <tr key={s.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3 text-sm font-medium text-white">{s.email}</td>
                    <td className="px-4 py-3 text-sm text-neutral-400">{s.source}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(s.subscribed_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <DeleteSubscriberButton subscriberId={s.id} email={s.email} />
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
