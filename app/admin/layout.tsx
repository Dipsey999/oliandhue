import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get current path to skip auth check on login page
  const headersList = await headers()
  const pathname = headersList.get('x-next-url') || headersList.get('x-invoke-path') || ''
  const isLoginPage = pathname.includes('/admin/login')

  // Auth guard — redirect to login if not authenticated (skip for login page)
  if (!isLoginPage) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      redirect('/admin/login')
    }
  }

  // Login page gets no sidebar
  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <main className="ml-56">
        {children}
      </main>
    </div>
  )
}
