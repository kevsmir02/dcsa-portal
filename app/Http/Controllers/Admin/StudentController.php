<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use App\Services\AcademicRecord;
use App\Support\TemporaryPassword;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    public function index(Request $request): Response
    {
        $semester = Semester::active();

        $students = Student::query()
            ->with(['enrollments' => fn ($q) => $q->where('semester_id', $semester?->id)->with('section')])
            ->when($request->string('search')->trim()->value(), function ($query, string $search) {
                $query->where(fn ($q) => $q
                    ->where('lrn', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%"));
            })
            ->when($request->string('status')->value(), fn ($q, $status) => $q->where('status', $status))
            ->when($request->integer('section_id'), fn ($q, $sectionId) => $q
                ->whereHas('enrollments', fn ($e) => $e->where('section_id', $sectionId)->where('semester_id', $semester?->id)))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Student $student) => [
                'id' => $student->id,
                'lrn' => $student->lrn,
                'full_name' => $student->full_name,
                'sex' => $student->sex,
                'section' => $student->enrollments->first()?->section?->name,
                'status' => $student->status,
            ]);

        return Inertia::render('admin/students/index', [
            'students' => $students,
            'sections' => Section::orderBy('name')->get(['id', 'name']),
            'filters' => $request->only('search', 'status', 'section_id'),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/students/form', [
            'student' => null,
            'sections' => Section::with('strand')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $student = Student::create($data['student']);
        $temporaryPassword = $this->syncLogin($student);

        if (! empty($data['section_id']) && $semester = Semester::active()) {
            Enrollment::updateOrCreate(
                ['student_id' => $student->id, 'semester_id' => $semester->id],
                ['section_id' => $data['section_id'], 'date_enrolled' => now(), 'status' => 'enrolled'],
            );
        }

        ActivityLog::record('student.created', "New student registered: {$student->full_name}", $student);

        return to_route('admin.students.index')
            ->with('success', $this->credentialsNotice("{$student->full_name} has been added.", $student, $temporaryPassword));
    }

    public function show(Student $student): Response
    {
        $semester = Semester::active();

        return Inertia::render('admin/students/show', [
            'student' => $student->load(['enrollments.section.strand', 'enrollments.semester']),
            'record' => $semester ? app(AcademicRecord::class)->forSemester($student, $semester) : null,
        ]);
    }

    public function edit(Student $student): Response
    {
        $semester = Semester::active();

        return Inertia::render('admin/students/form', [
            'student' => $student,
            'sections' => Section::with('strand')->orderBy('name')->get(),
            'currentSectionId' => $student->enrollmentFor($semester?->id ?? 0)?->section_id,
        ]);
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $data = $this->validated($request, $student);

        $student->update($data['student']);
        $temporaryPassword = $this->syncLogin($student);

        if (! empty($data['section_id']) && $semester = Semester::active()) {
            Enrollment::updateOrCreate(
                ['student_id' => $student->id, 'semester_id' => $semester->id],
                ['section_id' => $data['section_id'], 'date_enrolled' => now(), 'status' => 'enrolled'],
            );
        }

        ActivityLog::record('student.updated', "Student record updated: {$student->full_name}", $student);

        return to_route('admin.students.index')
            ->with('success', $this->credentialsNotice("{$student->full_name} has been updated.", $student, $temporaryPassword));
    }

    public function destroy(Student $student): RedirectResponse
    {
        $name = $student->full_name;
        $student->user?->delete();
        $student->delete();

        ActivityLog::record('student.deleted', "Student record removed: {$name}");

        return to_route('admin.students.index')->with('success', "{$name} has been removed.");
    }

    /** @return array{student: array<string, mixed>, section_id: int|null} */
    private function validated(Request $request, ?Student $student = null): array
    {
        $validated = $request->validate([
            'lrn' => ['required', 'digits:12', Rule::unique('students', 'lrn')->ignore($student)],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'sex' => ['nullable', Rule::in(['male', 'female'])],
            'birthdate' => ['nullable', 'date', 'before:today'],
            'birthplace' => ['nullable', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'guardian_name' => ['nullable', 'string', 'max:150'],
            'guardian_contact' => ['nullable', 'string', 'max:20'],
            'guardian_relationship' => ['nullable', 'string', 'max:50'],
            'status' => ['required', Rule::in(['active', 'dropped', 'transferred', 'graduated'])],
            'section_id' => ['nullable', 'exists:sections,id'],
        ]);

        $sectionId = $validated['section_id'] ?? null;
        unset($validated['section_id']);

        return ['student' => $validated, 'section_id' => $sectionId];
    }

    /**
     * Every learner gets a portal login so they can see their own grades.
     *
     * Returns the one-time password when an account is created, so the caller
     * can show it to the registrar once; null when the learner already had one.
     */
    private function syncLogin(Student $student): ?string
    {
        $email = Str::slug($student->first_name.'.'.$student->last_name.'.'.$student->id, '.').'@dcsa.edu.ph';

        if ($student->user) {
            $student->user->update(['name' => "{$student->first_name} {$student->last_name}"]);

            return null;
        }

        $temporaryPassword = TemporaryPassword::generate();

        $user = User::create([
            'name' => "{$student->first_name} {$student->last_name}",
            'email' => $email,
            'password' => Hash::make($temporaryPassword),
            'role' => 'student',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $student->update(['user_id' => $user->id]);

        return $temporaryPassword;
    }

    /** The registrar sees the new sign-in details exactly once. */
    private function credentialsNotice(string $message, Student $student, ?string $temporaryPassword): string
    {
        if ($temporaryPassword === null) {
            return $message;
        }

        return $message." Sign-in: {$student->fresh()->user->email} · temporary password: {$temporaryPassword} (shown once — write it down).";
    }
}
