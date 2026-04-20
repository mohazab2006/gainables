# TODO

Ride-day readiness punch list. Grouped by area, each item has file pointers so anyone can pick it up cold.

---

## 1. Environment & secrets

Source of truth: `.env.example`. Copy to `.env.local` and fill in.

| Var | Required for | Where it's read |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Email callbacks, metadata | `lib/env.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | All Supabase access | `lib/supabase/*` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser Supabase client, realtime | `lib/env.ts:2` (falls back to `ANON_KEY`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side writes, Overland ingest | `lib/supabase/admin.ts:9` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Live map tiles + markers | `app/(site)/track/page.tsx:40` |
| `RIDER_TOKEN` | Overland shared-secret auth | `lib/env.ts:38`, ingest edge function |
| `ADMIN_ALLOWED_EMAILS` | Magic-link admin allowlist | `lib/admin.ts` |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | Signup confirmation emails | `lib/actions/subscribe.ts` |

Checklist:

- [ ] Populate `.env.local` locally and the Vercel project env (Preview + Production).
- [ ] Confirm `NEXT_PUBLIC_MAPBOX_TOKEN` is a **public** token (URL-restricted to the deployed origin).
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is **only** on the server (never in `NEXT_PUBLIC_`).
- [ ] Rotate `RIDER_TOKEN` and share with whoever runs Overland — treat as a password.

---

## 2. Supabase — Realtime config

Required so the bike marker on `/track` moves without a page refresh.

- [ ] In the Supabase dashboard → **Database → Replication**, enable replication for:
  - `public.ride_positions`
  - `public.ride_updates`
- [ ] Verify the `supabase_realtime` publication includes both tables.
- [ ] RLS: confirm the anon/publishable role can `SELECT` from both tables (read-only). Writes must be server-only via the service role or the edge function.
- [ ] Smoke test: with the site open on `/track`, insert a row into `ride_positions` from the SQL editor — the bike should snap to the new location within ~1 second.

