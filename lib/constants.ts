export const PIPELINE_STATUSES = ['new', 'contacted', 'in_discussion', 'proposal_sent', 'negotiation', 'won', 'lost', 'archived'] as const
export type PipelineStatus = (typeof PIPELINE_STATUSES)[number]

// Backward-compatible aliases
export const SUBMISSION_STATUSES = PIPELINE_STATUSES
export type SubmissionStatus = PipelineStatus

export const INQUIRY_STATUSES = PIPELINE_STATUSES
export type InquiryStatus = PipelineStatus

export const REQUIREMENT_TYPES = ['product_design', 'website', 'branding'] as const
export type RequirementType = (typeof REQUIREMENT_TYPES)[number]

export const ROLES = ['admin', 'member'] as const
export type Role = (typeof ROLES)[number]

export const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PAYMENT_STATUSES = ['pending', 'partial', 'paid', 'overdue', 'refunded'] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_METHODS = ['bank_transfer', 'upi', 'paypal', 'stripe', 'other'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  paypal: 'PayPal',
  stripe: 'Stripe',
  other: 'Other',
}

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-900/40 text-blue-300',
  contacted: 'bg-cyan-900/40 text-cyan-300',
  in_discussion: 'bg-purple-900/40 text-purple-300',
  proposal_sent: 'bg-indigo-900/40 text-indigo-300',
  negotiation: 'bg-amber-900/40 text-amber-300',
  won: 'bg-green-900/40 text-green-300',
  lost: 'bg-red-900/40 text-red-300',
  archived: 'bg-neutral-800 text-neutral-500',
}

export const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-neutral-800 text-neutral-400',
  medium: 'bg-blue-900/40 text-blue-300',
  high: 'bg-orange-900/40 text-orange-300',
  urgent: 'bg-red-900/40 text-red-300',
}

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900/40 text-yellow-300',
  partial: 'bg-blue-900/40 text-blue-300',
  paid: 'bg-green-900/40 text-green-300',
  overdue: 'bg-red-900/40 text-red-300',
  refunded: 'bg-neutral-800 text-neutral-400',
}

export const REQUIREMENT_LABELS: Record<string, string> = {
  product_design: 'Product Design',
  website: 'Website',
  branding: 'Branding',
}

export const WORK_CATEGORIES = ['product_design', 'website', 'branding', 'design_dev'] as const
export type WorkCategory = (typeof WORK_CATEGORIES)[number]

export const WORK_CATEGORY_LABELS: Record<string, string> = {
  product_design: 'Product Design',
  website: 'Website',
  branding: 'Branding',
  design_dev: 'Design & Dev',
}

// Maps DB category to the data-categories value used in works.html filter
export const WORK_CATEGORY_FILTER_MAP: Record<string, string> = {
  product_design: 'product-design',
  website: 'website',
  branding: 'branding',
  design_dev: 'design-dev',
}

export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
  { label: 'Submissions', href: '/admin/submissions', icon: 'MessageSquare' },
  { label: 'Inquiries', href: '/admin/inquiries', icon: 'Briefcase' },
  { label: 'Subscribers', href: '/admin/subscribers', icon: 'Mail' },
  { label: 'Clients', href: '/admin/clients', icon: 'Users' },
  { label: 'Blog', href: '/admin/blog', icon: 'FileText' },
  { label: 'Portfolio', href: '/admin/portfolio', icon: 'Image' },
  { label: 'Team', href: '/admin/team', icon: 'UserCog' },
  { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
] as const
