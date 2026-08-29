<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Student\StudentDashboardController;
use App\Http\Controllers\Teacher\TeacherDashboardController;
use Illuminate\Http\Request;

/**
 * One dashboard route, three dashboards -- each role sees the portal from
 * where they sit in the school.
 */
class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        return match (true) {
            $user->isAdmin() => app(AdminDashboardController::class)($request),
            $user->isTeacher() => app(TeacherDashboardController::class)($request),
            default => app(StudentDashboardController::class)($request),
        };
    }
}
