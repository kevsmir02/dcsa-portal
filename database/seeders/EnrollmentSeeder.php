<?php

namespace Database\Seeders;

use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $sections = Section::orderBy('id')->get();
        $semesters = Semester::orderBy('term')->get();
        $students = Student::orderBy('id')->get();

        $rows = [];
        $now = now();
        $cursor = 0;
        $sequence = 0;

        foreach ($sections as $section) {
            $slice = $students->slice($cursor, $section->capacity);
            $cursor += $section->capacity;

            foreach ($slice as $student) {
                foreach ($semesters as $semester) {
                    // Spread enrolment across the ten weeks leading up to the
                    // semester so the dashboard's enrolment trend is not a flat line.
                    $daysBefore = 70 - (int) floor(($sequence++ % 128) / 128 * 70);

                    $rows[] = [
                        'student_id' => $student->id,
                        'section_id' => $section->id,
                        'semester_id' => $semester->id,
                        'date_enrolled' => $semester->start_date->copy()->subDays($daysBefore)->toDateString(),
                        'status' => 'enrolled',
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            Enrollment::insert($chunk);
        }
    }
}
