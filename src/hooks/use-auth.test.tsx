import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { useEffect } from "react";

// --- Mock the supabase client BEFORE importing the hook ---
type AuthCb = (event: string, session: unknown) => void;
let authCallback: AuthCb = () => {};
let resolveRoleFetch: ((v: { data: { role: string } | null }) => void) | null = null;

const rolePromise = () =>
  new Promise<{ data: { role: string } | null }>((resolve) => {
    resolveRoleFetch = resolve;
  });

vi.mock("@/integrations/supabase/client", () => {
  const roleQuery = {
    select: () => roleQuery,
    eq: () => roleQuery,
    order: () => roleQuery,
    limit: () => roleQuery,
    maybeSingle: () => rolePromise(),
  };
  return {
    supabase: {
      auth: {
        onAuthStateChange: (cb: AuthCb) => {
          authCallback = cb;
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getSession: async () => ({ data: { session: null } }),
      },
      from: () => roleQuery,
    },
  };
});

import { AuthProvider, useAuth } from "./use-auth";

function Probe({ onState }: { onState: (s: { loading: boolean; role: string | null }) => void }) {
  const { loading, role } = useAuth();
  useEffect(() => {
    onState({ loading, role });
  }, [loading, role, onState]);
  return null;
}

describe("AuthProvider — admin sign-in race", () => {
  beforeEach(() => {
    resolveRoleFetch = null;
  });

  it("keeps loading=true after SIGNED_IN until role fetch resolves (so /admin does not redirect early)", async () => {
    const states: Array<{ loading: boolean; role: string | null }> = [];
    render(
      <AuthProvider>
        <Probe onState={(s) => states.push(s)} />
      </AuthProvider>,
    );

    // Initial getSession() completes with no session -> loading becomes false, role null.
    await waitFor(() => {
      expect(states.at(-1)).toEqual({ loading: false, role: null });
    });

    // Simulate Supabase firing SIGNED_IN after signInWithPassword.
    await act(async () => {
      authCallback("SIGNED_IN", { user: { id: "admin-uid" } });
      // Let the setTimeout(0) inside onAuthStateChange dispatch the fetch.
      await new Promise((r) => setTimeout(r, 5));
    });

    // CRITICAL: while the role fetch is in flight, loading MUST be true and role null.
    // This is the exact window where /admin used to bounce to /admin-login.
    const midFlight = states.at(-1)!;
    expect(midFlight.loading).toBe(true);
    expect(midFlight.role).toBeNull();

    // Resolve the role fetch as "admin".
    await act(async () => {
      resolveRoleFetch!({ data: { role: "admin" } });
      await new Promise((r) => setTimeout(r, 0));
    });

    await waitFor(() => {
      expect(states.at(-1)).toEqual({ loading: false, role: "admin" });
    });
  });
});
