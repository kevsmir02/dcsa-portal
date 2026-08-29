<?php

namespace App\Support;

/**
 * The DepEd descriptors for a transmuted grade (DepEd Order No. 8, s. 2015, Table 10).
 */
final class GradeDescriptor
{
    public const PASSING_GRADE = 75;

    public static function for(?int $grade): string
    {
        return match (true) {
            $grade === null => 'No Grade Yet',
            $grade >= 90 => 'Outstanding',
            $grade >= 85 => 'Very Satisfactory',
            $grade >= 80 => 'Satisfactory',
            $grade >= 75 => 'Fairly Satisfactory',
            default => 'Did Not Meet Expectations',
        };
    }

    public static function abbreviation(?int $grade): string
    {
        return match (true) {
            $grade === null => '--',
            $grade >= 90 => 'O',
            $grade >= 85 => 'VS',
            $grade >= 80 => 'S',
            $grade >= 75 => 'FS',
            default => 'DNME',
        };
    }

    public static function remarks(?int $grade): ?string
    {
        if ($grade === null) {
            return null;
        }

        return $grade >= self::PASSING_GRADE ? 'passed' : 'failed';
    }
}
