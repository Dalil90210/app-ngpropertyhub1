import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().trim().min(4, "Title must be at least 4 characters").max(140),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(4000),
  price: z.coerce.number().positive("Price must be greater than 0").max(1_000_000_000),
  address: z.string().trim().min(4, "Address is required").max(200),
  city: z.string().trim().min(2, "City is required").max(80),
  state: z.string().trim().length(2, "Use 2-letter state code").transform((s) => s.toUpperCase()),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  bedrooms: z.coerce.number().int().min(0).max(50),
  bathrooms: z.coerce.number().min(0).max(50),
  sqft: z.coerce.number().int().min(0).max(1_000_000),
  property_type: z.enum(["house", "condo", "townhouse", "land", "multi"]),
  features: z.string().max(500).optional().default(""),
  image_url: z.string().trim().url("Must be a valid URL").or(z.literal("")).optional().default(""),
});

export type PropertyForm = z.infer<typeof propertySchema>;

export const emptyForm: PropertyForm = {
  title: "", description: "", price: 0, address: "", city: "", state: "", zip: "",
  bedrooms: 0, bathrooms: 0, sqft: 0, property_type: "house", features: "", image_url: "",
};
