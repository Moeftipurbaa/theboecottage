<?php

use App\Models\Booking;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('bookings:expire-unpaid', function () {
    $expiredCount = Booking::where('source', 'direct')
        ->where('status', 'pending')
        ->where('payment_status', 'unpaid')
        ->where('created_at', '<', now()->subHours(4))
        ->update([
            'status' => 'cancelled',
            'payment_status' => 'expired',
        ]);

    $this->info("Expired {$expiredCount} unpaid pending direct booking(s).");
})->purpose('Automatically cancel unpaid direct bookings older than 4 hours');

Schedule::command('sync:ical')->everyFifteenMinutes()->withoutOverlapping();
Schedule::command('bookings:expire-unpaid')->everyFiveMinutes()->withoutOverlapping();
