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

    // Verify user owns this startup
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select('*')
      .eq('id', params.id)
      .single()

    if (startupError || !startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
    }

    if (startup.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Soft delete by marking as inactive
    const { error: updateError } = await supabase
      .from('startups')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Startup deleted successfully' 
    })
  } catch (error) {
    console.error('Startup deletion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}