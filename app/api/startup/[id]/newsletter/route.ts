import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    id: string
  }
}

// Subscribe to newsletter
export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify startup exists
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select('id, user_id')
      .eq('id', params.id)
      .single()

    if (startupError || !startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
    }

    // Check if already subscribed
    const { data: existingSubscription } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('startup_id', params.id)
      .eq('user_id', user.id)
      .single()

    if (existingSubscription) {
      return NextResponse.json({ error: 'Already subscribed' }, { status: 400 })
    }

    // Create subscription
    const { data: subscription, error } = await supabase
      .from('newsletter_subscribers')
      .insert([
        {
          startup_id: params.id,
          user_id: user.id
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update subscriber count
    await supabase
      .from('startups')
      .update({ 
        subscriber_count: (startup.subscriber_count || 0) + 1 
      })
      .eq('id', params.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Subscribed to newsletter',
      subscription 
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Unsubscribe from newsletter
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('startup_id', params.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Unsubscribed from newsletter' 
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Get subscription status
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('startup_id', params.id)
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({ 
      isSubscribed: !!subscription,
      subscription 
    })
  } catch (error) {
    console.error('Newsletter status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}