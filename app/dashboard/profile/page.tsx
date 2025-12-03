import { ProfileForm } from '@/components/forms/profile-form'

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and account preferences
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  )
}