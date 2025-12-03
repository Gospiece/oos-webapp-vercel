'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface DeleteStartupButtonProps {
  startupId: string
  startupName: string
}

export function DeleteStartupButton({ startupId, startupName }: DeleteStartupButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${startupName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error: deleteError } = await supabase
        .from('startups')
        .delete()
        .eq('id', startupId)
      
      if (deleteError) throw deleteError
      
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete startup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button
        variant="destructive"
        onClick={handleDelete}
        disabled={loading}
      >
        {loading ? 'Deleting...' : 'Delete Startup'}
      </Button>
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  )
}