# The Boe Cottage — Reservasi & Channel Manager

Platform reservasi cottage di Dieng berbasis **Laravel 12 + Inertia.js + React 19 + Tailwind CSS v4 (Vite)**, lengkap dengan:

- Mesin booking atomik (anti double-booking) + harga dihitung di server (termasuk seasonal rate & service fee Rp370.000)
- Pembayaran **Midtrans Snap** (mode fallback `MOCK-SNAP-*` otomatis jika key kosong)
- Sinkronisasi iCal 2 arah untuk **Airbnb & Tiket.com** (import + export `.ics`)
- Admin Dashboard & Central Bookings dengan autentikasi session

---

## 1. Cara Setup Cepat

**Prasyarat:** PHP 8.2+ (ekstensi `pdo_sqlite`), Composer 2, Node.js 20+ & npm. (Pengguna Laragon: pastikan folder `bin\php` dan `bin\nodejs` Laragon sudah masuk `PATH`.)

```bash
# 1. Install dependency backend & frontend
composer install
npm install

# 2. Siapkan file environment
cp .env.example .env            # Windows CMD: copy .env.example .env
php artisan key:generate

# 3. Buat file database SQLite (jika belum ada), lalu migrasi + seed data contoh
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate:fresh --seed

# 4. Jalankan Laravel server + Vite dev server sekaligus
composer run dev
```

Buka **http://localhost:8000**.

> Tidak perlu MySQL maupun key Midtrans untuk development. Dengan `MIDTRANS_SERVER_KEY` kosong, booking tetap berhasil dan mengembalikan token `MOCK-SNAP-<kode booking>`.

Perintah lain yang berguna:

| Perintah | Fungsi |
|---|---|
| `php artisan test` | Menjalankan seluruh test suite (24 test E2E) |
| `npm run build` | Build aset produksi ke `public/build` |
| `php artisan sync:ical` | Sinkronisasi manual feed iCal OTA |

---

## 2. Akun Login Admin

| Halaman | URL |
|---|---|
| Admin Dashboard | `/admin-dashboard` |
| Central Bookings | `/central-bookings` |

- **Email:** `admin@theboecottage.com`
- **Password:** `password123`

Login lewat tombol login di landing page (`/?login=1`). Akses halaman admin tanpa login akan diarahkan kembali ke `/?login=1`.

---

## 3. Panduan Penting Tim Frontend

### Lokasi File

```
resources/js/
├── app.jsx                 # Entry point Inertia (resolve halaman dari Pages/)
├── bootstrap.js            # Konfigurasi global window.axios (CSRF, header) — JANGAN dihapus
├── Pages/                  # Satu file = satu halaman (dirender dari routes/web.php)
│   ├── Welcome.jsx         # Landing page  →  GET /
│   ├── Reservation.jsx     # Booking + pembayaran Midtrans  →  GET /reservation
│   └── Admin/
│       ├── AdminDashboard.jsx   # GET /admin-dashboard (butuh login)
│       └── CentralBookings.jsx  # GET /central-bookings (butuh login)
└── Components/             # Komponen yang dipakai ulang
    ├── AboutSection.jsx, LocationSection.jsx, RevealOnScroll.jsx
    ├── RoomSection.jsx, RoomDetailModal.jsx, ReviewSection.jsx
    ├── Footer.jsx          # Berisi form kirim review (POST /api/reviews)
    └── LoginModal.jsx      # Form login admin (POST /login)
```

Gambar statis ada di `public/images/cottage/`. CSS global/Tailwind ada di `resources/css/app.css`.

### Inertia Props dari Backend

Props didefinisikan di [`routes/web.php`](routes/web.php). Gunakan nama props persis seperti di bawah.

**Shared props (tersedia di semua halaman via `usePage().props`)** — dari `app/Http/Middleware/HandleInertiaRequests.php`:

| Prop | Isi |
|---|---|
| `auth.user` | `{ id, name, email }` atau `null` jika belum login |
| `midtrans` | `{ client_key, is_production }` untuk memuat `snap.js` |

**`Pages/Welcome.jsx`**

| Prop | Isi |
|---|---|
| `rooms` | Array room + relasi `images` (`id, name, slug, description, price_per_night, capacity, status, size, amenities, images[]`) |
| `reviews` | Array review yang sudah disetujui (`guest_name, rating, comment, created_at`) |

**`Pages/Reservation.jsx`**

| Prop | Isi |
|---|---|
| `rooms` | Array room + `images` (sama seperti Welcome) |
| `seasonalRates` | Aturan harga musiman aktif (`rule_name, room_id, start_date, end_date, rate_adjustment_percent`) — hanya untuk tampilan estimasi, **harga final tetap dihitung server** |

