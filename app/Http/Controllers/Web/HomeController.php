<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Landing', [
            'pricing' => [
                'tiers' => config('cards.pricing_tiers'),
                'foil_fee_cents' => (int) config('cards.foil_fee_cents'),
                'currency' => config('cards.currency'),
                'width_mm' => config('cards.width_mm'),
                'height_mm' => config('cards.height_mm'),
            ],
        ]);
    }
}
