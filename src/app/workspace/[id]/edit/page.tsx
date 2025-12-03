import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkspaceEditForm } from '@/components/workspace/workspace-edit-form'

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditWorkspacePage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  // Get workspace details
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!workspace) {
    return notFound()
  }

  // Check if user is admin of this workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', params.id)
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .single()

  if (!membership) {
    return notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Edit Workspace</h1>
          <p className="text-gray-600">Update your workspace information</p>
        </div>
        <WorkspaceEditForm workspace={workspace} />
      </div>
    </div>
  )
}