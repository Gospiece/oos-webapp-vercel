import Link from 'next/link'

interface Workspace {
  id: string
  name: string
  description?: string | null
  verification_status: 'unverified' | 'verified'
}

interface Membership {
  role: 'admin' | 'team'
  badge: 'admin' | 'team'
}

interface WorkspaceHeaderProps {
  workspace: Workspace | null
  membership: Membership | null
  workspaceId: string
}

export default function WorkspaceHeader({ 
  workspace, 
  membership, 
  workspaceId 
}: WorkspaceHeaderProps) {
  if (!workspace || !membership) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 text-lg">🏢</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Loading...
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-primary-600 text-lg">🏢</span>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {workspace.name}
                </h1>
                <p className="text-sm text-gray-500">
                  Workspace • {membership.role === 'admin' ? 'Admin' : 'Member'} • {workspace.verification_status}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Workspace Actions */}
            <div className="flex items-center space-x-3">
              <Link 
                href={`/workspace/${workspaceId}/meeting`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <span className="mr-2">🎥</span>
                Start Meeting
              </Link>
              
              {membership.role === 'admin' && (
                <Link 
                  href={`/workspace/${workspaceId}/members`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <span className="mr-2">👥</span>
                  Manage Team
                </Link>
              )}
            </div>

            {/* Back to Dashboard */}
            <Link 
              href="/dashboard"
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}