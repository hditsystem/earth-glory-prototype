# Earth Glory prototype functional gap register

Last reviewed: 29 September 2026

## Purpose

This register tracks what is implemented and what is still missing from the **feedback prototype itself**: screens, controls, state changes and cross-role journeys that reviewers should be able to try without creating a real appointment or taking a real payment.

The prototype can remain front-end-only. Implemented behaviour uses session-only sample state, clearly labelled simulated payment outcomes and an explicit **Reset demo** control. Real authentication, persistence, payment processing, email and SMS belong to the separate production-readiness register.

## Current functional baseline

The prototype now provides:

- a responsive Earth Glory public website with treatment filtering and a four-step booking dialog;
- Guest, Client, Practitioner and Owner previews connected to one active shared appointment plus supporting schedule records;
- session-only booking, rescheduling, cancellation, practitioner status, service-note and payment updates that remain visible when switching roles;
- a booking reference, Client appointment detail, appointment history tabs, calendar download and directions;
- Practitioner Arrived, In service, Completed and No-show actions;
- Owner appointment detail, Draft/Published treatment management, blocked-time creation, sample payment recording and editable operating hours;
- calculated Guest availability driven by operating hours, practitioner hours, service timing and protected calendar events; and
- visibly disabled or preview-labelled controls for several workflows that are not yet implemented.

This is still a browser-only feedback model. Refreshing the page or selecting **Reset demo** restores the seed scenario, and no appointment, payment, email or SMS is created outside the page.

## Calculated availability now demonstrated

The Guest time picker no longer uses an unrelated fixed list of times. For the selected local date, it:

1. intersects Earth Glory's sample operating hours with Avni's sample practitioner hours;
2. adds the selected service's treatment duration and room-reset buffer to every candidate start;
3. rejects a candidate when any part of that protected interval overlaps an appointment, break or owner-created block;
4. rejects a candidate when the treatment or reset time would extend past the available working window; and
5. excludes the current appointment from its own conflict check while rescheduling.

Intervals use normal back-to-back scheduling semantics: an appointment may start exactly when the previous protected interval ends, but not one minute earlier. Cancelled appointments no longer block availability.

Example: a 60-minute treatment with a 10-minute reset starting at 17:00 protects the calendar until 18:10. It is unavailable when another appointment starts at 17:45, even though 17:00 itself looks empty. A 30-minute treatment with a 10-minute reset can fit before 17:45 if no other appointment, break, block or closing boundary conflicts.

The automated checks cover catalogue validation and Draft/Published visibility plus availability adjacency, newly created treatment timing, late-booking overlap, short-service fit, closing-time overflow, breaks, cancellation, rescheduling and closed practitioner days.

## Status legend

- **Implemented**: the main interaction works in the current session-only prototype.
- **Partial**: a useful slice works, but one or more outcomes in the target description remain outstanding.
- **Planned**: represented only by copy, sample data or a disabled preview control.

## P0: required for a believable end-to-end prototype

