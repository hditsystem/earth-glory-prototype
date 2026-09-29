# Earth Glory production-readiness gap register

Last reviewed: 29 September 2026

## Purpose

This document preserves the capabilities required before the platform accepts real appointments, personal information or payments. These are **not defects in the current feedback prototype** and should not be confused with the mock interactions listed in `PROTOTYPE_FUNCTIONAL_GAPS.md`.

## Required before real bookings

### Business and launch decisions

- Confirm Earth Glory's actual operating country, legal identity, currency, tax treatment, timezone and location details.
- Keep the Earth Glory operating configuration separate from the future Calgary/CAD marketplace configuration.
- Approve the real treatment catalogue, durations, buffers, resources, staff, opening hours and accessibility information.
- Approve payment, deposit, cancellation, rescheduling, no-show, late-arrival and refund rules.
- Approve treatment-specific intake, contraindication, patch-test, age/guardian, preparation and aftercare requirements.
- Record who approved each public statement, policy and media asset and when it became effective.

### Booking source of truth and cutover

- **Recommended interim operating model, pending owner confirmation:** Treatwell remains Earth Glory's only authoritative live calendar while the new product is evaluated.
- Route website clients through Earth Glory's configured official Treatwell-hosted booking page so bookings started on the website and directly on Treatwell use the same live calendar.
- Keep phone bookings, walk-ins, breaks, time off and live appointment changes in Treatwell during the transition.
- Treat the configured booking link and direct data synchronization as separate capabilities: the link is present but not monitored, while appointment import and write-back are not connected.
- Confirm in writing whether Earth Glory's Treatwell account and agreement permit an approved booking API integration and custom booking interface.
- Confirm supported capabilities for availability reads, conflict-checked appointment creation, rescheduling, cancellation, service/staff/location mapping, idempotency, webhooks, rate limits and a sandbox.
- Do not use scraping, browser automation or unsupported reverse-engineered endpoints for calendar synchronization.
- Import and reconcile future appointments and client records without duplicates.
- If approved API access exists, keep Treatwell authoritative initially: confirm every Earth Glory write in Treatwell before showing the appointment as confirmed locally.
- Store stable Treatwell IDs and use provider idempotency or client-reference fields where supported; always keep local deduplication keys.
- Use signed webhooks where Treatwell supports them; otherwise use an approved incremental change feed or polling process. In every case, keep an idempotent local inbox/outbox and scheduled reconciliation.
- Fail closed during provider/API outages: offer a request or waitlist instead of confirming an appointment only in Earth Glory.
- Define a later cutover date, rollback plan and daily reconciliation procedure before Earth Glory can become authoritative.
- Prevent independent calendars from selling the same staff/resource time.

The public GitHub Pages build can safely open the configured HTTPS Treatwell booking page. It cannot securely store partner API credentials, receive webhooks or perform durable reconciliation; those capabilities require a backend.

### Production application foundation

- Server/API, database, migrations and secure media storage.
- Tenant-scoped data model and tested isolation.
- Secure Client, Practitioner and Owner authentication, recovery and session controls.
- Server-enforced role/action/field permissions and append-only audit history.
- Separate development, staging and production environments with protected secrets and deployment rollback.

### Availability and appointment integrity

- Server-computed slots using location hours, shifts, breaks, time off, eligibility, resources, duration, buffers, lead time and booking horizon.
- Expiring slot holds and transaction-safe overlap prevention.
- Explicit appointment state machine and immutable event history.
- Atomic rescheduling/cancellation, manual bookings, walk-ins and controlled override rules.
- Timezone and daylight-saving tests.

### Payments, receipts and reconciliation

- Approved pay-at-venue, fixed-deposit, percentage-deposit and prepayment modes.
- Hosted payment components and signed, idempotent provider webhooks.
- Failure, abandoned checkout, late-webhook, full/partial refund and dispute handling.
- Separate appointment, payment, refund, payout and reconciliation states.
- Durable client receipts/tax documents, immutable ledger and daily payout reconciliation.
- Payment design that can later support marketplace responsibilities without exposing marketplace features during the Earth Glory pilot.

### Notifications

- Verified email/SMS providers, sender identity and templates.
- Confirmation, change, cancellation, reminder, payment, refund and owner/staff alerts.
- Retry, bounce, complaint, suppression, unsubscribe and manual-resend handling.
- Secure expiring manage-booking links and no sensitive intake data in messages.

### Privacy, safety and legal readiness

- Jurisdiction-specific privacy notice, terms, cancellation/refund policy, complaints process and accessibility information.
- Documented lawful handling, minimisation, access and retention for intake, treatment and other sensitive information.
- Access, correction, export, deletion/objection and breach-response workflows.
- Treatment safety, minors/guardian, patch-test, qualification, insurance and adverse-event procedures appropriate to the operating jurisdiction.
- Professional legal, accounting, tax, licensing and insurance review before launch.

### Operations and quality

- Monitoring for booking success, slot latency, webhook lag, message delay, failed jobs and reconciliation differences.
- Support ownership and runbooks for double booking, practitioner absence, payment/refund failure, provider outage, complaints and privacy/security incidents.
- Backups, point-in-time recovery where appropriate, defined recovery targets and evidenced restore drills.
- Unit, integration, permission/isolation, concurrency, payment/webhook, accessibility and end-to-end tests.
- Controlled pilot, owner training, daily reconciliation and explicit owner sign-off before general availability.

## Production definition of done

The first complete operational slice is:

`Owner publishes configuration -> Guest books -> payment/hold resolves -> confirmation is delivered -> Client manages the visit -> Practitioner completes it -> receipt/review/rebook follows -> Owner refunds or reconciles and reports`

The same slice must also be proven for slot conflict, abandoned/failed payment, duplicate or late webhook, cancellation/no-show, failed notification, refund and provider outage.

## Deliberately deferred

- Public Calgary marketplace/discovery and ranking.
- Self-service business onboarding and platform subscription billing.
- Packages, memberships, gift cards and promotions.
- Multi-location, POS, inventory, payroll and advanced commissions.
- Native mobile applications and deep third-party channel integrations.
