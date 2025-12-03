import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">OOS</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            OOS WebApp
          </h1>
          <p className="mt-2 text-gray-600">
            Online Office Space - Bringing your office to your screen
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}