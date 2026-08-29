<?php

namespace Tests\Feature;

use App\Models\Section;
use App\Models\Student;
use App\Models\SubjectClass;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Walks every screen of the portal as each role, against the seeded school.
 * A 500 anywhere -- a bad relation, a missing prop, a broken Blade -- fails here.
 */
class PortalSmokeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function admin(): User
    {
        return User::where('role', 'admin')->firstOrFail();
    }

    private function teacher(): User
    {
        return User::where('role', 'teacher')->firstOrFail();
    }

    private function student(): User
    {
        return Student::whereNotNull('user_id')->firstOrFail()->user;
    }

    public function test_the_administrator_can_open_every_module(): void
    {
        $this->actingAs($this->admin());

        foreach ([
            '/dashboard',
            '/admin/students',
            '/admin/students/create',
            '/admin/teachers',
            '/admin/subjects',
            '/admin/sections',
            '/admin/enrollment',
            '/admin/grades',
            '/admin/settings',
            '/reports',
        ] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_the_administrator_can_open_a_learner_profile_and_any_class_record(): void
    {
        $this->actingAs($this->admin());

        $student = Student::firstOrFail();
        $this->get("/admin/students/{$student->id}")->assertOk();
        $this->get("/admin/students/{$student->id}/edit")->assertOk();

        $class = SubjectClass::firstOrFail();
        $this->get("/class-record/{$class->id}")->assertOk();
    }

    public function test_a_teacher_sees_their_own_load_but_not_the_registrar_modules(): void
    {
        $teacher = $this->teacher();
        $this->actingAs($teacher);

        $this->get('/dashboard')->assertOk();
        $this->get('/teacher/classes')->assertOk();

        $ownClass = SubjectClass::where('teacher_id', $teacher->teacher->id)->firstOrFail();
        $this->get("/class-record/{$ownClass->id}")->assertOk();

        foreach (['/admin/students', '/admin/grades', '/admin/settings', '/reports'] as $url) {
            $this->get($url)->assertForbidden();
        }
    }

    public function test_a_teacher_cannot_open_a_class_they_do_not_handle(): void
    {
        $teacher = $this->teacher();
        $this->actingAs($teacher);

        $foreignClass = SubjectClass::where('teacher_id', '!=', $teacher->teacher->id)->firstOrFail();

        $this->get("/class-record/{$foreignClass->id}")->assertForbidden();
    }

    public function test_a_learner_sees_only_their_own_grades(): void
    {
        $user = $this->student();
        $this->actingAs($user);

        $this->get('/dashboard')->assertOk();
        $this->get('/student/grades')->assertOk();

        foreach (['/admin/students', '/teacher/classes', '/admin/grades'] as $url) {
            $this->get($url)->assertForbidden();
        }

        $this->get("/reports/report-card/{$user->student->id}")->assertOk();

        $classmate = Student::where('id', '!=', $user->student->id)->firstOrFail();
        $this->get("/reports/report-card/{$classmate->id}")->assertForbidden();
    }

    public function test_the_printable_reports_render(): void
    {
        $this->actingAs($this->admin());

        $student = Student::firstOrFail();
        $class = SubjectClass::firstOrFail();
        $section = Section::firstOrFail();

        $this->get("/reports/report-card/{$student->id}")
            ->assertOk()
            ->assertSee("Learner's Progress Report Card", false);

        $this->get("/reports/class-record/{$class->id}")
            ->assertOk()
            ->assertSee('Class Record');

        $this->get("/reports/master-list/{$section->id}")
            ->assertOk()
            ->assertSee('Section Master List and Grade Sheet');
    }

    public function test_guests_are_sent_to_the_sign_in_page(): void
    {
        $this->get('/')->assertRedirect('/login');
        $this->get('/dashboard')->assertRedirect('/login');
        $this->get('/admin/students')->assertRedirect('/login');
    }

    public function test_public_registration_is_closed(): void
    {
        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
    }
}
