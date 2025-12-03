import { AdminBadgeRequest } from '@/components/admin/admin-badge-request'

export default function AdminBadgePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Get Your Admin Badge
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock the power to create and manage workspaces, lead teams, and organize video meetings.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <AdminBadgeRequest />
            
            <div className="space-y-6">
              <Card className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🎯 What You Get
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Create unlimited workspaces
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Invite and manage team members
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Start video meetings
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span>
                    Access workspace analytics
                  </li>
                </ul>
              </Card>

              <Card className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  💡 Pro Tip
                </h3>
                <p className="text-blue-700">
                  With great power comes great responsibility! Use your admin privileges to create 
                  amazing collaborative spaces for your teams.
                </p>
              </Card>

              <Card className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  🔒 Security Note
                </h3>
                <p className="text-gray-600">
                  Admin badges are free but carefully monitored. Any misuse may result in 
                  badge revocation to maintain platform integrity.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Simple Card component for the admin page
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}