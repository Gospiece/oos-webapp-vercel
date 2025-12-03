'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface DeleteWorkspaceButtonProps {
  workspaceId: string
  workspaceName: string
}

export function DeleteWorkspaceButton({ workspaceId, workspaceName }: DeleteWorkspaceButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${workspaceName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId)
      
      if (error) throw error
      
      // Redirect to dashboard after successful deletion
      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to delete workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete Workspace'}
      </Button>
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}