import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AIAssistant } from '@/components/ai/ai-assistant'
import { DeleteStartupButton } from '@/components/startup/delete-startup-button'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function StartupPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get startup details
  const { data: startup } = await supabase
    .from('startups')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!startup) {
    return notFound()
  }

  // Get donation stats
  const { data: donations } = await supabase
    .from('donations')
    .select('amount')
    .eq('startup_id', id)
    .eq('status', 'completed')

  const totalRaised = donations?.reduce((sum, donation) => sum + parseFloat(donation.amount.toString()), 0) || 0

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
              <span className="text-4xl">🚀</span>
              {startup.name}
            </h1>
            {user && user.id === startup.user_id && (
              <div className="flex gap-2">
                <Link href={`/startup/${id}/edit`}>
                  <Button variant="outline">Edit Startup</Button>
                </Link>
                <DeleteStartupButton 
                  startupId={id} 
                  startupName={startup.name} 
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6 text-gray-600">
            <Badge variant={startup.verification_tier === 'verified' ? 'success' : 'secondary'}>
              {startup.verification_tier === 'verified' ? '✅ Verified' : '🔄 Registered'}
            </Badge>
            <span>Total Raised: <strong>${totalRaised.toFixed(2)}</strong></span>
            <span>{startup.subscriber_count || 0} subscribers</span>
            <span>Created {new Date(startup.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Startup</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {startup.description || 'No description provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Full Pitch */}
            <Card>
              <CardHeader>
                <CardTitle>The Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {startup.pitch || 'No pitch provided.'}
                </p>
              </CardContent>
            </Card>

            {/* Startup AI Assistant */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>🤖</span>
                  Startup AI Advisor
                  <Badge variant="outline" className="text-xs">Beta</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIAssistant />
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium">Startup-specific AI features:</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>Get your startup rated by AI based on pitch and description</li>
                    <li>Receive personalized growth strategies</li>
                    <li>Analyze market risks and opportunities</li>
                    <li>Generate investor pitch decks and presentations</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Startup Tools</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                  <div className="font-medium flex items-center gap-2">
                    <span>💰</span>
                    Set Funding Goal
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Define your fundraising target
                  </div>
                </button>
                
                <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                  <div className="font-medium flex items-center gap-2">
                    <span>📈</span>
                    View Analytics
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Track donations and engagement
                  </div>
                </button>
                
                <button className="w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                  <div className="font-medium flex items-center gap-2">
                    <span>📢</span>
                    Share Pitch
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Get your startup in front of investors
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Startup Info */}
            <Card>
              <CardHeader>
                <CardTitle>Startup Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Verification Tier:</span>
                  <Badge variant={startup.verification_tier === 'verified' ? 'success' : 'secondary'}>
                    {startup.verification_tier}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Raised:</span>
                  <span className="text-gray-900 font-medium">
                    ${totalRaised.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscribers:</span>
                  <span className="text-gray-900">
                    {startup.subscriber_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={startup.is_active ? 'success' : 'secondary'}>
                    {startup.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires:</span>
                  <span className="text-gray-900">
                    {new Date(startup.expires_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Website Link */}
            {startup.website_url && (
              <Card>
                <CardContent className="p-6">
                  <a 
                    href={startup.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <span>🌐</span>
                    Visit Website
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}