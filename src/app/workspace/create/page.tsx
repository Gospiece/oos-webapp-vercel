import { WorkspaceForm } from '@/components/forms/workspace-form'

export default function CreateWorkspacePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Workspace</h1>
          <p className="mt-2 text-gray-600">
            Set up a new collaborative space for your team
          </p>
        </div>
        <WorkspaceForm />
      </div>
    </div>
  )
}