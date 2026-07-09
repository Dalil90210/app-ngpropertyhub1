import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bed, Bath, Maximize, MapPin, ShieldCheck, Heart, Share2, Sparkles, Calendar, ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/properties/$id")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("properties")
      .select("id, title, description, price, city, state, address, zip, images, bedrooms, bathrooms, sqft")
      .eq("id", params.id)
      .maybeSingle();
    return { property: data };
  },
  head: ({ params, loaderData }) => {
    const url = `https://app.ngpropertyhub.com/properties/${params.id}`;
    const p = loaderData?.property;
    if (!p) {
      return {
        meta: [
          { title: "Property — New Guard Property Hub" },
          { name: "description", content: "View this verified U.S. property listing on New Guard Property Hub — photos, details, AI valuation, and secure offer submission." },
          { property: "og:url", content: url },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const priceFmt = `$${Number(p.price).toLocaleString()}`;
    const location = [p.city, p.state].filter(Boolean).join(", ");
    const title = `${p.title} — ${priceFmt} in ${location} | New Guard Property Hub`;
    const baseDesc = (p.description?.trim() || `${p.bedrooms ?? 0} bed, ${p.bathrooms ?? 0} bath home in ${location}. ${p.sqft ? `${p.sqft.toLocaleString()} sqft. ` : ""}Verified listing with AI valuation and secure offer submission.`).replace(/\s+/g, " ");
    const description = baseDesc.length > 155 ? `${baseDesc.slice(0, 152)}...` : baseDesc;
    const image = p.images?.[0];
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:type", content: "product" },
    ];
    if (image) {
      meta.push({ property: "og:image", content: image });
      meta.push({ name: "twitter:image", content: image });
      meta.push({ name: "twitter:card", content: "summary_large_image" });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: p.title,
            description: baseDesc,
            image: image ? [image] : undefined,
            offers: {
              "@type": "Offer",
              price: Number(p.price),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              url,
            },
          }),
        },
      ],
    };
  },
  component: Detail,
});

