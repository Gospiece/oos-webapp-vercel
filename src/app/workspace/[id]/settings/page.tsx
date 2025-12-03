import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function WorkspaceSettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workspace Settings</CardTitle>
          <CardDescription>
            Configure your workspace preferences and security settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Workspace Settings
            </h3>
            <p className="text-gray-600">
              This feature is coming soon! You&apos;ll be able to customize your workspace settings and preferences here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}