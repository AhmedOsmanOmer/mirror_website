<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // A single JsonResource auto-wraps in {"data": ...} when resolved by
        // Inertia's prop serialization, but not when embedded in a plain
        // response()->json([...]) array like the API controllers do. Disable
        // wrapping globally so both are unwrapped consistently.
        JsonResource::withoutWrapping();

        if ($this->app->environment('production')) {
    URL::forceScheme('https');
}
    }
}
