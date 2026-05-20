import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/list-property")({ component: Page });

function Page() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [f, setF] = useState({
    title: "", description: "", price: "", address: "", city: "", state: "", zip: "",
    bedrooms: "", bathrooms: "", sqft: "", property_type: "house", features: "",
  });

  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [loading, user, nav]);

  const set = (k: string, v: string) => setF({ ...f, [k]: v });

  const submit = async () => {
    if (!user) return;
    const { error } = await supabase.from("properties").insert({
      title: f.title, description: f.description, price: Number(f.price), address: f.address,
      city: f.city, state: f.state.toUpperCase(), zip: f.zip,
      bedrooms: Number(f.bedrooms) || 0, bathrooms: Number(f.bathrooms) || 0, sqft: Number(f.sqft) || 0,
      property_type: f.property_type, agent_id: user.id, verified: false,
      features: f.features.split(",").map((x) => x.trim()).filter(Boolean),
      images: [`https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200`],
    });
    if (error) return toast.error(error.message);
    toast.success("Listing submitted!");
    nav({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl font-bold text-navy mb-2">List Your Property</h1>
      <Progress value={(step / 5) * 100} className="mb-6" />

      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Property details</h2>
            <div><Label>Title</Label><Input value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
            <div><Label>Type</Label>
              <select className="w-full h-10 rounded-md border bg-background px-3 text-sm" value={f.property_type} onChange={(e) => set("property_type", e.target.value)}>
                <option value="house">House</option><option value="condo">Condo</option><option value="townhouse">Townhouse</option><option value="land">Land</option><option value="multi">Multi-Family</option>
              </select>
            </div>
            <div><Label>Address</Label><Input value={f.address} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>City</Label><Input value={f.city} onChange={(e) => set("city", e.target.value)} /></div>
              <div><Label>State</Label><Input maxLength={2} value={f.state} onChange={(e) => set("state", e.target.value)} /></div>
              <div><Label>ZIP</Label><Input value={f.zip} onChange={(e) => set("zip", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div><Label>Price</Label><Input type="number" value={f.price} onChange={(e) => set("price", e.target.value)} /></div>
              <div><Label>Beds</Label><Input type="number" value={f.bedrooms} onChange={(e) => set("bedrooms", e.target.value)} /></div>
              <div><Label>Baths</Label><Input type="number" step="0.5" value={f.bathrooms} onChange={(e) => set("bathrooms", e.target.value)} /></div>
              <div><Label>SqFt</Label><Input type="number" value={f.sqft} onChange={(e) => set("sqft", e.target.value)} /></div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Description & features</h2>
            <div><Label>Description</Label><Textarea rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
            <div><Label>Features (comma-separated)</Label><Input value={f.features} onChange={(e) => set("features", e.target.value)} placeholder="Pool, Garage, Solar" /></div>
          </div>
        )}
        {step === 3 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Photo upload — coming soon. A default cover image will be used.</p>
          </div>
        )}
        {step === 4 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Verification documents will be requested after submission.</p>
          </div>
        )}
        {step === 5 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Review</h2>
            <p><strong>{f.title}</strong> — ${Number(f.price).toLocaleString()}</p>
            <p>{f.address}, {f.city}, {f.state} {f.zip}</p>
            <p>{f.bedrooms} bd · {f.bathrooms} ba · {f.sqft} sqft</p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" disabled={step === 1} onClick={() => setStep(step - 1)}>Back</Button>
          {step < 5
            ? <Button className="bg-navy" onClick={() => setStep(step + 1)}>Next</Button>
            : <Button className="bg-gold text-navy hover:bg-gold/90 font-semibold" onClick={submit}>Submit Listing</Button>}
        </div>
      </Card>
    </div>
  );
}
