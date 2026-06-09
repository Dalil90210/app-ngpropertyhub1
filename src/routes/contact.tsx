import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Phone, MessageCircle, Mail, ArrowLeft, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — New Guard Property Hub" },
      { name: "description", content: "Reach New Guard Property Hub via WhatsApp or email. Secure U.S. real estate support across all 50 states." },
      { property: "og:title", content: "Contact — New Guard Property Hub" },
      { property: "og:description", content: "Reach New Guard Property Hub via WhatsApp or email. Secure U.S. real estate support across all 50 states." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative gradient-navy text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_70%_30%,white,transparent_40%)]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs mb-6">
              <ShieldCheck className="w-3 h-3 text-gold" /> 24/7 Secure Support
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
              We’re Here to Help — <span className="text-gold">Anytime</span>.
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/80 max-w-xl mx-auto">
              Reach our U.S. support team via WhatsApp for instant answers on listings, escrow, and AI valuations.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="container mx-auto px-4 py-12 md:py-16 -mt-8 relative z-10">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-5">
          {/* WhatsApp Card */}
          <Card className="p-7 border-border hover:shadow-elegant transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-xl text-navy">WhatsApp</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Fastest response. Chat with our team for listings, escrow questions, and platform help.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Phone className="w-4 h-4 text-gold" />
              <span className="text-lg font-semibold text-navy tracking-wide">+1 470 984 8198</span>
            </div>
            <a
              href="https://wa.me/14709848198"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center justify-center gap-2 w-full h-10 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Open WhatsApp Chat
            </a>
          </Card>

          {/* Email Card */}
          <Card className="p-7 border-border hover:shadow-elegant transition-all">
            <div className="w-12 h-12 rounded-xl bg-navy/5 text-navy flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-xl text-navy">Email Support</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              For legal docs, account issues, or detailed inquiries — we reply within 24 hours.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <Mail className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-navy">support@ngpropertyhub.com</span>
            </div>
            <a
              href="mailto:support@ngpropertyhub.com"
              className="mt-5 inline-flex items-center justify-center gap-2 w-full h-10 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              Send Email
            </a>
          </Card>
        </div>

        {/* Trust bar */}
        <div className="max-w-4xl mx-auto mt-8 rounded-xl gradient-navy text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="font-semibold text-sm">Typical Response Time</div>
              <div className="text-white/70 text-xs">WhatsApp under 5 min · Email within 24 hrs</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="font-semibold text-sm">Encrypted & Verified</div>
              <div className="text-white/70 text-xs">All communications are secured end-to-end.</div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-6 text-center">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-navy">
              <ArrowLeft className="mr-2 w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
