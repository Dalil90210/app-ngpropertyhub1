import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const links = [
  { to: "/properties", label: "Properties" },
  { to: "/agents", label: "Agents" },
  { to: "/saved", label: "Saved" },
  { to: "/ng-estimate", label: "AI Valuation" },
];


export function Navbar() {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy text-white border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold" aria-label="New Guard Property Hub — home">
          <img src="/brand-logo.png" alt="New Guard Property Hub" className="w-10 h-10 rounded-lg object-cover" width={40} height={40} />
          <span className="text-base tracking-tight hidden sm:inline">New Guard Property Hub</span>
          <span className="text-base tracking-tight sm:hidden">New Guard</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm text-white/80 hover:text-gold transition-colors"
              activeProps={{ className: "text-gold" }}>
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <>
              {role && <Badge className="bg-gold text-navy hover:bg-gold capitalize">{role}</Badge>}
              <Link to="/dashboard"><Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Dashboard</Button></Link>
              <Link to="/settings">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
                  {(user.email?.[0] || "U").toUpperCase()}
                </div>
              </Link>
            </>
          ) : (
            <Link to="/auth"><Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white">Sign In</Button></Link>
          )}
        </div>

        <button className="lg:hidden text-white" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-navy-deep">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                className="py-3 px-2 text-white/80 hover:text-gold rounded-md">
                {l.label}
              </Link>
            ))}
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full mt-2 bg-gold text-navy hover:bg-gold/90">Dashboard</Button>
              </Link>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button className="w-full mt-2 bg-gold text-navy hover:bg-gold/90 font-semibold">Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
