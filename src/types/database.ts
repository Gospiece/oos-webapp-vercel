export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'guest' | 'user' | 'admin'
          google_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'guest' | 'user' | 'admin'
          google_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'guest' | 'user' | 'admin'
          google_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          bio: string | null
          skills: string[] | null
          experience_level: string | null
          phone_number: string | null
          location: string | null
          website_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          bio?: string | null
          skills?: string[] | null
          experience_level?: string | null
          phone_number?: string | null
          location?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bio?: string | null
          skills?: string[] | null
          experience_level?: string | null
          phone_number?: string | null
          location?: string | null
          website_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_badges: {
        Row: {
          id: string
          user_id: string
          granted_at: string
          granted_by: string | null
        }
        Insert: {
          id?: string
          user_id: string
          granted_at?: string
          granted_by?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          granted_at?: string
          granted_by?: string | null
        }
      }
      workspaces: {
        Row: {
          id: string
          name: string
          description: string | null
          admin_id: string
          verification_status: 'unverified' | 'verified'
          cac_document_url: string | null
          workspace_email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          admin_id: string
          verification_status?: 'unverified' | 'verified'
          cac_document_url?: string | null
          workspace_email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          admin_id?: string
          verification_status?: 'unverified' | 'verified'
          cac_document_url?: string | null
          workspace_email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'team' | 'admin'
          badge: 'team' | 'admin'
          joined_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'team' | 'admin'
          badge?: 'team' | 'admin'
          joined_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'team' | 'admin'
          badge?: 'team' | 'admin'
          joined_at?: string
        }
      }
      workspace_invites: {
        Row: {
          id: string
          workspace_id: string
          email: string
          token: string
          invited_by: string | null
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          email: string
          token: string
          invited_by?: string | null
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          email?: string
          token?: string
          invited_by?: string | null
          expires_at?: string
          used?: boolean
          created_at?: string
        }
      }
      startups: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          pitch: string
          website_url: string | null
          verification_tier: 'registered' | 'verified' | 'pending_verification'
          kyc_status: 'pending' | 'verified' | 'rejected'
          bank_account: string
          bank_name: string | null
          bank_account_name: string | null
          bank_account_verified: boolean
          bank_verification_document_url: string | null
          cac_number: string | null
          document_urls: string[] | null
          is_active: boolean
          expires_at: string
          subscriber_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          pitch: string
          website_url?: string | null
          verification_tier?: 'registered' | 'verified' | 'pending_verification'
          kyc_status?: 'pending' | 'verified' | 'rejected'
          bank_account: string
          bank_name?: string | null
          bank_account_name?: string | null
          bank_account_verified?: boolean
          bank_verification_document_url?: string | null
          cac_number?: string | null
          document_urls?: string[] | null
          is_active?: boolean
          expires_at?: string
          subscriber_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          pitch?: string
          website_url?: string | null
          verification_tier?: 'registered' | 'verified' | 'pending_verification'
          kyc_status?: 'pending' | 'verified' | 'rejected'
          bank_account?: string
          bank_name?: string | null
          bank_account_name?: string | null
          bank_account_verified?: boolean
          bank_verification_document_url?: string | null
          cac_number?: string | null
          document_urls?: string[] | null
          is_active?: boolean
          expires_at?: string
          subscriber_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      startup_documents: {
        Row: {
          id: string
          startup_id: string
          document_type: string
          document_url: string
          status: 'pending' | 'approved' | 'rejected'
          verified_by: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          document_type: string
          document_url: string
          status?: 'pending' | 'approved' | 'rejected'
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          document_type?: string
          document_url?: string
          status?: 'pending' | 'approved' | 'rejected'
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
      }
      bank_verifications: {
        Row: {
          id: string
          startup_id: string
          bank_name: string
          account_number: string
          account_name: string
          verification_document_url: string
          status: 'pending' | 'verified' | 'rejected'
          verified_by: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          bank_name: string
          account_number: string
          account_name: string
          verification_document_url: string
          status?: 'pending' | 'verified' | 'rejected'
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          bank_name?: string
          account_number?: string
          account_name?: string
          verification_document_url?: string
          status?: 'pending' | 'verified' | 'rejected'
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
        }
      }
      startup_comments: {
        Row: {
          id: string
          startup_id: string
          user_id: string
          content: string
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          user_id: string
          content: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          user_id?: string
          content?: string
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          startup_id: string
          user_id: string
          subscribed_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          user_id: string
          subscribed_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          user_id?: string
          subscribed_at?: string
        }
      }
      startup_deletion_log: {
        Row: {
          id: string
          startup_id: string
          deleted_at: string
          reason: string
        }
        Insert: {
          id?: string
          startup_id: string
          deleted_at?: string
          reason?: string
        }
        Update: {
          id?: string
          startup_id?: string
          deleted_at?: string
          reason?: string
        }
      }
      donations: {
        Row: {
          id: string
          startup_id: string
          donor_email: string
          amount: number
          fee_percentage: number
          net_amount: number
          status: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_provider: string
          payment_reference: string
          created_at: string
        }
        Insert: {
          id?: string
          startup_id: string
          donor_email: string
          amount: number
          fee_percentage?: number
          net_amount?: number
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_provider: string
          payment_reference: string
          created_at?: string
        }
        Update: {
          id?: string
          startup_id?: string
          donor_email?: string
          amount?: number
          fee_percentage?: number
          net_amount?: number
          status?: 'pending' | 'completed' | 'failed' | 'refunded'
          payment_provider?: string
          payment_reference?: string
          created_at?: string
        }
      }
      video_meetings: {
        Row: {
          id: string
          workspace_id: string
          admin_id: string | null
          room_name: string
          room_url: string | null
          recording_url: string | null
          is_paid_recording: boolean
          duration: number
          participant_count: number
          started_at: string
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          admin_id?: string | null
          room_name: string
          room_url?: string | null
          recording_url?: string | null
          is_paid_recording?: boolean
          duration?: number
          participant_count?: number
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          admin_id?: string | null
          room_name?: string
          room_url?: string | null
          recording_url?: string | null
          is_paid_recording?: boolean
          duration?: number
          participant_count?: number
          started_at?: string
          ended_at?: string | null
          created_at?: string
        }
      }
      meeting_participants: {
        Row: {
          id: string
          meeting_id: string
          user_id: string
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          meeting_id: string
          user_id: string
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          meeting_id?: string
          user_id?: string
          joined_at?: string
          left_at?: string | null
        }
      }
      ai_generated_content: {
        Row: {
          id: string
          workspace_id: string | null
          startup_id: string | null
          content_type: 'meeting_minutes' | 'risk_analysis' | 'startup_rating' | 'business_insights'
          content: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id?: string | null
          startup_id?: string | null
          content_type: 'meeting_minutes' | 'risk_analysis' | 'startup_rating' | 'business_insights'
          content: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string | null
          startup_id?: string | null
          content_type?: 'meeting_minutes' | 'risk_analysis' | 'startup_rating' | 'business_insights'
          content?: string
          metadata?: Json
          created_at?: string
        }
      }
      workspace_posts: {
        Row: {
          id: string
          workspace_id: string
          admin_id: string | null
          title: string
          content: string
          post_type: 'news' | 'vacancy' | 'achievement' | 'update'
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          admin_id?: string | null
          title: string
          content: string
          post_type?: 'news' | 'vacancy' | 'achievement' | 'update'
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          admin_id?: string | null
          title?: string
          content?: string
          post_type?: 'news' | 'vacancy' | 'achievement' | 'update'
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      startup_newsletters: {
        Row: {
          id: string
          startup_id: string
          title: string
          content: string
          sent_at: string
          subscriber_count: number
        }
        Insert: {
          id?: string
          startup_id: string
          title: string
          content: string
          sent_at?: string
          subscriber_count?: number
        }
        Update: {
          id?: string
          startup_id?: string
          title?: string
          content?: string
          sent_at?: string
          subscriber_count?: number
        }
      }
      chat_messages: {
        Row: {
          id: string
          meeting_id: string | null
          workspace_id: string | null
          user_id: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id?: string | null
          workspace_id?: string | null
          user_id: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string | null
          workspace_id?: string | null
          user_id?: string
          message?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type aliases for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type AdminBadge = Database['public']['Tables']['admin_badges']['Row']
export type Workspace = Database['public']['Tables']['workspaces']['Row']
export type WorkspaceMember = Database['public']['Tables']['workspace_members']['Row']
export type WorkspaceInvite = Database['public']['Tables']['workspace_invites']['Row']
export type Startup = Database['public']['Tables']['startups']['Row']
export type StartupDocument = Database['public']['Tables']['startup_documents']['Row']
export type BankVerification = Database['public']['Tables']['bank_verifications']['Row']
export type StartupComment = Database['public']['Tables']['startup_comments']['Row']
export type NewsletterSubscriber = Database['public']['Tables']['newsletter_subscribers']['Row']
export type Donation = Database['public']['Tables']['donations']['Row']
export type VideoMeeting = Database['public']['Tables']['video_meetings']['Row']
export type MeetingParticipant = Database['public']['Tables']['meeting_participants']['Row']
export type AIGeneratedContent = Database['public']['Tables']['ai_generated_content']['Row']
export type WorkspacePost = Database['public']['Tables']['workspace_posts']['Row']
export type StartupNewsletter = Database['public']['Tables']['startup_newsletters']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']

// Component-specific types
export interface StartupWithStats extends Startup {
  donation_count: number
  total_donations: number
}

export interface CommentWithUser extends StartupComment {
  users: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface WorkspaceWithMembers extends Workspace {
  workspace_members: WorkspaceMember[]
  member_count: number
}

export interface DonationWithStartup extends Donation {
  startups: {
    name: string
    user_id: string
  }
}

// Form types
export interface StartupFormData {
  name: string
  description: string
  pitch: string
  website_url: string
  bank_account: string
  bank_name: string
  bank_account_name: string
}

export interface WorkspaceFormData {
  name: string
  description: string
}

export interface UserProfileFormData {
  full_name: string
  bio: string
  skills: string
  phone_number: string
  location: string
  website_url: string
  experience_level: string
}

// API Response types
export interface ApiResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Payment types
export interface PaymentConfig {
  key: string
  email: string
  amount: number
  currency: string
  ref: string
  metadata: {
    startup_id: string
    startup_name: string
    donor_name: string
    custom_fields: Array<{
      display_name: string
      variable_name: string
      value: string
    }>
  }
  callback: (response: PaymentResponse) => void
  onClose: () => void
}

export interface PaymentResponse {
  reference: string
  status: string
  message?: string
  transaction?: string
}

// AI Types
export interface AIGenerationRequest {
  prompt: string
  type: 'meeting_minutes' | 'risk_analysis' | 'startup_rating' | 'business_insights'
  workspaceId?: string
  startupId?: string
}

export interface AIGenerationResponse {
  content: string
  record: AIGeneratedContent
}

// Chat Types
export interface ChatMessageWithUser extends ChatMessage {
  users: {
    full_name: string | null
  }
}