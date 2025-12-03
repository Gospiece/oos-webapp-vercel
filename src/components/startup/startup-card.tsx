import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Startup {
  id: string
  name: string
  description: string | null
  verification_tier: 'registered' | 'verified'
  created_at: string
  pitch: string
  donation_count?: number
  total_donations?: number
}

interface StartupCardProps {
  startup: Startup
}

export function StartupCard({ startup }: StartupCardProps) {
  return (
    <Link href={`/startup/${startup.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-green-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">🚀</span>
              {startup.name}
            </CardTitle>
            <Badge 
              variant={startup.verification_tier === 'verified' ? 'success' : 'secondary'}
            >
              {startup.verification_tier === 'verified' ? '✅ Verified' : '📝 Registered'}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {startup.description || 'No description provided'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {startup.pitch.substring(0, 150)}...
          </p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Created: {new Date(startup.created_at).toLocaleDateString()}</span>
            {startup.donation_count !== undefined && (
              <span>{startup.donation_count} donations</span>
            )}
          </div>
          {startup.total_donations !== undefined && startup.total_donations > 0 && (
            <div className="mt-2 bg-green-50 border border-green-200 rounded-md p-2">
              <p className="text-sm text-green-700 font-medium">
                ${startup.total_donations} raised
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}