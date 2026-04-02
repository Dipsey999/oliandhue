export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: 'admin' | 'member'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface ContactSubmission {
  id: string
  name: string
  email: string
  message: string | null
  phone: string | null
  requirement: string | null
  checkbox_newsletter: boolean
  status: 'new' | 'read' | 'replied' | 'archived'
  form_source: string
  created_at: string
  updated_at: string
}

export interface ProjectInquiry {
  id: string
  name: string
  email: string
  phone: string | null
  requirement: 'product_design' | 'website' | 'branding' | null
  project_details: string | null
  project_links: string | null
  budget: string | null
  status: 'new' | 'in_progress' | 'completed' | 'archived'
  assigned_to: string | null
  client_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  source: string
  subscribed_at: string
  unsubscribed_at: string | null
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  description: string | null
  content: string | null
  cover_image_url: string | null
  published: boolean
  published_at: string | null
  author_id: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioItem {
  id: string
  name: string
  slug: string
  brand_description: string | null
  heading: string | null
  brand_color: string | null
  cover_image_url: string | null
  intro_title: string | null
  intro_text: string | null
  case_images: string[] | null
  midpage_image_url: string | null
  final_title: string | null
  final_text: string | null
  final_image_url: string | null
  display_order: number
  published: boolean
  tags: string[] | null
  created_at: string
  updated_at: string
}

export interface Setting {
  id: string
  key: string
  value: Record<string, unknown>
  updated_at: string
}

export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}
