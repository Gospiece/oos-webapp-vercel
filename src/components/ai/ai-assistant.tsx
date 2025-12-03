'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AIAssistant() {
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'meeting_minutes' | 'risk_analysis' | 'startup_rating' | 'business_insights'>('business_insights')

  const handleAskAI = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setResponse('')

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: type
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate response')
      }

      setResponse(data.content)
    } catch (error: Error | unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      setResponse(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (quickType: typeof type, quickPrompt: string) => {
    setType(quickType)
    setPrompt(quickPrompt)
    // Auto-trigger after a brief delay
    setTimeout(() => {
      handleAskAI()
    }, 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🤖</span>
          ImpactAI
        </CardTitle>
        <CardDescription>
          Powered by OpenAI&apos;s GPT-3.5 for intelligent business insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="business_insights">Business Insights</option>
            <option value="meeting_minutes">Meeting Minutes</option>
            <option value="risk_analysis">Risk Analysis</option>
            <option value="startup_rating">Startup Rating</option>
          </select>
          
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Enter your ${type.replace('_', ' ')} request...`}
            onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
          />
          <Button 
            onClick={handleAskAI}
            disabled={loading || !prompt.trim()}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Ask AI'}
          </Button>
        </div>

        {response && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => handleQuickAction('meeting_minutes', 'Summarize our team meeting about product development and create action items')}
          >
            Generate Meeting Minutes
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => handleQuickAction('risk_analysis', 'Analyze market risks for a new SaaS product in the project management space')}
          >
            Risk Analysis
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => handleQuickAction('startup_rating', 'Evaluate a startup that provides AI-powered customer support automation')}
          >
            Startup Rating
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => handleQuickAction('business_insights', 'Provide growth strategies for a B2B software company')}
          >
            Business Insights
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

