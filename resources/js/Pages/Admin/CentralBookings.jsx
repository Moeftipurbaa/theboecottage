import { Head, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LanguageSwitch, useLanguage } from '../../Contexts/LanguageContext';

const SERVICE_FEE = 370000;

const uiCopy = {
    id: {
        pageTitle: 'Manajemen Reservasi — The Boe Cottage',
        heading: 'Direktori Tamu & Reservasi (CRUD)',
        subheading: 'Kelola seluruh siklus pesanan bergaya e-commerce: pantau timer pembayaran BCA, cetak struk lunas, ubah jadwal/kamar, hingga hapus data uji.',
        tabBookings: 'DAFTAR RESERVASI',
        tabGuests: 'DIREKTORI TAMU',
        totalBadge: 'TOTAL',
        profilesBadge: 'PROFIL',
        searchPlaceholder: 'Cari kode booking, no. struk, nama tamu, telepon, kamar...',
        newReservation: 'TAMBAH RESERVASI',
        cottageFilter: 'KAMAR:',
        allShelters: 'Semua Kamar',
        dateRangeBtn: 'Filter Rentang Tanggal',
        from: 'Dari',
        to: 'Sampai',
        clearDates: 'Reset',
        statusTabs: {
            all: 'Semua Pesanan',
            unpaid: 'Belum Bayar',
            confirmed: 'Terkonfirmasi / Siap Check-In',
            checked_in: 'Sedang Menginap',
            completed: 'Selesai',
            cancelled: 'Dibatalkan / Kedaluwarsa',
        },
        cols: {
            ref: 'KODE & STRUK',
            guest: 'TAMU & KONTAK',
            unit: 'KAMAR',
            dates: 'JADWAL & MALAM',
            party: 'TAMU',
            total: 'TOTAL TAGIHAN',
            payment: 'STATUS BAYAR',
            stay: 'STATUS MENGINAP',
            actions: 'AKSI CRUD',
        },
        paymentLabels: {
            paid: 'Lunas',
            unpaid: 'Belum Bayar',
            pending: 'Menunggu',
            expired: 'Kedaluwarsa',
            refunded: 'Refund',
            failed: 'Gagal',
        },
        stayLabels: {
            pending: 'Menunggu Bayar',
            confirmed: 'Siap Check-In',
            checked_in: 'Sedang Menginap',
            completed: 'Selesai',
            cancelled: 'Dibatalkan',
        },
        actions: {
            detail: 'Detail / Struk',
            edit: 'Edit',
            delete: 'Hapus',
            whatsapp: 'Hubungi via WA',
        },
        emptyBookings: 'Tidak ada pesanan pada kategori/filter ini.',
        emptyGuests: 'Tidak ada profil tamu yang cocok.',
        showing: 'Menampilkan',
        of: 'dari',
        reservationsWord: 'reservasi',
        guestProfilesWord: 'profil tamu',
        createModal: {
            eyebrow: 'Reservasi Manual / Walk-In / OTA',
            title: 'Tambah Reservasi Baru',
            save: 'SIMPAN RESERVASI',
            saving: 'MENYIMPAN...',
            cancel: 'BATAL',
        },
        editModal: {
            eyebrow: 'Edit Penuh & Reschedule Otomatis',
            title: 'Edit Reservasi',
            recalcNote: 'Harga otomatis dihitung ulang di server saat kamar atau tanggal diubah (termasuk biaya layanan Rp 370.000).',
            estimatedTotal: 'Estimasi Total Baru',
            save: 'SIMPAN PERUBAHAN',
            saving: 'MEMPERBARUI...',
            cancel: 'BATAL',
        },
        detailModal: {
            eyebrow: 'Detail Pesanan & Struk Digital',
            title: 'Rincian Reservasi',
            receiptReady: 'STRUK LUNAS RESMI',
            unpaidTimer: 'Sisa Waktu Pembayaran BCA',
            expiredLabel: 'Kedaluwarsa / Dibatalkan',
            receiptNo: 'No. Struk / Invoice',
            bookingCode: 'Kode Booking',
            paidAt: 'Waktu Lunas',
            guest: 'Nama Tamu',
            contact: 'Kontak',
            room: 'Kamar',
            dates: 'Tanggal Check-In – Check-Out',
            party: 'Jumlah Tamu',
            source: 'Sumber Pesanan',
            paymentMethod: 'Metode Pembayaran',
            notes: 'Catatan Tamu',
            total: 'Total Tagihan',
            printReceipt: 'Cetak / Simpan Struk (PDF)',
            markPaidQuick: 'Tandai Lunas & Buat Struk Sekarang',
            editBtn: 'Edit Reservasi',
            closeBtn: 'Tutup',
        },
        deleteModal: {
            title: 'Hapus Reservasi Permanen?',
            desc: 'Tindakan ini akan menghapus data reservasi secara permanen dari database dan membuka kembali tanggal kamar terkait.',
            confirm: 'YA, HAPUS PERMANEN',
            deleting: 'MENGHAPUS...',
            cancel: 'BATAL',
        },
        fields: {
            guestName: 'Nama Tamu *',
            guestEmail: 'Email Tamu',
            guestPhone: 'No. Telepon / WhatsApp *',
            room: 'Pilih Kamar *',
            channel: 'Sumber / Channel',
            checkIn: 'Tanggal Check-In *',
            checkOut: 'Tanggal Check-Out *',
            guestsCount: 'Jumlah Tamu (Orang) *',
            paymentStatus: 'Status Pembayaran',
            stayStatus: 'Status Menginap',
            notes: 'Catatan / Permintaan Khusus',
        },
        waAdminTemplate: 'Halo {name}, kami dari Admin The Boe Cottage Dieng ingin mengonfirmasi reservasi Anda ({code}{receipt}) untuk {room} pada tanggal {dates}. Apakah ada hal atau penyesuaian jadwal yang dapat kami bantu?',
    },
    en: {
        pageTitle: 'Central Bookings — The Boe Cottage',
        heading: 'Guest & Booking Directory (CRUD)',
        subheading: 'Full e-commerce reservation management: monitor live BCA timers, print official receipts, reschedule rooms/dates, and remove test records.',
        tabBookings: 'CENTRAL BOOKINGS',
        tabGuests: 'GUEST DIRECTORY',
        totalBadge: 'TOTAL',
        profilesBadge: 'PROFILES',
        searchPlaceholder: 'Search booking code, receipt no, guest, phone, room...',
        newReservation: 'NEW RESERVATION',
        cottageFilter: 'COTTAGE:',
        allShelters: 'All Shelters',
        dateRangeBtn: 'Filter by Date Range',
        from: 'From',
        to: 'To',
        clearDates: 'Reset',
        statusTabs: {
            all: 'All Orders',
            unpaid: 'Unpaid',
            confirmed: 'Confirmed / Ready',
            checked_in: 'Checked-In',
            completed: 'Completed',
            cancelled: 'Cancelled / Expired',
        },
        cols: {
            ref: 'REF & RECEIPT',
            guest: 'GUEST & CONTACT',
            unit: 'ASSIGNED UNIT',
            dates: 'DATES & NIGHTS',
            party: 'PARTY',
            total: 'TOTAL BILLED',
            payment: 'PAYMENT STATUS',
            stay: 'STAY STATUS',
            actions: 'CRUD ACTIONS',
        },
        paymentLabels: {
            paid: 'Paid',
            unpaid: 'Unpaid',
            pending: 'Pending',
            expired: 'Expired',
            refunded: 'Refunded',
            failed: 'Failed',
        },
        stayLabels: {
            pending: 'Awaiting Payment',
            confirmed: 'Ready for Check-In',
            checked_in: 'Checked-In',
            completed: 'Completed',
            cancelled: 'Cancelled',
        },
        actions: {
            detail: 'Detail / Receipt',
            edit: 'Edit',
            delete: 'Delete',
            whatsapp: 'Message on WA',
        },
        emptyBookings: 'No reservations match this status tab or filter.',
        emptyGuests: 'No guest profiles match your search.',
        showing: 'Showing',
        of: 'of',
        reservationsWord: 'reservations',
        guestProfilesWord: 'guest profiles',
        createModal: {
            eyebrow: 'Manual / Walk-In / OTA Reservation',
            title: 'New Reservation',
            save: 'CREATE RESERVATION',
            saving: 'SAVING...',
            cancel: 'CANCEL',
        },
        editModal: {
            eyebrow: 'Full Edit & Auto Price Recalculation',
            title: 'Edit Reservation',
            recalcNote: 'Price is automatically recalculated server-side when room or dates change (including IDR 370,000 service fee).',
            estimatedTotal: 'Estimated New Total',
            save: 'SAVE CHANGES',
            saving: 'UPDATING...',
            cancel: 'CANCEL',
        },
        detailModal: {
            eyebrow: 'Order Details & Official Digital Receipt',
            title: 'Reservation Details',
            receiptReady: 'OFFICIAL PAID RECEIPT',
            unpaidTimer: 'BCA Payment Time Remaining',
            expiredLabel: 'Expired / Cancelled',
            receiptNo: 'Receipt / Invoice No.',
            bookingCode: 'Booking Code',
            paidAt: 'Paid Timestamp',
            guest: 'Guest Name',
            contact: 'Contact Info',
            room: 'Assigned Cottage',
            dates: 'Check-In – Check-Out',
            party: 'Party Size',
            source: 'Booking Channel',
            paymentMethod: 'Payment Method',
            notes: 'Guest Notes',
            total: 'Total Billed',
            printReceipt: 'Print / Save Receipt (PDF)',
            markPaidQuick: 'Mark as Paid & Generate Receipt Now',
            editBtn: 'Edit Reservation',
            closeBtn: 'Close',
        },
        deleteModal: {
            title: 'Permanently Delete Reservation?',
            desc: 'This action will permanently remove the booking record from the database and immediately release its room dates.',
            confirm: 'YES, DELETE PERMANENTLY',
            deleting: 'DELETING...',
            cancel: 'CANCEL',
        },
        fields: {
            guestName: 'Guest Name *',
            guestEmail: 'Guest Email',
            guestPhone: 'Phone / WhatsApp *',
            room: 'Select Cottage *',
            channel: 'Booking Channel',
            checkIn: 'Check-In Date *',
            checkOut: 'Check-Out Date *',
            guestsCount: 'Party Size (Guests) *',
            paymentStatus: 'Payment Status',
            stayStatus: 'Stay Status',
            notes: 'Special Requests / Notes',
        },
        waAdminTemplate: 'Hello {name}, this is The Boe Cottage Dieng Admin regarding your reservation ({code}{receipt}) for {room} on {dates}. Please let us know if we can assist with your arrival or any schedule adjustments.',
    },
};

