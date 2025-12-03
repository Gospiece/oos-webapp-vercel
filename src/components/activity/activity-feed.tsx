import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ActivityFeed from '@/components/activity/activity-feed'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view the dashboard</p>
      </div>
    )
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get real stats - REMOVE MOCK DATA
  const { data: userWorkspaces } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)

  const { data: userStartups } = await supabase
    .from('startups')
    .select('id')
    .eq('user_id', user.id)

  const { data: userMeetings } = await supabase
    .from('video_meetings')
    .select('id')
    .eq('admin_id', user.id)

  // Real stats
  const stats = [
    { name: 'Workspaces', value: userWorkspaces?.length || 0, change: '+0', changeType: 'positive' },
    { name: 'Startups', value: userStartups?.length || 0, change: '+0', changeType: 'positive' },
    { name: 'Team Members', value: '8', change: '+0', changeType: 'positive' }, // TODO: Calculate actual team members
    { name: 'Meetings', value: userMeetings?.length || 0, change: '+0', changeType: 'positive' },
  ]

  // Check admin badge
  const { data: adminBadge } = await supabase
    .from('admin_badges')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const hasAdminBadge = !!adminBadge

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              {/* USE REAL USER DATA */}
              <CardTitle>Welcome back, {profile?.full_name || user?.email || 'User'}! 👋</CardTitle>
              <CardDescription>
                Here&apos;s what&apos;s happening with your workspaces and startups today.
              </CardDescription>
            </div>
            <Badge variant={hasAdminBadge ? "success" : "secondary"}>
              {hasAdminBadge ? "🛡️ Admin" : "👤 User"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link href="/workspace/create">
              <Button 
                className="bg-primary-600 hover:bg-primary-700"
                disabled={!hasAdminBadge}
              >
                <span className="mr-2">🏢</span>
                Create Workspace
                {!hasAdminBadge && " (Admin Required)"}
              </Button>
            </Link>
            
            {!hasAdminBadge && (
              <Link href="/admin/badge">
                <Button variant="outline">
                  <span className="mr-2">🛡️</span>
                  Get Admin Badge
                </Button>
              </Link>
            )}
            
            <Link href="/startup/create">
              <Button variant="outline">
                <span className="mr-2">🚀</span>
                Pitch Startup
              </Button>
            </Link>
          </div>

          {!hasAdminBadge && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-600">💡</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Admin Badge Required
                  </h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    <p>
                      You need an Admin badge to create workspaces.{" "}
                      <Link href="/admin/badge" className="font-medium underline">
                        Get your free admin badge
                      </Link>{" "}
                      to unlock workspace creation and team management features.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid - USE REAL STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500">
                <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>{' '}
                from last week
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Feed - REPLACE MOCK DATA */}
      <ActivityFeed />

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href="/workspace/create">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <div className="text-left">
                  <div className="font-medium">Create Workspace</div>
                  <div className="text-sm text-gray-500">Start collaborating</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/startup/create">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <div className="text-left">
                  <div className="font-medium">Pitch Startup</div>
                  <div className="text-sm text-gray-500">Get funding</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/meeting/schedule">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <div className="text-left">
                  <div className="font-medium">Schedule Meeting</div>
                  <div className="text-sm text-gray-500">Video conference</div>
                </div>
              </Button>
            </Link>
            
            <Link href="/profile/edit">
              <Button variant="outline" className="w-full justify-start h-auto py-3">
                <div className="text-left">
                  <div className="font-medium">Edit Profile</div>
                  <div className="text-sm text-gray-500">Update info</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}