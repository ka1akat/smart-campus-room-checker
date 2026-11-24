// Practice #12 contract, step 2: availability calculation (AC3, AC4, AC5).
// The decision itself is the unchanged canBook() from src/logic/booking.js.
import { canBook, REASON } from "../logic/booking.js";
import { minutesToTime } from "../logic/time.js";
import { REASON_CODE, validateRequest } from "./validation.js";

/**
 * Input:  { startMinutes, durationMinutes, blocked, bookings, now }
 * Output: { available: boolean, reasonCode: string, message: string, isValidationError: boolean }
 * bookings is only read, never changed (AC5).
 */
export function checkAvailability({ startMinutes, durationMinutes, blocked, bookings, now }) {
  const validation = validateRequest({ startMinutes, durationMinutes, now });
  if (!validation.valid) {
    return { available: false, reasonCode: validation.reasonCode, message: validation.message, isValidationError: true };
  }

  const endMinutes = startMinutes + durationMinutes;
  const result = canBook(startMinutes, endMinutes, now, blocked, bookings);
  const slot = `${minutesToTime(startMinutes)}–${minutesToTime(endMinutes)}`;

  if (result.canBook) {
    return { available: true, reasonCode: REASON_CODE.OK, message: `The room is free from ${slot}.`, isValidationError: false };
  }
  if (result.code === REASON.BLOCKED) {
    return { available: false, reasonCode: REASON_CODE.ROOM_BLOCKED, message: "The room is blocked, so no time can be booked.", isValidationError: false };
  }
  if (result.code === REASON.OVERLAP) {
    return { available: false, reasonCode: REASON_CODE.OVERLAP, message: `${slot} ${result.reason.replace(/^This /, "")}`, isValidationError: false };
  }
  // Validation already ran, so any other code would mean the two layers disagree.
  throw new Error(`Unexpected booking result after validation: ${result.code}`);
}
