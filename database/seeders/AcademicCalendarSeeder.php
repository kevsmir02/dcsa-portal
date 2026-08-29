<?php

namespace Database\Seeders;

use App\Models\Quarter;
use App\Models\SchoolYear;
use App\Models\Semester;
use App\Models\Setting;
use Illuminate\Database\Seeder;

class AcademicCalendarSeeder extends Seeder
{
    public function run(): void
    {
        $schoolYear = SchoolYear::create([
            'name' => '2026-2027',
            'start_date' => '2026-08-03',
            'end_date' => '2027-05-28',
            'is_active' => true,
        ]);

        // Senior High runs on semesters; each semester holds two quarters,
        // numbered 1-4 across the school year.
        $semesters = [
            ['term' => 1, 'name' => 'First Semester', 'start' => '2026-08-03', 'end' => '2026-12-18', 'quarters' => [1, 2], 'active' => true],
            ['term' => 2, 'name' => 'Second Semester', 'start' => '2027-01-05', 'end' => '2027-05-28', 'quarters' => [3, 4], 'active' => false],
        ];

        $quarterNames = [1 => 'First Quarter', 2 => 'Second Quarter', 3 => 'Third Quarter', 4 => 'Fourth Quarter'];

        foreach ($semesters as $data) {
            $semester = Semester::create([
                'school_year_id' => $schoolYear->id,
                'term' => $data['term'],
                'name' => $data['name'],
                'start_date' => $data['start'],
                'end_date' => $data['end'],
                'is_active' => $data['active'],
            ]);

            foreach ($data['quarters'] as $number) {
                Quarter::create([
                    'semester_id' => $semester->id,
                    'number' => $number,
                    'name' => $quarterNames[$number],
                    // The first quarter is already closed; the second is still being encoded.
                    'is_locked' => $number === 1,
                    'locked_at' => $number === 1 ? now()->subDays(30) : null,
                ]);
            }
        }

        Setting::put('school', [
            'name' => 'Datamex College of Saint Adeline',
            'short_name' => 'DCSA',
            'system_name' => 'Grade 12 Grading Management System',
            'address' => 'Bayan-bayanan Ave., Concepcion Uno, Marikina City',
            'contact_number' => '(02) 8942-1234',
            'email' => 'registrar@dcsa.edu.ph',
            'school_id' => '405231',
            'established' => 2010,
        ]);

        Setting::put('grading', [
            'passing_grade' => 75,
            'transmutation' => 'deped_order_8_s2015',
        ]);
    }
}
