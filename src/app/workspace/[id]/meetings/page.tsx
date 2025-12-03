import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function WorkspaceMeetingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Meetings</CardTitle>
          <CardDescription>
            Schedule and manage video conferences with your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Video Meetings
            </h3>
            <p className="text-gray-600">
              This feature is coming soon! You&apos;ll be able to start, schedule, and join video meetings with your team here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}