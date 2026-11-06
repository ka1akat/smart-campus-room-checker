// Connects the page to the rules: holds the selection, reacts to events, asks render.js to draw.
import { checkRoom } from "../logic/booking.js";
import { allEquipment, filterRooms, parseAttendees } from "../logic/filters.js";
import { minutesToTime, timeToMinutes } from "../logic/time.js";
import { hideResult, renderBookings, renderEquipmentOptions, renderRooms, showResult } from "./render.js";

const NO_MATCH_TEXT = "No rooms match your requirements. Try fewer attendees or less equipment.";

export function initApp(doc, rooms, now) {
  const byId = (id) => doc.getElementById(id);
  const attendeesInput = byId("attendees");
  const equipmentOptions = byId("equipment-options");
  const roomsList = byId("rooms-list");
  const roomDetails = byId("room-details");
  const selectedRoomName = byId("selected-room-name");
  const bookingsList = byId("bookings-list");
  const startInput = byId("start-time");
  const endInput = byId("end-time");
  const resultEls = { box: byId("result"), title: byId("result-title"), message: byId("result-message") };

  let selectedId = rooms[0]?.id ?? null;
  let hasChecked = false;

  const selectedRoom = () => rooms.find((room) => room.id === selectedId) ?? null;

  function readRequirements() {
    // A browser reports letters typed in a number field as an empty value plus badInput.
    const raw = attendeesInput.validity.badInput ? "invalid" : attendeesInput.value;
    const { attendees, error } = parseAttendees(raw);
    const equipment = [...equipmentOptions.querySelectorAll("input:checked")].map((box) => box.value);
    return { attendees, equipment, error };
  }

  function clearSelection() {
    selectedId = null;
    hasChecked = false;
    hideResult(resultEls);
  }

  function renderSelection() {
    const room = selectedRoom();
    roomDetails.hidden = room === null;
    if (room) {
      selectedRoomName.textContent = room.name;
      renderBookings(bookingsList, room.bookings);
    }
  }

  function applyFilters() {
    const { attendees, equipment, error } = readRequirements();
    const visible = error ? [] : filterRooms(rooms, { attendees, equipment });
    // A room that no longer matches must not keep showing a result.
    if (selectedId !== null && !visible.some((room) => room.id === selectedId)) clearSelection();
    renderRooms(roomsList, visible, selectedId, error ?? NO_MATCH_TEXT);
    renderSelection();
  }

  function runCheck() {
    const room = selectedRoom();
    if (!room) return;
    hasChecked = true;
    if (startInput.value === "" || endInput.value === "") {
      showResult(resultEls, "unavailable", "Unavailable", "Please enter both a start time and an end time.");
      return;
    }
    const start = timeToMinutes(startInput.value);
    const end = timeToMinutes(endInput.value);
    const { canBook, reason } = checkRoom(room, start, end, now);
    if (canBook) {
      showResult(resultEls, "available", "Available", `The room is free from ${minutesToTime(start)} to ${minutesToTime(end)}. You can proceed to book this time.`);
    } else {
      showResult(resultEls, room.blocked ? "blocked" : "unavailable", "Unavailable", reason);
    }
  }

  function selectRoom(id) {
    selectedId = id;
    renderSelection();
    if (hasChecked) runCheck(); // F5: never leave the previous room's result on screen.
  }

  byId("now-display").textContent = minutesToTime(now);
  renderEquipmentOptions(equipmentOptions, allEquipment(rooms));
  attendeesInput.addEventListener("input", applyFilters);
  equipmentOptions.addEventListener("change", applyFilters);
  roomsList.addEventListener("change", (event) => selectRoom(event.target.value));
  byId("check-btn").addEventListener("click", runCheck);
  applyFilters();
}
