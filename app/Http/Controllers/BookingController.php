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

    /**
     * Atomic guest booking creation + Midtrans Snap token generation.
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
        ]);

        return DB::transaction(function () use ($validated, $midtransService) {
            /** @var Room $room */
            $room = Room::where('id', $validated['room_id'])->lockForUpdate()->firstOrFail();

            if ($room->status === 'MAINTENANCE') {
                throw ValidationException::withMessages([
                    'room_id' => ['This cottage is currently undergoing maintenance and cannot be booked.'],
                ]);
            }

            $isOverlap = Booking::where('room_id', $room->id)
                ->whereIn('status', ['confirmed', 'pending'])
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
            ]);

            $snapToken = $midtransService->createSnapToken($booking, $room, $pricing['items']);
            $booking->update(['snap_token' => $snapToken]);

            return response()->json([
                'booking' => $booking->fresh('room'),
                'snap_token' => $snapToken,
                'pricing' => $pricing,
            ], 201);
        });
    }

    /**
     * Admin manual reservation creation (Central Bookings).
     * POST /api/admin/bookings
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
                'payment_type' => $validated['payment_type'] ?? 'Manual / Bank Transfer',
                'paid_at' => $paymentStatus === 'paid' ? now() : null,
            ]);

            return response()->json([
                'booking' => $booking->fresh('room'),
                'message' => 'Reservation created successfully.',
            ], 201);
        });
    }

    /**
     * Update booking check-in or reservation status from Admin Dashboard / Central Bookings.
     * PATCH /api/admin/bookings/{booking}
     */
    public function updateStatus(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'nullable|in:pending,confirmed,cancelled',
            'check_in_status' => 'nullable|in:pending_arrival,checked_in,checked_out',
            'payment_status' => 'nullable|in:unpaid,pending,paid,expired,failed',
        ]);

        if (isset($validated['payment_status']) && $validated['payment_status'] === 'paid' && !$booking->paid_at) {
            $validated['paid_at'] = now();
        }

        $booking->update(array_filter($validated, fn ($val) => !is_null($val)));

        return response()->json([
            'booking' => $booking->fresh('room'),
            'message' => 'Booking updated successfully.',
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
            }
        } elseif ($transactionStatus === 'settlement') {
            $updates['payment_status'] = 'paid';
            $updates['status'] = 'confirmed';
            $updates['paid_at'] = now();
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