Code wiring (already in place):
- Subscription: [components/track/tracker-shell.tsx:107-113](components/track/tracker-shell.tsx#L107)
- Marker updates: [components/track/live-map.tsx:360-374](components/track/live-map.tsx#L360)

---

## 3. Overland (GPS source)

End-to-end setup is documented in [docs/overland-setup.md](docs/overland-setup.md). Ingest endpoint lives at [supabase/functions/ingest-position/index.ts](supabase/functions/ingest-position/index.ts).

- [ ] Deploy the edge function: `supabase functions deploy ingest-position`.
- [ ] Set function secrets: `supabase secrets set RIDER_TOKEN=... SUPABASE_SERVICE_ROLE_KEY=...`.
- [ ] In the Overland iOS app, set **Receiver Endpoint** to the deployed function URL.
- [ ] Add a custom HTTP header on the Overland device: `Authorization: Bearer <RIDER_TOKEN>`.
- [ ] Pre-ride test: walk/drive a short loop, confirm rows appear in `ride_positions` and the marker moves on `/track`.
- [ ] Battery: confirm Overland significant-locations mode (not continuous) so the rider's phone survives the full ride.

---

## 4. Homepage live tracker (biker-timeline) — sync to GPS

Currently the bike on the homepage is **scroll-driven, not live**. The `progressPercent` prop is accepted and ignored — see [components/sections/biker-timeline.tsx:11-14](components/sections/biker-timeline.tsx#L11).

- [ ] Wire `progressPercent` and `currentLocation` through from a live source (mirror what `tracker-shell.tsx` does: initial fetch + `ride_positions` / `ride_updates` realtime subscription).
- [ ] Decide the blend: pure-live, or let the user scroll ahead of the rider and then snap back. Recommended: ignore scroll entirely on ride day; drive `clamped` from `progressPercent` only.
- [ ] Derive "Currently in" from `latestUpdate.location` instead of the scroll-position lookup at [biker-timeline.tsx:79-85](components/sections/biker-timeline.tsx#L79).
- [ ] Acceptance: with the ride "live" in Supabase, the homepage shows the same km/location as `/track` within a few seconds, with no scrolling required.

---

## 5. Cyclist stick figure

The current SVG at [biker-timeline.tsx:299-329](components/sections/biker-timeline.tsx#L299) is marked "Slated for a revamp later" in the code.

- [ ] Replace the stick-figure cyclist with a proper illustration (consistent with brand — solid accent-color silhouette, not wireframe).
- [ ] Keep it within the same `64×64` viewBox so the CSS `offset-path` motion keeps working unchanged.
- [ ] Separately: the mapbox bike marker uses an inline SVG inside `buildBikeMarkerElement()` — consider unifying both with the same asset so the two surfaces feel like one brand.

---

## 6. Mobile compatibility

Needs a full pass — no specific pages listed yet. Audit candidates (found by skimming for fixed widths, large type, and absolute positioning):

- [ ] Homepage hero ([components/sections/gainables-hero.tsx](components/sections/gainables-hero.tsx)) — verify the display text scales on <400 px and that CTAs don't overflow.
- [ ] Biker timeline SVG ([components/sections/biker-timeline.tsx](components/sections/biker-timeline.tsx)) — the `aspectRatio: 1000/240` flattens to a strip on phones; the endpoint labels sit absolutely and may collide with the cyclist.
- [ ] `/track` live map ([components/track/live-map.tsx](components/track/live-map.tsx)) — recenter button sits `bottom-4 right-4`; must not overlap the `DonateFloat` ([components/track/donate-float.tsx](components/track/donate-float.tsx)) which is `bottom-5 right-5` and always visible. On mobile they will collide.
- [ ] Status pills top-left of the map — check they wrap cleanly at ~375 px.
- [ ] Header nav ([components/header.tsx](components/header.tsx)) — verify the mobile drawer/menu across all new pages (`/faq` added, `/updates` removed).
- [ ] Sponsor strip marquee — confirm it still scrolls smoothly and doesn't cause horizontal overflow on small viewports.

Minimum acceptance: test on iPhone SE (375), iPhone 15 Pro (393), and a small Android (360) with DevTools; no horizontal scroll, no overlapping controls, all CTAs tappable (≥44 px hit area).

---

## 7. Admin panel — make every public surface editable

The admin already has structured forms for sponsors, ride updates, FAQs, and subscribers, plus a JSON editor for `site_content` sections (hero, stats, route, pillars, gallery, cause_partner, media, donate, etc. — see [lib/admin/content-sections.ts](lib/admin/content-sections.ts)). So *technically* most copy is editable, but non-devs can't safely edit raw JSON and several surfaces still read from hard-coded files.

Coverage audit — what to check on every public page:

- [ ] **Homepage hero** — confirm every visible string (title, italic fragment, description, CTAs) comes from `site_content.hero`, not hardcoded. Same for the background (see §8).
- [ ] **Biker timeline** — the checkpoint list already pulls from `route.checkpoints`. Confirm "Live tracker" eyebrow and the "Currently / km" labels are content-driven, not string literals.
- [ ] **Donations strip** — amounts, donor count, goal, progress come from `site_content` (which key?). Verify the CTA label is editable.
- [ ] **Signup strip** — headline, subcopy, button label, success message should all be admin-editable.
- [ ] **Sponsor strip (homepage)** — sponsor rows already editable via `/admin/sponsors`. Confirm the eyebrow + section heading copy are too.
- [ ] **FAQ section + `/faq` page** — rows are editable via `/admin/faqs`. Confirm the section intro copy is.
- [ ] **Footer** ([components/footer.tsx](components/footer.tsx)) — social links, legal text, contact email. Likely still hardcoded — add a `footer` content section if so.
- [ ] **Header nav** ([components/header.tsx](components/header.tsx)) — nav labels, donate CTA label. Probably hardcoded; decide whether to surface in admin or keep as code (nav changes are rare).
- [ ] **`/donate` page** — narrative, impact tiles, allocation are already in `donate` content key. Confirm the embed URL field works end-to-end.
- [ ] **`/track` page** — titles + paragraphs at the top, "Why we ride" card, "Stay close to the ride" card ([app/(site)/track/page.tsx](app/(site)/track/page.tsx)) are currently literal JSX. Move to content or leave hardcoded per intent.
- [ ] **SEO metadata** (page titles, descriptions, OG image text) — decide whether these need to be admin-editable or remain in code.

UX gaps to close so non-devs can actually use it:

- [ ] Replace the raw-JSON textarea at [app/admin/content/page.tsx](app/admin/content/page.tsx) with **typed forms per section** (hero has its own form with fields for title/italic/description/primaryCta/etc.). JSON is fine as an escape hatch, but shouldn't be the only path.
- [ ] Add image upload for hero / gallery / cause-partner images. Today only sponsor logos have upload (via `sponsor-logos` bucket in [lib/actions/admin.ts:55](lib/actions/admin.ts#L55)). Mirror that pattern for a `site-images` bucket.
- [ ] Client-side validation + preview before save. A bad JSON save currently shows an error post-redirect; field-level validation would be safer.
- [ ] Confirm `refreshPublicSite()` + tag revalidation actually invalidates all affected routes after a save. Test by editing a value and watching the homepage update without a redeploy.

Acceptance: a non-developer can change every piece of visible copy and every image across the site from `/admin`, without editing code or typing JSON.

---

## 8. Donation integration

Today the donation flow is a stub: `donationUrl` points at `https://example.com/donate` ([lib/fallback-content.ts:324](lib/fallback-content.ts#L324)), `donationTotals` ({ raisedAmount, goalAmount, donors }) is manually edited via the admin JSON editor, and nothing auto-updates when a real donation comes in.

Pick a provider first (decision required before anything else):

- [ ] **Choose the processor.** Candidates and tradeoffs:
  - **Zeffy** — free for Canadian charities, no fees, has hosted page + embeddable form + webhooks. Good fit for a mental-health campaign; needs charity registration.
  - **Donorbox** — hosted widget or iframe, supports recurring, has webhooks, ~1.5% platform fee.
  - **Stripe Checkout** — full control, 2.9%+30¢, need to build the `/donate` form ourselves plus a success page.
  - **GoFundMe** — zero integration work, but we lose control over branding + data + the on-site embed.
- [ ] Once chosen: document the choice here and in [docs/ride-day-runbook.md](docs/ride-day-runbook.md).

Wire the real URLs:

- [ ] Replace the placeholder `donationUrl` via `/admin/content → donation_url` — point at the real hosted page.
- [ ] Populate `donation_embed_url` if the provider offers an iframe, so the `/donate` page can embed the form inline. Check CSP/sandbox; test on mobile.
- [ ] Verify all "Donate" CTAs resolve correctly now that we've unified them to `/donate`: hero, donations strip, biker-timeline, header, donate-float, sponsor-strip "Become a sponsor" neighbour, tracker checkpoint card external link.

Live totals (replace manual JSON editing):

- [ ] Add a webhook endpoint to ingest donation events. Pattern to mirror: [supabase/functions/ingest-position/index.ts](supabase/functions/ingest-position/index.ts). Create `supabase/functions/ingest-donation` verifying the provider's signature and upserting into a new `donations` table (or just bumping `donation_totals`).
- [ ] Schema: add `donations` table (`id, provider, external_id, amount_cents, currency, donor_name_public, donor_email, created_at, raw`). Store raw payload so we can re-derive totals later if we change aggregation.
- [ ] Derive `donation_totals` (raisedAmount, goalAmount, donors) from the `donations` table via a SQL view or aggregate on read in `lib/content.ts`. Keep `goalAmount` manual (set via admin scalar), derive the rest.
- [ ] Enable Supabase Realtime on `donations` + subscribe from the homepage donations strip so the raised number ticks up live during the ride.
- [ ] Env vars to add: `DONATION_WEBHOOK_SECRET` (or provider-specific: `STRIPE_WEBHOOK_SECRET`, etc.). Add to `.env.example` and Vercel.

Donor-facing polish:

- [ ] On-site `/donate` success page: if the provider redirects back with a session id, show a thank-you state; otherwise link out and trust the provider's page.
- [ ] Tax-receipt handling: confirm the provider auto-emails receipts (Zeffy/Donorbox yes, Stripe no unless you build it). If Stripe, wire a `receipt_email` on the session and a follow-up email via Resend.
- [ ] Optional: recent-donors ticker or honor roll on `/donate` using the `donations` table, with `donor_name_public` so donors who opted to stay anonymous aren't listed.

Testing:

- [ ] Test-mode flow: donate $1 end-to-end; confirm the webhook fires, `donations` gets a row, `donationTotals` updates, the homepage strip reflects it without a reload.
- [ ] Refund flow: issue a test refund in the provider, confirm totals decrement (or decide refunds are out of scope and document it).
- [ ] Failure modes: replay attack protection on the webhook (signature + idempotency via `external_id`), Supabase downtime behaviour, provider downtime behaviour.

---

## 9. Hero background — replace giant wordmark with a background image

File: [components/sections/gainables-hero.tsx](components/sections/gainables-hero.tsx).

What to change:

- [ ] **Remove** the massive `GAINABLES` wordmark block (the `<h1>` at lines ~127-149, the `22vw`/`19vw` per-character animated text). The page should lead with imagery, not the wordmark.
- [ ] **Remove or dim** the radial-glow backdrop at lines ~77-81 — it was designed to give the wordmark a "stage"; with a real image it becomes noise. Keep only a bottom fade-to-background so the next section blends.
- [ ] **Add** a full-bleed hero image behind the content: `next/image` with `fill`, `priority`, `sizes="100vw"`, `className="object-cover"`, sitting in a `-z-10` layer inside the existing `section`.
- [ ] **Add** a dark scrim on top of the image (e.g. `bg-[linear-gradient(to_bottom,rgba(10,10,10,0.55),rgba(10,10,10,0.25)_40%,rgba(10,10,10,0.85))]`) so the tagline, CTAs, and small brand mark stay readable over any photo.
- [ ] **Keep** the small `gainables-mark.png` centered top, eyebrows, tagline, CTAs, and the bottom meta row — the hero structure stays the same, only the visual centerpiece changes from type to photo.
- [ ] Remove the now-unused per-character wordmark GSAP tween (`[data-wordmark-char]` in the timeline) — leave the other intros intact.

Image source — decide before implementing:

- [ ] Which image? Drop the final asset in `public/images/hero-background.jpg` (or similar). Prefer a 2400×1600 JPEG, <300 KB after compression.
- [ ] Should the image be admin-editable? If yes, extend `hero` content schema with a `backgroundImage: { src, alt }` field and wire through `site_content.hero` (see §7 — this would be one of the first typed-form candidates). If no, hardcode the path and move on.
- [ ] Art direction: will the same image work for mobile + desktop, or do we need a portrait crop for phones? If the latter, use `<picture>` with a `media` query or two `Image` elements toggled by a `md:` breakpoint.

---

## 10. Pre-ride smoke test (day before)

Do all of these end-to-end before the ride starts:

- [ ] `.env.local` + Vercel env both populated and deployed.
- [ ] Log into `/admin`, post a test ride update — confirm it renders on `/track` live.
- [ ] Overland on the rider's phone pings `ingest-position` successfully (check function logs).
- [ ] Realtime: delete the test row, watch it disappear on an open `/track` tab.
- [ ] Open `/track` on a real phone over cellular (not wifi) — confirm the map loads, the marker is at the Ottawa start, and the recenter button is tappable.
- [ ] Confirm donation links (`/donate` page + external `donationUrl`) both resolve.
- [ ] Donation provider: push a $1 test donation; confirm the webhook updates `donation_totals` live on the homepage strip.
