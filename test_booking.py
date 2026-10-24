import copy
import unittest

from booking import can_book

NOW = 540
EXISTING = [(600, 660)]


class TestCanBook(unittest.TestCase):
    # Required cases from Task 4
    def test_touching_end_is_available(self):
        self.assertTrue(can_book(660, 720, NOW, False, EXISTING))

    def test_overlap_is_unavailable(self):
        self.assertFalse(can_book(630, 690, NOW, False, EXISTING))

    def test_blocked_room_is_unavailable(self):
        self.assertFalse(can_book(660, 720, NOW, True, EXISTING))

    def test_exactly_120_minutes_is_available(self):
        self.assertTrue(can_book(720, 840, NOW, False, EXISTING))

    def test_121_minutes_is_unavailable(self):
        self.assertFalse(can_book(720, 841, NOW, False, EXISTING))

    def test_starts_now_is_unavailable(self):
        self.assertFalse(can_book(540, 570, NOW, False, EXISTING))

    # Extra cases from Task 4
    def test_reversed_times(self):
        self.assertFalse(can_book(720, 660, NOW, False, EXISTING))

    def test_zero_length(self):
        self.assertFalse(can_book(700, 700, NOW, False, EXISTING))

    def test_touching_start_is_available(self):
        self.assertTrue(can_book(560, 600, NOW, False, EXISTING))

    def test_end_of_day_1440_is_allowed(self):
        self.assertTrue(can_book(1380, 1440, NOW, False, EXISTING))

    def test_after_end_of_day(self):
        self.assertFalse(can_book(1400, 1441, NOW, False, EXISTING))

    def test_negative_start(self):
        self.assertFalse(can_book(-10, 30, -20, False, []))

    def test_start_before_now(self):
        self.assertFalse(can_book(500, 560, NOW, False, EXISTING))

    def test_booking_inside_existing(self):
        self.assertFalse(can_book(610, 650, NOW, False, EXISTING))

    def test_booking_covers_existing(self):
        self.assertFalse(can_book(590, 670, NOW, False, EXISTING))

    def test_multiple_bookings_gap_fits(self):
        bookings = [(600, 660), (720, 780)]
        self.assertTrue(can_book(660, 720, NOW, False, bookings))

    def test_multiple_bookings_second_overlaps(self):
        bookings = [(600, 660), (720, 780)]
        self.assertFalse(can_book(700, 750, NOW, False, bookings))

    def test_empty_bookings(self):
        self.assertTrue(can_book(600, 660, NOW, False, []))

    def test_non_integer_times(self):
        self.assertFalse(can_book(660.5, 720, NOW, False, EXISTING))
        self.assertFalse(can_book("660", 720, NOW, False, EXISTING))

    def test_inputs_unchanged(self):
        bookings = [(600, 660), (720, 780)]
        before = copy.deepcopy(bookings)
        can_book(660, 720, NOW, False, bookings)
        can_book(630, 690, NOW, False, bookings)
        self.assertEqual(bookings, before)


if __name__ == "__main__":
    unittest.main(verbosity=2)
