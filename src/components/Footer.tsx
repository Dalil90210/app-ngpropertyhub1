import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white/70 mt-16 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white mb-3">
            <div className="w-8 h-8 rounded-md gradient-gold flex items-center justify-center text-navy"><Home className="w-4 h-4" /></div>
            <span className="font-bold">NGPropertyHub</span>
          </div>
          <p className="text-sm">The #1 U.S. Real Estate Platform — secure, verified, intelligent.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/properties" className="hover:text-gold">Properties</Link></li>
            <li><Link to="/agents" className="hover:text-gold">Agents</Link></li>
            <li><Link to="/invest" className="hover:text-gold">Invest</Link></li>
            <li><Link to="/ng-estimate" className="hover:text-gold">AI Valuation</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Trust & Security</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/verify" className="hover:text-gold">Verify</Link></li>
            <li><Link to="/escrow" className="hover:text-gold">Smart Escrow</Link></li>
            <li><Link to="/crypto" className="hover:text-gold">Crypto Payments</Link></li>
            <li><Link to="/legal" className="hover:text-gold">Legal Engine</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/auth" className="hover:text-gold">Sign In</Link></li>
            <li><Link to="/list-property" className="hover:text-gold">List Property</Link></li>
            <li><Link to="/dashboard" className="hover:text-gold">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs">
        © {new Date().getFullYear()} New Guard Property Hub. All 50 states, all secure.
      </div>
    </footer>
  );
}
