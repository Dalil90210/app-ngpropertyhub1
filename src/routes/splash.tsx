import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Home, Building2, Briefcase, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/splash")({ component: Splash });

const roles = [
  { key: "buyer", label: "Buyer", desc: "Browse verified homes", icon: Home, bg: "bg-info/10", color: "text-info" },
  { key: "seller", label: "Seller", desc: "List your property", icon: Building2, bg: "bg-gold/10", color: "text-gold" },
  { key: "agent", label: "Agent", desc: "Manage listings", icon: Briefcase, bg: "bg-purple-role/10", color: "text-purple-role" },
  { key: "investor", label: "Investor", desc: "Invest from $100", icon: TrendingUp, bg: "bg-success/10", color: "text-success" },
];

function Splash() {
  const nav = useNavigate();
  return (
    <div className="min-h-screen bg-navy text-white flex flex-col px-6 py-10">
      <div className="text-center mt-4">
        <div className="w-20 h-20 mx-auto rounded-2xl gradient-gold flex items-center justify-center text-navy shadow-gold">
          <Home className="w-10 h-10" />
        </div>
        <h1 className="mt-5 text-3xl font-bold">New Guard Property Hub</h1>
        <p className="mt-1 text-white/90">The #1 U.S. Real Estate Platform</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-10 max-w-md mx-auto w-full">
        {roles.map((r) => (
          <button key={r.key}
            onClick={() => nav({ to: "/auth", search: { mode: "signup", next: `/role-select?role=${r.key}` } })}
            className="rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-5 text-left transition-all">
            <div className={`w-11 h-11 rounded-xl ${r.bg} ${r.color} flex items-center justify-center mb-3`}>
              <r.icon className="w-5 h-5" />
            </div>
            <div className="font-semibold">{r.label}</div>
            <div className="text-xs text-white/85 mt-0.5">{r.desc}</div>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-10 max-w-md mx-auto w-full">
        <Link to="/auth">
          <Button size="lg" className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold h-12">
            Sign In or Create Account <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
        <Link to="/" className="block text-center text-sm text-white/90 mt-4 hover:text-gold">
          Browse as guest →
        </Link>
      </div>
    </div>
  );
}
