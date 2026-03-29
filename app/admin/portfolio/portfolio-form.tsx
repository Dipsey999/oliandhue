'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PortfolioItem } from '@/lib/types/database'

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface PortfolioFormProps {
  item?: PortfolioItem
}

export function PortfolioForm({ item }: PortfolioFormProps) {
  const isEditing = !!item
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState(item?.name ?? '')
  const [slug, setSlug] = useState(item?.slug ?? '')
  const [brandDescription, setBrandDescription] = useState(item?.brand_description ?? '')
  const [heading, setHeading] = useState(item?.heading ?? '')
  const [brandColor, setBrandColor] = useState(item?.brand_color ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(item?.cover_image_url ?? '')
  const [displayOrder, setDisplayOrder] = useState(item?.display_order ?? 0)
  const [published, setPublished] = useState(item?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function handleNameChange(value: string) {
    setName(value)
    if (!isEditing) {
      setSlug(slugify(value))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !slug.trim()) return alert('Name and slug are required')

    setSaving(true)
    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      brand_description: brandDescription.trim() || null,
      heading: heading.trim() || null,
      brand_color: brandColor.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      display_order: displayOrder,
      published,
      updated_at: new Date().toISOString(),
    }

    if (isEditing) {
      const { error } = await supabase
        .from('portfolio_items')
        .update(payload)
        .eq('id', item.id)
      if (error) {
        alert('Failed to update portfolio item')
        setSaving(false)
        return
      }
      router.refresh()
    } else {
      const { error } = await supabase
        .from('portfolio_items')
        .insert({ ...payload, created_at: new Date().toISOString() })
      if (error) {
        alert('Failed to create portfolio item')
        setSaving(false)
        return
      }
      router.push('/admin/portfolio')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!item) return
    if (!confirm('Are you sure you want to delete this portfolio item?')) return
    setDeleting(true)
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', item.id)
    if (error) {
      alert('Failed to delete portfolio item')
      setDeleting(false)
      return
    }
    router.push('/admin/portfolio')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
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
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Brand Description</label>
        <textarea
          value={brandDescription}
          onChange={(e) => setBrandDescription(e.target.value)}
          rows={3}
          className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Heading</label>
        <input
          type="text"
          value={heading}
          onChange={(e) => setHeading(e.target.value)}
          className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Brand Color</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#000000"
              className="flex-1 border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
            />
            {brandColor && (
              <div
                className="w-8 h-8 rounded-lg border border-neutral-800 flex-shrink-0"
                style={{ backgroundColor: brandColor }}
              />
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">Display Order</label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className="w-full border border-neutral-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent"
          />
        </div>
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
          {saving ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Item'}
          </button>
        )}
      </div>
    </form>
  )
}
