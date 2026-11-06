<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Room;
use App\Models\SeasonalRate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::with('images')->latest()->get();
        return Inertia::render('Admin/AdminDashboard', ['rooms' => $rooms]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_night' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
            'status' => 'nullable|in:AVAILABLE,OCCUPIED,MAINTENANCE',
            'size' => 'nullable|string|max:100',
        ]);

        $validated['slug'] = Str::slug($request->name) . '-' . Str::random(5);

        $room = Room::create($validated);

        if ($request->expectsJson()) {
            return response()->json(['room' => $room->fresh('images'), 'message' => 'Kamar berhasil ditambahkan!'], 201);
        }

        return redirect()->back()->with('success', 'Kamar berhasil ditambahkan!');
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_night' => 'required|numeric|min:0',
            'capacity' => 'nullable|integer|min:1',
            'status' => 'nullable|in:AVAILABLE,OCCUPIED,MAINTENANCE',
            'size' => 'nullable|string|max:100',
        ]);

        $room->update(array_filter($validated, fn ($v) => !is_null($v)));

        if ($request->expectsJson()) {
            return response()->json(['room' => $room->fresh('images'), 'message' => 'Kamar berhasil diperbarui!']);
        }

        return redirect()->back()->with('success', 'Kamar berhasil diperbarui!');
    }

    public function updateStatus(Request $request, Room $room)
    {
        $validated = $request->validate([
            'status' => 'required|in:AVAILABLE,OCCUPIED,MAINTENANCE',
        ]);

        $room->update(['status' => $validated['status']]);

        return response()->json([
            'room' => $room->fresh('images'),
            'message' => 'Status kamar berhasil diperbarui!',
        ]);
    }

    public function storeSeasonalRate(Request $request)
    {
        $validated = $request->validate([
            'rule_name' => 'required|string|max:255',
            'room_id' => 'nullable|exists:rooms,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'rate_adjustment_percent' => 'required|numeric|min:-90|max:500',
        ]);

        $rule = SeasonalRate::create([
            ...$validated,
            'is_active' => true,
        ]);

        return response()->json([
            'seasonal_rate' => $rule->fresh('room'),
            'message' => 'Seasonal rate rule saved successfully.',
        ], 201);
    }

    public function storeReview(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'nullable|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:2000',
        ]);

        $review = Review::create([
            'guest_name' => !empty($validated['guest_name']) ? $validated['guest_name'] : 'Verified Guest',
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'is_approved' => true,
        ]);

        return response()->json([
            'review' => $review,
            'message' => 'Thank you for sharing your review!',
        ], 201);
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return redirect()->back()->with('success', 'Kamar berhasil dihapus!');
    }
}
