import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StartupEditForm } from '@/components/startup/startup-edit-form'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditStartupPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  // Get startup details
  const { data: startup } = await supabase
    .from('startups')
    .select('*')
    .eq('id', params.id)
    .eq('is_active', true)
    .single()

  if (!startup) {
    return notFound()
  }

  // Check if user owns this startup
  if (startup.user_id !== user.id) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Startup</h1>
          <p className="text-gray-600">Update your startup information and pitch</p>
        </div>
        <StartupEditForm startup={startup} />
      </div>
    </div>
  )
}