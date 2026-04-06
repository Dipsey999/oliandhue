import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Star } from 'lucide-react'
import type { Profile, Testimonial } from '@/lib/types/database'

export default async function TestimonialsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .order('display_order', { ascending: true })
    .returns<Testimonial[]>()

  return (
    <>
      <Topbar user={profile} title="Testimonials" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white">Testimonials</h1>
            <p className="text-sm text-neutral-500 mt-1">{testimonials?.length ?? 0} total testimonials</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/testimonials/submissions"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 hover:text-white py-2 px-4 rounded-lg border border-neutral-700 hover:border-neutral-600 transition"
            >
              Review Submissions
            </Link>
            <Link
              href="/admin/testimonials/new"
              className="inline-flex items-center gap-1.5 bg-neutral-900 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-neutral-800 transition"
            >
              <Plus className="w-4 h-4" />
              New Testimonial
            </Link>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 bg-[#0a0a0a]">
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Client Name</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Rating</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Featured</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Published</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Order</th>
                <th className="text-left text-xs font-medium text-neutral-500 uppercase tracking-wider px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {(testimonials ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-500">
                    No testimonials yet
                  </td>
                </tr>
              ) : (
                (testimonials ?? []).map((t) => (
                  <tr key={t.id} className="hover:bg-[#0a0a0a] transition">
                    <td className="px-4 py-3">
                      <Link href={`/admin/testimonials/${t.id}`} className="text-sm font-medium text-white hover:underline">
                        {t.client_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{t.company || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-700'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.is_featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'}`}>
                        {t.is_featured ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${t.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {t.published ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{t.display_order}</td>
                    <td className="px-4 py-3 text-sm text-neutral-500">{formatDate(t.created_at)}</td>
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
