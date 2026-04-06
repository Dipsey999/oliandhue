import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile } from '@/lib/types/database'
import { TestimonialForm } from '../testimonial-form'

export default async function NewTestimonialPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  return (
    <>
      <Topbar user={profile} title="New Testimonial" />
      <div className="p-6">
        <Link href="/admin/testimonials" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to testimonials
        </Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Create New Testimonial</h2>
          <TestimonialForm />
        </div>
      </div>
    </>
  )
}
