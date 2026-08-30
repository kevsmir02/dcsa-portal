<?php

namespace App\Http\Controllers;

use App\Support\ComponentWeights;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The public front page. Anyone already signed in has no use for it and goes
 * straight to their dashboard.
 */
class WelcomeController extends Controller
{
    public function __invoke(): Response|RedirectResponse
    {
        if (auth()->check()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('welcome', [
            'defaultWeights' => ComponentWeights::depedDefaults(),
        ]);
    }
}
