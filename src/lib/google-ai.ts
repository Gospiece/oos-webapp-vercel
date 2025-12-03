import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!)

export async function generateAIContent(prompt: string, type: 'meeting_minutes' | 'risk_analysis' | 'startup_rating' | 'business_insights') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const systemPrompts = {
      meeting_minutes: `You are an expert at summarizing meetings. Create concise meeting minutes with key decisions, action items, and next steps from the following transcript: ${prompt}`,
      risk_analysis: `Analyze business risks and provide a structured risk assessment with mitigation strategies for: ${prompt}`,
      startup_rating: `Evaluate this startup pitch and provide a comprehensive rating (1-10) with feedback on market potential, team, innovation, and scalability: ${prompt}`,
      business_insights: `Provide data-driven business insights and strategic recommendations for: ${prompt}`
    }

    const result = await model.generateContent(systemPrompts[type])
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Google AI Error:', error)
    throw new Error('Failed to generate AI content')
  }
}