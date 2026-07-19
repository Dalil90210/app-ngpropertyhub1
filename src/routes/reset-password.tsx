import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Home, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset password — New Guard Property Hub" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"request" | "update">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    if (hash.get("type") === "recovery" || hash.get("access_token")) {
      setMode("update");
    }
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setMode("update");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const request = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Check your email for a reset link.");
  };

  const update = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're signed in.");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-8 bg-card">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center text-navy"><Home className="w-5 h-5" /></div>
          <span className="font-bold text-navy">New Guard Property Hub</span>
        </Link>

        <h1 className="text-xl font-bold text-navy mb-1">
          {mode === "request" ? "Reset your password" : "Set a new password"}
        </h1>
        <p className="text-sm text-muted-foreground mb-5">
          {mode === "request"
            ? "Enter your email and we'll send you a secure reset link."
            : "Choose a new password to complete the reset."}
        </p>

        {mode === "request" ? (
          <form onSubmit={request} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">
              {loading ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        ) : (
          <form onSubmit={update} className="space-y-4">
            <div>
              <Label>New password</Label>
              <div className="relative">
                <Input type={show ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" aria-label="Toggle password visibility"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm password</Label>
              <Input type={show ? "text" : "password"} required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-navy hover:bg-navy/90">
              {loading ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/auth" className="hover:text-gold">← Back to sign in</Link>
        </p>
      </Card>
    </div>
  );
}
