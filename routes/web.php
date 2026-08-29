<?php

use App\Http\Controllers\Admin\EnrollmentController;
use App\Http\Controllers\Admin\GradeController;
use App\Http\Controllers\Admin\SectionController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\ClassRecordController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Reports\ReportController;
use App\Http\Controllers\Student\MyGradesController;
use App\Http\Controllers\Teacher\ClassController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => auth()->check()
    ? redirect()->route('dashboard')
    : redirect()->route('login'))->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    /*
     * Administrator -- the registrar's side of the portal.
     */
    Route::middleware('role:admin')->prefix('admin')->name('admin.')->group(function () {
        Route::resource('students', StudentController::class);

        Route::resource('teachers', TeacherController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('subjects', SubjectController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::resource('sections', SectionController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::get('enrollment', [EnrollmentController::class, 'index'])->name('enrollment.index');
        Route::post('enrollment', [EnrollmentController::class, 'store'])->name('enrollment.store');
        Route::patch('enrollment/{enrollment}', [EnrollmentController::class, 'update'])->name('enrollment.update');
        Route::delete('enrollment/{enrollment}', [EnrollmentController::class, 'destroy'])->name('enrollment.destroy');

        Route::get('grades', [GradeController::class, 'index'])->name('grades.index');

        Route::get('settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('settings/school', [SettingsController::class, 'updateSchool'])->name('settings.school');
        Route::post('settings/semesters/{semester}/activate', [SettingsController::class, 'activateSemester'])->name('settings.semesters.activate');
        Route::post('settings/quarters/{quarter}/toggle-lock', [SettingsController::class, 'toggleQuarterLock'])->name('settings.quarters.lock');
        Route::post('settings/users/{user}/reset-password', [SettingsController::class, 'resetPassword'])->name('settings.users.reset');
        Route::post('settings/users/{user}/toggle', [SettingsController::class, 'toggleUser'])->name('settings.users.toggle');
    });

    /*
     * Teacher -- their own teaching load.
     */
    Route::middleware('role:teacher')->prefix('teacher')->name('teacher.')->group(function () {
        Route::get('classes', [ClassController::class, 'index'])->name('classes.index');
    });

    /*
     * The class record itself is shared: a teacher opens their own classes,
     * an administrator opens any of them.
     */
    Route::middleware('role:admin,teacher')->prefix('class-record')->name('class-record.')->scopeBindings()->group(function () {
        Route::get('{subjectClass}', [ClassRecordController::class, 'show'])->name('show');
        Route::post('{subjectClass}/scores', [ClassRecordController::class, 'saveScores'])->name('scores');
        Route::post('{subjectClass}/assessments', [ClassRecordController::class, 'storeAssessment'])->name('assessments.store');
        Route::put('{subjectClass}/assessments/{assessment}', [ClassRecordController::class, 'updateAssessment'])->name('assessments.update');
        Route::delete('{subjectClass}/assessments/{assessment}', [ClassRecordController::class, 'destroyAssessment'])->name('assessments.destroy');
    });

    /*
     * Learner -- their own grades only.
     */
    Route::middleware('role:student')->prefix('student')->name('student.')->group(function () {
        Route::get('grades', MyGradesController::class)->name('grades');
    });

    /*
     * Printable DepEd forms.
     */
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::get('/', [ReportController::class, 'index'])->middleware('role:admin')->name('index');
        Route::get('report-card/{student}', [ReportController::class, 'reportCard'])->name('report-card');
        Route::get('class-record/{subjectClass}', [ReportController::class, 'classRecord'])->middleware('role:admin,teacher')->name('class-record');
        Route::get('master-list/{section}', [ReportController::class, 'masterList'])->middleware('role:admin,teacher')->name('master-list');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
