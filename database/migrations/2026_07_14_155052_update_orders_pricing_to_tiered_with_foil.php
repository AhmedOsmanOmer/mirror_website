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
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('unit_price_cents', 'base_price_cents');
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('foil')->default(false)->after('quantity');
            $table->unsignedInteger('foil_fee_cents')->default(0)->after('base_price_cents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['foil', 'foil_fee_cents']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('base_price_cents', 'unit_price_cents');
        });
    }
};
