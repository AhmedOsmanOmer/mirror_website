<?php

namespace App\Services;

use App\Models\Order;
use Stripe\Checkout\Session;
use Stripe\StripeClient;

class StripeCheckoutService
{
    protected StripeClient $client;

    public function __construct()
    {
        $this->client = new StripeClient(config('services.stripe.secret'));
    }

    public function createSessionForOrder(Order $order): Session
    {
        $session = $this->client->checkout->sessions->create([
            'mode' => 'payment',
            'payment_method_types' => ['card'],
            'client_reference_id' => (string) $order->id,
            'customer_email' => $order->user->email,
            'line_items' => [[
                'quantity' => 1,
                'price_data' => [
                    'currency' => $order->currency,
                    'unit_amount' => $order->total_amount_cents,
                    'product_data' => [
                        'name' => "Mirror Business Card — {$order->quantity} units",
                        'description' => "Color: {$order->selected_color}".($order->foil ? ' · Foil finish' : ''),
                    ],
                ],
            ]],
            'success_url' => rtrim((string) config('app.frontend_url'), '/')."/orders/{$order->id}?checkout=success",
            'cancel_url' => rtrim((string) config('app.frontend_url'), '/')."/orders/{$order->id}?checkout=cancelled",
            'metadata' => [
                'order_id' => (string) $order->id,
            ],
        ]);

        $order->update(['stripe_session_id' => $session->id]);

        return $session;
    }

    public function retrieveSession(string $sessionId): Session
    {
        return $this->client->checkout->sessions->retrieve($sessionId);
    }
}
