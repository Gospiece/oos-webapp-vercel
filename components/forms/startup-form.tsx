'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export function StartupForm() {
 const [formData, setFormData] = useState({
  name: '',
  description: '',
  pitch: '',
  website_url: '',
  bank_account: '',
  bank_name: '',
  bank_account_name: ''
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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to create a startup')
        return
      }

      // Create startup (auto-deletes after 2 years)
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 2)

      const { data, error } = await supabase
        .from('startups')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            pitch: formData.pitch,
            website_url: formData.website_url,
            bank_account: formData.bank_account,
            user_id: user.id,
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        setError(error.message)
        return
      }

      setMessage('Startup created successfully! Redirecting...')
      
      setTimeout(() => {
        router.push(`/startup/${data.id}`)
        router.refresh()
      }, 1500)
    } catch (error) {
      setError('An unexpected error occurred')
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
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0">
      <CardHeader className="text-center pb-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
          <span className="text-3xl">🚀</span>
        </div>
        <CardTitle className="text-3xl font-bold text-gray-900">
          Launch Your Startup
        </CardTitle>
        <CardDescription className="text-lg text-gray-600">
          Share your vision with the world and get the support you need to grow
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Startup Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your startup name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-green-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Choose a memorable name that represents your brand
                    </p>
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Describe your startup in one compelling sentence..."
                      value={formData.description}
                      onChange={handleChange}
                      required
                      className="flex min-h-[100px] w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be displayed on your startup card
                    </p>
                  </div>

                  <div>
                    <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Website URL
                    </label>
                    <Input
                      id="website_url"
                      name="website_url"
                      type="url"
                      placeholder="https://yourstartup.com"
                      value={formData.website_url}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 focus:border-green-500 transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Optional: Share your website with potential supporters
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Payment Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name *
                    </label>
                    <Input
                      id="bank_name"
                      name="bank_name"
                      placeholder="e.g., First Bank, GTBank, Zenith Bank"
                      value={formData.bank_name}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-green-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number *
                    </label>
                    <Input
                      id="bank_account"
                      name="bank_account"
                      placeholder="Enter your bank account number"
                      value={formData.bank_account}
                      onChange={handleChange}
                      required
                      className="w-full border-2 border-gray-200 focus:border-green-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="bank_account_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <Input
                    id="bank_account_name"
                    name="bank_account_name"
                    placeholder="Enter account name as it appears in bank"
                    value={formData.bank_account_name}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 focus:border-green-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must match exactly with your bank records
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Pitch */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Your Startup Pitch
                </h3>
                
                <div>
                  <label htmlFor="pitch" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Pitch *
                  </label>
                  <textarea
                    id="pitch"
                    name="pitch"
                    placeholder={`Tell your story...

• What problem do you solve?
• What makes your solution unique?
• Who is your target market?
• What's your vision for the future?
• Why should people support you?`}
                    value={formData.pitch}
                    onChange={handleChange}
                    required
                    className="flex min-h-[300px] w-full rounded-md border-2 border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:border-green-500 focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 transition-colors"
                    rows={12}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This is your chance to convince supporters. Be compelling and authentic.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-lg">💡</span>
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-yellow-800 mb-3">
                  Important Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">💰 Commission:</span>
                      <span>16% on all donations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">⏰ Duration:</span>
                      <span>Auto-deletion after 2 years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">🔒 Security:</span>
                      <span>Bank account required for payouts</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">✅ Verification:</span>
                      <span>Available for trusted startups</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📧 Updates:</span>
                      <span>Newsletter subscription feature</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">💬 Community:</span>
                      <span>Comments and feedback system</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-200">
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating Startup...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>✨</span>
                  Launch Your Startup
                  <span>✨</span>
                </span>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              disabled={loading}
              className="px-8 border-2 rounded-xl"
            >
              Cancel
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="text-center">
            <div className="inline-flex items-center gap-6 bg-white border border-gray-200 rounded-2xl px-6 py-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-xs text-gray-600">Years Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">16%</div>
                <div className="text-xs text-gray-600">Platform Fee</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">∞</div>
                <div className="text-xs text-gray-600">Potential</div>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}