const formatDate = (value, lang = 'id') => {
    if (!value) return lang === 'id' ? 'Semua tanggal' : 'All dates';
    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    return new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString(locale, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

function formatCountdown(secondsLeft) {
    const clamped = Math.max(0, Math.floor(secondsLeft));
    const minutes = String(Math.floor(clamped / 60)).padStart(2, '0');
    const seconds = String(clamped % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function Icon({ name, className = 'h-4 w-4' }) {
    const icons = {
        grid: (
            <>
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
            </>
        ),
        bookings: (
            <>
                <path d="M8 3h8M8 7h8M8 11h5" />
                <path d="M5 2h14v20l-7-4-7 4z" />
            </>
        ),
        search: (
            <>
                <circle cx="10.8" cy="10.8" r="6.2" />
                <path d="m16 16 4.2 4.2" />
            </>
        ),
        bell: (
            <>
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
            </>
        ),
        calendar: (
            <>
                <rect x="3.5" y="5" width="17" height="16" rx="1.5" />
                <path d="M7.5 3v4M16.5 3v4M4 9h16" />
            </>
        ),
        chevron: <path d="m9 18 6-6-6-6" />,
        logout: (
            <>
                <path d="M10 17l5-5-5-5M15 12H3" />
                <path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" />
            </>
        ),
        eye: (
            <>
                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                <circle cx="12" cy="12" r="2.5" />
            </>
        ),
        edit: (
            <>
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </>
        ),
        trash: (
            <>
                <path d="M3 6h18" />
                <path d="M8 6V4h8v2m-9 0v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6" />
                <path d="M10 11v6m4-6v6" />
            </>
        ),
        whatsapp: (
            <path d="M20 11.5a8.5 8.5 0 0 1-12.5 7.5L3 20l1.2-4.3A8.5 8.5 0 1 1 20 11.5Zm-8.5-5a5 5 0 0 0-4.3 7.5l.3.5-.5 1.8 1.9-.5.5.3a5 5 0 1 0 2.1-9.6Z" />
        ),
    };

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {icons[name]}
        </svg>
    );
}

function AdminSidebar({ onLogout, userName }) {
    return (
        <aside className="print:hidden fixed inset-y-0 left-0 z-40 hidden w-[200px] flex-col border-r border-[#E7E4DC] bg-[#F3F1EB] px-4 py-5 md:flex">
            <a href="/" className="mb-9 flex items-start gap-2.5 px-1 text-[#1E322A] no-underline">
                <span aria-hidden="true" className="mt-1.5 h-2 w-2 rotate-45 bg-[#AE8A66]" />
                <span>
                    <span className="block font-serif text-[17px] leading-5">The Boe Cottage</span>
                    <span className="mt-1 block font-sans text-[8px] font-semibold tracking-[0.18em] text-[#747873]">STAFF LEDGER</span>
                </span>
            </a>

            <nav aria-label="Admin navigation" className="space-y-1">
                <a
                    href="/admin-dashboard"
                    className="flex h-9 items-center gap-2 rounded-sm px-3 text-[10px] font-medium tracking-[0.06em] text-[#363D37] transition-colors hover:bg-white/70"
                >
                    <Icon name="grid" className="h-3.5 w-3.5" />
                    DASHBOARD
                </a>
                <a
                    href="/central-bookings"
                    aria-current="page"
                    className="flex h-9 items-center gap-2 rounded-sm bg-[#1E322A] px-3 text-[10px] font-medium tracking-[0.06em] text-white"
                >
                    <Icon name="bookings" className="h-3.5 w-3.5" />
                    CENTRAL BOOKINGS
                </a>
            </nav>

            <div className="mt-auto border-t border-[#E1DED6] pt-4">
                <div className="flex items-center gap-2.5 px-1">
                    <span className="flex h-8 w-8 items-center justify-center bg-[#E3E8E2] text-[11px] text-[#346B55]">LD</span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[10px] font-semibold">{userName || 'Lead Desk'}</span>
                        <span className="block text-[8px] tracking-[0.05em] text-[#747873]">Duty Steward</span>
                    </span>
                    <span aria-hidden="true" className="text-[12px] text-[#5A615B]">•</span>
                </div>
                <button
                    type="button"
                    onClick={onLogout}
                    className="mt-4 flex w-full items-center justify-end gap-2 px-1 text-[9px] font-semibold tracking-[0.1em] text-[#AE5535] transition-colors hover:text-[#8E3D24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"
                >
                    <Icon name="logout" className="h-3.5 w-3.5" />
                    LOG OUT
                </button>
            </div>
        </aside>
    );
}

function getInitials(name = '') {
    return (
        String(name)
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('') || 'G'
    );
}

/**
 * Determine which e-commerce status tab a booking belongs to.
 */
function resolveOrderCategory(booking) {
    if (booking.status === 'cancelled' || booking.payment_status === 'expired') {
        return 'cancelled';
    }
    if (booking.check_in_status === 'checked_out') {
        return 'completed';
    }
    if (booking.check_in_status === 'checked_in') {
        return 'checked_in';
    }
    if (booking.payment_status === 'paid' && booking.status === 'confirmed') {
        return 'confirmed';
    }
    return 'unpaid';
}

function mapBookingRecord(booking, index, copy, lang) {
    const checkIn = String(booking.check_in).slice(0, 10);
    const checkOut = String(booking.check_out).slice(0, 10);
    const nights = Math.max(1, Math.round((new Date(`${checkOut}T12:00:00`) - new Date(`${checkIn}T12:00:00`)) / 86400000));
    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const startShort = new Date(`${checkIn}T12:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    const endShort = new Date(`${checkOut}T12:00:00`).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

    const sourceMap = {
        direct: 'Direct Web',
        airbnb: 'Airbnb',
        tiket_com: 'Tiket.com',
        booking_com: 'Booking.com',
        agoda: 'Agoda',
        whatsapp: 'WhatsApp',
        manual: 'Manual Desk',
    };

    const avatarStyles = [
        'bg-[#D9EBDD] text-[#315B3E]',
        'bg-[#F8D9CE] text-[#93452E]',
        'bg-[#18372B] text-white',
        'bg-[#E6E5E0] text-[#535751]',
    ];

    const isRefunded = booking.payment_type === 'Refunded';
    const isPaid = booking.payment_status === 'paid';
    const paymentKey = isRefunded ? 'refunded' : booking.payment_status || 'unpaid';
    const paymentLabel = copy.paymentLabels[paymentKey] || paymentKey;
    const paymentDetail = booking.payment_type || (isPaid ? 'BCA Verified' : 'BCA Transfer');

    const paymentStyle = isPaid
        ? 'bg-[#D5EAD9] text-[#254A31]'
        : isRefunded
          ? 'bg-[#E6E5E0] text-[#404640]'
          : 'bg-[#FADBD1] text-[#743E2D]';

    const category = resolveOrderCategory(booking);
    let unifiedStayKey = 'confirmed';
    let statusStyle = 'bg-[#DCE9DF] text-[#254A31]';

    if (category === 'cancelled') {
        unifiedStayKey = 'cancelled';
        statusStyle = 'bg-[#FADBD1] text-[#743E2D]';
    } else if (category === 'completed') {
        unifiedStayKey = 'completed';
        statusStyle = 'bg-[#E6E5E0] text-[#303832]';
    } else if (category === 'checked_in') {
        unifiedStayKey = 'checked_in';
        statusStyle = 'bg-[#1E322A] text-white';
    } else if (category === 'unpaid') {
        unifiedStayKey = 'pending';
        statusStyle = 'bg-[#FBE7C6] text-[#6E4B1F]';
    }

    return {
        raw: booking,
        id: booking.id,
        bookingCode: booking.booking_code,
        ref: `#${booking.booking_code}`,
        receiptNumber: booking.receipt_number || null,
        channel: sourceMap[booking.source] || booking.source,
        rawSource: booking.source || 'direct',
        guest: booking.guest_name,
        email: booking.guest_email || '',
        phone: booking.guest_phone || booking.guest_email || '—',
        rawPhone: booking.guest_phone || '',
        initials: getInitials(booking.guest_name),
        avatar: avatarStyles[index % avatarStyles.length],
        roomId: booking.room_id,
        unit: booking.room?.name || 'Cottage',
        dates: `${startShort} – ${endShort}`,
        checkIn,
        checkOut,
        nights,
        stay: `${nights} ${lang === 'id' ? 'Malam' : nights === 1 ? 'Night' : 'Nights'}`,
        adults: Number(booking.adults) || 1,
        children: Number(booking.children) || 0,
        party: (Number(booking.adults) || 1) + (Number(booking.children) || 0),
        notes: booking.notes || '',
        total: Number(booking.total_price) || 0,
        payment: paymentLabel,
        paymentKey,
        paymentDetail,
        paymentStyle,
        status: copy.stayLabels[unifiedStayKey] || unifiedStayKey,
        unifiedStayKey,
        category,
        rawStatus: booking.status,
        rawCheckInStatus: booking.check_in_status,
        paymentExpiresAt: booking.payment_expires_at || null,
        paidAt: booking.paid_at || null,
        statusStyle,
    };
}

export default function CentralBookings({ bookings: initialBookings = [], rooms = [] }) {
    const { auth } = usePage().props;
    const { lang, formatPrice } = useLanguage();
    const copy = uiCopy[lang] || uiCopy.id;

    const [bookingsList, setBookingsList] = useState(initialBookings);
    const [nowMs, setNowMs] = useState(() => Date.now());
    const [statusBanner, setStatusBanner] = useState(null);

    useEffect(() => {
        setBookingsList(initialBookings);
    }, [initialBookings]);

    const reservations = useMemo(
        () => bookingsList.map((b, idx) => mapBookingRecord(b, idx, copy, lang)),
        [bookingsList, copy, lang]
    );

    const todayStr = new Date().toISOString().slice(0, 10);
    const defaultNextStr = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

    const [filters, setFilters] = useState({
        search: '',
        cottage: 'All Shelters',
        dateFrom: '',
        dateTo: '',
        statusCategory: 'all',
    });

    const [reservationFormData, setReservationFormData] = useState({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        room_id: rooms[0]?.id || '',
        check_in: todayStr,
        check_out: defaultNextStr,
        adults: 2,
        children: 0,
        source: 'manual',
        payment_status: 'paid',
        notes: '',
    });

    // CRUD Modal States
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [detailReservation, setDetailReservation] = useState(null);
    const [editingReservation, setEditingReservation] = useState(null);
    const [editFormData, setEditFormData] = useState(null);
    const [deletingReservation, setDeletingReservation] = useState(null);

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('bookings');
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const expireInFlightRef = useRef(false);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const triggerExpireOverdue = useCallback(async () => {
        if (expireInFlightRef.current) return;
        expireInFlightRef.current = true;
        try {
            const response = await window.axios.post('/admin/bookings/expire-overdue');
            if (Array.isArray(response.data?.bookings)) {
                setBookingsList(response.data.bookings);
            }
        } catch {
            // Ignore transient errors
        } finally {
            expireInFlightRef.current = false;
        }
    }, []);

    // 1-second ticker for live unpaid BCA countdowns + automatic transition when any row hits 00:00
    useEffect(() => {
        const hasActiveUnpaidTimer = bookingsList.some(
            (b) => b.status === 'pending' && b.payment_status !== 'paid' && b.payment_expires_at
        );
        if (!hasActiveUnpaidTimer) return undefined;

        const timerId = window.setInterval(() => {
            const currentNow = Date.now();
            setNowMs(currentNow);

            const justExpired = bookingsList.some((b) => {
                if (b.status !== 'pending' || b.payment_status === 'paid' || !b.payment_expires_at) {
                    return false;
                }
                return new Date(b.payment_expires_at).getTime() <= currentNow;
            });

            if (justExpired) {
                triggerExpireOverdue();
            }
        }, 1000);

        return () => window.clearInterval(timerId);
    }, [bookingsList, triggerExpireOverdue]);

    // Base filtered list (before status tab selection, so tab badge counts stay accurate)
    const baseFilteredReservations = useMemo(
        () =>
            reservations.filter((reservation) => {
                const matchesSearch = `${reservation.ref} ${reservation.receiptNumber || ''} ${reservation.guest} ${reservation.phone} ${reservation.email} ${reservation.unit} ${reservation.channel}`
                    .toLowerCase()
                    .includes(filters.search.toLowerCase());
                const matchesCottage =
                    filters.cottage === 'All Shelters' ||
                    reservation.unit.toLowerCase().startsWith(filters.cottage.toLowerCase());
                const matchesFrom = !filters.dateFrom || reservation.checkOut >= filters.dateFrom;
                const matchesTo = !filters.dateTo || reservation.checkIn <= filters.dateTo;

                return matchesSearch && matchesCottage && matchesFrom && matchesTo;
            }),
        [reservations, filters.search, filters.cottage, filters.dateFrom, filters.dateTo]
    );

    const categoryCounts = useMemo(() => {
        const counts = {
            all: baseFilteredReservations.length,
            unpaid: 0,
            confirmed: 0,
            checked_in: 0,
            completed: 0,
            cancelled: 0,
        };
        baseFilteredReservations.forEach((r) => {
            if (counts[r.category] !== undefined) {
                counts[r.category] += 1;
            }
        });
        return counts;
    }, [baseFilteredReservations]);

    const filteredReservations = useMemo(() => {
        if (filters.statusCategory === 'all') return baseFilteredReservations;
        return baseFilteredReservations.filter((r) => r.category === filters.statusCategory);
    }, [baseFilteredReservations, filters.statusCategory]);

    const filteredGuests = useMemo(() => {
        const guests = new Map();
        baseFilteredReservations.forEach((reservation) => {
            const current = guests.get(reservation.guest) || {
                name: reservation.guest,
                phone: reservation.phone,
                initials: reservation.initials,
                avatar: reservation.avatar,
                reservations: 0,
                units: new Set(),
            };
            current.reservations += 1;
            current.units.add(reservation.unit);
            guests.set(reservation.guest, current);
        });
        return Array.from(guests.values()).map((guest) => ({ ...guest, units: [...guest.units] }));
    }, [baseFilteredReservations]);

    useEffect(() => {
        function closeDropdownsOnOutsideClick(event) {
            if (!notificationRef.current?.contains(event.target)) {
                setIsNotifOpen(false);
            }
            if (!profileRef.current?.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', closeDropdownsOnOutsideClick);
        return () => document.removeEventListener('mousedown', closeDropdownsOnOutsideClick);
    }, []);

    async function handleLogout() {
        setIsProfileOpen(false);
        try {
            await window.axios.post('/logout');
            router.visit('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    function updateFilters(event) {
        const { name, value } = event.target;
        setFilters((current) => ({ ...current, [name]: value }));
    }

    function openEditModal(reservation) {
        setFormError('');
        setEditingReservation(reservation);
        setEditFormData({
            room_id: reservation.roomId || rooms[0]?.id || '',
            guest_name: reservation.guest || '',
            guest_email: reservation.email || '',
            guest_phone: reservation.rawPhone || '',
            check_in: reservation.checkIn,
            check_out: reservation.checkOut,
            guests_count: reservation.party || 2,
            source: reservation.rawSource || 'direct',
            payment_status: reservation.paymentKey || 'unpaid',
            status: reservation.unifiedStayKey || 'confirmed',
            notes: reservation.notes || '',
        });
    }

    // Live price preview inside the Edit Modal when room or dates change
    const editEstimatedTotal = useMemo(() => {
        if (!editFormData?.check_in || !editFormData?.check_out || editFormData.check_out <= editFormData.check_in) {
            return 0;
        }
        const selectedRoom = rooms.find((r) => Number(r.id) === Number(editFormData.room_id)) || rooms[0];
        const basePrice = Number(selectedRoom?.price_per_night) || 3000000;
        const nights = Math.max(
            0,
            Math.round(
                (new Date(`${editFormData.check_out}T12:00:00`) - new Date(`${editFormData.check_in}T12:00:00`)) / 86400000
            )
        );
        return nights > 0 ? nights * basePrice + SERVICE_FEE : 0;
    }, [editFormData, rooms]);

    async function handleCreateReservation(event) {
        event.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            const response = await window.axios.post('/admin/bookings', reservationFormData);
            const created = response.data?.booking;
            if (created) {
                setBookingsList((prev) => [created, ...prev]);
            } else {
                router.reload();
            }
            setIsCreateOpen(false);
            setStatusBanner({ type: 'success', message: response.data?.message || 'Reservation created.' });
            setReservationFormData({
                guest_name: '',
                guest_email: '',
                guest_phone: '',
                room_id: rooms[0]?.id || '',
                check_in: todayStr,
                check_out: defaultNextStr,
                adults: 2,
                children: 0,
                source: 'manual',
                payment_status: 'paid',
                notes: '',
            });
        } catch (error) {
            const validationErrors = error.response?.data?.errors;
            const firstMsg = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : error.response?.data?.message;
            setFormError(firstMsg || 'Failed to create reservation.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleUpdateReservation(event) {
        event.preventDefault();
        if (!editingReservation || !editFormData) return;
        setFormError('');
        setSubmitting(true);

        try {
            const response = await window.axios.put(`/admin/bookings/${editingReservation.id}`, editFormData);
            const updated = response.data?.booking;
            if (updated) {
                setBookingsList((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
            }
            setEditingReservation(null);
            setEditFormData(null);
            setStatusBanner({ type: 'success', message: response.data?.message || 'Reservation updated.' });
        } catch (error) {
            const validationErrors = error.response?.data?.errors;
            const firstMsg = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : error.response?.data?.message;
            setFormError(firstMsg || 'Failed to update reservation.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleQuickMarkPaid(reservation) {
        setSubmitting(true);
        try {
            const response = await window.axios.patch(`/admin/bookings/${reservation.id}`, {
                payment_status: 'paid',
                status: 'confirmed',
            });
            const updated = response.data?.booking;
            if (updated) {
                setBookingsList((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
                const remapped = mapBookingRecord(updated, 0, copy, lang);
                setDetailReservation(remapped);
            }
            setStatusBanner({ type: 'success', message: response.data?.message || 'Marked as paid.' });
        } catch (error) {
            setStatusBanner({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update payment status.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteReservation() {
        if (!deletingReservation) return;
        setSubmitting(true);
        try {
            const response = await window.axios.delete(`/admin/bookings/${deletingReservation.id}`);
            setBookingsList((prev) => prev.filter((b) => b.id !== deletingReservation.id));
            setDeletingReservation(null);
            setStatusBanner({ type: 'success', message: response.data?.message || 'Reservation deleted.' });
        } catch (error) {
            setStatusBanner({
                type: 'error',
                message: error.response?.data?.message || 'Failed to delete reservation.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    function buildWhatsAppUrl(reservation) {
        const cleanDigits = String(reservation.rawPhone || '').replace(/[^\d]/g, '');
        const normalizedPhone = cleanDigits.startsWith('0')
            ? `62${cleanDigits.slice(1)}`
            : cleanDigits.startsWith('62')
              ? cleanDigits
              : '6288887879999';

        const receiptPart = reservation.receiptNumber ? `, Struk: ${reservation.receiptNumber}` : '';
        const text = copy.waAdminTemplate
            .replace('{name}', reservation.guest)
            .replace('{code}', reservation.ref)
            .replace('{receipt}', receiptPart)
            .replace('{room}', reservation.unit)
            .replace('{dates}', reservation.dates);

        return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
    }

    const statusTabs = [
        { key: 'all', label: copy.statusTabs.all, count: categoryCounts.all },
        { key: 'unpaid', label: copy.statusTabs.unpaid, count: categoryCounts.unpaid, highlight: 'amber' },
        { key: 'confirmed', label: copy.statusTabs.confirmed, count: categoryCounts.confirmed, highlight: 'green' },
        { key: 'checked_in', label: copy.statusTabs.checked_in, count: categoryCounts.checked_in },
        { key: 'completed', label: copy.statusTabs.completed, count: categoryCounts.completed },
        { key: 'cancelled', label: copy.statusTabs.cancelled, count: categoryCounts.cancelled, highlight: 'red' },
    ];

    return (
        <>
            <Head title={copy.pageTitle} />
            <div className="min-h-screen bg-[#FBF9F4] font-sans text-[#1E322A]">
                <AdminSidebar onLogout={handleLogout} userName={auth?.user?.name} />
                <main className="min-h-screen md:ml-[200px] print:ml-0">
                    <header className="print:hidden sticky top-0 z-30 border-b border-[#EAE7DF] bg-[#FBF9F4]/95 backdrop-blur-xs">
                        <div className="flex min-h-[54px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
                            <div className="flex min-w-0 items-center gap-2">
                                <a href="/" className="mr-2 flex shrink-0 items-center gap-2 lg:hidden">
                                    <span className="font-serif text-sm">The Boe Cottage</span>
                                </a>
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#346B55]" />
                                <p className="truncate text-[8px] font-semibold tracking-[0.11em] text-[#4D544E] sm:text-[9px]">
                                    HIGHLAND DISPATCH SYNC <span className="px-1 text-[#AE8A66]">•</span> ACTIVE LEDGER
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3">
                                <LanguageSwitch />

                                <button
                                    type="button"
                                    aria-label="Search bookings"
                                    onClick={() => document.getElementById('reservation-search')?.focus()}
                                    className="text-[#3C453E] hover:text-[#346B55]"
                                >
                                    <Icon name="search" className="h-4 w-4" />
                                </button>
                                <div ref={notificationRef} className="relative">
                                    <button
                                        type="button"
                                        aria-label="Notifications"
                                        aria-expanded={isNotifOpen}
                                        onClick={() => {
                                            setIsNotifOpen((open) => !open);
                                            setIsProfileOpen(false);
                                        }}
                                        className="relative text-[#3C453E] hover:text-[#346B55]"
                                    >
                                        <Icon name="bell" className="h-4 w-4" />
                                        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#AE5535]" />
                                    </button>
                                    {isNotifOpen && (
                                        <div role="status" className="absolute right-0 z-50 mt-2 w-64 border border-gray-100 bg-white p-4 shadow-lg">
                                            <p className="text-[11px] leading-relaxed text-gray-600">
                                                {reservations.length} {copy.reservationsWord} ({categoryCounts.unpaid} {copy.statusTabs.unpaid}).
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div ref={profileRef} className="relative">
                                    <button
                                        type="button"
                                        aria-label="Staff profile"
                                        aria-expanded={isProfileOpen}
                                        onClick={() => {
                                            setIsProfileOpen((open) => !open);
                                            setIsNotifOpen(false);
                                        }}
                                        className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#1E322A] text-[9px] font-semibold text-white"
                                    >
                                        LD
                                    </button>
                                    {isProfileOpen && (
                                        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-100 bg-white p-4 shadow-lg">
                                            <p className="text-sm font-bold text-gray-800">{auth?.user?.name || 'Lead Desk'}</p>
                                            <p className="mt-1 text-xs text-gray-500">{auth?.user?.email || 'admin@theboecottage.com'}</p>
                                            <div className="my-3 border-t border-gray-100" />
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="text-xs font-medium text-[#AE5535] transition-colors hover:text-[#8E3D24]"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <nav aria-label="Admin navigation" className="flex gap-2 border-t border-[#EAE7DF] px-5 py-2 md:hidden">
                            <a href="/admin-dashboard" className="rounded-sm px-3 py-1.5 text-[9px] font-medium text-[#363D37] hover:bg-white">
                                DASHBOARD
                            </a>
                            <a href="/central-bookings" aria-current="page" className="rounded-sm bg-[#1E322A] px-3 py-1.5 text-[9px] font-medium text-white">
                                CENTRAL BOOKINGS
                            </a>
                        </nav>
                    </header>

                    <div className="print:hidden mx-auto max-w-[1500px] px-5 pb-10 pt-7 sm:px-8 lg:px-10 lg:pt-9">
                        {statusBanner && (
                            <div
                                role="status"
                                className={`mb-5 flex items-center justify-between border px-4 py-2.5 text-xs ${
                                    statusBanner.type === 'error'
                                        ? 'border-[#AE5535] bg-[#FADBD1] text-[#743E2D]'
                                        : 'border-[#346B55] bg-[#DCE9DF] text-[#1E322A]'
                                }`}
                            >
                                <span>{statusBanner.message}</span>
                                <button type="button" onClick={() => setStatusBanner(null)} className="ml-4 font-bold">
                                    ×
                                </button>
                            </div>
                        )}

                        <section aria-labelledby="bookings-heading">
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <h1 id="bookings-heading" className="font-serif text-[30px] font-normal leading-[1.08] tracking-[-0.035em] sm:text-[38px]">
                                        {copy.heading}
                                    </h1>
                                    <p className="mt-1.5 max-w-[650px] text-[11px] leading-relaxed text-[#687069]">
                                        {copy.subheading}
                                    </p>
                                </div>

                                <div role="tablist" aria-label="Booking directory sections" className="no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-md bg-[#F0EFEA] p-1.5">
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === 'bookings'}
                                        onClick={() => setActiveTab('bookings')}
                                        className={`flex shrink-0 items-center gap-2 rounded px-3 py-2 text-[9px] tracking-[0.04em] transition-colors ${
                                            activeTab === 'bookings'
                                                ? 'bg-white font-semibold text-[#1E322A] shadow-xs'
                                                : 'font-medium text-[#555C56] hover:bg-white/60'
                                        }`}
                                    >
                                        <Icon name="bookings" className="h-3.5 w-3.5" />
                                        {copy.tabBookings}
                                        <span
                                            className={`px-1.5 py-0.5 text-[8px] font-bold tracking-[0.08em] ${
                                                activeTab === 'bookings' ? 'bg-[#DCE9DF] text-[#315642]' : 'bg-[#E7E6E1] text-[#555C56]'
                                            }`}
                                        >
                                            {reservations.length} {copy.totalBadge}
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={activeTab === 'guests'}
                                        onClick={() => setActiveTab('guests')}
                                        className={`flex shrink-0 items-center gap-2 rounded px-3 py-2 text-[9px] tracking-[0.04em] transition-colors ${
                                            activeTab === 'guests'
                                                ? 'bg-white font-semibold text-[#1E322A] shadow-xs'
                                                : 'font-medium text-[#555C56] hover:bg-white/60'
                                        }`}
                                    >
                                        <Icon name="bookings" className="h-3.5 w-3.5" />
                                        {copy.tabGuests}
                                        <span
                                            className={`px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.08em] ${
                                                activeTab === 'guests' ? 'bg-[#DCE9DF] font-bold text-[#315642]' : 'bg-[#E7E6E1] text-[#555C56]'
                                            }`}
                                        >
                                            {filteredGuests.length} {copy.profilesBadge}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Search, Cottage Filter, Date Range & New Reservation Bar */}
                        <section aria-label="Reservation filters" className="mt-5 rounded-lg bg-[#F4F2ED] p-4 sm:p-5">
                            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:max-w-[min(100%,480px)]">
                                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#566058]" />
                                    <label htmlFor="reservation-search" className="sr-only">
                                        {copy.searchPlaceholder}
                                    </label>
                                    <input
                                        id="reservation-search"
                                        type="search"
                                        name="search"
                                        value={filters.search}
                                        onChange={updateFilters}
                                        placeholder={copy.searchPlaceholder}
                                        className="h-9 w-full rounded-md border border-[#EBE9E3] bg-[#FBFAF7] pl-9 pr-3 text-[11px] text-[#27352C] outline-none transition placeholder:text-[#8A8F89] focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormError('');
                                        setIsCreateOpen(true);
                                    }}
                                    className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-[#A34E2C] px-4 text-[10px] font-bold tracking-[0.06em] text-white transition-colors hover:bg-[#873E23]"
                                >
                                    <span className="mr-1.5 text-sm leading-none">+</span>
                                    {copy.newReservation}
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <label
                                    htmlFor="cottage-filter"
                                    className="flex h-8 items-center gap-2 rounded bg-[#FBFAF7] px-3 text-[9px] font-semibold tracking-[0.07em] text-[#60665F]"
                                >
                                    {copy.cottageFilter}
                                    <select
                                        id="cottage-filter"
                                        name="cottage"
                                        value={filters.cottage}
                                        onChange={updateFilters}
                                        className="bg-transparent text-[10px] font-semibold tracking-normal text-[#28372D] outline-none"
                                    >
                                        <option value="All Shelters">{copy.allShelters}</option>
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.name}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <div className="relative">
                                    <button
                                        type="button"
                                        aria-expanded={isDateFilterOpen}
                                        onClick={() => setIsDateFilterOpen((open) => !open)}
                                        className="inline-flex h-8 items-center gap-2 rounded bg-[#FBFAF7] px-3 text-[10px] font-medium text-[#454C46] transition-colors hover:bg-white"
                                    >
                                        <Icon name="calendar" className="h-3.5 w-3.5 text-[#A34E2C]" />
                                        {filters.dateFrom || filters.dateTo
                                            ? `${formatDate(filters.dateFrom, lang)} – ${formatDate(filters.dateTo, lang)}`
                                            : copy.dateRangeBtn}
                                    </button>
                                    {isDateFilterOpen && (
                                        <div className="absolute left-0 z-20 mt-2 grid w-72 gap-3 rounded-md border border-[#E5E2DA] bg-white p-3.5 shadow-lg sm:grid-cols-2">
                                            <label className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                                {copy.from}
                                                <input
                                                    type="date"
                                                    name="dateFrom"
                                                    value={filters.dateFrom}
                                                    max={filters.dateTo || undefined}
                                                    onChange={updateFilters}
                                                    className="mt-1.5 h-8 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-2 text-[10px] font-normal text-[#27352C]"
                                                />
                                            </label>
                                            <label className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                                {copy.to}
                                                <input
                                                    type="date"
                                                    name="dateTo"
                                                    value={filters.dateTo}
                                                    min={filters.dateFrom || undefined}
                                                    onChange={updateFilters}
                                                    className="mt-1.5 h-8 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-2 text-[10px] font-normal text-[#27352C]"
                                                />
                                            </label>
                                            {(filters.dateFrom || filters.dateTo) && (
                                                <button
                                                    type="button"
                                                    onClick={() => setFilters((c) => ({ ...c, dateFrom: '', dateTo: '' }))}
                                                    className="col-span-full text-right text-[10px] font-semibold text-[#AE5535] underline"
                                                >
                                                    {copy.clearDates}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* E-Commerce (Olshop) Style Status Category Tabs */}
                            {activeTab === 'bookings' && (
                                <div
                                    role="tablist"
                                    aria-label="Order status categories"
                                    className="no-scrollbar mt-4 flex items-center gap-1.5 overflow-x-auto border-t border-[#E5E2DA] pt-3.5"
                                >
                                    {statusTabs.map((tab) => {
                                        const selected = filters.statusCategory === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                type="button"
                                                role="tab"
                                                aria-selected={selected}
                                                onClick={() => setFilters((c) => ({ ...c, statusCategory: tab.key }))}
                                                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold tracking-[0.04em] transition-all ${
                                                    selected
                                                        ? 'border-[#1E322A] bg-[#1E322A] text-white shadow-xs'
                                                        : 'border-[#E0DDD4] bg-white text-[#454C46] hover:border-[#AE8A66]'
                                                }`}
                                            >
                                                <span>{tab.label}</span>
                                                <span
                                                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                                                        selected
                                                            ? 'bg-white/20 text-white'
                                                            : tab.highlight === 'amber' && tab.count > 0
                                                              ? 'bg-amber-200 text-amber-900'
                                                              : tab.highlight === 'green' && tab.count > 0
                                                                ? 'bg-[#DCE9DF] text-[#254A31]'
                                                                : tab.highlight === 'red' && tab.count > 0
                                                                  ? 'bg-[#FADBD1] text-[#743E2D]'
                                                                  : 'bg-[#F0EFEA] text-[#555C56]'
                                                    }`}
                                                >
                                                    {tab.count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {activeTab === 'bookings' ? (
                            <section
                                role="tabpanel"
                                aria-label="Reservations"
                                className="mt-4 overflow-hidden rounded-lg border border-[#EBE8E1] bg-[#F5F3EE]"
                            >
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[940px] border-collapse text-left">
                                        <thead className="bg-[#F0EFEA]">
                                            <tr className="h-[42px]">
                                                <th scope="col" className="px-3 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.ref}
                                                </th>
                                                <th scope="col" className="px-3 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.guest}
                                                </th>
                                                <th scope="col" className="px-3 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.unit}
                                                </th>
                                                <th scope="col" className="px-3 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.dates}
                                                </th>
                                                <th scope="col" className="px-2 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.party}
                                                </th>
                                                <th scope="col" className="px-3 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.total}
                                                </th>
                                                <th scope="col" className="px-3 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.payment}
                                                </th>
                                                <th scope="col" className="px-3 text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.stay}
                                                </th>
                                                <th scope="col" className="px-3 text-right text-[8px] font-bold tracking-[0.08em] text-[#59615A]">
                                                    {copy.cols.actions}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReservations.map((reservation) => {
                                                const secondsLeft =
                                                    reservation.category === 'unpaid' && reservation.paymentExpiresAt
                                                        ? Math.max(
                                                              0,
                                                              Math.round(
                                                                  (new Date(reservation.paymentExpiresAt).getTime() - nowMs) / 1000
                                                              )
                                                          )
                                                        : null;

                                                return (
                                                    <tr
                                                        key={reservation.id || reservation.ref}
                                                        className="border-t border-[#EAE7DF] bg-[#F7F5F0] align-middle transition-colors hover:bg-white"
                                                    >
                                                        <td className="px-3 py-3.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailReservation(reservation)}
                                                                className="text-left font-mono text-[10px] font-bold text-[#1E322A] underline decoration-[#AE8A66] underline-offset-2 hover:text-[#346B55]"
                                                            >
                                                                {reservation.ref}
                                                            </button>
                                                            {reservation.receiptNumber && (
                                                                <span className="mt-0.5 block font-mono text-[8px] font-semibold text-[#346B55]">
                                                                    {reservation.receiptNumber}
                                                                </span>
                                                            )}
                                                            <span className="mt-0.5 block text-[8px] text-[#727871]">
                                                                {reservation.channel}
                                                            </span>
                                                        </td>

                                                        <td className="px-3 py-3.5">
                                                            <div className="flex items-center gap-2.5">
                                                                <span
                                                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${reservation.avatar}`}
                                                                >
                                                                    {reservation.initials}
                                                                </span>
                                                                <span className="min-w-0">
                                                                    <span className="block text-[10px] font-semibold leading-tight text-[#27352C]">
                                                                        {reservation.guest}
                                                                    </span>
                                                                    <span className="mt-0.5 block text-[9px] text-[#747A74]">
                                                                        {reservation.phone}
                                                                    </span>
                                                                </span>
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-3.5 text-[10px] font-medium text-[#303A32]">
                                                            {reservation.unit}
                                                        </td>

                                                        <td className="px-3 py-3.5">
                                                            <span className="block text-[10px] font-medium text-[#303A32]">
                                                                {reservation.dates}
                                                            </span>
                                                            <span className="mt-0.5 block text-[9px] text-[#747A74]">
                                                                {reservation.stay}
                                                            </span>
                                                        </td>

                                                        <td className="px-2 py-3.5">
                                                            <span className="inline-flex min-w-[40px] flex-col items-center rounded bg-[#ECEBE6] px-1.5 py-1 text-[9px] leading-tight text-[#424942]">
                                                                <span className="font-bold">{reservation.party}</span>
                                                            </span>
                                                        </td>

                                                        <td className="px-3 py-3.5">
                                                            <span className="whitespace-nowrap font-mono text-[10px] font-semibold text-[#1E322A]">
                                                                {formatPrice(reservation.total)}
                                                            </span>
                                                        </td>

                                                        <td className="px-3 py-3.5">
                                                            <div className="flex flex-col items-start gap-1">
                                                                <span
                                                                    className={`inline-flex items-center rounded-md px-2 py-1 text-[9px] font-bold leading-tight ${reservation.paymentStyle}`}
                                                                >
                                                                    {reservation.payment}
                                                                </span>
                                                                {secondsLeft !== null && (
                                                                    <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-900">
                                                                        {formatCountdown(secondsLeft)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="px-3 py-3.5">
                                                            <span
                                                                className={`inline-flex items-center justify-center rounded-md px-2.5 py-1 text-[9px] font-semibold leading-tight ${reservation.statusStyle}`}
                                                            >
                                                                {reservation.status}
                                                            </span>
                                                        </td>

                                                        <td className="px-3 py-3.5 text-right">
                                                            <div className="inline-flex items-center justify-end gap-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDetailReservation(reservation)}
                                                                    title={copy.actions.detail}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D8D5CD] bg-white text-[#1E322A] transition-colors hover:bg-[#1E322A] hover:text-white"
                                                                >
                                                                    <Icon name="eye" className="h-3.5 w-3.5" />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditModal(reservation)}
                                                                    title={copy.actions.edit}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D8D5CD] bg-white text-[#346B55] transition-colors hover:bg-[#346B55] hover:text-white"
                                                                >
                                                                    <Icon name="edit" className="h-3.5 w-3.5" />
                                                                </button>

                                                                <a
                                                                    href={buildWhatsAppUrl(reservation)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title={copy.actions.whatsapp}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D8D5CD] bg-white text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white"
                                                                >
                                                                    <Icon name="whatsapp" className="h-3.5 w-3.5" />
                                                                </a>

                                                                <button
                                                                    type="button"
                                                                    onClick={() => setDeletingReservation(reservation)}
                                                                    title={copy.actions.delete}
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded border border-[#D8D5CD] bg-white text-[#AE5535] transition-colors hover:bg-[#AE5535] hover:text-white"
                                                                >
                                                                    <Icon name="trash" className="h-3.5 w-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {filteredReservations.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan="9"
                                                        className="border-t border-[#EAE7DF] px-4 py-12 text-center text-xs text-[#687069]"
                                                    >
                                                        {copy.emptyBookings}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between border-t border-[#EAE7DF] px-4 py-3 text-[10px] text-[#707770]">
                                    <p>
                                        {copy.showing} {filteredReservations.length} {copy.of} {reservations.length}{' '}
                                        {copy.reservationsWord}
                                    </p>
                                </div>
                            </section>
                        ) : (
                            <section
                                role="tabpanel"
                                aria-label="Guest directory"
                                className="mt-4 overflow-hidden rounded-md border border-[#EBE8E1] bg-[#F5F3EE]"
                            >
                                <div className="grid grid-cols-1 gap-px bg-[#EAE7DF] sm:grid-cols-2 xl:grid-cols-3">
                                    {filteredGuests.map((guest) => (
                                        <article key={guest.name} className="flex min-h-24 items-center gap-3 bg-[#F7F5F0] p-4">
                                            <span
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${guest.avatar}`}
                                            >
                                                {guest.initials}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="truncate font-serif text-sm text-[#1E322A]">{guest.name}</h2>
                                                <p className="mt-1 truncate text-[9px] text-[#747A74]">{guest.phone}</p>
                                                <p className="mt-1 text-[9px] text-[#59615A]">
                                                    {guest.reservations} {copy.reservationsWord} • {guest.units.join(', ')}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                    {filteredGuests.length === 0 && (
                                        <p className="col-span-full bg-[#F7F5F0] px-4 py-12 text-center text-xs text-[#687069]">
                                            {copy.emptyGuests}
                                        </p>
                                    )}
                                </div>
                                <p className="border-t border-[#EAE7DF] px-4 py-3 text-[10px] text-[#707770]">
                                    {copy.showing} {filteredGuests.length} {copy.guestProfilesWord}
                                </p>
                            </section>
                        )}
                    </div>

                    {/* 1. READ / DETAIL & DIGITAL RECEIPT MODAL (Printable) */}
                    {detailReservation && (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs print:static print:bg-transparent print:p-0"
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget) setDetailReservation(null);
                            }}
                        >
                            <section
                                role="dialog"
                                aria-modal="true"
                                className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8 print:max-h-none print:shadow-none"
                            >
                                <div className="flex items-start justify-between gap-4 border-b border-[#EAE7DF] pb-4">
                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#AE8A66]">
                                            {copy.detailModal.eyebrow}
                                        </p>
                                        <h2 className="mt-1 font-serif text-2xl text-[#1E322A]">
                                            {copy.detailModal.title} ({detailReservation.ref})
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDetailReservation(null)}
                                        className="print:hidden flex h-8 w-8 items-center justify-center rounded-full text-lg text-[#59615A] hover:bg-[#F1ECE0]"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F6F3EE] px-4 py-3">
                                    {detailReservation.paymentKey === 'paid' ? (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#346B55] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                                            {copy.detailModal.receiptReady}
                                        </span>
                                    ) : detailReservation.category === 'unpaid' && detailReservation.paymentExpiresAt ? (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-amber-200 px-3 py-1 font-mono text-xs font-bold text-amber-900">
                                            {copy.detailModal.unpaidTimer}:{' '}
                                            {formatCountdown(
                                                Math.max(
                                                    0,
                                                    Math.round(
                                                        (new Date(detailReservation.paymentExpiresAt).getTime() - nowMs) / 1000
                                                    )
                                                )
                                            )}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center rounded-full bg-[#FADBD1] px-3 py-1 text-[10px] font-bold uppercase text-[#743E2D]">
                                            {copy.detailModal.expiredLabel}
                                        </span>
                                    )}

                                    <span className="font-mono text-xs font-bold text-[#1E322A]">
                                        {detailReservation.receiptNumber || `INV-${detailReservation.bookingCode}`}
                                    </span>
                                </div>

                                <dl className="mt-5 divide-y divide-[#EFECE5] text-xs">
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.receiptNo}</dt>
                                        <dd className="font-mono font-bold text-[#1E322A]">
                                            {detailReservation.receiptNumber || '—'}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.bookingCode}</dt>
                                        <dd className="font-mono font-bold text-[#346B55]">{detailReservation.ref}</dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.guest}</dt>
                                        <dd className="font-semibold text-[#1E322A]">{detailReservation.guest}</dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.contact}</dt>
                                        <dd className="text-[#1E322A]">
                                            {detailReservation.email || '—'} • {detailReservation.phone}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.room}</dt>
                                        <dd className="font-semibold text-[#1E322A]">{detailReservation.unit}</dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.dates}</dt>
                                        <dd className="font-semibold text-[#1E322A]">
                                            {detailReservation.checkIn} → {detailReservation.checkOut} ({detailReservation.stay})
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.party}</dt>
                                        <dd className="text-[#1E322A]">{detailReservation.party}</dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.source}</dt>
                                        <dd className="text-[#1E322A]">{detailReservation.channel}</dd>
                                    </div>
                                    <div className="flex justify-between py-2.5">
                                        <dt className="text-[#747A74]">{copy.detailModal.paymentMethod}</dt>
                                        <dd className="font-semibold text-[#1E322A]">{detailReservation.paymentDetail}</dd>
                                    </div>
                                    {detailReservation.notes && (
                                        <div className="flex justify-between gap-4 py-2.5">
                                            <dt className="shrink-0 text-[#747A74]">{copy.detailModal.notes}</dt>
                                            <dd className="text-right text-[#1E322A]">{detailReservation.notes}</dd>
                                        </div>
                                    )}
                                </dl>

                                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#1E322A] px-5 py-4 text-white">
                                    <span className="text-xs font-bold uppercase tracking-[0.1em]">
                                        {copy.detailModal.total}
                                    </span>
                                    <span className="font-serif text-2xl font-bold text-[#D9B995]">
                                        {formatPrice(detailReservation.total)}
                                    </span>
                                </div>

                                <div className="print:hidden mt-6 flex flex-wrap items-center justify-between gap-2.5 border-t border-[#EAE7DF] pt-4">
                                    {detailReservation.paymentKey === 'paid' ? (
                                        <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#1E322A] px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-white hover:bg-[#346B55]"
                                        >
                                            {copy.detailModal.printReceipt}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={submitting}
                                            onClick={() => handleQuickMarkPaid(detailReservation)}
                                            className="inline-flex h-10 items-center justify-center rounded-lg bg-[#346B55] px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-white hover:bg-[#1E322A] disabled:opacity-60"
                                        >
                                            {copy.detailModal.markPaidQuick}
                                        </button>
                                    )}

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const target = detailReservation;
                                                setDetailReservation(null);
                                                openEditModal(target);
                                            }}
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#1E322A] px-4 text-[10px] font-bold uppercase text-[#1E322A] hover:bg-[#F6F3EE]"
                                        >
                                            {copy.detailModal.editBtn}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDetailReservation(null)}
                                            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#DCD8CF] px-4 text-[10px] font-semibold text-[#555A54]"
                                        >
                                            {copy.detailModal.closeBtn}
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* 2. CREATE RESERVATION MODAL */}
                    {isCreateOpen && (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-xs"
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget) setIsCreateOpen(false);
                            }}
                        >
                            <section
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="new-reservation-title"
                                className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#AE8A66]">
                                            {copy.createModal.eyebrow}
                                        </p>
                                        <h2 id="new-reservation-title" className="font-serif text-2xl text-[#1E322A]">
                                            {copy.createModal.title}
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateOpen(false)}
                                        className="flex h-8 w-8 items-center justify-center text-lg text-[#59615A] hover:bg-[#F1ECE0]"
                                    >
                                        ×
                                    </button>
                                </div>

                                {formError && (
                                    <div role="alert" className="mt-4 border border-[#AE5535] bg-[#FADBD1] px-3 py-2 text-[11px] text-[#743E2D]">
                                        {formError}
                                    </div>
                                )}

                                <form className="mt-5 space-y-4" onSubmit={handleCreateReservation}>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestName}
                                            <input
                                                required
                                                name="guest_name"
                                                type="text"
                                                value={reservationFormData.guest_name}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, guest_name: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestPhone}
                                            <input
                                                required
                                                name="guest_phone"
                                                type="tel"
                                                value={reservationFormData.guest_phone}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, guest_phone: e.target.value }))
                                                }
                                                placeholder="+62 812..."
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestEmail}
                                            <input
                                                name="guest_email"
                                                type="email"
                                                value={reservationFormData.guest_email}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, guest_email: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestsCount}
                                            <input
                                                required
                                                name="adults"
                                                type="number"
                                                min="1"
                                                max="12"
                                                value={reservationFormData.adults}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, adults: Number(e.target.value) || 1 }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.room}
                                            <select
                                                required
                                                name="room_id"
                                                value={reservationFormData.room_id}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, room_id: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            >
                                                {rooms.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.channel}
                                            <select
                                                name="source"
                                                value={reservationFormData.source}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, source: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            >
                                                <option value="manual">Manual Desk</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="airbnb">Airbnb</option>
                                                <option value="tiket_com">Tiket.com</option>
                                                <option value="booking_com">Booking.com</option>
                                                <option value="agoda">Agoda</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.checkIn}
                                            <input
                                                required
                                                name="check_in"
                                                type="date"
                                                value={reservationFormData.check_in}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, check_in: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.checkOut}
                                            <input
                                                required
                                                name="check_out"
                                                type="date"
                                                min={reservationFormData.check_in || undefined}
                                                value={reservationFormData.check_out}
                                                onChange={(e) =>
                                                    setReservationFormData((c) => ({ ...c, check_out: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                    </div>

                                    <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                        {copy.fields.paymentStatus}
                                        <select
                                            name="payment_status"
                                            value={reservationFormData.payment_status}
                                            onChange={(e) =>
                                                setReservationFormData((c) => ({ ...c, payment_status: e.target.value }))
                                            }
                                            className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                        >
                                            <option value="paid">{copy.paymentLabels.paid}</option>
                                            <option value="unpaid">{copy.paymentLabels.unpaid}</option>
                                        </select>
                                    </label>

                                    <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                        {copy.fields.notes}
                                        <textarea
                                            name="notes"
                                            rows="2"
                                            value={reservationFormData.notes}
                                            onChange={(e) =>
                                                setReservationFormData((c) => ({ ...c, notes: e.target.value }))
                                            }
                                            className="mt-1.5 w-full border border-[#E5E2DA] bg-[#FBFAF7] p-2.5 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                        />
                                    </label>

                                    <div className="flex justify-end gap-2 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateOpen(false)}
                                            className="h-10 border border-[#D9D6CE] px-4 text-[10px] font-semibold tracking-[0.08em] text-[#59615A] hover:bg-[#F5F3EE]"
                                        >
                                            {copy.createModal.cancel}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="h-10 bg-[#1E322A] px-5 text-[10px] font-bold tracking-[0.08em] text-white hover:bg-[#346B55] disabled:opacity-60"
                                        >
                                            {submitting ? copy.createModal.saving : copy.createModal.save}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    )}

                    {/* 3. FULL EDIT RESERVATION MODAL (PUT /admin/bookings/{booking}) */}
                    {editingReservation && editFormData && (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-xs"
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget) {
                                    setEditingReservation(null);
                                    setEditFormData(null);
                                }
                            }}
                        >
                            <section
                                role="dialog"
                                aria-modal="true"
                                className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#AE8A66]">
                                            {copy.editModal.eyebrow}
                                        </p>
                                        <h2 className="font-serif text-2xl text-[#1E322A]">
                                            {copy.editModal.title} ({editingReservation.ref})
                                        </h2>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingReservation(null);
                                            setEditFormData(null);
                                        }}
                                        className="flex h-8 w-8 items-center justify-center text-lg text-[#59615A] hover:bg-[#F1ECE0]"
                                    >
                                        ×
                                    </button>
                                </div>

                                {formError && (
                                    <div role="alert" className="mt-4 border border-[#AE5535] bg-[#FADBD1] px-3 py-2 text-[11px] text-[#743E2D]">
                                        {formError}
                                    </div>
                                )}

                                <form className="mt-5 space-y-4" onSubmit={handleUpdateReservation}>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestName}
                                            <input
                                                required
                                                type="text"
                                                value={editFormData.guest_name}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, guest_name: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestPhone}
                                            <input
                                                type="tel"
                                                value={editFormData.guest_phone}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, guest_phone: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestEmail}
                                            <input
                                                type="email"
                                                value={editFormData.guest_email}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, guest_email: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.guestsCount}
                                            <input
                                                required
                                                type="number"
                                                min="1"
                                                max="20"
                                                value={editFormData.guests_count}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({
                                                        ...c,
                                                        guests_count: Number(e.target.value) || 1,
                                                    }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.room}
                                            <select
                                                required
                                                value={editFormData.room_id}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, room_id: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            >
                                                {rooms.map((r) => (
                                                    <option key={r.id} value={r.id}>
                                                        {r.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.channel}
                                            <select
                                                value={editFormData.source}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, source: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            >
                                                <option value="direct">Direct Web</option>
                                                <option value="manual">Manual Desk</option>
                                                <option value="whatsapp">WhatsApp</option>
                                                <option value="airbnb">Airbnb</option>
                                                <option value="tiket_com">Tiket.com</option>
                                                <option value="booking_com">Booking.com</option>
                                                <option value="agoda">Agoda</option>
                                            </select>
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.checkIn}
                                            <input
                                                required
                                                type="date"
                                                value={editFormData.check_in}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, check_in: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.checkOut}
                                            <input
                                                required
                                                type="date"
                                                min={editFormData.check_in || undefined}
                                                value={editFormData.check_out}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, check_out: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            />
                                        </label>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.paymentStatus}
                                            <select
                                                value={editFormData.payment_status}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, payment_status: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            >
                                                <option value="unpaid">{copy.paymentLabels.unpaid}</option>
                                                <option value="paid">{copy.paymentLabels.paid}</option>
                                                <option value="expired">{copy.paymentLabels.expired}</option>
                                                <option value="refunded">{copy.paymentLabels.refunded}</option>
                                            </select>
                                        </label>

                                        <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                            {copy.fields.stayStatus}
                                            <select
                                                value={editFormData.status}
                                                onChange={(e) =>
                                                    setEditFormData((c) => ({ ...c, status: e.target.value }))
                                                }
                                                className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                            >
                                                <option value="pending">{copy.stayLabels.pending}</option>
                                                <option value="confirmed">{copy.stayLabels.confirmed}</option>
                                                <option value="checked_in">{copy.stayLabels.checked_in}</option>
                                                <option value="completed">{copy.stayLabels.completed}</option>
                                                <option value="cancelled">{copy.stayLabels.cancelled}</option>
                                            </select>
                                        </label>
                                    </div>

                                    <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                        {copy.fields.notes}
                                        <textarea
                                            rows="2"
                                            value={editFormData.notes}
                                            onChange={(e) =>
                                                setEditFormData((c) => ({ ...c, notes: e.target.value }))
                                            }
                                            className="mt-1.5 w-full border border-[#E5E2DA] bg-[#FBFAF7] p-2.5 text-xs font-normal text-[#27352C] outline-none focus:border-[#1E322A]"
                                        />
                                    </label>

                                    <div className="flex items-center justify-between rounded-xl border border-[#DCE9DF] bg-[#F6F3EE] px-4 py-3">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#346B55]">
                                                {copy.editModal.estimatedTotal}
                                            </p>
                                            <p className="mt-0.5 text-[10px] text-[#666A64]">{copy.editModal.recalcNote}</p>
                                        </div>
                                        <span className="font-serif text-xl font-bold text-[#1E322A]">
                                            {formatPrice(editEstimatedTotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-end gap-2 pt-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingReservation(null);
                                                setEditFormData(null);
                                            }}
                                            className="h-10 border border-[#D9D6CE] px-4 text-[10px] font-semibold tracking-[0.08em] text-[#59615A] hover:bg-[#F5F3EE]"
                                        >
                                            {copy.editModal.cancel}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="h-10 bg-[#1E322A] px-5 text-[10px] font-bold tracking-[0.08em] text-white hover:bg-[#346B55] disabled:opacity-60"
                                        >
                                            {submitting ? copy.editModal.saving : copy.editModal.save}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        </div>
                    )}

                    {/* 4. DELETE CONFIRMATION MODAL (DELETE /admin/bookings/{booking}) */}
                    {deletingReservation && (
                        <div
                            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-xs"
                            onMouseDown={(event) => {
                                if (event.target === event.currentTarget) setDeletingReservation(null);
                            }}
                        >
                            <section
                                role="dialog"
                                aria-modal="true"
                                className="w-full max-w-md rounded-2xl border border-[#AE5535]/30 bg-white p-6 shadow-2xl"
                            >
                                <h2 className="font-serif text-2xl text-[#1E322A]">
                                    {copy.deleteModal.title} ({deletingReservation.ref})
                                </h2>
                                <p className="mt-2 text-xs leading-relaxed text-[#555A54]">
                                    {copy.deleteModal.desc}
                                </p>
                                <div className="mt-4 rounded-xl bg-[#F6F3EE] p-3 text-xs text-[#1E322A]">
                                    <strong>{deletingReservation.guest}</strong> — {deletingReservation.unit} (
                                    {deletingReservation.dates})
                                </div>

                                <div className="mt-6 flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setDeletingReservation(null)}
                                        className="h-10 rounded-lg border border-[#D9D6CE] px-4 text-[10px] font-semibold tracking-[0.08em] text-[#59615A] hover:bg-[#F5F3EE]"
                                    >
                                        {copy.deleteModal.cancel}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleDeleteReservation}
                                        className="h-10 rounded-lg bg-[#AE5535] px-5 text-[10px] font-bold tracking-[0.08em] text-white hover:bg-[#8E3D24] disabled:opacity-60"
                                    >
                                        {submitting ? copy.deleteModal.deleting : copy.deleteModal.confirm}
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
