<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle session login request.
     * POST /login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!Auth::attempt($credentials, $request->boolean('remember'))) {
            throw ValidationException::withMessages([
                'email' => ['Invalid email or password.'],
            ]);
        }

        $request->session()->regenerate();

        if ($request->expectsJson()) {
            return response()->json([
                'user' => Auth::user(),
                'redirect' => '/admin-dashboard',
            ]);
        }

        return redirect()->intended('/admin-dashboard');
    }

    /**
     * Handle session logout request.
     * POST /logout
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'redirect' => '/',
            ]);
        }

        return redirect('/');
    }
}

