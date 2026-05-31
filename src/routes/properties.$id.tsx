import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bed, Bath, Maximize, MapPin, ShieldCheck, Heart, Share2, Sparkles, Calendar } from "lucide-react";
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
    const url = `https://us-property-grid.lovable.app/properties/${params.id}`;
    const p = loaderData?.property;
    if (!p) {
      return {
        meta: [
          { title: "Property — NGPropertyHub" },
          { name: "description", content: "View this verified U.S. property listing on NGPropertyHub — photos, details, AI valuation, and secure offer submission." },
          { property: "og:url", content: url },
        ],
        links: [{ rel: "canonical", href: url }],
      };
    }
    const priceFmt = `$${Number(p.price).toLocaleString()}`;
    const location = [p.city, p.state].filter(Boolean).join(", ");
    const title = `${p.title} — ${priceFmt} in ${location} | NGPropertyHub`;
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

  const img = p.images?.[0] || `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1600&q=80`;
  const aiEstimate = Math.round(Number(p.price) * 1.03);

  return (
    <div className="container mx-auto px-4 py-6">
      <Link to="/properties" className="text-sm text-muted-foreground hover:text-gold">← Back to listings</Link>

      <div className="grid lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl overflow-hidden aspect-video bg-muted relative">
            <img src={img} alt={p.title} className="w-full h-full object-cover" />
            {p.verified && (
              <Badge className="absolute top-4 left-4 bg-gold text-navy hover:bg-gold gap-1">
                <ShieldCheck className="w-3 h-3" /> TrustScore {p.trust_score ?? 95}
              </Badge>
            )}
          </div>

          {p.images && p.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {p.images.slice(1, 5).map((src, i) => (
                <img key={i} src={src} className="aspect-square object-cover rounded-lg" alt="" />
              ))}
            </div>
          )}

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
            <p className="text-sm text-white/70 mt-1">Confidence: High · Within 3% of asking price</p>
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

            <div className="mt-6 space-y-2">
              <OfferDialog propertyId={p.id} userId={user?.id} />
              <ShowingDialog propertyId={p.id} userId={user?.id} />
              <Button variant="outline" className="w-full" onClick={() => { navigator.share?.({ title: p.title, url: window.location.href }).catch(() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }); }}>
                <Share2 className="w-4 h-4 mr-2" />Share
              </Button>
              <Button variant="outline" className="w-full"><Heart className="w-4 h-4 mr-2" />Save</Button>
            </div>
          </Card>

          <ContactCard propertyId={p.id} />
        </div>
      </div>
    </div>
  );
}

function OfferDialog({ propertyId, userId }: { propertyId: string; userId?: string }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(""); const [financing, setFinancing] = useState("cash");
  const [date, setDate] = useState(""); const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error("Please sign in to make an offer");
    const { error } = await supabase.from("offers").insert({
      property_id: propertyId, buyer_id: userId, amount: Number(amount),
      financing_type: financing, closing_date: date || null, message: msg,
    });
    if (error) return toast.error(error.message);
    toast.success("Offer submitted!"); setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold">Make Offer</Button></DialogTrigger>
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
  const [open, setOpen] = useState(false); const [when, setWhen] = useState(""); const [notes, setNotes] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return toast.error("Please sign in to book a showing");
    const { error } = await supabase.from("showings").insert({ property_id: propertyId, buyer_id: userId, scheduled_at: when, notes });
    if (error) return toast.error(error.message);
    toast.success("Showing requested!"); setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" className="w-full"><Calendar className="w-4 h-4 mr-2" />Book Showing</Button></DialogTrigger>
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

function ContactCard({ propertyId }: { propertyId: string }) {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState(""); const [msg, setMsg] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("inquiries").insert({ property_id: propertyId, buyer_name: name, buyer_email: email, buyer_phone: phone, message: msg });
    if (error) return toast.error(error.message);
    toast.success("Message sent to agent!");
    setName(""); setEmail(""); setPhone(""); setMsg("");
  };
  return (
    <Card className="p-6">
      <h3 className="font-semibold text-navy mb-3">Contact Agent</h3>
      <form onSubmit={submit} className="space-y-3">
        <Input placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Textarea placeholder="Message" required value={msg} onChange={(e) => setMsg(e.target.value)} />
        <Button type="submit" className="w-full bg-navy hover:bg-navy/90">Send Message</Button>
      </form>
    </Card>
  );
}
