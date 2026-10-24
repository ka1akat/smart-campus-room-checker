# Smart Campus Room Availability Checker

Software Engineering – Assignment #03 (KBTU)
Student: Zhaslan Karakat (24B031781)

A one-page responsive prototype that checks whether a campus room is available for a chosen time slot. The page only **checks** availability: it does not create, save or confirm bookings. All data is fictional.

**Live demo:** https://smart-campus-room-ch-56xg.bolt.host

## User story

As a student, I want to check a room's availability so that I can choose a valid booking time.

## Acceptance criteria

- **AC1.** Times are integer minutes after midnight: `0 <= start < end <= 1440`; start must be strictly after `now`.
- **AC2.** Duration must not exceed 120 minutes. Exactly 120 minutes is allowed.
- **AC3.** Every request is rejected when the room is blocked.
- **AC4.** Overlap with an existing booking is rejected. Intervals touching at an endpoint do not overlap.
- **AC5.** A clear "Available" / "Unavailable" result is shown; existing bookings are never modified.
- **AC6.** Understandable validation messages and a usable mobile layout.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure |
| `main.js` | `canBook(...)` logic and UI handling |
| `style.css` | Styling and narrow-screen layout |
| `booking.py` | Python implementation of `can_book(start, end, now, blocked, existing)` |
| `test_booking.py` | 20 unit tests (`unittest`) for `can_book` |

## How to run

**Web prototype**
