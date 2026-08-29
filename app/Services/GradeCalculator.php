<?php

namespace App\Services;

use App\Enums\GradeComponent;
use App\Models\Assessment;
use App\Models\Grade;
use App\Models\Quarter;
use App\Models\Student;
use App\Models\SubjectClass;
use App\Support\ComponentWeights;
use App\Support\GradeDescriptor;
use App\Support\TransmutationTable;
use Illuminate\Support\Collection;

/**
 * Turns a class record into quarterly grades the DepEd way.
 *
 *   raw score  ->  Percentage Score (PS)  ->  Weighted Score (WS)
 *              ->  Initial Grade          ->  Transmuted Final Grade
 *
 * A quarter only earns a final grade once all three components have at least one
 * encoded score. Until then the component figures are still stored, so a teacher
 * can watch the class record fill up, but `final_grade` stays null rather than
 * pretending an unfinished quarter has failed.
 */
class GradeCalculator
{
    /**
     * Recompute and persist the grades of every learner in a class for one quarter.
     *
     * @return Collection<int, Grade> keyed by student id
     */
    public function computeClass(SubjectClass $subjectClass, Quarter $quarter): Collection
    {
        $subjectClass->loadMissing('subject', 'section.strand');

        $students = $subjectClass->students();
        $assessments = $this->assessmentsFor($subjectClass, $quarter);
        $weights = $subjectClass->weights();

        return $students->mapWithKeys(fn (Student $student) => [
            $student->id => $this->persist($student, $subjectClass, $quarter, $assessments, $weights),
        ]);
    }

    /**
     * Recompute and persist one learner's grade in one class for one quarter.
     */
    public function computeStudent(Student $student, SubjectClass $subjectClass, Quarter $quarter): Grade
    {
        $subjectClass->loadMissing('subject', 'section.strand');

        return $this->persist(
            $student,
            $subjectClass,
            $quarter,
            $this->assessmentsFor($subjectClass, $quarter),
            $subjectClass->weights(),
        );
    }

    /**
     * The pure computation, with no database writes: given one learner's scores,
     * produce every intermediate figure the DepEd class record shows.
     *
     * @param  Collection<int, Assessment>  $assessments  all assessments of the class/quarter, with scores loaded
     * @return array<string, mixed>
     */
    public function figuresFor(Student $student, Collection $assessments, ComponentWeights $weights): array
    {
        $components = [
            GradeComponent::WrittenWork->value => ['weight' => $weights->writtenWork, 'prefix' => 'ww'],
            GradeComponent::PerformanceTask->value => ['weight' => $weights->performanceTask, 'prefix' => 'pt'],
            GradeComponent::QuarterlyAssessment->value => ['weight' => $weights->quarterlyAssessment, 'prefix' => 'qa'],
        ];

        $figures = [];
        $initialGrade = 0.0;
        $allComponentsStarted = true;

        foreach ($components as $component => $meta) {
            $prefix = $meta['prefix'];

            // Only assessments this learner actually has an encoded score for count
            // toward the totals; an assessment still being encoded must not silently
            // read as a zero.
            $scored = $assessments
                ->filter(fn (Assessment $a) => $a->component->value === $component)
                ->map(fn (Assessment $a) => [
                    'score' => $a->scores->firstWhere('student_id', $student->id)?->score,
                    'hps' => $a->highest_possible_score,
                ])
                ->filter(fn (array $row) => $row['score'] !== null);

            $rawScore = (float) $scored->sum('score');
            $rawTotal = (float) $scored->sum('hps');

            if ($rawTotal <= 0.0) {
                $allComponentsStarted = false;
            }

            $percentageScore = $rawTotal > 0.0 ? round($rawScore / $rawTotal * 100, 2) : 0.0;
            $weightedScore = round($percentageScore * $meta['weight'] / 100, 2);
            $initialGrade += $weightedScore;

            $figures["{$prefix}_score"] = round($rawScore, 2);
            $figures["{$prefix}_total"] = round($rawTotal, 2);
            $figures["{$prefix}_ps"] = $percentageScore;
            $figures["{$prefix}_ws"] = $weightedScore;
        }

        $initialGrade = round($initialGrade, 2);
        $finalGrade = $allComponentsStarted ? TransmutationTable::transmute($initialGrade) : null;

        $figures['initial_grade'] = $initialGrade;
        $figures['final_grade'] = $finalGrade;
        $figures['remarks'] = GradeDescriptor::remarks($finalGrade);

        return $figures;
    }

    /** @return Collection<int, Assessment> */
    private function assessmentsFor(SubjectClass $subjectClass, Quarter $quarter): Collection
    {
        return Assessment::query()
            ->with('scores')
            ->where('subject_class_id', $subjectClass->id)
            ->where('quarter_id', $quarter->id)
            ->orderBy('component')
            ->orderBy('position')
            ->get();
    }

    /** @param  Collection<int, Assessment>  $assessments */
    private function persist(
        Student $student,
        SubjectClass $subjectClass,
        Quarter $quarter,
        Collection $assessments,
        ComponentWeights $weights,
    ): Grade {
        $figures = $this->figuresFor($student, $assessments, $weights);

        return Grade::updateOrCreate(
            [
                'student_id' => $student->id,
                'subject_class_id' => $subjectClass->id,
                'quarter_id' => $quarter->id,
            ],
            [...$figures, 'computed_at' => now()],
        );
    }
}
