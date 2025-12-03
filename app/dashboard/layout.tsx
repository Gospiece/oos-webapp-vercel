'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth-store'

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: '📊' },
  { name: 'Workspaces', href: '/dashboard/workspaces', icon: '💼' },
  { name: 'Startups', href: '/dashboard/startups', icon: '🚀' },
  { name: 'Admin Badge', href: '/admin/badge', icon: '🛡️' },
  { name: 'Profile', href: '/dashboard/profile', icon: '👤' },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, setUser, setLoading } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    const getUserAndProfile = async () => {
      try {
        // Get user from Supabase
        const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error getting user:', userError)
          return
        }

        setUser(supabaseUser)

        // Fetch profile data if user exists
        if (supabaseUser?.id) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single()

          // Apply the improved error handling pattern
          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows
            console.error('Error fetching profile:', profileError)
          } else {
            setProfile(profileData || null)
          }
        }
      } catch (error) {
        console.error('Error in getUserAndProfile:', error)
      } finally {
        setLoading(false)
      }
    }

    getUserAndProfile()

    // Auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)

        // Fetch profile data when auth state changes
        if (currentUser?.id) {
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single()

            // Apply the same improved error handling pattern
            if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = no rows
              console.error('Error fetching profile on auth change:', profileError)
            } else {
              setProfile(profileData || null)
            }
          } catch (error) {
            console.error('Error fetching profile on auth change:', error)
          }
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [setUser, setLoading, supabase])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  // Get user display information with live data preference
  const getUserDisplayInfo = () => {
    // Prefer live profile data, fallback to auth store user, then mock data
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'
    const email = user?.email || 'user@example.com'
    const initials = profile?.full_name?.[0]?.toUpperCase() || 
                    user?.email?.[0]?.toUpperCase() || 
                    'U'

    return { displayName, email, initials }
  }

  const { displayName, email, initials } = getUserDisplayInfo()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 flex z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 flex flex-col z-50 
        w-64 bg-white border-r border-gray-200 
        transform transition duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OOS</span>
            </div>
            <span className="text-xl font-bold">OOS WebApp</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User menu with live data */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {initials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <span className="text-lg">☰</span>
              </Button>
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                Create Workspace
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}