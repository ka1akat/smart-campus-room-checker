// Tests for the room catalog and the F1-F3 rules.
import { test } from "node:test";
import assert from "node:assert/strict";
import { ROOMS, NOW } from "../src/data/rooms.js";
import { checkRoom } from "../src/logic/booking.js";
import { allEquipment, filterRooms, parseAttendees } from "../src/logic/filters.js";

const room = (id, capacity, equipment, extra = {}) => ({
  id, name: id, capacity, equipment, blocked: false, bookings: [], ...extra,
});
const A = room("A", 10, ["Projector", "Whiteboard"]);
const B = room("B", 4, ["Whiteboard"]);
const C = room("C", 30, ["Projector"]);
const FIXTURE = [A, B, C];
const ids = (rooms) => rooms.map((r) => r.id);

test("catalog has at least four fictional rooms with all required fields", () => {
  assert.ok(ROOMS.length >= 4);
  for (const r of ROOMS) {
    assert.equal(typeof r.id, "string");
    assert.equal(typeof r.name, "string");
    assert.ok(Number.isInteger(r.capacity));
    assert.ok(Array.isArray(r.equipment));
    assert.equal(typeof r.blocked, "boolean");
    assert.ok(Array.isArray(r.bookings));
  }
});
test("catalog room ids are unique", () => {
  assert.equal(new Set(ROOMS.map((r) => r.id)).size, ROOMS.length);
});

test("F1 capacity exactly equal to attendees is kept", () => {
  assert.deepEqual(ids(filterRooms(FIXTURE, { attendees: 10 })), ["A", "C"]);
});
test("F1 capacity one below attendees is removed", () => {
  assert.deepEqual(ids(filterRooms(FIXTURE, { attendees: 11 })), ["C"]);
});
test("F1 no attendee number keeps every room", () => {
  assert.deepEqual(ids(filterRooms(FIXTURE, { attendees: null })), ["A", "B", "C"]);
});
test("F1 invalid attendee values give an error", () => {
  for (const bad of ["0", "-3", "2.5", "abc"]) {
    assert.ok(parseAttendees(bad).error, `expected an error for ${bad}`);
  }
  assert.deepEqual(parseAttendees("12"), { attendees: 12, error: null });
  assert.deepEqual(parseAttendees(""), { attendees: null, error: null });
});

test("F2 room must have every selected item, not just one", () => {
  assert.deepEqual(ids(filterRooms(FIXTURE, { equipment: ["Projector", "Whiteboard"] })), ["A"]);
});
test("F2 no selected items keeps every room", () => {
  assert.deepEqual(ids(filterRooms(FIXTURE, { equipment: [] })), ["A", "B", "C"]);
});
test("F1 and F2 apply together", () => {
  assert.deepEqual(ids(filterRooms(FIXTURE, { attendees: 11, equipment: ["Whiteboard"] })), []);
});
test("equipment options come from the catalog without repeats", () => {
  assert.deepEqual(allEquipment(FIXTURE), ["Projector", "Whiteboard"]);
});

test("F3 a blocked room is never reported as available", () => {
  const blocked = ROOMS.find((r) => r.blocked);
  assert.ok(blocked, "catalog needs a blocked room");
  assert.equal(checkRoom(blocked, 1200, 1260, NOW).canBook, false);
});
test("availability uses the chosen room's bookings, not another room's", () => {
  const busy = room("busy", 5, [], { bookings: [{ start: 600, end: 660 }] });
  const free = room("free", 5, []);
  assert.equal(checkRoom(busy, 600, 660, NOW).canBook, false);
  assert.equal(checkRoom(free, 600, 660, NOW).canBook, true);
});
test("filtering does not change or reorder the rooms", () => {
  const before = structuredClone(FIXTURE);
  filterRooms(FIXTURE, { attendees: 5, equipment: ["Projector"] });
  assert.deepEqual(FIXTURE, before);
});
test("catalog data cannot be changed by accident", () => {
  assert.throws(() => ROOMS[0].bookings.push({ start: 0, end: 1 }), TypeError);
});
