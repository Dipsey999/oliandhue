import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile, Testimonial } from '@/lib/types/database'
import { TestimonialForm } from '../testimonial-form'

export default async function EditTestimonialPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: testimonial } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single<Testimonial>()

  if (!testimonial) {
    return (
      <>
        <Topbar user={profile} title="Testimonial Not Found" />
        <div className="p-6">
          <p className="text-neutral-500">Testimonial not found.</p>
          <Link href="/admin/testimonials" className="text-sm text-white hover:underline mt-2 inline-block">
            Back to testimonials
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar user={profile} title="Edit Testimonial" />
      <div className="p-6">
        <Link href="/admin/testimonials" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to testimonials
        </Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Edit Testimonial</h2>
          <TestimonialForm testimonial={testimonial} />
        </div>
      </div>
    </>
  )
}