| ID | Status | Functional area | Current implementation and remaining gap |
|---|---|---|---|
| PF-001 | Implemented | Shared demo appointment | Guest confirmation creates a session-only active appointment used by Client, Practitioner and Owner while preserving earlier records as schedule/history context. Reference, client, service, date, time, price, payment state, status and activity remain until refresh or **Reset demo**. |
| PF-002 | Partial | Guest confirmation and handoff | Confirmation shows the booking reference and **Manage this demo booking**, which opens Client. Calendar download and directions are available in Client; they should also be offered directly on confirmation. |
| PF-003 | Implemented | Booking commitment step | Review shows provider, service, protected calendar time, venue, price, simulated pay-at-venue terms, £0 due now and required sample-policy acceptance. Final owner-approved cancellation/no-show wording is still content work. |
| PF-004 | Partial | Client appointment detail | Detail shows status, reference, treatment, practitioner, time, protected reset, venue, payment and activity. Accepted-policy and service-specific preparation/intake details still need a dedicated presentation. |
| PF-005 | Implemented | Client reschedule and cancellation | Rescheduling reuses calculated availability and excludes the appointment being moved. Cancellation updates the shared state and removes that appointment from blocking availability. Both changes appear across roles. |
| PF-006 | Partial | Practitioner delivery workflow | Arrived, In service, Completed and No-show plus a shared staff service note are implemented. Rich intake, consent/preparation and a functional review/rebook handoff after completion remain. |
| PF-007 | Partial | Owner appointment operations | The shared appointment opens from Owner surfaces and supports sample payment recording. Edit, reassign, owner cancellation/no-show, notification resend and refund interactions remain. |
| PF-008 | Partial | Owner-created bookings and blocked time | Owner **Create appointment**, **New appointment** and Practitioner **Add walk-in** open the connected booking flow, preserve earlier records and make the newest record active across roles. Owner blocked time immediately affects Guest slots. Purpose-built staff entry, client lookup and override wording remain. |
| PF-009 | Partial | Connected calendar and availability | Operating hours, fixed sample practitioner hours, service duration/reset, appointments, breaks and owner blocks govern Guest slots. Editable practitioner shifts, time-off approval and broader calendar navigation remain. |
| PF-010 | Partial | Owner setup-to-publish flow | Owner can edit operating hours and see the change applied immediately. Treatment Draft/Published management is represented, while business details, booking rules, policy/payment editors and the wider business setup Review lifecycle remain. |
| PF-011 | Partial | Treatment catalogue control | Owner can add and edit a validated treatment with category, description, price, treatment time and reset time, and move it between Draft and Published. Published treatments immediately appear in Guest discovery and booking; Drafts remain Owner-only, and Avni is assigned automatically. Archive/delete, configurable practitioner eligibility, preparation and patch-test controls remain. |
| PF-012 | Partial | Payment-to-receipt loop | Owner can record a sample balance payment and Client sees the updated state. Cancelling a paid sample appointment records a matching simulated full refund. A dedicated receipt and manual partial-refund flow remain. |
| PF-013 | Partial | Shared activity timeline | Booking, rescheduling, cancellation, status, service-note and payment actions append shared events. Refund and notification events remain because their workflows are not implemented. |
| PF-014 | Partial | Clear interaction feedback | Implemented actions open a flow or change state, and many deferred controls are disabled and labelled **preview**. A final audit of every navigation, search, notification and secondary control remains. |

## P1: important prototype coverage

| ID | Status | Functional area | Remaining prototype treatment |
|---|---|---|---|
| PF-101 | Planned | Client portal entry | Demonstrate a passwordless/manage-link concept with an **Open sample secure link** transition instead of switching directly to Maya. |
| PF-102 | Planned | Contact verification | Add a simulated code-sent/code-verified state; no message needs to be sent. |
| PF-103 | Planned | Service-specific intake | Include at least one conditional path for contraindications, preferences, patch testing or preparation. |
| PF-104 | Implemented | Separate marketing choice | Booking includes an unchecked optional marketing choice distinct from required policy acceptance and appointment messages. |
| PF-105 | Partial | Appointment history | Upcoming, Past and Cancelled tabs follow the shared appointment status. Completion surfaces review/rebook wording, but review submission is not implemented. |
| PF-106 | Planned | Receipt preview | Open a sample receipt containing provider, appointment, amount, payment status/method and refund history. Current screens show only the payment summary/detail. |
| PF-107 | Partial | Profile saving | Edited Client contact details update the shared record and persist across role/page navigation in the demo session. Communication preferences and richer validation/dirty states remain. |
| PF-108 | Partial | Practitioner client history | The shared Client opens permitted appointment detail. Visit-history detail and functional search remain. |
| PF-109 | Planned | Time-off approval | A Practitioner request should create an Owner task; approval should update both calendars and calculated availability. |
| PF-110 | Partial | Owner client view | The shared client opens appointment detail and balance context. A full client profile with history, preferences, consent and client-level actions remains. |
| PF-111 | Partial | Owner payment/refund detail | Mark-paid and a cancellation-triggered simulated full refund are implemented for the shared appointment. Dedicated transaction detail, manual partial refund and receipt states remain. |
| PF-112 | Planned | Owner action centre | Make the notification bell and attention items open booking changes, cancellations/refunds, policy approvals and time-off requests. |
| PF-113 | Partial | Review workflow | Completion unlocks review/rebook messaging. Client review submission and Owner reply/moderation remain. |
| PF-114 | Partial | Reports interaction | Headline metrics reconcile to visible sample records. Date/status/service filters and drill-downs remain. |

