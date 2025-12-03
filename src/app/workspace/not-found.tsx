import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WorkspaceNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">💼</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Workspace Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The workspace you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to access it.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button className="w-full">
              Back to dashboard
            </Button>
          </Link>
          <Link href="/workspace/create">
            <Button variant="outline" className="w-full">
              Create workspace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}