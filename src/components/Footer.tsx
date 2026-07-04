import { Link } from "@tanstack/react-router";
import { Home, ShieldCheck, Lock, BadgeCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-navy-deep text-white/90 mt-16 pb-20 lg:pb-8">
      <div className="container mx-auto px-4 py-12 grid md:grid-cols-5 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 text-white mb-3">
            <div className="w-8 h-8 rounded-md gradient-gold flex items-center justify-center text-navy"><Home className="w-4 h-4" /></div>
            <span className="font-bold">New Guard Property Hub</span>
          </div>
          <p className="text-sm max-w-sm">The #1 U.S. Real Estate Platform — verified listings, smart escrow, and AI valuations across all 50 states.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded"><Lock className="w-3 h-3 text-gold" />SECURE ESCROW</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded"><BadgeCheck className="w-3 h-3 text-gold" />VERIFIED</span>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/80 bg-white/5 border border-white/10 px-2.5 py-1 rounded"><ShieldCheck className="w-3 h-3 text-gold" />50 STATES</span>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/properties" className="hover:text-gold">Properties</Link></li>
            <li><Link to="/agents" className="hover:text-gold">Agents</Link></li>
            <li><Link to="/invest" className="hover:text-gold">Invest</Link></li>
            <li><Link to="/ng-estimate" className="hover:text-gold">AI Valuation</Link></li>
            <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Trust & Security</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/trust" className="hover:text-gold">Trust & Security</Link></li>
            <li><Link to="/verify" className="hover:text-gold">Verify</Link></li>
            <li><Link to="/escrow" className="hover:text-gold">Smart Escrow</Link></li>
            <li><Link to="/crypto" className="hover:text-gold">Crypto Payments</Link></li>
            <li><Link to="/legal" className="hover:text-gold">Legal Engine</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/legal" className="hover:text-gold">Terms of Service</Link></li>
            <li><Link to="/legal" className="hover:text-gold">Privacy Policy</Link></li>
            <li><Link to="/legal" className="hover:text-gold">Cookie Policy</Link></li>
            <li><Link to="/legal" className="hover:text-gold">Fair Housing</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 px-4 text-center text-xs">
        © {new Date().getFullYear()} New Guard Property Hub. All rights reserved. Equal Housing Opportunity. Licensed across all 50 U.S. states.
      </div>
    </footer>
  );
}

