<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Semester;
use App\Services\AcademicRecord;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyGradesController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $student = $request->user()->student;
        $semesters = Semester::with('schoolYear', 'quarters')->orderBy('term')->get();
        $semester = $semesters->firstWhere('id', $request->integer('semester')) ?? Semester::active() ?? $semesters->first();

        $record = ($student && $semester) ? app(AcademicRecord::class)->forSemester($student, $semester) : null;
        $enrollment = $student && $semester ? $student->enrollmentFor($semester->id) : null;

        // The component breakdown behind each subject's quarterly grade, so a
        // learner can see how the number was arrived at rather than just the number.
        $breakdown = $student && $semester
            ? Grade::with('subjectClass.subject')
                ->where('student_id', $student->id)
                ->whereIn('quarter_id', $semester->quarters->pluck('id'))
                ->get()
                ->groupBy('subject_class_id')
                ->map(fn ($grades) => $grades->mapWithKeys(fn (Grade $g) => [
                    $g->quarter->number => [
                        'ww_ps' => $g->ww_ps, 'pt_ps' => $g->pt_ps, 'qa_ps' => $g->qa_ps,
                        'ww_ws' => $g->ww_ws, 'pt_ws' => $g->pt_ws, 'qa_ws' => $g->qa_ws,
                        'initial_grade' => $g->initial_grade,
                        'final_grade' => $g->final_grade,
                    ],
                ]))
            : collect();

        return Inertia::render('student/grades', [
            'student' => $student ? [
                'id' => $student->id,
                'lrn' => $student->lrn,
                'full_name' => $student->full_name,
                'section' => $enrollment?->section?->name,
                'strand' => $enrollment?->section?->strand?->code,
            ] : null,
            'semesters' => $semesters->map(fn (Semester $s) => [
                'id' => $s->id,
                'label' => "{$s->name}, S.Y. {$s->schoolYear->name}",
            ]),
            'selectedSemester' => $semester?->id,
            'record' => $record,
            'breakdown' => $breakdown,
        ]);
    }
}
