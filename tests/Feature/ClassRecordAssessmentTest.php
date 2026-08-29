<?php

namespace Tests\Feature;

use App\Enums\GradeComponent;
use App\Models\Assessment;
use App\Models\AssessmentScore;
use App\Models\Grade;
use App\Models\Section;
use App\Models\SubjectClass;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSchool;
use Tests\TestCase;

class ClassRecordAssessmentTest extends TestCase
{
    use BuildsSchool, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buildSchool();
        $this->enrolStudent('123456789101', 'Juan', 'Dela Cruz');
    }

    private function teacherUser()
    {
        return $this->teacher->user;
    }

    private function makeAssessment(int $quarterId, ?SubjectClass $class = null): Assessment
    {
        return Assessment::create([
            'subject_class_id' => ($class ?? $this->class)->id,
            'quarter_id' => $quarterId,
            'component' => GradeComponent::WrittenWork,
            'title' => 'Written Work 1',
            'highest_possible_score' => 20,
        ]);
    }

    public function test_a_teacher_can_add_an_assessment_column(): void
    {
        $this->actingAs($this->teacherUser())
            ->post("/class-record/{$this->class->id}/assessments", [
                'quarter_id' => $this->openQuarter->id,
                'component' => 'performance_task',
                'title' => 'Performance Task 1',
                'highest_possible_score' => 50,
                'date_given' => '2026-10-01',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('assessments', [
            'subject_class_id' => $this->class->id,
            'quarter_id' => $this->openQuarter->id,
            'component' => 'performance_task',
            'title' => 'Performance Task 1',
            'highest_possible_score' => 50,
        ]);
    }

    public function test_added_columns_are_numbered_in_order_within_their_component(): void
    {
        foreach (['Written Work 1', 'Written Work 2', 'Written Work 3'] as $title) {
            $this->actingAs($this->teacherUser())->post("/class-record/{$this->class->id}/assessments", [
                'quarter_id' => $this->openQuarter->id,
                'component' => 'written_work',
                'title' => $title,
                'highest_possible_score' => 20,
            ]);
        }

        $this->assertSame([0, 1, 2], Assessment::where('subject_class_id', $this->class->id)
            ->orderBy('id')->pluck('position')->all());
    }

    public function test_an_assessment_can_be_renamed_and_rescored(): void
    {
        $assessment = $this->makeAssessment($this->openQuarter->id);

        $this->actingAs($this->teacherUser())
            ->put("/class-record/{$this->class->id}/assessments/{$assessment->id}", [
                'title' => 'Long Quiz 1',
                'highest_possible_score' => 40,
                'date_given' => '2026-10-05',
            ])
            ->assertRedirect();

        $assessment->refresh();
        $this->assertSame('Long Quiz 1', $assessment->title);
        $this->assertSame(40, $assessment->highest_possible_score);
    }

    public function test_deleting_an_assessment_removes_its_scores_and_recomputes(): void
    {
        $student = $this->class->students()->firstOrFail();

        foreach ([GradeComponent::WrittenWork, GradeComponent::PerformanceTask, GradeComponent::QuarterlyAssessment] as $component) {
            $a = Assessment::create([
                'subject_class_id' => $this->class->id, 'quarter_id' => $this->openQuarter->id,
                'component' => $component, 'title' => $component->abbreviation(), 'highest_possible_score' => 20,
            ]);
            AssessmentScore::create(['assessment_id' => $a->id, 'student_id' => $student->id, 'score' => 20]);
        }

        $extra = Assessment::create([
            'subject_class_id' => $this->class->id, 'quarter_id' => $this->openQuarter->id,
            'component' => GradeComponent::WrittenWork, 'title' => 'WW2', 'highest_possible_score' => 20,
        ]);
        AssessmentScore::create(['assessment_id' => $extra->id, 'student_id' => $student->id, 'score' => 0]);

        $this->actingAs($this->teacherUser())
            ->delete("/class-record/{$this->class->id}/assessments/{$extra->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('assessments', ['id' => $extra->id]);
        $this->assertDatabaseMissing('assessment_scores', ['assessment_id' => $extra->id]);

        // With the zero removed the learner is now perfect across all three components.
        $grade = Grade::where('student_id', $student->id)->where('quarter_id', $this->openQuarter->id)->firstOrFail();
        $this->assertSame(100, $grade->final_grade);
    }

    public function test_an_assessment_must_have_a_title_and_a_positive_maximum(): void
    {
        $this->actingAs($this->teacherUser())
            ->post("/class-record/{$this->class->id}/assessments", [
                'quarter_id' => $this->openQuarter->id,
                'component' => 'written_work',
                'title' => '',
                'highest_possible_score' => 0,
            ])
            ->assertSessionHasErrors(['title', 'highest_possible_score']);
    }

    public function test_a_teacher_cannot_touch_an_assessment_belonging_to_another_class(): void
    {
        // A class this teacher does not handle, in a section they do not teach.
        $otherTeacher = $this->makeTeacher('T-0002', 'Ramon', 'Cruz');
        $otherSection = Section::create([
            'strand_id' => $this->strand->id, 'school_year_id' => $this->schoolYear->id,
            'name' => '12-STEM B', 'grade_level' => 12, 'capacity' => 30, 'is_active' => true,
        ]);
        $otherClass = SubjectClass::create([
            'subject_id' => $this->subject->id, 'section_id' => $otherSection->id,
            'semester_id' => $this->semester->id, 'teacher_id' => $otherTeacher->id,
        ]);
        $foreign = $this->makeAssessment($this->openQuarter->id, $otherClass);

        // Their own class in the URL, someone else's assessment in the path.
        $this->actingAs($this->teacherUser())
            ->delete("/class-record/{$this->class->id}/assessments/{$foreign->id}")
            ->assertNotFound();

        $this->actingAs($this->teacherUser())
            ->put("/class-record/{$this->class->id}/assessments/{$foreign->id}", [
                'title' => 'Hijacked', 'highest_possible_score' => 1,
            ])
            ->assertNotFound();

        $this->assertDatabaseHas('assessments', ['id' => $foreign->id, 'title' => 'Written Work 1']);
    }

    public function test_a_closed_quarter_cannot_be_edited_by_naming_an_open_one(): void
    {
        $locked = $this->makeAssessment($this->lockedQuarter->id);
        $student = $this->class->students()->firstOrFail();

        // quarter_id points at the open quarter, but the assessment is in the closed one.
        $this->actingAs($this->teacherUser())
            ->post("/class-record/{$this->class->id}/scores", [
                'quarter_id' => $this->openQuarter->id,
                'scores' => [
                    ['assessment_id' => $locked->id, 'student_id' => $student->id, 'score' => 20],
                ],
            ]);

        $this->assertDatabaseMissing('assessment_scores', [
            'assessment_id' => $locked->id,
            'student_id' => $student->id,
        ]);
    }

    public function test_a_score_cannot_be_written_for_a_learner_outside_the_class(): void
    {
        $outsider = $this->enrolStudent('123456789999', 'Outside', 'Learner', Section::create([
            'strand_id' => $this->strand->id, 'school_year_id' => $this->schoolYear->id,
            'name' => '12-HUMSS A', 'grade_level' => 12, 'capacity' => 30, 'is_active' => true,
        ]));

        $assessment = $this->makeAssessment($this->openQuarter->id);

        $this->actingAs($this->teacherUser())
            ->post("/class-record/{$this->class->id}/scores", [
                'quarter_id' => $this->openQuarter->id,
                'scores' => [
                    ['assessment_id' => $assessment->id, 'student_id' => $outsider->id, 'score' => 20],
                ],
            ]);

        $this->assertDatabaseMissing('assessment_scores', [
            'assessment_id' => $assessment->id,
            'student_id' => $outsider->id,
        ]);
    }

    public function test_a_learner_cannot_reach_the_class_record_write_routes(): void
    {
        $student = $this->class->students()->firstOrFail();
        $student->update(['user_id' => User::factory()->student()->create()->id]);

        $this->actingAs($student->fresh()->user)
            ->post("/class-record/{$this->class->id}/assessments", [
                'quarter_id' => $this->openQuarter->id,
                'component' => 'written_work',
                'title' => 'Nope',
                'highest_possible_score' => 10,
            ])
            ->assertForbidden();
    }
}
