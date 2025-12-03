import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, type } = body

    if (!prompt || !type) {
      return NextResponse.json(
        { error: 'Prompt and type are required' },
        { status: 400 }
      )
    }

    // For now, return a mock response since we don't have OpenAI API key configured
    const mockResponses = {
      meeting_minutes: `Meeting Minutes Generated:
      
      **Date:** ${new Date().toLocaleDateString()}
      **Topic:** ${prompt}
      
      **Key Points:**
      1. Team discussed product roadmap for Q1
      2. Marketing strategy needs refinement
      3. Technical debt needs addressing
      
      **Action Items:**
      • John to finalize product specs by Friday
      • Sarah to prepare marketing presentation
      • Mike to create technical debt report
      
      **Next Meeting:** Next Tuesday at 10 AM`,
      
      risk_analysis: `Risk Analysis Report:
      
      **Topic:** ${prompt}
      
      **Identified Risks:**
      1. Market Competition (High Risk)
      2. Technical Implementation (Medium Risk)
      3. Regulatory Compliance (Low Risk)
      
      **Risk Mitigation Strategies:**
      • Conduct competitive analysis weekly
      • Implement phased rollouts
      • Consult legal team for compliance`,
      
      startup_rating: `Startup Evaluation:
      
      **Startup:** ${prompt}
      
      **Overall Rating:** 7.5/10
      
      **Strengths:**
      • Innovative solution to real problem
      • Strong founding team
      • Good market timing
      
      **Areas for Improvement:**
      • Need clearer monetization strategy
      • User acquisition cost needs optimization
      • Consider strategic partnerships`,
      
      business_insights: `Business Insights:
      
      **Topic:** ${prompt}
      
      **Key Insights:**
      1. Market is growing at 15% annually
      2. Customer acquisition through content marketing shows best ROI
      3. SaaS model with tiered pricing is most effective
      
      **Recommendations:**
      • Focus on enterprise segment for higher LTV
      • Build strategic partnerships for distribution
      • Invest in customer success to reduce churn`
    }

    const response = mockResponses[type as keyof typeof mockResponses] || 
      `AI Response for "${prompt}" (Type: ${type}):
      
      This is a placeholder response. Configure OpenAI API in your environment variables to get real AI responses.
      
      Add your OPENAI_API_KEY to .env.local file and uncomment the OpenAI integration in the API route.`

    return NextResponse.json({ 
      success: true, 
      content: response,
      type,
      generated_at: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate AI response' },
      { status: 500 }
    )
  }
}