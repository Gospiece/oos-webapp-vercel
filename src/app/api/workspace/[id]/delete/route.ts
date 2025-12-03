import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    id: string
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is admin of this workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', params.id)
      .single()

    if (workspaceError || !workspace) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const { data: membership } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', params.id)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Delete workspace (this will cascade to related tables due to foreign keys)
    const { error: deleteError } = await supabase
      .from('workspaces')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Workspace deleted successfully' 
    })
  } catch (error) {
    console.error('Workspace deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}