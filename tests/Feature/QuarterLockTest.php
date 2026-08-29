<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\AssessmentScore;
use App\Models\Quarter;
use App\Models\Semester;
use App\Models\SubjectClass;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Grade finalisation in this portal is a quarter-level lock: teachers edit
 * freely while a quarter is open, and the administrator closes it to freeze
 * every class record at once.
 */
class QuarterLockTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $teacher;

    private SubjectClass $class;

    private Quarter $openQuarter;

    private Quarter $lockedQuarter;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->admin = User::where('role', 'admin')->firstOrFail();

        $semester = Semester::active();
        $this->openQuarter = $semester->quarters()->where('is_locked', false)->firstOrFail();
        $this->lockedQuarter = $semester->quarters()->where('is_locked', true)->firstOrFail();

        $this->class = SubjectClass::where('semester_id', $semester->id)->whereNotNull('teacher_id')->firstOrFail();
        $this->teacher = $this->class->teacher->user;
    }

    private function anAssessmentIn(Quarter $quarter): Assessment
    {
        return Assessment::where('subject_class_id', $this->class->id)
            ->where('quarter_id', $quarter->id)
            ->firstOrFail();
    }

    public function test_a_teacher_can_save_scores_while_the_quarter_is_open(): void
    {
        $assessment = $this->anAssessmentIn($this->openQuarter);
        $student = $this->class->students()->firstOrFail();

        $this->actingAs($this->teacher)
            ->post("/class-record/{$this->class->id}/scores", [
                'quarter_id' => $this->openQuarter->id,
                'scores' => [
                    ['assessment_id' => $assessment->id, 'student_id' => $student->id, 'score' => 12],
                ],
            ])
            ->assertRedirect();

        $this->assertSame(
            '12.00',
            AssessmentScore::where('assessment_id', $assessment->id)->where('student_id', $student->id)->value('score'),
        );
    }

    public function test_saving_scores_into_a_closed_quarter_is_refused(): void
    {
        $assessment = $this->anAssessmentIn($this->lockedQuarter);
        $student = $this->class->students()->firstOrFail();
        $before = AssessmentScore::where('assessment_id', $assessment->id)->where('student_id', $student->id)->value('score');

        $this->actingAs($this->teacher)
            ->post("/class-record/{$this->class->id}/scores", [
                'quarter_id' => $this->lockedQuarter->id,
                'scores' => [
                    ['assessment_id' => $assessment->id, 'student_id' => $student->id, 'score' => 1],
                ],
            ])
            ->assertForbidden();

        $this->assertSame(
            $before,
            AssessmentScore::where('assessment_id', $assessment->id)->where('student_id', $student->id)->value('score'),
        );
    }

    public function test_adding_or_deleting_an_assessment_in_a_closed_quarter_is_refused(): void
    {
        $assessment = $this->anAssessmentIn($this->lockedQuarter);

        $this->actingAs($this->teacher)
            ->post("/class-record/{$this->class->id}/assessments", [
                'quarter_id' => $this->lockedQuarter->id,
                'component' => 'written_work',
                'title' => 'Sneaky extra quiz',
                'highest_possible_score' => 10,
            ])
            ->assertForbidden();

        $this->actingAs($this->teacher)
            ->delete("/class-record/{$this->class->id}/assessments/{$assessment->id}")
            ->assertForbidden();

        $this->assertModelExists($assessment);
    }

    public function test_the_administrator_can_close_and_reopen_a_quarter(): void
    {
        $this->actingAs($this->admin)
            ->post("/admin/settings/quarters/{$this->openQuarter->id}/toggle-lock")
            ->assertRedirect();

        $this->openQuarter->refresh();
        $this->assertTrue($this->openQuarter->is_locked);
        $this->assertSame($this->admin->id, $this->openQuarter->locked_by);
        $this->assertNotNull($this->openQuarter->locked_at);

        $this->actingAs($this->admin)
            ->post("/admin/settings/quarters/{$this->openQuarter->id}/toggle-lock")
            ->assertRedirect();

        $this->openQuarter->refresh();
        $this->assertFalse($this->openQuarter->is_locked);
        $this->assertNull($this->openQuarter->locked_by);
    }

    public function test_a_teacher_cannot_unlock_a_quarter(): void
    {
        $this->actingAs($this->teacher)
            ->post("/admin/settings/quarters/{$this->lockedQuarter->id}/toggle-lock")
            ->assertForbidden();

        $this->assertTrue($this->lockedQuarter->refresh()->is_locked);
    }

    public function test_a_score_above_the_highest_possible_score_is_capped(): void
    {
        $assessment = $this->anAssessmentIn($this->openQuarter);
        $student = $this->class->students()->firstOrFail();

        $this->actingAs($this->teacher)
            ->post("/class-record/{$this->class->id}/scores", [
                'quarter_id' => $this->openQuarter->id,
                'scores' => [
                    ['assessment_id' => $assessment->id, 'student_id' => $student->id, 'score' => 9999],
                ],
            ]);

        $this->assertSame(
            (float) $assessment->highest_possible_score,
            (float) AssessmentScore::where('assessment_id', $assessment->id)->where('student_id', $student->id)->value('score'),
        );
    }

    public function test_clearing_a_cell_removes_the_score_rather_than_storing_a_zero(): void
    {
        $assessment = $this->anAssessmentIn($this->openQuarter);
        $student = $this->class->students()->firstOrFail();

        $this->actingAs($this->teacher)
            ->post("/class-record/{$this->class->id}/scores", [
                'quarter_id' => $this->openQuarter->id,
                'scores' => [
                    ['assessment_id' => $assessment->id, 'student_id' => $student->id, 'score' => null],
                ],
            ]);

        $this->assertNull(
            AssessmentScore::where('assessment_id', $assessment->id)->where('student_id', $student->id)->value('score'),
        );
    }
}
