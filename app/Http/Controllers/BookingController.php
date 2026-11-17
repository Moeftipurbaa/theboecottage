<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use App\Models\SeasonalRate;
use App\Services\MidtransService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public const SERVICE_FEE = 370000;
    public const PAYMENT_WINDOW_MINUTES = 30;

    /**
     * Atomic guest booking creation + 30-minute BCA / Midtrans checkout session.
     * POST /api/bookings
     */
    public function store(Request $request, MidtransService $midtransService)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'nullable|integer|min:1|max:12',
            'children' => 'nullable|integer|min:0|max:10',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'required|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:2000',
            'payment_method' => 'nullable|string|in:bca_transfer,midtrans',
        ]);

        return DB::transaction(function () use ($validated, $midtransService) {
            Booking::expireOverduePending();

            /** @var Room $room */
            $room = Room::where('id', $validated['room_id'])->lockForUpdate()->firstOrFail();

            if ($room->status === 'MAINTENANCE') {
                throw ValidationException::withMessages([
                    'room_id' => ['This cottage is currently undergoing maintenance and cannot be booked.'],
                ]);
            }

            $isOverlap = Booking::where('room_id', $room->id)
                ->where(function ($query) {
                    $query->where('status', 'confirmed')
                        ->orWhere(function ($q) {
                            $q->where('status', 'pending')
                                ->where(function ($exp) {
                                    $exp->whereNull('payment_expires_at')
                                        ->orWhere('payment_expires_at', '>', now());
                                });
                        });
                })
                ->where(function ($query) use ($validated) {
                    $query->where('check_in', '<', $validated['check_out'])
                        ->where('check_out', '>', $validated['check_in']);
                })
                ->exists();

            if ($isOverlap) {
                throw ValidationException::withMessages([
                    'check_in' => ['Selected dates conflict with an existing reservation. Please choose different dates.'],
                ]);
            }

            $pricing = $this->calculateStayPrice($room, $validated['check_in'], $validated['check_out'], true);

            do {
                $bookingCode = 'BOE-' . now()->format('Ymd') . '-' . Str::upper(Str::random(4));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            $paymentMethod = $validated['payment_method'] ?? 'bca_transfer';
            $expiresAt = now()->addMinutes(self::PAYMENT_WINDOW_MINUTES);

            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'room_id' => $room->id,
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'],
                'guest_phone' => $validated['guest_phone'] ?? null,
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'adults' => $validated['adults'] ?? 1,
                'children' => $validated['children'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'total_price' => $pricing['total'],
                'source' => 'direct',
                'status' => 'pending',
                'check_in_status' => 'pending_arrival',
                'payment_status' => 'unpaid',
                'payment_method' => $paymentMethod,
                'payment_type' => $paymentMethod === 'bca_transfer' ? 'Transfer Bank BCA / Virtual Account' : 'Midtrans Snap',
                'payment_expires_at' => $expiresAt,
            ]);

            $snapToken = $midtransService->createSnapToken($booking, $room, $pricing['items']);
            $booking->update(['snap_token' => $snapToken]);

            return response()->json([
                'booking' => $booking->fresh('room'),
                'snap_token' => $snapToken,
                'pricing' => $pricing,
                'server_time' => now()->toIso8601String(),
            ], 201);
        });
    }

    /**
     * Real-time polling endpoint for checkout countdown & payment status verification.
     * GET /api/bookings/{booking:booking_code}/status
     */
    public function checkStatus(Booking $booking)
    {
        Booking::expireOverduePending();
        $booking->refresh();

        if ($booking->payment_status === 'paid' && empty($booking->receipt_number)) {
            $booking->update([
                'receipt_number' => Booking::generateReceiptNumber(),
                'paid_at' => $booking->paid_at ?? now(),
            ]);
            $booking->refresh();
        }

        return response()->json([
            'booking' => $booking->load('room'),
            'server_time' => now()->toIso8601String(),
            'is_paid' => $booking->payment_status === 'paid' && $booking->status === 'confirmed',
            'is_expired' => $booking->status === 'cancelled' || $booking->payment_status === 'expired',
        ]);
    }

    /**
     * Localhost / Demo simulation endpoint for instant BCA Transfer verification.
     * POST /api/bookings/{booking:booking_code}/simulate-pay
     */
    public function simulatePay(Booking $booking)
    {
        Booking::expireOverduePending();
        $booking->refresh();

        if ($booking->status === 'cancelled' || $booking->payment_status === 'expired') {
            return response()->json([
                'message' => 'Waktu pembayaran untuk reservasi ini telah habis (expired). Silakan buat reservasi baru.',
                'booking' => $booking->load('room'),
            ], 422);
        }

        if ($booking->payment_status !== 'paid' || $booking->status !== 'confirmed') {
            $booking->update([
                'status' => 'confirmed',
                'payment_status' => 'paid',
                'payment_method' => $booking->payment_method ?: 'bca_transfer',
                'payment_type' => 'Transfer Bank BCA - Terverifikasi Otomatis',
                'paid_at' => now(),
                'receipt_number' => $booking->receipt_number ?: Booking::generateReceiptNumber(),
            ]);
        }

        return response()->json([
            'booking' => $booking->fresh('room'),
            'server_time' => now()->toIso8601String(),
            'is_paid' => true,
            'message' => 'Pembayaran Transfer Bank BCA berhasil diverifikasi secara otomatis.',
        ]);
    }

    /**
     * Admin manual reservation creation (Central Bookings).
     * POST /admin/bookings
     */
    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'required|string|max:50',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'nullable|integer|min:1|max:12',
            'children' => 'nullable|integer|min:0|max:10',
            'source' => 'nullable|in:direct,airbnb,tiket_com,booking_com,agoda,whatsapp,manual',
            'status' => 'nullable|in:pending,confirmed,cancelled',
            'payment_status' => 'nullable|in:unpaid,pending,paid,expired,failed',
            'payment_type' => 'nullable|string|max:50',
            'notes' => 'nullable|string|max:2000',
        ]);

        return DB::transaction(function () use ($validated) {
            Booking::expireOverduePending();

            /** @var Room $room */
            $room = Room::where('id', $validated['room_id'])->lockForUpdate()->firstOrFail();

            $isOverlap = Booking::where('room_id', $room->id)
                ->whereIn('status', ['confirmed', 'pending'])
                ->where(function ($query) use ($validated) {
                    $query->where('check_in', '<', $validated['check_out'])
                        ->where('check_out', '>', $validated['check_in']);
                })
                ->exists();

            if ($isOverlap) {
                throw ValidationException::withMessages([
                    'check_in' => ['Selected dates conflict with an existing reservation for this room.'],
                ]);
            }

            $pricing = $this->calculateStayPrice($room, $validated['check_in'], $validated['check_out'], true);

            do {
                $bookingCode = 'BOE-' . now()->format('Ymd') . '-' . Str::upper(Str::random(4));
            } while (Booking::where('booking_code', $bookingCode)->exists());

            $paymentStatus = $validated['payment_status'] ?? 'paid';
            $status = $validated['status'] ?? ($paymentStatus === 'paid' ? 'confirmed' : 'pending');

            $booking = Booking::create([
                'booking_code' => $bookingCode,
                'receipt_number' => $paymentStatus === 'paid' ? Booking::generateReceiptNumber() : null,
                'room_id' => $room->id,
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'] ?? null,
                'guest_phone' => $validated['guest_phone'],
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'adults' => $validated['adults'] ?? 2,
                'children' => $validated['children'] ?? 0,
                'notes' => $validated['notes'] ?? null,
                'total_price' => $pricing['total'],
                'source' => $validated['source'] ?? 'manual',
                'status' => $status,
                'check_in_status' => 'pending_arrival',
                'payment_status' => $paymentStatus,
                'payment_method' => 'bca_transfer',
                'payment_type' => $validated['payment_type'] ?? 'Manual / Bank Transfer',
                'paid_at' => $paymentStatus === 'paid' ? now() : null,
                'payment_expires_at' => $paymentStatus === 'paid' ? null : now()->addMinutes(self::PAYMENT_WINDOW_MINUTES),
            ]);

            return response()->json([
                'booking' => $booking->fresh('room'),
                'message' => 'Reservation created successfully.',
            ], 201);
        });
    }

    /**
     * Update booking check-in or reservation status from Admin Dashboard / Central Bookings.
     * PATCH /admin/bookings/{booking}
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,confirmed,cancelled',
            'check_in_status' => 'nullable|in:pending_arrival,checked_in,checked_out',
            'payment_status' => 'nullable|in:unpaid,pending,paid,expired,failed',
        ]);

        if (isset($validated['payment_status']) && $validated['payment_status'] === 'paid') {
            if (!$booking->paid_at) {
                $validated['paid_at'] = now();
            }
            if (!$booking->receipt_number) {
                $validated['receipt_number'] = Booking::generateReceiptNumber();
            }
        }

        $booking->update(array_filter($validated, fn ($val) => !is_null($val)));

        return response()->json([
            'booking' => $booking->fresh('room'),
            'message' => 'Booking updated successfully.',
        ]);
    }

    /**
     * Full Admin Edit (Update guest details, room assignment, dates with conflict check & price recalculation,
     * payment status, and stay status).
     * PUT /admin/bookings/{booking}
     */
    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'guest_name' => 'required|string|max:255',
            'guest_email' => 'nullable|email|max:255',
            'guest_phone' => 'nullable|string|max:50',
            'check_in' => 'required|date',
            'check_out' => 'required|date|after:check_in',
            'adults' => 'nullable|integer|min:1|max:20',
            'children' => 'nullable|integer|min:0|max:15',
            'guests_count' => 'nullable|integer|min:1|max:20',
            'notes' => 'nullable|string|max:2000',
            'source' => 'nullable|in:direct,airbnb,tiket_com,booking_com,agoda,whatsapp,manual',
            'status' => 'nullable|in:pending,confirmed,checked_in,completed,cancelled',
            'check_in_status' => 'nullable|in:pending_arrival,checked_in,checked_out',
            'payment_status' => 'nullable|in:unpaid,pending,paid,expired,failed,refunded',
        ]);

        return DB::transaction(function () use ($validated, $booking) {
            Booking::expireOverduePending();

            /** @var Room $room */
            $room = Room::where('id', $validated['room_id'])->lockForUpdate()->firstOrFail();

            // Map unified e-commerce stay status to DB status + check_in_status columns
            $requestedStatus = $validated['status'] ?? $booking->status;
            $dbStatus = $booking->status;
            $dbCheckInStatus = $validated['check_in_status'] ?? $booking->check_in_status;

            if ($requestedStatus === 'checked_in') {
                $dbStatus = 'confirmed';
                $dbCheckInStatus = 'checked_in';
            } elseif ($requestedStatus === 'completed') {
                $dbStatus = 'confirmed';
                $dbCheckInStatus = 'checked_out';
            } elseif ($requestedStatus === 'confirmed') {
                $dbStatus = 'confirmed';
                if (!isset($validated['check_in_status']) && $dbCheckInStatus !== 'checked_in') {
                    $dbCheckInStatus = 'pending_arrival';
                }
            } elseif ($requestedStatus === 'pending') {
                $dbStatus = 'pending';
                $dbCheckInStatus = 'pending_arrival';
            } elseif ($requestedStatus === 'cancelled') {
                $dbStatus = 'cancelled';
            }

            // Map payment_status (support 'refunded' cleanly on SQLite)
            $requestedPayment = $validated['payment_status'] ?? $booking->payment_status;
            $paymentType = $booking->payment_type;
            if ($requestedPayment === 'refunded') {
                $dbPaymentStatus = 'expired';
                $paymentType = 'Refunded';
            } else {
                $dbPaymentStatus = $requestedPayment;
                if ($paymentType === 'Refunded' && $dbPaymentStatus === 'paid') {
                    $paymentType = 'Transfer Bank BCA - Terverifikasi Otomatis';
                }
            }

            // Check date conflicts excluding current booking if booking is active
            if ($dbStatus !== 'cancelled') {
                $isOverlap = Booking::where('room_id', $room->id)
                    ->where('id', '!=', $booking->id)
                    ->where(function ($query) {
                        $query->where('status', 'confirmed')
                            ->orWhere(function ($q) {
                                $q->where('status', 'pending')
                                    ->where(function ($exp) {
                                        $exp->whereNull('payment_expires_at')
                                            ->orWhere('payment_expires_at', '>', now());
                                    });
                            });
                    })
                    ->where(function ($query) use ($validated) {
                        $query->where('check_in', '<', $validated['check_out'])
                            ->where('check_out', '>', $validated['check_in']);
                    })
                    ->exists();

                if ($isOverlap) {
                    throw ValidationException::withMessages([
                        'check_in' => ['Tanggal yang dipilih bentrok dengan reservasi lain yang aktif di kamar ini.'],
                    ]);
                }
            }

            // Server-side price recalculation
            $pricing = $this->calculateStayPrice($room, $validated['check_in'], $validated['check_out'], true);

            $adults = $validated['adults'] ?? $validated['guests_count'] ?? $booking->adults ?? 2;
            $children = $validated['children'] ?? (isset($validated['guests_count']) && !isset($validated['adults']) ? 0 : ($booking->children ?? 0));

            $paidAt = $booking->paid_at;
            $receiptNumber = $booking->receipt_number;

            if ($dbPaymentStatus === 'paid') {
                $paidAt = $paidAt ?: now();
                $receiptNumber = $receiptNumber ?: Booking::generateReceiptNumber();
                if (!$paymentType || $paymentType === 'Awaiting Payment') {
                    $paymentType = 'Transfer Bank BCA - Terverifikasi Otomatis';
                }
            }

            $booking->update([
                'room_id' => $room->id,
                'guest_name' => $validated['guest_name'],
                'guest_email' => $validated['guest_email'] ?? null,
                'guest_phone' => $validated['guest_phone'] ?? null,
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'adults' => $adults,
                'children' => $children,
                'notes' => $validated['notes'] ?? null,
                'source' => $validated['source'] ?? $booking->source,
                'total_price' => $pricing['total'],
                'status' => $dbStatus,
                'check_in_status' => $dbCheckInStatus,
                'payment_status' => $dbPaymentStatus,
                'payment_type' => $paymentType,
                'paid_at' => $paidAt,
                'receipt_number' => $receiptNumber,
            ]);

            return response()->json([
                'booking' => $booking->fresh('room'),
                'pricing' => $pricing,
                'message' => 'Reservasi berhasil diperbarui.',
            ]);
        });
    }

    /**
     * Permanently delete a reservation from Central Bookings.
     * DELETE /admin/bookings/{booking}
     */
    public function destroy(Booking $booking)
    {
        $code = $booking->booking_code;
        $booking->delete();

        return response()->json([
            'deleted_code' => $code,
            'message' => "Reservasi #{$code} berhasil dihapus permanen.",
        ]);
    }

    /**
     * Automatically expire all overdue pending bookings and return updated list.
     * POST /admin/bookings/expire-overdue
     */
    public function expireOverdue()
    {
        $expiredCount = Booking::expireOverduePending();

        return response()->json([
            'expired_count' => $expiredCount,
            'bookings' => Booking::with('room')->latest()->get(),
            'server_time' => now()->toIso8601String(),
        ]);
    }

    /**
     * Midtrans payment notification webhook.
     * POST /api/midtrans/webhook
     */
    public function webhook(Request $request, MidtransService $midtransService)
    {
        $orderId = (string) $request->input('order_id', '');
        $statusCode = (string) $request->input('status_code', '');
        $grossAmount = (string) $request->input('gross_amount', '');
        $signatureKey = (string) $request->input('signature_key', '');
        $transactionStatus = (string) $request->input('transaction_status', '');
        $fraudStatus = (string) $request->input('fraud_status', 'accept');

        if (!$midtransService->verifySignature($orderId, $statusCode, $grossAmount, $signatureKey)) {
            return response()->json(['message' => 'Invalid Midtrans signature'], 403);
        }

        $booking = Booking::where('booking_code', $orderId)->first();
        if (!$booking) {
            return response()->json(['message' => 'Booking not found'], 404);
        }

        $updates = [
            'payment_type' => $request->input('payment_type', $booking->payment_type),
            'midtrans_transaction_id' => $request->input('transaction_id', $booking->midtrans_transaction_id),
        ];

        if ($transactionStatus === 'capture') {
            if ($fraudStatus === 'accept') {
                $updates['payment_status'] = 'paid';
                $updates['status'] = 'confirmed';
                $updates['paid_at'] = now();
                $updates['receipt_number'] = $booking->receipt_number ?: Booking::generateReceiptNumber();
            }
        } elseif ($transactionStatus === 'settlement') {
            $updates['payment_status'] = 'paid';
            $updates['status'] = 'confirmed';
            $updates['paid_at'] = now();
            $updates['receipt_number'] = $booking->receipt_number ?: Booking::generateReceiptNumber();
        } elseif ($transactionStatus === 'pending') {
            $updates['payment_status'] = 'pending';
            $updates['status'] = 'pending';
        } elseif (in_array($transactionStatus, ['cancel', 'deny', 'expire'], true)) {
            $updates['payment_status'] = 'expired';
            $updates['status'] = 'cancelled';
        }

        $booking->update($updates);

        return response()->json([
            'message' => 'Webhook processed',
            'booking_code' => $booking->booking_code,
            'receipt_number' => $booking->receipt_number,
            'status' => $booking->status,
            'payment_status' => $booking->payment_status,
        ]);
    }

    /**
     * Calculate stay price including active seasonal rate rules and service fee.
     */
    public function calculateStayPrice(Room $room, string $checkIn, string $checkOut, bool $includeServiceFee = true): array
    {
        $period = new \DatePeriod(
            new \DateTime($checkIn),
            new \DateInterval('P1D'),
            new \DateTime($checkOut)
        );

        $seasonalRules = SeasonalRate::where('is_active', true)
            ->where(function ($query) use ($room) {
                $query->whereNull('room_id')
                    ->orWhere('room_id', $room->id);
            })
            ->where('start_date', '<=', $checkOut)
            ->where('end_date', '>=', $checkIn)
            ->get();

        $basePrice = (float) $room->price_per_night;
        $nights = 0;
        $baseSubtotal = 0.0;
        $seasonalAdjustment = 0.0;

        foreach ($period as $date) {
            $nights++;
            $dateStr = $date->format('Y-m-d');
            $baseSubtotal += $basePrice;

            foreach ($seasonalRules as $rule) {
                $ruleStart = $rule->start_date->format('Y-m-d');
                $ruleEnd = $rule->end_date->format('Y-m-d');
                if ($dateStr >= $ruleStart && $dateStr <= $ruleEnd) {
                    $seasonalAdjustment += $basePrice * ((float) $rule->rate_adjustment_percent / 100.0);
                }
            }
        }

        $serviceFee = ($nights > 0 && $includeServiceFee) ? self::SERVICE_FEE : 0;
        $total = round($baseSubtotal + $seasonalAdjustment + $serviceFee);

        $items = [
            [
                'id' => 'ROOM-' . $room->id,
                'price' => (int) round($basePrice),
                'quantity' => $nights,
                'name' => "{$room->name} ({$nights} Nights)",
            ],
        ];

        if ((int) round($seasonalAdjustment) !== 0) {
            $items[] = [
                'id' => 'SEASONAL-ADJ',
                'price' => (int) round($seasonalAdjustment),
                'quantity' => 1,
                'name' => 'Seasonal Rate Adjustment',
            ];
        }

        if ($serviceFee > 0) {
            $items[] = [
                'id' => 'SERVICE-FEE',
                'price' => (int) $serviceFee,
                'quantity' => 1,
                'name' => 'Taxes & Hearth Service',
            ];
        }

        return [
            'nights' => $nights,
            'base_subtotal' => round($baseSubtotal),
            'seasonal_adjustment' => round($seasonalAdjustment),
            'service_fee' => $serviceFee,
            'total' => $total,
            'items' => $items,
        ];
    }
}
