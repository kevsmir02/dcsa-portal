<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Grade;
use App\Models\Semester;
use App\Models\SubjectClass;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $teacher = $request->user()->teacher;
        $semester = Semester::active();
        $quarters = $semester?->quarters ?? collect();
        $openQuarter = $quarters->firstWhere('is_locked', false);

        $classes = SubjectClass::query()
            ->with(['subject', 'section.strand'])
            ->where('teacher_id', $teacher?->id)
            ->where('semester_id', $semester?->id)
            ->get();

        $classIds = $classes->pluck('id');

        // How much of the open quarter each class still has to encode.
        $graded = $openQuarter
            ? Grade::whereIn('subject_class_id', $classIds)
                ->where('quarter_id', $openQuarter->id)
                ->whereNotNull('final_grade')
                ->selectRaw('subject_class_id, COUNT(*) as total')
                ->groupBy('subject_class_id')
                ->pluck('total', 'subject_class_id')
            : collect();

        return Inertia::render('dashboard/teacher', [
            'teacher' => [
                'name' => $teacher?->full_name,
                'position' => $teacher?->position,
                'department' => $teacher?->department,
                'advisory' => $teacher?->advisorySections()->pluck('name')->implode(', '),
            ],
            'stats' => [
                'classes' => $classes->count(),
                'sections' => $classes->pluck('section_id')->unique()->count(),
                'students' => $classes->sum(fn (SubjectClass $c) => $c->students()->count()),
                'subjects' => $classes->pluck('subject_id')->unique()->count(),
            ],
            'openQuarter' => $openQuarter ? ['id' => $openQuarter->id, 'name' => $openQuarter->name] : null,
            'classes' => $classes->map(function (SubjectClass $class) use ($graded, $openQuarter) {
                $enrolled = $class->students()->count();
                $done = (int) ($graded[$class->id] ?? 0);

                return [
                    'id' => $class->id,
                    'subject_code' => $class->subject->code,
                    'subject_title' => $class->subject->title,
                    'section' => $class->section->name,
                    'schedule' => $class->schedule,
                    'room' => $class->room,
                    'students' => $enrolled,
                    'graded' => $done,
                    'progress' => $enrolled > 0 ? (int) round($done / $enrolled * 100) : 0,
                    'quarter_id' => $openQuarter?->id,
                ];
            })->sortBy('section')->values(),
            'upcomingEvents' => Event::whereIn('audience', ['all', 'teachers'])
                ->where('starts_at', '>=', now()->startOfDay())
                ->orderBy('starts_at')
                ->limit(4)
                ->get()
                ->map(fn (Event $event) => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'month' => $event->starts_at->format('M'),
                    'day' => $event->starts_at->format('j'),
                    'when' => $event->starts_at->format('M j, Y \a\t g:i A'),
                    'location' => $event->location,
                ]),
        ]);
    }
}
