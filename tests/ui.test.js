// Integration tests: the real index.html, the real catalog and the real event handlers, run in jsdom.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { NOW, ROOMS } from "../src/data/rooms.js";
import { initApp } from "../src/ui/app.js";

const HTML = readFileSync(new URL("../index.html", import.meta.url), "utf8");

function openPage() {
  const dom = new JSDOM(HTML);
  const doc = dom.window.document;
  initApp(doc, ROOMS, NOW);
  const fire = (el, type) => el.dispatchEvent(new dom.window.Event(type, { bubbles: true }));
  return {
    doc,
    roomIds: () => [...doc.querySelectorAll('input[name="room"]')].map((r) => r.value),
    setAttendees(value) {
      doc.getElementById("attendees").value = value;
      fire(doc.getElementById("attendees"), "input");
    },
    toggleEquipment(item) {
      const box = doc.querySelector(`input[name="equipment"][value="${item}"]`);
      box.checked = !box.checked;
      fire(box, "change");
    },
    selectRoom(id) {
      const radio = doc.querySelector(`input[name="room"][value="${id}"]`);
      radio.checked = true;
      fire(radio, "change");
    },
    check(start, end) {
      doc.getElementById("start-time").value = start;
      doc.getElementById("end-time").value = end;
      doc.getElementById("check-btn").click();
    },
    result: () => ({
      hidden: doc.getElementById("result").hidden,
      title: doc.getElementById("result-title").textContent,
      message: doc.getElementById("result-message").textContent,
      className: doc.getElementById("result").className,
    }),
  };
}

test("UI starts with all rooms, one selected, and no result", () => {
  const page = openPage();
  assert.deepEqual(page.roomIds(), ROOMS.map((r) => r.id));
  assert.equal(page.doc.querySelectorAll('input[name="room"]:checked').length, 1);
  assert.equal(page.result().hidden, true);
  assert.equal(page.doc.getElementById("now-display").textContent, "09:00");
});

test("UI shows only rooms meeting the attendee number", () => {
  const page = openPage();
  page.setAttendees("8");
  assert.deepEqual(page.roomIds(), ["R301", "S105", "L210", "A400"]);
  page.setAttendees("9");
  assert.deepEqual(page.roomIds(), ["S105", "L210", "A400"]);
});

test("UI shows only rooms having all selected equipment", () => {
  const page = openPage();
  page.toggleEquipment("Projector");
  page.toggleEquipment("Whiteboard");
  assert.deepEqual(page.roomIds(), ["R301", "S105"]);
});

test("F4 UI shows a clear empty state and hides the check form", () => {
  const page = openPage();
  page.setAttendees("500");
  assert.deepEqual(page.roomIds(), []);
  assert.match(page.doc.getElementById("rooms-list").textContent, /No rooms match/);
  assert.equal(page.doc.getElementById("room-details").hidden, true);
});

test("UI explains an invalid attendee number", () => {
  const page = openPage();
  page.setAttendees("-2");
  assert.match(page.doc.getElementById("rooms-list").textContent, /whole number/);
});

test("F5 switching rooms refreshes the result using the new room's bookings", () => {
  const page = openPage();
  page.check("10:00", "11:00");
  assert.equal(page.result().title, "Unavailable");
  page.selectRoom("P012");
  assert.equal(page.result().title, "Available");
  page.selectRoom("R301");
  assert.equal(page.result().title, "Unavailable");
});

test("F5 switching rooms before any check shows no result", () => {
  const page = openPage();
  page.selectRoom("P012");
  assert.equal(page.result().hidden, true);
});

test("F5 switching rooms updates the listed bookings", () => {
  const page = openPage();
  assert.match(page.doc.getElementById("bookings-list").textContent, /10:00/);
  page.selectRoom("P012");
  assert.match(page.doc.getElementById("bookings-list").textContent, /No existing bookings/);
});

test("F5 a result disappears when its room is filtered out", () => {
  const page = openPage();
  page.check("12:00", "13:00");
  assert.equal(page.result().hidden, false);
  page.setAttendees("9");
  assert.equal(page.result().hidden, true);
  assert.equal(page.doc.getElementById("room-details").hidden, true);
});

test("F3 selecting a blocked room in the UI reports it as unavailable", () => {
  const page = openPage();
  page.selectRoom("A400");
  page.check("12:00", "13:00");
  assert.equal(page.result().title, "Unavailable");
  assert.match(page.result().className, /blocked/);
  assert.match(page.result().message, /blocked/);
});

test("AC6 an empty time field gives a clear message", () => {
  const page = openPage();
  page.check("", "12:00");
  assert.match(page.result().message, /enter both/);
});
