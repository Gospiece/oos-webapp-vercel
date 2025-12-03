import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteContext {
  params: {
    id: string
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentUrl } = await request.json()

    if (!documentUrl) {
      return NextResponse.json({ error: 'Document URL is required' }, { status: 400 })
    }

    // Verify user owns the startup and get bank details
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (startupError || !startup) {
      return NextResponse.json({ error: 'Startup not found or access denied' }, { status: 404 })
    }

    if (!startup.bank_account || !startup.bank_name || !startup.bank_account_name) {
      return NextResponse.json({ error: 'Bank details are required for verification' }, { status: 400 })
    }

    // Create bank verification record
    const { data: verification, error } = await supabase
      .from('bank_verifications')
      .insert([
        {
          startup_id: params.id,
          bank_name: startup.bank_name,
          account_number: startup.bank_account,
          account_name: startup.bank_account_name,
          verification_document_url: documentUrl,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Bank verification submitted for review',
      verification 
    })
  } catch (error) {
    console.error('Bank verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { verificationId, status } = await request.json()

    // Check if user is admin
    const { data: adminBadge } = await supabase
      .from('admin_badges')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminBadge) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Update verification status
    const { data: verification, error } = await supabase
      .from('bank_verifications')
      .update({ 
        status,
        verified_by: user.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', verificationId)
      .select(`
        *,
        startups (
          id,
          name,
          user_id
        )
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Update startup bank verification status
    if (status === 'verified') {
      await supabase
        .from('startups')
        .update({ 
          bank_account_verified: true
        })
        .eq('id', params.id)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bank verification ${status}`,
      verification 
    })
  } catch (error) {
    console.error('Bank verification update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}