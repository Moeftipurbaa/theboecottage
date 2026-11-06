<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\IcalLink;
use App\Models\Review;
use App\Models\Room;
use App\Models\SeasonalRate;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * End-to-end feature suite for The Boe Cottage booking engine,
 * Midtrans payments, admin panel and OTA iCal channel manager.
 */
class BoeCottageE2ETest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    private const SERVICE_FEE = 370000;

    protected function setUp(): void
    {
        parent::setUp();

        // Ensure Midtrans runs in local fallback mode (no external HTTP calls) unless a test overrides it.
        config([
            'services.midtrans.server_key' => '',
            'services.midtrans.is_production' => false,
        ]);

        // Remove seeded seasonal rules so price assertions are deterministic.
        SeasonalRate::query()->delete();
    }

    private function daisy(): Room
    {
        return Room::where('slug', 'daisy-room')->firstOrFail();
    }

    private function lily(): Room
    {
        return Room::where('slug', 'lily-room')->firstOrFail();
    }

    private function admin(): User
    {
        return User::where('email', 'admin@theboecottage.com')->firstOrFail();
    }

    private function bookingPayload(Room $room, int $startOffset, int $endOffset, array $overrides = []): array
    {
        return array_merge([
            'room_id' => $room->id,
            'check_in' => now()->addDays($startOffset)->toDateString(),
            'check_out' => now()->addDays($endOffset)->toDateString(),
            'adults' => 2,
            'children' => 0,
            'guest_name' => 'QA Automation Guest',
            'guest_email' => 'qa.guest@example.com',
            'guest_phone' => '+62 811-0000-0000',
            'notes' => 'Automated E2E test booking.',
        ], $overrides);
    }

    // ------------------------------------------------------------------
    // 1. Public Pages & Inertia Props
    // ------------------------------------------------------------------

    public function test_home_page_renders_with_seeded_rooms_and_reviews(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Welcome')
                ->has('rooms', 2)
                ->where('rooms.0.name', 'Daisy Room')
                ->where('rooms.0.slug', 'daisy-room')
                ->where('rooms.1.name', 'Lily Room')
                ->where('rooms.1.slug', 'lily-room')
                ->has('rooms.0.images', 4)
                ->has('reviews', 3)
            );
    }

    public function test_reservation_page_renders_with_seeded_rooms(): void
    {
        $this->get('/reservation')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Reservation')
                ->has('rooms', 2)
                ->where('rooms.0.name', 'Daisy Room')
                ->where('rooms.1.name', 'Lily Room')
                ->has('seasonalRates')
            );
    }

    // ------------------------------------------------------------------
    // 2. Review Submission
    // ------------------------------------------------------------------

    public function test_guest_can_submit_review(): void
    {
        $this->postJson('/api/reviews', [
            'guest_name' => 'QA Reviewer',
            'rating' => 5,
            'comment' => 'Automated review: misty mornings, perfect stay.',
        ])->assertCreated()->assertJsonPath('review.guest_name', 'QA Reviewer');

        $this->assertDatabaseHas('reviews', [
            'guest_name' => 'QA Reviewer',
            'rating' => 5,
            'is_approved' => true,
        ]);
        $this->assertSame(4, Review::count());
    }

    public function test_review_validation_rejects_invalid_rating(): void
    {
        $this->postJson('/api/reviews', ['rating' => 9, 'comment' => 'x'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['rating']);
    }

    // ------------------------------------------------------------------
    // 3. Atomic Booking & Midtrans Fallback
    // ------------------------------------------------------------------

    public function test_guest_booking_is_created_with_server_side_price_and_snap_token(): void
    {
        $room = $this->daisy();

        $response = $this->postJson('/api/bookings', $this->bookingPayload($room, 10, 12))
            ->assertCreated();

        $expectedTotal = (2 * 3000000) + self::SERVICE_FEE; // 6,370,000

        $code = $response->json('booking.booking_code');
        $this->assertMatchesRegularExpression('/^BOE-\d{8}-[A-Z0-9]{4}$/', $code);
        $this->assertSame('MOCK-SNAP-' . $code, $response->json('snap_token'));
        $this->assertSame(2, $response->json('pricing.nights'));
        $this->assertEquals(self::SERVICE_FEE, $response->json('pricing.service_fee'));
        $this->assertEquals($expectedTotal, $response->json('pricing.total'));

        $booking = Booking::where('booking_code', $code)->firstOrFail();
        $this->assertSame('pending', $booking->status);
        $this->assertSame('unpaid', $booking->payment_status);
        $this->assertSame('direct', $booking->source);
        $this->assertEquals($expectedTotal, (float) $booking->total_price);
        $this->assertSame('MOCK-SNAP-' . $code, $booking->snap_token);
    }

    public function test_booking_price_applies_active_seasonal_rate(): void
    {
        $room = $this->lily();
        SeasonalRate::create([
            'rule_name' => 'QA Peak +20%',
            'room_id' => $room->id,
            'start_date' => now()->addDays(30)->toDateString(),
            'end_date' => now()->addDays(31)->toDateString(),
            'rate_adjustment_percent' => 20,
            'is_active' => true,
        ]);

        // 3 nights: day 30 & 31 adjusted, day 32 base.
        $response = $this->postJson('/api/bookings', $this->bookingPayload($room, 30, 33))->assertCreated();

        $expected = (3 * 3300000) + (2 * 3300000 * 0.20) + self::SERVICE_FEE;
        $this->assertEquals($expected, $response->json('pricing.total'));
    }

    public function test_booking_uses_midtrans_snap_api_when_server_key_configured(): void
    {
        config(['services.midtrans.server_key' => 'SB-Mid-server-QA']);
        Http::fake([
            'app.sandbox.midtrans.com/*' => Http::response(['token' => 'REAL-SNAP-TOKEN-123', 'redirect_url' => 'https://x'], 201),
        ]);

        $this->postJson('/api/bookings', $this->bookingPayload($this->daisy(), 40, 41))
            ->assertCreated()
            ->assertJsonPath('snap_token', 'REAL-SNAP-TOKEN-123');

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'app.sandbox.midtrans.com/snap/v1/transactions')
                && $request->header('Authorization')[0] === 'Basic ' . base64_encode('SB-Mid-server-QA:')
                && $request['transaction_details']['gross_amount'] === 3000000 + self::SERVICE_FEE;
        });
    }

    public function test_booking_validation_rejects_past_dates(): void
    {
        $this->postJson('/api/bookings', $this->bookingPayload($this->daisy(), -3, -1))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['check_in']);
    }

    // ------------------------------------------------------------------
    // 4. Anti Double-Booking & Date Blocking
    // ------------------------------------------------------------------

    public function test_overlapping_booking_is_rejected_and_dates_are_blocked(): void
    {
        $room = $this->daisy();

        $this->postJson('/api/bookings', $this->bookingPayload($room, 10, 13))->assertCreated();

        // Overlapping range (starts inside existing stay)
        $this->postJson('/api/bookings', $this->bookingPayload($room, 12, 15, ['guest_email' => 'other@example.com']))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['check_in']);

        // Enveloping range
        $this->postJson('/api/bookings', $this->bookingPayload($room, 9, 14))
            ->assertStatus(422);

        // Back-to-back (check-in on previous check-out day) must be allowed
        $this->postJson('/api/bookings', $this->bookingPayload($room, 13, 14))->assertCreated();

        // Same dates in the other room must be allowed
        $this->postJson('/api/bookings', $this->bookingPayload($this->lily(), 10, 13))->assertCreated();

        $dates = $this->getJson("/api/rooms/{$room->id}/booked-dates")
            ->assertOk()
            ->json('disabled_dates');

        foreach ([10, 11, 12, 13] as $offset) {
            $this->assertContains(now()->addDays($offset)->toDateString(), $dates);
        }
        $this->assertNotContains(now()->addDays(14)->toDateString(), $dates);

        $this->postJson('/api/check-availability', [
            'room_id' => $room->id,
            'check_in' => now()->addDays(11)->toDateString(),
            'check_out' => now()->addDays(12)->toDateString(),
        ])->assertOk()->assertJsonPath('available', false);
    }

    // ------------------------------------------------------------------
    // 5. Midtrans Webhook Verification
    // ------------------------------------------------------------------

    public function test_signed_settlement_webhook_confirms_booking(): void
    {
        $code = $this->postJson('/api/bookings', $this->bookingPayload($this->daisy(), 20, 22))
            ->assertCreated()
            ->json('booking.booking_code');

        $serverKey = 'SB-Mid-server-QA-WEBHOOK';
        config(['services.midtrans.server_key' => $serverKey]);

        $statusCode = '200';
        $grossAmount = '6370000.00';

        $payload = [
            'order_id' => $code,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'transaction_status' => 'settlement',
            'transaction_id' => 'QA-TRX-0001',
            'payment_type' => 'bank_transfer',
            'fraud_status' => 'accept',
            'signature_key' => hash('sha512', $code . $statusCode . $grossAmount . $serverKey),
        ];

        $this->postJson('/api/midtrans/webhook', $payload)
            ->assertOk()
            ->assertJsonPath('status', 'confirmed')
            ->assertJsonPath('payment_status', 'paid');

        $booking = Booking::where('booking_code', $code)->firstOrFail();
        $this->assertSame('confirmed', $booking->status);
        $this->assertSame('paid', $booking->payment_status);
        $this->assertSame('QA-TRX-0001', $booking->midtrans_transaction_id);
        $this->assertNotNull($booking->paid_at);
    }

    public function test_webhook_with_invalid_signature_is_rejected(): void
    {
        $code = $this->postJson('/api/bookings', $this->bookingPayload($this->daisy(), 20, 21))
            ->json('booking.booking_code');

        config(['services.midtrans.server_key' => 'SB-Mid-server-QA-WEBHOOK']);

        $this->postJson('/api/midtrans/webhook', [
            'order_id' => $code,
            'status_code' => '200',
            'gross_amount' => '3370000.00',
            'transaction_status' => 'settlement',
            'signature_key' => str_repeat('a', 128),
        ])->assertStatus(403);

        $this->assertSame('unpaid', Booking::where('booking_code', $code)->value('payment_status'));
    }

    public function test_expire_webhook_cancels_booking_and_releases_dates(): void
    {
        $room = $this->daisy();
        $code = $this->postJson('/api/bookings', $this->bookingPayload($room, 25, 27))->json('booking.booking_code');

        $serverKey = 'SB-Mid-server-QA-WEBHOOK';
        config(['services.midtrans.server_key' => $serverKey]);

        $this->postJson('/api/midtrans/webhook', [
            'order_id' => $code,
            'status_code' => '407',
            'gross_amount' => '6370000.00',
            'transaction_status' => 'expire',
            'signature_key' => hash('sha512', $code . '407' . '6370000.00' . $serverKey),
        ])->assertOk();

        $this->assertDatabaseHas('bookings', ['booking_code' => $code, 'status' => 'cancelled', 'payment_status' => 'expired']);

        // Dates are released for new guests
        config(['services.midtrans.server_key' => '']);
        $this->postJson('/api/bookings', $this->bookingPayload($room, 25, 27))->assertCreated();
    }

    // ------------------------------------------------------------------
    // 6. Auth & Admin Route Protection
    // ------------------------------------------------------------------

    public function test_guests_are_redirected_away_from_admin_pages(): void
    {
        $this->get('/admin-dashboard')->assertRedirect('/?login=1');
        $this->get('/central-bookings')->assertRedirect('/?login=1');
        $this->postJson('/admin/ical-links/sync')->assertUnauthorized();
        $this->patchJson("/admin/rooms/{$this->daisy()->id}/status", ['status' => 'MAINTENANCE'])->assertUnauthorized();
    }

    public function test_invalid_login_is_rejected(): void
    {
        $this->postJson('/login', ['email' => 'admin@theboecottage.com', 'password' => 'wrong-password'])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
        $this->assertGuest();
    }

    public function test_admin_can_login_and_access_dashboards(): void
    {
        $this->post('/login', [
            'email' => 'admin@theboecottage.com',
            'password' => 'password123',
        ])->assertRedirect('/admin-dashboard');

        $this->assertAuthenticatedAs($this->admin());

        $this->get('/admin-dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/AdminDashboard')
                ->has('rooms', 2)
                ->has('dashboardStats.revenue')
                ->has('dashboardStats.occupancy')
                ->has('icalLinks')
                ->has('rooms.0.export_url')
            );

        $this->get('/central-bookings')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/CentralBookings')
                ->has('bookings', 2)
                ->has('rooms', 2)
            );

        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    // ------------------------------------------------------------------
    // 7. Admin Mutations
    // ------------------------------------------------------------------

    public function test_admin_can_create_seasonal_rate(): void
    {
        $this->actingAs($this->admin())
            ->postJson('/admin/seasonal-rates', [
                'rule_name' => 'QA Lebaran Peak',
                'room_id' => null,
                'start_date' => now()->addDays(50)->toDateString(),
                'end_date' => now()->addDays(55)->toDateString(),
                'rate_adjustment_percent' => 25,
            ])
            ->assertCreated()
            ->assertJsonPath('seasonal_rate.rule_name', 'QA Lebaran Peak');

        $this->assertDatabaseHas('seasonal_rates', ['rule_name' => 'QA Lebaran Peak', 'is_active' => true]);
    }

    public function test_admin_maintenance_toggle_blocks_bookings(): void
    {
        $room = $this->lily();

        $this->actingAs($this->admin())
            ->patchJson("/admin/rooms/{$room->id}/status", ['status' => 'MAINTENANCE'])
            ->assertOk()
            ->assertJsonPath('room.status', 'MAINTENANCE');

        $this->postJson('/api/bookings', $this->bookingPayload($room, 60, 62))
            ->assertStatus(422)
            ->assertJsonValidationErrors(['room_id']);

        $this->postJson('/api/check-availability', [
            'room_id' => $room->id,
            'check_in' => now()->addDays(60)->toDateString(),
            'check_out' => now()->addDays(62)->toDateString(),
        ])->assertJsonPath('available', false);

        // Maintenance is reflected in the outbound OTA feed
        $ics = $this->get("/ical/export/{$room->slug}.ics")->assertOk()->getContent();
        $this->assertStringContainsString("MAINTENANCE-{$room->slug}@theboecottage.com", $ics);

        // Re-open the room
        $this->patchJson("/admin/rooms/{$room->id}/status", ['status' => 'AVAILABLE'])->assertOk();
        $this->postJson('/api/bookings', $this->bookingPayload($room, 60, 62))->assertCreated();
    }

    public function test_admin_can_create_manual_reservation_and_update_status(): void
    {
        $room = $this->daisy();

        $response = $this->actingAs($this->admin())
            ->postJson('/admin/bookings', [
                'room_id' => $room->id,
                'guest_name' => 'Walk-in WhatsApp Guest',
                'guest_phone' => '+62 813-1111-2222',
                'check_in' => now()->addDays(70)->toDateString(),
                'check_out' => now()->addDays(72)->toDateString(),
                'source' => 'whatsapp',
            ])
            ->assertCreated()
            ->assertJsonPath('booking.source', 'whatsapp')
            ->assertJsonPath('booking.status', 'confirmed')
            ->assertJsonPath('booking.payment_status', 'paid');

        $bookingId = $response->json('booking.id');

        // Manual reservations also respect double-booking protection
        $this->postJson('/admin/bookings', [
            'room_id' => $room->id,
            'guest_name' => 'Conflicting Guest',
            'guest_phone' => '+62 813-0000-0000',
            'check_in' => now()->addDays(71)->toDateString(),
            'check_out' => now()->addDays(73)->toDateString(),
        ])->assertStatus(422);

        $this->patchJson("/admin/bookings/{$bookingId}", ['check_in_status' => 'checked_in'])
            ->assertOk()
            ->assertJsonPath('booking.check_in_status', 'checked_in');
    }

    // ------------------------------------------------------------------
    // 8. OTA iCal Export & Sync
    // ------------------------------------------------------------------

    public function test_ical_export_returns_valid_calendar_with_active_bookings(): void
    {
        $room = $this->daisy();
        $code = $this->postJson('/api/bookings', $this->bookingPayload($room, 15, 17))->json('booking.booking_code');

        $response = $this->get("/ical/export/{$room->slug}.ics?token={$room->export_token}")
            ->assertOk()
            ->assertHeader('Content-Type', 'text/calendar; charset=utf-8');

        $ics = $response->getContent();
        $this->assertStringContainsString('BEGIN:VCALENDAR', $ics);
        $this->assertStringContainsString('PRODID:-//The Boe Cottage//Channel Manager//EN', $ics);
        $this->assertStringContainsString('BEGIN:VEVENT', $ics);
        $this->assertStringContainsString("UID:{$code}@theboecottage.com", $ics);
        $this->assertStringContainsString('DTSTART;VALUE=DATE:' . now()->addDays(15)->format('Ymd'), $ics);
        $this->assertStringContainsString('DTEND;VALUE=DATE:' . now()->addDays(17)->format('Ymd'), $ics);
        $this->assertStringContainsString('END:VCALENDAR', $ics);

        // Wrong token is rejected
        $this->get("/ical/export/{$room->slug}.ics?token=invalid-token")->assertForbidden();
    }

    public function test_admin_ical_link_crud_and_sync_imports_updates_and_cancels(): void
    {
        $room = $this->lily();
        $admin = $this->admin();
        $feedUrl = 'https://www.airbnb.com/calendar/ical/qa-feed.ics';

        $start1 = now()->addDays(80)->format('Ymd');
        $end1 = now()->addDays(82)->format('Ymd');
        $start2 = now()->addDays(90)->format('Ymd');
        $end2 = now()->addDays(92)->format('Ymd');

        $buildFeed = fn (array $events) => "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Airbnb Inc//Hosting Calendar//EN\r\n"
            . implode('', array_map(fn ($e) => "BEGIN:VEVENT\r\nUID:{$e[0]}\r\nDTSTART;VALUE=DATE:{$e[1]}\r\nDTEND;VALUE=DATE:{$e[2]}\r\nSUMMARY:Reserved\r\nEND:VEVENT\r\n", $events))
            . "END:VCALENDAR\r\n";

        Http::fakeSequence('www.airbnb.com/*')
            ->push($buildFeed([['airbnb-uid-1', $start1, $end1], ['airbnb-uid-2', $start2, $end2]]), 200)
            ->push($buildFeed([['airbnb-uid-1', now()->addDays(81)->format('Ymd'), now()->addDays(83)->format('Ymd')]]), 200);

        $linkId = $this->actingAs($admin)
            ->postJson('/admin/ical-links', ['room_id' => $room->id, 'platform' => 'airbnb', 'url' => $feedUrl])
            ->assertCreated()
            ->json('ical_link.id');

        // First sync: two imports
        $this->postJson('/admin/ical-links/sync')
            ->assertOk()
            ->assertJsonPath('summary.imported', 2)
            ->assertJsonPath('summary.errors', 0);

        $this->assertSame(2, Booking::where('room_id', $room->id)->where('source', 'airbnb')->where('status', 'confirmed')->count());
        $this->assertNotNull(IcalLink::find($linkId)->last_synced_at);

        // Second sync: uid-1 dates moved (update), uid-2 removed (cancel)
        $this->postJson('/admin/ical-links/sync')
            ->assertOk()
            ->assertJsonPath('summary.imported', 0)
            ->assertJsonPath('summary.updated', 1)
            ->assertJsonPath('summary.cancelled', 1);

        $moved = Booking::where('external_uid', 'airbnb-uid-1')->firstOrFail();
        $this->assertSame(now()->addDays(81)->toDateString(), $moved->check_in->format('Y-m-d'));
        $this->assertSame('cancelled', Booking::where('external_uid', 'airbnb-uid-2')->value('status'));
        $this->assertSame(1, Booking::where('external_uid', 'airbnb-uid-1')->count(), 'No duplicate on date change');

        // OTA-imported dates block direct bookings
        $this->postJson('/api/bookings', $this->bookingPayload($room, 81, 82))->assertStatus(422);

        // Delete the link
        $this->deleteJson("/admin/ical-links/{$linkId}")->assertOk();
        $this->assertDatabaseMissing('ical_links', ['id' => $linkId]);
    }

    public function test_sync_ical_artisan_command_runs_cleanly(): void
    {
        $this->artisan('sync:ical')->assertSuccessful();
    }

    public function test_expire_unpaid_command_cancels_stale_direct_bookings(): void
    {
        $code = $this->postJson('/api/bookings', $this->bookingPayload($this->daisy(), 35, 36))->json('booking.booking_code');
        Booking::where('booking_code', $code)->update(['created_at' => now()->subHours(5)]);

        $this->artisan('bookings:expire-unpaid')->assertSuccessful();

        $this->assertDatabaseHas('bookings', ['booking_code' => $code, 'status' => 'cancelled']);
    }
}

