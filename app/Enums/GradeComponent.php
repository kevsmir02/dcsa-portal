<?php

namespace App\Enums;

enum GradeComponent: string
{
    case WrittenWork = 'written_work';
    case PerformanceTask = 'performance_task';
    case QuarterlyAssessment = 'quarterly_assessment';

    public function label(): string
    {
        return match ($this) {
            self::WrittenWork => 'Written Work',
            self::PerformanceTask => 'Performance Task',
            self::QuarterlyAssessment => 'Quarterly Assessment',
        };
    }

    public function abbreviation(): string
    {
        return match ($this) {
            self::WrittenWork => 'WW',
            self::PerformanceTask => 'PT',
            self::QuarterlyAssessment => 'QA',
        };
    }
}
