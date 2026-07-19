# NG Property Hub — Marketplace Extension Plan

Extending the existing app (keeping current routes/data) and adding the spec's marketplace surface. I'll also scrub crypto / tokenized / blockchain / "trust score" copy from user-facing pages per your design rule (data columns stay but stop being rendered).

## 1. Database migration (single migration)

New tables (all with GRANTs + RLS + policies):

- `agent_profiles` — `user_id` PK→auth.users, `license_number`, `license_state`, `brokerage_name`, `bio`, `photo_url`, `verified_at nullable`. Auto-created on first agent role grant. Public SELECT.
- `listing_photos` — `id, listing_id→properties, url, sort_order`. Public SELECT for photos of active/verified listings; owner writes.
- `saved_searches` — `id, user_id, filters jsonb, name, created_at`. Owner-only.
- `saved_listings` — `id, user_id, listing_id, created_at` unique(user,listing). Owner-only.
- `messages` — `id, listing_id, sender_id, recipient_id, body, created_at, read_at`. Sender/recipient read; sender insert; recipient can mark read.
- `reviews` — `id, agent_id, reviewer_id, rating 1-5, body, created_at` unique(agent,reviewer). Insert allowed only if reviewer has a message thread with that agent (enforced via trigger + policy using EXISTS on `messages`).

Additions to existing `properties` table:
- `latitude numeric`, `longitude numeric`, `lot_size numeric`, `year_built int`, `owner_id uuid` (mirrors agent_id for sellers). Non-breaking (nullable).

Reuse existing: `properties` (=listings), `user_roles` (buyer/seller/agent/admin/investor), `profiles`, `inquiries` (kept, but new `messages` powers threaded chat).

## 2. Google Maps connector

Connect `google_maps` via `standard_connectors--connect`. Use:
- Browser key → Maps JS in search map view + property detail map (google.maps.Marker only, no mapId).
- Gateway → server fn `geocodeAddress` called on listing create/update to fill lat/lng.

## 3. Auth & roles

- Update `/auth` signup: role selector (buyer/seller/agent). If "agent", also require license_number + license_state; create `agent_profiles` row with `verified_at=null`.
- Keep existing `use-auth` + `_authenticated` gate. Add `useAgentVerified()` helper.

## 4. Listings (sellers + agents)

- Extend `PropertyForm` with lot_size, year_built, lat/lng (auto via geocode, read-only preview map), up to 20 photos (currently 8) written to `listing_photos`.
- Dashboard "My Listings" already exists — add inquiry/message counts per listing and status chips.

## 5. Search & browse (`/properties`)

Rebuild page with:
- Filter sidebar: location (city/state/zip text), price min/max, beds, baths, property_type.
- Sort: price asc/desc, newest, sqft.
- Toggle List ↔ Map (Google Maps with pins → popup card).
- URL search params for shareability.

## 6. Property detail (`/properties/$id`)

Replace crypto/token/trust-score section with:
- Photo gallery (existing lightbox) from `listing_photos`.
- Full stats grid + description.
- Map centered on lat/lng.
- Agent contact card → opens Message dialog (creates `messages` thread) + saves inquiry.
- "Save listing" toggle.
- "Similar listings" query: same city, price ±20%, exclude self, limit 4.

## 7. Agent profiles (`/agents/$id`)

Public page: photo, bio, brokerage, license number + state (plain text), active listings grid, reviews list + aggregate rating. Review form visible only when `messages` exist between viewer and this agent.

## 8. Messaging

- `/inbox` — thread list grouped by (listing_id, other_user_id) with unread badge.
- `/inbox/$threadId` — messages view with composer.
- Inquiry form on listing → first message + inquiry row.

## 9. Saved

- `/saved` with two tabs: Listings, Searches. Rerun-search button loads filters into `/properties`.

## 10. Admin agent verification

Extend `/admin` with "Pending Agents" section: list agent_profiles where verified_at is null → Approve (sets `verified_at=now()`) / Reject (delete profile, keep account as buyer).

## 11. Design & content scrub

- New `PropertyCard` v2: 4:3 photo, price prominent, beds/baths/sqft row, city+state, agent name/avatar footer. Used everywhere.
- Remove from UI: `/crypto`, `/invest` links; "NGEstimate"/"AI valuation" hero CTAs; trust-score badges; "SECURE ESCROW"/"BLOCKCHAIN"/tokenization copy in hero, footer, testimonials.
- Keep routes as 404-redirects or delete files: I'll delete `/crypto`, `/invest`, `/ng-estimate` route files and remove nav links.
- Update homepage hero to marketplace framing: search bar → `/properties`, featured listings grid.

## Technical notes

- All DB writes via `createServerFn` + `requireSupabaseAuth` where auth needed; public reads (listings, agent profiles, photos, reviews) via server publishable client.
- Zod schemas for every form.
- Geocode server fn cached per address to avoid re-billing.
- Reviews eligibility enforced by a `BEFORE INSERT` trigger checking `messages` exists.
- Photos stay in existing `property-images` bucket (bump per-listing count to 20).

## Out of scope (confirm if wanted)

- Realtime message push (will use polling on inbox open).
- Email notifications for new messages.
- Deleting existing escrow/offers tables (kept in DB; just hidden from UI).

Approve and I'll ship it in order: migration → connector → auth/signup → listings/search → detail/messaging → agents/reviews → saved → admin → scrub.