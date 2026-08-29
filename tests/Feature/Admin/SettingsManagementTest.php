<?php

namespace Tests\Feature\Admin;

use App\Models\Semester;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\BuildsSchool;
use Tests\TestCase;

class SettingsManagementTest extends TestCase
{
    use BuildsSchool, RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->buildSchool();
    }

    public function test_the_school_profile_can_be_updated(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/settings/school', [
                'name' => 'Datamex College of Saint Adeline',
                'short_name' => 'DCSA',
                'system_name' => 'Grade 12 Grading Management System',
                'address' => 'Marikina City',
                'contact_number' => '(02) 8942-1234',
                'email' => 'registrar@dcsa.edu.ph',
                'school_id' => '405231',
            ])
            ->assertRedirect();

        $school = Setting::get('school');
        $this->assertSame('DCSA', $school['short_name']);
        $this->assertSame('405231', $school['school_id']);
    }

    public function test_the_school_profile_rejects_a_malformed_email(): void
    {
        $this->actingAs($this->admin)
            ->put('/admin/settings/school', [
                'name' => 'DCSA', 'short_name' => 'DCSA', 'system_name' => 'Portal', 'email' => 'not-an-email',
            ])
            ->assertSessionHasErrors('email');
    }

    public function test_activating_a_semester_deactivates_the_others(): void
    {
        $second = Semester::where('term', 2)->firstOrFail();

        $this->actingAs($this->admin)
            ->post("/admin/settings/semesters/{$second->id}/activate")
            ->assertRedirect();

        $this->assertTrue($second->fresh()->is_active);
        $this->assertFalse($this->semester->fresh()->is_active);
        $this->assertSame(1, Semester::where('is_active', true)->count());
        $this->assertTrue($second->schoolYear->fresh()->is_active);
    }

    public function test_closing_a_quarter_records_who_closed_it_and_when(): void
    {
        $this->actingAs($this->admin)
            ->post("/admin/settings/quarters/{$this->openQuarter->id}/toggle-lock")
            ->assertRedirect();

        $quarter = $this->openQuarter->fresh();
        $this->assertTrue($quarter->is_locked);
        $this->assertSame($this->admin->id, $quarter->locked_by);
        $this->assertNotNull($quarter->locked_at);

        $this->assertDatabaseHas('activity_logs', ['action' => 'quarter.locked']);
    }

    public function test_reopening_a_quarter_clears_the_lock_record(): void
    {
        $this->actingAs($this->admin)->post("/admin/settings/quarters/{$this->lockedQuarter->id}/toggle-lock");

        $quarter = $this->lockedQuarter->fresh();
        $this->assertFalse($quarter->is_locked);
        $this->assertNull($quarter->locked_by);
        $this->assertNull($quarter->locked_at);
        $this->assertDatabaseHas('activity_logs', ['action' => 'quarter.unlocked']);
    }

    public function test_an_account_password_can_be_reset(): void
    {
        $user = User::factory()->teacher()->create(['password' => Hash::make('something-else')]);

        $this->actingAs($this->admin)
            ->post("/admin/settings/users/{$user->id}/reset-password")
            ->assertRedirect();

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
        $this->assertDatabaseHas('activity_logs', ['action' => 'user.password_reset']);
    }

    public function test_an_account_can_be_disabled_and_re_enabled(): void
    {
        $user = User::factory()->teacher()->create(['is_active' => true]);

        $this->actingAs($this->admin)->post("/admin/settings/users/{$user->id}/toggle");
        $this->assertFalse($user->fresh()->is_active);

        $this->actingAs($this->admin)->post("/admin/settings/users/{$user->id}/toggle");
        $this->assertTrue($user->fresh()->is_active);
    }

    public function test_only_an_administrator_can_change_the_academic_calendar(): void
    {
        $second = Semester::where('term', 2)->firstOrFail();

        $this->actingAs($this->teacher->user)
            ->post("/admin/settings/semesters/{$second->id}/activate")
            ->assertForbidden();

        $this->actingAs($this->teacher->user)
            ->post("/admin/settings/quarters/{$this->openQuarter->id}/toggle-lock")
            ->assertForbidden();

        $this->assertFalse($second->fresh()->is_active);
        $this->assertFalse($this->openQuarter->fresh()->is_locked);
    }

    public function test_a_teacher_cannot_reset_another_users_password(): void
    {
        $victim = User::factory()->admin()->create(['password' => Hash::make('a-real-password')]);

        $this->actingAs($this->teacher->user)
            ->post("/admin/settings/users/{$victim->id}/reset-password")
            ->assertForbidden();

        $this->assertTrue(Hash::check('a-real-password', $victim->fresh()->password));
    }
}
