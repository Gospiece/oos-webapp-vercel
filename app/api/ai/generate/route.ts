import { NextRequest, NextResponse } from 'next/server'
import { generateAIContent } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { prompt, type, workspaceId, startupId } = await request.json()

    if (!prompt || !type) {
      return NextResponse.json({ error: 'Prompt and type are required' }, { status: 400 })
    }

    const content = await generateAIContent(prompt, type)

    // Save to database
    const { data, error } = await supabase
      .from('ai_generated_content')
      .insert([
        {
          workspace_id: workspaceId,
          startup_id: startupId,
          content_type: type,
          content: content,
        metadata: { 
  prompt, 
  user_id: user.id, 
  provider: 'openai',
  model: 'gpt-3.5-turbo'
}
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      content, 
      record: data 
    })
  } catch (error: unknown) {
    console.error('AI Generation Error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ 
      error: message || 'Internal server error' 
    }, { status: 500 })
  }
}