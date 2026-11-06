<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\IcalLink;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Sabre\VObject\Reader;
use Throwable;

class IcalSyncService
{
    /**
     * Sync all active iCal links and return an aggregated summary.
     *
     * @return array{imported: int, updated: int, cancelled: int, errors: int}
     */
    public function syncAll(): array
    {
        $links = IcalLink::where('is_active', true)->get();

        $totals = [
            'imported' => 0,
            'updated' => 0,
            'cancelled' => 0,
            'errors' => 0,
        ];

        foreach ($links as $link) {
            $result = $this->sync($link);
            $totals['imported'] += $result['imported'];
            $totals['updated'] += $result['updated'];
            $totals['cancelled'] += $result['cancelled'];
            $totals['errors'] += $result['errors'];
        }

        return $totals;
    }

    /**
     * Sync a single iCal link from Airbnb, Tiket.com, Booking.com, etc.
     *
     * @return array{imported: int, updated: int, cancelled: int, errors: int}
     */
    public function sync(IcalLink $icalLink): array
    {
        $summary = [
            'imported' => 0,
            'updated' => 0,
            'cancelled' => 0,
            'errors' => 0,
        ];

        try {
            $response = Http::timeout(15)
                ->withUserAgent('Mozilla/5.0 (compatible; TheBoeCottageChannelManager/1.0)')
                ->get($icalLink->url);

            if (!$response->successful() || empty(trim($response->body()))) {
                $summary['errors']++;
                return $summary;
            }

            $icsContent = $response->body();
            $vcalendar = Reader::read($icsContent);
        } catch (Throwable $e) {
            Log::warning('Failed to fetch or parse iCal feed', [
                'ical_link_id' => $icalLink->id,
                'url' => $icalLink->url,
                'error' => $e->getMessage(),
            ]);
            $summary['errors']++;
            return $summary;
        }

        $source = $this->mapPlatformToSource($icalLink->platform);
        $seenUids = [];

        if (isset($vcalendar->VEVENT)) {
            foreach ($vcalendar->VEVENT as $event) {
                try {
                    if (!isset($event->DTSTART) || !isset($event->DTEND)) {
                        continue;
                    }

                    $eventStatus = isset($event->STATUS) ? strtoupper(trim((string) $event->STATUS)) : 'CONFIRMED';
                    if ($eventStatus === 'CANCELLED') {
                        continue;
                    }

                    $startDate = $event->DTSTART->getDateTime()->format('Y-m-d');
                    $endDate = $event->DTEND->getDateTime()->format('Y-m-d');

                    if ($endDate <= $startDate) {
                        continue;
                    }

                    $rawUid = isset($event->UID) ? trim((string) $event->UID) : '';
                    $externalUid = $rawUid !== ''
                        ? $rawUid
                        : md5($icalLink->id . '-' . $startDate . '-' . $endDate);

                    $seenUids[] = $externalUid;

                    $eventSummary = isset($event->SUMMARY) ? trim((string) $event->SUMMARY) : '';
                    $platformLabel = $this->formatPlatformLabel($icalLink->platform);
                    $guestName = ($eventSummary !== '' && !in_array(strtolower($eventSummary), ['reserved', 'not available', 'closed - not available'], true))
                        ? "{$eventSummary} ({$platformLabel})"
                        : "Reserved ({$platformLabel})";

                    $existing = Booking::where('room_id', $icalLink->room_id)
                        ->where('source', $source)
                        ->where('external_uid', $externalUid)
                        ->first();

                    $bookingCode = $existing?->booking_code;
                    if (!$bookingCode) {
                        do {
                            $bookingCode = 'OTA-' . Str::upper(Str::random(6));
                        } while (Booking::where('booking_code', $bookingCode)->exists());
                    }

                    $booking = Booking::updateOrCreate(
                        [
                            'room_id' => $icalLink->room_id,
                            'source' => $source,
                            'external_uid' => $externalUid,
                        ],
                        [
                            'booking_code' => $bookingCode,
                            'guest_name' => $guestName,
                            'check_in' => $startDate,
                            'check_out' => $endDate,
                            'total_price' => $existing?->total_price ?? 0,
                            'status' => 'confirmed',
                            'payment_status' => 'paid',
                            'payment_type' => $platformLabel,
                            'paid_at' => $existing?->paid_at ?? now(),
                        ]
                    );

                    if ($booking->wasRecentlyCreated) {
                        $summary['imported']++;
                    } else {
                        $summary['updated']++;
                    }
                } catch (Throwable $e) {
                    Log::warning('Error processing individual VEVENT during iCal sync', [
                        'ical_link_id' => $icalLink->id,
                        'error' => $e->getMessage(),
                    ]);
                    $summary['errors']++;
                }
            }
        }

        // Handle OTA Cancellations for future bookings from this source & room whose external_uid disappeared
        $today = now()->toDateString();
        $cancelQuery = Booking::where('room_id', $icalLink->room_id)
            ->where('source', $source)
            ->where('check_out', '>=', $today)
            ->whereNotNull('external_uid')
            ->where('status', '!=', 'cancelled');

        if (!empty($seenUids)) {
            $cancelQuery->whereNotIn('external_uid', $seenUids);
        }

        $cancelledCount = $cancelQuery->update(['status' => 'cancelled']);
        $summary['cancelled'] += $cancelledCount;

        $icalLink->update(['last_synced_at' => now()]);

        return $summary;
    }

    public function mapPlatformToSource(string $platform): string
    {
        return match ($platform) {
            'airbnb' => 'airbnb',
            'tiket_com' => 'tiket_com',
            'booking_com' => 'booking_com',
            'agoda' => 'agoda',
            default => 'manual',
        };
    }

    private function formatPlatformLabel(string $platform): string
    {
        return match ($platform) {
            'airbnb' => 'Airbnb',
            'tiket_com' => 'Tiket.com',
            'booking_com' => 'Booking.com',
            'agoda' => 'Agoda',
            default => 'OTA',
        };
    }
}
