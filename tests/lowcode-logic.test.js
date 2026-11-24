// Practice #12: sanity check of the Appsmith JSObject logic OUTSIDE Appsmith.
// It loads lowcode/appsmith/Checker.js and runs evaluate() for T1–T7. This proves the pasted script is
// correct JavaScript with the same decisions; it does NOT replace the manual tests inside Appsmith.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../lowcode/appsmith/Checker.js", import.meta.url), "utf8");
const Checker = new Function(src.replace("export default", "return"))();

test("Appsmith script gives the expected decisions for T1–T7", () => {
  const cases = [
    ["T1", "11:30", "60", "open", true, "OK"],
    ["T2", "10:30", "60", "open", false, "OVERLAP"],
    ["T3", "11:30", "60", "blocked", false, "ROOM_BLOCKED"],
    ["T4", "11:30", "0", "open", false, "INVALID_DURATION"],
    ["T5", "11:30", "121", "open", false, "INVALID_DURATION"],
    ["T6", "08:00", "30", "open", false, "PAST_START"],
    ["T7", "11:00", "60", "open", true, "OK"],
  ];
  for (const [id, s, d, st, available, code] of cases) {
    const r = Checker.evaluate(s, d, st);
    assert.equal(r.available, available, id);
    assert.equal(r.code, code, id);
  }
  assert.deepEqual(Checker.BOOKINGS, [{ start: 600, end: 660 }], "T8 data unchanged");
});
