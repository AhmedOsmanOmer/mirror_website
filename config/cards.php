<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Mirror Business Card Pricing
    |--------------------------------------------------------------------------
    |
    | Pricing is tiered by quantity (not a linear per-card rate) — a customer
    | picks one of these fixed quantities and pays the matching flat price,
    | in the smallest currency unit (e.g. cents). Every order also includes
    | a mandatory flat foil finish fee on top of the tier price — it is not
    | an optional add-on, so it's never accepted as customer input.
    |
    */

    'pricing_tiers' => [
        100 => 35000,
        200 => 42500,
        250 => 45000,
        300 => 47500,
        500 => 55000,
        1000 => 80000,
    ],

    'foil_fee_cents' => (int) env('CARD_FOIL_FEE_CENTS', 5000),

    'currency' => env('CARD_CURRENCY', 'aud'),

    /*
    |--------------------------------------------------------------------------
    | Card Dimensions
    |--------------------------------------------------------------------------
    |
    | The physical size of every mirror business card. This is fixed by the
    | product itself (not user input) so it lives here as a constant rather
    | than a per-order column, and is used to size the generated design PDF.
    |
    */

    'width_mm' => 85,

    'height_mm' => 50,

];
