<?php

namespace App\Services;

use App\Models\AiChatLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class AiChatService
{
    public const ADMIN_PHONE = '0821 4441 271';

    public const ADMIN_WA_LINK = 'https://wa.me/628214441271';

    public const MAPS_LINK = 'https://maps.app.goo.gl/928tTkkNCtnNvZ5Q9';

    /**
     * Get system prompt containing the official The Boe Cottage knowledge base.
     */
    public function getSystemPrompt(): string
    {
        return <<<'PROMPT'
Anda adalah AI Virtual Concierge resmi untuk "The Boe Cottage" yang beroperasi 24/7.
Tugas Anda adalah melayani tamu dan calon tamu dengan ramah, hangat, sopan, elegan, dan profesional menggunakan Bahasa Indonesia yang baik dan santun.

PANDUAN UTAMA:
- Selalu berikan informasi akurat berdasarkan pengetahuan resmi di bawah ini.
- Jangan mengarang informasi atau harga di luar data resmi ini.
- Jika tamu membutuhkan bantuan lebih lanjut, pemesanan khusus, konfirmasi manual, atau kepastian jadwal, arahkan dengan ramah ke Admin WhatsApp di 0821 4441 271 (tautan: https://wa.me/628214441271).
- Gunakan format markdown yang rapi (bold, bullet points) agar mudah dibaca di layar chat.

BASIS PENGETAHUAN RESMI THE BOE COTTAGE:
1. PERKENALAN:
"Salam, The Boe Cottage merupakan villa yang berlokasi di kawasan dataran tinggi Dieng, Jawa Tengah. The Boe Cottage menghadirkan suasana menginap yang hangat, nyaman, dan elegan dengan perpaduan fasilitas modern serta keindahan alam sekitar. Kami memiliki 4 unit villa dan menyediakan dua pilihan kamar, yaitu Daisy Room dan Lily Room. Keduanya memiliki konsep mezzanine, balkon pribadi, ruang keluarga, dapur lengkap, serta bathtub untuk menambah kenyamanan selama menginap. Rekomendasi untuk liburan keluarga, berkumpul bersama teman, maupun menikmati waktu istirahat dari kesibukan sehari-hari, The Boe Cottage siap menjadi tempat terbaik untuk menciptakan momen berkesan."

2. LOKASI & LINGKUNGAN:
- Lokasi: Desa Sumberejo, Kecamatan Batur, Kabupaten Banjarnegara, Jawa Tengah.
- Google Maps: https://maps.app.goo.gl/928tTkkNCtnNvZ5Q9
- Pemandangan & Lingkungan Sekitar: Berada di kawasan dataran tinggi Dieng yang dikelilingi suasana alam pegunungan yang sejuk dan menenangkan. Di sekitar cottage, tamu dapat menikmati pemandangan hamparan perkebunan, perbukitan, serta udara segar khas pegunungan.

3. KAPASITAS & TIPE KAMAR:
- Kami memiliki 4 unit villa dengan 2 pilihan tipe kamar: Daisy Room dan Lily Room.
- Kapasitas: Masing-masing unit dapat menampung hingga 6 orang.
- Konsep: Keduanya mengusung konsep mezzanine dengan fasilitas lengkap.
- Perbedaan Daisy Room & Lily Room:
  * Daisy Room: Area mezzanine dengan 1 tempat tidur dan 1 sofa bed. Bathtub berbentuk persegi.
  * Lily Room: Area mezzanine dengan 2 tempat tidur. Bathtub berbentuk bulat.
- Extra Bed: Tersedia extra bed single dengan biaya tambahan Rp 300.000.

4. FASILITAS LENGKAP:
- Kamar Tidur: 2 Tempat tidur nyaman (kamar utama private dan kamar mezzanine), Sofa bed (khusus Daisy Room), bantal dan perlengkapan tidur berkualitas.
- Living Room: Sofa empuk, rak, meja, Smart TV, akses Netflix gratis, koneksi Wi-Fi kencang.
- Kitchen & Dining Area: Meja dan kursi makan, kompor listrik, rice cooker, mesin kopi Nespresso, peralatan memasak dan perlengkapan makan lengkap.
- Bathroom & Toilet: Bathtub nyaman dengan air hangat (water heater), perlengkapan mandi lengkap (amenities), serta 2 toilet dalam setiap unit.
- Area Tambahan: 2 balkon pribadi di masing-masing unit villa, rumah kaca (glasshouse), area taman asri, tempat parkir luas, dan kafe santai.

5. TARIF KAMAR (HARGA NORMAL):
- Daisy Room: Rp 3.000.000 / malam
- Lily Room: Rp 3.300.000 / malam

6. WAKTU CHECK-IN & CHECK-OUT:
- Jam Check-in: 15.00 WIB
- Jam Check-out: 11.00 WIB

7. KETENTUAN PEMBAYARAN & PEMESANAN:
- Pembayaran DP 50% dapat ditransfer langsung ke rekening BCA 0971707606 a/n Tini Boehmer.
- Jika sudah melakukan pembayaran DP, unit kamar otomatis di-keep untuk tamu.
- Pemesanan juga dapat dilakukan langsung secara online melalui halaman Reservasi di website kami (/reservation).

8. CEK KETERSEDIAAN TANGGAL:
Jika tamu ingin mengecek ketersediaan tanggal atau memesan, minta mereka mengisi format berikut atau arahkan ke halaman Reservasi (/reservation):
- Nama Pemesan :
- Tanggal Check-in :
- Tanggal Check-out :
- Jumlah Tamu :
- Pilihan Kamar : Daisy Room / Lily Room / Belum Menentukan
Sampaikan bahwa format tersebut juga bisa dikirimkan langsung ke WhatsApp Admin (0821 4441 271: https://wa.me/628214441271).

9. INFORMASI SARAPAN (BREAKFAST):
Menyediakan layanan breakfast dengan pilihan menu lezat khas Indonesia hingga Western:
1. Nasi Goreng
2. Mie Goreng
3. Pancake & Sausage
4. Waffle & Fresh Fruits
5. Scrambled Egg
(Untuk informasi paket breakfast, pilihan menu, dan ketentuan harga, arahkan tamu menghubungi Admin).

10. PAKET MAKAN TAMBAHAN (BBQ & STEAMBOAT):
- Paket BBQ (Rp 390.000): Baso Ikan 5 tusuk, Baso Salmon 5 tusuk, Sosis 5 biji, Sate Sapi 10 tusuk, Sate Ayam 10 tusuk, Nasi, Arang / Gas, dan Peralatan BBQ lengkap.
- Paket Steamboat (Rp 275.000): Baso Ikan 6 biji, Baso Salmon 6 biji, Slice Beef 250 gr, Slice Chicken 250 gr, Dumpling, Odeng, Jamur, Sawi, Tahu, Jagung, dan Pilihan Kuah Sop (Sichuan / Tomyam / Ayam Kaldu).

11. REKOMENDASI TEMPAT WISATA DIENG TERDEKAT:
1. Kawah Sikidang: Kawah vulkanik dengan aktivitas geothermal dan pemandangan alam unik.
2. Kompleks Candi Arjuna: Wisata sejarah bangunan candi Hindu kuno yang menjadi ikon kawasan Dieng.
3. Telaga Warna: Danau alami dengan warna air yang dapat berubah-ubah karena kandungan mineral dan pantulan cahaya matahari.
4. Bukit Skoter: Tempat terbaik menikmati panorama dataran tinggi Dieng, sunrise spektakuler, dan lautan awan.
5. Telaga Dringo: Telaga alami dengan suasana asri dan pemandangan perbukitan yang menenangkan (sering disebut Ranu Kumbolo-nya Dieng).
6. Sumur Jalatunda: Destinasi unik berupa sumur alami berukuran besar yang memiliki nilai sejarah dan legenda lokal.
PROMPT;
    }

    /**
     * Process message via LLM (OpenAI or Gemini) or deterministic fallback.
     */
    public function reply(string $userMessage, ?string $sessionId = null): string
    {
        $openaiKey = config('services.openai.api_key');
        $geminiKey = config('services.gemini.api_key');

        // 1. Try OpenAI if key is present
        if (! empty($openaiKey)) {
            try {
                $response = $this->queryOpenAi($userMessage, $sessionId, $openaiKey);
                if (! empty($response)) {
                    return $response;
                }
            } catch (Throwable $e) {
                Log::warning('OpenAI AI Chat failed, falling back: '.$e->getMessage());
            }
        }

        // 2. Try Gemini if key is present
        if (! empty($geminiKey)) {
            try {
                $response = $this->queryGemini($userMessage, $sessionId, $geminiKey);
                if (! empty($response)) {
                    return $response;
                }
            } catch (Throwable $e) {
                Log::warning('Gemini AI Chat failed, falling back: '.$e->getMessage());
            }
        }

        // 3. Deterministic Knowledge Base Fallback
        return $this->deterministicReply($userMessage);
    }

    /**
     * Query OpenAI Chat Completion (gpt-4o-mini).
     */
    protected function queryOpenAi(string $userMessage, ?string $sessionId, string $apiKey): ?string
    {
        $messages = [
            ['role' => 'system', 'content' => $this->getSystemPrompt()],
        ];

        // Include recent conversation context if sessionId exists
        if (! empty($sessionId)) {
            $history = AiChatLog::where('session_id', $sessionId)
                ->latest('id')
                ->take(4)
                ->get()
                ->reverse();

            foreach ($history as $log) {
                $messages[] = ['role' => 'user', 'content' => $log->user_query];
                $messages[] = ['role' => 'assistant', 'content' => $log->ai_response];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $userMessage];

        $model = config('services.openai.model', 'gpt-4o-mini');

        $response = Http::timeout(15)
            ->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
                'Content-Type' => 'application/json',
            ])
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.6,
                'max_tokens' => 800,
            ]);

        if ($response->successful()) {
            $data = $response->json();
            $reply = $data['choices'][0]['message']['content'] ?? null;
            if ($reply) {
                return trim($reply);
            }
        }

        return null;
    }

    /**
     * Query Google Gemini API.
     */
    protected function queryGemini(string $userMessage, ?string $sessionId, string $apiKey): ?string
    {
        $contents = [];

        if (! empty($sessionId)) {
            $history = AiChatLog::where('session_id', $sessionId)
                ->latest('id')
                ->take(4)
                ->get()
                ->reverse();

            foreach ($history as $log) {
                $contents[] = [
                    'role' => 'user',
                    'parts' => [['text' => $log->user_query]],
                ];
                $contents[] = [
                    'role' => 'model',
                    'parts' => [['text' => $log->ai_response]],
                ];
            }
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => $userMessage]],
        ];

        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";

        $response = Http::timeout(15)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                'system_instruction' => [
                    'parts' => [
                        ['text' => $this->getSystemPrompt()],
                    ],
                ],
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.6,
                    'maxOutputTokens' => 800,
                ],
            ]);

        if ($response->successful()) {
            $data = $response->json();
            $reply = $data['candidates'][0]['content']['parts'][0]['text'] ?? null;
            if ($reply) {
                return trim($reply);
            }
        }

        return null;
    }

    /**
     * Smart deterministic keyword-matching fallback engine.
     */
    public function deterministicReply(string $message): string
    {
        $normalized = mb_strtolower(trim($message));

        // 1. Differences between Daisy Room & Lily Room
        if (
            str_contains($normalized, 'beda') ||
            str_contains($normalized, 'perbedaan') ||
            (str_contains($normalized, 'daisy') && str_contains($normalized, 'lily')) ||
            str_contains($normalized, 'tipe kamar') ||
            str_contains($normalized, 'pilihan kamar')
        ) {
            return "Keduanya memiliki konsep **mezzanine** yang mewah dengan fasilitas lengkap. Perbedaan utamanya adalah:\n\n".
                "• **Daisy Room:** Area mezzanine dilengkapi dengan 1 tempat tidur dan 1 sofa bed. Bathtub di kamar mandi berbentuk **persegi**.\n".
                "• **Lily Room:** Area mezzanine dilengkapi dengan 2 tempat tidur. Bathtub di kamar mandi berbentuk **bulat**.\n\n".
                "Kapasitas kedua tipe villa ini masing-masing hingga **6 orang** per unit.\n\n".
                'Tertarik dengan kamar tertentu? Silakan cek [Reservasi Online](/reservation) atau hubungi [WhatsApp Admin (0821 4441 271)](https://wa.me/628214441271).';
        }

        // 2. Room Rates, Pricing & Normal Prices
        if (
            str_contains($normalized, 'harga') ||
            str_contains($normalized, 'tarif') ||
            str_contains($normalized, 'rate') ||
            str_contains($normalized, 'biaya') ||
            str_contains($normalized, 'permalam') ||
            str_contains($normalized, 'per malam') ||
            str_contains($normalized, 'semalam') ||
            str_contains($normalized, 'berapa') && (str_contains($normalized, 'sewa') || str_contains($normalized, 'kamar') || str_contains($normalized, 'villa'))
        ) {
            return "Berikut tarif normal menginap di **The Boe Cottage**:\n\n".
                "• **Daisy Room:** Rp 3.000.000 / malam\n".
                "• **Lily Room:** Rp 3.300.000 / malam\n\n".
                "Tersedia juga single **Extra Bed** dengan biaya tambahan Rp 300.000.\n\n".
                'Untuk mengamankan tanggal pilihan Anda, Anda dapat melakukan DP 50% ke rekening **BCA 0971707606 a/n Tini Boehmer** atau pesan langsung melalui [Halaman Reservasi](/reservation).';
        }

        // 3. Payment Terms, DP, Bank Transfer
        if (
            str_contains($normalized, 'bayar') ||
            str_contains($normalized, 'pembayaran') ||
            str_contains($normalized, 'dp') ||
            str_contains($normalized, 'down payment') ||
            str_contains($normalized, 'rekening') ||
            str_contains($normalized, 'transfer') ||
            str_contains($normalized, 'bca') ||
            str_contains($normalized, 'tini boehmer') ||
            str_contains($normalized, 'keep')
        ) {
            return "**Ketentuan Pembayaran The Boe Cottage:**\n\n".
                "1. Pembayaran **DP 50%** dapat ditransfer langsung ke rekening **BCA 0971707606 a/n Tini Boehmer**.\n".
                "2. Begitu Anda melakukan DP dan mengonfirmasi bukti transfer, unit kamar akan otomatis **di-keep** khusus untuk Anda.\n".
                "3. Pemesanan dan pembayaran juga dapat dilakukan secara praktis melalui [Halaman Reservasi](/reservation) di website ini.\n\n".
                'Konfirmasi bukti transfer ke [WhatsApp Admin (0821 4441 271)](https://wa.me/628214441271).';
        }

        // 4. Dining Packages: BBQ & Steamboat
        if (
            str_contains($normalized, 'bbq') ||
            str_contains($normalized, 'barbeque') ||
            str_contains($normalized, 'steamboat') ||
            str_contains($normalized, 'sukiyaki') ||
            str_contains($normalized, 'shabu') ||
            str_contains($normalized, 'sate') ||
            str_contains($normalized, 'grill') ||
            str_contains($normalized, 'paket makan')
        ) {
            return "The Boe Cottage menyediakan paket santap hangat yang sangat cocok untuk dinikmati di tengah udara sejuk Dieng:\n\n".
                "🔥 **Paket BBQ (Rp 390.000):**\n".
                "• Baso Ikan (5 tusuk)\n".
                "• Baso Salmon (5 tusuk)\n".
                "• Sosis (5 biji)\n".
                "• Sate Sapi (10 tusuk)\n".
                "• Sate Ayam (10 tusuk)\n".
                "• Nasi putih\n".
                "• Arang / Gas & Peralatan BBQ lengkap\n\n".
                "🍲 **Paket Steamboat (Rp 275.000):**\n".
                "• Slice Beef (250 gr) & Slice Chicken (250 gr)\n".
                "• Baso Ikan (6 biji) & Baso Salmon (6 biji)\n".
                "• Dumpling, Odeng, Jamur, Sawi, Tahu, Jagung\n".
                "• Pilihan Kuah Sop: Sichuan / Tomyam / Ayam Kaldu\n\n".
                'Untuk memesan paket ini saat menginap, Anda dapat mengabari [WhatsApp Admin (0821 4441 271)](https://wa.me/628214441271).';
        }

        // 5. Breakfast Information
        if (
            str_contains($normalized, 'sarapan') ||
            str_contains($normalized, 'breakfast') ||
            str_contains($normalized, 'sarap') ||
            str_contains($normalized, 'makan pagi')
        ) {
            return "The Boe Cottage menyediakan layanan **Breakfast** dengan pilihan menu lezat khas Indonesia hingga Western:\n\n".
                "1. **Nasi Goreng**\n".
                "2. **Mie Goreng**\n".
                "3. **Pancake & Sausage**\n".
                "4. **Waffle & Fresh Fruits**\n".
                "5. **Scrambled Egg**\n\n".
                'Untuk rincian paket breakfast, pilihan menu harian, dan ketentuan harganya, silakan langsung menghubungi [WhatsApp Admin (0821 4441 271)](https://wa.me/628214441271).';
        }

        // 6. Complete Facilities
        if (
            str_contains($normalized, 'fasilitas') ||
            str_contains($normalized, 'amenities') ||
            str_contains($normalized, 'dapur') ||
            str_contains($normalized, 'kitchen') ||
            str_contains($normalized, 'bathtub') ||
            str_contains($normalized, 'netflix') ||
            str_contains($normalized, 'wifi') ||
            str_contains($normalized, 'nespresso') ||
            str_contains($normalized, 'water heater') ||
            str_contains($normalized, 'air hangat')
        ) {
            return "Setiap unit villa di **The Boe Cottage** dilengkapi fasilitas istimewa untuk kenyamanan Anda:\n\n".
                "• **Kamar Tidur:** 2 Tempat tidur nyaman (kamar utama private & kamar mezzanine), sofa bed (khusus Daisy), bantal & perlengkapan tidur berkualitas.\n".
                "• **Living Room:** Sofa santai, meja, Smart TV dengan akses Netflix gratis, dan koneksi Wi-Fi.\n".
                "• **Kitchen & Dining:** Meja makan, kompor listrik, rice cooker, mesin kopi Nespresso, serta peralatan masak & makan lengkap.\n".
                "• **Bathroom & Toilet:** Bathtub dengan air hangat (water heater), amenities mandi lengkap, dan 2 toilet dalam tiap unit.\n".
                '• **Area Tambahan:** 2 balkon pribadi di setiap unit, rumah kaca (glasshouse), taman asri, area parkir luas, dan kafe.';
        }

        // 7. Check-in & Check-out Time
        if (
            str_contains($normalized, 'check in') ||
            str_contains($normalized, 'check out') ||
            str_contains($normalized, 'check-in') ||
            str_contains($normalized, 'check-out') ||
            str_contains($normalized, 'jam masuk') ||
            str_contains($normalized, 'jam keluar') ||
            str_contains($normalized, 'waktu check')
        ) {
            return "Waktu operasional check-in dan check-out di The Boe Cottage:\n\n".
                "• **Jam Check-in:** 15.00 WIB\n".
                "• **Jam Check-out:** 11.00 WIB\n\n".
                'Jika membutuhkan fleksibilitas waktu kedatangan atau early check-in, silakan konfirmasi terlebih dahulu dengan [WhatsApp Admin](https://wa.me/628214441271).';
        }

        // 8. Capacity & Extra Bed
        if (
            str_contains($normalized, 'kapasitas') ||
            str_contains($normalized, 'muat') ||
            str_contains($normalized, 'orang') ||
            str_contains($normalized, 'extra bed') ||
            str_contains($normalized, 'tambah kasur') ||
            str_contains($normalized, 'kasur tambahan')
        ) {
            return "Villa di **The Boe Cottage** (Daisy Room & Lily Room) masing-masing berkapasitas hingga **6 orang** dalam satu unit.\n\n".
                "Jika Anda memerlukan kasur tambahan, kami menyediakan single **Extra Bed** dengan biaya tambahan **Rp 300.000**.\n\n".
                'Sangat ideal untuk liburan keluarga, staycation bersama sahabat, atau grup kecil!';
        }

        // 9. Location, Maps & Scenery
        if (
            str_contains($normalized, 'lokasi') ||
            str_contains($normalized, 'alamat') ||
            str_contains($normalized, 'dimana') ||
            str_contains($normalized, 'peta') ||
            str_contains($normalized, 'maps') ||
            str_contains($normalized, 'rute') ||
            str_contains($normalized, 'view') ||
            str_contains($normalized, 'pemandangan') ||
            str_contains($normalized, 'lingkungan') ||
            str_contains($normalized, 'suasana')
        ) {
            return "**Lokasi & Suasana The Boe Cottage:**\n\n".
                "📍 **Alamat:** Desa Sumberejo, Kecamatan Batur, Kabupaten Banjarnegara, Jawa Tengah.\n".
                "🗺️ **Google Maps:** [Buka Google Maps](https://maps.app.goo.gl/928tTkkNCtnNvZ5Q9)\n\n".
                'Berada di kawasan dataran tinggi Dieng yang sejuk dan menenangkan, dikelilingi pemandangan perbukitan, hamparan perkebunan asri, serta udara segar khas pegunungan yang sangat menyegarkan pikiran.';
        }

        // 10. Tourist Attractions / Wisata Dieng
        if (
            str_contains($normalized, 'wisata') ||
            str_contains($normalized, 'destinasi') ||
            str_contains($normalized, 'kawah sikidang') ||
            str_contains($normalized, 'candi arjuna') ||
            str_contains($normalized, 'telaga warna') ||
            str_contains($normalized, 'bukit skoter') ||
            str_contains($normalized, 'telaga dringo') ||
            str_contains($normalized, 'jalan-jalan') ||
            str_contains($normalized, 'rekomendasi tempat')
        ) {
            return "Berikut rekomendasi destinasi wisata populer Dieng di sekitar The Boe Cottage:\n\n".
                "1. **Kawah Sikidang:** Kawah vulkanik aktif dengan aktivitas geothermal unik dan spot foto memukau.\n".
                "2. **Kompleks Candi Arjuna:** Wisata sejarah candi Hindu tertua di Jawa yang menjadi ikon Dieng.\n".
                "3. **Telaga Warna:** Danau alami berair warna-warni karena pantulan sinar matahari & belerang.\n".
                "4. **Bukit Skoter:** Spot terbaik melihat pemandangan Dieng dari ketinggian, sunrise emas, dan lautan awan.\n".
                "5. **Telaga Dringo:** Danau alami asri di lembah bukit hijau (sering dijuluki Ranu Kumbolo Jawa Tengah).\n".
                '6. **Sumur Jalatunda:** Sumur alami raksasa penuh legenda dan sejarah lokal Dieng.';
        }

        // 11. Check Availability / Booking Dates
        if (
            str_contains($normalized, 'ketersediaan') ||
            str_contains($normalized, 'available') ||
            str_contains($normalized, 'cek tanggal') ||
            str_contains($normalized, 'kosong') ||
            str_contains($normalized, 'booking') ||
            str_contains($normalized, 'reservasi') ||
            str_contains($normalized, 'pesan')
        ) {
            return "Untuk mengecek ketersediaan tanggal atau melakukan pemesanan langsung, Anda dapat membuka [Halaman Reservasi](/reservation).\n\n".
                "Atau Anda dapat mengisi format reservasi singkat berikut dan mengirimkannya ke Admin WhatsApp kami:\n\n".
                "• **Nama Pemesan :**\n".
                "• **Tanggal Check-in :**\n".
                "• **Tanggal Check-out :**\n".
                "• **Jumlah Tamu :**\n".
                "• **Pilihan Kamar :** Daisy Room / Lily Room / Belum Menentukan\n\n".
                '📲 [Kirim ke WhatsApp Admin (0821 4441 271)](https://wa.me/628214441271?text=Halo%20The%20Boe%20Cottage,%20saya%20ingin%20cek%20ketersediaan%20kamar)';
        }

        // 12. Contact Admin / WhatsApp
        if (
            str_contains($normalized, 'admin') ||
            str_contains($normalized, 'wa') ||
            str_contains($normalized, 'whatsapp') ||
            str_contains($normalized, 'kontak') ||
            str_contains($normalized, 'hubungi') ||
            str_contains($normalized, 'nomor') ||
            str_contains($normalized, 'telepon')
        ) {
            return "Anda dapat menghubungi tim Admin The Boe Cottage secara langsung melalui:\n\n".
                "• **WhatsApp:** 0821 4441 271\n".
                "• **Tautan Langsung:** [Chat WhatsApp Admin](https://wa.me/628214441271)\n\n".
                'Tim kami siap membantu segala pertanyaan mengenai ketersediaan kamar, sarapan, maupun paket BBQ & Steamboat.';
        }

        // 13. Gratitude / Closing
        if (
            str_contains($normalized, 'terima kasih') ||
            str_contains($normalized, 'makasih') ||
            str_contains($normalized, 'thanks') ||
            str_contains($normalized, 'thank you') ||
            str_contains($normalized, 'matur nuwun')
        ) {
            return 'Sama-sama! Senang bisa membantu Anda. Jika ada hal lain yang ingin ditanyakan seputar The Boe Cottage Dieng, jangan ragu untuk bertanya kembali atau hubungi kami di [WhatsApp](https://wa.me/628214441271). Semoga hari Anda menyenangkan!';
        }

        // 14. Introduction / General Greetings
        if (
            str_contains($normalized, 'halo') ||
            str_contains($normalized, 'hai') ||
            str_contains($normalized, 'salam') ||
            str_contains($normalized, 'pagi') ||
            str_contains($normalized, 'siang') ||
            str_contains($normalized, 'sore') ||
            str_contains($normalized, 'malam') ||
            str_contains($normalized, 'tentang') ||
            str_contains($normalized, 'profil') ||
            str_contains($normalized, 'boe cottage') ||
            str_contains($normalized, 'the boe')
        ) {
            return "Salam hangat dari The Boe Cottage! ✨\n\n".
                "The Boe Cottage merupakan villa di kawasan dataran tinggi Dieng, Jawa Tengah, yang menghadirkan suasana menginap hangat, nyaman, dan elegan berpadu dengan keindahan alam pegunungan.\n\n".
                "Kami memiliki 4 unit villa dengan dua tipe pilihan mezzanine:\n".
                "• **Daisy Room** (Rp 3.000.000/malam)\n".
                "• **Lily Room** (Rp 3.300.000/malam)\n\n".
                'Kapasitas masing-masing hingga 6 orang dengan bathtub, smart TV, dapur lengkap, dan balkon pribadi. Ada yang bisa saya bantu informasikan untuk rencana liburan Anda?';
        }

        // 15. Default Fallback
        return "Salam hangat dari **The Boe Cottage Dieng**! 🌿\n\n".
            "Kami siap membantu Anda merencanakan waktu liburan terbaik di dataran tinggi Dieng. Anda dapat menanyakan tentang:\n\n".
            "• **Perbedaan Daisy & Lily Room**\n".
            "• **Tarif & Ketentuan DP / Pembayaran**\n".
            "• **Fasilitas Kamar & Villa**\n".
            "• **Paket BBQ & Steamboat**\n".
            "• **Menu Sarapan (Breakfast)**\n".
            "• **Rekomendasi Wisata Dieng**\n".
            "• **Cek Ketersediaan Kamar**\n\n".
            'Atau hubungi langsung [WhatsApp Admin kami di 0821 4441 271](https://wa.me/628214441271) untuk bantuan cepat.';
    }
}
