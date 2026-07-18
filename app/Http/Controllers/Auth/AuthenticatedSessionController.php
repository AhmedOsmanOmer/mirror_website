<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthenticatedSessionController extends Controller
{
    public function store(LoginRequest $request): RedirectResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! Auth::user()->hasVerifiedEmail()) {
            Auth::logout();

            throw ValidationException::withMessages([
                'unverified' => ['Please verify your email address before logging in.'],
            ]);
        }

        $request->session()->regenerate();

        // Allow the frontend to request landing on a specific page after
        // login (e.g. straight into the studio right after signup), but
        // only from a small allow-list to avoid an open redirect.
        $redirect = in_array($request->input('redirect'), ['/studio', '/dashboard'], true)
            ? $request->input('redirect')
            : '/dashboard';

        return redirect()->intended($redirect);
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
