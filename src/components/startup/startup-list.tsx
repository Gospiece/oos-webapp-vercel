'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { StartupCard } from './startup-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Startup {
  id: string
  name: string
  description: string | null
  verification_tier: 'registered' | 'verified'
  created_at: string
  pitch: string
  donation_count: number
  total_donations: number
}

export function StartupList() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchStartups()
  }, [])

  const fetchStartups = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to view startups')
        return
      }

      // Get user's startups
      const { data, error } = await supabase
        .from('startups')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        setError(error.message)
        return
      }

      // Get donation stats for each startup
      const startupsWithStats = await Promise.all(
        (data || []).map(async (startup) => {
          const { count: donationCount } = await supabase
            .from('donations')
            .select('*', { count: 'exact', head: true })
            .eq('startup_id', startup.id)

          const { data: donations } = await supabase
            .from('donations')
            .select('amount')
            .eq('startup_id', startup.id)

          const totalDonations = donations?.reduce((sum, donation) => sum + parseFloat(donation.amount.toString()), 0) || 0

          return {
            ...startup,
            donation_count: donationCount || 0,
            total_donations: totalDonations
          }
        })
      )

      setStartups(startupsWithStats)
    } catch (error) {
      setError('Failed to load startups')
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
            <p className="mt-2 text-gray-600">Loading startups...</p>
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
            <Button onClick={fetchStartups} className="mt-2">
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
          <h2 className="text-2xl font-bold text-gray-900">Your Startups</h2>
          <p className="text-gray-600">
            {startups.length} startup{startups.length !== 1 ? 's' : ''} • Total raised: $
            {startups.reduce((sum, startup) => sum + startup.total_donations, 0).toFixed(2)}
          </p>
        </div>
        <Button onClick={fetchStartups} variant="outline">
          Refresh
        </Button>
      </div>

      {startups.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Startups Yet
            </h3>
            <p className="text-gray-600 mb-4">
              Launch your first startup to get funding and support from the community.
            </p>
            <Link href="/startup/create">
              <Button>Launch Your First Startup</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {startups.map((startup) => (
            <StartupCard key={startup.id} startup={startup} />
          ))}
        </div>
      )}
    </div>
  )
}