import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin-login")({ component: AdminLogin });

function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const emailVal = String(fd.get("email") ?? email).trim();
    const passwordVal = String(fd.get("password") ?? password);
    if (!emailVal || !passwordVal) return toast.error("Enter email and password");
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailVal, password: passwordVal });
    if (error || !data.user) { setLoading(false); return toast.error("Invalid credentials"); }
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    const isAdmin = roles?.some((r) => r.role === "admin");
    setLoading(false);
    if (!isAdmin) { await supabase.auth.signOut(); return toast.error("Not an admin account"); }
    toast.success("Welcome, admin");
    nav({ to: "/admin" });
  };

  return (
    <div className="min-h-screen bg-navy-deep flex items-center justify-center px-4">
      <Card className="w-full max-w-sm p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-lg gradient-gold mx-auto flex items-center justify-center text-navy"><Lock className="w-6 h-6" /></div>
          <h1 className="text-2xl font-bold mt-3 text-navy">Admin Console</h1>
          <p className="text-sm text-muted-foreground">Restricted access</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div><Label htmlFor="admin-email">Email</Label><Input id="admin-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label htmlFor="admin-password">Password</Label><Input id="admin-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" disabled={loading} className="w-full bg-navy">{loading ? "Verifying..." : "Sign In"}</Button>
        </form>
      </Card>
    </div>
  );
}
