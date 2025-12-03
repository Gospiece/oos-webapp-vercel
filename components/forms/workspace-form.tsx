'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export function WorkspaceForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      console.log('Starting workspace creation...')
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        setError('Authentication error: ' + authError.message)
        return
      }
      
      if (!user) {
        console.error('No user found')
        setError('You must be logged in to create a workspace')
        return
      }

      console.log('User found:', user.id)

      // Check for admin badge
      const { data: adminBadge, error: badgeError } = await supabase
        .from('admin_badges')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (badgeError && badgeError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Badge check error:', badgeError)
        setError('Error checking admin badge: ' + badgeError.message)
        return
      }

      if (!adminBadge) {
        console.log('No admin badge found, redirecting...')
        setError('You need an Admin badge to create a workspace.')
        setTimeout(() => {
          router.push('/admin/badge')
        }, 2000)
        return
      }

      console.log('Admin badge found, creating workspace...')

      // Create workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            admin_id: user.id
          }
        ])
        .select()
        .single()

      if (workspaceError) {
        console.error('Workspace creation error:', workspaceError)
        setError('Failed to create workspace: ' + workspaceError.message)
        return
      }

      console.log('Workspace created:', workspaceData)

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert([
          {
            workspace_id: workspaceData.id,
            user_id: user.id,
            role: 'admin',
            badge: 'admin'
          }
        ])

      if (memberError) {
        console.error('Member creation error:', memberError)
        setError('Workspace created but failed to add you as member: ' + memberError.message)
        return
      }

      console.log('Member added successfully')

      // Show success message
      setMessage('Workspace created successfully! Redirecting...')
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 1500)

    } catch (error) {
      console.error('Unexpected error:', error)
      setError('An unexpected error occurred: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Workspace</CardTitle>
        <CardDescription>
          Set up a collaborative space for your team. You&apos;ll need an Admin badge to create a workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Workspace Name *
              </label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Tech Team, Marketing Department, Startup Inc."
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Choose a name that represents your team or project
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe the purpose of this workspace, your team members, or main objectives..."
                value={formData.description}
                onChange={handleChange}
                className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={4}
              />
              <p className="text-xs text-gray-500">
                Optional: Help team members understand the workspace purpose
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-600">💼</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Admin Badge Required
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  <p>
                    You need an Admin badge to create workspaces. This ensures only authorized users can manage team spaces.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Creating Workspace...' : 'Create Workspace'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}