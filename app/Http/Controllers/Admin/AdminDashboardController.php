<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Enrollment;
use App\Models\Event;
use App\Models\Grade;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $semester = Semester::active();

        return Inertia::render('dashboard/admin', [
            'stats' => [
                'students' => Student::where('status', 'active')->count(),
                'teachers' => Teacher::where('is_active', true)->count(),
                'subjects' => Subject::where('is_active', true)->count(),
                'sections' => Section::where('is_active', true)->count(),
            ],
            'enrollmentTrend' => $this->enrollmentTrend($semester),
            'gradeDistribution' => $this->gradeDistribution($semester),
            'recentActivities' => ActivityLog::with('user')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (ActivityLog $log) => [
                    'id' => $log->id,
                    'action' => $log->action,
                    'description' => $log->description,
                    'when' => $log->created_at->diffForHumans(),
                ]),
            'latestStudents' => Student::with(['enrollments.section'])
                ->latest('id')
                ->limit(5)
                ->get()
                ->map(fn (Student $student) => [
                    'id' => $student->id,
                    'lrn' => $student->lrn,
                    'full_name' => $student->full_name,
                    'section' => $student->enrollments->firstWhere('semester_id', $semester?->id)?->section?->name,
                    'status' => $student->status,
                ]),
            'upcomingEvents' => Event::where('starts_at', '>=', now()->startOfDay())
                ->orderBy('starts_at')
                ->limit(4)
                ->get()
                ->map(fn (Event $event) => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'month' => $event->starts_at->format('M'),
                    'day' => $event->starts_at->format('j'),
                    'when' => $event->ends_at && ! $event->ends_at->isSameDay($event->starts_at)
                        ? $event->starts_at->format('M j').' - '.$event->ends_at->format('M j, Y')
                        : $event->starts_at->format('M j, Y \a\t g:i A'),
                    'location' => $event->location,
                ]),
        ]);
    }

    /** Cumulative enrolment per month, so the trend line climbs the way a real intake does. */
    private function enrollmentTrend(?Semester $semester): array
    {
        if (! $semester) {
            return [];
        }

        // Grouped in PHP rather than with a date function, so the query stays
        // free of SQL-dialect specifics.
        $monthly = Enrollment::query()
            ->where('semester_id', $semester->id)
            ->pluck('date_enrolled')
            ->groupBy(fn ($date) => $date->format('Y-m'))
            ->map->count()
            ->sortKeys();

        $running = 0;

        return $monthly->map(function (int $total, string $month) use (&$running) {
            $running += $total;

            return [
                'month' => Carbon::createFromFormat('Y-m', $month)->format('M'),
                'total' => $running,
            ];
        })->values()->all();
    }

    /** Learners bucketed by the DepEd descriptor bands of their latest quarterly grade. */
    private function gradeDistribution(?Semester $semester): array
    {
        if (! $semester) {
            return [];
        }

        $quarterIds = $semester->quarters()->pluck('id');

        $grades = Grade::whereIn('quarter_id', $quarterIds)
            ->whereNotNull('final_grade')
            ->pluck('final_grade');

        $total = $grades->count();

        $bands = [
            ['label' => '90 - 100 (Outstanding)', 'min' => 90, 'max' => 100],
            ['label' => '85 - 89 (Very Satisfactory)', 'min' => 85, 'max' => 89],
            ['label' => '80 - 84 (Satisfactory)', 'min' => 80, 'max' => 84],
            ['label' => '75 - 79 (Fairly Satisfactory)', 'min' => 75, 'max' => 79],
            ['label' => 'Below 75 (Did Not Meet Expectations)', 'min' => 0, 'max' => 74],
        ];

        return collect($bands)->map(function (array $band) use ($grades, $total) {
            $count = $grades->filter(fn (int $g) => $g >= $band['min'] && $g <= $band['max'])->count();

            return [
                'label' => $band['label'],
                'count' => $count,
                'percentage' => $total > 0 ? round($count / $total * 100) : 0,
            ];
        })->all();
    }
}
