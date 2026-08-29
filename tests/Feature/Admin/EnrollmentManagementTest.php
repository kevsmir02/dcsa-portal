<?php

namespace Tests\Feature\Admin;

use App\Models\Enrollment;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSchool;
use Tests\TestCase;

class EnrollmentManagementTest extends TestCase
{
    use BuildsSchool, RefreshDatabase;

    private Student $newcomer;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buildSchool();

        $this->newcomer = Student::create([
            'lrn' => '123456789150', 'first_name' => 'Andrea', 'last_name' => 'Gonzales', 'status' => 'active',
        ]);
    }

    public function test_an_administrator_can_enrol_a_learner_into_a_section(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/enrollment', ['student_id' => $this->newcomer->id, 'section_id' => $this->section->id])
            ->assertRedirect();

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $this->newcomer->id,
            'section_id' => $this->section->id,
            'semester_id' => $this->semester->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_a_section_at_capacity_refuses_further_enrolment(): void
    {
        // The fixture section holds three.
        $this->enrolStudent('123456789101', 'A', 'One');
        $this->enrolStudent('123456789102', 'B', 'Two');
        $this->enrolStudent('123456789103', 'C', 'Three');

        $this->actingAs($this->admin)
            ->post('/admin/enrollment', ['student_id' => $this->newcomer->id, 'section_id' => $this->section->id])
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('enrollments', ['student_id' => $this->newcomer->id]);
    }

    public function test_a_learner_holds_only_one_enrolment_per_semester(): void
    {
        $other = Section::create([
            'strand_id' => $this->strand->id, 'school_year_id' => $this->schoolYear->id,
            'name' => '12-STEM C', 'grade_level' => 12, 'capacity' => 30, 'is_active' => true,
        ]);

        $this->actingAs($this->admin)->post('/admin/enrollment', [
            'student_id' => $this->newcomer->id, 'section_id' => $this->section->id,
        ]);
        $this->actingAs($this->admin)->post('/admin/enrollment', [
            'student_id' => $this->newcomer->id, 'section_id' => $other->id,
        ]);

        $rows = Enrollment::where('student_id', $this->newcomer->id)->where('semester_id', $this->semester->id)->get();
        $this->assertCount(1, $rows, 'Re-enrolling should move the learner, not give them two sections.');
        $this->assertSame($other->id, $rows->first()->section_id);
    }

    public function test_an_enrolment_can_be_transferred_or_dropped(): void
    {
        $student = $this->enrolStudent('123456789104', 'Paolo', 'Castro');
        $enrolment = Enrollment::where('student_id', $student->id)->firstOrFail();

        $this->actingAs($this->admin)
            ->patch("/admin/enrollment/{$enrolment->id}", [
                'section_id' => $this->section->id,
                'status' => 'dropped',
                'remarks' => 'Moved to another school.',
            ])
            ->assertRedirect();

        $enrolment->refresh();
        $this->assertSame('dropped', $enrolment->status);
        $this->assertSame('Moved to another school.', $enrolment->remarks);
    }

    public function test_a_dropped_learner_falls_out_of_the_class_list(): void
    {
        $student = $this->enrolStudent('123456789105', 'Nicole', 'Perez');
        $this->assertCount(1, $this->class->students());

        $enrolment = Enrollment::where('student_id', $student->id)->firstOrFail();
        $this->actingAs($this->admin)->patch("/admin/enrollment/{$enrolment->id}", [
            'section_id' => $this->section->id, 'status' => 'dropped',
        ]);

        $this->assertCount(0, $this->class->fresh()->students());
    }

    public function test_an_enrolment_can_be_removed_outright(): void
    {
        $student = $this->enrolStudent('123456789106', 'Erika', 'Bacani');
        $enrolment = Enrollment::where('student_id', $student->id)->firstOrFail();

        $this->actingAs($this->admin)->delete("/admin/enrollment/{$enrolment->id}")->assertRedirect();

        $this->assertDatabaseMissing('enrollments', ['id' => $enrolment->id]);
        $this->assertDatabaseHas('students', ['id' => $student->id]);
    }

    public function test_a_teacher_cannot_enrol_learners(): void
    {
        $this->actingAs($this->teacher->user)
            ->post('/admin/enrollment', ['student_id' => $this->newcomer->id, 'section_id' => $this->section->id])
            ->assertForbidden();
    }
}
