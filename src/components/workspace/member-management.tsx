'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface WorkspaceMember {
  id: string
  user_id: string
  role: string
  badge: string
  users: {
    email: string
    full_name: string
  }
}

export default function MemberManagement({ workspaceId }: { workspaceId: string }) {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    const fetchMembers = async () => {
      const { data } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          badge,
          users (
            email,
            full_name
          )
        `)
        .eq('workspace_id', workspaceId)

      // Transform the data to match our interface
      const transformedMembers = (data || []).map(member => ({
        ...member,
        users: Array.isArray(member.users) ? member.users[0] : member.users
      })) as WorkspaceMember[]

      if (isMounted) {
        setMembers(transformedMembers)
      }
    }

    fetchMembers()

    return () => {
      isMounted = false
    }
  }, [workspaceId, supabase])

  const inviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Check if user exists
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail)
        .single()

      if (!userData) {
        setError('User with this email not found')
        return
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('workspace_id', workspaceId)
        .eq('user_id', userData.id)
        .single()

      if (existingMember) {
        setError('User is already a member of this workspace')
        return
      }

      // Add as member
      const { error: insertError } = await supabase
        .from('workspace_members')
        .insert([
          {
            workspace_id: workspaceId,
            user_id: userData.id,
            role: 'team',
            badge: 'team'
          }
        ])

      if (insertError) throw insertError

      setMessage('Member invited successfully!')
      setInviteEmail('')
      
      // Refresh members list
      const { data } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          badge,
          users (
            email,
            full_name
          )
        `)
        .eq('workspace_id', workspaceId)

      const transformedMembers = (data || []).map(member => ({
        ...member,
        users: Array.isArray(member.users) ? member.users[0] : member.users
      })) as WorkspaceMember[]

      setMembers(transformedMembers)
    } catch (err) {
      setError('Failed to invite member')
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const { error: deleteError } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId)

      if (deleteError) throw deleteError

      setMessage('Member removed successfully')
      
      // Refresh members list
      const { data } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          badge,
          users (
            email,
            full_name
          )
        `)
        .eq('workspace_id', workspaceId)

      const transformedMembers = (data || []).map(member => ({
        ...member,
        users: Array.isArray(member.users) ? member.users[0] : member.users
      })) as WorkspaceMember[]

      setMembers(transformedMembers)
    } catch (err) {
      setError('Failed to remove member')
    }
  }

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error: updateError } = await supabase
        .from('workspace_members')
        .update({ role: newRole })
        .eq('id', memberId)

      if (updateError) throw updateError

      setMessage('Member role updated successfully')
      
      // Refresh members list
      const { data } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          badge,
          users (
            email,
            full_name
          )
        `)
        .eq('workspace_id', workspaceId)

      const transformedMembers = (data || []).map(member => ({
        ...member,
        users: Array.isArray(member.users) ? member.users[0] : member.users
      })) as WorkspaceMember[]

      setMembers(transformedMembers)
    } catch (err) {
      setError('Failed to update member role')
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite Member Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invite Team Members</CardTitle>
          <CardDescription>
            Add new members to your workspace by their email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={inviteMember} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {message}
              </div>
            )}
            
            <div className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="flex-1"
              />
              <Button type="submit" disabled={loading}>
                {loading ? 'Inviting...' : 'Invite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Members List Card */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Members</CardTitle>
          <CardDescription>
            Manage roles and permissions for team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {member.users?.full_name?.[0]?.toUpperCase() || member.users?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.users?.full_name || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-500">{member.users?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <select
                    value={member.role}
                    onChange={(e) => updateMemberRole(member.id, e.target.value)}
                    className="rounded-md border border-gray-300 px-3 py-1 text-sm"
                  >
                    <option value="team">Team Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  
                  <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                    {member.role}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMember(member.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            
            {members.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No members yet. Invite someone to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}