<?php

namespace App\Support;

/**
 * The DepEd transmutation table from DepEd Order No. 8, s. 2015
 * (Policy Guidelines on Classroom Assessment for the K to 12 Program), Appendix B.
 *
 * The Initial Grade -- the sum of the three weighted component scores -- is
 * transmuted onto the 60-100 reporting scale before it is written on the
 * report card. Above 60.00 each transmuted grade spans 1.6 initial points;
 * below 60.00 each spans 4.0.
 */
final class TransmutationTable
{
    /** @var list<array{0: float, 1: float, 2: int}> [min initial, max initial, transmuted] */
    private const RANGES = [
        [100.00, 100.00, 100],
        [98.40, 99.99, 99],
        [96.80, 98.39, 98],
        [95.20, 96.79, 97],
        [93.60, 95.19, 96],
        [92.00, 93.59, 95],
        [90.40, 91.99, 94],
        [88.80, 90.39, 93],
        [87.20, 88.79, 92],
        [85.60, 87.19, 91],
        [84.00, 85.59, 90],
        [82.40, 83.99, 89],
        [80.80, 82.39, 88],
        [79.20, 80.79, 87],
        [77.60, 79.19, 86],
        [76.00, 77.59, 85],
        [74.40, 75.99, 84],
        [72.80, 74.39, 83],
        [71.20, 72.79, 82],
        [69.60, 71.19, 81],
        [68.00, 69.59, 80],
        [66.40, 67.99, 79],
        [64.80, 66.39, 78],
        [63.20, 64.79, 77],
        [61.60, 63.19, 76],
        [60.00, 61.59, 75],
        [56.00, 59.99, 74],
        [52.00, 55.99, 73],
        [48.00, 51.99, 72],
        [44.00, 47.99, 71],
        [40.00, 43.99, 70],
        [36.00, 39.99, 69],
        [32.00, 35.99, 68],
        [28.00, 31.99, 67],
        [24.00, 27.99, 66],
        [20.00, 23.99, 65],
        [16.00, 19.99, 64],
        [12.00, 15.99, 63],
        [8.00, 11.99, 62],
        [4.00, 7.99, 61],
        [0.00, 3.99, 60],
    ];

    /**
     * Transmute an Initial Grade onto the 60-100 DepEd reporting scale.
     */
    public static function transmute(float $initialGrade): int
    {
        $initialGrade = max(0.0, min(100.0, round($initialGrade, 2)));

        foreach (self::RANGES as [$min, $max, $transmuted]) {
            if ($initialGrade >= $min && $initialGrade <= $max) {
                return $transmuted;
            }
        }

        // Unreachable for a clamped 0-100 input, but keeps the return type honest.
        return 60;
    }

    /** @return list<array{0: float, 1: float, 2: int}> */
    public static function ranges(): array
    {
        return self::RANGES;
    }
}
