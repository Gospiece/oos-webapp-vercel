'use client'

import { useState, useEffect } from 'react'

interface AdminBadgeState {
  hasAdminBadge: boolean
  loading: boolean
  checkAdminBadge: () => Promise<void>
}

export function useAdminBadge(): AdminBadgeState {
  const [hasAdminBadge, setHasAdminBadge] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAdminBadge = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/badge')
      const data = await response.json()

      if (response.ok) {
        setHasAdminBadge(data.hasAdminBadge)
      }
    } catch (error) {
      console.error('Error checking admin badge:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAdminBadge()
  }, [])

  return { hasAdminBadge, loading, checkAdminBadge }
}