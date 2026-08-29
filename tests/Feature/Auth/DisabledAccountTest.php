<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DisabledAccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_active_account_can_sign_in(): void
    {
        $user = User::factory()->teacher()->create([
            'email' => 'active@dcsa.test', 'password' => Hash::make('password'), 'is_active' => true,
        ]);

        $this->post('/login', ['email' => 'active@dcsa.test', 'password' => 'password'])
            ->assertRedirect('/dashboard');

        $this->assertAuthenticatedAs($user);
    }

    public function test_a_disabled_account_is_refused_even_with_the_right_password(): void
    {
        User::factory()->teacher()->create([
            'email' => 'disabled@dcsa.test', 'password' => Hash::make('password'), 'is_active' => false,
        ]);

        $this->post('/login', ['email' => 'disabled@dcsa.test', 'password' => 'password'])
            ->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_disabling_an_account_ends_the_signed_in_session_on_the_next_request(): void
    {
        $user = User::factory()->teacher()->create([
            'email' => 'revoked@dcsa.test', 'password' => Hash::make('password'), 'is_active' => true,
        ]);

        $this->actingAs($user)->get('/dashboard')->assertOk();

        $user->update(['is_active' => false]);

        $this->actingAs($user->fresh())->get('/dashboard')->assertRedirect('/login');
        $this->assertGuest();
    }
}
