'use client'

import { useState, useEffect } from 'react'
import { 
  LiveKitRoom, 
  VideoConference, 
  useToken,
  RoomAudioRenderer,
  ControlBar,
  GridLayout,
  ParticipantTile,
  useTracks
} from '../../../node_modules/@livekit/components-react/dist'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Track } from 'livekit-client'

interface VideoRoomProps {
  workspaceId: string
  workspaceName: string
}

export function VideoRoom({ workspaceId, workspaceName }: VideoRoomProps) {
  const [token, setToken] = useState<string>('')
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(false)

  const roomName = `workspace-${workspaceId}`

  const connectToRoom = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/video/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomName }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get token')
      }

      setToken(data.token)
      setIsConnected(true)
    } catch (error) {
      console.error('Failed to connect to room:', error)
      alert('Failed to start video call. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const disconnectFromRoom = () => {
    setIsConnected(false)
    setToken('')
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🎥</span>
            Video Meeting - {workspaceName}
          </CardTitle>
          <CardDescription>
            Start a real-time video call with your team using LiveKit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 bg-blue-100 rounded-lg mx-auto flex items-center justify-center">
              <span className="text-4xl">📹</span>
            </div>
            <p className="text-gray-600">
              Ready to start a video meeting with your team?
            </p>
            <Button 
              onClick={connectToRoom}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Connecting...' : 'Start Meeting'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🎥</span>
          Live Meeting - {workspaceName}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[500px]">
          <LiveKitRoom
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            onConnected={() => console.log('Connected to room')}
            onDisconnected={disconnectFromRoom}
            audio={true}
            video={true}
          >
            <VideoConference />
            <RoomAudioRenderer />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <Button 
                variant="destructive"
                onClick={disconnectFromRoom}
                size="sm"
              >
                Leave Call
              </Button>
            </div>
          </LiveKitRoom>
        </div>
      </CardContent>
    </Card>
  )
}