<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\IcalController;
use App\Http\Controllers\RoomController;
use App\Models\Booking;
use App\Models\IcalLink;
use App\Models\Review;
use App\Models\Room;
use App\Models\SeasonalRate;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'rooms' => Room::with('images')->orderBy('id')->get(),
        'reviews' => Review::where('is_approved', true)->latest()->get(),
    ]);
})->name('home');

Route::get('/login', function () {
    return redirect('/?login=1');
})->name('login');

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:15,1');
Route::post('/logout', [AuthController::class, 'logout']);

Route::redirect('/cek-booking', '/reservation');

Route::get('/reservation', function () {
    return Inertia::render('Reservation', [
        'rooms' => Room::with('images')->orderBy('id')->get(),
        'seasonalRates' => SeasonalRate::where('is_active', true)->orderBy('start_date')->get(),
    ]);
})->name('reservation');

// Public Outbound iCal (.ics) Export Feed for Airbnb & Tiket.com (60 requests per minute)
Route::get('/ical/export/{room:slug}.ics', [IcalController::class, 'export'])
    ->middleware('throttle:60,1')
    ->name('ical.export');

Route::middleware('auth')->group(function () {
    Route::get('/admin-dashboard', function () {
        $today = now()->toDateString();
        $rooms = Room::with([
            'images',
            'bookings' => function ($query) use ($today) {
                $query->whereIn('status', ['confirmed', 'pending'])
                    ->where('check_out', '>=', $today)
                    ->orderBy('check_in');
            },
        ])->orderBy('id')->get();

        $activeBookings = Booking::whereIn('status', ['confirmed', 'pending'])->get();
        $monthlyRevenue = (float) Booking::whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) {
                $query->where('payment_status', 'paid')
                    ->orWhere('status', 'confirmed');
            })
            ->sum('total_price');

        $totalRooms = max(1, $rooms->count());
        $occupiedCount = $rooms->filter(function (Room $room) use ($today) {
            if ($room->status === 'OCCUPIED') {
                return true;
            }
            return $room->bookings->contains(function (Booking $b) use ($today) {
                $in = $b->check_in instanceof \DateTimeInterface ? $b->check_in->format('Y-m-d') : (string) $b->check_in;
                $out = $b->check_out instanceof \DateTimeInterface ? $b->check_out->format('Y-m-d') : (string) $b->check_out;
                return $in <= $today && $out > $today;
            });
        })->count();

        $occupancyPercent = round(($occupiedCount / $totalRooms) * 100, 1);

        $arrivalsToday = Booking::with('room')
            ->whereIn('status', ['confirmed', 'pending'])
            ->whereDate('check_in', $today)
            ->orderBy('id')
            ->get();

        $revenueTarget = 150000000;
        $targetPercent = min(100, (int) round(($monthlyRevenue / $revenueTarget) * 100));

        return Inertia::render('Admin/AdminDashboard', [
            'rooms' => $rooms,
            'arrivalsToday' => $arrivalsToday,
            'seasonalRates' => SeasonalRate::with('room')->where('is_active', true)->latest()->get(),
            'icalLinks' => IcalLink::with('room')->latest()->get(),
            'dashboardStats' => [
                'revenue' => [
                    'amount' => 'IDR ' . number_format($monthlyRevenue / 1000000, 1) . 'M',
                    'raw_amount' => $monthlyRevenue,
                    'target' => $targetPercent . '%',
                    'bookings' => $activeBookings->count(),
                ],
                'occupancy' => [
                    'amount' => $occupancyPercent . '%',
                    'units' => "{$occupiedCount} of {$rooms->count()} units",
                    'percent' => $occupancyPercent,
                ],
                'arrivals' => [
                    'parties' => $arrivalsToday->count(),
                    'guests' => (int) $arrivalsToday->sum(fn ($b) => (int) $b->adults + (int) $b->children),
                    'pending' => $arrivalsToday->where('check_in_status', 'pending_arrival')->count(),
                ],
            ],
        ]);
    })->name('admin.dashboard');

    Route::get('/central-bookings', function () {
        return Inertia::render('Admin/CentralBookings', [
            'bookings' => Booking::with('room')->latest()->get(),
            'rooms' => Room::with('images')->orderBy('id')->get(),
        ]);
    })->name('admin.bookings');

    // Admin AJAX / Mutation Endpoints
    Route::put('/admin/rooms/{room}', [RoomController::class, 'update']);
    Route::patch('/admin/rooms/{room}/status', [RoomController::class, 'updateStatus']);
    Route::post('/admin/seasonal-rates', [RoomController::class, 'storeSeasonalRate']);
    Route::post('/admin/bookings', [BookingController::class, 'storeManual']);
    Route::patch('/admin/bookings/{booking}', [BookingController::class, 'updateStatus']);

    // Admin OTA iCal Channel Endpoints
    Route::post('/admin/ical-links', [IcalController::class, 'store']);
    Route::delete('/admin/ical-links/{icalLink}', [IcalController::class, 'destroy']);
    Route::post('/admin/ical-links/sync', [IcalController::class, 'syncNow']);
});
