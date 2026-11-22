// Fictional data only. Times are integer minutes after midnight.
function deepFreeze(value) {
  Object.values(value).forEach((child) => {
    if (typeof child === "object" && child !== null) deepFreeze(child);
  });
  return Object.freeze(value);
}

export const NOW = 540; // 09:00, fixed so results are repeatable

export const ROOMS = deepFreeze([
  {
    id: "R301",
    name: "Room 301",
    capacity: 8,
    equipment: ["Projector", "Whiteboard"],
    blocked: false,
    bookings: [{ start: 600, end: 660 }], // 10:00-11:00
  },
  {
    id: "S105",
    name: "Seminar Room 105",
    capacity: 20,
    equipment: ["Projector", "Whiteboard", "Video conferencing"],
    blocked: false,
    bookings: [
      { start: 720, end: 780 }, // 12:00-13:00
      { start: 840, end: 900 }, // 14:00-15:00
    ],
  },
  {
    id: "L210",
    name: "Computer Lab 210",
    capacity: 30,
    equipment: ["Computers", "Projector"],
    blocked: false,
    bookings: [{ start: 570, end: 690 }], // 09:30-11:30
  },
  {
    id: "P012",
    name: "Quiet Pod 012",
    capacity: 4,
    equipment: ["Whiteboard"],
    blocked: false,
    bookings: [],
  },
  {
    id: "A400",
    name: "Auditorium 400",
    capacity: 120,
    equipment: ["Microphone", "Projector", "Video conferencing"],
    blocked: true,
    bookings: [],
  },
]);
