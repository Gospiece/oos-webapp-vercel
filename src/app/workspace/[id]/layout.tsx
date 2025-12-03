'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import WorkspaceHeader from '@/components/workspace/workspace-header'

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

interface WorkspaceLayoutProps {
  children: React.ReactNode
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const params = useParams()
  const router = useRouter()
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const workspaceId = params.id as string

  useEffect(() => {
    async function loadWorkspace() {
      try {
        setLoading(true)
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Get workspace details
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single()

        if (workspaceError || !workspaceData) {
          console.error('Workspace not found:', workspaceError)
          router.push('/dashboard')
          return
        }

        setWorkspace(workspaceData)

        // Check if user is a member of this workspace
        const { data: membershipData, error: membershipError } = await supabase
          .from('workspace_members')
          .select('*')
          .eq('workspace_id', workspaceId)
          .eq('user_id', user.id)
          .single()

        if (membershipError || !membershipData) {
          console.error('Not a member:', membershipError)
          router.push('/dashboard')
          return
        }

        setMembership(membershipData)
      } catch (error) {
        console.error('Error loading workspace:', error)
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadWorkspace()
  }, [workspaceId, supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workspace...</p>
        </div>
      </div>
    )
  }

  if (!workspace || !membership) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🏢</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workspace Not Found</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have access to this workspace or it doesn&apos;t exist.</p>
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Workspace Header Component */}
      <WorkspaceHeader 
        workspace={workspace} 
        membership={membership} 
        workspaceId={workspaceId}
      />

      {/* Workspace Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              href={`/workspace/${workspaceId}`}
              className="border-primary-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <span className="mr-2">📊</span>
              Overview
            </Link>
            <Link
              href={`/workspace/${workspaceId}/members`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <span className="mr-2">👥</span>
              Team Members
            </Link>
            <Link
              href={`/workspace/${workspaceId}/meetings`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <span className="mr-2">🎥</span>
              Meetings
            </Link>
            <Link
              href={`/workspace/${workspaceId}/settings`}
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
            >
              <span className="mr-2">⚙️</span>
              Settings
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  )
}