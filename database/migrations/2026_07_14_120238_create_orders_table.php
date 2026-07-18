<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->enum('selected_color', [
                'rgba(108,192,168)',
                'rgba(229,217,219)',
                'rgba(229,182,164)',
            ]);
            $table->unsignedInteger('quantity');

            // Company / shipping details
            $table->string('company_name')->nullable();
            $table->string('shipping_name');
            $table->string('shipping_phone');
            $table->string('shipping_address_line1');
            $table->string('shipping_address_line2')->nullable();
            $table->string('shipping_city');
            $table->string('shipping_state')->nullable();
            $table->string('shipping_postal_code');
            $table->string('shipping_country');

            // Pricing
            $table->unsignedInteger('unit_price_cents');
            $table->unsignedInteger('total_amount_cents');
            $table->string('currency', 3)->default('usd');

            $table->enum('status', [
                'pending',
                'paid',
                'processing',
                'shipped',
                'delivered',
            ])->default('pending');

            $table->string('stripe_session_id')->nullable()->index();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
