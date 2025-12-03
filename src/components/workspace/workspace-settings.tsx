'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Workspace {
  id: string
  name: string
  description: string
  verification_status: string
  admin_id: string
}

export default function WorkspaceSettings({ workspaceId }: { workspaceId: string }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadWorkspace()
  }, [workspaceId])

  const loadWorkspace = async () => {
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', workspaceId)
      .single()

    if (data) {
      setWorkspace(data)
      setFormData({
        name: data.name,
        description: data.description || ''
      })
    }
  }

  const updateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({
          name: formData.name,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)

      if (error) throw error

      setMessage('Workspace updated successfully!')
    } catch (error) {
      setError('Failed to update workspace')
    } finally {
      setLoading(false)
    }
  }

  const deleteWorkspace = async () => {
    if (!confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)

      if (error) throw error

      router.push('/dashboard')
    } catch (error) {
      setError('Failed to delete workspace')
    }
  }

  if (!workspace) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Basic Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>
            Manage your workspace information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateWorkspace} className="space-y-4">
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
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Workspace Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter workspace name"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your workspace"
                className="w-full min-h-[100px] rounded-md border border-gray-300 px-3 py-2"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Workspace'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-red-800">Delete Workspace</h4>
              <p className="text-sm text-red-600">
                Once deleted, this workspace and all its data cannot be recovered
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={deleteWorkspace}
            >
              Delete Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}