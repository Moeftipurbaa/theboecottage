<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Review;
use App\Models\Room;
use App\Models\SeasonalRate;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed Admin User
        User::updateOrCreate(
            ['email' => 'admin@theboecottage.com'],
            [
                'name' => 'Lead Desk Admin',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed Rooms & Room Images
        $daisyRoom = Room::updateOrCreate(
            ['slug' => 'daisy-room'],
            [
                'name' => 'Daisy Room',
                'description' => 'Daisy Room offers a spacious and comfortable stay with thoughtfully designed spaces and complete facilities. Perfect for families, friends, or groups looking for a relaxing and memorable stay in Dieng.',
                'price_per_night' => 3000000,
                'capacity' => 2,
                'status' => 'AVAILABLE',
                'size' => '96 sq. meters',
                'amenities' => ['Smart TV', 'Free WIFI', '1 Bathtub Pribadi'],
            ]
        );

        $daisyImages = [
            ['image_path' => '/images/cottage/daisy/daisy-bedroom.jpeg', 'is_primary' => true],
            ['image_path' => '/images/cottage/daisy/daisy-toilet-2.jpeg', 'is_primary' => false],
            ['image_path' => '/images/cottage/daisy/bathtub-daisy.jpeg', 'is_primary' => false],
            ['image_path' => '/images/cottage/daisy/daisy-sofa-bed.jpeg', 'is_primary' => false],
        ];

        $daisyRoom->images()->delete();
        $daisyRoom->images()->createMany($daisyImages);

        $lilyRoom = Room::updateOrCreate(
            ['slug' => 'lily-room'],
            [
                'name' => 'Lily Room',
                'description' => 'Designed to bring people together, Lily Room offers a warm and inviting atmosphere with ample space to relax and recharge. Whether you are traveling with close friends or family, it serves as a cozy retreat after exploring Dieng—providing the perfect comfort for medium-sized groups.',
                'price_per_night' => 3300000,
                'capacity' => 2,
                'status' => 'AVAILABLE',
                'size' => '96 sq. meters',
                'amenities' => ['Smart TV', 'Free WIFI', '1 Bathtub Pribadi'],
            ]
        );

        $lilyImages = [
            ['image_path' => '/images/cottage/lily/lily-bedroom.jpeg', 'is_primary' => true],
            ['image_path' => '/images/cottage/lily/lily-master-bedroom.jpeg', 'is_primary' => false],
            ['image_path' => '/images/cottage/lily/bathtub-lily.jpeg', 'is_primary' => false],
            ['image_path' => '/images/cottage/lily/bathtub-lily-2.jpeg', 'is_primary' => false],
        ];

        $lilyRoom->images()->delete();
        $lilyRoom->images()->createMany($lilyImages);

        // 3. Seed Sample Approved Reviews
        $reviews = [
            [
                'guest_name' => 'Arya & Nadya',
                'rating' => 5,
                'comment' => 'Tiga malam tanpa sinyal ponsel adalah keputusan terbaik dalam lima tahun terakhir hidup saya.',
                'is_approved' => true,
            ],
            [
                'guest_name' => 'Risma Ayu',
                'rating' => 5,
                'comment' => 'Teh putih panas dan kabut tebal yang menyapu jendela saat fajar... sebuah jeda yang mengembalikan kewarasan kerja berbulan-bulan.',
                'is_approved' => true,
            ],
            [
                'guest_name' => 'Dr. Hendra Kusuma',
                'rating' => 5,
                'comment' => 'Desain kayu jati dan batu alamnya begitu hangat di tengah udara dingin Dieng. Pelayanan yang sangat tenang dan berkelas.',
                'is_approved' => true,
            ],
        ];

        Review::query()->delete();
        foreach ($reviews as $review) {
            Review::create($review);
        }

        // 4. Seed Sample Seasonal Rate Rule
        SeasonalRate::query()->delete();
        SeasonalRate::create([
            'rule_name' => 'Highland Year-End Peak',
            'room_id' => null,
            'start_date' => now()->endOfYear()->subDays(10)->toDateString(),
            'end_date' => now()->endOfYear()->toDateString(),
            'rate_adjustment_percent' => 15.00,
            'is_active' => true,
        ]);

        // 5. Seed Initial Sample Bookings so Admin Dashboard & Central Bookings have live records
        Booking::query()->delete();
        Booking::create([
            'booking_code' => 'BOE-' . now()->format('Ymd') . '-8419',
            'room_id' => $lilyRoom->id,
            'guest_name' => 'Eleanor Vance',
            'guest_email' => 'eleanor.vance@example.co.uk',
            'guest_phone' => '+44 7911 123456',
            'check_in' => now()->toDateString(),
            'check_out' => now()->addDays(2)->toDateString(),
            'adults' => 2,
            'children' => 0,
            'notes' => 'Early morning tea service requested.',
            'total_price' => 6970000,
            'source' => 'direct',
            'status' => 'confirmed',
            'check_in_status' => 'pending_arrival',
            'payment_status' => 'paid',
            'payment_type' => 'bank_transfer',
            'paid_at' => now()->subDay(),
        ]);

        Booking::create([
            'booking_code' => 'BOE-' . now()->format('Ymd') . '-8418',
            'room_id' => $daisyRoom->id,
            'guest_name' => 'Budi Haryanto',
            'guest_email' => 'budi.haryanto@example.id',
            'guest_phone' => '+62 812-9902-1122',
            'check_in' => now()->addDays(4)->toDateString(),
            'check_out' => now()->addDays(6)->toDateString(),
            'adults' => 2,
            'children' => 1,
            'notes' => 'Extra firewood for the stove.',
            'total_price' => 6370000,
            'source' => 'airbnb',
            'status' => 'confirmed',
            'check_in_status' => 'pending_arrival',
            'payment_status' => 'paid',
            'payment_type' => 'credit_card',
            'paid_at' => now()->subDays(2),
        ]);
    }
}
