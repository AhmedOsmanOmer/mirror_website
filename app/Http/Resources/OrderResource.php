<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

/**
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'email' => $this->user->email,
            ]),
            'selected_color' => $this->selected_color,
            'font_family' => $this->font_family,
            'orientation' => $this->orientation->value,
            'quantity' => $this->quantity,
            'foil' => $this->foil,
            'company_name' => $this->company_name,
            'shipping' => [
                'name' => $this->shipping_name,
                'phone' => $this->shipping_phone,
                'address_line1' => $this->shipping_address_line1,
                'address_line2' => $this->shipping_address_line2,
                'city' => $this->shipping_city,
                'state' => $this->shipping_state,
                'postal_code' => $this->shipping_postal_code,
                'country' => $this->shipping_country,
            ],
            'base_price_cents' => $this->base_price_cents,
            'foil_fee_cents' => $this->foil_fee_cents,
            'total_amount_cents' => $this->total_amount_cents,
            'currency' => $this->currency,
            'status' => $this->status->value,
            'stripe_session_id' => $this->stripe_session_id,
            'design_pdf_path' => $this->design_pdf_path
                ? Storage::disk('public')->url($this->design_pdf_path)
                : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
