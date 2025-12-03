import { WorkspaceList } from '@/components/workspace/workspace-list'

export default function WorkspacesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Workspaces</h1>
          <p className="text-gray-600 mt-2">
            Manage all your collaborative workspaces in one place
          </p>
        </div>
      </div>
      
      <WorkspaceList />
    </div>
  )
}