<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StudioController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Studio/Index', [
            'fonts' => array_keys(config('fonts.allowed')),
            'defaultFont' => config('fonts.default'),
            'cardDimensions' => [
                'width_mm' => config('cards.width_mm'),
                'height_mm' => config('cards.height_mm'),
            ],
            'pricing' => [
                'tiers' => config('cards.pricing_tiers'),
                'foil_fee_cents' => (int) config('cards.foil_fee_cents'),
                'currency' => config('cards.currency'),
            ],
        ]);
    }
}
