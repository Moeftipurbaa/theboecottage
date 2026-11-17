<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'booking_code',
        'receipt_number',
        'room_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'check_in',
        'check_out',
        'adults',
        'children',
        'notes',
        'external_uid',
        'total_price',
        'source',
        'status',
        'check_in_status',
        'payment_status',
        'payment_method',
        'snap_token',
        'payment_type',
        'midtrans_transaction_id',
        'paid_at',
        'payment_expires_at',
    ];

    protected $casts = [
        'check_in' => 'date:Y-m-d',
        'check_out' => 'date:Y-m-d',
        'adults' => 'integer',
        'children' => 'integer',
        'total_price' => 'decimal:2',
        'paid_at' => 'datetime',
        'payment_expires_at' => 'datetime',
    ];

    /**
     * Automatically expire any pending bookings whose 30-minute payment window has elapsed.
     */
    public static function expireOverduePending(): int
    {
        return static::where('status', 'pending')
            ->whereIn('payment_status', ['unpaid', 'pending'])
            ->whereNotNull('payment_expires_at')
            ->where('payment_expires_at', '<=', now())
            ->update([
                'status' => 'cancelled',
                'payment_status' => 'expired',
            ]);
    }

    /**
     * Generate a unique digital receipt number (e.g. INV-BOE-YYYYMMDD-XXXX).
     */
    public static function generateReceiptNumber(): string
    {
        do {
            $receiptNumber = 'INV-BOE-' . now()->format('Ymd') . '-' . Str::upper(Str::random(4));
        } while (static::where('receipt_number', $receiptNumber)->exists());

        return $receiptNumber;
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}
