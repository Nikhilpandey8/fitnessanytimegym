import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = 'https://jmsemkiiabamogziuqbn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptc2Vta2lpYWJhbW9neml1cWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTE3NjYsImV4cCI6MjA3MjU2Nzc2Nn0.yiuBumJd-mujTPP0KhuYwwepLujMej9wS3yXpCUUhM4'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Member {
  id: string
  full_name: string
  phone?: string
  email?: string
  notes?: string
  created_at: string
}

export interface Membership {
  id: string
  member_id: string
  start_date: string
  end_date: string
  duration_label: string
  fee_amount: number
  status: 'active' | 'hold' | 'inactive' | 'expired'
  paused_at?: string
  paused_days: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  member_id: string
  membership_id?: string
  paid_on: string
  amount: number
  note?: string
  created_at: string
}

export interface FeeSlip {
  id: string
  member_id: string
  membership_id: string
  issued_on: string
  fee_amount: number
  start_date: string
  end_date: string
  duration_label: string
  gym_name: string
  signed_by: string
  created_at: string
}

export interface MembershipRenewal {
  id: string
  membership_id: string
  member_id: string
  previous_end_date: string
  new_end_date: string
  duration_label: string
  fee_amount: number
  renewed_at: string
  renewed_by: string
  created_at: string
}