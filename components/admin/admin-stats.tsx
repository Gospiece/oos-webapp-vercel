'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface PlatformStats {
  totalUsers: number
  totalStartups: number
  totalWorkspaces: number
  totalDonations: number
  pendingVerifications: number
  pendingBankVerifications: number
}

export function AdminStats() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalStartups: 0,
    totalWorkspaces: 0,
    totalDonations: 0,
    pendingVerifications: 0,
    pendingBankVerifications: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get total startups
      const { count: startupCount } = await supabase
        .from('startups')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Get total workspaces
      const { count: workspaceCount } = await supabase
        .from('workspaces')
        .select('*', { count: 'exact', head: true })

      // Get total donations
      const { count: donationCount } = await supabase
        .from('donations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')

      // Get pending verifications
      const { count: pendingVerificationCount } = await supabase
        .from('startup_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get pending bank verifications
      const { count: pendingBankVerificationCount } = await supabase
        .from('bank_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        totalUsers: userCount || 0,
        totalStartups: startupCount || 0,
        totalWorkspaces: workspaceCount || 0,
        totalDonations: donationCount || 0,
        pendingVerifications: pendingVerificationCount || 0,
        pendingBankVerifications: pendingBankVerificationCount || 0
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading stats...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{stats.totalUsers}</CardTitle>
          <CardDescription>Total Users</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{stats.totalStartups}</CardTitle>
          <CardDescription>Active Startups</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{stats.totalWorkspaces}</CardTitle>
          <CardDescription>Workspaces</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl">{stats.totalDonations}</CardTitle>
          <CardDescription>Donations</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-orange-600">{stats.pendingVerifications}</CardTitle>
          <CardDescription>Pending Verifications</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl text-orange-600">{stats.pendingBankVerifications}</CardTitle>
          <CardDescription>Pending Bank Verifications</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}