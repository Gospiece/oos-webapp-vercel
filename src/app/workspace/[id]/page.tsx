import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AIAssistant } from '@/components/ai/ai-assistant'
import { DeleteWorkspaceButton } from '@/components/workspace/delete-workspace-button'
import Link from 'next/link'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WorkspacePage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return notFound()
  }

  // Get workspace details
  const { data: workspace, error: workspaceError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (workspaceError || !workspace) {
    console.error('Workspace error:', workspaceError)
    return notFound()
  }

  // Check if user is a member of this workspace
  const { data: membership, error: membershipError } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', id)
    .eq('user_id', user.id)
    .single()

  if (membershipError || !membership) {
    console.error('Membership error:', membershipError)
    return notFound()
  }

  // Get member count
  const { count: memberCount } = await supabase
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', id)

  // Get recent meetings
  const { data: recentMeetings } = await supabase
    .from('video_meetings')
    .select('*')
    .eq('workspace_id', id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to {workspace.name}!
              </h2>
              <p className="text-gray-600">
                {workspace.description || 'Collaborate with your team and get work done efficiently.'}
              </p>
            </div>
            <div className="text-right">
              <Badge variant={membership.role === 'admin' ? 'default' : 'secondary'} className="text-sm">
                {membership.role === 'admin' ? '👑 Workspace Admin' : '👥 Team Member'}
              </Badge>
              <p className="text-sm text-gray-500 mt-1">
                {memberCount} team member{memberCount !== 1 ? 's' : ''}
              </p>
              {membership.role === 'admin' && (
                <div className="mt-2">
                  <DeleteWorkspaceButton workspaceId={id} workspaceName={workspace.name} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary-600">{memberCount || 0}</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {recentMeetings?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Recent Meetings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {workspace.verification_status === 'verified' ? '✅' : '🔄'}
                </div>
                <div className="text-sm text-gray-600">
                  {workspace.verification_status === 'verified' ? 'Verified' : 'Unverified'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Assistant for Workspace */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🤖</span>
                Workspace AI Assistant
                <Badge variant="outline" className="text-xs">Beta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AIAssistant />
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-medium">Workspace-specific AI features:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Generate meeting minutes from your workspace discussions</li>
                  <li>Analyze team performance and collaboration patterns</li>
                  <li>Create project timelines and task breakdowns</li>
                  <li>Generate reports and presentations</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentMeetings && recentMeetings.length > 0 ? (
                <div className="space-y-4">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600">🎥</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Meeting: {meeting.room_name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(meeting.created_at).toLocaleDateString()} • 
                          {meeting.duration ? ` ${meeting.duration}min` : ' Not recorded'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {meeting.participant_count || 0} participants
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎥</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No meetings yet
                  </h3>
                  <p className="text-gray-600">
                    Start your first video meeting to collaborate with your team.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link 
                href={`/workspace/${id}/meeting`}
                className="block w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="font-medium flex items-center gap-2">
                  <span>🎥</span>
                  Start Video Meeting
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Instant video conference with your team
                </div>
              </Link>
              
              <Link 
                href={`/workspace/${id}/members`}
                className="block w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
              >
                <div className="font-medium flex items-center gap-2">
                  <span>👥</span>
                  Invite Team Members
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Add new members to this workspace
                </div>
              </Link>
              
              <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                <div className="font-medium flex items-center gap-2">
                  <span>📋</span>
                  Create Project
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Start a new project or task list
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Workspace Info */}
          <Card>
            <CardHeader>
              <CardTitle>Workspace Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={workspace.verification_status === 'verified' ? 'success' : 'secondary'}>
                  {workspace.verification_status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900">
                  {new Date(workspace.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Role:</span>
                <span className="text-gray-900 capitalize">{membership.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Members:</span>
                <span className="text-gray-900">{memberCount}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}