'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { PortfolioItem } from '@/lib/types/database'
import { WORK_CATEGORIES, WORK_CATEGORY_LABELS } from '@/lib/constants'

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

  const [category, setCategory] = useState(item?.category ?? '')
  const [name, setName] = useState(item?.name ?? '')
  const [slug, setSlug] = useState(item?.slug ?? '')
  const [clientName, setClientName] = useState(item?.client_name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(item?.cover_image_url ?? '')
  const [brandColor, setBrandColor] = useState(item?.brand_color ?? '')
  const [externalLink, setExternalLink] = useState(item?.external_link ?? '')
  const [galleryImages, setGalleryImages] = useState<string[]>(item?.case_images ?? [])
  const [tags, setTags] = useState((item?.tags ?? []).join(', '))
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

  function addGalleryImage() {
    setGalleryImages([...galleryImages, ''])
  }

  function removeGalleryImage(index: number) {
    setGalleryImages(galleryImages.filter((_, i) => i !== index))
  }

  function updateGalleryImage(index: number, value: string) {
    const updated = [...galleryImages]
    updated[index] = value
    setGalleryImages(updated)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) return alert('Category is required')
    if (!name.trim() || !slug.trim()) return alert('Name and slug are required')

    setSaving(true)

    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const filteredImages = galleryImages.filter((url) => url.trim() !== '')

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      category: category || null,
      client_name: clientName.trim() || null,
      description: description.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      brand_color: brandColor.trim() || null,
      external_link: externalLink.trim() || null,
      case_images: filteredImages.length > 0 ? filteredImages : null,
      tags: parsedTags.length > 0 ? parsedTags : null,
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
        alert('Failed to update: ' + error.message)
        setSaving(false)
        return
      }
      router.refresh()
    } else {
      const { error } = await supabase
        .from('portfolio_items')
        .insert({ ...payload, created_at: new Date().toISOString() })
      if (error) {
        alert('Failed to create: ' + error.message)
        setSaving(false)
        return
      }
      router.push('/admin/portfolio')
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!item) return
    if (!confirm('Are you sure you want to delete this work item?')) return
    setDeleting(true)
    const { error } = await supabase
      .from('portfolio_items')
      .delete()
      .eq('id', item.id)
    if (error) {
      alert('Failed to delete: ' + error.message)
      setDeleting(false)
      return
    }
    router.push('/admin/portfolio')
  }

  const inputClass = 'w-full bg-neutral-800 border border-neutral-700 text-white placeholder:text-neutral-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent'

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {/* Category */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className={inputClass}
        >
          <option value="">Select category...</option>
          {WORK_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {WORK_CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {/* Name + Slug */}
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
            placeholder="Project name"
            className={inputClass}
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
            className={`${inputClass} font-mono`}
          />
        </div>
      </div>

      {/* Client Name */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Client Name
        </label>
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Client or company name"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Brief project description..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Cover Image URL */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Cover Image URL
        </label>
        <input
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://..."
          className={inputClass}
        />
      </div>

      {/* Brand Color + External Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
            Brand Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
              placeholder="#8b5cf6"
              className={`flex-1 ${inputClass}`}
            />
            {brandColor && /^#[0-9a-fA-F]{3,8}$/.test(brandColor) && (
              <div
                className="w-8 h-8 rounded-lg border border-neutral-700 flex-shrink-0"
                style={{ backgroundColor: brandColor }}
              />
            )}
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
            External Link
          </label>
          <input
            type="url"
            value={externalLink}
            onChange={(e) => setExternalLink(e.target.value)}
            placeholder="https://live-project.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* Gallery Images */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Gallery Images
        </label>
        <div className="space-y-2">
          {galleryImages.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => updateGalleryImage(index, e.target.value)}
                placeholder="https://..."
                className={`flex-1 ${inputClass}`}
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-2 rounded-lg bg-neutral-800 border border-neutral-700 transition"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addGalleryImage}
            className="text-xs text-neutral-400 hover:text-white px-3 py-1.5 rounded-lg border border-dashed border-neutral-700 hover:border-neutral-500 transition"
          >
            + Add Image
          </button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
          Tags
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="ui, ux, branding, saas"
          className={inputClass}
        />
        <p className="text-xs text-neutral-600 mt-1">Comma-separated</p>
      </div>

      {/* Display Order + Published */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
        <div>
          <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1.5">
            Display Order
          </label>
          <input
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className={inputClass}
          />
        </div>
        <div className="flex items-center gap-2 pb-2">
          <input
            type="checkbox"
            id="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-white focus:ring-neutral-600"
          />
          <label htmlFor="published" className="text-sm text-neutral-300">Published</label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-white text-black text-sm font-medium py-2 px-6 rounded-lg hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Item'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-medium text-red-500 hover:text-red-400 transition disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Item'}
          </button>
        )}
      </div>
    </form>
  )
}
