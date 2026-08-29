<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Quarter;
use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\Setting;
use App\Models\User;
use App\Support\TemporaryPassword;
use App\Support\TransmutationTable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/settings/index', [
            'school' => Setting::get('school', []),
            'grading' => Setting::get('grading', ['passing_grade' => 75]),
            'schoolYears' => SchoolYear::with('semesters.quarters.lockedBy:id,name')
                ->orderByDesc('name')
                ->get(),
            'transmutation' => collect(TransmutationTable::ranges())->map(fn (array $r) => [
                'min' => $r[0], 'max' => $r[1], 'grade' => $r[2],
            ]),
            'defaultWeights' => [
                ['label' => 'Core subjects (all tracks)', 'ww' => 25, 'pt' => 50, 'qa' => 25],
                ['label' => 'Academic track — applied & specialized', 'ww' => 25, 'pt' => 45, 'qa' => 30],
                ['label' => 'TVL, Sports, Arts & Design — applied & specialized', 'ww' => 20, 'pt' => 60, 'qa' => 20],
            ],
            'users' => User::orderBy('role')->orderBy('name')->paginate(10)->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'role_label' => $user->role->label(),
                'is_active' => $user->is_active,
            ]),
        ]);
    }

    public function updateSchool(Request $request): RedirectResponse
    {
        Setting::put('school', $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'short_name' => ['required', 'string', 'max:20'],
            'system_name' => ['required', 'string', 'max:150'],
            'address' => ['nullable', 'string', 'max:255'],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'school_id' => ['nullable', 'string', 'max:20'],
        ]));

        return back()->with('success', 'School profile updated.');
    }

    /** Switch the portal over to a different semester. */
    public function activateSemester(Request $request, Semester $semester): RedirectResponse
    {
        Semester::query()->update(['is_active' => false]);
        SchoolYear::query()->update(['is_active' => false]);

        $semester->update(['is_active' => true]);
        $semester->schoolYear->update(['is_active' => true]);

        ActivityLog::record('semester.activated', "{$semester->name}, S.Y. {$semester->schoolYear->name} is now the active term.", $semester);

        return back()->with('success', "{$semester->name} is now active.");
    }

    /**
     * Close a quarter to freeze every class record in it, or reopen it.
     * This is the whole grade-finalisation workflow: teachers encode freely
     * while a quarter is open, and nothing can change once it is closed.
     */
    public function toggleQuarterLock(Request $request, Quarter $quarter): RedirectResponse
    {
        $locking = ! $quarter->is_locked;

        $quarter->update([
            'is_locked' => $locking,
            'locked_at' => $locking ? now() : null,
            'locked_by' => $locking ? $request->user()->id : null,
        ]);

        ActivityLog::record(
            $locking ? 'quarter.locked' : 'quarter.unlocked',
            $locking
                ? "{$quarter->name} closed for encoding"
                : "{$quarter->name} reopened for encoding",
            $quarter,
        );

        return back()->with('success', $locking
            ? "{$quarter->name} is now closed. Grades are frozen."
            : "{$quarter->name} is open again for encoding.");
    }

    public function resetPassword(User $user): RedirectResponse
    {
        $temporaryPassword = TemporaryPassword::generate();
        $user->update(['password' => Hash::make($temporaryPassword)]);

        ActivityLog::record('user.password_reset', "Password reset for {$user->name}", $user);

        return back()->with('success', "{$user->name}'s password is now {$temporaryPassword} (shown once — write it down).");
    }

    public function toggleUser(User $user): RedirectResponse
    {
        $user->update(['is_active' => ! $user->is_active]);

        return back()->with('success', "{$user->name} has been ".($user->is_active ? 'enabled' : 'disabled').'.');
    }
}
