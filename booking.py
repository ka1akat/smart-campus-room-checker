"""Smart Campus Room Availability Checker - core rule (AC1-AC5)."""


def can_book(start, end, now, blocked, existing):
    """Return True only if the room can be booked from start to end.

    start, end, now -- integer minutes after midnight (0..1440)
    blocked         -- True if the room is blocked (AC3)
    existing        -- list of (start, end) tuples of existing bookings
    The inputs are never changed (AC5).
    """
    # Times must be real integers (bool is excluded on purpose)
    for value in (start, end, now):
        if not isinstance(value, int) or isinstance(value, bool):
            return False

    # AC1: inside the day, start before end, start strictly after now
    if not (0 <= start < end <= 1440):
        return False
    if start <= now:
        return False

    # AC2: duration at most 120 minutes (exactly 120 is allowed)
    if end - start > 120:
        return False

    # AC3: a blocked room rejects every request
    if blocked:
        return False

    # AC4: reject overlap; touching endpoints are NOT an overlap
    for b_start, b_end in existing:
        if start < b_end and b_start < end:
            return False

    return True
