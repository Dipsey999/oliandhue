'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial } from '@/lib/types/database'

interface TestimonialFormProps {
  testimonial?: Testimonial
}

export function TestimonialForm({ testimonial }: TestimonialFormProps) {
  const isEditing = !!testimonial
  const router = useRouter()
  const supabase = createClient()

  const [clientName, setClientName] = useState(testimonial?.client_name ?? '')
  const [clientRole, setClientRole] = useState(testimonial?.client_role ?? '')
  const [company, setCompany] = useState(testimonial?.company ?? '')
  const [content, setContent] = useState(testimonial?.content ?? '')
  const [rating, setRating] = useState(testimonial?.rating ?? 5)
  const [avatarUrl, setAvatarUrl] = useState(testimonial?.avatar_url ?? '')
  const [isFeatured, setIsFeatured] = useState(testimonial?.is_featured ?? false)
  const [published, setPublished] = useState(testimonial?.published ?? false)
  const [displayOrder, setDisplayOrder] = useState(testimonial?.display_order ?? 0)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim() || !content.trim()) return alert('Client name and content are required')

    setSaving(true)
    const payload = {
      client_name: clientName.trim(),
      client_role: clientRole.trim() || null,
      company: company.trim() || null,
      content: content.trim(),
      rating,
      avatar_url: avatarUrl.trim() || null,
      is_featured: isFeatured,
      published,
      display_order: displayOrder,
      updated_at: new Date().toISOString(),
    }

    if (isEditing) {
      const { error } = await supabase
        .from('testimonials')
        .update(payload)
        .eq('id', testimonial.id)
      if (error) {
        alert('Failed to update testimonial')
        setSaving(false)
        return
      }
      router.refresh()
    } else {
      const { error } = await supabase
        .from('testimonials')
        .insert({ ...payload, created_at: new Date().toISOString() })
      if (error) {
        alert('Failed to create testimonial')
        setSaving(false)
        return
      }
      router.push('/admin/testimonials')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!testimonial) return
    if (!confirm('Are you sure you want to delete this testimonial?')) return
    setDeleting(true)
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', testimonial.id)
    if (error) {
      alert('Failed to delete testimonial')
      setDeleting(false)
      return
    }
    router.push('/admin/testimonials')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Client Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Client Role
        </label>
        <input
          type="text"
          value={clientRole}
          onChange={(e) => setClientRole(e.target.value)}
          placeholder="CEO, Designer, etc."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Company
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Rating (1-5)
        </label>
        <input
          type="number"
          min={1}
          max={5}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-32 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Avatar URL
        </label>
        <input
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_featured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-700 text-white focus:ring-neutral-900"
          />
          <label htmlFor="is_featured" className="text-sm text-neutral-300">Is Featured</label>
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
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Display Order
        </label>
        <input
          type="number"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))}
          className="w-32 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-neutral-900 text-white text-sm font-medium py-2 px-6 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Testimonial' : 'Create Testimonial'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Testimonial'}
          </button>
        )}
      </div>
    </form>
  )
}
