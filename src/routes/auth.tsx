import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getAuthenticatedDestination } from "@/lib/auth-redirect";
import { mapAuthError } from "@/lib/auth-errors";

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), "Include at least one letter and one number"),
  signupRole: z.enum(["buyer", "seller", "agent"]),
  license: z.string().trim().max(80).optional(),
  licenseState: z.string().trim().max(2).optional(),
  brokerage: z.string().trim().max(120).optional(),
}).superRefine((v, ctx) => {
  if (v.signupRole !== "agent") return;
  if (!v.license || v.license.length < 3) {
    ctx.addIssue({ code: "custom", path: ["license"], message: "License number is required for agents" });
  }
  if (!v.licenseState || v.licenseState.length !== 2) {
    ctx.addIssue({ code: "custom", path: ["licenseState"], message: "Use a 2-letter state code" });
  }
});

type FieldErrors = Record<string, string>;


export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
    mode: s.mode === "signup" || s.mode === "signin" ? s.mode : undefined,
  }),
  component: Auth,
});

// Only allow same-origin relative paths through the ?next= redirect.
function safeNext(next: string | undefined): string | null {
  if (!next || typeof next !== "string") return null;
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function Auth() {
  const nav = useNavigate();
  const { next, mode } = Route.useSearch();
  const { user, role, loading: authLoading } = useAuth();
  const dest = safeNext(next);
  const currentMode = mode === "signup" ? "signup" : "signin";
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [name, setName] = useState(""); const [loading, setLoading] = useState(false);
  const [signupRole, setSignupRole] = useState<"buyer" | "seller" | "agent">("buyer");
  const [license, setLicense] = useState(""); const [licenseState, setLicenseState] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signInErrors, setSignInErrors] = useState<FieldErrors>({});
  const [signUpErrors, setSignUpErrors] = useState<FieldErrors>({});
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const resendConfirmation = async () => {
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      setSignInErrors({ email: "Enter your email above first, then resend." });
      toast.error("Enter a valid email to resend the confirmation");
      return;
    }
    setResendLoading(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: parsed.data,
      options: { emailRedirectTo: `${window.location.origin}${dest ?? "/role-select"}` },
    });
    setResendLoading(false);
    if (error) {
      const mapped = mapAuthError(error);
      toast.error(mapped.toast, { description: mapped.inline });
      return;
    }
    toast.success("Confirmation email sent", { description: "Check your inbox (and spam folder)." });
  };


  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hasOAuthSignal = params.has("code") || params.has("error") || hash.has("access_token") || hash.has("error");
    if (!hasOAuthSignal) return;

    const key = `oauth-debug-${window.location.search}-${window.location.hash}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    const oauthError = params.get("error_description") || params.get("error") || hash.get("error_description") || hash.get("error");
    if (oauthError) {
      toast.error(`OAuth callback error: ${oauthError}`);
      console.error("[Auth][OAuth] callback error", { oauthError, search: window.location.search, hash: window.location.hash });
      return;
    }

    console.info("[Auth][OAuth] callback received", {
      hasUser: !!user,
      role: role ?? null,
      authLoading,
      search: window.location.search,
      hashPresent: !!window.location.hash,
    });
    toast.message("OAuth callback received. Checking session and role...");
  }, [authLoading, user, role]);

  useEffect(() => {
    if (authLoading || !user) return;
    const target = getAuthenticatedDestination({ role, dest });
    if (dest) {
      window.location.assign(target);
      return;
    }
    nav({ to: target as "/dashboard" | "/role-select" });
  }, [authLoading, user, role, dest, nav]);

  const goNext = () => {
    if (dest) window.location.assign(dest);
    else nav({ to: "/role-select" });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInErrors({});
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setSignInErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setLoading(false);
    if (error) {
      const mapped = mapAuthError(error);
      setSignInErrors({ [mapped.field]: mapped.inline });
      toast.error(mapped.toast, { description: mapped.inline });
      return;
    }
    toast.success("Welcome back!");
    goNext();
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpErrors({});
    const parsed = signUpSchema.safeParse({ name, email, password, signupRole, license, licenseState, brokerage });
    if (!parsed.success) {
      const errs: FieldErrors = {};
      for (const i of parsed.error.issues) errs[String(i.path[0])] = i.message;
      setSignUpErrors(errs);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setLoading(true);
    const isAgent = parsed.data.signupRole === "agent";
    const roleForRoute = isAgent ? "buyer" : parsed.data.signupRole;
    const postConfirmDest = dest ?? `/role-select?role=${roleForRoute}`;
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}${postConfirmDest}`,
        data: {
          full_name: parsed.data.name,
          signup_role: parsed.data.signupRole,
          // Persisted in user_metadata so post-confirmation flow (role-select)
          // can create agent_profiles even when signUp returns no session.
          agent_license_number: isAgent ? parsed.data.license?.trim() ?? null : null,
          agent_license_state: isAgent ? parsed.data.licenseState?.trim().toUpperCase() ?? null : null,
          agent_brokerage_name: isAgent ? parsed.data.brokerage?.trim() || null : null,
        },
      },
    });
    setLoading(false);
    if (error) {
      const mapped = mapAuthError(error);
      setSignUpErrors({ [mapped.field]: mapped.inline });
      toast.error(mapped.toast, { description: mapped.inline });
      return;
    }

    if (data.session && data.user) {
      const uid = data.user.id;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { error: roleErr } = await db.from("user_roles").insert({ user_id: uid, role: roleForRoute });
      if (roleErr) {
        toast.error(`Could not assign role: ${roleErr.message}`);
        return;
      }
      if (isAgent) {
        const { error: agentErr } = await db.from("agent_profiles").insert({
          user_id: uid,
          license_number: parsed.data.license!.trim(),
          license_state: parsed.data.licenseState!.trim().toUpperCase(),
          brokerage_name: parsed.data.brokerage?.trim() || null,
        });
        if (agentErr) {
          toast.error(`Agent profile error: ${agentErr.message}`);
          return;
        }
        toast.success("Account created! Agent verification is pending admin review.");
      } else {
        toast.success("Account created!");
      }
      goNext();
      return;
    }
    toast.success("Account created! Check your email to verify.");
  };



  const google = async () => {
    setGoogleLoading(true);
    const redirectTo = new URL("/auth", window.location.origin);
    redirectTo.searchParams.set("mode", currentMode);
    if (dest) redirectTo.searchParams.set("next", dest);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo.toString(),
        skipBrowserRedirect: true,
        queryParams: {
          prompt: currentMode === "signup" ? "consent" : "select_account",
        },
      },
    });
    if (error) {
      setGoogleLoading(false);
      const mapped = mapAuthError(error);
      toast.error(`Google ${currentMode} failed: ${mapped.toast}`, { description: mapped.inline });
      return;
    }
    if (data?.url) {
      window.location.assign(data.url);
      return;
    }
    setGoogleLoading(false);
    toast.error("Google sign-in could not start.");
  };



  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8 bg-card">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center text-navy"><Home className="w-5 h-5" /></div>
          <span className="font-bold text-navy">New Guard Property Hub</span>
        </Link>

        <Tabs
          value={currentMode}
          onValueChange={(v) =>
            nav({
              to: "/auth",
              search: { mode: v as "signin" | "signup", next },
            })
          }
        >
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} noValidate className="space-y-4 mt-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input id="signin-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!signInErrors.email} />
                {signInErrors.email && <p className="text-xs text-destructive mt-1">{signInErrors.email}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <Link to="/reset-password" className="text-xs text-navy hover:text-gold">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input id="signin-password" type={showPw ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!signInErrors.password} />
                  <button type="button" aria-label="Toggle password visibility"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signInErrors.password && <p className="text-xs text-destructive mt-1">{signInErrors.password}</p>}
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">{loading ? "Signing in..." : "Sign In"}</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} noValidate className="space-y-4 mt-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input id="signup-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!signUpErrors.name} />
                {signUpErrors.name && <p className="text-xs text-destructive mt-1">{signUpErrors.name}</p>}
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!signUpErrors.email} />
                {signUpErrors.email && <p className="text-xs text-destructive mt-1">{signUpErrors.email}</p>}
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input id="signup-password" type={showPw ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!signUpErrors.password} />
                  <button type="button" aria-label="Toggle password visibility"
                    onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signUpErrors.password
                  ? <p className="text-xs text-destructive mt-1">{signUpErrors.password}</p>
                  : <p className="text-[11px] text-muted-foreground mt-1">At least 8 characters with a letter and a number. Avoid common or previously leaked passwords.</p>}
              </div>
              <div>
                <Label htmlFor="signup-role">I am a</Label>
                <select id="signup-role" className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                  value={signupRole} onChange={(e) => setSignupRole(e.target.value as "buyer" | "seller" | "agent")}>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="agent">Agent</option>
                </select>
              </div>
              {signupRole === "agent" && (
                <div className="space-y-3 p-3 border rounded-md bg-muted/40">
                  <p className="text-xs text-muted-foreground">Agent accounts require admin verification before they show as verified.</p>
                  <div>
                    <Label htmlFor="signup-license">License Number</Label>
                    <Input id="signup-license" value={license} onChange={(e) => setLicense(e.target.value)} aria-invalid={!!signUpErrors.license} />
                    {signUpErrors.license && <p className="text-xs text-destructive mt-1">{signUpErrors.license}</p>}
                  </div>
                  <div>
                    <Label htmlFor="signup-license-state">License State (2 letters)</Label>
                    <Input id="signup-license-state" maxLength={2} value={licenseState}
                      onChange={(e) => setLicenseState(e.target.value.toUpperCase())}
                      aria-invalid={!!signUpErrors.licenseState} />
                    {signUpErrors.licenseState && <p className="text-xs text-destructive mt-1">{signUpErrors.licenseState}</p>}
                  </div>
                  <div>
                    <Label htmlFor="signup-brokerage">Brokerage (optional)</Label>
                    <Input id="signup-brokerage" value={brokerage} onChange={(e) => setBrokerage(e.target.value)} />
                  </div>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">{loading ? "Creating..." : "Create Account"}</Button>
              <p className="text-[11px] text-muted-foreground text-center">
                By creating an account you agree to our <Link to="/legal" className="underline hover:text-gold">Terms</Link> and <Link to="/legal" className="underline hover:text-gold">Privacy Policy</Link>.
              </p>
            </form>
          </TabsContent>
        </Tabs>


        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" onClick={google} disabled={googleLoading} className="w-full">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {googleLoading ? "Redirecting..." : currentMode === "signup" ? "Sign up with Google" : "Continue with Google"}
        </Button>


        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-gold">← Back to home</Link>
        </p>
      </Card>
    </div>
  );
}
