import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Check workspaces table
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')

    // Check workspace_members table
    const { data: workspaceMembers, error: membersError } = await supabase
      .from('workspace_members')
      .select('*')

    // Check admin badges
    const { data: adminBadges, error: badgesError } = await supabase
      .from('admin_badges')
      .select('*')

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      workspaces: {
        data: workspaces,
        error: workspacesError?.message
      },
      workspaceMembers: {
        data: workspaceMembers,
        error: membersError?.message
      },
      adminBadges: {
        data: adminBadges,
        error: badgesError?.message
      }
    })

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}