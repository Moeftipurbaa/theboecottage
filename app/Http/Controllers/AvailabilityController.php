<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Room;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    // Mengambil daftar tanggal yang sudah ter-booking untuk 1 kamar
    public function getBookedDates(Room $room)
    {
        $bookedDates = Booking::where('room_id', $room->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->get(['check_in', 'check_out'])
            ->flatMap(function ($booking) {
                $checkIn = $booking->check_in instanceof \DateTimeInterface
                    ? $booking->check_in->format('Y-m-d')
                    : (string) $booking->check_in;
                $checkOut = $booking->check_out instanceof \DateTimeInterface
                    ? $booking->check_out->format('Y-m-d')
                    : (string) $booking->check_out;

                $period = new \DatePeriod(
                    new \DateTime($checkIn),
                    new \DateInterval('P1D'),
                    new \DateTime($checkOut)
                );

                $dates = [];
                foreach ($period as $date) {
                    $dates[] = $date->format('Y-m-d');
                }
                return $dates;
            })
            ->unique()
            ->values();

        return response()->json([
            'room_id' => $room->id,
            'room_status' => $room->status,
            'disabled_dates' => $bookedDates,
        ]);
    }

    // Validasi apakah range tanggal yang dipilih tamu valid (tidak bentrok)
    public function checkOverlap(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
        ]);

        $room = Room::findOrFail($request->room_id);
        if ($room->status === 'MAINTENANCE') {
            return response()->json([
                'available' => false,
                'message' => 'Kamar sedang dalam pemeliharaan (maintenance).',
            ]);
        }

        $isOverlap = Booking::where('room_id', $request->room_id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where(function ($query) use ($request) {
                $query->where('check_in', '<', $request->check_out)
                      ->where('check_out', '>', $request->check_in);
            })
            ->exists();

        return response()->json([
            'available' => !$isOverlap,
            'message' => $isOverlap ? 'Tanggal sudah dipesan, silakan pilih tanggal lain.' : 'Kamar tersedia!',
        ]);
    }
}
