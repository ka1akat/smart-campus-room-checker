// Room filtering rules F1-F2. Pure functions: rooms go in, a new list comes out.

export function allEquipment(rooms) {
  return [...new Set(rooms.flatMap((room) => room.equipment))].sort();
}

/**
 * Reads the attendees field. Empty means "no capacity requirement".
 * Returns { attendees: number|null, error: string|null }.
 */
export function parseAttendees(raw) {
  const text = String(raw).trim();
  if (text === "") return { attendees: null, error: null };
  const value = Number(text);
  if (!Number.isInteger(value) || value < 1) {
    return { attendees: null, error: "Attendees must be a whole number of 1 or more." };
  }
  return { attendees: value, error: null };
}

export function roomMatches(room, { attendees = null, equipment = [] } = {}) {
  const hasCapacity = attendees === null || room.capacity >= attendees; // F1
  const hasEquipment = equipment.every((item) => room.equipment.includes(item)); // F2
  return hasCapacity && hasEquipment;
}

export function filterRooms(rooms, requirements) {
  return rooms.filter((room) => roomMatches(room, requirements));
}
