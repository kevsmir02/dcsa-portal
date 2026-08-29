<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EnrollmentController extends Controller
{
    public function index(Request $request): Response
    {
        $semester = Semester::active();

        $enrollments = Enrollment::query()
            ->with(['student:id,lrn,first_name,middle_name,last_name', 'section:id,name'])
            ->where('semester_id', $semester?->id)
            ->when($request->string('search')->trim()->value(), fn ($q, $search) => $q
                ->whereHas('student', fn ($s) => $s
                    ->where('lrn', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")))
            ->when($request->integer('section_id'), fn ($q, $id) => $q->where('section_id', $id))
            ->when($request->string('status')->value(), fn ($q, $status) => $q->where('status', $status))
            ->latest('date_enrolled')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'student_id' => $enrollment->student_id,
                'lrn' => $enrollment->student->lrn,
                'student' => $enrollment->student->full_name,
                'section_id' => $enrollment->section_id,
                'section' => $enrollment->section->name,
                'date_enrolled' => $enrollment->date_enrolled->format('M j, Y'),
                'status' => $enrollment->status,
            ]);

        $sections = Section::withCount(['enrollments' => fn ($q) => $q
            ->where('semester_id', $semester?->id)->where('status', 'enrolled')])
            ->orderBy('name')
            ->get()
            ->map(fn (Section $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'capacity' => $s->capacity,
                'enrolled' => $s->enrollments_count,
                'slots' => max(0, $s->capacity - $s->enrollments_count),
            ]);

        return Inertia::render('admin/enrollment/index', [
            'enrollments' => $enrollments,
            'sections' => $sections,
            'unenrolled' => Student::query()
                ->where('status', 'active')
                ->whereDoesntHave('enrollments', fn ($q) => $q->where('semester_id', $semester?->id))
                ->orderBy('last_name')
                ->limit(50)
                ->get()
                ->map(fn (Student $s) => ['id' => $s->id, 'label' => "{$s->lrn} - {$s->full_name}"]),
            'filters' => $request->only('search', 'section_id', 'status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $semester = Semester::active();

        $data = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'section_id' => ['required', 'exists:sections,id'],
        ]);

        $section = Section::withCount(['enrollments' => fn ($q) => $q
            ->where('semester_id', $semester->id)->where('status', 'enrolled')])
            ->find($data['section_id']);

        if ($section->enrollments_count >= $section->capacity) {
            return back()->with('error', "{$section->name} is already at full capacity.");
        }

        $enrollment = Enrollment::updateOrCreate(
            ['student_id' => $data['student_id'], 'semester_id' => $semester->id],
            ['section_id' => $data['section_id'], 'date_enrolled' => now(), 'status' => 'enrolled'],
        );

        $enrollment->load('student');
        ActivityLog::record('enrollment.created', "{$enrollment->student->full_name} enrolled in {$section->name}", $enrollment);

        return back()->with('success', "{$enrollment->student->full_name} has been enrolled in {$section->name}.");
    }

    public function update(Request $request, Enrollment $enrollment): RedirectResponse
    {
        $data = $request->validate([
            'section_id' => ['required', 'exists:sections,id'],
            'status' => ['required', Rule::in(['enrolled', 'dropped', 'transferred', 'completed'])],
            'remarks' => ['nullable', 'string', 'max:255'],
        ]);

        $enrollment->update($data);
        $enrollment->load('student', 'section');

        ActivityLog::record('enrollment.updated', "Enrolment updated for {$enrollment->student->full_name} ({$enrollment->status})", $enrollment);

        return back()->with('success', 'Enrolment record updated.');
    }

    public function destroy(Enrollment $enrollment): RedirectResponse
    {
        $name = $enrollment->student->full_name;
        $enrollment->delete();

        ActivityLog::record('enrollment.deleted', "Enrolment removed for {$name}");

        return back()->with('success', "Enrolment for {$name} has been removed.");
    }
}
