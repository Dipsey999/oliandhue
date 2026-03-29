import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile, BlogPost } from '@/lib/types/database'
import { BlogForm } from '../blog-form'

export default async function EditBlogPostPage({
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

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('id', id)
    .single<BlogPost>()

  if (!post) {
    return (
      <>
        <Topbar user={profile} title="Post Not Found" />
        <div className="p-6">
          <p className="text-neutral-500">Blog post not found.</p>
          <Link href="/admin/blog" className="text-sm text-white hover:underline mt-2 inline-block">
            Back to blog
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar user={profile} title="Edit Post" />
      <div className="p-6">
        <Link href="/admin/blog" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Edit Post</h2>
          <BlogForm post={post} />
        </div>
      </div>
    </>
  )
}
