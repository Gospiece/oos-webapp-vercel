import { StartupForm } from '@/components/forms/startup-form'

export default function CreateStartupPage() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Launch Your Vision
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Turn your innovative idea into reality. Create your startup profile, share your story, 
            and connect with supporters who believe in your vision.
          </p>
        </div>
        <StartupForm />
        
        {/* Success Stories */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Startups Changing the World</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl mb-4">🌱</div>
              <h3 className="font-semibold text-gray-900 mb-2">EcoTech Solutions</h3>
              <p className="text-sm text-gray-600">Raised $50,000 for sustainable technology</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl mb-4">🏥</div>
              <h3 className="font-semibold text-gray-900 mb-2">HealthInnovate</h3>
              <p className="text-sm text-gray-600">$75,000 for medical device development</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="font-semibold text-gray-900 mb-2">EduFuture</h3>
              <p className="text-sm text-gray-600">$30,000 for educational platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}