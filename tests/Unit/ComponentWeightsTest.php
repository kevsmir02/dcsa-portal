<?php

namespace Tests\Unit;

use App\Enums\SubjectType;
use App\Enums\Track;
use App\Support\ComponentWeights;
use PHPUnit\Framework\TestCase;

class ComponentWeightsTest extends TestCase
{
    public function test_core_subjects_use_25_50_25_in_every_track(): void
    {
        foreach (Track::cases() as $track) {
            $weights = ComponentWeights::resolve(SubjectType::Core, $track);

            $this->assertSame([25, 50, 25], [$weights->writtenWork, $weights->performanceTask, $weights->quarterlyAssessment]);
        }
    }

    public function test_academic_track_applied_and_specialized_subjects_use_25_45_30(): void
    {
        foreach ([SubjectType::Applied, SubjectType::Specialized] as $type) {
            $weights = ComponentWeights::resolve($type, Track::Academic);

            $this->assertSame([25, 45, 30], [$weights->writtenWork, $weights->performanceTask, $weights->quarterlyAssessment]);
        }
    }

    public function test_tvl_sports_and_arts_applied_and_specialized_subjects_use_20_60_20(): void
    {
        foreach ([Track::Tvl, Track::Sports, Track::ArtsAndDesign] as $track) {
            $weights = ComponentWeights::resolve(SubjectType::Specialized, $track);

            $this->assertSame([20, 60, 20], [$weights->writtenWork, $weights->performanceTask, $weights->quarterlyAssessment]);
        }
    }

    public function test_a_complete_override_totalling_100_wins_over_the_deped_default(): void
    {
        $weights = ComponentWeights::resolve(SubjectType::Core, Track::Academic, 30, 40, 30);

        $this->assertSame([30, 40, 30], [$weights->writtenWork, $weights->performanceTask, $weights->quarterlyAssessment]);
    }

    public function test_an_override_that_does_not_total_100_is_ignored(): void
    {
        $weights = ComponentWeights::resolve(SubjectType::Core, Track::Academic, 30, 40, 20);

        $this->assertSame([25, 50, 25], [$weights->writtenWork, $weights->performanceTask, $weights->quarterlyAssessment]);
    }

    public function test_a_partial_override_falls_back_to_the_deped_default(): void
    {
        $weights = ComponentWeights::resolve(SubjectType::Specialized, Track::Academic, 30, null, null);

        $this->assertSame([25, 45, 30], [$weights->writtenWork, $weights->performanceTask, $weights->quarterlyAssessment]);
        $this->assertSame(100, $weights->total());
    }
}
