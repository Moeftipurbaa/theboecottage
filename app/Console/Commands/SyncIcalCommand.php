<?php

namespace App\Console\Commands;

use App\Models\IcalLink;
use App\Services\IcalSyncService;
use Illuminate\Console\Command;

class SyncIcalCommand extends Command
{
    protected $signature = 'sync:ical';
    protected $description = 'Sync kalender booking dari Airbnb & Booking.com via iCal';

    public function handle(IcalSyncService $syncService)
    {
        $links = IcalLink::all();
        $this->info("Memulai sinkronisasi " . $links->count() . " link iCal...");

        foreach ($links as $link) {
            $this->info("Syncing room ID: {$link->room_id} ({$link->platform})...");
            $success = $syncService->sync($link);

            if ($success) {
                $this->info("Berhasil sync!");
            } else {
                $this->error("Gagal mengambil data dari URL.");
            }
        }

        $this->info("Proses sync selesai!");
    }
}