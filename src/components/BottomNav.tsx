import { Link, useLocation } from "@tanstack/react-router";
import { Home, Building2, TrendingUp, Inbox, Settings } from "lucide-react";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/invest", label: "Invest", icon: TrendingUp },
  { to: "/inbox", label: "Inbox", icon: Inbox },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-navy border-t border-white/10 text-white">
      <div className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = pathname === t.to;
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to} className="flex flex-col items-center py-2.5 gap-0.5">
              <Icon className={`w-5 h-5 ${active ? "text-gold" : "text-white/70"}`} />
              <span className={`text-[10px] ${active ? "text-gold font-semibold" : "text-white/70"}`}>{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
