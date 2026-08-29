<?php

namespace Tests\Unit;

use App\Support\TransmutationTable;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

/**
 * The transmutation table is the one place where a wrong number silently
 * produces a wrong report card, so every band boundary is pinned here against
 * DepEd Order No. 8, s. 2015, Appendix B.
 */
class TransmutationTableTest extends TestCase
{
    public function test_a_perfect_initial_grade_transmutes_to_100(): void
    {
        $this->assertSame(100, TransmutationTable::transmute(100.00));
    }

    public function test_the_passing_boundary_sits_at_an_initial_grade_of_60(): void
    {
        // 60.00 is the lowest initial grade that still transmutes to the 75 pass mark.
        $this->assertSame(75, TransmutationTable::transmute(60.00));
        $this->assertSame(74, TransmutationTable::transmute(59.99));
    }

    #[DataProvider('bandBoundaries')]
    public function test_each_band_boundary_transmutes_as_the_deped_table_prescribes(float $initial, int $expected): void
    {
        $this->assertSame($expected, TransmutationTable::transmute($initial));
    }

    public static function bandBoundaries(): array
    {
        return [
            'top of 99' => [99.99, 99],
            'bottom of 99' => [98.40, 99],
            'top of 98' => [98.39, 98],
            'bottom of 95' => [92.00, 95],
            'bottom of 90' => [84.00, 90],
            'top of 89' => [83.99, 89],
            'bottom of 85' => [76.00, 85],
            'bottom of 80' => [68.00, 80],
            'bottom of 76' => [61.60, 76],
            'top of 75' => [61.59, 75],
            'bottom of 74' => [56.00, 74],
            'bottom of 70' => [40.00, 70],
            'bottom of 61' => [4.00, 61],
            'top of 60' => [3.99, 60],
            'zero' => [0.00, 60],
        ];
    }

    public function test_out_of_range_input_is_clamped_rather_than_falling_through(): void
    {
        $this->assertSame(100, TransmutationTable::transmute(140.0));
        $this->assertSame(60, TransmutationTable::transmute(-20.0));
    }

    public function test_the_table_covers_every_hundredth_between_zero_and_one_hundred(): void
    {
        // No gaps: every possible initial grade must land in exactly one band.
        for ($hundredths = 0; $hundredths <= 10000; $hundredths++) {
            $initial = $hundredths / 100;
            $grade = TransmutationTable::transmute($initial);

            $this->assertGreaterThanOrEqual(60, $grade, "initial {$initial} fell out of range");
            $this->assertLessThanOrEqual(100, $grade, "initial {$initial} fell out of range");
        }
    }
}
