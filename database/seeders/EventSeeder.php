<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();

        $events = [
            ['Second Quarter Examinations', 'Quarterly assessment for all Grade 12 sections.', now()->addDays(9)->setTime(8, 0), now()->addDays(11)->setTime(17, 0), 'All Grade 12 Sections', 'all'],
            ['PTA General Assembly', 'Parent-Teacher Association meeting and card distribution.', now()->addDays(16)->setTime(9, 0), now()->addDays(16)->setTime(12, 0), 'Audio Visual Room', 'all'],
            ['Submission of Second Quarter Grades', 'Deadline for encoding and submission of class records.', now()->addDays(23)->setTime(17, 0), null, 'Registrar\'s Office', 'teachers'],
            ['Work Immersion Orientation', 'Briefing on partner establishments and requirements.', now()->addDays(30)->setTime(13, 0), now()->addDays(30)->setTime(16, 0), 'DCSA Gymnasium', 'students'],
            ['Faculty In-Service Training', 'Session on the DepEd classroom assessment guidelines.', now()->addDays(38)->setTime(8, 0), now()->addDays(39)->setTime(17, 0), 'Function Hall', 'teachers'],
        ];

        foreach ($events as [$title, $description, $start, $end, $location, $audience]) {
            Event::create([
                'title' => $title,
                'description' => $description,
                'starts_at' => $start,
                'ends_at' => $end,
                'location' => $location,
                'audience' => $audience,
                'created_by' => $admin?->id,
            ]);
        }
    }
}
