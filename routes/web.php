<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Web\Admin\OrdersPageController as AdminOrdersPageController;
use App\Http\Controllers\Web\AuthPageController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\OrderPageController;
use App\Http\Controllers\Web\StudioController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::middleware('guest')->group(function () {
    Route::get('/signup', [AuthPageController::class, 'signup'])->name('signup');
    Route::get('/login', [AuthPageController::class, 'login'])->name('login');
    Route::get('/forgot-password', [AuthPageController::class, 'forgotPassword'])->name('password.request');

    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/studio', [StudioController::class, 'index'])->name('studio');
    Route::get('/orders/{order}', [OrderPageController::class, 'show'])->name('orders.show');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/orders', [AdminOrdersPageController::class, 'index'])->name('admin.orders');
    });
});
