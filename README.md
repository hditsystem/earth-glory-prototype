# Earth Glory booking prototype

A polished, responsive, non-transactional front-end concept for Earth Glory.

## What is included

- Branded Earth Glory public site with hero, treatment menu, studio story, practitioner profile, reviews, visit details and FAQ
- Category filtering for treatment discovery
- Four-step guest booking flow:
  1. treatment
  2. calculated London date and time
  3. sample contact details and prototype acknowledgement
  4. complete booking, policy and payment review
- Calculated sample availability that intersects Earth Glory operating hours with practitioner hours, then protects each service's treatment duration and room-reset buffer against appointments, breaks, owner-blocked time and closing time
- Late-booking overlap prevention: a start time is disabled when the treatment or reset period would run into a later appointment, even when the proposed start itself appears free
- Clear treatment price and deliberately unconfirmed payment terms
- Explicit non-transactional confirmation state showing the session record a live system would create
- Responsive desktop/mobile layouts and persistent mobile booking action
- Keyboard-friendly controls, trapped and restored modal focus, reduced-motion support and semantic landmarks
- Original generated hero artwork bundled through `src/assets`
- Owner-supplied lotus identity refined into a transparent, web-optimised PNG and used consistently across public, booking and workspace surfaces
- Four connected feedback views using one active session-only appointment, supporting schedule records and shared activity state:
  1. Guest discovery and no-account booking
  2. Client appointment detail, rescheduling, cancellation, payment summary and preferences
  3. Practitioner schedule, client brief, appointment-status workflow and service note
  4. Owner calendar, appointment detail, treatment management, blocked time, sample payment recording, reports and editable operating hours
- Owner treatment catalogue with validated add/edit and Draft/Published controls; published treatments flow immediately into Guest discovery, booking choices and calculated availability
- Cross-role updates for the shared appointment, including booking/rescheduling, cancellation, practitioner status, service note, owner-recorded payment and activity history
- A **Reset demo** action that restores the original sample scenario
- Shareable role previews through `?role=client`, `?role=practitioner` and `?role=owner`; the clean URL opens the Guest view

Selected services, durations, reset buffers, prices, operating hours and profile details remain draft content until Avni approves them. Available starts are calculated from sample data in the browser; no real appointment, payment, email or SMS is created or sent. Connected demo records remain only for the current page session and reset on refresh or when **Reset demo** is selected.

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

This is a public-site and product-flow prototype—not a validated production system. Production work still requires owner-approved content and policies, a confirmed launch jurisdiction and booking source of truth, a database with tenant isolation, server-side availability and slot holds, secure authentication and roles, approved connected-account payment architecture, signed webhooks, transactional notifications, invoice and refund documents, immutable financial records, reconciliation, support operations, audit logs, backup/restore testing, and provider/admin dashboards.

Do not treat any draft source material as owner approval. Verify the Earth Glory launch catalogue, venue instructions, opening hours, accessibility, cancellation terms and payment mode directly with Avni.

The generated hero artwork was created with the built-in image generation tool using this final prompt:

> A high-end natural editorial photograph of a serene contemporary boutique treatment room, with a cream treatment bed, folded ivory towels, dried botanicals, unlabelled skincare vessels, warm limewashed walls and soft morning window light. Wide landscape framing, subject weighted to the right with negative space on the left. Warm ivory, sand, muted blush, clay and espresso palette. No people, logos, readable text, watermark, medical equipment or excessive luxury clichés.
