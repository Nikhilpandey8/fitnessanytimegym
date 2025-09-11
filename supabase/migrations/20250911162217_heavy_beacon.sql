/*
  # Fix membership_renewals table schema

  1. Table Updates
    - Ensure membership_renewals table exists with all required columns
    - Add missing columns if they don't exist
    - Create proper indexes and constraints

  2. Security
    - Enable RLS on membership_renewals table
    - Add policies for public access
*/

-- Create membership_renewals table with all required columns
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

-- Add member_id column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'member_id'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN member_id uuid REFERENCES members(id) ON DELETE CASCADE NOT NULL;
  END IF;
END $$;

-- Add other missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'membership_id'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN membership_id uuid REFERENCES memberships(id) ON DELETE CASCADE NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'previous_end_date'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN previous_end_date date NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'new_end_date'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN new_end_date date NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'duration_label'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN duration_label text NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'fee_amount'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN fee_amount numeric(10,2) NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'renewed_at'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN renewed_at timestamptz NOT NULL DEFAULT now();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_renewals' AND column_name = 'renewed_by'
  ) THEN
    ALTER TABLE membership_renewals ADD COLUMN renewed_by text NOT NULL DEFAULT 'Admin';
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_renewals_membership ON membership_renewals(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_renewals_member ON membership_renewals(member_id);

-- Enable Row Level Security
ALTER TABLE membership_renewals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public_read_renewals" ON membership_renewals;
DROP POLICY IF EXISTS "public_access_renewals" ON membership_renewals;

-- Create public access policy (since we're using anon key)
CREATE POLICY "public_access_renewals"
  ON membership_renewals FOR ALL
  USING (true);