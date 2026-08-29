<?php

namespace Database\Seeders;

use App\Enums\GradeComponent;
use App\Models\Assessment;
use App\Models\AssessmentScore;
use App\Models\Quarter;
use App\Models\Semester;
use App\Models\SubjectClass;
use App\Services\GradeCalculator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Fills the class record for the active semester so the portal opens with real
 * grades to look at: four written works, three performance tasks and one
 * quarterly assessment per class per quarter, scored for every enrolled learner.
 */
class ClassRecordSeeder extends Seeder
{
    /** @var list<array{component: GradeComponent, title: string, hps: int}> */
    private const BLUEPRINT = [
        ['component' => GradeComponent::WrittenWork, 'title' => 'Written Work 1', 'hps' => 20],
        ['component' => GradeComponent::WrittenWork, 'title' => 'Written Work 2', 'hps' => 25],
        ['component' => GradeComponent::WrittenWork, 'title' => 'Written Work 3', 'hps' => 30],
        ['component' => GradeComponent::WrittenWork, 'title' => 'Written Work 4', 'hps' => 25],
        ['component' => GradeComponent::PerformanceTask, 'title' => 'Performance Task 1', 'hps' => 50],
        ['component' => GradeComponent::PerformanceTask, 'title' => 'Performance Task 2', 'hps' => 40],
        ['component' => GradeComponent::PerformanceTask, 'title' => 'Performance Task 3', 'hps' => 60],
        ['component' => GradeComponent::QuarterlyAssessment, 'title' => 'Quarterly Assessment', 'hps' => 50],
    ];

    public function run(): void
    {
        mt_srand(773311);   // deterministic sample scores across re-seeds

        $semester = Semester::active();
        $quarters = $semester->quarters()->get();
        $classes = SubjectClass::with('section')->where('semester_id', $semester->id)->get();

        // Each learner gets a stable ability so their grades look consistent
        // across subjects and quarters instead of random noise.
        $ability = [];

        $assessmentRows = [];
        $now = now();

        foreach ($classes as $class) {
            foreach ($quarters as $quarter) {
                foreach (self::BLUEPRINT as $position => $item) {
                    $assessmentRows[] = [
                        'subject_class_id' => $class->id,
                        'quarter_id' => $quarter->id,
                        'component' => $item['component']->value,
                        'title' => $item['title'],
                        'highest_possible_score' => $item['hps'],
                        'date_given' => $semester->start_date->copy()->addDays(14 + $position * 7 + ($quarter->number - 1) * 60)->toDateString(),
                        'position' => $position,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        foreach (array_chunk($assessmentRows, 300) as $chunk) {
            Assessment::insert($chunk);
        }

        // Score every assessment for every learner enrolled in its section.
        $scoreRows = [];

        foreach ($classes as $class) {
            $studentIds = $class->students()->pluck('id');
            $assessments = Assessment::where('subject_class_id', $class->id)->get();

            foreach ($studentIds as $studentId) {
                $ability[$studentId] ??= $this->rollAbility();

                foreach ($assessments as $assessment) {
                    $performance = min(1.0, max(0.35, $ability[$studentId] + (mt_rand(-70, 70) / 1000)));

                    $scoreRows[] = [
                        'assessment_id' => $assessment->id,
                        'student_id' => $studentId,
                        'score' => round($assessment->highest_possible_score * $performance),
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }

            if (count($scoreRows) >= 2000) {
                foreach (array_chunk($scoreRows, 500) as $chunk) {
                    AssessmentScore::insert($chunk);
                }
                $scoreRows = [];
            }
        }

        foreach (array_chunk($scoreRows, 500) as $chunk) {
            AssessmentScore::insert($chunk);
        }

        // Run every class record through the DepEd computation.
        $calculator = new GradeCalculator;

        foreach ($classes as $class) {
            foreach ($quarters as $quarter) {
                DB::transaction(fn () => $calculator->computeClass($class, $quarter));
            }
        }
    }

    /**
     * A roughly normal ability centred on 0.82, so most learners land in the
     * 85-95 band with a realistic tail on either side.
     */
    private function rollAbility(): float
    {
        $sum = 0;
        for ($i = 0; $i < 3; $i++) {
            $sum += mt_rand(0, 1000) / 1000;
        }

        $normal = ($sum / 3 - 0.5) * 2;      // -1..1, bunched near 0

        return min(0.99, max(0.52, 0.82 + $normal * 0.28));
    }
}
