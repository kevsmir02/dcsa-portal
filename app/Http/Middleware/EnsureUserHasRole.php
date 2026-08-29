<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Allow the request through only for the listed roles.
     * Usage: ->middleware('role:admin') or ->middleware('role:admin,teacher')
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user?->role || ! in_array($user->role->value, $roles, true)) {
            abort(403, 'You do not have access to this part of the portal.');
        }

        return $next($request);
    }
}
