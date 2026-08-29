<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use App\Models\SubjectClass;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassController extends Controller
{
    public function index(Request $request): Response
    {
        $teacher = $request->user()->teacher;
        $semester = Semester::active();

        $classes = SubjectClass::query()
            ->with(['subject', 'section.strand'])
            ->where('teacher_id', $teacher?->id)
            ->where('semester_id', $semester?->id)
            ->get()
            ->map(fn (SubjectClass $class) => [
                'id' => $class->id,
                'subject_code' => $class->subject->code,
                'subject_title' => $class->subject->title,
                'subject_type' => $class->subject->type->label(),
                'section' => $class->section->name,
                'strand' => $class->section->strand->code,
                'schedule' => $class->schedule,
                'room' => $class->room,
                'students' => $class->students()->count(),
                'weights' => $class->weights()->toArray(),
            ])
            ->sortBy('section')
            ->values();

        return Inertia::render('teacher/classes', [
            'classes' => $classes,
            'quarters' => $semester?->quarters()->get(['id', 'number', 'name', 'is_locked']) ?? [],
        ]);
    }
}