## P2: useful feedback and edge-state coverage

- Add guided scenario choices for a successful visit, client cancellation and payment/refund exception.
- Demonstrate sold-out dates, a slot becoming unavailable between selection and confirmation, an expired manage link, a simulated payment failure and a cancellation outside policy.
- Make search, notification and export controls functional or continue marking them unavailable in the prototype.
- Store the active workspace page in the URL so a reviewer can share a link directly to Owner Payments, Practitioner Calendar or another subpage.
- Include purposeful loading, server-error, stale-slot conflict and no-results states alongside the existing empty and disabled states.
- Explain beside **Reset demo** that it removes only the current browser's sample scenario.

## Known prototype limitations

- Only the primary shared appointment has the full interaction lifecycle; seeded supporting appointments are mostly read-only calendar context.
- Newly confirmed bookings are retained as separate schedule records, but only the newest active record has the full cross-role detail/status/payment interaction lifecycle.
- Practitioner working hours are fixed sample data; only business operating hours are currently editable.
- Time off, configurable staff/resource assignment, multi-room capacity and treatment-specific practitioner eligibility are not modelled; new treatments are assigned to Avni automatically.
- Owner hour changes apply immediately with basic time-order validation; the wider business setup Review lifecycle is not represented beyond treatment-level Draft/Published control.
- Payment is a simulated balance update only; there is no receipt document, refund, failure or reconciliation scenario.
- Client identity uses direct role preview rather than a simulated secure-link or verification transition.
- State is kept in page memory only and resets on refresh. There is no API, database, concurrency protection or external side effect.
- Start times use a fixed 30-minute grid. Lead time, booking horizon, cleanup resources, overnight shifts and daylight-saving edge cases are outside the present prototype.

## Prototype definition of done

The current build supports the central connected path through steps 1–5 below; receipt/review and refund-exception completion remain open:

1. **Works:** Reset the demo.
2. **Works:** As Guest, choose a treatment and calculated slot, complete sample contact information, review price and policy, and simulate confirmation.
3. **Works:** Open the booking as Client, inspect it and reschedule or cancel it.
4. **Works:** Switch to Practitioner, see the shared time, mark the client Arrived and In service, add a note, and complete the visit.
5. **Works:** Switch to Owner, see the same status and event history, and record the balance paid.
6. **Partial:** Return to Client and see the completed/paid state and rebook prompt; open a dedicated receipt and submit a review.
7. **Partial:** Reset, record a sample payment, cancel the booking and see the simulated full refund across Client and Owner; manual partial-refund and failure paths remain.

All data may reset deliberately and no external side effect is required, but the four views must continue to tell one internally consistent story.

## Recommended next implementation sequence

1. Finish direct confirmation actions, service preparation/policy detail and a dedicated receipt.
2. Add refund and cancellation-exception scenarios with matching activity events.
3. Add practitioner shift/time-off editing and connect it to the existing availability engine.
4. Add Owner treatment archiving and the wider setup Review state.
5. Add simulated secure-link/contact verification, client profile persistence and client history.
6. Add review submission/Owner reply, action centre, report filters and remaining edge states.
