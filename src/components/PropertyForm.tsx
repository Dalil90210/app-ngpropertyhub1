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

type Props = {
  initial: PropertyForm;
  submitLabel?: string;
  onSubmit: (values: PropertyForm, status: "draft" | "active") => Promise<void>;
};

type ImageItem = { url: string; path: string };

export function PropertyForm({ initial, submitLabel = "Publish Listing", onSubmit }: Props) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [f, setF] = useState<PropertyForm>(initial);
  const [images, setImages] = useState<ImageItem[]>(
    (initial.images ?? []).map((url) => ({ url, path: "" })),
  );
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"draft" | "active" | null>(null);

  const set = <K extends keyof PropertyForm>(k: K, v: PropertyForm[K]) => {
    setF((prev) => ({ ...prev, [k]: v }));
    if (errors[k as string]) setErrors((e) => ({ ...e, [k as string]: "" }));
  };

  const validate = (): PropertyForm | null => {
    const result = propertySchema.safeParse({ ...f, images: images.map((i) => i.url) });
    if (!result.success) {
      const map: Record<string, string> = {};
      for (const issue of result.error.issues) map[issue.path[0] as string] = issue.message;
      setErrors(map);
      toast.error("Please fix the highlighted fields");
      const step1 = ["title", "property_type", "address", "city", "state", "zip", "price", "bedrooms", "bathrooms", "sqft"];
      const step2 = ["description", "features"];
      const step3 = ["images"];
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

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!user) {
      toast.error("Please sign in to upload images");
      return;
    }
    const slots = IMAGE_MAX_COUNT - images.length;
    if (slots <= 0) {
      toast.error(`Up to ${IMAGE_MAX_COUNT} images per listing`);
      return;
    }
    const list = Array.from(files).slice(0, slots);
    setUploading(true);
    const added: ImageItem[] = [];
    for (const file of list) {
      const bad = validateImageFile(file);
      if (bad) { toast.error(bad); continue; }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage
        .from("property-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (up.error) { toast.error(`Upload failed: ${up.error.message}`); continue; }
      const signed = await supabase.storage
        .from("property-images")
        .createSignedUrl(path, IMAGE_SIGNED_URL_TTL);
      if (signed.error || !signed.data?.signedUrl) {
        toast.error("Could not create image URL");
        await supabase.storage.from("property-images").remove([path]);
        continue;
      }
      added.push({ url: signed.data.signedUrl, path });
    }
    if (added.length) {
      setImages((prev) => [...prev, ...added]);
      setErrors((e) => ({ ...e, images: "" }));
      toast.success(`${added.length} image${added.length > 1 ? "s" : ""} uploaded`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = async (idx: number) => {
    const item = images[idx];
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (item.path) {
      await supabase.storage.from("property-images").remove([item.path]).catch(() => {});
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
            <h2 className="font-semibold text-lg">Photos</h2>
            <p className="text-sm text-muted-foreground">
              JPG, PNG, or WebP · up to 5&nbsp;MB each · max {IMAGE_MAX_COUNT} images. The first
              photo becomes the cover.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_ALLOWED_TYPES.join(",")}
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || images.length >= IMAGE_MAX_COUNT}
              >
                {uploading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" />Add photos</>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                {images.length} / {IMAGE_MAX_COUNT} uploaded
              </span>
            </div>
            {err("images")}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={img.url} className="relative group">
                    <img
                      src={img.url}
                      alt={`Photo ${i + 1}`}
                      className="w-full aspect-square object-cover rounded-md border"
                    />
                    {i === 0 && (
                      <span className="absolute top-1 left-1 text-[10px] font-semibold bg-gold text-navy px-1.5 py-0.5 rounded">
                        COVER
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      aria-label="Remove photo"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-md p-8 text-center text-sm text-muted-foreground">
                No photos yet. A default cover will be used if you publish without any.
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Max size {IMAGE_MAX_BYTES / (1024 * 1024)}&nbsp;MB per file.
            </p>
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
