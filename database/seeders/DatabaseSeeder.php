<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@dcsa.edu.ph',
            'password' => Hash::make('password'),
            'role' => UserRole::Admin,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->call([
            AcademicCalendarSeeder::class,
            StrandSeeder::class,
            SubjectSeeder::class,
            TeacherSeeder::class,
            SectionSeeder::class,
            StudentSeeder::class,
            EnrollmentSeeder::class,
            SubjectClassSeeder::class,
            ClassRecordSeeder::class,
            EventSeeder::class,
        ]);

        $this->seedActivityLog();
    }

    private function seedActivityLog(): void
    {
        $admin = User::where('role', UserRole::Admin)->first();
        $latest = Student::latest('id')->first();

        $entries = [
            ['student.created', "New student registered: {$latest?->full_name}", now()->subMinutes(10)],
            ['grade.updated', 'Grades updated for General Biology 2 - 12-STEM A', now()->subHour()],
            ['subject.created', 'New subject added: Work Immersion', now()->subHours(2)],
            ['enrollment.completed', 'Enrollment completed for 12-STEM B', now()->subDay()],
            ['quarter.locked', 'First Quarter closed for encoding', now()->subDays(30)],
        ];

        foreach ($entries as [$action, $description, $at]) {
            ActivityLog::create([
                'user_id' => $admin?->id,
                'action' => $action,
                'description' => $description,
            ])->forceFill(['created_at' => $at, 'updated_at' => $at])->save();
        }
    }
}
