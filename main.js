import { canBook } from "./src/logic/booking.js";
import { minutesToTime, timeToMinutes } from "./src/logic/time.js";

// ---------- Fictional data ----------
const NOW = 540; // 09:00 in minutes after midnight
const existingBookings = [{ start: 600, end: 660 }]; // 10:00 - 11:00

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
