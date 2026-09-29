<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AvailabilityController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/rooms/{room}/booked-dates', [AvailabilityController::class, 'getBookedDates']);
Route::post('/check-availability', [AvailabilityController::class, 'checkOverlap']);