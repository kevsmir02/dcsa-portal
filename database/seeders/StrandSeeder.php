<?php

namespace Database\Seeders;

use App\Enums\Track;
use App\Models\Strand;
use Illuminate\Database\Seeder;

class StrandSeeder extends Seeder
{
    public function run(): void
    {
        $strands = [
            ['track' => Track::Academic, 'code' => 'STEM', 'name' => 'Science, Technology, Engineering and Mathematics', 'description' => 'Prepares learners for degree programs in the sciences, engineering and mathematics.'],
            ['track' => Track::Academic, 'code' => 'HUMSS', 'name' => 'Humanities and Social Sciences', 'description' => 'Prepares learners for degree programs in the humanities, education, law and social sciences.'],
            ['track' => Track::Academic, 'code' => 'ABM', 'name' => 'Accountancy, Business and Management', 'description' => 'Prepares learners for degree programs in business, accountancy and management.'],
            ['track' => Track::Academic, 'code' => 'GAS', 'name' => 'General Academic Strand', 'description' => 'A broad academic preparation for learners still deciding on a specialization.'],
        ];

        foreach ($strands as $strand) {
            Strand::create($strand + ['is_active' => true]);
        }
    }
}
