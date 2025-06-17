-- Add missing unique constraint on profiles.user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_user_id_key' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add missing unique constraint on admin_users.user_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'admin_users_user_id_key' 
    AND table_name = 'admin_users'
  ) THEN
    ALTER TABLE admin_users ADD CONSTRAINT admin_users_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Function to create demo admin user
CREATE OR REPLACE FUNCTION create_demo_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_user_id uuid;
  demo_profile_id uuid;
BEGIN
  -- Check if demo admin already exists
  SELECT id INTO demo_user_id
  FROM auth.users
  WHERE email = 'admin@heven.com';
  
  -- If user doesn't exist, create it
  IF demo_user_id IS NULL THEN
    -- Insert into auth.users (this requires SECURITY DEFINER)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@heven.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO demo_user_id;
  END IF;
  
  -- Create or update profile (now that we have the unique constraint)
  INSERT INTO profiles (user_id, name, created_at, updated_at)
  VALUES (demo_user_id, 'Admin User', now(), now())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    name = 'Admin User',
    updated_at = now()
  RETURNING id INTO demo_profile_id;
  
  -- Create or update admin user entry
  INSERT INTO admin_users (user_id, role, permissions, is_active, created_at, updated_at)
  VALUES (
    demo_user_id, 
    'super_admin', 
    ARRAY['users', 'products', 'orders', 'coupons', 'analytics']::text[], 
    true, 
    now(), 
    now()
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = 'super_admin',
    permissions = ARRAY['users', 'products', 'orders', 'coupons', 'analytics']::text[],
    is_active = true,
    updated_at = now();
    
END;
$$;

-- Execute the function to create demo admin
SELECT create_demo_admin();

-- Clean up the function (optional, for security)
DROP FUNCTION IF EXISTS create_demo_admin();

-- Ensure proper indexes exist for admin queries
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);