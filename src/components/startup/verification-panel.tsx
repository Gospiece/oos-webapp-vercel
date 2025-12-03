'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface VerificationPanelProps {
  startupId: string
  currentTier: 'registered' | 'verified'
}

interface VerificationDocument {
  id: string
  document_type: string
  document_url: string
  status: 'pending' | 'approved' | 'rejected'
  verified_at: string | null
}

export function VerificationPanel({ startupId, currentTier }: VerificationPanelProps) {
  const [documents, setDocuments] = useState<VerificationDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState('cac_certificate')
  const supabase = createClient()

  useEffect(() => {
    loadDocuments()
  }, [startupId])

  const loadDocuments = async () => {
    const { data } = await supabase
      .from('startup_documents')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })

    setDocuments(data || [])
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type and size
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Only images and PDF files are allowed')
      return
    }

    setSelectedFile(file)
  }

  const uploadDocument = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${startupId}/${documentType}_${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('startup-documents')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('startup-documents')
        .getPublicUrl(fileName)

      // Submit for verification
      const response = await fetch('/api/startup/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startupId,
          documentType,
          documentUrl: publicUrl
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error)
      }

      alert('Document submitted for verification!')
      setSelectedFile(null)
      loadDocuments() // Refresh documents list
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'destructive'
      default: return 'secondary'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Verification Status</span>
          <Badge variant={currentTier === 'verified' ? 'success' : 'secondary'}>
            {currentTier === 'verified' ? '✅ Verified' : '📝 Registered'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Get verified to build trust with donors and investors
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Verification Requirements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Business Registration (CAC)</h4>
              <p className="text-sm text-gray-600">Upload your CAC certificate</p>
            </div>
            <Badge variant={documents.some(d => d.document_type === 'cac_certificate' && d.status === 'approved') ? 'success' : 'secondary'}>
              {documents.some(d => d.document_type === 'cac_certificate' && d.status === 'approved') ? 'Verified' : 'Required'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Bank Account Verification</h4>
              <p className="text-sm text-gray-600">For secure donation payouts</p>
            </div>
            <Badge variant="secondary">Optional</Badge>
          </div>
        </div>

        {/* Document Upload */}
        <div className="space-y-4">
          <h4 className="font-medium">Upload Verification Document</h4>
          
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="cac_certificate">CAC Certificate</option>
            <option value="bank_statement">Bank Statement</option>
            <option value="utility_bill">Utility Bill</option>
            <option value="government_id">Government ID</option>
          </select>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept="image/*,.pdf"
              className="hidden"
              id="document-upload"
            />
            <label htmlFor="document-upload" className="cursor-pointer">
              {selectedFile ? (
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium">Click to upload document</p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 5MB
                  </p>
                </div>
              )}
            </label>
          </div>

          <Button
            onClick={uploadDocument}
            disabled={!selectedFile || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Submit for Verification'}
          </Button>
        </div>

        {/* Document History */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Document History</h4>
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="text-sm font-medium capitalize">
                    {doc.document_type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    Submitted {new Date(doc.verified_at || doc.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={getStatusColor(doc.status)}>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {/* Benefits of Verification */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Benefits of Being Verified</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>✅ Increased trust from donors and investors</li>
            <li>✅ Higher visibility in startup listings</li>
            <li>✅ Priority support from platform</li>
            <li>✅ Verified badge on your profile</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}