export function getAuthenticatedDestination(params: {
  role: string | null;
  dest: string | null;
}): "/dashboard" | "/role-select" | string {
  const { role, dest } = params;
  if (dest) return dest;
  return role ? "/dashboard" : "/role-select";
}
