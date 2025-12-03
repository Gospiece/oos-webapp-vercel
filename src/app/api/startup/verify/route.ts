import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { startupId, documentType, documentUrl } = await request.json()

    if (!startupId || !documentType || !documentUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user owns the startup
    const { data: startup, error: startupError } = await supabase
      .from('startups')
      .select('*')
      .eq('id', startupId)
      .eq('user_id', user.id)
      .single()

    if (startupError || !startup) {
      return NextResponse.json({ error: 'Startup not found or access denied' }, { status: 404 })
    }

    // Create verification document record
    const { data: verificationDoc, error: docError } = await supabase
      .from('startup_documents')
      .insert([
        {
          startup_id: startupId,
          document_type: documentType,
          document_url: documentUrl,
          status: 'pending'
        }
      ])
      .select()
      .single()

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 400 })
    }

    // If CAC document is uploaded, mark for verification review
    if (documentType === 'cac_certificate') {
      await supabase
        .from('startups')
        .update({ verification_tier: 'pending_verification' })
        .eq('id', startupId)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Verification document submitted for review',
      document: verificationDoc 
    })
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { documentId, status, startupId } = await request.json()

    // Check if user is admin
    const { data: adminBadge } = await supabase
      .from('admin_badges')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!adminBadge) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Update document status
    const { data: updatedDoc, error: updateError } = await supabase
      .from('startup_documents')
      .update({ 
        status,
        verified_by: user.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', documentId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    // If CAC is approved, upgrade startup to verified tier
    if (status === 'approved' && updatedDoc.document_type === 'cac_certificate') {
      await supabase
        .from('startups')
        .update({ 
          verification_tier: 'verified',
          kyc_status: 'verified'
        })
        .eq('id', startupId)
    }

    return NextResponse.json({ 
      success: true, 
      message: `Document ${status}`,
      document: updatedDoc 
    })
  } catch (error) {
    console.error('Verification update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}