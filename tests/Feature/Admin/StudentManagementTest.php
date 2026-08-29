<?php

namespace Tests\Feature\Admin;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\BuildsSchool;
use Tests\TestCase;

class StudentManagementTest extends TestCase
{
    use BuildsSchool, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buildSchool();
    }

    public function test_an_administrator_can_register_a_learner(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/students', $this->studentPayload())
            ->assertRedirect('/admin/students');

        $this->assertDatabaseHas('students', [
            'lrn' => '123456789101',
            'last_name' => 'Dela Cruz',
            'status' => 'active',
        ]);
    }

    public function test_a_new_learner_is_given_a_portal_login(): void
    {
        $this->actingAs($this->admin)->post('/admin/students', $this->studentPayload());

        $student = Student::where('lrn', '123456789101')->firstOrFail();

        $this->assertNotNull($student->user_id, 'The learner should be able to sign in and see their grades.');
        $this->assertSame('student', $student->user->role->value);
        $this->assertTrue($student->user->is_active);
    }

    public function test_a_new_learner_gets_a_one_time_password_not_a_shared_default(): void
    {
        $response = $this->actingAs($this->admin)->post('/admin/students', $this->studentPayload());

        $student = Student::where('lrn', '123456789101')->firstOrFail();

        $this->assertFalse(Hash::check('password', $student->user->password), 'Accounts must not share a guessable password.');

        $flash = $response->getSession()->get('success');
        preg_match('/([a-zA-Z346789]{4}-[a-zA-Z346789]{4})/', $flash, $matches);
        $this->assertNotEmpty($matches, "The registrar needs to see the password once, got: {$flash}");
        $this->assertTrue(Hash::check($matches[1], $student->user->password));
    }

    public function test_two_learners_never_share_a_password(): void
    {
        $this->actingAs($this->admin)->post('/admin/students', $this->studentPayload());
        $this->actingAs($this->admin)->post('/admin/students', $this->studentPayload([
            'lrn' => '123456789102', 'first_name' => 'Maria', 'last_name' => 'Santos',
        ]));

        $passwords = Student::with('user')->get()->pluck('user.password');
        $this->assertCount(2, $passwords->unique());
    }

    public function test_choosing_a_section_enrols_the_learner_for_the_active_semester(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/students', $this->studentPayload(['section_id' => $this->section->id]));

        $student = Student::where('lrn', '123456789101')->firstOrFail();

        $this->assertDatabaseHas('enrollments', [
            'student_id' => $student->id,
            'section_id' => $this->section->id,
            'semester_id' => $this->semester->id,
            'status' => 'enrolled',
        ]);
    }

    public function test_the_lrn_must_be_twelve_digits_and_unique(): void
    {
        $this->actingAs($this->admin)
            ->post('/admin/students', $this->studentPayload(['lrn' => '12345']))
            ->assertSessionHasErrors('lrn');

        $this->actingAs($this->admin)->post('/admin/students', $this->studentPayload());

        $this->actingAs($this->admin)
            ->post('/admin/students', $this->studentPayload(['lrn' => '123456789101']))
            ->assertSessionHasErrors('lrn');

        $this->assertSame(1, Student::count());
    }

    public function test_a_learner_can_be_edited_and_moved_to_another_section(): void
    {
        $student = $this->enrolStudent('123456789102', 'Maria', 'Santos');

        $this->actingAs($this->admin)
            ->put("/admin/students/{$student->id}", $this->studentPayload([
                'lrn' => '123456789102',
                'first_name' => 'Maria Clara',
                'last_name' => 'Santos',
                'status' => 'transferred',
                'section_id' => $this->section->id,
            ]))
            ->assertRedirect('/admin/students');

        $student->refresh();
        $this->assertSame('Maria Clara', $student->first_name);
        $this->assertSame('transferred', $student->status);
    }

    public function test_deleting_a_learner_removes_their_login_and_enrolment(): void
    {
        $student = $this->enrolStudent('123456789103', 'Jose', 'Rizal');
        $user = User::factory()->student()->create();
        $student->update(['user_id' => $user->id]);

        $this->actingAs($this->admin)
            ->delete("/admin/students/{$student->id}")
            ->assertRedirect('/admin/students');

        $this->assertDatabaseMissing('students', ['id' => $student->id]);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
        $this->assertSame(0, Enrollment::where('student_id', $student->id)->count());
    }

    public function test_the_action_is_written_to_the_activity_log(): void
    {
        $this->actingAs($this->admin)->post('/admin/students', $this->studentPayload());

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'student.created',
            'user_id' => $this->admin->id,
        ]);
    }

    public function test_teachers_and_learners_cannot_manage_learner_records(): void
    {
        $this->actingAs($this->teacher->user)
            ->post('/admin/students', $this->studentPayload())
            ->assertForbidden();

        $this->actingAs(User::factory()->student()->create())
            ->post('/admin/students', $this->studentPayload())
            ->assertForbidden();

        $this->assertSame(0, Student::count());
    }
}
