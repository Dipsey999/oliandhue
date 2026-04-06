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
  status: 'new' | 'contacted' | 'in_discussion' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'archived'
  form_source: string
  company: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[] | null
  notes: string | null
  assigned_to: string | null
  follow_up_date: string | null
  project_value: string | null
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
  status: 'new' | 'contacted' | 'in_discussion' | 'proposal_sent' | 'negotiation' | 'won' | 'lost' | 'archived'
  assigned_to: string | null
  client_id: string | null
  notes: string | null
  company: string | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  tags: string[] | null
  follow_up_date: string | null
  project_value: string | null
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
  category: 'product_design' | 'website' | 'branding' | 'design_dev' | null
  client_name: string | null
  external_link: string | null
  description: string | null
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
  role_text: string | null
  overview_heading: string | null
  overview_text: string | null
  results_heading: string | null
  results_text: string | null
  showcase_image_url: string | null
  next_project_slug: string | null
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

export interface Payment {
  id: string
  entity_type: 'submission' | 'inquiry'
  entity_id: string
  amount: number
  currency: 'INR' | 'USD'
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'refunded'
  payment_date: string | null
  due_date: string | null
  method: 'bank_transfer' | 'upi' | 'paypal' | 'stripe' | 'other' | null
  invoice_number: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StatusHistory {
  id: string
  entity_type: 'submission' | 'inquiry'
  entity_id: string
  old_status: string | null
  new_status: string
  changed_by: string | null
  created_at: string
}

export interface Testimonial {
  id: string
  client_name: string
  client_role: string | null
  company: string | null
  content: string
  rating: number
  avatar_url: string | null
  is_featured: boolean
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface TestimonialSubmission {
  id: string
  client_name: string
  client_email: string
  client_role: string | null
  company: string | null
  content: string
  rating: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}
