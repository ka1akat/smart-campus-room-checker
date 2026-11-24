// Practice #12 uses ONE fictional room: Room 301 from the existing catalog, unchanged.
import { NOW, ROOMS } from "./rooms.js";

export const ROOM = ROOMS.find((room) => room.id === "R301"); // booking 10:00–11:00, frozen
export { NOW };
