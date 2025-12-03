import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function WorkspaceMembersPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your workspace team members and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Team Management
            </h3>
            <p className="text-gray-600">
              This feature is coming soon! You&apos;ll be able to invite, manage, and organize your team members here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}