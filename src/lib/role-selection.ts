export type SelectableRole = "buyer" | "seller" | "agent" | "investor";

type RoleSelectionError = {
  message: string;
  code?: string;
};

type UserRolesQuery = {
  delete: () => {
    eq: (column: "user_id", value: string) => Promise<{ error: RoleSelectionError | null }>;
  };
  insert: (values: {
    user_id: string;
    role: SelectableRole;
  }) => Promise<{ error: RoleSelectionError | null }>;
};

type RoleSelectionClient = {
  rpc: (
    fn: string,
    args: { new_role: SelectableRole },
  ) => Promise<{ error: RoleSelectionError | null }>;
  from: (table: "user_roles") => UserRolesQuery;
};

const ROLE_SELECTION_UNAVAILABLE =
  "Role selection is temporarily unavailable on this deployment. Please try again shortly.";

function isMissingSetMyRoleFunction(error: RoleSelectionError) {
  return error.code === "PGRST202" || error.code === "42883" || /set_my_role/i.test(error.message);
}

export function getRoleSelectionErrorMessage(error: RoleSelectionError) {
  if (
    /row-level security|permission denied|Only admins may assign privileged roles|Only admins may modify user roles/i.test(
      error.message,
    )
  ) {
    return ROLE_SELECTION_UNAVAILABLE;
  }

  return error.message || ROLE_SELECTION_UNAVAILABLE;
}

export async function selectUserRole(
  client: RoleSelectionClient,
  userId: string,
  role: SelectableRole,
) {
  const { error: rpcError } = await client.rpc("set_my_role", { new_role: role });
  if (!rpcError) return { error: null };
  if (!isMissingSetMyRoleFunction(rpcError)) return { error: rpcError };

  const { error: deleteError } = await client.from("user_roles").delete().eq("user_id", userId);
  if (deleteError) return { error: deleteError };

  const { error: insertError } = await client.from("user_roles").insert({ user_id: userId, role });
  return { error: insertError };
}
