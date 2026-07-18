<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Allowed Card Fonts
    |--------------------------------------------------------------------------
    |
    | The font families a customer may choose for their card design. Kept as
    | an explicit allow-list (rather than free text) so arbitrary/unsafe
    | values can never reach the database or the PDF renderer. Keys are the
    | values accepted from the API; values are the CSS/dompdf font-family
    | strings used when rendering the card design PDF.
    |
    */

    'allowed' => [
        'Helvetica' => 'Helvetica, Arial, sans-serif',
        'Arial' => 'Arial, Helvetica, sans-serif',
        'Times New Roman' => '"Times New Roman", Times, serif',
        'Georgia' => 'Georgia, serif',
        'Courier New' => '"Courier New", Courier, monospace',
        'Verdana' => 'Verdana, sans-serif',
    ],

    'default' => 'Helvetica',

];
