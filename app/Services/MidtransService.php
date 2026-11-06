<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MidtransService
{
    /**
     * Generate a Midtrans Snap token for a booking.
     */
    public function createSnapToken(Booking $booking, Room $room, array $itemDetails = []): string
    {
        $serverKey = (string) config('services.midtrans.server_key');
        $isProduction = (bool) config('services.midtrans.is_production', false);

        if (empty($serverKey)) {
            Log::warning('MIDTRANS_SERVER_KEY is not configured. Returning local development fallback snap_token.', [
                'booking_code' => $booking->booking_code,
            ]);

            return 'MOCK-SNAP-' . $booking->booking_code;
        }

        $endpoint = $isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        $grossAmount = (int) round((float) $booking->total_price);

        $payload = [
            'transaction_details' => [
                'order_id' => $booking->booking_code,
                'gross_amount' => $grossAmount,
            ],
            'customer_details' => [
                'first_name' => $booking->guest_name,
                'email' => $booking->guest_email,
                'phone' => $booking->guest_phone ?? '',
            ],
            'credit_card' => [
                'secure' => (bool) config('services.midtrans.is_3ds', true),
            ],
        ];

        if (!empty($itemDetails)) {
            $payload['item_details'] = $itemDetails;
        }

        $authHeader = 'Basic ' . base64_encode($serverKey . ':');

        $response = Http::timeout(20)
            ->withHeaders([
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
                'Authorization' => $authHeader,
            ])
            ->post($endpoint, $payload);

        if (!$response->successful() || !$response->json('token')) {
            Log::error('Midtrans Snap API error', [
                'status' => $response->status(),
                'body' => $response->json() ?? $response->body(),
            ]);

            throw new RuntimeException(
                $response->json('error_messages.0') ?? 'Failed to initialize Midtrans Snap payment.'
            );
        }

        return (string) $response->json('token');
    }

    /**
     * Verify Midtrans webhook SHA-512 signature.
     */
    public function verifySignature(string $orderId, string $statusCode, string $grossAmount, string $signatureKey): bool
    {
        $serverKey = (string) config('services.midtrans.server_key');
        $expectedSignature = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($expectedSignature, $signatureKey);
    }
}

