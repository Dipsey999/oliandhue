'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import type { BlogPost } from '@/lib/types/database'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface BlogFormProps {
  post?: BlogPost
}

export function BlogForm({ post }: BlogFormProps) {
  const isEditing = !!post
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState(post?.title ?? '')
  const [slug, setSlug] = useState(post?.slug ?? '')
  const [description, setDescription] = useState(post?.description ?? '')
  const [content, setContent] = useState(post?.content ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url ?? '')
  const [published, setPublished] = useState(post?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleTitleChange(value: string) {
    setTitle(value)
    if (!isEditing) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !slug.trim()) return alert('Title and slug are required')

    setSaving(true)
    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      content: content.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      published,
      published_at: published ? (post?.published_at ?? new Date().toISOString()) : null,
      updated_at: new Date().toISOString(),
    }

    if (isEditing) {
      const { error } = await supabase
        .from('blog_posts')
        .update(payload)
        .eq('id', post.id)
      if (error) {
        alert('Failed to update post')
        setSaving(false)
        return
      }
      router.refresh()
    } else {
      const { error } = await supabase
        .from('blog_posts')
        .insert({ ...payload, created_at: new Date().toISOString() })
      if (error) {
        alert('Failed to create post')
        setSaving(false)
        return
      }
      router.push('/admin/blog')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!post) return
    if (!confirm('Are you sure you want to delete this post?')) return
    setDeleting(true)
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', post.id)
    if (error) {
      alert('Failed to delete post')
      setDeleting(false)
      return
    }
    router.push('/admin/blog')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Slug <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Content</label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write your post content here..."
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Cover Image URL</label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://..."
          className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="published"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 rounded border-neutral-700 text-white focus:ring-neutral-900"
        />
        <label htmlFor="published" className="text-sm text-neutral-300">Published</label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-neutral-900 text-white text-sm font-medium py-2 px-6 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Post'}
          </button>
        )}
      </div>
    </form>
  )
}
