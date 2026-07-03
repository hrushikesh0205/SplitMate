/*
# SplitMate — core schema (multi-user, auth required)

1. Overview
   SplitMate is an expense-sharing + debt-settlement app (Splitwise-style).
   Users sign up with email/password. They form Groups, add expenses to a group,
   and SplitMate computes who-owes-whom. Settlements record payments that clear debts.

2. New Tables (all created first, then policies after)
   - profiles, groups, group_members, expenses, settlements, notifications

3. Security (RLS) — all TO authenticated, owner columns default auth.uid()
   - profiles: owner CRUD
   - groups: membership-based visibility; creator insert; owner update/delete
   - group_members: membership visibility; self-or-owner insert; owner delete
   - expenses: membership visibility+insert; creator-or-owner delete
   - settlements: membership visibility+insert; creator-or-owner delete
   - notifications: owner-only CRUD
*/

-- ============ TABLES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_color text NOT NULL DEFAULT 'indigo',
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  paid_by uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  category text NOT NULL DEFAULT 'general',
  split_type text NOT NULL DEFAULT 'equal',
  split_between uuid[] NOT NULL DEFAULT '{}',
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  payer uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  payee uuid NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  note text,
  created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  body text,
  read boolean NOT NULL DEFAULT false,
  link text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============ RLS ENABLE ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============ POLICIES ============
-- profiles
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- groups
DROP POLICY IF EXISTS "select_group_if_member" ON groups;
CREATE POLICY "select_group_if_member" ON groups FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = groups.id AND gm.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_group_as_creator" ON groups;
CREATE POLICY "insert_group_as_creator" ON groups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "update_group_if_owner" ON groups;
CREATE POLICY "update_group_if_owner" ON groups FOR UPDATE
  TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);
DROP POLICY IF EXISTS "delete_group_if_owner" ON groups;
CREATE POLICY "delete_group_if_owner" ON groups FOR DELETE
  TO authenticated USING (auth.uid() = created_by);

-- group_members
DROP POLICY IF EXISTS "select_group_members_if_member" ON group_members;
CREATE POLICY "select_group_members_if_member" ON group_members FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_group_member_self_or_owner" ON group_members;
CREATE POLICY "insert_group_member_self_or_owner" ON group_members FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM groups g WHERE g.id = group_members.group_id AND g.created_by = auth.uid())
  );
DROP POLICY IF EXISTS "delete_group_member_owner" ON group_members;
CREATE POLICY "delete_group_member_owner" ON group_members FOR DELETE
  TO authenticated USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM groups g WHERE g.id = group_members.group_id AND g.created_by = auth.uid())
  );

-- expenses
DROP POLICY IF EXISTS "select_expense_if_member" ON expenses;
CREATE POLICY "select_expense_if_member" ON expenses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = expenses.group_id AND gm.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_expense_if_member" ON expenses;
CREATE POLICY "insert_expense_if_member" ON expenses FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = expenses.group_id AND gm.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_expense_owner_or_group_owner" ON expenses;
CREATE POLICY "delete_expense_owner_or_group_owner" ON expenses FOR DELETE
  TO authenticated USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM groups g WHERE g.id = expenses.group_id AND g.created_by = auth.uid())
  );

-- settlements
DROP POLICY IF EXISTS "select_settlement_if_member" ON settlements;
CREATE POLICY "select_settlement_if_member" ON settlements FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = settlements.group_id AND gm.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "insert_settlement_if_member" ON settlements;
CREATE POLICY "insert_settlement_if_member" ON settlements FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = settlements.group_id AND gm.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "delete_settlement_owner_or_group_owner" ON settlements;
CREATE POLICY "delete_settlement_owner_or_group_owner" ON settlements FOR DELETE
  TO authenticated USING (
    auth.uid() = created_by
    OR EXISTS (SELECT 1 FROM groups g WHERE g.id = settlements.group_id AND g.created_by = auth.uid())
  );

-- notifications
DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_settlements_group ON settlements(group_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
