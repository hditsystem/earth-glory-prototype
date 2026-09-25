# Earth Glory booking prototype

A polished, responsive front-end concept for the friend-first beauty booking platform described in `Beauty Booking Platform Plan.md`.

## What is included

- Branded Earth Glory public site with hero, treatment menu, studio story, practitioner profile, reviews, visit details and FAQ
- Category filtering for treatment discovery
- Four-step guest booking flow:
  1. treatment
  2. therapist or first available
  3. local date and time
  4. contact details and policy consent
- Clear treatment total, deposit and remaining balance
- Explicit non-transactional confirmation state
- Responsive desktop/mobile layouts and persistent mobile booking action
- Keyboard-friendly controls, reduced-motion support and semantic landmarks
- Original generated hero artwork bundled through `src/assets`

All services, people, reviews, claims and contact details are visibly labelled as sample concept content. No booking, payment, email or SMS is sent.

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
npm run lint
npm run build
```

## Production boundary

This is the validated public-site and booking-flow prototype—not the production multi-tenant platform. Production work still requires the owner-approved Earth Glory catalogue and content, a database with tenant isolation, real availability/slot holds, authentication and roles, Stripe Connect, signed webhooks, transactional notifications, audit logs and the owner/staff dashboard described in the plan.

The generated hero artwork was created with the built-in image generation tool using this final prompt:

> A high-end natural editorial photograph of a serene contemporary boutique treatment room, with a cream treatment bed, folded ivory towels, dried botanicals, unlabelled skincare vessels, warm limewashed walls and soft morning window light. Wide landscape framing, subject weighted to the right with negative space on the left. Warm ivory, sand, muted blush, clay and espresso palette. No people, logos, readable text, watermark, medical equipment or excessive luxury clichés.
