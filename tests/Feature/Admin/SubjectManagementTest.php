<?php

namespace Tests\Feature\Admin;

use App\Models\Subject;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSchool;
use Tests\TestCase;

class SubjectManagementTest extends TestCase
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
            'code' => 'STATPROB',
            'title' => 'Statistics and Probability',
            'type' => 'core',
            'strand_id' => null,
            'semester_term' => 1,
            'hours_per_week' => 4,
            'description' => '',
            'ww_weight' => null,
            'pt_weight' => null,
            'qa_weight' => null,
            'is_active' => true,
        ], $overrides);
    }

    public function test_an_administrator_can_add_a_subject(): void
    {
        $this->actingAs($this->admin)->post('/admin/subjects', $this->payload())->assertRedirect();

        $this->assertDatabaseHas('subjects', ['code' => 'STATPROB', 'type' => 'core', 'semester_term' => 1]);
    }

    public function test_a_subject_left_on_the_default_weights_stores_no_override(): void
    {
        $this->actingAs($this->admin)->post('/admin/subjects', $this->payload());

        $subject = Subject::where('code', 'STATPROB')->firstOrFail();
        $this->assertNull($subject->ww_weight);
        $this->assertNull($subject->pt_weight);
        $this->assertNull($subject->qa_weight);
    }

    public function test_a_custom_weighting_is_accepted_when_the_three_components_total_100(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/subjects', $this->payload(['ww_weight' => 30, 'pt_weight' => 40, 'qa_weight' => 30]))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $subject = Subject::where('code', 'STATPROB')->firstOrFail();
        $this->assertSame([30, 40, 30], [$subject->ww_weight, $subject->pt_weight, $subject->qa_weight]);
    }

    public function test_a_custom_weighting_that_does_not_total_100_is_rejected(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/subjects', $this->payload(['ww_weight' => 30, 'pt_weight' => 40, 'qa_weight' => 40]))
            ->assertSessionHasErrors('ww_weight');

        $this->assertDatabaseMissing('subjects', ['code' => 'STATPROB']);
    }

    public function test_a_partial_custom_weighting_is_rejected(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/subjects', $this->payload(['ww_weight' => 30]))
            ->assertSessionHasErrors('ww_weight');

        $this->assertDatabaseMissing('subjects', ['code' => 'STATPROB']);
    }

    public function test_the_subject_code_must_be_unique(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/subjects', $this->payload(['code' => 'MIL']))
            ->assertSessionHasErrors('code');
    }

    public function test_a_subject_can_be_edited_and_removed(): void
    {
        $this->actingAs($this->admin)
            ->put("/admin/subjects/{$this->subject->id}", $this->payload([
                'code' => 'MIL', 'title' => 'Media and Information Literacy (Revised)',
            ]))
            ->assertRedirect();

        $this->assertSame('Media and Information Literacy (Revised)', $this->subject->fresh()->title);

        $this->actingAs($this->admin)->delete("/admin/subjects/{$this->subject->id}")->assertRedirect();
        $this->assertDatabaseMissing('subjects', ['id' => $this->subject->id]);
    }

    public function test_removing_a_subject_takes_its_classes_with_it(): void
    {
        $classId = $this->class->id;

        $this->actingAs($this->admin)->delete("/admin/subjects/{$this->subject->id}");

        $this->assertDatabaseMissing('subject_classes', ['id' => $classId]);
    }

    public function test_a_teacher_cannot_change_the_subject_offering(): void
    {
        $this->actingAs($this->teacher->user)->post('/admin/subjects', $this->payload())->assertForbidden();
    }
}
