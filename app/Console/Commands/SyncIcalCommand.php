<?php

namespace App\Console\Commands;

use App\Models\IcalLink;
use App\Services\IcalSyncService;
use Illuminate\Console\Command;

class SyncIcalCommand extends Command
{
    protected $signature = 'sync:ical';
    protected $description = 'Sync kalender booking dari Airbnb, Tiket.com & OTA lainnya via iCal';

    public function handle(IcalSyncService $syncService): int
    {
        $links = IcalLink::where('is_active', true)->get();
        $this->info("Memulai sinkronisasi " . $links->count() . " link iCal aktif...");

        $totals = [
            'imported' => 0,
            'updated' => 0,
            'cancelled' => 0,
            'errors' => 0,
        ];

        foreach ($links as $link) {
            $this->info("Syncing room ID: {$link->room_id} ({$link->platform})...");
            $result = $syncService->sync($link);

            $totals['imported'] += $result['imported'];
            $totals['updated'] += $result['updated'];
            $totals['cancelled'] += $result['cancelled'];
            $totals['errors'] += $result['errors'];

            if ($result['errors'] === 0) {
                $this->info("Berhasil sync! (+{$result['imported']} baru, {$result['updated']} diperbarui, {$result['cancelled']} dibatalkan)");
            } else {
                $this->error("Terdapat {$result['errors']} kendala saat mengambil/memproses URL.");
            }
        }

        $this->info("Proses sync selesai! Total: {$totals['imported']} imported, {$totals['updated']} updated, {$totals['cancelled']} cancelled, {$totals['errors']} errors.");

        return self::SUCCESS;
    }
}
