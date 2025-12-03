import { AccessToken } from 'livekit-server-sdk'

const apiKey = process.env.LIVEKIT_API_KEY!
const apiSecret = process.env.LIVEKIT_API_SECRET!

if (!apiKey || !apiSecret) {
  throw new Error('LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set')
}

export function generateMeetingToken(roomName: string, participantName: string) {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  })
  at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true })
  return at.toJwt()
}

export function generateAdminToken() {
  const at = new AccessToken(apiKey, apiSecret, {
    identity: 'admin',
  })
  at.addGrant({ roomCreate: true, roomList: true, roomJoin: true, roomRecord: true })
  return at.toJwt()
}s