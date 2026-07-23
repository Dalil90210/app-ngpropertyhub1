import { describe, expect, it, vi } from "vitest";

import {
  getRoleSelectionErrorMessage,
  selectUserRole,
  type SelectableRole,
} from "./role-selection";

function createClient({
  rpcError = null,
  deleteError = null,
  insertError = null,
}: {
  rpcError?: { message: string; code?: string } | null;
  deleteError?: { message: string; code?: string } | null;
  insertError?: { message: string; code?: string } | null;
} = {}) {
  const eq = vi.fn(async () => ({ error: deleteError }));
  const deleteFn = vi.fn(() => ({ eq }));
  const insert = vi.fn(async () => ({ error: insertError }));
  const from = vi.fn(() => ({ delete: deleteFn, insert }));
  const rpc = vi.fn(async (fn: string) => {
    if (fn === "log_role_assignment_attempt") return { error: null };
    return { error: rpcError };
  });

  return {
    client: { rpc, from },
    rpc,
    from,
    deleteFn,
    eq,
    insert,
  };
}

describe("selectUserRole", () => {
  const userId = "user-1";
  const role: SelectableRole = "seller";

  it("uses the rpc path when available", async () => {
    const { client, from, rpc } = createClient();

    const result = await selectUserRole(client, userId, role);

    expect(result.error).toBeNull();
    expect(rpc).toHaveBeenCalledWith("set_my_role", { new_role: role });
    expect(rpc).toHaveBeenCalledWith(
      "log_role_assignment_attempt",
      expect.objectContaining({ _attempted_role: role, _outcome: "success" }),
    );
    expect(from).not.toHaveBeenCalled();
  });

  it("falls back to delete+insert when the rpc has not been deployed yet", async () => {
    const { client, deleteFn, eq, insert } = createClient({
      rpcError: { code: "PGRST202", message: "Could not find the function public.set_my_role" },
    });

    const result = await selectUserRole(client, userId, role);

    expect(result.error).toBeNull();
    expect(deleteFn).toHaveBeenCalledOnce();
    expect(eq).toHaveBeenCalledWith("user_id", userId);
    expect(insert).toHaveBeenCalledWith({ user_id: userId, role });
  });

  it("maps old RLS failures to a clearer user-facing message", () => {
    expect(
      getRoleSelectionErrorMessage({
        message: "new row violates row-level security policy for table user_roles",
      }),
    ).toContain("temporarily unavailable");
  });
});
