'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  content: string
  created_at: string
  users: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface CommentsSectionProps {
  startupId: string
}

export function CommentsSection({ startupId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadComments()
    subscribeToComments()
  }, [startupId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/startup/${startupId}/comments`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setComments(data.comments || [])
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToComments = () => {
    const subscription = supabase
      .channel('startup_comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'startup_comments',
          filter: `startup_id=eq.${startupId}`
        },
        () => {
          loadComments() // Reload comments when new one is added
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  const submitComment = async () => {
    if (!newComment.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/startup/${startupId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment.trim()
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setNewComment('')
    } catch (error: any) {
      alert(`Failed to post comment: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments & Feedback</CardTitle>
        <CardDescription>
          Share your thoughts and feedback about this startup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Comment */}
        <div className="space-y-4">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts about this startup..."
            onKeyPress={(e) => e.key === 'Enter' && submitComment()}
          />
          <Button
            onClick={submitComment}
            disabled={!newComment.trim() || submitting}
            className="w-full"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-gray-500">Loading comments...</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 p-4 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.users.avatar_url || ''} />
                  <AvatarFallback>
                    {getInitials(comment.users.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {comment.users.full_name || 'Anonymous User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}