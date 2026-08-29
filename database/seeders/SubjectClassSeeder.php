<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\SubjectClass;
use App\Models\Teacher;
use Illuminate\Database\Seeder;

/**
 * Opens a class for every subject a section takes in a semester.
 *
 * A section takes a subject when the subject is offered that semester and is
 * either common to all strands (core and applied) or tied to that section's strand.
 */
class SubjectClassSeeder extends Seeder
{
    public function run(): void
    {
        $sections = Section::with('strand')->orderBy('id')->get();
        $semesters = Semester::orderBy('term')->get();
        $subjects = Subject::where('is_active', true)->get();
        $teachers = Teacher::orderBy('id')->get();

        $schedules = ['MWF 07:30-08:30', 'MWF 08:30-09:30', 'TTh 09:45-11:15', 'MWF 10:00-11:00',
            'TTh 13:00-14:30', 'MWF 13:00-14:00', 'MWF 14:00-15:00', 'TTh 15:15-16:45'];

        $rows = [];
        $now = now();
        $teacherCursor = 0;
        $scheduleCursor = 0;

        foreach ($semesters as $semester) {
            foreach ($sections as $section) {
                $offered = $subjects->filter(fn (Subject $subject) => $subject->semester_term === $semester->term
                    && ($subject->strand_id === null || $subject->strand_id === $section->strand_id));

                foreach ($offered as $subject) {
                    $rows[] = [
                        'subject_id' => $subject->id,
                        'section_id' => $section->id,
                        'semester_id' => $semester->id,
                        'teacher_id' => $teachers[$teacherCursor++ % $teachers->count()]->id,
                        'schedule' => $schedules[$scheduleCursor++ % count($schedules)],
                        'room' => $section->room,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        foreach (array_chunk($rows, 200) as $chunk) {
            SubjectClass::insert($chunk);
        }
    }
}
