<?php

namespace App\Http\Controllers;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Booking;
use App\Models\IcalLink;
use App\Models\Room;
use App\Services\IcalSyncService;
use DateTimeImmutable;
use Illuminate\Http\Request;
use Sabre\VObject\Component\VCalendar;

class IcalController extends Controller
{
    /**
     * Public Outbound iCal (.ics) Export Feed for Airbnb, Tiket.com, etc.
     * GET /ical/export/{room:slug}.ics
     */
    public function export(Request $request, Room $room)
    {
        $providedToken = (string) $request->query('token', '');
        $expectedToken = $room->export_token;
        $customTokens = $room->icalLinks()->whereNotNull('export_token')->pluck('export_token')->all();

        $validTokens = array_filter(array_unique([$expectedToken, ...$customTokens]));

        if ($providedToken !== '' && !in_array($providedToken, $validTokens, true)) {
            abort(403, 'Invalid iCal export token.');
        }

        $vcalendar = new VCalendar([
            'PRODID' => '-//The Boe Cottage//Channel Manager//EN',
            'VERSION' => '2.0',
            'CALSCALE' => 'GREGORIAN',
        ]);

        $bookings = Booking::where('room_id', $room->id)
            ->whereIn('status', ['confirmed', 'pending'])
            ->where('check_out', '>=', now()->subDays(30)->toDateString())
            ->orderBy('check_in')
            ->get();

        foreach ($bookings as $booking) {
            $checkInStr = $booking->check_in instanceof \DateTimeInterface
                ? $booking->check_in->format('Y-m-d')
                : substr((string) $booking->check_in, 0, 10);
            $checkOutStr = $booking->check_out instanceof \DateTimeInterface
                ? $booking->check_out->format('Y-m-d')
                : substr((string) $booking->check_out, 0, 10);

            $vevent = $vcalendar->add('VEVENT', [
                'UID' => "{$booking->booking_code}@theboecottage.com",
                'SUMMARY' => "Reserved - {$booking->booking_code}",
                'DESCRIPTION' => "Room: {$room->name} | Source: {$booking->source} | Status: {$booking->status}",
                'STATUS' => 'CONFIRMED',
            ]);

            $vevent->add('DTSTART', new DateTimeImmutable($checkInStr), ['VALUE' => 'DATE']);
            $vevent->add('DTEND', new DateTimeImmutable($checkOutStr), ['VALUE' => 'DATE']);
        }

        if ($room->status === 'MAINTENANCE') {
            $maintStart = now()->format('Y-m-d');
            $maintEnd = now()->addDays(30)->format('Y-m-d');

            $maintEvent = $vcalendar->add('VEVENT', [
                'UID' => "MAINTENANCE-{$room->slug}@theboecottage.com",
                'SUMMARY' => "Reserved - Maintenance ({$room->name})",
                'DESCRIPTION' => "Unit under scheduled maintenance",
                'STATUS' => 'CONFIRMED',
            ]);

            $maintEvent->add('DTSTART', new DateTimeImmutable($maintStart), ['VALUE' => 'DATE']);
            $maintEvent->add('DTEND', new DateTimeImmutable($maintEnd), ['VALUE' => 'DATE']);
        }

        $icsOutput = $vcalendar->serialize();

        return response($icsOutput, 200, [
            'Content-Type' => 'text/calendar; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$room->slug}.ics\"",
            'Cache-Control' => 'no-cache, no-store, must-revalidate',
        ]);
    }

    /**
     * Store or update an inbound OTA iCal link.
     * POST /admin/ical-links
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:ical_links,id',
            'room_id' => 'required|exists:rooms,id',
            'platform' => 'required|in:airbnb,tiket_com,booking_com,agoda,other',
            'url' => 'required|url|max:2000',
            'is_active' => 'nullable|boolean',
        ]);

        $room = Room::findOrFail($validated['room_id']);

        if (!empty($validated['id'])) {
            $icalLink = IcalLink::findOrFail($validated['id']);
            $icalLink->update([
                'room_id' => $room->id,
                'platform' => $validated['platform'],
                'url' => $validated['url'],
                'export_token' => $icalLink->export_token ?: $room->export_token,
                'is_active' => $validated['is_active'] ?? true,
            ]);
        } else {
            $icalLink = IcalLink::updateOrCreate(
                [
                    'room_id' => $room->id,
                    'platform' => $validated['platform'],
                    'url' => $validated['url'],
                ],
                [
                    'export_token' => $room->export_token,
                    'is_active' => $validated['is_active'] ?? true,
                ]
            );
        }

        return response()->json([
            'ical_link' => $icalLink->fresh('room'),
            'message' => 'OTA iCal channel link saved successfully.',
        ], 201);
    }

    /**
     * Delete an inbound OTA iCal link.
     * DELETE /admin/ical-links/{icalLink}
     */
    public function destroy(IcalLink $icalLink)
    {
        $icalLink->delete();

        return response()->json([
            'message' => 'OTA iCal channel link removed.',
        ]);
    }

    /**
     * Trigger immediate sync of all active OTA iCal links.
     * POST /admin/ical-links/sync
     */
    public function syncNow(IcalSyncService $syncService)
    {
        $summary = $syncService->syncAll();

        return response()->json([
            'summary' => $summary,
            'message' => "OTA Sync Complete: {$summary['imported']} imported, {$summary['updated']} updated, {$summary['cancelled']} cancelled ({$summary['errors']} errors).",
        ]);
    }

    /**
     * Localhost-only: current OTA sync status + outbound .ics feed URLs.
     * GET /api/ical/status
     */
    public function quickStatus()
    {
        abort_unless(HandleInertiaRequests::icalTestPanelEnabled(), 404);

        return response()->json($this->buildStatusPayload());
    }

    /**
     * Localhost-only: run IcalSyncService for all active links from the public test panel.
     * POST /api/ical/quick-sync
     */
    public function quickSync(IcalSyncService $syncService)
    {
        abort_unless(HandleInertiaRequests::icalTestPanelEnabled(), 404);

        $summary = $syncService->syncAll();

        return response()->json([
            'summary' => $summary,
            ...$this->buildStatusPayload(),
        ]);
    }

    private function buildStatusPayload(): array
    {
        $links = IcalLink::with('room:id,name,slug')->orderBy('room_id')->get();
        $lastSynced = $links->max('last_synced_at');

        return [
            'synced_at' => now()->toIso8601String(),
            'last_synced_at' => $lastSynced?->toIso8601String(),
            'active_links' => $links->where('is_active', true)->count(),
            'inbound_links' => $links->map(fn (IcalLink $link) => [
                'id' => $link->id,
                'room' => $link->room?->name,
                'platform' => $link->platform,
                'is_active' => $link->is_active,
                'last_synced_at' => $link->last_synced_at?->toIso8601String(),
            ])->values(),
            'export_feeds' => Room::orderBy('id')->get()->map(fn (Room $room) => [
                'room' => $room->name,
                'slug' => $room->slug,
                'url' => $room->export_url,
                'upcoming_bookings' => $room->bookings()
                    ->whereIn('status', ['confirmed', 'pending'])
                    ->where('check_out', '>=', now()->toDateString())
                    ->count(),
            ])->values(),
        ];
    }
}

