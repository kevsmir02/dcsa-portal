<?php

namespace App\Http\Controllers\Reports;

use App\Enums\GradeComponent;
use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Grade;
use App\Models\Quarter;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Setting;
use App\Models\Student;
use App\Models\SubjectClass;
use App\Services\AcademicRecord;
use App\Support\GradeDescriptor;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $semester = Semester::active();

        return Inertia::render('admin/reports/index', [
            'sections' => Section::with('strand:id,code')
                ->withCount(['enrollments' => fn ($q) => $q->where('semester_id', $semester?->id)->where('status', 'enrolled')])
                ->orderBy('name')
                ->get()
                ->map(fn (Section $s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'strand' => $s->strand->code,
                    'enrolled' => $s->enrollments_count,
                ]),
            'classes' => SubjectClass::with(['subject:id,code,title', 'section:id,name'])
                ->where('semester_id', $semester?->id)
                ->get()
                ->map(fn (SubjectClass $c) => [
                    'id' => $c->id,
                    'label' => "{$c->subject->code} — {$c->section->name}",
                    'section' => $c->section->name,
                ])
                ->sortBy('label')
                ->values(),
            'quarters' => $semester?->quarters()->get(['id', 'name', 'number']) ?? [],
            'semester' => $semester ? ['id' => $semester->id, 'name' => $semester->name] : null,
        ]);
    }

    /**
     * DepEd School Form 9 — the Learner's Progress Report Card.
     */
    public function reportCard(Request $request, Student $student): View
    {
        $this->authorizeStudent($request, $student);

        $semester = Semester::with('schoolYear', 'quarters')->find($request->integer('semester')) ?? Semester::active();
        $record = app(AcademicRecord::class)->forSemester($student, $semester);
        $enrollment = $student->enrollmentFor($semester->id);

        return view('reports.report-card', [
            'school' => Setting::get('school', []),
            'student' => $student,
            'semester' => $semester,
            'section' => $enrollment?->section,
            'adviser' => $enrollment?->section?->adviser,
            'record' => $record,
            'descriptorLegend' => [
                ['range' => '90 - 100', 'descriptor' => 'Outstanding', 'remarks' => 'Passed'],
                ['range' => '85 - 89', 'descriptor' => 'Very Satisfactory', 'remarks' => 'Passed'],
                ['range' => '80 - 84', 'descriptor' => 'Satisfactory', 'remarks' => 'Passed'],
                ['range' => '75 - 79', 'descriptor' => 'Fairly Satisfactory', 'remarks' => 'Passed'],
                ['range' => 'Below 75', 'descriptor' => 'Did Not Meet Expectations', 'remarks' => 'Failed'],
            ],
        ]);
    }

    /**
     * The teacher's class record: every assessment column with the DepEd
     * computation worked out beside it.
     */
    public function classRecord(Request $request, SubjectClass $subjectClass): View
    {
        $this->authorizeClass($request, $subjectClass);

        $subjectClass->load(['subject', 'section.strand', 'semester.schoolYear', 'teacher']);

        $quarter = Quarter::find($request->integer('quarter'))
            ?? $subjectClass->semester->quarters()->first();

        $assessments = Assessment::with('scores')
            ->where('subject_class_id', $subjectClass->id)
            ->where('quarter_id', $quarter->id)
            ->orderBy('component')
            ->orderBy('position')
            ->get();

        $grades = Grade::where('subject_class_id', $subjectClass->id)
            ->where('quarter_id', $quarter->id)
            ->get()
            ->keyBy('student_id');

        return view('reports.class-record', [
            'school' => Setting::get('school', []),
            'subjectClass' => $subjectClass,
            'quarter' => $quarter,
            'weights' => $subjectClass->weights(),
            'components' => collect(GradeComponent::cases())->mapWithKeys(fn (GradeComponent $c) => [
                $c->value => $assessments->filter(fn (Assessment $a) => $a->component === $c)->values(),
            ]),
            'students' => $subjectClass->students(),
            'assessments' => $assessments,
            'grades' => $grades,
        ]);
    }

    /**
     * The section master list: every learner's final grade in every subject,
     * with their general average.
     */
    public function masterList(Request $request, Section $section): View
    {
        $semester = Semester::with('schoolYear', 'quarters')->find($request->integer('semester')) ?? Semester::active();
        $section->load('strand', 'adviser');

        $classes = SubjectClass::with('subject')
            ->where('section_id', $section->id)
            ->where('semester_id', $semester->id)
            ->get()
            ->sortBy(fn (SubjectClass $c) => $c->subject->code)
            ->values();

        $students = Student::query()
            ->whereHas('enrollments', fn ($q) => $q
                ->where('section_id', $section->id)
                ->where('semester_id', $semester->id)
                ->where('status', 'enrolled'))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        $quarterIds = $semester->quarters->pluck('id');

        $grades = Grade::whereIn('subject_class_id', $classes->pluck('id'))
            ->whereIn('quarter_id', $quarterIds)
            ->whereIn('student_id', $students->pluck('id'))
            ->get();

        // Semestral final per learner per subject = mean of that semester's quarters.
        $matrix = $students->mapWithKeys(function (Student $student) use ($classes, $grades) {
            $row = $classes->mapWithKeys(function (SubjectClass $class) use ($student, $grades) {
                $marks = $grades
                    ->where('student_id', $student->id)
                    ->where('subject_class_id', $class->id)
                    ->pluck('final_grade')
                    ->filter(fn ($g) => $g !== null);

                return [$class->id => $marks->isEmpty() ? null : (int) round($marks->avg())];
            });

            $present = $row->filter(fn ($g) => $g !== null);

            return [$student->id => [
                'grades' => $row,
                'general_average' => $present->isEmpty() ? null : (int) round($present->avg()),
            ]];
        });

        return view('reports.master-list', [
            'school' => Setting::get('school', []),
            'section' => $section,
            'semester' => $semester,
            'classes' => $classes,
            'students' => $students,
            'matrix' => $matrix,
            'passingGrade' => GradeDescriptor::PASSING_GRADE,
        ]);
    }

    private function authorizeStudent(Request $request, Student $student): void
    {
        $user = $request->user();

        if ($user->isAdmin() || $user->isTeacher()) {
            return;
        }

        if ($user->isStudent() && $user->student?->id === $student->id) {
            return;
        }

        abort(403, 'You may only view your own report card.');
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
