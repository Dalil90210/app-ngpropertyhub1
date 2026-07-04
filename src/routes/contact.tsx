import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, MessageCircle, Mail, ArrowLeft, Clock, ShieldCheck, Send, Loader2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be under 100 characters"),
  email: z.string().trim().email("Please enter a valid email").max(255),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message must be under 1000 characters"),
});

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — New Guard Property Hub" },
      { name: "description", content: "Reach New Guard Property Hub via WhatsApp or email. Secure U.S. real estate support across all 50 states." },
      { property: "og:title", content: "Contact — New Guard Property Hub" },
      { property: "og:description", content: "Reach New Guard Property Hub via WhatsApp or email. Secure U.S. real estate support across all 50 states." },
      { property: "og:url", content: "https://app.ngpropertyhub.com/contact" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Contact — New Guard Property Hub" },
      { name: "twitter:description", content: "Reach New Guard Property Hub via WhatsApp or email. Secure U.S. real estate support across all 50 states." },
    ],
    links: [
      { rel: "canonical", href: "https://app.ngpropertyhub.com/contact" },
    ],
    scripts: [{
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact — New Guard Property Hub",
        description: "Reach New Guard Property Hub via WhatsApp or email. Secure U.S. real estate support across all 50 states.",
        url: "https://app.ngpropertyhub.com/contact",
        mainEntity: {
          "@type": "Organization",
          name: "New Guard Property Hub",
          url: "https://app.ngpropertyhub.com",
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: "+1-470-984-8198",
              contactType: "customer support",
              availableLanguage: ["English"],
            },
            {
              "@type": "ContactPoint",
              email: "support@ngpropertyhub.com",
              contactType: "customer support",
              availableLanguage: ["English"],
            },
          ],
        },
      }),
    }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof typeof errors;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form.");
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      // Simulated async submission — opens user's email client as fallback delivery
      await new Promise((r) => setTimeout(r, 800));
      const subject = encodeURIComponent(`Contact from ${result.data.name}`);
      const body = encodeURIComponent(`${result.data.message}\n\n— ${result.data.name} (${result.data.email})`);
      window.location.href = `mailto:support@ngpropertyhub.com?subject=${subject}&body=${body}`;
      setSent(true);
      setForm({ name: "", email: "", message: "" });
      toast.success("Message ready to send — opening your email app.");
    } catch {
      toast.error("Something went wrong. Please try WhatsApp or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

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

        {/* Contact Form */}
        <Card className="max-w-4xl mx-auto mt-8 p-6 md:p-8 border-border">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy">Send Us a Message</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Prefer writing? Fill out the form below and we'll get back to you within 24 hours.
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-emerald-900">Thanks — your message is ready.</div>
                <p className="text-sm text-emerald-800 mt-1">
                  We've opened your email app to deliver it. If nothing happened, email{" "}
                  <a href="mailto:support@ngpropertyhub.com" className="underline font-medium">support@ngpropertyhub.com</a> directly.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-emerald-900 hover:bg-emerald-100"
                  onClick={() => setSent(false)}
                >
                  Send another message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    maxLength={100}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jane Doe"
                    aria-invalid={!!errors.name}
                    disabled={submitting}
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    maxLength={255}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    disabled={submitting}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={form.message}
                  maxLength={1000}
                  rows={5}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help…"
                  aria-invalid={!!errors.message}
                  disabled={submitting}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{errors.message && <span className="text-destructive">{errors.message}</span>}</span>
                  <span>{form.message.length}/1000</span>
                </div>
              </div>
              <Button type="submit" disabled={submitting} className="w-full md:w-auto bg-navy hover:bg-navy/90 text-white">
                {submitting ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Send Message</>
                )}
              </Button>
            </form>
          )}
        </Card>

        {/* Trust bar */}
        <div className="max-w-4xl mx-auto mt-8 rounded-xl gradient-navy text-white p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="font-semibold text-sm">Typical Response Time</div>
              <div className="text-white/90 text-xs">WhatsApp under 5 min · Email within 24 hrs</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold" />
            </div>
            <div>
              <div className="font-semibold text-sm">Encrypted & Verified</div>
              <div className="text-white/90 text-xs">All communications are secured end-to-end.</div>
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
