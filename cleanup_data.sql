-- ============================================
-- CLEANUP SCRIPT - Reset All Data
-- ============================================
-- WARNING: This will delete ALL data!

-- 1. Delete all submissions
DELETE FROM submissions;

-- 2. Delete all monthly targets
DELETE FROM monthly_targets;

-- 3. Delete all profiles (this will cascade to submissions if any remain)
DELETE FROM profiles;

-- 4. Delete all auth users (this will cascade to profiles)
-- Note: Run this in Supabase SQL Editor with caution
DELETE FROM auth.users;

-- 5. Clear storage bucket (optional - do this manually in Supabase Dashboard)
-- Go to Storage -> submissions -> Delete all files

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify everything is clean:

SELECT COUNT(*) as submission_count FROM submissions;
SELECT COUNT(*) as target_count FROM monthly_targets;
SELECT COUNT(*) as profile_count FROM profiles;
SELECT COUNT(*) as user_count FROM auth.users;
