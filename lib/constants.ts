export const SUBMISSION_STATUSES = ['new', 'read', 'replied', 'archived'] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export const INQUIRY_STATUSES = ['new', 'in_progress', 'completed', 'archived'] as const
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

export const REQUIREMENT_TYPES = ['product_design', 'website', 'branding'] as const
export type RequirementType = (typeof REQUIREMENT_TYPES)[number]

export const ROLES = ['admin', 'member'] as const
export type Role = (typeof ROLES)[number]

export const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-900/40 text-blue-300',
  read: 'bg-neutral-800 text-neutral-300',
  replied: 'bg-green-900/40 text-green-300',
  in_progress: 'bg-yellow-900/40 text-yellow-300',
  completed: 'bg-green-900/40 text-green-300',
  archived: 'bg-neutral-800 text-neutral-500',
}

export const REQUIREMENT_LABELS: Record<string, string> = {
  product_design: 'Product Design',
  website: 'Website',
  branding: 'Branding',
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
