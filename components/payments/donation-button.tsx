'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

// Define proper TypeScript interfaces
interface PaystackWindow extends Window {
  PaystackPop?: {
    setup: (options: PaystackOptions) => { openIframe: () => void }
  }
}

interface PaystackOptions {
  key: string
  email: string
  amount: number
  currency: string
  ref: string
  metadata: {
    startup_id: string
    startup_name: string
    donor_name: string
    custom_fields: Array<{
      display_name: string
      variable_name: string
      value: string
    }>
  }
  callback: (response: PaystackResponse) => void
  onClose: () => void
}

interface PaystackResponse {
  reference: string
  status: string
  message?: string
  transaction?: string
}

interface DonationButtonProps {
  startupId: string
  startupName: string
}

export function DonationButton({ startupId, startupName }: DonationButtonProps) {
  const [showDonation, setShowDonation] = useState(false)
  const [amount, setAmount] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [donorName, setDonorName] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const initializePaystackPayment = () => {
    if (!amount || !donorEmail || !donorName) {
      alert('Please fill in all fields')
      return
    }

    if (parseFloat(amount) < 1) {
      alert('Minimum donation amount is $1')
      return
    }

    // Use the typed window interface
    const paystackPop = (window as PaystackWindow).PaystackPop
    
    if (!paystackPop) {
      alert('Payment system not loaded. Please refresh the page.')
      return
    }

    const handler = paystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      email: donorEmail,
      amount: parseFloat(amount) * 100, // Convert to kobo
      currency: 'USD',
      ref: `DON_${startupId}_${Date.now()}`,
      metadata: {
        startup_id: startupId,
        startup_name: startupName,
        donor_name: donorName,
        custom_fields: [
          {
            display_name: "Startup Name",
            variable_name: "startup_name", 
            value: startupName
          }
        ]
      },
      callback: async (response: PaystackResponse) => {
        try {
          setLoading(true)
          
          // Record donation in database
          const netAmount = parseFloat(amount) * 0.84 // After 16% commission
          
          const { error } = await supabase
            .from('donations')
            .insert([
              {
                startup_id: startupId,
                donor_email: donorEmail,
                amount: parseFloat(amount),
                fee_percentage: 16.00,
                net_amount: netAmount,
                status: 'completed',
                payment_provider: 'paystack',
                payment_reference: response.reference
              }
            ])

          if (error) throw error

          alert(`Thank you for your donation of $${amount} to ${startupName}!`)
          setShowDonation(false)
          setAmount('')
          setDonorEmail('')
          setDonorName('')
          
          // Refresh the page to show updated donation stats
          window.location.reload()
        } catch (error) {
          console.error('Error recording donation:', error)
          alert('Donation processed but there was an error recording it. Please contact support.')
        } finally {
          setLoading(false)
        }
      },
      onClose: () => {
        console.log('Payment window closed')
      }
    })

    handler.openIframe()
  }

  const commission = amount ? (parseFloat(amount) * 0.16) : 0
  const netAmount = amount ? (parseFloat(amount) - commission) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>💝</span>
          Support This Startup
        </CardTitle>
        <CardDescription>
          Secure donation processing via Paystack
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showDonation ? (
          <Button 
            onClick={() => setShowDonation(true)}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Make a Donation
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Your Name *</label>
                <Input
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Email *</label>
                <Input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Donation Amount ($) *</label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                />
              </div>
            </div>
            
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Donation Amount:</span>
                  <span>${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Platform fee (16%):</span>
                  <span>${commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium border-t border-yellow-300 mt-2 pt-2">
                  <span>Startup receives:</span>
                  <span>${netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={initializePaystackPayment}
                disabled={loading || !amount || !donorEmail || !donorName || parseFloat(amount) < 1}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Processing...' : `Donate $${amount || '0'}`}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowDonation(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Secure Payment:</strong> Powered by Paystack. Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}