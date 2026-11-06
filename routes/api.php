<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\RoomController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public Read / Availability Endpoints (60 requests per minute)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/rooms/{room}/booked-dates', [AvailabilityController::class, 'getBookedDates']);
    Route::post('/check-availability', [AvailabilityController::class, 'checkOverlap']);
    Route::post('/midtrans/webhook', [BookingController::class, 'webhook']);
});

// Public Mutation Endpoints: Booking Creation & Guest Reviews (15 requests per minute)
Route::middleware('throttle:15,1')->group(function () {
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/reviews', [RoomController::class, 'storeReview']);
});
