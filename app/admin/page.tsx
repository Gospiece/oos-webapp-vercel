import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminStats } from '@/components/admin/admin-stats'
import { PendingVerifications } from '@/components/admin/pending-verifications'
import { PlatformAnalytics } from '@/components/admin/platform-analytics'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  // Check if user has admin badge
  const { data: adminBadge } = await supabase
    .from('admin_badges')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!adminBadge) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage platform users, startups, and verifications</p>
      </div>

      <div className="space-y-8">
        <AdminStats />
        <PendingVerifications />
        <PlatformAnalytics />
      </div>
    </div>
  )
}