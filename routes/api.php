<?php

use App\Http\Controllers\AiChatController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\BookingController;
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
