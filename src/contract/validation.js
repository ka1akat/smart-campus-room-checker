// Practice #12 contract, step 1: input validation (AC1, AC2, AC6). No DOM access, no booking data.
import { MAX_DURATION_MINUTES, MINUTES_IN_DAY } from "../logic/booking.js";
import { minutesToTime } from "../logic/time.js";

/** Reason codes of the shared contract. The low-code version uses the same strings. */
export const REASON_CODE = Object.freeze({
  OK: "OK",
  MISSING_START: "MISSING_START",
  PAST_START: "PAST_START",
  INVALID_DURATION: "INVALID_DURATION",
  ENDS_AFTER_MIDNIGHT: "ENDS_AFTER_MIDNIGHT",
  ROOM_BLOCKED: "ROOM_BLOCKED",
  OVERLAP: "OVERLAP",
});

const invalid = (reasonCode, message) => ({ valid: false, reasonCode, message });

/**
 * Checks the request before any booking rule runs.
 * startMinutes: integer minutes after midnight, or null when the field is empty.
 * durationMinutes: number, or NaN when the field is empty or not a number.
 */
export function validateRequest({ startMinutes, durationMinutes, now }) {
  if (!Number.isInteger(startMinutes)) {
    return invalid(REASON_CODE.MISSING_START, "Please choose a start time.");
  }
  if (startMinutes <= now) {
    return invalid(REASON_CODE.PAST_START, `Start time must be in the future (after ${minutesToTime(now)}).`);
  }
  if (!Number.isInteger(durationMinutes)) {
    return invalid(REASON_CODE.INVALID_DURATION, "Duration must be a whole number of minutes.");
  }
  if (durationMinutes <= 0) {
    return invalid(REASON_CODE.INVALID_DURATION, "Duration must be greater than 0 minutes.");
  }
  if (durationMinutes > MAX_DURATION_MINUTES) {
    return invalid(REASON_CODE.INVALID_DURATION, `Duration must be at most ${MAX_DURATION_MINUTES} minutes.`);
  }
  if (startMinutes + durationMinutes > MINUTES_IN_DAY) {
    return invalid(REASON_CODE.ENDS_AFTER_MIDNIGHT, "The booking must end by 24:00.");
  }
  return { valid: true, reasonCode: REASON_CODE.OK, message: "" };
}
