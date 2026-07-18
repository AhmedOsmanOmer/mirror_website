<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature', '');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $signature, $secret);
        } catch (\UnexpectedValueException $e) {
            return response()->json(['message' => 'Invalid payload.'], 400);
        } catch (SignatureVerificationException $e) {
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;

            $order = Order::query()->where('stripe_session_id', $session->id)->first();

            if (! $order) {
                $orderId = $session->client_reference_id ?? $session->metadata->order_id ?? null;
                $order = $orderId ? Order::find($orderId) : null;
            }

            if ($order && $order->status === OrderStatus::Pending) {
                $order->update(['status' => OrderStatus::Paid]);
            } elseif (! $order) {
                Log::warning('Stripe webhook: order not found for session', ['session_id' => $session->id]);
            }
        }

        return response()->json(['received' => true]);
    }
}
