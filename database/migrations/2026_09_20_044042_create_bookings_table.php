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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('booking_code')->unique();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->string('guest_name');
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->date('check_in');
            $table->date('check_out');
            $table->integer('adults')->default(1);
            $table->integer('children')->default(0);
            $table->text('notes')->nullable();
            $table->string('external_uid')->nullable()->index();
            $table->decimal('total_price', 12, 2)->default(0);
            $table->enum('source', ['direct', 'airbnb', 'tiket_com', 'booking_com', 'agoda', 'whatsapp', 'manual'])->default('direct');
            $table->enum('status', ['pending', 'confirmed', 'cancelled'])->default('pending');
            $table->enum('check_in_status', ['pending_arrival', 'checked_in', 'checked_out'])->default('pending_arrival');
            $table->enum('payment_status', ['unpaid', 'pending', 'paid', 'expired', 'failed'])->default('unpaid');
            $table->string('snap_token')->nullable();
            $table->string('payment_type')->nullable();
            $table->string('midtrans_transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
