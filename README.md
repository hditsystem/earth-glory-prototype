# Earth Glory booking prototype

A polished, responsive front-end concept for Earth Glory with a clearly separated Treatwell live-booking route and non-transactional product previews.

## Current Treatwell transition

Earth Glory currently uses Treatwell as its live booking calendar. This prototype adopts the recommended operating rule, pending Avni's final sign-off: **Treatwell remains the source of truth for every real booking until a supported direct integration or controlled cutover exists.**

- Public **Book on Treatwell** actions open Earth Glory's official Treatwell booking flow.
- Bookings started from this website and bookings made directly on Treatwell continue into the same Treatwell calendar.
- The Guest, Client, Practitioner and Owner product flows use sample browser data only and never claim to be synchronized.
- The Owner **Booking connection** page distinguishes a configured live-booking link from appointment import and write-back, which are not connected.
- Real phone bookings, walk-ins, breaks, time off and appointment changes must continue to be entered in Treatwell during this transition.

The default configured booking destination is contained in `src/bookingProvider.js`. A deployment can override its tracking query with `VITE_TREATWELL_BOOKING_URL`, but the application accepts only Earth Glory's HTTPS route on Treatwell's booking host. Do not put Treatwell API credentials in this static GitHub Pages application.

Before publishing and at least weekly during the pilot, open that configured route and confirm it still resolves to Earth Glory's venue and reaches bookable availability. If it fails, remove the live-booking action and show a verified phone/email fallback; never direct clients into the prototype booking preview.

## What is included

- Branded Earth Glory public site with hero, treatment menu, studio story, practitioner profile, reviews, visit details and FAQ
- Category filtering for treatment discovery
- Four-step feedback-only booking preview:
  1. treatment
  2. calculated London date and time
  3. sample contact details and prototype acknowledgement
  4. complete booking, policy and payment review
- Calculated sample availability that intersects Earth Glory operating hours with practitioner hours, then protects each service's treatment duration and room-reset buffer against appointments, breaks, owner-blocked time and closing time
- Late-booking overlap prevention: a start time is disabled when the treatment or reset period would run into a later appointment, even when the proposed start itself appears free
- Clear treatment price and deliberately unconfirmed payment terms
- Explicit preview-complete state stating that no appointment was booked and offering the real Treatwell route
- Responsive desktop/mobile layouts and a persistent mobile link to the current Treatwell calendar
- Keyboard-friendly controls, trapped and restored modal focus, reduced-motion support and semantic landmarks
- Original generated hero artwork bundled through `src/assets`
- Owner-supplied lotus identity refined into a transparent, web-optimised PNG and used consistently across public, booking and workspace surfaces
- Four connected feedback views using one active session-only appointment, supporting schedule records and shared activity state:
  1. Guest discovery and no-account booking preview
  2. Client sample appointment detail, rescheduling, cancellation, payment summary and preferences
  3. Practitioner sample schedule, client brief, appointment-status workflow and service note
  4. Owner sample calendar, appointment detail, treatment management, blocked time, payment recording, reports, editable operating hours and booking-connection status
- Owner treatment catalogue with validated add/edit and Draft/Published controls; published treatments flow immediately into the website prototype and sample availability but do not change Treatwell
- Cross-role updates for the shared appointment, including booking/rescheduling, cancellation, practitioner status, service note, owner-recorded payment and activity history
- A **Reset demo** action that restores the original sample scenario
- Shareable role previews through `?role=client`, `?role=practitioner` and `?role=owner`; the clean URL opens the Guest view

Selected services, durations, reset buffers, prices, operating hours and profile details remain draft content until Avni approves them. Available preview starts are calculated from sample data in the browser and are not Treatwell availability; no real appointment, payment, email or SMS is created or sent. Connected demo records remain only for the current page session and reset on refresh or when **Reset demo** is selected.

The future marketplace concept source is retained in `src/MarketplacePreview.jsx` but is intentionally not linked or included in the public build during the Earth Glory feedback round.

Guest is a no-account state in the client journey, not a stored authorization role. In a live system, Client, Practitioner and Owner access must be authenticated and enforced on the server; the visible role switcher is only for prototype feedback.

## Product gap registers

- [`docs/PROTOTYPE_FUNCTIONAL_GAPS.md`](docs/PROTOTYPE_FUNCTIONAL_GAPS.md) tracks missing prototype interactions, cross-role continuity and the recommended front-end implementation order.
- [`docs/PRODUCTION_READINESS_GAPS.md`](docs/PRODUCTION_READINESS_GAPS.md) preserves the separate operational, technical and compliance work required before real bookings or payments.

## Run locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

## GitHub Pages

The production build uses `/earth-glory-prototype/` as its base path. Publish the generated `dist/` directory from the `gh-pages` branch.

Expected address: `https://hditsystem.github.io/earth-glory-prototype/`

## Quality checks

```bash
npm test
npm run lint
npm run build
```

## Production boundary

This is a public-site and product-flow prototype—not a validated production system. Treatwell is the recommended interim booking source of truth pending final confirmation with Earth Glory, and appointment API/webhook access has not been confirmed. Production work still requires owner-approved content and policies, a confirmed launch jurisdiction, a database with tenant isolation, server-side availability and slot holds, secure authentication and roles, a supported Treatwell integration or controlled cutover, connected-account payment architecture, provider-supported signed webhooks or another approved change feed, transactional notifications, invoice and refund documents, immutable financial records, reconciliation, support operations, audit logs, backup/restore testing, and provider/admin dashboards.

Do not treat any draft source material as owner approval. Verify the Earth Glory launch catalogue, venue instructions, opening hours, accessibility, cancellation terms and payment mode directly with Avni.

The generated hero artwork was created with the built-in image generation tool using this final prompt:

> A high-end natural editorial photograph of a serene contemporary boutique treatment room, with a cream treatment bed, folded ivory towels, dried botanicals, unlabelled skincare vessels, warm limewashed walls and soft morning window light. Wide landscape framing, subject weighted to the right with negative space on the left. Warm ivory, sand, muted blush, clay and espresso palette. No people, logos, readable text, watermark, medical equipment or excessive luxury clichés.
