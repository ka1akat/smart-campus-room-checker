// Practice #12: the eight shared test cases T1–T8 run against the contract logic.
// The same inputs are used by hand in the low-code version.
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkAvailability } from "../src/contract/availability.js";
import { REASON_CODE, validateRequest } from "../src/contract/validation.js";
import { NOW, ROOM } from "../src/data/practice12.js";
import { timeToMinutes } from "../src/logic/time.js";

const run = (start, duration, blocked = false, bookings = ROOM.bookings) =>
  checkAvailability({ startMinutes: timeToMinutes(start), durationMinutes: duration, blocked, bookings, now: NOW });

test("fixture: Room 301, now 09:00, one booking 10:00–11:00", () => {
  assert.equal(NOW, 540);
  assert.deepEqual(ROOM.bookings, [{ start: 600, end: 660 }]);
});

test("T1 valid free interval 11:30 + 60 -> Available", () => {
  const r = run("11:30", 60);
  assert.equal(r.available, true);
  assert.equal(r.reasonCode, REASON_CODE.OK);
});

test("T2 overlap 10:30 + 60 -> Unavailable (OVERLAP)", () => {
  const r = run("10:30", 60);
  assert.equal(r.available, false);
  assert.equal(r.reasonCode, REASON_CODE.OVERLAP);
  assert.equal(r.isValidationError, false);
});

test("T3 blocked room 11:30 + 60 -> Unavailable (ROOM_BLOCKED)", () => {
  const r = run("11:30", 60, true);
  assert.equal(r.available, false);
  assert.equal(r.reasonCode, REASON_CODE.ROOM_BLOCKED);
});

test("T4 duration 0 -> validation error", () => {
  const r = run("11:30", 0);
  assert.equal(r.isValidationError, true);
  assert.equal(r.reasonCode, REASON_CODE.INVALID_DURATION);
  assert.match(r.message, /greater than 0/);
});

test("T5 duration 121 -> validation error", () => {
  const r = run("11:30", 121);
  assert.equal(r.isValidationError, true);
  assert.equal(r.reasonCode, REASON_CODE.INVALID_DURATION);
  assert.match(r.message, /at most 120/);
});

test("T6 past start 08:00 + 30 -> validation error", () => {
  const r = run("08:00", 30);
  assert.equal(r.isValidationError, true);
  assert.equal(r.reasonCode, REASON_CODE.PAST_START);
});

test("T7 adjacent 11:00 + 60 (touches end of 10:00–11:00) -> Available", () => {
  const r = run("11:00", 60);
  assert.equal(r.available, true);
  assert.equal(r.reasonCode, REASON_CODE.OK);
});

test("T8 booking data unchanged after T1–T7", () => {
  const bookings = structuredClone(ROOM.bookings);
  const before = structuredClone(bookings);
  run("11:30", 60, false, bookings);
  run("10:30", 60, false, bookings);
  run("11:30", 60, true, bookings);
  run("11:30", 0, false, bookings);
  run("11:30", 121, false, bookings);
  run("08:00", 30, false, bookings);
  run("11:00", 60, false, bookings);
  assert.deepEqual(bookings, before);
  assert.ok(Object.isFrozen(ROOM.bookings), "the real fixture is frozen, so it cannot be changed at all");
});

// Boundaries around the eight cases.
test("duration exactly 120 is allowed, 1 is allowed", () => {
  assert.equal(run("11:30", 120).available, true);
  assert.equal(run("11:30", 1).available, true);
});
test("start exactly at now (09:00) is not in the future", () => {
  assert.equal(run("09:00", 30).reasonCode, REASON_CODE.PAST_START);
});
test("missing start, empty/non-integer/negative duration give clear messages", () => {
  assert.equal(validateRequest({ startMinutes: null, durationMinutes: 60, now: NOW }).reasonCode, REASON_CODE.MISSING_START);
  assert.equal(validateRequest({ startMinutes: 700, durationMinutes: Number.NaN, now: NOW }).reasonCode, REASON_CODE.INVALID_DURATION);
  assert.equal(validateRequest({ startMinutes: 700, durationMinutes: 30.5, now: NOW }).reasonCode, REASON_CODE.INVALID_DURATION);
  assert.equal(validateRequest({ startMinutes: 700, durationMinutes: -5, now: NOW }).reasonCode, REASON_CODE.INVALID_DURATION);
});
test("booking that would end after 24:00 is rejected", () => {
  assert.equal(run("23:30", 60).reasonCode, REASON_CODE.ENDS_AFTER_MIDNIGHT);
  assert.equal(run("23:00", 60).available, true);
});
test("ending exactly where a booking starts is available, one minute into it is not", () => {
  assert.equal(run("09:30", 30).available, true);
  assert.equal(run("09:30", 31).reasonCode, REASON_CODE.OVERLAP);
});
