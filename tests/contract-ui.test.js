// Practice #12: T1–T8 through the real availability.html page and event handlers (jsdom).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { NOW, ROOM } from "../src/data/practice12.js";
import { initContractPage } from "../src/contract/ui.js";

const HTML = readFileSync(new URL("../availability.html", import.meta.url), "utf8");

function openPage() {
  const dom = new JSDOM(HTML);
  const doc = dom.window.document;
  initContractPage(doc, ROOM, NOW);
  const byId = (id) => doc.getElementById(id);
  return {
    doc,
    check(start, duration, status = "open") {
      byId("start-time").value = start;
      byId("duration").value = String(duration);
      byId("room-status").value = status;
      byId("check-btn").click();
      return {
        hidden: byId("result").hidden,
        title: byId("result-title").textContent,
        message: byId("result-message").textContent,
        code: byId("result-code").textContent,
      };
    },
    bookingsText: () => [...doc.querySelectorAll("#bookings-list li")].map((li) => li.textContent),
  };
}

test("page shows room, fixed time and the fictional booking", () => {
  const page = openPage();
  assert.equal(page.doc.getElementById("room-name").textContent, "Room 301");
  assert.equal(page.doc.getElementById("now-display").textContent, "09:00");
  assert.deepEqual(page.bookingsText(), ["10:00 – 11:00"]);
  assert.equal(page.doc.getElementById("result").hidden, true);
});

test("UI T1–T7 show the expected decision and reason code", () => {
  const page = openPage();
  const cases = [
    ["T1", "11:30", 60, "open", "Available", "OK"],
    ["T2", "10:30", 60, "open", "Unavailable", "OVERLAP"],
    ["T3", "11:30", 60, "blocked", "Unavailable", "ROOM_BLOCKED"],
    ["T4", "11:30", 0, "open", "Invalid input", "INVALID_DURATION"],
    ["T5", "11:30", 121, "open", "Invalid input", "INVALID_DURATION"],
    ["T6", "08:00", 30, "open", "Invalid input", "PAST_START"],
    ["T7", "11:00", 60, "open", "Available", "OK"],
  ];
  for (const [id, start, duration, status, title, code] of cases) {
    const r = page.check(start, duration, status);
    assert.equal(r.hidden, false, id);
    assert.equal(r.title, title, id);
    assert.match(r.code, new RegExp(`Reason code: ${code} `), id);
    assert.ok(r.message.length > 0, `${id} has a message`);
  }
});

test("UI T8 bookings list is the same after all checks", () => {
  const page = openPage();
  const before = page.bookingsText();
  for (const [s, d, st] of [["11:30", 60, "open"], ["10:30", 60, "open"], ["11:30", 60, "blocked"], ["11:30", 0, "open"], ["11:30", 121, "open"], ["08:00", 30, "open"], ["11:00", 60, "open"]]) {
    page.check(s, d, st);
  }
  assert.deepEqual(page.bookingsText(), before);
  assert.deepEqual(ROOM.bookings, [{ start: 600, end: 660 }]);
});

test("empty start time gives an understandable message", () => {
  const r = openPage().check("", 60);
  assert.equal(r.title, "Invalid input");
  assert.equal(r.message, "Please choose a start time.");
});

test("editing an input hides the old result", () => {
  const page = openPage();
  page.check("11:30", 60);
  const duration = page.doc.getElementById("duration");
  duration.value = "90";
  duration.dispatchEvent(new page.doc.defaultView.Event("input", { bubbles: true }));
  assert.equal(page.doc.getElementById("result").hidden, true);
});

test("script-like text is shown as plain text, never parsed as HTML", () => {
  const page = openPage();
  const r = page.check("11:30", 60);
  assert.equal(page.doc.querySelectorAll("#result script, #result img").length, 0);
  assert.ok(!r.message.includes("<"));
});
