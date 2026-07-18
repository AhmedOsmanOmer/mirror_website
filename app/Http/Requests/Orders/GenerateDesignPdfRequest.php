<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateDesignPdfRequest extends FormRequest
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
            'design_image' => ['required', 'image', 'mimes:png,jpg,jpeg', 'max:5120'],
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
            'design_image.required' => 'A card design image is required.',
            'design_image.image' => 'The design file must be an image.',
            'design_image.mimes' => 'The design image must be a PNG or JPEG file.',
            'design_image.max' => 'The design image must be smaller than 5MB.',
        ];
    }
}
