<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // The admin table filters/sorts client-side over the full order
        // list, so this intentionally returns everything rather than a
        // page at a time.
        $orders = Order::query()
            ->with('user')
            ->latest()
            ->get();

        return response()->json([
            'orders' => OrderResource::collection($orders),
        ]);
    }

    public function update(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $order->update($request->validated());

        return response()->json([
            'message' => 'Order status updated successfully.',
            'order' => new OrderResource($order->fresh()),
        ]);
    }
}
