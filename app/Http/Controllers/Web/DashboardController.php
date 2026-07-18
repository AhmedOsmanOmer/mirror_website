<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $orders = $request->user()
            ->orders()
            ->latest()
            ->paginate(15);

        return Inertia::render('Dashboard/Index', [
            'user' => new UserResource($request->user()),
            'orders' => OrderResource::collection($orders),
        ]);
    }
}
