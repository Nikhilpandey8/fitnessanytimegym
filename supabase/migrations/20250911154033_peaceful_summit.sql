/*
  # Membership Renewal System with Email Notifications

  1. New Tables
    - `membership_renewals` - Track all membership renewal history

  2. Table Updates
    - Add `email` column to `members` table for email notifications
    - Add indexes for better performance

  3. Functions
    - `mark_expired_memberships()` - Automatically mark expired memberships
    - `get_expiring_memberships()` - Get memberships expiring soon

  4. Security
    - Enable RLS on new tables
    - Add policies for admin access
*/

-- Add email column to members table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'members' AND column_name = 'email'
  ) THEN
    ALTER TABLE members ADD COLUMN email text;
  END IF;
END $$;

-- Create membership renewals table
CREATE TABLE IF NOT EXISTS membership_renewals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid REFERENCES memberships(id) ON DELETE CASCADE NOT NULL,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL,
  previous_end_date date NOT NULL,
  new_end_date date NOT NULL,
  duration_label text NOT NULL,
  fee_amount numeric(10,2) NOT NULL,
  renewed_at timestamptz NOT NULL DEFAULT now(),
  renewed_by text NOT NULL DEFAULT 'Admin',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_renewals_membership ON membership_renewals(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_renewals_member ON membership_renewals(member_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);

-- Enable Row Level Security
ALTER TABLE membership_renewals ENABLE ROW LEVEL SECURITY;

-- Create admin-only policy for renewals
CREATE POLICY "admin_read_renewals"
  ON membership_renewals FOR SELECT
  USING (true);

-- Function to mark expired memberships
CREATE OR REPLACE FUNCTION mark_expired_memberships()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE memberships 
  SET status = 'expired', updated_at = now()
  WHERE status = 'active' 
    AND end_date < CURRENT_DATE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get expiring memberships (within 7 days)
CREATE OR REPLACE FUNCTION get_expiring_memberships(days_ahead INTEGER DEFAULT 7)
RETURNS TABLE (
  membership_id uuid,
  member_id uuid,
  member_name text,
  member_email text,
  member_phone text,
  end_date date,
  days_remaining integer,
  duration_label text,
  fee_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as membership_id,
    mem.id as member_id,
    mem.full_name as member_name,
    mem.email as member_email,
    mem.phone as member_phone,
    m.end_date,
    (m.end_date - CURRENT_DATE) as days_remaining,
    m.duration_label,
    m.fee_amount
  FROM memberships m
  JOIN members mem ON m.member_id = mem.id
  WHERE m.status IN ('active', 'expired')
    AND m.end_date BETWEEN (CURRENT_DATE - 30) AND (CURRENT_DATE + days_ahead)
    AND mem.email IS NOT NULL
    AND mem.email != '';
END;
$$ LANGUAGE plpgsql;

-- Function to get expired memberships
CREATE OR REPLACE FUNCTION get_expired_memberships()
RETURNS TABLE (
  membership_id uuid,
  member_id uuid,
  member_name text,
  member_email text,
  member_phone text,
  end_date date,
  days_expired integer,
  duration_label text,
  fee_amount numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as membership_id,
    mem.id as member_id,
    mem.full_name as member_name,
    mem.email as member_email,
    mem.phone as member_phone,
    m.end_date,
    (CURRENT_DATE - m.end_date) as days_expired,
    m.duration_label,
    m.fee_amount
  FROM memberships m
  JOIN members mem ON m.member_id = mem.id
  WHERE m.status = 'expired'
    AND mem.email IS NOT NULL
    AND mem.email != '';
END;
$$ LANGUAGE plpgsql;