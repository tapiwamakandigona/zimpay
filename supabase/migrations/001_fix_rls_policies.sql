-- Migration: Fix Critical RLS Policy Vulnerabilities
-- Created: 2026-01-13
-- Purpose: Restrict public access to profiles and prevent unauthorized transaction insertion

-- ===========================
-- FIX #1: Profiles Table
-- ===========================
-- ISSUE: Public SELECT allows anyone to read all user profiles (emails, names, phone numbers)
-- SOLUTION: Restrict SELECT to authenticated users viewing their own profile

-- Drop existing insecure policy
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Create secure policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (during signup)
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- ===========================
-- FIX #2: Transactions Table
-- ===========================
-- ISSUE: Public INSERT allows anyone to inject fake transaction records
-- SOLUTION: Only authenticated users can create transactions where they are the sender

-- Drop existing insecure policy
DROP POLICY IF EXISTS "Enable insert for public" ON transactions;

-- Create secure policy: Users can only create transactions from their own account
CREATE POLICY "Authenticated users can create own transactions"
ON transactions FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can view transactions where they are sender OR receiver
CREATE POLICY "Users can view their transactions"
ON transactions FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- ===========================
-- FIX #3: ZimBet Tables (Verification)
-- ===========================
-- Verify admin policies are properly scoped
-- Note: Admin bypass should only work if user has explicit 'admin' role

-- For zimbet_accounts: Ensure leaderboard SELECT is read-only and safe
-- (Current policy allows public SELECT for leaderboard - this is acceptable if only showing scores)

-- For zimbet_matches: Verify users can only modify their own matches
DROP POLICY IF EXISTS "Users can create matches" ON zimbet_matches;
DROP POLICY IF EXISTS "Users can update matches" ON zimbet_matches;

CREATE POLICY "Users can create own matches"
ON zimbet_matches FOR INSERT
WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can view matches they're in"
ON zimbet_matches FOR SELECT
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Users can update matches they're in"
ON zimbet_matches FOR UPDATE
USING (auth.uid() = player1_id OR auth.uid() = player2_id)
WITH CHECK (auth.uid() = player1_id OR auth.uid() = player2_id);

-- ===========================
-- Verification Queries
-- ===========================
-- Run these after migration to verify policies are active:

-- COMMENT: Test 1 - Verify profiles are restricted
-- SELECT * FROM profiles; -- Should only return current user's profile

-- COMMENT: Test 2 - Verify transactions require authentication
-- INSERT INTO transactions (sender_id, receiver_id, amount) VALUES ('fake-uuid', 'another-uuid', 100);
-- Should fail with RLS violation

-- COMMENT: Test 3 - Check policy count
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('profiles', 'transactions', 'zimbet_matches');
