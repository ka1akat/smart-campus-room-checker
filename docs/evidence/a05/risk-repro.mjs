// Usage (from the repo root, after npm ci): node docs/evidence/a05/risk-repro.mjs "$PWD"
// Read-only reproduction of candidate risks. Runs the real index.html + app in jsdom.
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
const repo = process.argv[2];
const { JSDOM } = await import(pathToFileURL(repo + "/node_modules/jsdom/lib/api.js"));
const { NOW, ROOMS } = await import(pathToFileURL(repo + "/src/data/rooms.js"));
const { initApp } = await import(pathToFileURL(repo + "/src/ui/app.js"));
const { canBook } = await import(pathToFileURL(repo + "/src/logic/booking.js"));
const dom = new JSDOM(readFileSync(repo + "/index.html", "utf8"));
const doc = dom.window.document;
initApp(doc, ROOMS, NOW);
const $ = (id) => doc.getElementById(id);
const show = (label) => console.log(label, JSON.stringify({ hidden: $("result").hidden, title: $("result-title").textContent, message: $("result-message").textContent }));

console.log("== C1 stale result after editing the time fields (Room 301, booking 10:00-11:00)");
$("start-time").value = "12:00"; $("end-time").value = "13:00"; $("check-btn").click();
show("after check 12:00-13:00:");
$("start-time").value = "10:00"; $("start-time").dispatchEvent(new dom.window.Event("input", { bubbles: true }));
$("end-time").value = "11:00"; $("end-time").dispatchEvent(new dom.window.Event("input", { bubbles: true }));
console.log("fields now:", $("start-time").value, "-", $("end-time").value, "(this slot overlaps the 10:00-11:00 booking)");
show("result still shown, no click:");

console.log("== C2 malformed time value in the time input");
$("start-time").value = "25:99";
console.log("start-time value after setting '25:99':", JSON.stringify($("start-time").value));
console.log("canBook(NaN, 720, ...) reason:", canBook(NaN, 720, 540, false, []).reason);

console.log("== C3 blocked room state is decided twice");
console.log("canBook blocked reason:", canBook(600, 660, 540, true, []).reason);
