<?php

namespace Tests\Feature\Admin;

use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSchool;
use Tests\TestCase;

class SectionManagementTest extends TestCase
{
    use BuildsSchool, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buildSchool();
    }

    /** @return array<string, mixed> */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => '12-STEM B',
            'strand_id' => $this->strand->id,
            'adviser_id' => null,
            'grade_level' => 12,
            'room' => 'Room 302',
            'capacity' => 40,
            'is_active' => true,
        ], $overrides);
    }

    public function test_an_administrator_can_create_a_section_in_the_active_school_year(): void
    {
        $this->actingAs($this->admin)->post('/admin/sections', $this->payload())->assertRedirect();

        $this->assertDatabaseHas('sections', [
            'name' => '12-STEM B',
            'school_year_id' => $this->schoolYear->id,
            'capacity' => 40,
        ]);
    }

    public function test_a_section_name_must_be_unique_within_the_school_year(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/sections', $this->payload(['name' => '12-STEM A']))
            ->assertSessionHasErrors('name');

        $this->assertSame(1, Section::count());
    }

    public function test_an_adviser_can_be_assigned_and_cleared(): void
    {
        $this->actingAs($this->admin)->post('/admin/sections', $this->payload(['adviser_id' => $this->teacher->id]));
        $section = Section::where('name', '12-STEM B')->firstOrFail();
        $this->assertSame($this->teacher->id, $section->adviser_id);

        $this->actingAs($this->admin)
            ->put("/admin/sections/{$section->id}", $this->payload(['adviser_id' => null]))
            ->assertRedirect();

        $this->assertNull($section->fresh()->adviser_id);
    }

    public function test_capacity_must_be_a_sensible_number(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/sections', $this->payload(['capacity' => 0]))
            ->assertSessionHasErrors('capacity');
    }

    public function test_removing_a_section_takes_its_enrolments_and_classes_with_it(): void
    {
        $student = $this->enrolStudent('123456789101', 'Juan', 'Dela Cruz');
        $classId = $this->class->id;

        $this->actingAs($this->admin)->delete("/admin/sections/{$this->section->id}")->assertRedirect();

        $this->assertDatabaseMissing('sections', ['id' => $this->section->id]);
        $this->assertDatabaseMissing('enrollments', ['student_id' => $student->id]);
        $this->assertDatabaseMissing('subject_classes', ['id' => $classId]);
        // The learner record itself survives; only their placement is gone.
        $this->assertDatabaseHas('students', ['id' => $student->id]);
    }

    public function test_a_learner_cannot_create_sections(): void
    {
        $this->actingAs(User::factory()->student()->create())
            ->post('/admin/sections', $this->payload())
            ->assertForbidden();
    }
}
