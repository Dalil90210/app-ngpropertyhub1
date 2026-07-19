import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { getAuthenticatedDestination } from "@/lib/auth-redirect";

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
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    goNext();
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: `${window.location.origin}${dest ?? "/role-select"}`,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    if (data.session) {
      toast.success("Account created!");
      goNext();
      return;
    }
    toast.success("Account created! Check your email to verify.");
  };

  const google = async () => {
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
      toast.error(`Google ${currentMode} failed: ${error.message}`);
      return;
    }
    if (data?.url) {
      window.location.assign(data.url);
      return;
    }
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
            <TabsTrigger
              value="signin"
              onClick={() =>
                nav({ to: "/auth", search: { next, mode: "signin" } })
              }
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              onClick={() =>
                nav({ to: "/auth", search: { next, mode: "signup" } })
              }
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={signIn} className="space-y-4 mt-4">
              <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">{loading ? "Signing in..." : "Sign In"}</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-4 mt-4">
              <div><Label>Full Name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
              <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">{loading ? "Creating..." : "Create Account"}</Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>

        <Button variant="outline" onClick={google} className="w-full">
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {currentMode === "signup" ? "Sign up with Google" : "Continue with Google"}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-gold">← Back to home</Link>
        </p>
      </Card>
    </div>
  );
}
