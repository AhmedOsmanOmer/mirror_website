<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AuthPageController extends Controller
{
    public function signup(): Response
    {
        return Inertia::render('Auth/Signup');
    }

    public function login(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function forgotPassword(): Response
    {
        return Inertia::render('Auth/ForgotPassword');
    }
}
