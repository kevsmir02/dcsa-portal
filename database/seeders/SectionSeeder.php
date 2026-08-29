<?php

namespace Database\Seeders;

use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Strand;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

class SectionSeeder extends Seeder
{
    public function run(): void
    {
        $schoolYear = SchoolYear::active();
        $strands = Strand::pluck('id', 'code');
        $advisers = Teacher::orderBy('id')->pluck('id')->all();

        $sections = [
            ['12-STEM A', 'STEM', 'Room 301', 24],
            ['12-STEM B', 'STEM', 'Room 302', 24],
            ['12-HUMSS A', 'HUMSS', 'Room 303', 22],
            ['12-HUMSS B', 'HUMSS', 'Room 304', 22],
            ['12-ABM A', 'ABM', 'Room 305', 20],
            ['12-GAS A', 'GAS', 'Room 306', 20],
        ];

        foreach ($sections as $index => [$name, $strandCode, $room, $capacity]) {
            Section::create([
                'strand_id' => $strands[$strandCode],
                'school_year_id' => $schoolYear->id,
                'adviser_id' => $advisers[$index] ?? null,
                'name' => $name,
                'grade_level' => 12,
                'room' => $room,
                'capacity' => $capacity,
                'is_active' => true,
            ]);
        }
    }
}
