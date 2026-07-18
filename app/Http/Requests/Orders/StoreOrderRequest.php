<?php

namespace App\Http\Requests\Orders;

use App\Enums\OrderOrientation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'selected_color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'font_family' => ['required', 'string', Rule::in(array_keys(config('fonts.allowed')))],
            'orientation' => ['required', new Enum(OrderOrientation::class)],
            'quantity' => ['required', 'integer', Rule::in(array_keys(config('cards.pricing_tiers')))],
            'company_name' => ['nullable', 'string', 'max:255'],
            'shipping_name' => ['required', 'string', 'max:255'],
            'shipping_phone' => ['required', 'string', 'max:30'],
            'shipping_address_line1' => ['required', 'string', 'max:255'],
            'shipping_address_line2' => ['nullable', 'string', 'max:255'],
            'shipping_city' => ['required', 'string', 'max:120'],
            'shipping_state' => ['nullable', 'string', 'max:120'],
            'shipping_postal_code' => ['required', 'string', 'max:20'],
            'shipping_country' => ['required', 'string', 'max:120'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'selected_color.regex' => 'The selected color must be a valid hex color code (e.g. #6CC0A8 or #FFF).',
            'font_family.in' => 'The selected font is not supported. Choose one of: '.implode(', ', array_keys(config('fonts.allowed'))).'.',
            'orientation.required' => 'The orientation field is required.',
            'quantity.in' => 'Quantity must be one of: '.implode(', ', array_keys(config('cards.pricing_tiers'))).'.',
        ];
    }
}
