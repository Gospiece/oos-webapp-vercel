'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface BankVerificationProps {
  startupId: string
  bankDetails: {
    bank_name: string | null
    bank_account: string | null
    bank_account_name: string | null
    bank_account_verified: boolean
  }
}

interface BankVerification {
  id: string
  bank_name: string
  account_number: string
  account_name: string
  status: 'pending' | 'verified' | 'rejected'
  verification_document_url: string
  verified_at: string | null
  created_at: string
}

export function BankVerification({ startupId, bankDetails }: BankVerificationProps) {
  const [verifications, setVerifications] = useState<BankVerification[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadVerifications()
  }, [startupId])

  const loadVerifications = async () => {
    const { data } = await supabase
      .from('bank_verifications')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })

    setVerifications(data || [])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type and size
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Only images and PDF files are allowed')
      return
    }

    setSelectedFile(file)
  }

  const submitVerification = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload document to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${startupId}/bank_verification_${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('startup-documents')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('startup-documents')
        .getPublicUrl(fileName)

      // Submit for verification
      const response = await fetch(`/api/startup/${startupId}/bank-verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentUrl: publicUrl
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      alert('Bank verification submitted!')
      setSelectedFile(null)
      loadVerifications()
    } catch (error: any) {
      alert(`Verification failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'success'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  const maskAccountNumber = (accountNumber: string | null) => {
    if (!accountNumber) return 'Not provided'
    return `****${accountNumber.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bank Account Verification</span>
          <Badge variant={bankDetails.bank_account_verified ? 'success' : 'secondary'}>
            {bankDetails.bank_account_verified ? '✅ Verified' : '❌ Unverified'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Verify your bank account to receive donations securely
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bank Details Display */}
        <div className="space-y-4">
          <h4 className="font-medium">Bank Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
            <div>
              <label className="text-sm font-medium text-gray-600">Bank Name</label>
              <p className="text-sm">{bankDetails.bank_name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Account Number</label>
              <p className="text-sm">{maskAccountNumber(bankDetails.bank_account)}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Account Name</label>
              <p className="text-sm">{bankDetails.bank_account_name || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Verification Upload */}
        {!bankDetails.bank_account_verified && (
          <div className="space-y-4">
            <h4 className="font-medium">Verify Your Bank Account</h4>
            <p className="text-sm text-gray-600">
              Upload a bank statement or document showing your account name and number matching the details above.
            </p>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={handleFileUpload}
                accept="image/*,.pdf"
                className="hidden"
                id="bank-verification-upload"
              />
              <label htmlFor="bank-verification-upload" className="cursor-pointer">
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Click to upload bank statement</p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 5MB
                    </p>
                  </div>
                )}
              </label>
            </div>

            <Button
              onClick={submitVerification}
              disabled={!selectedFile || uploading}
              className="w-full"
            >
              {uploading ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          </div>
        )}

        {/* Verification History */}
        {verifications.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Verification History</h4>
            {verifications.map((verification) => (
              <div key={verification.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium">
                    Bank: {verification.bank_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Account: {maskAccountNumber(verification.account_number)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted {new Date(verification.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getStatusColor(verification.status)}>
                  {verification.status.charAt(0).toUpperCase() + verification.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Benefits */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">Why Verify Your Bank Account?</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>✅ Secure and fast donation payouts</li>
            <li>✅ Builds trust with donors</li>
            <li>✅ Required for large donation amounts</li>
            <li>✅ Prevents payment errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}