'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

export function AdminBadgeRequest() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUserId(user?.id || null)
    }
    getUserId()
  }, [supabase])

  const requestAdminBadge = async () => {
    if (!userId) {
      setError('You must be logged in to request an admin badge')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch('/api/admin/badge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to request admin badge')
        return
      }

      setMessage(data.message || 'Admin badge granted successfully!')
      // Refresh the page to update the UI
      setTimeout(() => {
        router.push('/dashboard')
        router.refresh()
      }, 2000)
    } catch (error) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full border-2 border-dashed border-blue-200 bg-white/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
          <span className="text-2xl">🛡️</span>
        </div>
        <CardTitle className="text-2xl text-gray-900">
          Get Your Admin Badge
        </CardTitle>
        <CardDescription className="text-lg">
          Free • Instant • Powerful
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* Features List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-blue-600">🏢</span>
              </div>
              <span className="font-medium text-gray-900">Workspace Creation</span>
            </div>
            <Badge variant="success" className="bg-green-100 text-green-800">
              Unlocked
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-blue-600">👥</span>
              </div>
              <span className="font-medium text-gray-900">Team Management</span>
            </div>
            <Badge variant="success" className="bg-green-100 text-green-800">
              Unlocked
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-blue-600">🎥</span>
              </div>
              <span className="font-medium text-gray-900">Video Meetings</span>
            </div>
            <Badge variant="success" className="bg-green-100 text-green-800">
              Unlocked
            </Badge>
          </div>
        </div>

        <Button
          onClick={requestAdminBadge}
          disabled={loading || !userId}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
          size="lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>✨</span>
              Get Admin Badge Now
              <span>✨</span>
            </span>
          )}
        </Button>

        {!userId && (
          <div className="text-center text-sm text-yellow-600">
            Please log in to request an admin badge
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm">
            <span>⚡</span>
            Instant access • No credit card required
          </div>
        </div>
      </CardContent>
    </Card>
  )
}