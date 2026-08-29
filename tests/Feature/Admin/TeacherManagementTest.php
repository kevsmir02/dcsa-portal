<?php

namespace Tests\Feature\Admin;

use App\Models\Teacher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\BuildsSchool;
use Tests\TestCase;

class TeacherManagementTest extends TestCase
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
            'employee_no' => 'T-9001',
            'first_name' => 'Imelda',
            'middle_name' => 'Santos',
            'last_name' => 'Aquino',
            'suffix' => '',
            'sex' => 'female',
            'position' => 'Teacher III',
            'department' => 'English',
            'contact_number' => '09171112222',
            'email' => 'imelda.aquino@dcsa.test',
            'is_active' => true,
        ], $overrides);
    }

    public function test_an_administrator_can_add_a_teacher_with_a_login(): void
    {
        $this->actingAs($this->admin)->post('/admin/teachers', $this->payload())->assertRedirect();

        $teacher = Teacher::where('employee_no', 'T-9001')->firstOrFail();
        $this->assertSame('Aquino', $teacher->last_name);
        $this->assertNotNull($teacher->user_id);
        $this->assertSame('teacher', $teacher->user->role->value);
        $this->assertSame('imelda.aquino@dcsa.test', $teacher->user->email);
    }

    public function test_the_employee_number_and_email_must_be_unique(): void
    {
        $this->actingAs($this->admin)->post('/admin/teachers', $this->payload());

        $this->actingAs($this->admin)
            ->post('/admin/teachers', $this->payload(['email' => 'someone.else@dcsa.test']))
            ->assertSessionHasErrors('employee_no');

        $this->actingAs($this->admin)
            ->post('/admin/teachers', $this->payload(['employee_no' => 'T-9002']))
            ->assertSessionHasErrors('email');

        $this->assertSame(2, Teacher::count());   // the one from the fixture plus one created here
    }

    public function test_editing_a_teacher_keeps_their_login_in_step(): void
    {
        $this->actingAs($this->admin)->post('/admin/teachers', $this->payload());
        $teacher = Teacher::where('employee_no', 'T-9001')->firstOrFail();

        $this->actingAs($this->admin)
            ->put("/admin/teachers/{$teacher->id}", $this->payload([
                'last_name' => 'Aquino-Reyes',
                'email' => 'imelda.reyes@dcsa.test',
                'is_active' => false,
            ]))
            ->assertRedirect();

        $teacher->refresh();
        $this->assertSame('Aquino-Reyes', $teacher->last_name);
        $this->assertFalse($teacher->is_active);
        $this->assertSame('imelda.reyes@dcsa.test', $teacher->user->email);
        $this->assertFalse($teacher->user->is_active, 'A deactivated teacher must not still be able to sign in.');
    }

    public function test_removing_a_teacher_leaves_their_classes_unassigned_rather_than_deleting_them(): void
    {
        $classId = $this->class->id;

        $this->actingAs($this->admin)
            ->delete("/admin/teachers/{$this->teacher->id}")
            ->assertRedirect();

        $this->assertDatabaseMissing('teachers', ['id' => $this->teacher->id]);
        $this->assertDatabaseHas('subject_classes', ['id' => $classId, 'teacher_id' => null]);
    }

    public function test_a_teacher_cannot_manage_the_faculty_list(): void
    {
        $this->actingAs($this->teacher->user)->post('/admin/teachers', $this->payload())->assertForbidden();
        $this->actingAs($this->teacher->user)->delete("/admin/teachers/{$this->teacher->id}")->assertForbidden();

        $this->assertDatabaseHas('teachers', ['id' => $this->teacher->id]);
    }
}
