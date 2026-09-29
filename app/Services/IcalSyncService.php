<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\IcalLink;
use Sabre\VObject\Reader;
use Illuminate\Support\Str;

class IcalSyncService
{
    public function sync(IcalLink $icalLink)
    {
        // 1. Ambil isi file .ics dari URL Airbnb / Booking.com
        $icsContent = @file_get_contents($icalLink->url);
        if (!$icsContent) {
            return false;
        }

        // 2. Parse file .ics menggunakan Sabre VObject
        $vcalendar = Reader::read($icsContent);

        foreach ($vcalendar->VEVENT as $event) {
            $startDate = $event->DTSTART->getDateTime()->format('Y-m-d');
            $endDate = $event->DTEND->getDateTime()->format('Y-m-d');
            $summary = (string) $event->SUMMARY;

            // Pastikan event bukan cancelled / blocked biasa jika ada flag khusus
            $bookingCode = 'OTA-' . Str::upper(Str::random(6));

            // 3. Simpan atau update ke tabel bookings jika tanggal belum terdaftar
            Booking::firstOrCreate(
                [
                    'room_id' => $icalLink->room_id,
                    'check_in' => $startDate,
                    'check_out' => $endDate,
                ],
                [
                    'booking_code' => $bookingCode,
                    'guest_name' => 'Reserved (' . ucfirst($icalLink->platform) . ')',
                    'guest_email' => null,
                    'guest_phone' => null,
                    'total_price' => 0,
                    'source' => $icalLink->platform === 'airbnb' ? 'airbnb' : 'booking_com',
                    'status' => 'confirmed',
                ]
            );
        }

        // 4. Update timestamp terakhir diproses
        $icalLink->update(['last_synced_at' => now()]);

        return true;
    }
}