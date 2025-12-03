'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Workspace {
  id: string
  name: string
  description: string
  verification_status: string
  admin_id: string
  created_at: string
}

interface WorkspaceMember {
  id: string
  user_id: string
  role: string
  badge: string
  users: {
    email: string
    full_name: string
  }
}

export default function WorkspaceDetail({ workspaceId }: { workspaceId: string }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const fetchWorkspaceData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (isMounted) router.push('/auth/login')
          return
        }

        // Load workspace details
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single()

        if (workspaceError || !workspaceData) {
          if (isMounted) router.push('/dashboard')
          return
        }

        if (isMounted) {
          setWorkspace(workspaceData)
        }

        // Check if user is admin
        const { data: userMembership } = await supabase
          .from('workspace_members')
          .select('role')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user.id)
          .single()

        if (isMounted) {
          setIsAdmin(userMembership?.role === 'admin' || workspaceData.admin_id === user.id)
        }

        // Load workspace members
        const { data: membersData, error: membersError } = await supabase
          .from('workspace_members')
          .select(`
            id,
            user_id,
            role,
            badge,
            users (
              email,
              full_name
            )
          `)
          .eq('workspace_id', workspaceId)

        if (membersError) {
          console.error('Error fetching members:', membersError)
          return
        }

        // Transform the data to match our interface
        const transformedMembers = (membersData || []).map(member => {
          // Handle the case where users might be an array (Supabase relation)
          const userData = Array.isArray(member.users) ? member.users[0] : member.users
          return {
            id: member.id,
            user_id: member.user_id,
            role: member.role,
            badge: member.badge,
            users: userData || { email: 'Unknown', full_name: 'Unknown User' }
          }
        })

        if (isMounted) {
          setMembers(transformedMembers)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching workspace data:', error)
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchWorkspaceData()

    return () => {
      isMounted = false
    }
  }, [workspaceId, router, supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading workspace...</div>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">Workspace not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{workspace.name}</h1>
            <p className="text-gray-600 mt-2">{workspace.description}</p>
            <div className="flex items-center gap-4 mt-4">
              <Badge variant={workspace.verification_status === 'verified' ? 'success' : 'outline'}>
                {workspace.verification_status}
              </Badge>
              <span className="text-sm text-gray-500">
                Created {new Date(workspace.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link href={`/workspace/${workspaceId}/settings`}>
                <Button variant="outline">Settings</Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Workspace Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your workspace activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button className="h-auto py-4 flex flex-col items-center gap-2">
                    <span className="text-2xl">🎥</span>
                    <span>Start Meeting</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                    <span className="text-2xl">📁</span>
                    <span>Files</span>
                  </Button>
                  {isAdmin && (
                    <>
                      <Link href={`/workspace/${workspaceId}/members`} className="block">
                        <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 w-full">
                          <span className="text-2xl">👥</span>
                          <span>Manage Members</span>
                        </Button>
                      </Link>
                      <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2">
                        <span className="text-2xl">📊</span>
                        <span>Analytics</span>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates in this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">👋</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Welcome to your workspace!</p>
                      <p className="text-xs text-gray-500">Get started by inviting team members</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Members & Info */}
          <div className="space-y-6">
            {/* Members Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Team Members</span>
                  <Badge>{members.length}</Badge>
                </CardTitle>
                <CardDescription>People in this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {member.users?.full_name?.[0]?.toUpperCase() || member.users?.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {member.users?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">{member.users?.email}</p>
                        </div>
                      </div>
                      <Badge variant={member.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                        {member.role}
                      </Badge>
                    </div>
                  ))}
                  {members.length > 5 && (
                    <Link href={`/workspace/${workspaceId}/members`}>
                      <Button variant="ghost" className="w-full text-sm">
                        View all {members.length} members
                      </Button>
                    </Link>
                  )}
                </div>
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
                  <Badge variant={workspace.verification_status === 'verified' ? 'success' : 'outline'}>
                    {workspace.verification_status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span>{members.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{new Date(workspace.created_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}