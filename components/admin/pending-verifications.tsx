'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface Verification {
  id: string
  document_type: string
  status: string
  created_at: string
  startups: {
    id: string
    name: string
    user_id: string
  }
  users: {
    full_name: string
    email: string
  }
}

interface BankVerification {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  status: string
  created_at: string
  startups: {
    id: string
    name: string
    user_id: string
  }
}

export function PendingVerifications() {
  const [startupVerifications, setStartupVerifications] = useState<Verification[]>([])
  const [bankVerifications, setBankVerifications] = useState<BankVerification[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      // Load pending startup verifications
      const { data: startupData } = await supabase
        .from('startup_documents')
        .select(`
          *,
          startups (
            id,
            name,
            user_id
          ),
          users:startups!inner (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')

      // Load pending bank verifications
      const { data: bankData } = await supabase
        .from('bank_verifications')
        .select(`
          *,
          startups (
            id,
            name,
            user_id
          )
        `)
        .eq('status', 'pending')

      setStartupVerifications(startupData || [])
      setBankVerifications(bankData || [])
    } catch (error) {
      console.error('Error loading verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (type: 'startup' | 'bank', id: string, status: 'approved' | 'rejected', startupId?: string) => {
    try {
      if (type === 'startup') {
        const response = await fetch('/api/startup/verify', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId: id,
            status,
            startupId
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update verification')
        }
      } else {
        const response = await fetch(`/api/startup/${startupId}/bank-verify`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            verificationId: id,
            status
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update bank verification')
        }
      }

      await loadVerifications() // Refresh the list
    } catch (error) {
      console.error('Error updating verification:', error)
      alert('Failed to update verification')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading verifications...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Startup Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>Startup Verifications</CardTitle>
          <CardDescription>
            {startupVerifications.length} pending startup verifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {startupVerifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending verifications</p>
          ) : (
            startupVerifications.map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{verification.startups.name}</h4>
                    <p className="text-sm text-gray-600">
                      {verification.users.full_name} • {verification.users.email}
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {verification.document_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleVerification('startup', verification.id, 'approved', verification.startups.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerification('startup', verification.id, 'rejected', verification.startups.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Bank Verifications */}
      <Card>
        <CardHeader>
          <CardTitle>Bank Verifications</CardTitle>
          <CardDescription>
            {bankVerifications.length} pending bank verifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankVerifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending bank verifications</p>
          ) : (
            bankVerifications.map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{verification.startups.name}</h4>
                    <p className="text-sm text-gray-600">
                      {verification.bank_name} • {verification.account_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Account: ****{verification.account_number.slice(-4)}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(verification.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleVerification('bank', verification.id, 'approved', verification.startups.id)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleVerification('bank', verification.id, 'rejected', verification.startups.id)}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}