// ---------- Fictional data ----------
const NOW = 540; // 09:00 in minutes after midnight
const existingBookings = [{ start: 600, end: 660 }]; // 10:00 - 11:00

// ---------- Helpers ----------
function pad2(n) {
  return String(n).padStart(2, "0");
}

function minutesToTime(m) {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${pad2(h)}:${pad2(min)}`;
}

function timeToMinutes(str) {
  const [h, m] = str.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  // Touching endpoints do NOT overlap.
  return aStart < bEnd && bStart < aEnd;
}

// ---------- Core logic ----------
/**
 * Returns { canBook: boolean, reason: string|null }.
 * Rules:
 *  AC1: 0 <= start < end <= 1440, and start must be strictly after now.
 *  AC2: Duration must not exceed 120 minutes (exactly 120 is allowed).
 *  AC3: Reject every request when the room is blocked.
 *  AC4: Reject overlap with any existing booking (touching endpoints are fine).
 */
function canBook(start, end, now, blocked, existing) {
  if (blocked) {
    return { canBook: false, reason: "The room is currently blocked and cannot be booked." };
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(now)) {
    return { canBook: false, reason: "Start, end, and now must be integer minutes." };
  }
  if (start < 0 || end > 1440 || start >= end) {
    return { canBook: false, reason: "Please pick a valid time range: start before end, within 00:00 to 24:00." };
  }
  if (start <= now) {
    return { canBook: false, reason: `The start time must be strictly after the current time (${minutesToTime(now)}).` };
  }
  const duration = end - start;
  if (duration > 120) {
    return { canBook: false, reason: `The booking is ${duration} minutes long. The maximum allowed duration is 120 minutes.` };
  }
  for (const b of existing) {
    if (overlaps(start, end, b.start, b.end)) {
      return {
        canBook: false,
        reason: `This overlaps with an existing booking from ${minutesToTime(b.start)} to ${minutesToTime(b.end)}.`,
      };
    }
  }
  return { canBook: true, reason: null };
}

// ---------- UI ----------
const startInput = document.getElementById("start-time");
const endInput = document.getElementById("end-time");
const blockedToggle = document.getElementById("blocked-toggle");
const checkBtn = document.getElementById("check-btn");
const resultBox = document.getElementById("result");
const resultIcon = document.getElementById("result-icon");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const bookingsList = document.getElementById("bookings-list");
const nowDisplay = document.getElementById("now-display");

nowDisplay.textContent = minutesToTime(NOW);

function renderBookings() {
  bookingsList.innerHTML = "";
  if (existingBookings.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No existing bookings.";
    bookingsList.appendChild(li);
    return;
  }
  for (const b of existingBookings) {
    const li = document.createElement("li");
    const dot = document.createElement("span");
    dot.className = "dot";
    li.appendChild(dot);
    const text = document.createElement("span");
    text.textContent = `${minutesToTime(b.start)} \u2013 ${minutesToTime(b.end)}`;
    li.appendChild(text);
    bookingsList.appendChild(li);
  }
}

function showResult(state, title, message) {
  resultBox.hidden = false;
  resultBox.className = `result ${state}`;
  resultTitle.textContent = title;
  resultMessage.textContent = message;
}

function runCheck() {
  if (startInput.value === "" || endInput.value === "") {
    showResult("unavailable", "Unavailable", "Please enter both a start time and an end time.");
    return;
  }

  const start = timeToMinutes(startInput.value);
  const end = timeToMinutes(endInput.value);
  const blocked = blockedToggle.checked;

  const { canBook: ok, reason } = canBook(start, end, NOW, blocked, existingBookings);

  if (ok) {
    showResult("available", "Available", `The room is free from ${minutesToTime(start)} to ${minutesToTime(end)}. You can proceed to book this time.`);
  } else {
    const state = blocked ? "blocked" : "unavailable";
    showResult(state, "Unavailable", reason);
  }
}

renderBookings();
checkBtn.addEventListener("click", runCheck);
