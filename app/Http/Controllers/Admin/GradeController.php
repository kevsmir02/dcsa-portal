<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\SubjectClass;
use App\Models\Teacher;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The administrator's view over every class record: which classes are encoded,
 * which are still outstanding, and a way into any of them.
 */
class GradeController extends Controller
{
    public function index(Request $request): Response
    {
        $semester = Semester::active();
        $quarters = $semester?->quarters()->get() ?? collect();
        $quarter = $quarters->firstWhere('id', $request->integer('quarter'))
            ?? $quarters->firstWhere('is_locked', false)
            ?? $quarters->first();

        $classes = SubjectClass::query()
            ->with(['subject:id,code,title', 'section:id,name', 'teacher:id,first_name,middle_name,last_name'])
            ->where('semester_id', $semester?->id)
            ->when($request->integer('section_id'), fn ($q, $id) => $q->where('section_id', $id))
            ->when($request->integer('subject_id'), fn ($q, $id) => $q->where('subject_id', $id))
            ->when($request->integer('teacher_id'), fn ($q, $id) => $q->where('teacher_id', $id))
            ->get();

        $graded = $quarter
            ? Grade::whereIn('subject_class_id', $classes->pluck('id'))
                ->where('quarter_id', $quarter->id)
                ->whereNotNull('final_grade')
                ->selectRaw('subject_class_id, COUNT(*) as total, AVG(final_grade) as average')
                ->groupBy('subject_class_id')
                ->get()
                ->keyBy('subject_class_id')
            : collect();

        $rows = $classes->map(function (SubjectClass $class) use ($graded) {
            $enrolled = $class->students()->count();
            $stat = $graded->get($class->id);
            $done = (int) ($stat->total ?? 0);

            return [
                'id' => $class->id,
                'subject_code' => $class->subject->code,
                'subject_title' => $class->subject->title,
                'section' => $class->section->name,
                'teacher' => $class->teacher?->full_name ?? 'Unassigned',
                'students' => $enrolled,
                'graded' => $done,
                'progress' => $enrolled > 0 ? (int) round($done / $enrolled * 100) : 0,
                'average' => $stat?->average ? round((float) $stat->average, 2) : null,
            ];
        })->sortBy([['section', 'asc'], ['subject_code', 'asc']])->values();

        return Inertia::render('admin/grades/index', [
            'classes' => $rows,
            'quarters' => $quarters->map(fn ($q) => [
                'id' => $q->id, 'name' => $q->name, 'number' => $q->number, 'is_locked' => $q->is_locked,
            ]),
            'selectedQuarter' => $quarter?->id,
            'sections' => Section::orderBy('name')->get(['id', 'name']),
            'subjects' => Subject::orderBy('code')->get(['id', 'code', 'title']),
            'teachers' => Teacher::orderBy('last_name')->get()->map(fn (Teacher $t) => ['id' => $t->id, 'name' => $t->full_name]),
            'filters' => $request->only('section_id', 'subject_id', 'teacher_id'),
            'summary' => [
                'classes' => $rows->count(),
                'complete' => $rows->where('progress', 100)->count(),
                'outstanding' => $rows->where('progress', '<', 100)->count(),
            ],
        ]);
    }
}
