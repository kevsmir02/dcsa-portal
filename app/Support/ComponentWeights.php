<?php

namespace App\Support;

use App\Enums\SubjectType;
use App\Enums\Track;

/**
 * The percentage weights of the three DepEd grading components for one subject.
 * Always totals 100.
 */
final class ComponentWeights
{
    public function __construct(
        public readonly int $writtenWork,
        public readonly int $performanceTask,
        public readonly int $quarterlyAssessment,
    ) {}

    /**
     * Resolve the weights DepEd Order No. 8, s. 2015 (Table 4) prescribes for
     * Senior High School.
     *
     *   Core subjects                              25 / 50 / 25
     *   Academic track, applied & specialized      25 / 45 / 30
     *   TVL, Sports, Arts & Design                 20 / 60 / 20
     *
     * The subject's own override, when set, wins over the DepEd default so a
     * school can encode a locally approved scheme without a code change.
     */
    public static function resolve(SubjectType $type, ?Track $track, ?int $ww = null, ?int $pt = null, ?int $qa = null): self
    {
        if ($ww !== null && $pt !== null && $qa !== null && ($ww + $pt + $qa) === 100) {
            return new self($ww, $pt, $qa);
        }

        if ($type === SubjectType::Core) {
            return new self(25, 50, 25);
        }

        return $track === Track::Academic
            ? new self(25, 45, 30)
            : new self(20, 60, 20);
    }

    /**
     * The DepEd defaults as a labelled table, for the screens that explain the
     * scheme rather than apply it -- Settings and the public landing page.
     *
     * @return list<array{label: string, ww: int, pt: int, qa: int}>
     */
    public static function depedDefaults(): array
    {
        return [
            ['label' => 'Core subjects, all tracks', 'ww' => 25, 'pt' => 50, 'qa' => 25],
            ['label' => 'Academic track — applied & specialized', 'ww' => 25, 'pt' => 45, 'qa' => 30],
            ['label' => 'TVL, Sports, Arts & Design — applied & specialized', 'ww' => 20, 'pt' => 60, 'qa' => 20],
        ];
    }

    public function total(): int
    {
        return $this->writtenWork + $this->performanceTask + $this->quarterlyAssessment;
    }

    /** @return array{written_work: int, performance_task: int, quarterly_assessment: int} */
    public function toArray(): array
    {
        return [
            'written_work' => $this->writtenWork,
            'performance_task' => $this->performanceTask,
            'quarterly_assessment' => $this->quarterlyAssessment,
        ];
    }
}
