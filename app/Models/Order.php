<?php

namespace App\Models;

use App\Enums\OrderOrientation;
use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'selected_color',
    'font_family',
    'orientation',
    'quantity',
    'foil',
    'company_name',
    'shipping_name',
    'shipping_phone',
    'shipping_address_line1',
    'shipping_address_line2',
    'shipping_city',
    'shipping_state',
    'shipping_postal_code',
    'shipping_country',
    'base_price_cents',
    'foil_fee_cents',
    'total_amount_cents',
    'currency',
    'status',
    'stripe_session_id',
    'design_pdf_path',
])]
class Order extends Model
{
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'orientation' => OrderOrientation::class,
            'quantity' => 'integer',
            'foil' => 'boolean',
            'base_price_cents' => 'integer',
            'foil_fee_cents' => 'integer',
            'total_amount_cents' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
