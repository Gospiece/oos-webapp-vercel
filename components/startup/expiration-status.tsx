'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ExpirationStatusProps {
  startupId: string
  expiresAt: string
  isActive: boolean
}

export function ExpirationStatus({ startupId, expiresAt, isActive }: ExpirationStatusProps) {
  const [daysRemaining, setDaysRemaining] = useState(0)
  const [isExpired, setIsExpired] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    calculateRemainingTime()
  }, [expiresAt])

  const calculateRemainingTime = () => {
    const expirationDate = new Date(expiresAt)
    const now = new Date()
    const diffTime = expirationDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    setDaysRemaining(diffDays)
    setIsExpired(diffDays <= 0)
  }

  const handleManualDeletion = async () => {
    if (!confirm('Are you sure you want to deactivate this expired startup? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/startup/${startupId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      alert('Startup has been deactivated due to expiration.')
      window.location.reload()
    } catch (error: any) {
      alert(`Failed to deactivate startup: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  if (!isActive) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-600 font-semibold mb-2">Startup Expired</div>
            <p className="text-sm text-red-600">
              This startup has been automatically deactivated after 2 years.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={isExpired ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>⏰</span>
          Auto-Expiration Status
        </CardTitle>
        <CardDescription>
          Startups automatically expire after 2 years to keep the platform fresh
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-2xl font-bold ${isExpired ? 'text-yellow-600' : 'text-blue-600'}`}>
            {isExpired ? 'Expired' : `${daysRemaining} days`}
          </div>
          <div className="text-sm text-gray-600">
            {isExpired ? 'Startup has expired' : 'remaining until auto-deletion'}
          </div>
        </div>

        {isExpired && (
          <Button
            onClick={handleManualDeletion}
            disabled={deleting}
            variant="destructive"
            className="w-full"
          >
            {deleting ? 'Deactivating...' : 'Deactivate Expired Startup'}
          </Button>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>• Startups automatically expire after 2 years</p>
          <p>• Expired startups are marked inactive</p>
          <p>• You can create a new startup profile anytime</p>
          <p>• All data is preserved for historical records</p>
        </div>
      </CardContent>
    </Card>
  )
}