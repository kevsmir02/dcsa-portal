<?php

namespace Database\Seeders;

use App\Enums\SubjectType;
use App\Models\Strand;
use App\Models\Subject;
use Illuminate\Database\Seeder;

/**
 * The Grade 12 subject offering: 8 core, 6 applied and 10 specialized subjects
 * drawn from the DepEd Senior High School curriculum.
 */
class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $strands = Strand::pluck('id', 'code');

        $subjects = [
            // Core subjects -- taken by every strand.
            ['MIL', 'Media and Information Literacy', SubjectType::Core, null, 1],
            ['PHILO', 'Introduction to the Philosophy of the Human Person', SubjectType::Core, null, 1],
            ['UCSP', 'Understanding Culture, Society and Politics', SubjectType::Core, null, 1],
            ['STATPROB', 'Statistics and Probability', SubjectType::Core, null, 1],
            ['PEH3', 'Physical Education and Health 3', SubjectType::Core, null, 1],
            ['CPAR', 'Contemporary Philippine Arts from the Regions', SubjectType::Core, null, 2],
            ['PERDEV', 'Personal Development', SubjectType::Core, null, 2],
            ['PEH4', 'Physical Education and Health 4', SubjectType::Core, null, 2],

            // Applied subjects -- contextualised to the track.
            ['PR2', 'Practical Research 2', SubjectType::Applied, null, 1],
            ['ETECH', 'Empowerment Technologies', SubjectType::Applied, null, 1],
            ['EAPP', 'English for Academic and Professional Purposes', SubjectType::Applied, null, 1],
            ['FPL', 'Filipino sa Piling Larangan', SubjectType::Applied, null, 2],
            ['ENTREP', 'Entrepreneurship', SubjectType::Applied, null, 2],
            ['IMMERSION', 'Work Immersion', SubjectType::Applied, null, 2],

            // Specialized subjects -- tied to one strand.
            ['BIO2', 'General Biology 2', SubjectType::Specialized, 'STEM', 1],
            ['CHEM2', 'General Chemistry 2', SubjectType::Specialized, 'STEM', 1],
            ['PHYS2', 'General Physics 2', SubjectType::Specialized, 'STEM', 2],
            ['CALC', 'Basic Calculus', SubjectType::Specialized, 'STEM', 2],
            ['DIASS', 'Disciplines and Ideas in the Applied Social Sciences', SubjectType::Specialized, 'HUMSS', 1],
            ['TNCT', 'Trends, Networks and Critical Thinking in the 21st Century', SubjectType::Specialized, 'HUMSS', 2],
            ['BUSFIN', 'Business Finance', SubjectType::Specialized, 'ABM', 1],
            ['APPECON', 'Applied Economics', SubjectType::Specialized, 'ABM', 2],
            ['DRRR', 'Disaster Readiness and Risk Reduction', SubjectType::Specialized, 'GAS', 1],
            ['HUMSS2', 'Humanities 2', SubjectType::Specialized, 'GAS', 2],
        ];

        foreach ($subjects as [$code, $title, $type, $strandCode, $term]) {
            Subject::create([
                'code' => $code,
                'title' => $title,
                'type' => $type,
                'strand_id' => $strandCode ? $strands[$strandCode] : null,
                'semester_term' => $term,
                'hours_per_week' => $type === SubjectType::Core ? 4 : 4,
                'is_active' => true,
            ]);
        }
    }
}
