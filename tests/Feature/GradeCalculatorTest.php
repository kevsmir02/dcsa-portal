<?php

namespace Tests\Feature;

use App\Enums\GradeComponent;
use App\Enums\SubjectType;
use App\Enums\Track;
use App\Models\Assessment;
use App\Models\AssessmentScore;
use App\Models\Enrollment;
use App\Models\Quarter;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Strand;
use App\Models\Student;
use App\Models\Subject;
use App\Models\SubjectClass;
use App\Services\GradeCalculator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GradeCalculatorTest extends TestCase
{
    use RefreshDatabase;

    private Student $student;

    private SubjectClass $subjectClass;

    private Quarter $quarter;

    protected function setUp(): void
    {
        parent::setUp();

        $schoolYear = SchoolYear::create([
            'name' => '2026-2027', 'start_date' => '2026-08-03', 'end_date' => '2027-05-28', 'is_active' => true,
        ]);

        $semester = Semester::create([
            'school_year_id' => $schoolYear->id, 'term' => 1, 'name' => 'First Semester',
            'start_date' => '2026-08-03', 'end_date' => '2026-12-18', 'is_active' => true,
        ]);

        $this->quarter = Quarter::create([
            'semester_id' => $semester->id, 'number' => 1, 'name' => 'First Quarter',
        ]);

        $strand = Strand::create([
            'track' => Track::Academic, 'code' => 'STEM', 'name' => 'Science, Technology, Engineering and Mathematics',
        ]);

        $section = Section::create([
            'strand_id' => $strand->id, 'school_year_id' => $schoolYear->id,
            'name' => '12-STEM A', 'grade_level' => 12, 'capacity' => 40,
        ]);

        // A core subject, so the weights are 25 / 50 / 25.
        $subject = Subject::create([
            'code' => 'MIL', 'title' => 'Media and Information Literacy',
            'type' => SubjectType::Core, 'semester_term' => 1, 'hours_per_week' => 4,
        ]);

        $this->subjectClass = SubjectClass::create([
            'subject_id' => $subject->id, 'section_id' => $section->id, 'semester_id' => $semester->id,
        ]);

        $this->student = Student::create([
            'lrn' => '123456789101', 'first_name' => 'Juan', 'last_name' => 'Dela Cruz', 'status' => 'active',
        ]);

        Enrollment::create([
            'student_id' => $this->student->id, 'section_id' => $section->id, 'semester_id' => $semester->id,
            'date_enrolled' => '2026-08-03', 'status' => 'enrolled',
        ]);
    }

    private function assess(GradeComponent $component, int $highestPossible, ?float $score): Assessment
    {
        $assessment = Assessment::create([
            'subject_class_id' => $this->subjectClass->id,
            'quarter_id' => $this->quarter->id,
            'component' => $component,
            'title' => $component->abbreviation().' item',
            'highest_possible_score' => $highestPossible,
        ]);

        if ($score !== null) {
            AssessmentScore::create([
                'assessment_id' => $assessment->id, 'student_id' => $this->student->id, 'score' => $score,
            ]);
        }

        return $assessment;
    }

    public function test_it_computes_the_deped_figures_end_to_end(): void
    {
        // Written Work: 45 of 50  -> PS 90.00 -> WS 22.50 (weight 25)
        $this->assess(GradeComponent::WrittenWork, 30, 27);
        $this->assess(GradeComponent::WrittenWork, 20, 18);

        // Performance Task: 68 of 80 -> PS 85.00 -> WS 42.50 (weight 50)
        $this->assess(GradeComponent::PerformanceTask, 50, 43);
        $this->assess(GradeComponent::PerformanceTask, 30, 25);

        // Quarterly Assessment: 40 of 50 -> PS 80.00 -> WS 20.00 (weight 25)
        $this->assess(GradeComponent::QuarterlyAssessment, 50, 40);

        $grade = (new GradeCalculator)->computeStudent($this->student, $this->subjectClass, $this->quarter);

        $this->assertSame(45.0, $grade->ww_score);
        $this->assertSame(50.0, $grade->ww_total);
        $this->assertSame(90.0, $grade->ww_ps);
        $this->assertSame(22.5, $grade->ww_ws);

        $this->assertSame(85.0, $grade->pt_ps);
        $this->assertSame(42.5, $grade->pt_ws);

        $this->assertSame(80.0, $grade->qa_ps);
        $this->assertSame(20.0, $grade->qa_ws);

        // Initial grade 22.50 + 42.50 + 20.00 = 85.00, which sits in the
        // 84.00-85.59 band and so transmutes to 90.
        $this->assertSame(85.0, $grade->initial_grade);
        $this->assertSame(90, $grade->final_grade);
        $this->assertSame('passed', $grade->remarks);
    }

    public function test_a_quarter_missing_a_whole_component_earns_no_final_grade(): void
    {
        $this->assess(GradeComponent::WrittenWork, 30, 27);
        $this->assess(GradeComponent::PerformanceTask, 50, 43);
        // No quarterly assessment encoded yet.

        $grade = (new GradeCalculator)->computeStudent($this->student, $this->subjectClass, $this->quarter);

        $this->assertNull($grade->final_grade, 'An unfinished quarter must not read as a failing grade.');
        $this->assertNull($grade->remarks);
        // The partial figures are still stored so the teacher can see progress.
        $this->assertSame(90.0, $grade->ww_ps);
    }

    public function test_an_unencoded_score_is_not_counted_as_a_zero(): void
    {
        $this->assess(GradeComponent::WrittenWork, 50, 45);
        $this->assess(GradeComponent::WrittenWork, 50, null);   // not yet encoded
        $this->assess(GradeComponent::PerformanceTask, 50, 45);
        $this->assess(GradeComponent::QuarterlyAssessment, 50, 45);

        $grade = (new GradeCalculator)->computeStudent($this->student, $this->subjectClass, $this->quarter);

        // Only the encoded item counts: 45 of 50, not 45 of 100.
        $this->assertSame(50.0, $grade->ww_total);
        $this->assertSame(90.0, $grade->ww_ps);
    }

    public function test_a_learner_who_scores_nothing_fails_rather_than_erroring(): void
    {
        $this->assess(GradeComponent::WrittenWork, 50, 0);
        $this->assess(GradeComponent::PerformanceTask, 50, 0);
        $this->assess(GradeComponent::QuarterlyAssessment, 50, 0);

        $grade = (new GradeCalculator)->computeStudent($this->student, $this->subjectClass, $this->quarter);

        $this->assertSame(0.0, $grade->initial_grade);
        $this->assertSame(60, $grade->final_grade);
        $this->assertSame('failed', $grade->remarks);
    }

    public function test_recomputing_updates_the_existing_grade_rather_than_duplicating_it(): void
    {
        $writtenWork = $this->assess(GradeComponent::WrittenWork, 50, 25);
        $this->assess(GradeComponent::PerformanceTask, 50, 45);
        $this->assess(GradeComponent::QuarterlyAssessment, 50, 45);

        $calculator = new GradeCalculator;
        $first = $calculator->computeStudent($this->student, $this->subjectClass, $this->quarter);

        $writtenWork->scores()->where('student_id', $this->student->id)->update(['score' => 50]);
        $second = $calculator->computeStudent($this->student, $this->subjectClass, $this->quarter);

        $this->assertSame($first->id, $second->id);
        $this->assertSame(1, $this->student->grades()->count());
        $this->assertGreaterThan($first->final_grade, $second->final_grade);
    }

    public function test_it_computes_every_enrolled_learner_in_the_class(): void
    {
        $classmate = Student::create([
            'lrn' => '123456789102', 'first_name' => 'Maria', 'last_name' => 'Santos', 'status' => 'active',
        ]);

        Enrollment::create([
            'student_id' => $classmate->id,
            'section_id' => $this->subjectClass->section_id,
            'semester_id' => $this->subjectClass->semester_id,
            'date_enrolled' => '2026-08-03',
            'status' => 'enrolled',
        ]);

        $this->assess(GradeComponent::WrittenWork, 50, 45);
        $this->assess(GradeComponent::PerformanceTask, 50, 45);
        $this->assess(GradeComponent::QuarterlyAssessment, 50, 45);

        $grades = (new GradeCalculator)->computeClass($this->subjectClass, $this->quarter);

        $this->assertCount(2, $grades);
        // 90% in all three components -> initial 90.00 -> transmuted 93.
        $this->assertSame(93, $grades[$this->student->id]->final_grade);
        // The classmate has no scores at all, so they have no grade yet.
        $this->assertNull($grades[$classmate->id]->final_grade);
    }
}
