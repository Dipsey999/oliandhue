import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Topbar } from '@/components/admin/topbar'
import type { Profile, Setting } from '@/lib/types/database'
import { SettingsForm } from './settings-form'

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id ?? '')
    .single<Profile>()

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .returns<Setting[]>()

  // Transform settings array into a key-value map
  const settingsMap: Record<string, Record<string, unknown>> = {}
  ;(settings ?? []).forEach((s) => {
    settingsMap[s.key] = s.value
  })

  return (
    <>
      <Topbar user={profile} title="Settings" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-white mb-6">Settings</h1>
        <SettingsForm initialSettings={settingsMap} />
      </div>
    </>
  )
}