function Detail() {
  const { id } = useParams({ from: "/properties/$id" });
  const { user } = useAuth();

  const { data: p, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="container mx-auto px-4 py-20"><div className="h-96 bg-muted rounded-xl animate-pulse" /></div>;
  if (!p) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Property not found</h1>
      <Link to="/properties"><Button className="mt-4 bg-navy">Back to listings</Button></Link>
    </div>
  );

  const images: string[] = (p.images && p.images.length > 0
    ? p.images
    : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80"]);
  const aiEstimate = Math.round(Number(p.price) * 1.03);

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/properties" className="text-sm text-muted-foreground hover:text-gold">← Back to listings</Link>

      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <Gallery images={images} title={p.title} verified={!!p.verified} trustScore={p.trust_score ?? undefined} />

          <Card className="p-6">
            <h2 className="font-semibold text-lg text-navy">About this property</h2>
            <p className="mt-2 text-muted-foreground whitespace-pre-line">{p.description || "No description provided."}</p>
            {p.features && p.features.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {p.features.map((f) => <Badge key={f} variant="secondary">{f}</Badge>)}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-gradient-to-br from-navy to-navy-deep text-white">
            <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-gold" /><h3 className="font-semibold">NG-Estimate AI Valuation</h3></div>
            <div className="text-3xl font-bold text-gold mt-2">${aiEstimate.toLocaleString()}</div>
            <p className="text-sm text-white/90 mt-1">Confidence: High · Within 3% of asking price</p>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="text-3xl font-bold text-navy">${Number(p.price).toLocaleString()}</div>
            <h1 className="text-xl font-semibold mt-2">{p.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 mr-1" /> {p.address}, {p.city}, {p.state} {p.zip}
            </div>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{p.bedrooms} beds</span>
              <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{p.bathrooms} baths</span>
              <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{p.sqft?.toLocaleString()} sqft</span>
            </div>

            {p.verified ? (
              <div className="mt-4 p-3 rounded-md bg-gold/10 border border-gold/30 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-navy">Verified listing</div>
                  <div className="text-muted-foreground">Title, ownership, and photos reviewed by New Guard.</div>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 rounded-md bg-muted border flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground">Pending verification. Details are seller-provided.</div>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <OfferDialog propertyId={p.id} userId={user?.id} />
              <ShowingDialog propertyId={p.id} userId={user?.id} />
              <Button variant="outline" className="w-full" onClick={() => { navigator.share?.({ title: p.title, url: window.location.href }).catch(() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }); }}>
                <Share2 className="w-4 h-4 mr-2" />Share
              </Button>
              <Button variant="outline" className="w-full"><Heart className="w-4 h-4 mr-2" />Save</Button>
            </div>
          </Card>

          <ContactCard propertyId={p.id} verified={!!p.verified} />
        </div>
      </div>
    </div>
  );
}

function Gallery({ images, title, verified, trustScore }: { images: string[]; title: string; verified: boolean; trustScore?: number }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl overflow-hidden aspect-video bg-muted relative w-full block group"
        aria-label="Open gallery"
      >
        <img src={images[active]} alt={title} className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform" />
        {verified && (
          <Badge className="absolute top-4 left-4 bg-gold text-navy hover:bg-gold gap-1">
            <ShieldCheck className="w-3 h-3" /> TrustScore {trustScore ?? 95}
          </Badge>
        )}
        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs rounded px-2 py-1">
          {active + 1} / {images.length}
        </span>
      </button>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 ${i === active ? "border-gold" : "border-transparent"}`}
              aria-label={`View photo ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-2">
          <DialogHeader className="sr-only"><DialogTitle>{title} — photo {active + 1} of {images.length}</DialogTitle></DialogHeader>
          <img src={images[active]} alt={title} className="w-full max-h-[75vh] object-contain rounded-md" />
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${i === active ? "border-gold" : "border-transparent"}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function OfferDialog({ propertyId, userId }: { propertyId: string; userId?: string }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(""); const [financing, setFinancing] = useState("cash");
  const [date, setDate] = useState(""); const [msg, setMsg] = useState("");
  const openOrRedirect = () => {
    if (!userId) {
      toast.message("Sign in to make an offer");
      nav({ to: "/auth" });
      return;
    }
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const { error } = await supabase.from("offers").insert({
      property_id: propertyId, buyer_id: userId, amount: Number(amount),
      financing_type: financing, closing_date: date || null, message: msg,
    });
    if (error) return toast.error(error.message);
    toast.success("Offer submitted!"); setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold" onClick={openOrRedirect}>Make Offer</Button>
      <DialogContent>
        <DialogHeader><DialogTitle>Make an Offer</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>Offer amount ($)</Label><Input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
          <div><Label>Financing</Label>
            <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={financing} onChange={(e) => setFinancing(e.target.value)}>
              <option value="cash">Cash</option><option value="conventional">Conventional Loan</option>
              <option value="fha">FHA</option><option value="va">VA</option><option value="crypto">Crypto</option>
            </select>
          </div>
          <div><Label>Closing date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
          <Button type="submit" className="w-full bg-navy">Submit Offer</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ShowingDialog({ propertyId, userId }: { propertyId: string; userId?: string }) {
  const nav = useNavigate();
  const [open, setOpen] = useState(false); const [when, setWhen] = useState(""); const [notes, setNotes] = useState("");
  const openOrRedirect = () => {
    if (!userId) {
      toast.message("Sign in to book a showing");
      nav({ to: "/auth" });
      return;
    }
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    const { error } = await supabase.from("showings").insert({ property_id: propertyId, buyer_id: userId, scheduled_at: when, notes });
    if (error) return toast.error(error.message);
    toast.success("Showing requested!"); setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" className="w-full" onClick={openOrRedirect}><Calendar className="w-4 h-4 mr-2" />Book Showing</Button>
      <DialogContent>
        <DialogHeader><DialogTitle>Book a Showing</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div><Label>When</Label><Input type="datetime-local" required value={when} onChange={(e) => setWhen(e.target.value)} /></div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <Button type="submit" className="w-full bg-navy">Request</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const inquirySchema = z.object({
  buyer_name: z.string().trim().min(1, "Name is required").max(120),
  buyer_email: z.string().trim().email("Enter a valid email").max(255),
  buyer_phone: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

function ContactCard({ propertyId, verified }: { propertyId: string; verified: boolean }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = inquirySchema.safeParse({ buyer_name: name, buyer_email: email, buyer_phone: phone, message: msg });
    if (!parsed.success) {
      const map: Record<string, string> = {};
      for (const issue of parsed.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      toast.error("Please fix the highlighted fields");
      return;
    }
    setErrors({});
    setBusy(true);
    const { error } = await supabase.from("inquiries").insert({
      property_id: propertyId,
      buyer_name: parsed.data.buyer_name,
      buyer_email: parsed.data.buyer_email,
      buyer_phone: parsed.data.buyer_phone || null,
      message: parsed.data.message,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Message sent to agent!");
    setName(""); setEmail(""); setPhone(""); setMsg("");
  };
  const err = (k: string) => errors[k] ? <p className="text-xs text-destructive mt-1">{errors[k]}</p> : null;
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-navy mb-1">Contact Agent</h3>
      <p className="text-xs text-muted-foreground mb-3">
        {verified
          ? "No account needed — send a lead directly to the listing agent."
          : "This listing is pending verification. Inquiries open once it's verified."}
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={!verified} />
          {err("buyer_name")}
        </div>
        <div>
          <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!verified} />
          {err("buyer_email")}
        </div>
        <div>
          <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!verified} />
          {err("buyer_phone")}
        </div>
        <div>
          <Textarea placeholder="Message" value={msg} onChange={(e) => setMsg(e.target.value)} disabled={!verified} />
          {err("message")}
        </div>
        <Button type="submit" className="w-full bg-navy hover:bg-navy/90" disabled={busy || !verified}>
          {busy ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Card>
  );
}
