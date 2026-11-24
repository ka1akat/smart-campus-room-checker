// Appsmith JSObject "Checker" — Practice #12 low-code version.
// Paste this into Appsmith: Queries/JS -> + New JS Object -> rename it to Checker -> replace all code.
// This is the only script in the low-code app. Widgets: inpStart (Input, Text), inpDuration (Input, Number),
// selStatus (Select: Open/Blocked), btnCheck (Button), txtTitle / txtMessage / txtCode (Text).
// The rules are the same as the code-based version (AC1–AC6); the same fictional data is typed in here.
export default {
  NOW: 540,                              // fixed "current time" 09:00, same as the code-based version
  BOOKINGS: [{ start: 600, end: 660 }],  // Room 301: 10:00–11:00 (fictional)
  MAX_DURATION: 120,

  toMinutes(text) {
    // Accepts "H:MM" or "HH:MM" (00:00–23:59). Returns null for anything else.
    const m = /^(\d{1,2}):(\d{2})$/.exec((text || "").trim());
    if (!m) return null;
    const h = Number(m[1]), min = Number(m[2]);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  },

  toText(minutes) {
    const h = String(Math.floor(minutes / 60)).padStart(2, "0");
    const m = String(minutes % 60).padStart(2, "0");
    return h + ":" + m;
  },

  evaluate(startText, durationText, status) {
    const start = this.toMinutes(startText);
    if (start === null) return { available: false, code: "MISSING_START", title: "Invalid input", message: "Please enter a start time as HH:MM, for example 11:30." };
    if (start <= this.NOW) return { available: false, code: "PAST_START", title: "Invalid input", message: "Start time must be in the future (after " + this.toText(this.NOW) + ")." };
    const raw = String(durationText ?? "").trim();
    const duration = raw === "" ? NaN : Number(raw);
    if (!Number.isInteger(duration)) return { available: false, code: "INVALID_DURATION", title: "Invalid input", message: "Duration must be a whole number of minutes." };
    if (duration <= 0) return { available: false, code: "INVALID_DURATION", title: "Invalid input", message: "Duration must be greater than 0 minutes." };
    if (duration > this.MAX_DURATION) return { available: false, code: "INVALID_DURATION", title: "Invalid input", message: "Duration must be at most 120 minutes." };
    const end = start + duration;
    if (end > 1440) return { available: false, code: "ENDS_AFTER_MIDNIGHT", title: "Invalid input", message: "The booking must end by 24:00." };
    if (status === "blocked") return { available: false, code: "ROOM_BLOCKED", title: "Unavailable", message: "The room is blocked, so no time can be booked." };
    const slot = this.toText(start) + "–" + this.toText(end);
    for (const b of this.BOOKINGS) {
      if (start < b.end && b.start < end) {   // touching endpoints do NOT overlap
        return { available: false, code: "OVERLAP", title: "Unavailable", message: slot + " overlaps with an existing booking from " + this.toText(b.start) + " to " + this.toText(b.end) + "." };
      }
    }
    return { available: true, code: "OK", title: "Available", message: "The room is free from " + slot + "." };
  },

  async check() {
    const result = this.evaluate(inpStart.text, inpDuration.text, selStatus.selectedOptionValue);
    await storeValue("result", result);   // Text widgets read appsmith.store.result
    return result;
  },

  bookingsText() {
    return this.BOOKINGS.map(b => this.toText(b.start) + " – " + this.toText(b.end)).join(", ");
  }
}
