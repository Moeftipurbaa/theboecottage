<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RoomController extends Controller
{
    public function index()
    {
        $rooms = Room::with('images')->latest()->get();
        return Inertia::render('Admin/Rooms/Index', ['rooms' => $rooms]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_night' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
        ]);

        $validated['slug'] = Str::slug($request->name) . '-' . Str::random(5);

        Room::create($validated);

        return redirect()->back()->with('success', 'Kamar berhasil ditambahkan!');
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price_per_night' => 'required|numeric|min:0',
            'capacity' => 'required|integer|min:1',
        ]);

        $room->update($validated);

        return redirect()->back()->with('success', 'Kamar berhasil diperbarui!');
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return redirect()->back()->with('success', 'Kamar berhasil dihapus!');
    }
}
