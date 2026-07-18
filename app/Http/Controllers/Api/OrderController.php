<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orders\GenerateDesignPdfRequest;
use App\Http\Requests\Orders\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\CardDesignPdfService;
use App\Services\StripeCheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->latest()
            ->paginate(15);

        return response()->json([
            'orders' => OrderResource::collection($orders),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'last_page' => $orders->lastPage(),
                'per_page' => $orders->perPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $data = $request->validated();

        $basePriceCents = (int) config("cards.pricing_tiers.{$data['quantity']}");
        // Foil is a mandatory flat fee on every order, not a customer choice.
        $foilFeeCents = (int) config('cards.foil_fee_cents');

        $order = $request->user()->orders()->create([
            ...$data,
            'foil' => true,
            'base_price_cents' => $basePriceCents,
            'foil_fee_cents' => $foilFeeCents,
            'total_amount_cents' => $basePriceCents + $foilFeeCents,
            'currency' => config('cards.currency'),
        ])->refresh();

        return response()->json([
            'message' => 'Order created successfully.',
            'order' => new OrderResource($order),
        ], 201);
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        $this->authorize('view', $order);

        return response()->json([
            'order' => new OrderResource($order),
        ]);
    }

    public function checkout(Request $request, Order $order, StripeCheckoutService $stripe): JsonResponse
    {
        $this->authorize('view', $order);

        if ($order->status !== OrderStatus::Pending) {
            return response()->json([
                'message' => 'Only pending orders can be checked out.',
            ], 422);
        }

        // The webhook that flips an order to "paid" can land a few seconds
        // after Stripe redirects the customer back, so the order may still
        // read as "pending" here even though payment already succeeded.
        // Check the previous session directly rather than trusting our own
        // (possibly stale) status, so we never open a second payment for
        // the same order.
        if ($order->stripe_session_id) {
            try {
                $previousSession = $stripe->retrieveSession($order->stripe_session_id);
            } catch (\Throwable) {
                $previousSession = null;
            }

            if ($previousSession && $previousSession->payment_status === 'paid') {
                $order->update(['status' => OrderStatus::Paid]);

                return response()->json([
                    'message' => 'This order has already been paid.',
                ], 422);
            }
        }

        $session = $stripe->createSessionForOrder($order);

        return response()->json([
            'checkout_url' => $session->url,
            'session_id' => $session->id,
        ]);
    }

    public function designPdf(GenerateDesignPdfRequest $request, Order $order, CardDesignPdfService $pdfService): JsonResponse
    {
        $this->authorize('view', $order);

        $data = $request->validated();

        $previousPath = $order->design_pdf_path;

        $path = $pdfService->generate(
            $order,
            $request->file('design_image'),
            $data['selected_color'],
        );

        $order->update([
            'selected_color' => $data['selected_color'],
            'font_family' => $data['font_family'],
            'design_pdf_path' => $path,
        ]);

        if ($previousPath && $previousPath !== $path) {
            Storage::disk('public')->delete($previousPath);
        }

        return response()->json([
            'message' => 'Card design PDF generated successfully.',
            'order' => new OrderResource($order->fresh()),
        ]);
    }
}
