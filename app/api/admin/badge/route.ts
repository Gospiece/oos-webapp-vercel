import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user already has an admin badge
    const { data: existingBadge, error: checkError } = await supabase
      .from('admin_badges')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking admin badge:', checkError)
      return NextResponse.json({ error: 'Failed to check admin badge status' }, { status: 400 })
    }

    if (existingBadge) {
      return NextResponse.json({ 
        error: 'User already has an admin badge',
        badge: existingBadge 
      }, { status: 400 })
    }

    // Create a new admin badge
    const { data: badge, error: insertError } = await supabase
      .from('admin_badges')
      .insert([
        {
          user_id: user.id,
          granted_by: user.id
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Admin badge creation error:', insertError)
      
      // If it's an RLS error, provide more specific message
      if (insertError.code === '42501') {
        return NextResponse.json({ 
          error: 'Permission denied. Please contact administrator to get your admin badge.' 
        }, { status: 403 })
      }
      
      return NextResponse.json({ error: insertError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin badge granted successfully! You can now create workspaces.',
      badge 
    })
  } catch (error) {
    console.error('Admin badge API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin badge
    const { data: badge, error } = await supabase
      .from('admin_badges')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching admin badge:', error)
      return NextResponse.json({ error: 'Failed to fetch admin badge status' }, { status: 400 })
    }

    return NextResponse.json({ 
      hasAdminBadge: !!badge, 
      badge: badge || null 
    })
  } catch (error) {
    console.error('Admin badge GET API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Optional: DELETE endpoint for revoking admin badges (admin only)
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if requesting user is an admin
    const { data: requesterBadge } = await supabase
      .from('admin_badges')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!requesterBadge) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    const url = new URL(request.url)
    const userIdToRevoke = url.searchParams.get('user_id')

    if (!userIdToRevoke) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Revoke the admin badge
    const { error: deleteError } = await supabase
      .from('admin_badges')
      .delete()
      .eq('user_id', userIdToRevoke)

    if (deleteError) {
      console.error('Error revoking admin badge:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Admin badge revoked successfully' 
    })
  } catch (error) {
    console.error('Admin badge DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}