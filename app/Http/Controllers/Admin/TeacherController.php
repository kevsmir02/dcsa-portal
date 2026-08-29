<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Semester;
use App\Models\Teacher;
use App\Models\User;
use App\Support\TemporaryPassword;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeacherController extends Controller
{
    public function index(Request $request): Response
    {
        $semester = Semester::active();

        $teachers = Teacher::query()
            ->withCount(['subjectClasses' => fn ($q) => $q->where('semester_id', $semester?->id)])
            ->with('advisorySections:id,adviser_id,name')
            ->when($request->string('search')->trim()->value(), fn ($q, $search) => $q
                ->where(fn ($w) => $w
                    ->where('employee_no', 'like', "%{$search}%")
                    ->orWhere('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")))
            ->when($request->string('department')->value(), fn ($q, $dept) => $q->where('department', $dept))
            ->orderBy('last_name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Teacher $teacher) => [
                'id' => $teacher->id,
                'employee_no' => $teacher->employee_no,
                'full_name' => $teacher->full_name,
                'first_name' => $teacher->first_name,
                'middle_name' => $teacher->middle_name,
                'last_name' => $teacher->last_name,
                'sex' => $teacher->sex,
                'position' => $teacher->position,
                'department' => $teacher->department,
                'contact_number' => $teacher->contact_number,
                'email' => $teacher->email,
                'is_active' => $teacher->is_active,
                'load' => $teacher->subject_classes_count,
                'advisory' => $teacher->advisorySections->pluck('name')->implode(', '),
            ]);

        return Inertia::render('admin/teachers/index', [
            'teachers' => $teachers,
            'departments' => Teacher::query()->whereNotNull('department')->distinct()->orderBy('department')->pluck('department'),
            'filters' => $request->only('search', 'department'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);

        $temporaryPassword = TemporaryPassword::generate();

        $user = User::create([
            'name' => "{$data['first_name']} {$data['last_name']}",
            'email' => $data['email'],
            'password' => Hash::make($temporaryPassword),
            'role' => 'teacher',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $teacher = Teacher::create([...$data, 'user_id' => $user->id]);

        ActivityLog::record('teacher.created', "New teacher added: {$teacher->full_name}", $teacher);

        return back()->with('success', "{$teacher->full_name} has been added. Sign-in: {$user->email} · temporary password: {$temporaryPassword} (shown once — write it down).");
    }

    public function update(Request $request, Teacher $teacher): RedirectResponse
    {
        $data = $this->validated($request, $teacher);

        $teacher->update($data);
        $teacher->user?->update([
            'name' => "{$data['first_name']} {$data['last_name']}",
            'email' => $data['email'],
            'is_active' => $data['is_active'],
        ]);

        ActivityLog::record('teacher.updated', "Teacher record updated: {$teacher->full_name}", $teacher);

        return back()->with('success', "{$teacher->full_name} has been updated.");
    }

    public function destroy(Teacher $teacher): RedirectResponse
    {
        $name = $teacher->full_name;
        $teacher->user?->delete();
        $teacher->delete();

        ActivityLog::record('teacher.deleted', "Teacher record removed: {$name}");

        return back()->with('success', "{$name} has been removed.");
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Teacher $teacher = null): array
    {
        return $request->validate([
            'employee_no' => ['required', 'string', 'max:30', Rule::unique('teachers', 'employee_no')->ignore($teacher)],
            'first_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'sex' => ['nullable', Rule::in(['male', 'female'])],
            'position' => ['nullable', 'string', 'max:100'],
            'department' => ['nullable', 'string', 'max:100'],
            'contact_number' => ['nullable', 'string', 'max:20'],
            'email' => ['required', 'email', 'max:150', Rule::unique('users', 'email')->ignore($teacher?->user_id)],
            'is_active' => ['boolean'],
        ]);
    }
}
