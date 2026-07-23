/**
 * End-to-end test: sign up and complete role selection for all four
 * self-selectable roles (buyer, seller, agent, investor) against the live
 * Supabase project. Uses the service role key to create + confirm test users
 * (email confirmation is enabled in production), then exercises the exact
 * same `selectUserRole` code path the app uses so any RLS/trigger regression
 * fails this test.
 *
 * Run with:
 *   SUPABASE_URL=... \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   SUPABASE_PUBLISHABLE_KEY=... \
 *   bun run test:e2e
 *
 * The test skips (does not fail) when the service role key is absent so it
 * stays green in environments without admin credentials.
 */
import { describe, it, expect, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { selectUserRole, type SelectableRole } from "../../src/lib/role-selection";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const canRun = Boolean(SUPABASE_URL && SERVICE_KEY && ANON_KEY);
const d = canRun ? describe : describe.skip;

const ROLES: SelectableRole[] = ["buyer", "seller", "agent", "investor"];
const createdUserIds: string[] = [];

d("E2E: signup + role selection for all four roles", () => {
  const admin: SupabaseClient = canRun
    ? createClient(SUPABASE_URL!, SERVICE_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : (null as unknown as SupabaseClient);

  afterAll(async () => {
    if (!canRun) return;
    for (const id of createdUserIds) {
      await admin.auth.admin.deleteUser(id).catch(() => {});
    }
  });

  it.each(ROLES)(
    "signs up a new %s and completes role selection with no db errors",
    async (role) => {
      const stamp = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const email = `e2e-${role}-${stamp}@example.com`;
      const password = `Test!${stamp}Aa1`;

      // 1. Create + auto-confirm user (bypasses email confirmation).
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(createErr, `createUser(${role})`).toBeNull();
      const userId = created.user!.id;
      createdUserIds.push(userId);

      // 2. Sign in as that user with the anon key — same session shape the app uses.
      const user = createClient(SUPABASE_URL!, ANON_KEY!, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { error: signInErr } = await user.auth.signInWithPassword({ email, password });
      expect(signInErr, `signIn(${role})`).toBeNull();

      // 3. Exercise the real role-selection code path.
      const { error: roleErr } = await selectUserRole(
        user as never,
        userId,
        role,
      );
      expect(roleErr, `selectUserRole(${role}) -> ${roleErr?.message}`).toBeNull();

      // 4. Confirm the role row exists and matches.
      const { data: rows, error: readErr } = await user
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      expect(readErr, `read user_roles(${role})`).toBeNull();
      expect(rows?.map((r) => r.role)).toContain(role);

      await user.auth.signOut();
    },
    30_000,
  );
});
