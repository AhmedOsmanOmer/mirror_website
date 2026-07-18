<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Resources\UserResource;
use App\Mail\PasswordResetCodeMail;
use App\Mail\VerificationCodeMail;
use App\Models\EmailVerificationCode;
use App\Models\PasswordResetCode;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create($request->validated())->refresh();

        $this->issueVerificationCode($user);

        return response()->json([
            'message' => 'Registration successful. Please check your email for a verification code.',
            'user' => new UserResource($user),
        ], 201);
    }

    public function verifyEmail(VerifyEmailRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = User::where('email', $request->validated('email'))->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $verification = EmailVerificationCode::query()
            ->where('user_id', $user->id)
            ->where('code', $request->validated('code'))
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        if (! $verification || $verification->isExpired()) {
            throw ValidationException::withMessages([
                'code' => ['This verification code is invalid or has expired.'],
            ]);
        }

        $verification->update(['used_at' => now()]);
        $user->markEmailAsVerified();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function resendVerification(ResendVerificationRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = User::where('email', $request->validated('email'))->firstOrFail();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email is already verified.']);
        }

        $this->issueVerificationCode($user);

        return response()->json(['message' => 'A new verification code has been sent to your email.']);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->validated();

        if (! Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']])) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        /** @var User $user */
        $user = User::where('email', $credentials['email'])->firstOrFail();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();
        $user->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = User::where('email', $request->validated('email'))->firstOrFail();

        $code = (string) random_int(100000, 999999);

        PasswordResetCode::create([
            'email' => $user->email,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        Mail::to($user->email)->send(new PasswordResetCodeMail($user->name, $code));

        return response()->json(['message' => 'A password reset code has been sent to your email.']);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $data = $request->validated();

        $reset = PasswordResetCode::query()
            ->where('email', $data['email'])
            ->where('code', $data['code'])
            ->whereNull('used_at')
            ->latest('id')
            ->first();

        if (! $reset || $reset->isExpired()) {
            throw ValidationException::withMessages([
                'code' => ['This reset code is invalid or has expired.'],
            ]);
        }

        /** @var User $user */
        $user = User::where('email', $data['email'])->firstOrFail();
        $user->update(['password' => Hash::make($data['password'])]);

        $reset->update(['used_at' => now()]);

        $user->tokens()->delete();

        return response()->json(['message' => 'Password reset successfully. Please log in again.']);
    }

    protected function issueVerificationCode(User $user): void
    {
        $code = (string) random_int(100000, 999999);

        EmailVerificationCode::create([
            'user_id' => $user->id,
            'code' => $code,
            'expires_at' => now()->addMinutes(15),
        ]);

        Mail::to($user->email)->send(new VerificationCodeMail($user->name, $code));
    }
}
