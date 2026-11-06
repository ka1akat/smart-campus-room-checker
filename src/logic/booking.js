// Booking rules AC1-AC4. No DOM access here, so every rule can be tested directly.
import { minutesToTime } from "./time.js";

export const MAX_DURATION_MINUTES = 120;
export const MINUTES_IN_DAY = 1440;

export function overlaps(aStart, aEnd, bStart, bEnd) {
  // Touching endpoints do NOT overlap.
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Returns { canBook: boolean, reason: string|null }. Inputs are never changed (AC5).
 *  AC1: 0 <= start < end <= 1440, and start must be strictly after now.
 *  AC2: Duration must not exceed 120 minutes (exactly 120 is allowed).
 *  AC3: Reject every request when the room is blocked.
 *  AC4: Reject overlap with any existing booking (touching endpoints are fine).
 */
export function canBook(start, end, now, blocked, existing) {
  if (blocked) {
    return { canBook: false, reason: "The room is currently blocked and cannot be booked." };
  }
  if (!Number.isInteger(start) || !Number.isInteger(end) || !Number.isInteger(now)) {
    return { canBook: false, reason: "Start, end, and now must be integer minutes." };
  }
  if (start < 0 || end > MINUTES_IN_DAY || start >= end) {
    return { canBook: false, reason: "Please pick a valid time range: start before end, within 00:00 to 24:00." };
  }
  if (start <= now) {
    return { canBook: false, reason: `The start time must be strictly after the current time (${minutesToTime(now)}).` };
  }
  const duration = end - start;
  if (duration > MAX_DURATION_MINUTES) {
    return { canBook: false, reason: `The booking is ${duration} minutes long. The maximum allowed duration is ${MAX_DURATION_MINUTES} minutes.` };
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
