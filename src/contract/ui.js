// Practice #12 contract, step 3: presentation. Reads the form, calls checkAvailability, writes text.
// No booking rule lives here. Text is written with textContent only (no innerHTML), so input cannot inject HTML.
import { minutesToTime, timeToMinutes } from "../logic/time.js";
import { checkAvailability } from "./availability.js";

function readStart(input) {
  return input.value === "" ? null : timeToMinutes(input.value);
}

function readDuration(input) {
  // A number field with letters in it reports an empty value plus badInput.
  if (input.validity?.badInput || input.value.trim() === "") return Number.NaN;
  return Number(input.value);
}

export function initContractPage(doc, room, now) {
  const byId = (id) => doc.getElementById(id);
  const startInput = byId("start-time");
  const durationInput = byId("duration");
  const statusSelect = byId("room-status");
  const resultBox = byId("result");

  byId("now-display").textContent = minutesToTime(now);
  byId("room-name").textContent = room.name;

  const list = byId("bookings-list");
  list.replaceChildren(
    ...room.bookings.map((b) => {
      const li = doc.createElement("li");
      li.textContent = `${minutesToTime(b.start)} – ${minutesToTime(b.end)}`;
      return li;
    }),
  );

  function showResult(outcome) {
    const state = outcome.isValidationError ? "invalid" : outcome.available ? "available" : "unavailable";
    resultBox.hidden = false;
    resultBox.className = `result ${state === "invalid" ? "blocked" : state}`;
    resultBox.dataset.available = String(outcome.available);
    byId("result-title").textContent = outcome.isValidationError ? "Invalid input" : outcome.available ? "Available" : "Unavailable";
    byId("result-message").textContent = outcome.message;
    byId("result-code").textContent = `Reason code: ${outcome.reasonCode} · available = ${outcome.available}`;
  }

  function runCheck() {
    showResult(
      checkAvailability({
        startMinutes: readStart(startInput),
        durationMinutes: readDuration(durationInput),
        blocked: statusSelect.value === "blocked",
        bookings: room.bookings,
        now,
      }),
    );
  }

  byId("check-btn").addEventListener("click", runCheck);
  // A result describes the old input; hide it as soon as any input changes.
  for (const el of [startInput, durationInput, statusSelect]) {
    el.addEventListener("input", () => { resultBox.hidden = true; });
    el.addEventListener("change", () => { resultBox.hidden = true; });
  }
}
