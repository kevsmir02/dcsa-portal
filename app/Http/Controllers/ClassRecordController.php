<?php

namespace App\Http\Controllers;

use App\Enums\GradeComponent;
use App\Models\ActivityLog;
use App\Models\Assessment;
use App\Models\AssessmentScore;
use App\Models\Grade;
use App\Models\Quarter;
use App\Models\SubjectClass;
use App\Services\GradeCalculator;
use App\Support\GradeDescriptor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The DepEd class record for one subject class in one quarter: the assessment
 * columns, every learner's score, and the computed grades beside them.
 *
 * Teachers reach it for their own classes; admins for any class.
 */
class ClassRecordController extends Controller
{
    public function __construct(private readonly GradeCalculator $calculator) {}

    public function show(Request $request, SubjectClass $subjectClass): Response
    {
        $this->authorizeClass($request, $subjectClass);

        $subjectClass->load(['subject', 'section.strand', 'semester.quarters', 'teacher']);

        $quarters = $subjectClass->semester->quarters;
        $quarter = $quarters->firstWhere('id', $request->integer('quarter')) ?? $quarters->first();

        $students = $subjectClass->students();
        $assessments = Assessment::with('scores')
            ->where('subject_class_id', $subjectClass->id)
            ->where('quarter_id', $quarter->id)
            ->orderBy('component')
            ->orderBy('position')
            ->get();

        $weights = $subjectClass->weights();

        $grades = Grade::where('subject_class_id', $subjectClass->id)
            ->where('quarter_id', $quarter->id)
            ->get()
            ->keyBy('student_id');

        $rows = $students->map(function ($student) use ($assessments, $grades) {
            $grade = $grades->get($student->id);

            return [
                'student_id' => $student->id,
                'lrn' => $student->lrn,
                'name' => $student->full_name,
                'scores' => $assessments->mapWithKeys(fn (Assessment $a) => [
                    $a->id => $a->scores->firstWhere('student_id', $student->id)?->score,
                ])->all(),
                'ww_ps' => $grade?->ww_ps, 'pt_ps' => $grade?->pt_ps, 'qa_ps' => $grade?->qa_ps,
                'ww_ws' => $grade?->ww_ws, 'pt_ws' => $grade?->pt_ws, 'qa_ws' => $grade?->qa_ws,
                'initial_grade' => $grade?->initial_grade,
                'final_grade' => $grade?->final_grade,
                'descriptor' => GradeDescriptor::abbreviation($grade?->final_grade),
                'remarks' => $grade?->remarks,
            ];
        });

        return Inertia::render('grades/class-record', [
            'subjectClass' => [
                'id' => $subjectClass->id,
                'subject_code' => $subjectClass->subject->code,
                'subject_title' => $subjectClass->subject->title,
                'subject_type' => $subjectClass->subject->type->label(),
                'section' => $subjectClass->section->name,
                'track' => $subjectClass->section->strand->track->label(),
                'strand' => $subjectClass->section->strand->code,
                'teacher' => $subjectClass->teacher?->full_name,
                'schedule' => $subjectClass->schedule,
                'room' => $subjectClass->room,
                'semester' => $subjectClass->semester->name,
            ],
            'quarters' => $quarters->map(fn (Quarter $q) => [
                'id' => $q->id, 'number' => $q->number, 'name' => $q->name, 'is_locked' => $q->is_locked,
            ]),
            'quarter' => ['id' => $quarter->id, 'name' => $quarter->name, 'is_locked' => $quarter->is_locked],
            'weights' => $weights->toArray(),
            'components' => collect(GradeComponent::cases())->map(fn (GradeComponent $c) => [
                'value' => $c->value,
                'label' => $c->label(),
                'abbreviation' => $c->abbreviation(),
                'assessments' => $assessments
                    ->filter(fn (Assessment $a) => $a->component === $c)
                    ->map(fn (Assessment $a) => [
                        'id' => $a->id,
                        'title' => $a->title,
                        'highest_possible_score' => $a->highest_possible_score,
                        'date_given' => $a->date_given?->toDateString(),
                    ])->values(),
            ]),
            'rows' => $rows,
            'canEdit' => ! $quarter->is_locked,
        ]);
    }

