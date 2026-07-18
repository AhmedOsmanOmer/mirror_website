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
            // Free-form hex color instead of a fixed 3-value enum.
            $table->string('selected_color', 7)->change();

            $table->string('font_family')->nullable()->after('selected_color');
            $table->string('design_pdf_path')->nullable()->after('stripe_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['font_family', 'design_pdf_path']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->enum('selected_color', [
                'rgba(108,192,168)',
                'rgba(229,217,219)',
                'rgba(229,182,164)',
            ])->change();
        });
    }
};
