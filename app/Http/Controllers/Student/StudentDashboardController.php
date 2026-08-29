<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Semester;
use App\Services\AcademicRecord;
use App\Support\GradeDescriptor;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $student = $request->user()->student;
        $semester = Semester::active();
        $record = ($student && $semester) ? app(AcademicRecord::class)->forSemester($student, $semester) : null;
        $enrollment = $student && $semester ? $student->enrollmentFor($semester->id) : null;

        $subjects = collect($record['subjects'] ?? []);

        return Inertia::render('dashboard/student', [
            'student' => $student ? [
                'id' => $student->id,
                'lrn' => $student->lrn,
                'full_name' => $student->full_name,
                'section' => $enrollment?->section?->name,
                'strand' => $enrollment?->section?->strand?->code,
                'adviser' => $enrollment?->section?->adviser?->full_name,
            ] : null,
            'semester' => $semester ? [
                'id' => $semester->id,
                'name' => $semester->name,
                'school_year' => $semester->schoolYear->name,
            ] : null,
            'generalAverage' => $record['general_average'] ?? null,
            'descriptor' => $record['descriptor'] ?? GradeDescriptor::for(null),
            'stats' => [
                'subjects' => $subjects->count(),
                'passing' => $subjects->where('remarks', 'passed')->count(),
                'at_risk' => $subjects->filter(fn ($s) => $s['semestral_final'] !== null && $s['semestral_final'] < 80)->count(),
                'highest' => $subjects->pluck('semestral_final')->filter()->max(),
            ],
            'subjects' => $subjects->all(),
            'quarters' => collect($record['quarters'] ?? [])->map(fn ($q) => ['number' => $q->number, 'name' => $q->name]),
            'upcomingEvents' => Event::whereIn('audience', ['all', 'students'])
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
