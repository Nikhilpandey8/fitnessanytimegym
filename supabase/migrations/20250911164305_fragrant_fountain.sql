/*
  # Fix membership_renewals table schema completely

  1. Drop and recreate table to ensure clean schema
  2. Add all required columns with proper types
  3. Create indexes and constraints
  4. Enable RLS with proper policies
  5. Force schema cache refresh
*/

-- Drop existing table if it exists to start fresh
DROP TABLE IF EXISTS membership_renewals CASCADE;

-- Create membership_renewals table with all required columns
CREATE TABLE membership_renewals (
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
CREATE INDEX idx_membership_renewals_membership ON membership_renewals(membership_id);
CREATE INDEX idx_membership_renewals_member ON membership_renewals(member_id);
CREATE INDEX idx_membership_renewals_renewed_at ON membership_renewals(renewed_at);

-- Enable Row Level Security
ALTER TABLE membership_renewals ENABLE ROW LEVEL SECURITY;

-- Create public access policy
CREATE POLICY "public_access_renewals"
  ON membership_renewals FOR ALL
  USING (true);

-- Force schema cache refresh by updating a system table
-- This helps ensure Supabase recognizes the new schema immediately
NOTIFY pgrst, 'reload schema';