'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

interface Startup {
  id: string
  name: string
  description: string | null
  pitch: string
  website_url: string | null
  bank_name: string | null
  bank_account: string | null
  bank_account_name: string | null
}

interface StartupEditFormProps {
  startup: Startup
}

export function StartupEditForm({ startup }: StartupEditFormProps) {
  const [formData, setFormData] = useState({
    name: startup.name,
    description: startup.description || '',
    pitch: startup.pitch,
    website_url: startup.website_url || '',
    bank_name: startup.bank_name || '',
    bank_account: startup.bank_account || '',
    bank_account_name: startup.bank_account_name || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('startups')
        .update({
          name: formData.name,
          description: formData.description,
          pitch: formData.pitch,
          website_url: formData.website_url,
          bank_name: formData.bank_name,
          bank_account: formData.bank_account,
          bank_account_name: formData.bank_account_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', startup.id)

      if (error) throw error

      setMessage('Startup updated successfully!')
      setTimeout(() => {
        router.push(`/startup/${startup.id}`)
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Startup</CardTitle>
        <CardDescription>
          Update your startup information and pitch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Startup Name *
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Short Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <Input
                  id="website_url"
                  name="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Right Column - Bank Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Bank Name
                  </label>
                  <Input
                    id="bank_name"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Number
                  </label>
                  <Input
                    id="bank_account"
                    name="bank_account"
                    value={formData.bank_account}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <Input
                    id="bank_account_name"
                    name="bank_account_name"
                    value={formData.bank_account_name}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pitch */}
          <div>
            <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 mb-1">
              Full Pitch *
            </label>
            <textarea
              id="pitch"
              name="pitch"
              value={formData.pitch}
              onChange={handleChange}
              required
              className="flex min-h-[200px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              rows={8}
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Updating...' : 'Update Startup'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push(`/startup/${startup.id}`)}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}