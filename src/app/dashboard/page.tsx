'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkspaceList } from '@/components/workspace/workspace-list'
import { AIAssistant } from '@/components/ai/ai-assistant'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type UserWorkspace = Database['public']['Tables']['workspaces']['Row'] & {
  member_count?: number
}

type UserStartup = Database['public']['Tables']['startups']['Row'] & {
  donation_total?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [hasAdminBadge, setHasAdminBadge] = useState(false)
  const [loading, setLoading] = useState(true)
  const [workspaces, setWorkspaces] = useState<UserWorkspace[]>([])
  const [startups, setStartups] = useState<UserStartup[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [stats, setStats] = useState({
    workspaces: 0,
    startups: 0,
    team_members: 0,
    meetings: 0,
    donations_received: 0,
    total_funding: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (!user) {
        setLoading(false)
        return
      }

      // Check admin badge
      const { data: adminBadge } = await supabase
        .from('admin_badges')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setHasAdminBadge(!!adminBadge)

      // Load user's workspaces (where they're admin or member)
      const { data: workspaceData } = await supabase
        .from('workspace_members')
        .select(`
          workspace:workspaces (*),
          role
        `)
        .eq('user_id', user.id)

      if (workspaceData) {
        const userWorkspaces = workspaceData.map(item => item.workspace as UserWorkspace)
        setWorkspaces(userWorkspaces)
      }

      // Load user's startups
      const { data: startupData } = await supabase
        .from('startups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (startupData) {
        // Calculate donation totals for each startup
        const startupsWithTotals = await Promise.all(
          startupData.map(async (startup) => {
            const { data: donations } = await supabase
              .from('donations')
              .select('amount')
              .eq('startup_id', startup.id)
              .eq('status', 'completed')
            
            const donationTotal = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0
            
            return {
              ...startup,
              donation_total: donationTotal
            }
          })
        )
        setStartups(startupsWithTotals)
      }

      // Load stats
      await loadStats(user.id)

      // Get recent activity
      const [
        { data: recentWorkspaces },
        { data: recentStartups },
        { data: recentMeetings }
      ] = await Promise.all([
        supabase
          .from('workspaces')
          .select('*')
          .eq('admin_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('startups')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('video_meetings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
      ])

      // Combine recent activity
      const activity = [
        ...(recentWorkspaces?.map(workspace => ({
          id: workspace.id,
          type: 'workspace' as const,
          action: 'created',
          target: workspace.name,
          time: workspace.created_at
        })) || []),
        ...(recentStartups?.map(startup => ({
          id: startup.id,
          type: 'startup' as const,
          action: 'pitched',
          target: startup.name,
          time: startup.created_at
        })) || []),
        ...(recentMeetings?.map(meeting => ({
          id: meeting.id,
          type: 'meeting' as const,
          action: 'scheduled',
          target: meeting.room_name,
          time: meeting.created_at
        })) || [])
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 5)

      setRecentActivity(activity)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (userId: string) => {
    try {
      // Count workspaces where user is member
      const { count: workspaceCount } = await supabase
        .from('workspace_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Count user's startups
      const { count: startupCount } = await supabase
        .from('startups')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Calculate team members across all workspaces
      const { data: userWorkspaces } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', userId)
      
      let teamMemberCount = 0
      if (userWorkspaces) {
        for (const ws of userWorkspaces) {
          const { count } = await supabase
            .from('workspace_members')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', ws.workspace_id)
          teamMemberCount += (count || 0)
        }
      }

      // Count meetings user participated in
      const { count: meetingCount } = await supabase
        .from('meeting_participants')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Calculate donations received
      const { data: donations } = await supabase
        .from('donations')
        .select('amount')
        .eq('status', 'completed')
        .in('startup_id', startups.map(s => s.id))

      const donationsReceived = donations?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

      // Calculate total funding (sum of donation totals for all startups)
      const totalFunding = startups.reduce((sum, s) => sum + (s.donation_total || 0), 0)

      setStats({
        workspaces: workspaceCount || 0,
        startups: startupCount || 0,
        team_members: teamMemberCount,
        meetings: meetingCount || 0,
        donations_received: donationsReceived,
        total_funding: totalFunding,
      })

    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Delete handler for workspaces
  const handleDeleteWorkspace = async (workspaceId: string) => {
    if (confirm('Are you sure you want to delete this workspace?')) {
      try {
        const { error } = await supabase
          .from('workspaces')
          .delete()
          .eq('id', workspaceId)
        
        if (error) throw error
        
        // Refresh data
        fetchDashboardData()
      } catch (error) {
        console.error('Error deleting workspace:', error)
        alert('Failed to delete workspace')
      }
    }
  }

  // Delete handler for startups
  const handleDeleteStartup = async (startupId: string) => {
    if (confirm('Are you sure you want to delete this startup?')) {
      try {
        const { error } = await supabase
          .from('startups')
          .delete()
          .eq('id', startupId)
        
        if (error) throw error
        
        // Refresh data
        fetchDashboardData()
      } catch (error) {
        console.error('Error deleting startup:', error)
        alert('Failed to delete startup')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <Card>
          <CardContent className="p-8">
            <p className="text-lg text-gray-600 mb-4">Please log in to view the dashboard</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statsData = [
    { 
      name: 'Workspaces', 
      value: stats.workspaces.toString(), 
      description: 'Your collaborative spaces',
      icon: '💼',
      color: 'blue'
    },
    { 
      name: 'Startups', 
      value: stats.startups.toString(), 
      description: 'Your startup pitches',
      icon: '🚀',
      color: 'green'
    },
    { 
      name: 'Team Members', 
      value: stats.team_members.toString(), 
      description: 'Across all workspaces',
      icon: '👥',
      color: 'purple'
    },
    { 
      name: 'Meetings', 
      value: stats.meetings.toString(), 
      description: 'Meetings attended',
      icon: '🎯',
      color: 'yellow'
    },
    { 
      name: 'Donations', 
      value: `$${stats.donations_received.toLocaleString()}`, 
      description: 'Total received',
      icon: '💰',
      color: 'red'
    },
    { 
      name: 'Admin', 
      value: hasAdminBadge ? 'Yes' : 'No', 
      description: 'Admin badge status',
      icon: hasAdminBadge ? '🛡️' : '👤',
      color: hasAdminBadge ? 'success' : 'secondary'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section with Admin Badge Status */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                Welcome back, {user.email}! 👋
                <span className="text-sm font-normal text-gray-500">
                  Powered by OOS ImpactAI
                </span>
              </CardTitle>
              <CardDescription>
                Smart workspace management with AI-powered insights
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

            <Link href="/dashboard/profile">
              <Button variant="outline">
                <span className="mr-2">👤</span>
                Edit Profile
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

      {/* Main Content Grid with AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats, Workspaces, and Startups */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statsData.slice(0, 3).map((stat) => (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <div className={`w-8 h-8 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                    <span className={`text-${stat.color}-600`}>{stat.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workspaces and Startups Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Your Workspaces Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Workspaces</CardTitle>
                    <CardDescription>
                      Manage and access your workspaces
                    </CardDescription>
                  </div>
                  <Link href="/workspace/create">
                    <Button 
                      size="sm" 
                      className="bg-primary-600 hover:bg-primary-700"
                      disabled={!hasAdminBadge}
                    >
                      + New
                      {!hasAdminBadge && " (Admin)"}
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {workspaces.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">💼</span>
                    </div>
                    <p className="text-gray-500 mb-4">You don't have any workspaces yet</p>
                    <Link href="/workspace/create">
                      <Button disabled={!hasAdminBadge}>
                        Create Your First Workspace
                        {!hasAdminBadge && " (Admin Required)"}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workspaces.slice(0, 3).map((workspace) => (
                      <div key={workspace.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{workspace.name[0]}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{workspace.name}</h3>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {workspace.description || 'No description'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={workspace.verification_status === 'verified' ? 'success' : 'outline'}>
                                {workspace.verification_status}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {workspace.member_count || 1} members
                              </span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/workspace/${workspace.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    ))}
                    {workspaces.length > 3 && (
                      <div className="text-center pt-2">
                        <Link href="/dashboard/workspaces">
                          <Button variant="ghost" size="sm">
                            View all {workspaces.length} workspaces →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Your Startups Section */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Startups</CardTitle>
                    <CardDescription>
                      Pitch and manage your startups
                    </CardDescription>
                  </div>
                  <Link href="/startup/create">
                    <Button size="sm">+ Pitch</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {startups.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🚀</span>
                    </div>
                    <p className="text-gray-500 mb-4">You haven't pitched any startups yet</p>
                    <Link href="/startup/create">
                      <Button>Pitch Your First Startup</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {startups.slice(0, 3).map((startup) => (
                      <div key={startup.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-bold">{startup.name[0]}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold">{startup.name}</h3>
                            <p className="text-sm text-gray-500 truncate max-w-[200px]">
                              {startup.description || 'No description'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={
                                startup.verification_tier === 'verified' ? 'success' : 
                                startup.verification_tier === 'registered' ? 'secondary' : 'outline'
                              }>
                                {startup.verification_tier}
                              </Badge>
                              {startup.donation_total && startup.donation_total > 0 && (
                                <span className="text-xs text-green-600 font-medium">
                                  ${startup.donation_total.toLocaleString()} funded
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/startup/${startup.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Link href={`/startup/${startup.id}/edit`}>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    {startups.length > 3 && (
                      <div className="text-center pt-2">
                        <Link href="/dashboard/startups">
                          <Button variant="ghost" size="sm">
                            View all {startups.length} startups →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Track your latest actions across the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-sm">
                            {activity.type === 'workspace' ? '🏢' : 
                             activity.type === 'startup' ? '🚀' : '🎥'}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-900">
                          You {activity.action} {activity.target}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(activity.time).toLocaleDateString()} at{' '}
                          {new Date(activity.time).toLocaleTimeString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {activity.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your activity will appear here as you use the platform
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - AI Assistant & Quick Actions */}
        <div className="space-y-8">
          {/* AI Assistant - This is the prioritized feature */}
          <AIAssistant />

          {/* Additional Stats Cards */}
          <div className="grid grid-cols-1 gap-4">
            {statsData.slice(3, 6).map((stat) => (
              <Card key={stat.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.name}
                  </CardTitle>
                  <div className={`w-8 h-8 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                    <span className={`text-${stat.color}-600`}>{stat.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Quickly access common features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Link href="/workspace/create">
                  <Button variant="outline" className="w-full justify-start h-auto py-3" disabled={!hasAdminBadge}>
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span>🏢</span>
                        Create Workspace
                      </div>
                      <div className="text-sm text-gray-500">Start collaborating</div>
                      {!hasAdminBadge && <div className="text-xs text-yellow-600 mt-1">Admin required</div>}
                    </div>
                  </Button>
                </Link>
                
                <Link href="/startup/create">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span>🚀</span>
                        Pitch Startup
                      </div>
                      <div className="text-sm text-gray-500">Get funding</div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/dashboard/workspaces">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span>📋</span>
                        View Workspaces
                      </div>
                      <div className="text-sm text-gray-500">All your spaces</div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/dashboard/startups">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span>📊</span>
                        View Startups
                      </div>
                      <div className="text-sm text-gray-500">All your pitches</div>
                    </div>
                  </Button>
                </Link>

                <Link href="/meeting/schedule">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span>🎥</span>
                        Schedule Meeting
                      </div>
                      <div className="text-sm text-gray-500">Video conference</div>
                    </div>
                  </Button>
                </Link>
                
                <Link href="/profile/edit">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="text-left">
                      <div className="font-medium flex items-center gap-2">
                        <span>👤</span>
                        Edit Profile
                      </div>
                      <div className="text-sm text-gray-500">Update info</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}