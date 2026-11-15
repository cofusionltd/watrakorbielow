# Booking.com Integration Setup Notes

Last updated: 2026-11-15

## Goal

Synchronize room availability and reservations between the Watra website and Booking.com, including bookings and cancellations made on either channel.

## Current status

- The app does not currently have a real Booking.com or iCal integration.
- The database has a `source` field for reservations, including `booking.com`, but that alone does not import or synchronize bookings.
- Some availability and booking responses currently claim that dates are synchronized or immediately blocked on Booking.com. Those claims are not backed by a live connection and should be corrected before relying on the app for channel synchronization.
- The app currently models four room categories and reports one available unit for each. The property owner has said there are 40 rooms in total, but has not yet provided the count per category or confirmed how these categories map to Booking.com room types.

## Integration options

### iCal calendar sync

iCal is a limited calendar feed. It can communicate occupied date ranges, but does not synchronize guest contact details, prices, payments, messages, or all booking changes as a full channel connection would. Calendar imports are periodic, so changes may not appear immediately; do not rely on iCal alone to guarantee prevention of double bookings.

The app would need a secure, stable HTTPS calendar feed per correctly mapped inventory calendar, plus an importer for Booking.com calendar feeds, if that option is chosen. Feed URLs should be treated as private credentials: keep them out of source control, logs, public pages, and support messages. The app must also handle cancellations, updates, duplicate events, and stale imports.

### Booking.com connectivity provider / channel manager

For fuller reservation, cancellation, availability, and potentially rate synchronization, investigate a Booking.com-listed connectivity provider/channel manager. Booking.com connectivity is not an ordinary public API integration that can be enabled by adding an API key to this app; provider eligibility, onboarding, supported features, and fees depend on the provider and property.

Before choosing a provider, confirm its current written pricing and whether the quote includes:

- Booking.com connection and any additional OTA connections
- Monthly/property/room fees, setup fees, and commission
- Two-way availability updates and booking/cancellation delivery
- Rate and restriction updates, if needed
- Inventory mapping for 40 physical rooms and the app's room categories
- API/webhook access, credentials, sandbox, retry behavior, and support
- How existing reservations are migrated or reconciled

Booking.com commission and the channel manager's service fees are separate costs. Get current quotes directly from providers; pricing varies and is not established by this note.

Provider directory: <https://connectivity.booking.com/>

## Decisions and information still needed

1. Provide the physical room count for each app category: Standard, Comfort with balcony, Family Studio, and Mountain Suite. Confirm whether these align with the room types listed in Booking.com. The counts should total 40.
2. Decide whether to use a channel manager (recommended for fuller two-way booking sync) or accept iCal's availability-only limitations.
3. If using a channel manager, select a provider and obtain its API documentation, test/sandbox access, credentials, and exact product/feature scope.
4. Define which system is authoritative for inventory, prices, and cancellations, and how to reconcile existing reservations during onboarding.
5. Test a new reservation, date change, cancellation, duplicate event, and temporary provider outage before enabling production synchronization.

## Website contact-form messages

Messages submitted through the website's Contact page are saved in the app database. To read them, sign in to the admin panel, open **Frequent Guests & Badges** (shown as "Stali Goscie & Odznaki" in the Polish UI), select the guest matching the sender's email address, and review that guest's message history. The saved inquiry includes the sender's phone number and planned dates (when provided) in the message body.
