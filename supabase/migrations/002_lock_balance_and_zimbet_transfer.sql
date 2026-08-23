-- Migration: Lock balance columns + atomic ZimBet transfer
-- Created: 2026-06-13
-- Purpose: Close the "infinite money" hole. Previously the `Users can update own
--          profile` RLS policy allowed an authenticated user to UPDATE *any*
--          column of their own row — including `balance` — straight from the
--          browser with the anon key:
--              supabase.from('profiles').update({ balance: 999999 }).eq('id', myId)
--          And the ZimPay -> ZimBet transfer mutated balances client-side and
--          non-atomically. This migration makes `balance` server-authoritative.

-- ============================================================
-- FIX #1: Revoke direct column-level UPDATE on balance
-- ============================================================
-- Column privileges are enforced independently of RLS, so even with a passing
-- RLS policy a client UPDATE that touches `balance` now fails with
-- "permission denied for column balance". SECURITY DEFINER functions below run
-- as the table owner and bypass this, so legitimate transfers still work.

REVOKE UPDATE (balance) ON public.profiles        FROM authenticated, anon;
REVOKE UPDATE (balance) ON public.zimbet_accounts FROM authenticated, anon;

-- ============================================================
-- FIX #2: Atomic, authorized ZimPay -> ZimBet transfer
-- ============================================================
CREATE OR REPLACE FUNCTION public.transfer_to_zimbet(
    p_sender_id        uuid,
    p_zimbet_username  text,
    p_amount           numeric,
    p_description      text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_amount         numeric := round(p_amount::numeric, 2);
    v_sender_balance numeric;
    v_receiver_id    uuid;
BEGIN
    -- A user may only move their OWN money.
    IF auth.uid() IS NULL OR auth.uid() <> p_sender_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
    END IF;

    IF v_amount IS NULL OR v_amount <= 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
    END IF;

    -- Lock the sender row to prevent concurrent double-spend.
    SELECT balance INTO v_sender_balance
    FROM profiles WHERE id = p_sender_id FOR UPDATE;

    IF v_sender_balance IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sender not found');
    END IF;

    IF v_sender_balance < v_amount THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance');
    END IF;

    -- Lock the receiver row.
    SELECT id INTO v_receiver_id
    FROM zimbet_accounts WHERE username = p_zimbet_username FOR UPDATE;

    IF v_receiver_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'ZimBet account not found');
    END IF;

    -- Single transaction: both updates + the ledger row commit together or not at all.
    UPDATE profiles        SET balance = balance - v_amount WHERE id = p_sender_id;
    UPDATE zimbet_accounts SET balance = balance + v_amount WHERE id = v_receiver_id;

    INSERT INTO transactions (sender_id, receiver_id, amount, description, status)
    VALUES (
        p_sender_id,
        v_receiver_id,
        v_amount,
        COALESCE(p_description, 'Transfer to ZimBet @' || p_zimbet_username),
        'completed'
    );

    RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL  ON FUNCTION public.transfer_to_zimbet(uuid, text, numeric, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.transfer_to_zimbet(uuid, text, numeric, text) TO authenticated;

-- ============================================================
-- Verification
-- ============================================================
-- 1) As an authenticated user, this must now FAIL:
--      supabase.from('profiles').update({ balance: 999999 }).eq('id', myId)
--    -> "permission denied for column balance"
-- 2) Legitimate transfer:
--      supabase.rpc('transfer_to_zimbet', { p_sender_id, p_zimbet_username, p_amount })
