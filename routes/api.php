<?php

use App\Http\Controllers\AiChatController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\IcalController;
use App\Http\Controllers\RoomController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// AI Virtual Concierge Chatbot Endpoint (30 requests per minute)
Route::middleware('throttle:30,1')->group(function () {
    Route::post('/ai-chat', [AiChatController::class, 'chat']);
});

// Public Read / Availability & Payment Status Polling Endpoints (60 requests per minute)
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/rooms/{room}/booked-dates', [AvailabilityController::class, 'getBookedDates']);
    Route::post('/check-availability', [AvailabilityController::class, 'checkOverlap']);
    Route::get('/bookings/{booking:booking_code}/status', [BookingController::class, 'checkStatus']);
    Route::post('/midtrans/webhook', [BookingController::class, 'webhook']);
});

// Public Mutation Endpoints: Booking Creation, BCA Payment Simulation & Guest Reviews (15 requests per minute)
Route::middleware('throttle:15,1')->group(function () {
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::post('/bookings/{booking:booking_code}/simulate-pay', [BookingController::class, 'simulatePay']);
    Route::post('/reviews', [RoomController::class, 'storeReview']);
});

// Localhost-only iCal test panel (returns 404 outside APP_ENV=local/testing)
Route::middleware('throttle:10,1')->group(function () {
    Route::get('/ical/status', [IcalController::class, 'quickStatus']);
    Route::post('/ical/quick-sync', [IcalController::class, 'quickSync']);
});
