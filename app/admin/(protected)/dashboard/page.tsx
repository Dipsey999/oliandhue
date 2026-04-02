import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { StatsCard } from '@/components/admin/stats-card'
import { StatusBadge } from '@/components/admin/status-badge'
import { MessageSquare, Briefcase, Mail, FileText } from 'lucide-react'
import { formatRelativeTime, truncate } from '@/lib/utils'
import Link from 'next/link'
import type { Profile, ContactSubmission, ProjectInquiry } from '@/lib/types/database'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  // Fetch counts
  const [submissions, inquiries, subscribers, blogPosts] = await Promise.all([
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('project_inquiries').select('*', { count: 'exact', head: true }).eq('status', 'new'),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).is('unsubscribed_at', null),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('published', true),
  ])

  // Recent items
  const { data: recentSubmissions } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<ContactSubmission[]>()

  const { data: recentInquiries } = await supabase
    .from('project_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
    .returns<ProjectInquiry[]>()

  return (
    <>
      <Topbar user={profile} title="Dashboard" />
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="New Submissions" value={submissions.count ?? 0} icon={MessageSquare} description="Unread contact messages" />
          <StatsCard title="One-time Plans" value={inquiries.count ?? 0} icon={Briefcase} description="One-time plan submissions" />
          <StatsCard title="Subscribers" value={subscribers.count ?? 0} icon={Mail} description="Newsletter signups" />
          <StatsCard title="Published Posts" value={blogPosts.count ?? 0} icon={FileText} description="Live blog articles" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Submissions */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="font-semibold text-white">Recent Submissions</h3>
              <Link href="/admin/submissions" className="text-xs text-neutral-500 hover:text-white">View all</Link>
            </div>
            <div className="divide-y divide-neutral-800">
              {(recentSubmissions ?? []).length === 0 ? (
                <p className="p-4 text-sm text-neutral-500">No submissions yet</p>
              ) : (
                (recentSubmissions ?? []).map((s) => (
                  <Link key={s.id} href={`/admin/submissions/${s.id}`} className="flex items-center justify-between p-3 hover:bg-[#0a0a0a] transition">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{s.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{truncate(s.message || '', 60)}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <StatusBadge status={s.status} />
                      <span className="text-xs text-neutral-400">{formatRelativeTime(s.created_at)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recent Inquiries */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="font-semibold text-white">Recent Inquiries</h3>
              <Link href="/admin/inquiries" className="text-xs text-neutral-500 hover:text-white">View all</Link>
            </div>
            <div className="divide-y divide-neutral-800">
              {(recentInquiries ?? []).length === 0 ? (
                <p className="p-4 text-sm text-neutral-500">No inquiries yet</p>
              ) : (
                (recentInquiries ?? []).map((i) => (
                  <Link key={i.id} href={`/admin/inquiries/${i.id}`} className="flex items-center justify-between p-3 hover:bg-[#0a0a0a] transition">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{i.name}</p>
                      <p className="text-xs text-neutral-500">{i.budget || 'No budget specified'}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <StatusBadge status={i.status} />
                      <span className="text-xs text-neutral-400">{formatRelativeTime(i.created_at)}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
