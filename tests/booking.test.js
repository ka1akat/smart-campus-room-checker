// Regression tests for AC1-AC5. These are the 20 cases of the old test_booking.py,
// now running against the code the page really uses.
import { test } from "node:test";
import assert from "node:assert/strict";
import { canBook } from "../src/logic/booking.js";

const NOW = 540;
const EXISTING = [{ start: 600, end: 660 }];
const check = (start, end, { now = NOW, blocked = false, existing = EXISTING } = {}) =>
  canBook(start, end, now, blocked, existing).canBook;

test("AC4 touching the end of a booking is available", () => assert.equal(check(660, 720), true));
test("AC4 touching the start of a booking is available", () => assert.equal(check(560, 600), true));
test("AC4 overlapping by part of a booking is unavailable", () => assert.equal(check(630, 690), false));
test("AC4 one-minute overlap at the end is unavailable", () => assert.equal(check(659, 720), false));
test("AC4 one-minute overlap at the start is unavailable", () => assert.equal(check(560, 601), false));
test("AC4 request inside a booking is unavailable", () => assert.equal(check(610, 650), false));
test("AC4 request covering a booking is unavailable", () => assert.equal(check(590, 670), false));
test("AC4 exact gap between two bookings is available", () => {
  assert.equal(check(660, 720, { existing: [{ start: 600, end: 660 }, { start: 720, end: 780 }] }), true);
});
test("AC4 overlap with the second booking is unavailable", () => {
  assert.equal(check(700, 750, { existing: [{ start: 600, end: 660 }, { start: 720, end: 780 }] }), false);
});
test("AC4 no bookings is available", () => assert.equal(check(600, 660, { existing: [] }), true));

test("AC3 blocked room rejects an otherwise valid request", () => assert.equal(check(660, 720, { blocked: true }), false));
test("AC3 blocked room gives the blocked reason first", () => {
  assert.match(canBook(100, 50, NOW, true, []).reason, /blocked/);
});

test("AC2 exactly 120 minutes is available", () => assert.equal(check(720, 840), true));
test("AC2 121 minutes is unavailable", () => assert.equal(check(720, 841), false));

test("AC1 starting exactly at now is unavailable", () => assert.equal(check(540, 570), false));
test("AC1 starting one minute after now is available", () => assert.equal(check(541, 570), true));
test("AC1 starting before now is unavailable", () => assert.equal(check(500, 560), false));
test("AC1 reversed times are unavailable", () => assert.equal(check(720, 660), false));
test("AC1 zero length is unavailable", () => assert.equal(check(700, 700), false));
test("AC1 ending at 1440 is available", () => assert.equal(check(1380, 1440), true));
test("AC1 ending after 1440 is unavailable", () => assert.equal(check(1400, 1441), false));
test("AC1 negative start is unavailable", () => assert.equal(check(-10, 30, { now: -20, existing: [] }), false));
test("AC1 non-integer times are unavailable", () => {
  assert.equal(check(660.5, 720), false);
  assert.equal(check("660", 720), false);
});

test("AC5 checking does not change the bookings", () => {
  const bookings = [{ start: 600, end: 660 }, { start: 720, end: 780 }];
  const before = structuredClone(bookings);
  check(660, 720, { existing: bookings });
  check(630, 690, { existing: bookings });
  assert.deepEqual(bookings, before);
});
