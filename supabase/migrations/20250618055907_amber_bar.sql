/*
  # Create Demo Users and Admin

  1. Demo Users
    - Creates demo customer and admin users
    - Sets up proper profiles and admin access
    - Provides test data for the application

  2. Security
    - Uses proper authentication flow
    - Sets up admin permissions correctly
*/

-- Create demo customer user
DO $$
DECLARE
    customer_user_id uuid;
    admin_user_id uuid;
BEGIN
    -- Create customer user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'customer@heven.com',
        crypt('customer123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Demo Customer"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('customer123', gen_salt('bf')),
        updated_at = now()
    RETURNING id INTO customer_user_id;

    -- Get the customer user ID if it already existed
    IF customer_user_id IS NULL THEN
        SELECT id INTO customer_user_id FROM auth.users WHERE email = 'customer@heven.com';
    END IF;

    -- Create customer profile
    INSERT INTO profiles (user_id, name, phone, is_blocked)
    VALUES (customer_user_id, 'Demo Customer', '+1234567890', false)
    ON CONFLICT (user_id) DO UPDATE SET
        name = 'Demo Customer',
        phone = '+1234567890',
        is_blocked = false,
        updated_at = now();

    -- Create admin user
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000000',
        'admin@heven.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Demo Admin"}',
        false,
        'authenticated'
    ) ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('admin123', gen_salt('bf')),
        updated_at = now()
    RETURNING id INTO admin_user_id;

    -- Get the admin user ID if it already existed
    IF admin_user_id IS NULL THEN
        SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@heven.com';
    END IF;

    -- Create admin profile
    INSERT INTO profiles (user_id, name, phone, is_blocked)
    VALUES (admin_user_id, 'Demo Admin', '+1234567891', false)
    ON CONFLICT (user_id) DO UPDATE SET
        name = 'Demo Admin',
        phone = '+1234567891',
        is_blocked = false,
        updated_at = now();

    -- Create admin user entry
    INSERT INTO admin_users (user_id, role, permissions, is_active)
    VALUES (admin_user_id, 'super_admin', ARRAY['all'], true)
    ON CONFLICT (user_id) DO UPDATE SET
        role = 'super_admin',
        permissions = ARRAY['all'],
        is_active = true,
        updated_at = now();

END $$;