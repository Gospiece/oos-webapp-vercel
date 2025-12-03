'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface NewsletterSubscribeProps {
  startupId: string
  startupName: string
  subscriberCount: number
}

export function NewsletterSubscribe({ startupId, startupName, subscriberCount }: NewsletterSubscribeProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkSubscriptionStatus()
  }, [startupId])

  const checkSubscriptionStatus = async () => {
    try {
      const response = await fetch(`/api/startup/${startupId}/newsletter`)
      const data = await response.json()

      if (response.ok) {
        setIsSubscribed(data.isSubscribed)
      }
    } catch (error) {
      console.error('Failed to check subscription status:', error)
    } finally {
      setChecking(false)
    }
  }

  const toggleSubscription = async () => {
    setLoading(true)
    try {
      const method = isSubscribed ? 'DELETE' : 'POST'
      const response = await fetch(`/api/startup/${startupId}/newsletter`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setIsSubscribed(!isSubscribed)
      // Refresh the page to update subscriber count
      window.location.reload()
    } catch (error: any) {
      alert(`Failed to update subscription: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stay Updated</CardTitle>
        <CardDescription>
          Get the latest news and updates from {startupName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{subscriberCount}</div>
          <div className="text-sm text-gray-600">subscribers</div>
        </div>

        <Button
          onClick={toggleSubscription}
          disabled={loading}
          variant={isSubscribed ? 'outline' : 'default'}
          className="w-full"
        >
          {loading ? 'Processing...' : isSubscribed ? 'Unsubscribe' : 'Subscribe to Newsletter'}
        </Button>

        <div className="text-xs text-gray-500 text-center">
          {isSubscribed 
            ? "You're subscribed to updates from this startup"
            : "Get notified about major milestones and updates"
          }
        </div>
      </CardContent>
    </Card>
  )
}