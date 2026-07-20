import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Building2, Briefcase, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  getRoleSelectionErrorMessage,
  selectUserRole,
  type SelectableRole,
} from "@/lib/role-selection";
import { toast } from "sonner";

export const Route = createFileRoute("/role-select")({
  validateSearch: (s: Record<string, unknown>) => ({
    role:
      s.role === "buyer" ||
      s.role === "seller" ||
      s.role === "agent" ||
      s.role === "investor"
        ? s.role
        : undefined,
  }),
  component: RoleSelect,
});

const roles = [
  {
    key: "buyer",
    label: "Buyer",
    desc: "Browse and offer on verified homes",
    icon: Home,
    color: "text-info bg-info/10",
  },
  {
    key: "seller",
    label: "Seller",
    desc: "List and sell your property",
    icon: Building2,
    color: "text-gold bg-gold/10",
  },
  {
    key: "agent",
    label: "Agent",
    desc: "Manage listings & clients",
    icon: Briefcase,
    color: "text-purple-role bg-purple-role/10",
  },
  {
    key: "investor",
    label: "Investor",
    desc: "Invest in tokenized real estate",
    icon: TrendingUp,
    color: "text-success bg-success/10",
  },
] as const;

function RoleSelect() {
  const { role: preferredRole } = Route.useSearch();
  const { user, role, loading, refreshRole } = useAuth();
  const nav = useNavigate();
  const [saving, setSaving] = useState<string | null>(null);
  const [didAutoPick, setDidAutoPick] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      nav({
        to: "/auth",
        search: preferredRole ? { mode: "signup", next: `/role-select?role=${preferredRole}` } : undefined,
      });
    }
    if (!loading && role) nav({ to: "/dashboard" });
  }, [loading, user, role, nav, preferredRole]);

  useEffect(() => {
    if (!loading && user && !role && preferredRole && !saving && !didAutoPick) {
      setDidAutoPick(true);
      void pick(preferredRole);
    }
  }, [loading, user, role, preferredRole, saving, didAutoPick]);

  const pick = async (r: SelectableRole) => {
    if (!user) return;
    setSaving(r);
    const { error } = await selectUserRole(supabase as never, user.id, r);
    if (error) {
      setSaving(null);
      return toast.error(getRoleSelectionErrorMessage(error));
    }

    // If the user signed up as an agent but email confirmation deferred profile
    // creation, backfill agent_profiles from user_metadata now.
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const signupRole = typeof meta.signup_role === "string" ? meta.signup_role : null;
    const licenseNumber = typeof meta.agent_license_number === "string" ? meta.agent_license_number : null;
    const licenseState = typeof meta.agent_license_state === "string" ? meta.agent_license_state : null;
    const brokerage = typeof meta.agent_brokerage_name === "string" ? meta.agent_brokerage_name : null;
    if (signupRole === "agent" && licenseNumber && licenseState) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data: existing } = await db
        .from("agent_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing) {
        const { error: agentErr } = await db.from("agent_profiles").insert({
          user_id: user.id,
          license_number: licenseNumber,
          license_state: licenseState.toUpperCase(),
          brokerage_name: brokerage || null,
        });
        if (agentErr) {
          setSaving(null);
          return toast.error(`Agent profile error: ${agentErr.message}`);
        }
      }
    }

    setSaving(null);
    await refreshRole();
    toast.success(`Welcome, ${r}!`);
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-navy text-white flex flex-col items-center justify-center px-4 py-10">
      <h1 className="text-3xl font-bold">Choose your role</h1>
      <p className="text-white/90 mt-2">You can switch later in Settings.</p>
      <div className="grid sm:grid-cols-2 gap-4 mt-8 max-w-2xl w-full">
        {roles.map((r) => (
          <button
            key={r.key}
            type="button"
            disabled={saving !== null}
            onClick={() => pick(r.key)}
            className="text-left disabled:cursor-not-allowed"
          >
            <Card
              className={`p-6 cursor-pointer bg-white text-foreground hover:shadow-gold transition-all ${saving === r.key ? "opacity-50" : ""}`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${r.color} flex items-center justify-center mb-3`}
              >
                <r.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg">{r.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
            </Card>
          </button>
        ))}
      </div>
      <Link to="/" className="mt-8 text-sm text-white/85 hover:text-gold">
        Skip for now
      </Link>
    </div>
  );
}