    public function storeAssessment(Request $request, SubjectClass $subjectClass): RedirectResponse
    {
        $this->authorizeClass($request, $subjectClass);

        $data = $request->validate([
            'quarter_id' => ['required', 'exists:quarters,id'],
            'component' => ['required', Rule::enum(GradeComponent::class)],
            'title' => ['required', 'string', 'max:100'],
            'highest_possible_score' => ['required', 'integer', 'min:1', 'max:1000'],
            'date_given' => ['nullable', 'date'],
        ]);

        $this->assertQuarterInSemester($data['quarter_id'], $subjectClass);
        $this->assertQuarterOpen($data['quarter_id']);

        $position = Assessment::where('subject_class_id', $subjectClass->id)
            ->where('quarter_id', $data['quarter_id'])
            ->where('component', $data['component'])
            ->max('position');

        Assessment::create([...$data, 'subject_class_id' => $subjectClass->id, 'position' => ($position ?? -1) + 1]);

        $this->recompute($subjectClass, $data['quarter_id']);

        return back()->with('success', "{$data['title']} has been added to the class record.");
    }

    public function updateAssessment(Request $request, SubjectClass $subjectClass, Assessment $assessment): RedirectResponse
    {
        $this->authorizeClass($request, $subjectClass);
        $this->assertQuarterOpen($assessment->quarter_id);

        $assessment->update($request->validate([
            'title' => ['required', 'string', 'max:100'],
            'highest_possible_score' => ['required', 'integer', 'min:1', 'max:1000'],
            'date_given' => ['nullable', 'date'],
        ]));

        $this->recompute($subjectClass, $assessment->quarter_id);

        return back()->with('success', 'Assessment updated.');
    }

    public function destroyAssessment(Request $request, SubjectClass $subjectClass, Assessment $assessment): RedirectResponse
    {
        $this->authorizeClass($request, $subjectClass);
        $this->assertQuarterOpen($assessment->quarter_id);

        $quarterId = $assessment->quarter_id;
        $title = $assessment->title;
        $assessment->delete();

        $this->recompute($subjectClass, $quarterId);

        return back()->with('success', "{$title} has been removed from the class record.");
    }

    /**
     * Save a batch of edited score cells, then recompute the quarter.
     * A blank cell clears the score rather than storing a zero.
     */
    public function saveScores(Request $request, SubjectClass $subjectClass): RedirectResponse
    {
        $this->authorizeClass($request, $subjectClass);

        $data = $request->validate([
            'quarter_id' => ['required', 'exists:quarters,id'],
            'scores' => ['present', 'array'],
            'scores.*.assessment_id' => ['required', 'exists:assessments,id'],
            'scores.*.student_id' => ['required', 'exists:students,id'],
            'scores.*.score' => ['nullable', 'numeric', 'min:0'],
        ]);

        $this->assertQuarterOpen($data['quarter_id']);

        $assessments = Assessment::whereIn('id', collect($data['scores'])->pluck('assessment_id')->unique())
            ->where('subject_class_id', $subjectClass->id)
            ->where('quarter_id', $data['quarter_id'])
            ->get()
            ->keyBy('id');

        $enrolled = $subjectClass->students()->pluck('id')->flip();

        DB::transaction(function () use ($data, $assessments, $enrolled) {
            foreach ($data['scores'] as $row) {
                $assessment = $assessments->get($row['assessment_id']);

                if (! $assessment || ! $enrolled->has($row['student_id'])) {
                    continue;
                }

                // A score above the highest possible score is a typo, not a bonus.
                $score = $row['score'] === null
                    ? null
                    : min((float) $row['score'], (float) $assessment->highest_possible_score);

                AssessmentScore::updateOrCreate(
                    ['assessment_id' => $row['assessment_id'], 'student_id' => $row['student_id']],
                    ['score' => $score],
                );
            }
        });

        $this->recompute($subjectClass, $data['quarter_id']);

        $subjectClass->loadMissing('subject', 'section');
        ActivityLog::record(
            'grade.updated',
            "Grades updated for {$subjectClass->subject->title} - {$subjectClass->section->name}",
            $subjectClass,
        );

        return back()->with('success', 'Class record saved and grades recomputed.');
    }

    private function recompute(SubjectClass $subjectClass, int $quarterId): void
    {
        $quarter = Quarter::findOrFail($quarterId);

        DB::transaction(fn () => $this->calculator->computeClass($subjectClass, $quarter));
    }

    private function assertQuarterInSemester(int $quarterId, SubjectClass $subjectClass): void
    {
        if (Quarter::findOrFail($quarterId)->semester_id !== $subjectClass->semester_id) {
            abort(404);
        }
    }

    private function assertQuarterOpen(int $quarterId): void
    {
        if (Quarter::findOrFail($quarterId)->is_locked) {
            abort(403, 'This quarter has been closed by the administrator. Grades can no longer be edited.');
        }
    }

    private function authorizeClass(Request $request, SubjectClass $subjectClass): void
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return;
        }

        if ($user->isTeacher() && $subjectClass->teacher_id === $user->teacher?->id) {
            return;
        }

        abort(403, 'You are not assigned to this class.');
    }
}
