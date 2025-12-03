'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { WorkspaceCard } from './workspace-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Workspace {
  id: string
  name: string
  description: string | null
  verification_status: 'unverified' | 'verified'
  created_at: string
  member_count: number
}

// Add this prop to the interface
interface WorkspaceListProps {
  onDeleteWorkspace?: (workspaceId: string) => void
}

export function WorkspaceList({ onDeleteWorkspace }: WorkspaceListProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  // Add delete functionality to workspace cards
  const handleDelete = async (workspaceId: string) => {
    if (onDeleteWorkspace) {
      onDeleteWorkspace(workspaceId)
    }
  }

  const fetchWorkspaces = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to view workspaces')
        return
      }

      // Get workspaces where user is a member
      const { data: workspaceMembers, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          workspace_id,
          workspaces (*)
        `)
        .eq('user_id', user.id)

      if (membersError) {
        setError(membersError.message)
        return
      }

      // Get member counts for each workspace
      const workspaceData = await Promise.all(
        (workspaceMembers || []).map(async (member: any) => {
          const { count } = await supabase
            .from('workspace_members')
            .select('*', { count: 'exact', head: true })
            .eq('workspace_id', member.workspace_id)

          return {
            ...member.workspaces,
            member_count: count || 0
          }
        })
      )

      setWorkspaces(workspaceData)
    } catch (error) {
      setError('Failed to load workspaces')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading workspaces...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button onClick={fetchWorkspaces} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Workspaces</h2>
          <p className="text-gray-600">
            {workspaces.length} workspace{workspaces.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button onClick={fetchWorkspaces} variant="outline">
          Refresh
        </Button>
      </div>

      {workspaces.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Workspaces Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first workspace to start collaborating with your team.
            </p>
            <Button variant="default">
              <Link href="/workspace/create">Create Your First Workspace</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  )
}