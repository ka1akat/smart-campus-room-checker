# Smart Campus Room Availability Checker

Software Engineering – Assignment #04 (KBTU), continuing Assignment #03
Student: Zhaslan Karakat (24B031781)

A one-page responsive prototype: filter a small catalog of rooms by attendees and equipment, select one, and check whether it is available for a chosen time slot. The page only **checks** availability: it does not create, save or confirm bookings. All data is fictional.

**Live demo of the Assignment #03 version (no catalog yet):** https://smart-campus-room-ch-56xg.bolt.host

## Requirements

**Original (still enforced)**

- **AC1.** Times are integer minutes after midnight: `0 <= start < end <= 1440`; start must be strictly after `now`.
- **AC2.** Duration must not exceed 120 minutes. Exactly 120 minutes is allowed.
- **AC3.** Every request is rejected when the room is blocked.
- **AC4.** Overlap with an existing booking is rejected. Intervals touching at an endpoint do not overlap.
- **AC5.** A clear "Available" / "Unavailable" result is shown; existing bookings are never modified.
- **AC6.** Understandable validation messages and a usable mobile layout.

**New (Assignment #04)**

- **F1.** Room capacity must be greater than or equal to the requested attendees.
- **F2.** A room must contain ALL selected equipment.
- **F3.** A blocked room cannot be reported as available.
- **F4.** A clear empty state is shown when no rooms match.
- **F5.** Changing the selected room refreshes the availability result.

## Project structure

| File | Responsibility |
|------|----------------|
| `index.html`, `style.css` | Page structure and styling |
| `main.js` | Entry point: passes the data to the app |
| `src/data/rooms.js` | Fictional room catalog and fixed current time |
| `src/logic/booking.js` | Booking rules AC1–AC4 and `checkRoom` |
| `src/logic/filters.js` | Filtering rules F1–F2 |
| `src/logic/time.js` | Conversion between `HH:MM` and minutes |
| `src/ui/render.js` | Everything that draws on the page |
| `src/ui/app.js` | Page state and event handling |
| `tests/` | Automated tests |
| `scripts/characterize.mjs` | Optional tool that records page behaviour for comparison |
| `docs/` | Test results, behaviour comparison and screenshots |

## Setup, run and test

Requires Node.js 18 or newer.

```bash
npm install      # install Vite and jsdom
npm run dev      # start the page, then open the address it prints
npm test         # run all automated tests
npm run build    # optional: production build into dist/
```

## Known limitations

- The browser time picker cannot select 24:00, so a booking ending at 1440 cannot be entered on the page (the rule is correct and tested).
- The success message says "You can proceed to book this time", although the page only checks availability. It is kept so behaviour stays identical to the original.
- Changing the time fields does not refresh a result already shown; press the button again.
- UI tests run in jsdom, which does not check visual layout. The mobile layout was checked separately in a browser.

## Versions

- `8e1ad60` – Assignment #03 baseline: one room, logic in `main.js` plus a Python copy in `booking.py`.
- `assignment-04` branch – room catalog, filters, modules and JavaScript test suite. The Python copy was removed; its 20 test cases now run against the JavaScript rules.

## Tools

Bolt.new and Claude (Assignment #03); Claude (Assignment #04, November 2026). All data is fictional.