**`Pages/Admin/AdminDashboard.jsx`**

| Prop | Isi |
|---|---|
| `rooms` | Room + `images` + `bookings` aktif ke depan, plus `export_url` & `export_token` (URL feed `.ics` untuk Airbnb/Tiket.com) |
| `arrivalsToday` | Booking yang check-in hari ini (+ relasi `room`) |
| `seasonalRates` | Seasonal rate aktif (+ relasi `room`) |
| `icalLinks` | Link import iCal OTA (`platform, url, is_active, last_synced_at, room`) |
| `dashboardStats` | `{ revenue: { amount, raw_amount, target, bookings }, occupancy: { amount, units, percent }, arrivals: { parties, guests, pending } }` |

**`Pages/Admin/CentralBookings.jsx`**

| Prop | Isi |
|---|---|
| `bookings` | Semua booking (+ relasi `room`): `booking_code, guest_*, check_in, check_out, adults, children, total_price, source, status, payment_status, check_in_status, ...` |
| `rooms` | Array room + `images` |

### Endpoint API yang Sudah Terhubung

| Dipakai di | Method & URL | Fungsi |
|---|---|---|
| Reservation.jsx | `GET /api/rooms/{id}/booked-dates` | Tanggal yang tidak bisa dipilih di kalender |
| Reservation.jsx | `POST /api/bookings` | Membuat booking + mengembalikan `snap_token` |
| Footer.jsx | `POST /api/reviews` | Kirim review tamu |
| LoginModal.jsx | `POST /login` | Login admin |
| Admin pages | `POST /logout` | Logout |
| AdminDashboard.jsx | `PUT /admin/rooms/{id}`, `PATCH /admin/rooms/{id}/status` | Edit room & status (AVAILABLE / OCCUPIED / MAINTENANCE) |
| AdminDashboard.jsx | `POST /admin/seasonal-rates` | Tambah seasonal rate |
| AdminDashboard.jsx | `PATCH /admin/bookings/{id}` | Update status check-in |
| AdminDashboard.jsx | `POST /admin/ical-links`, `DELETE /admin/ical-links/{id}`, `POST /admin/ical-links/sync` | Kelola & sinkronisasi channel OTA |
| CentralBookings.jsx | `POST /admin/bookings` | Reservasi manual (WhatsApp / walk-in) |

> Endpoint publik dibatasi rate limit (`throttle:60,1` untuk baca, `throttle:15,1` untuk booking/review/login). Jika muncul error **429**, tunggu 1 menit.

### ⚠️ Peringatan — Jangan Dihapus / Diubah Tanpa Koordinasi Backend

1. **State & fungsi Midtrans di `Reservation.jsx`** — loader `snap.js` (berdasarkan `midtrans.client_key` & `midtrans.is_production`), pemanggilan `POST /api/bookings`, dan `window.snap.pay(snapToken, { onSuccess, onPending, onError, onClose })`. Menghapusnya akan memutus alur pembayaran.
2. **Semua pemanggilan `window.axios`** di Pages & Components. Silakan ubah tampilan (JSX/Tailwind), tetapi pertahankan URL endpoint, method, dan nama field payload (`room_id, check_in, check_out, adults, children, guest_name, guest_email, guest_phone, notes`, dst).
3. **`resources/js/bootstrap.js`** — mengatur header CSRF/`X-Requested-With` untuk axios. Tanpa ini request POST/PATCH akan gagal (419).
4. **Jangan menghitung harga final di frontend.** Total harga, seasonal rate, dan service fee dihitung di `BookingController`; frontend hanya menampilkan estimasi dan respons `pricing` dari server.
5. **Nama props Inertia** di tabel atas adalah kontrak dengan backend. Jika butuh data tambahan, minta tim backend menambahkannya di `routes/web.php`.

---

## 4. Struktur Backend Singkat (Referensi)

| Lokasi | Isi |
|---|---|
| `routes/web.php`, `routes/api.php` | Definisi halaman, props Inertia & endpoint |
| `app/Http/Controllers/` | `BookingController`, `AuthController`, `RoomController`, `AvailabilityController`, `IcalController` |
| `app/Services/` | `MidtransService` (Snap API + verifikasi webhook), `IcalSyncService` (import OTA) |
| `routes/console.php` | Scheduler: `sync:ical` (15 menit) & `bookings:expire-unpaid` (5 menit) |
| `database/seeders/DatabaseSeeder.php` | Admin, Daisy Room, Lily Room, review & booking contoh |
| `tests/Feature/BoeCottageE2ETest.php` | Test end-to-end seluruh alur |
| `.env.production.example`, `deploy.sh` | Template & skrip deployment produksi |
