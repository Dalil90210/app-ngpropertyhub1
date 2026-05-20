import { Link } from "@tanstack/react-router";
import { Bed, Bath, Maximize, MapPin, ShieldCheck, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PropertyCardData = {
  id: string;
  title: string;
  price: number;
  city: string;
  state: string;
  bedrooms: number | null;
  bathrooms: number | null;
  sqft: number | null;
  images: string[] | null;
  verified: boolean | null;
  trust_score: number | null;
};

export function PropertyCard({ p }: { p: PropertyCardData }) {
  const img = p.images?.[0] || `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=70`;
  return (
    <Link to="/properties/$id" params={{ id: p.id }}
      className="group block rounded-xl overflow-hidden bg-card shadow-elegant hover:shadow-gold transition-all">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        {p.verified && (
          <Badge className="absolute top-3 left-3 bg-gold text-navy hover:bg-gold gap-1">
            <ShieldCheck className="w-3 h-3" /> TrustScore {p.trust_score ?? 95}
          </Badge>
        )}
        <button onClick={(e) => { e.preventDefault(); }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white">
          <Heart className="w-4 h-4 text-navy" />
        </button>
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold text-navy">${Number(p.price).toLocaleString()}</div>
        <div className="font-medium mt-1 line-clamp-1">{p.title}</div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <MapPin className="w-3.5 h-3.5 mr-1" /> {p.city}, {p.state}
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><Bed className="w-4 h-4" />{p.bedrooms ?? 0}</span>
          <span className="flex items-center gap-1"><Bath className="w-4 h-4" />{p.bathrooms ?? 0}</span>
          <span className="flex items-center gap-1"><Maximize className="w-4 h-4" />{(p.sqft ?? 0).toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}
