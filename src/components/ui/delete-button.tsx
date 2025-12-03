"use client"

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteButtonProps {
  id: string
  type: 'workspace' | 'startup'
  onDelete?: () => void
}

export function DeleteButton({ id, type, onDelete }: DeleteButtonProps) {
  const router = useRouter()

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const supabase = createClient()
        const table = type === 'workspace' ? 'workspaces' : 'startups'
        
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', id)
        
        if (error) throw error
        
        // Call optional callback
        onDelete?.()
        
        // Refresh and redirect
        router.refresh()
        router.push('/dashboard')
      } catch (error) {
        console.error(`Error deleting ${type}:`, error)
        alert(`Failed to delete ${type}. Please try again.`)
      }
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDelete}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4 mr-1" />
      Delete
    </Button>
  )
}