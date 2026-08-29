<?php

namespace Tests\Concerns;

use App\Enums\SubjectType;
use App\Enums\Track;
use App\Models\Enrollment;
use App\Models\Quarter;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Strand;
use App\Models\Student;
use App\Models\Subject;
use App\Models\SubjectClass;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

/**
 * A minimal but complete academic year, so the write-path tests do not have to
 * run the full 128-learner seeder to get a valid fixture.
 */
trait BuildsSchool
{
    protected SchoolYear $schoolYear;

    protected Semester $semester;

    protected Quarter $openQuarter;

    protected Quarter $lockedQuarter;

    protected Strand $strand;

    protected Section $section;

    protected Teacher $teacher;

    protected Subject $subject;

    protected SubjectClass $class;

    protected User $admin;

    protected function buildSchool(): void
    {
        $this->admin = User::factory()->admin()->create(['email' => 'registrar@dcsa.test']);

        $this->schoolYear = SchoolYear::create([
            'name' => '2026-2027', 'start_date' => '2026-08-03', 'end_date' => '2027-05-28', 'is_active' => true,
        ]);

        $this->semester = Semester::create([
            'school_year_id' => $this->schoolYear->id, 'term' => 1, 'name' => 'First Semester',
            'start_date' => '2026-08-03', 'end_date' => '2026-12-18', 'is_active' => true,
        ]);

        Semester::create([
            'school_year_id' => $this->schoolYear->id, 'term' => 2, 'name' => 'Second Semester',
            'start_date' => '2027-01-05', 'end_date' => '2027-05-28', 'is_active' => false,
        ]);

        $this->lockedQuarter = Quarter::create([
            'semester_id' => $this->semester->id, 'number' => 1, 'name' => 'First Quarter', 'is_locked' => true,
        ]);

        $this->openQuarter = Quarter::create([
            'semester_id' => $this->semester->id, 'number' => 2, 'name' => 'Second Quarter', 'is_locked' => false,
        ]);

        $this->strand = Strand::create([
            'track' => Track::Academic, 'code' => 'STEM', 'name' => 'Science, Technology, Engineering and Mathematics',
        ]);

        $this->teacher = $this->makeTeacher('T-0001', 'Corazon', 'Villanueva');

        $this->section = Section::create([
            'strand_id' => $this->strand->id, 'school_year_id' => $this->schoolYear->id,
            'adviser_id' => $this->teacher->id, 'name' => '12-STEM A', 'grade_level' => 12,
            'room' => 'Room 301', 'capacity' => 3, 'is_active' => true,
        ]);

        $this->subject = Subject::create([
            'code' => 'MIL', 'title' => 'Media and Information Literacy',
            'type' => SubjectType::Core, 'semester_term' => 1, 'hours_per_week' => 4, 'is_active' => true,
        ]);

        $this->class = SubjectClass::create([
            'subject_id' => $this->subject->id, 'section_id' => $this->section->id,
            'semester_id' => $this->semester->id, 'teacher_id' => $this->teacher->id,
        ]);
    }

    protected function makeTeacher(string $employeeNo, string $first, string $last): Teacher
    {
        $user = User::factory()->teacher()->create([
            'name' => "{$first} {$last}",
            'email' => strtolower($first.'.'.$last).'@dcsa.test',
            'password' => Hash::make('password'),
        ]);

        return Teacher::create([
            'user_id' => $user->id, 'employee_no' => $employeeNo,
            'first_name' => $first, 'last_name' => $last, 'is_active' => true,
            'email' => $user->email,
        ]);
    }

    protected function enrolStudent(string $lrn, string $first, string $last, ?Section $section = null): Student
    {
        $student = Student::create([
            'lrn' => $lrn, 'first_name' => $first, 'last_name' => $last, 'status' => 'active',
        ]);

        Enrollment::create([
            'student_id' => $student->id,
            'section_id' => ($section ?? $this->section)->id,
            'semester_id' => $this->semester->id,
            'date_enrolled' => '2026-08-03',
            'status' => 'enrolled',
        ]);

        return $student;
    }

    /** @return array<string, mixed> */
    protected function studentPayload(array $overrides = []): array
    {
        return array_merge([
            'lrn' => '123456789101',
            'first_name' => 'Juan',
            'middle_name' => 'Bautista',
            'last_name' => 'Dela Cruz',
            'suffix' => '',
            'sex' => 'male',
            'birthdate' => '2008-05-14',
            'birthplace' => 'Marikina City',
            'address' => '10 Sample St.',
            'contact_number' => '09171234567',
            'guardian_name' => 'Maria Dela Cruz',
            'guardian_contact' => '09181234567',
            'guardian_relationship' => 'Mother',
            'status' => 'active',
            'section_id' => null,
        ], $overrides);
    }
}
