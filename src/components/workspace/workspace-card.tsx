import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Workspace {
  id: string
  name: string
  description: string | null
  verification_status: 'unverified' | 'verified'
  created_at: string
  member_count?: number
}

interface WorkspaceCardProps {
  workspace: Workspace
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  return (
    <Link href={`/workspace/${workspace.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary-200">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              {workspace.name}
            </CardTitle>
            <Badge 
              variant={workspace.verification_status === 'verified' ? 'success' : 'secondary'}
            >
              {workspace.verification_status === 'verified' ? '✅ Verified' : '🔄 Unverified'}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {workspace.description || 'No description provided'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>Created: {new Date(workspace.created_at).toLocaleDateString()}</span>
            {workspace.member_count !== undefined && (
              <span>{workspace.member_count} members</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}