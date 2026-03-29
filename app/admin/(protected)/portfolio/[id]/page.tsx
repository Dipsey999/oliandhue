import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { Profile, PortfolioItem } from '@/lib/types/database'
import { PortfolioForm } from '../portfolio-form'

export default async function EditPortfolioItemPage({
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

  const { data: item } = await supabase
    .from('portfolio_items')
    .select('*')
    .eq('id', id)
    .single<PortfolioItem>()

  if (!item) {
    return (
      <>
        <Topbar user={profile} title="Item Not Found" />
        <div className="p-6">
          <p className="text-neutral-500">Portfolio item not found.</p>
          <Link href="/admin/portfolio" className="text-sm text-white hover:underline mt-2 inline-block">
            Back to portfolio
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Topbar user={profile} title="Edit Portfolio Item" />
      <div className="p-6">
        <Link href="/admin/portfolio" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to portfolio
        </Link>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Edit Portfolio Item</h2>
          <PortfolioForm item={item} />
        </div>
      </div>
    </>
  )
}
