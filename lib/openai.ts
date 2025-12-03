import OpenAI from 'openai/index.js'

// Check if API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY is missing from environment variables')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateAIContent(prompt: string, type: 'meeting_minutes' | 'risk_analysis' | 'startup_rating' | 'business_insights') {
  try {
    console.log('Starting AI generation with type:', type)
    
    const systemPrompts = {
      meeting_minutes: `Create concise meeting minutes with key decisions, action items, and next steps.`,
      risk_analysis: `Analyze business risks and provide mitigation strategies.`,
      startup_rating: `Evaluate startup potential and provide investment recommendations.`,
      business_insights: `Provide data-driven business insights and strategic recommendations.`
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Start with cheaper model for testing
      messages: [
        {
          role: "system",
          content: systemPrompts[type]
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500, // Reduce for testing
      temperature: 0.7,
    })

    console.log('AI response received successfully')
    return completion.choices[0]?.message?.content || 'No response generated'

  } catch (error: unknown) {
    const isObject = typeof error === 'object' && error !== null
    const errObj = isObject ? error as Record<string, unknown> : {}
    const message =
      error instanceof Error
        ? error.message
        : typeof errObj['message'] === 'string'
        ? (errObj['message'] as string)
        : String(errObj ?? 'Unknown error')

    console.error('OpenAI API Error Details:', {
      message,
      type: typeof errObj['type'] === 'string' ? String(errObj['type']) : undefined,
      code: errObj['code'],
      status: errObj['status']
    })
    
    // More specific error messages
    const code = isObject ? (errObj['code'] as string | number | undefined) : undefined
    const status = isObject ? (errObj['status'] as number | undefined) : undefined

    if (code === 'invalid_api_key') {
      throw new Error('Invalid OpenAI API key. Please check your API key in .env.local')
    } else if (code === 'insufficient_quota') {
      throw new Error('OpenAI API quota exceeded. Please check your billing.')
    } else if (status === 429 || String(status) === '429') {
      throw new Error('Rate limit exceeded. Please wait a moment and try again.')
    } else {
      throw new Error(`OpenAI API error: ${message}`)
    }
  }
}