<?php

namespace App\Services;

use App\Enums\OrderOrientation;
use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CardDesignPdfService
{
    /**
     * Millimeters-to-points conversion factor (1mm = 72/25.4 pt).
     */
    protected const MM_TO_PT = 2.8346456693;

    /**
     * Embed the customer's exported card design image into a PDF sized to
     * the fixed card dimensions (swapped for vertical orientation), store
     * it on the public disk, and return its storage-relative path.
     */
    public function generate(Order $order, UploadedFile $designImage, string $selectedColor): string
    {
        $widthMm = (float) config('cards.width_mm');
        $heightMm = (float) config('cards.height_mm');

        if ($order->orientation === OrderOrientation::Vertical) {
            [$widthMm, $heightMm] = [$heightMm, $widthMm];
        }

        $widthPt = $widthMm * self::MM_TO_PT;
        $heightPt = $heightMm * self::MM_TO_PT;

        $imageDataUri = 'data:'.$designImage->getMimeType().';base64,'.base64_encode($designImage->get());

        $pdf = Pdf::loadView('pdf.card-design', [
            'imageDataUri' => $imageDataUri,
            'selectedColor' => $selectedColor,
        ])->setPaper([0, 0, $widthPt, $heightPt]);

        $directory = "order-designs/{$order->id}";
        $filename = Str::uuid()->toString().'.pdf';
        $path = "{$directory}/{$filename}";

        Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }
}
