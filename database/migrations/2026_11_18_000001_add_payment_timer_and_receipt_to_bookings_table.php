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
        Schema::table('bookings', function (Blueprint $table) {
            if (!Schema::hasColumn('bookings', 'payment_method')) {
                $table->string('payment_method')->default('bca_transfer')->after('payment_status');
            }
            if (!Schema::hasColumn('bookings', 'payment_expires_at')) {
                $table->timestamp('payment_expires_at')->nullable()->index()->after('paid_at');
            }
            if (!Schema::hasColumn('bookings', 'receipt_number')) {
                $table->string('receipt_number')->nullable()->unique()->after('booking_code');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $columns = array_filter(
                ['payment_method', 'payment_expires_at', 'receipt_number'],
                fn (string $col) => Schema::hasColumn('bookings', $col)
            );
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};

