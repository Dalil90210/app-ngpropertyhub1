import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Upload, X, Loader2 } from "lucide-react";
import {
  propertySchema,
  type PropertyForm,
  IMAGE_ALLOWED_TYPES,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_COUNT,
  IMAGE_SIGNED_URL_TTL,
  validateImageFile,
} from "@/lib/property-schema";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export function PropertyForm({ initial, submitLabel = "Publish Listing", onSubmit }: Props) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState<PropertyForm>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"draft" | "active" | null>(null);

  const set = <K extends keyof PropertyForm>(k: K, v: PropertyForm[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const validate = (): PropertyForm | null => {
    const result = propertySchema.safeParse({
      ...f,
      image_url: f.image_url || DEFAULT_IMAGE,
    });
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      toast.error("Please fix the highlighted fields");
      // jump to first step containing an error
      const step1 = ["title","property_type","address","city","state","zip","price","bedrooms","bathrooms","sqft"];
      const step2 = ["description","features"];
      const step3 = ["image_url"];
      const firstKey = Object.keys(map)[0];
      if (step1.includes(firstKey)) setStep(1);
      else if (step2.includes(firstKey)) setStep(2);
      else if (step3.includes(firstKey)) setStep(3);
      return null;
    }
    setErrors({});
    return result.data;
  };

  const handleSubmit = async (status: "draft" | "active") => {
    const values = validate();
    if (!values) return;
    setBusy(status);
    try {
      await onSubmit(values, status);
    } finally {
      setBusy(null);
    }
  };

  const err = (k: string) =>
    errors[k] ? <p className="text-xs text-destructive mt-1">{errors[k]}</p> : null;

  return (
    <>
      <Progress value={(step / 4) * 100} className="mb-6" />
      <Card className="p-6">
        {step === 1 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Property details</h2>
            <div>
              <Label>Title</Label>
              <Input value={f.title} onChange={(e) => set("title", e.target.value)} />
              {err("title")}
            </div>
            <div>
              <Label>Type</Label>
              <select
                className="w-full h-10 rounded-md border bg-background px-3 text-sm"
                value={f.property_type}
                onChange={(e) => set("property_type", e.target.value as PropertyForm["property_type"])}
              >
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="land">Land</option>
                <option value="multi">Multi-Family</option>
              </select>
            </div>
            <div>
              <Label>Address</Label>
              <Input value={f.address} onChange={(e) => set("address", e.target.value)} />
              {err("address")}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>City</Label>
                <Input value={f.city} onChange={(e) => set("city", e.target.value)} />
                {err("city")}
              </div>
              <div>
                <Label>State</Label>
                <Input maxLength={2} value={f.state} onChange={(e) => set("state", e.target.value)} />
                {err("state")}
              </div>
              <div>
                <Label>ZIP</Label>
                <Input value={f.zip} onChange={(e) => set("zip", e.target.value)} />
                {err("zip")}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <Label>Price</Label>
                <Input type="number" value={f.price || ""} onChange={(e) => set("price", Number(e.target.value))} />
                {err("price")}
              </div>
              <div>
                <Label>Beds</Label>
                <Input type="number" value={f.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} />
                {err("bedrooms")}
              </div>
              <div>
                <Label>Baths</Label>
                <Input type="number" step="0.5" value={f.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} />
                {err("bathrooms")}
              </div>
              <div>
                <Label>SqFt</Label>
                <Input type="number" value={f.sqft} onChange={(e) => set("sqft", Number(e.target.value))} />
                {err("sqft")}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Description & features</h2>
            <div>
              <Label>Description</Label>
              <Textarea rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} />
              {err("description")}
            </div>
            <div>
              <Label>Features (comma-separated)</Label>
              <Input
                value={f.features}
                onChange={(e) => set("features", e.target.value)}
                placeholder="Pool, Garage, Solar"
              />
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">Cover photo</h2>
            <p className="text-sm text-muted-foreground">
              Paste an image URL. A default cover is used if left blank.
            </p>
            <div>
              <Label>Image URL</Label>
              <Input
                value={f.image_url}
                onChange={(e) => set("image_url", e.target.value)}
                placeholder="https://..."
              />
              {err("image_url")}
            </div>
            {(f.image_url || DEFAULT_IMAGE) && (
              <img
                src={f.image_url || DEFAULT_IMAGE}
                alt="Cover preview"
                className="w-full h-56 object-cover rounded-md border"
              />
            )}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-2">
            <h2 className="font-semibold text-lg">Review</h2>
            <p><strong>{f.title || "(untitled)"}</strong> — ${Number(f.price || 0).toLocaleString()}</p>
            <p>{f.address}, {f.city}, {f.state} {f.zip}</p>
            <p>{f.bedrooms} bd · {f.bathrooms} ba · {f.sqft} sqft · {f.property_type}</p>
            <p className="text-sm text-muted-foreground">
              Save as draft to keep working, or publish to send for verification.
            </p>
          </div>
        )}

        <div className="flex justify-between mt-6 gap-2 flex-wrap">
          <Button variant="outline" disabled={step === 1 || !!busy} onClick={() => setStep(step - 1)}>
            Back
          </Button>
          <div className="flex gap-2 ml-auto">
            {step < 4 ? (
              <Button className="bg-navy" disabled={!!busy} onClick={() => setStep(step + 1)}>
                Next
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  disabled={!!busy}
                  onClick={() => handleSubmit("draft")}
                >
                  {busy === "draft" ? "Saving..." : "Save Draft"}
                </Button>
                <Button
                  className="bg-gold text-navy hover:bg-gold/90 font-semibold"
                  disabled={!!busy}
                  onClick={() => handleSubmit("active")}
                >
                  {busy === "active" ? "Publishing..." : submitLabel}
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
