'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [validToken, setValidToken] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkToken = async () => {
      // Check for Supabase auth session from URL hash
      const hash = window.location.hash
      if (hash) {
        // Handle token from URL hash (format: #access_token=xxx&refresh_token=xxx&...)
        const accessTokenMatch = hash.match(/access_token=([^&]+)/)
        if (accessTokenMatch) {
          const accessToken = accessTokenMatch[1]
          
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: ''
            })

            if (!sessionError) {
              setValidToken(true)
              // Clear the hash from URL
              window.history.replaceState(null, '', window.location.pathname)
            }
          } catch (err) {
            console.error('Error setting session:', err)
          }
        }
      }
      
      // Also check if user already has a valid session
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setValidToken(true)
        }
      }
      
      checkSession()
    }

    checkToken()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      
      // Sign out to force re-login with new password
      await supabase.auth.signOut()
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invalid or Expired Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-md text-sm">
              <p>
                Please request a new password reset link from the login page.
              </p>
            </div>
            <Link href="/auth/forgot-password">
              <Button className="w-full">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">OOS</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Set New Password
          </h1>
          <p className="mt-2 text-gray-600">
            Create a strong new password for your account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                  <p className="font-medium">Password Updated Successfully!</p>
                  <p className="mt-1">
                    Your password has been reset. You will be redirected to the login page in a few seconds.
                  </p>
                </div>
                <Link href="/auth/login">
                  <Button className="w-full">
                    Go to Login Now
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm New Password
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !password.trim() || !confirmPassword.trim()}
                  className="w-full"
                >
                  {loading ? 'Updating...' : 'Reset Password'}
                </Button>

                <div className="text-center text-sm">
                  <Link 
                    href="/auth/login" 
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    ← Back to Login
                  </Link>
                </div>
              </form>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-3 text-sm text-gray-600">
                <p className="font-medium">Password Tips:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Use at least 6 characters</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Add numbers and symbols for extra security</li>
                  <li>Avoid common words or personal information</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}