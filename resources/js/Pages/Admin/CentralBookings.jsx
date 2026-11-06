import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const formatDate = (value) => {
    if (!value) return 'All dates';
    return new Date(`${String(value).slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function Icon({ name, className = 'h-4 w-4' }) {
    const icons = {
        grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
        bookings: <><path d="M8 3h8M8 7h8M8 11h5" /><path d="M5 2h14v20l-7-4-7 4z" /></>,
        search: <><circle cx="10.8" cy="10.8" r="6.2" /><path d="m16 16 4.2 4.2" /></>,
        bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
        calendar: <><rect x="3.5" y="5" width="17" height="16" rx="1.5" /><path d="M7.5 3v4M16.5 3v4M4 9h16" /></>,
        chevron: <path d="m9 18 6-6-6-6" />,
        logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    };

    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name]}
        </svg>
    );
}

function AdminSidebar({ onLogout, userName }) {
    return (
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[200px] flex-col border-r border-[#E7E4DC] bg-[#F3F1EB] px-4 py-5 md:flex">
            <a href="/" className="mb-9 flex items-start gap-2.5 px-1 text-[#1E322A] no-underline">
                <span aria-hidden="true" className="mt-1 text-sm text-[#AE8A66]">✦</span>
                <span>
                    <span className="block font-serif text-[17px] leading-5">The Boe Cottage</span>
                    <span className="mt-1 block font-sans text-[8px] font-semibold tracking-[0.18em] text-[#747873]">STAFF LEDGER</span>
                </span>
            </a>

            <nav aria-label="Admin navigation" className="space-y-1">
                <a href="/admin-dashboard" className="flex h-9 items-center gap-2 rounded-sm px-3 text-[10px] font-medium tracking-[0.06em] text-[#363D37] transition-colors hover:bg-white/70">
                    <Icon name="grid" className="h-3.5 w-3.5" />
                    DASHBOARD
                </a>
                <a href="/central-bookings" aria-current="page" className="flex h-9 items-center gap-2 rounded-sm bg-[#1E322A] px-3 text-[10px] font-medium tracking-[0.06em] text-white">
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
                <button type="button" onClick={onLogout} className="mt-4 flex w-full items-center justify-end gap-2 px-1 text-[9px] font-semibold tracking-[0.1em] text-[#AE5535] transition-colors hover:text-[#8E3D24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">
                    <Icon name="logout" className="h-3.5 w-3.5" />
                    LOG OUT
                </button>
            </div>
        </aside>
    );
}

function getInitials(name = '') {
    return String(name)
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'G';
}

function mapBookingRecord(booking, index) {
    const checkIn = String(booking.check_in).slice(0, 10);
    const checkOut = String(booking.check_out).slice(0, 10);
    const nights = Math.max(1, Math.round((new Date(`${checkOut}T12:00:00`) - new Date(`${checkIn}T12:00:00`)) / 86400000));
    const startShort = new Date(`${checkIn}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endShort = new Date(`${checkOut}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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

    const isPaid = booking.payment_status === 'paid';
    const paymentLabel = isPaid ? 'Paid' : booking.payment_status === 'expired' ? 'Expired' : 'Pending';
    const paymentDetail = booking.payment_type || (isPaid ? 'Midtrans' : 'Awaiting Payment');
    const paymentStyle = isPaid
        ? 'bg-[#D5EAD9] text-[#254A31]'
        : 'bg-[#FADBD1] text-[#743E2D]';

    let statusLabel = 'Confirmed';
    let statusStyle = 'bg-[#ECECE8] text-[#404640]';

    if (booking.status === 'cancelled') {
        statusLabel = 'Cancelled';
        statusStyle = 'bg-[#FADBD1] text-[#743E2D]';
    } else if (booking.check_in_status === 'checked_in') {
        statusLabel = 'Checked-In';
        statusStyle = 'bg-[#D5EAD9] text-[#254A31]';
    } else if (booking.status === 'pending') {
        statusLabel = 'Pending Deposit';
        statusStyle = 'bg-[#FADBD1] text-[#743E2D]';
    }

    return {
        id: booking.id,
        ref: `#${booking.booking_code}`,
        channel: sourceMap[booking.source] || booking.source,
        guest: booking.guest_name,
        email: booking.guest_email || '',
        phone: booking.guest_phone || booking.guest_email || 'No phone provided',
        initials: getInitials(booking.guest_name),
        avatar: avatarStyles[index % avatarStyles.length],
        unit: booking.room?.name || 'Cottage',
        dates: `${startShort} – ${endShort}`,
        checkIn,
        checkOut,
        stay: `${nights} ${nights === 1 ? 'Night' : 'Nights'}`,
        party: (Number(booking.adults) || 1) + (Number(booking.children) || 0),
        total: Number(booking.total_price) || 0,
        payment: paymentLabel,
        paymentDetail,
        paymentStyle,
        status: statusLabel,
        rawStatus: booking.status,
        rawCheckInStatus: booking.check_in_status,
        statusStyle,
    };
}

export default function CentralBookings({ bookings = [], rooms = [] }) {
    const { auth } = usePage().props;
    const reservations = useMemo(() => bookings.map(mapBookingRecord), [bookings]);

    const todayStr = new Date().toISOString().slice(0, 10);
    const defaultNextStr = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);

    const [filters, setFilters] = useState({
        search: '',
        cottage: 'All Shelters',
        dateFrom: '',
        dateTo: '',
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

    const [page, setPage] = useState(1);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('bookings');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const filteredReservations = useMemo(() => reservations.filter((reservation) => {
        const matchesSearch = `${reservation.ref} ${reservation.guest} ${reservation.phone} ${reservation.unit} ${reservation.channel}`
            .toLowerCase()
            .includes(filters.search.toLowerCase());
        const matchesCottage = filters.cottage === 'All Shelters'
            || reservation.unit.toLowerCase().startsWith(filters.cottage.toLowerCase());
        const matchesFrom = !filters.dateFrom || reservation.checkOut >= filters.dateFrom;
        const matchesTo = !filters.dateTo || reservation.checkIn <= filters.dateTo;

        return matchesSearch && matchesCottage && matchesFrom && matchesTo;
    }), [reservations, filters]);

    const filteredGuests = useMemo(() => {
        const guests = new Map();
        filteredReservations.forEach((reservation) => {
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
    }, [filteredReservations]);

    useEffect(() => {
        if (!isModalOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isModalOpen]);

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
        setPage(1);
    }

    function updateDateRange(event) {
        const { name, value } = event.target;
        setFilters((current) => ({ ...current, [name]: value }));
        setPage(1);
    }

    function updateReservationForm(event) {
        const { name, value } = event.target;
        setReservationFormData((current) => ({ ...current, [name]: value }));
    }

    async function handleCreateReservation(event) {
        event.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            await window.axios.post('/admin/bookings', reservationFormData);
            setIsModalOpen(false);
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
            router.reload();
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

    return (
        <>
            <Head title="Central Bookings — The Boe Cottage" />
            <div className="min-h-screen bg-[#FBF9F4] font-sans text-[#1E322A]">
                <AdminSidebar onLogout={handleLogout} userName={auth?.user?.name} />
                <main className="min-h-screen md:ml-[200px]">
                    <header className="sticky top-0 z-30 border-b border-[#EAE7DF] bg-[#FBF9F4]/95 backdrop-blur">
                        <div className="flex min-h-[54px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
                            <div className="flex min-w-0 items-center gap-2">
                                <a href="/" className="mr-2 flex shrink-0 items-center gap-2 lg:hidden">
                                    <span className="font-serif text-sm">The Boe Cottage</span>
                                </a>
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#AE5535]" />
                                <p className="truncate text-[8px] font-semibold tracking-[0.11em] text-[#4D544E] sm:text-[9px]">
                                    HIGHLAND DISPATCH SYNC <span className="px-1 text-[#AE8A66]">•</span> ACTIVE LEDGER
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-4">
                                <button type="button" aria-label="Search bookings" onClick={() => document.getElementById('reservation-search')?.focus()} className="text-[#3C453E] hover:text-[#346B55]">
                                    <Icon name="search" className="h-4 w-4" />
                                </button>
                                <div ref={notificationRef} className="relative">
                                    <button
                                        type="button"
                                        aria-label="Notifications"
                                        aria-expanded={isNotifOpen}
                                        onClick={() => { setIsNotifOpen((open) => !open); setIsProfileOpen(false); }}
                                        className="relative text-[#3C453E] hover:text-[#346B55]"
                                    >
                                        <Icon name="bell" className="h-4 w-4" />
                                        <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#AE5535]" />
                                    </button>
                                    {isNotifOpen && (
                                        <div role="status" className="absolute right-0 z-50 mt-2 w-64 border border-gray-100 bg-white p-4 shadow-lg">
                                            <p className="text-[11px] leading-relaxed text-gray-600">You have {reservations.length} total reservations in the ledger.</p>
                                        </div>
                                    )}
                                </div>
                                <div ref={profileRef} className="relative">
                                    <button
                                        type="button"
                                        aria-label="Staff profile"
                                        aria-expanded={isProfileOpen}
                                        onClick={() => { setIsProfileOpen((open) => !open); setIsNotifOpen(false); }}
                                        className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#1E322A] text-[9px] font-semibold text-white"
                                    >
                                        LD
                                    </button>
                                    {isProfileOpen && (
                                        <div className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-gray-100 bg-white p-4 shadow-lg">
                                            <p className="text-sm font-bold text-gray-800">{auth?.user?.name || 'Lead Desk'}</p>
                                            <p className="mt-1 text-xs text-gray-500">{auth?.user?.email || 'admin@theboecottage.com'}</p>
                                            <div className="my-3 border-t border-gray-100" />
                                            <button type="button" onClick={handleLogout} className="text-xs font-medium text-[#AE5535] transition-colors hover:text-[#8E3D24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <nav aria-label="Admin navigation" className="flex gap-2 border-t border-[#EAE7DF] px-5 py-2 md:hidden">
                            <a href="/admin-dashboard" className="rounded-sm px-3 py-1.5 text-[9px] font-medium text-[#363D37] hover:bg-white">DASHBOARD</a>
                            <a href="/central-bookings" aria-current="page" className="rounded-sm bg-[#1E322A] px-3 py-1.5 text-[9px] font-medium text-white">CENTRAL BOOKINGS</a>
                        </nav>
                    </header>

                    <div className="mx-auto max-w-[1500px] px-5 pb-8 pt-7 sm:px-8 lg:px-10 lg:pt-9">
                        <section aria-labelledby="bookings-heading">
                            <h1 id="bookings-heading" className="font-serif text-[32px] font-normal leading-[1.08] tracking-[-0.035em] sm:text-[39px]">
                                Guest &amp; Booking Directory
                            </h1>
                            <p className="mt-1.5 max-w-[560px] text-[10px] leading-relaxed text-[#687069]">
                                Real-time room occupancy allocations, reservation audits, and high-plateau botanical guest preferences.
                            </p>

                            <div role="tablist" aria-label="Booking directory sections" className="mt-7 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-md bg-[#F0EFEA] p-1.5">
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === 'bookings'}
                                    onClick={() => setActiveTab('bookings')}
                                    className={`flex shrink-0 items-center gap-2 rounded px-3 py-2 text-[8px] tracking-[0.04em] transition-colors sm:text-[9px] ${activeTab === 'bookings' ? 'bg-white font-semibold text-[#1E322A] shadow-sm' : 'font-medium text-[#555C56] hover:bg-white/60'}`}
                                >
                                    <Icon name="bookings" className="h-3.5 w-3.5" />
                                    CENTRAL BOOKINGS
                                    <span className={`px-1.5 py-1 text-[7px] font-bold tracking-[0.08em] ${activeTab === 'bookings' ? 'bg-[#DCE9DF] text-[#315642]' : 'bg-[#E7E6E1] text-[#555C56]'}`}>{reservations.length} TOTAL</span>
                                </button>
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === 'guests'}
                                    onClick={() => setActiveTab('guests')}
                                    className={`flex shrink-0 items-center gap-2 rounded px-3 py-2 text-[8px] tracking-[0.04em] transition-colors sm:text-[9px] ${activeTab === 'guests' ? 'bg-white font-semibold text-[#1E322A] shadow-sm' : 'font-medium text-[#555C56] hover:bg-white/60'}`}
                                >
                                    <Icon name="bookings" className="h-3.5 w-3.5" />
                                    GUEST DIRECTORY (USERS)
                                    <span className={`px-1.5 py-1 text-[7px] font-semibold tracking-[0.08em] ${activeTab === 'guests' ? 'bg-[#DCE9DF] font-bold text-[#315642]' : 'bg-[#E7E6E1] text-[#555C56]'}`}>{filteredGuests.length} PROFILES</span>
                                </button>
                            </div>
                        </section>

                        <section aria-label="Reservation filters" className="mt-5 bg-[#F4F2ED] p-4 sm:p-5">
                            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:max-w-[min(100%,460px)]">
                                    <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#566058]" />
                                    <label htmlFor="reservation-search" className="sr-only">Search by reference, guest, or phone</label>
                                    <input
                                        id="reservation-search"
                                        type="search"
                                        name="search"
                                        value={filters.search}
                                        onFocus={() => { setIsNotifOpen(false); setIsProfileOpen(false); }}
                                        onChange={updateFilters}
                                        placeholder="Search ref code, guest, phone..."
                                        className="h-9 w-full rounded-md border border-[#EBE9E3] bg-[#FBFAF7] pl-9 pr-3 text-[10px] text-[#27352C] outline-none transition placeholder:text-[#8A8F89] focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                    />
                                </div>
                                <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex h-9 shrink-0 items-center justify-center bg-[#A34E2C] px-4 text-[9px] font-semibold tracking-[0.04em] text-white transition-colors hover:bg-[#873E23]">
                                    <span className="mr-1 text-sm leading-none">+</span>
                                    NEW RESERVATION
                                </button>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <label htmlFor="cottage-filter" className="flex h-8 items-center gap-2 bg-[#FBFAF7] px-3 text-[8px] font-semibold tracking-[0.07em] text-[#60665F]">
                                    COTTAGE:
                                    <select id="cottage-filter" name="cottage" value={filters.cottage} onChange={updateFilters} className="bg-transparent text-[9px] font-semibold tracking-normal text-[#28372D] outline-none">
                                        <option value="All Shelters">All Shelters</option>
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="relative">
                                    <button type="button" aria-expanded={isDateFilterOpen} onClick={() => setIsDateFilterOpen((open) => !open)} className="inline-flex h-8 items-center gap-2 bg-[#FBFAF7] px-3 text-[9px] font-medium text-[#454C46] transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#346B55]">
                                        <Icon name="calendar" className="h-3 w-3 text-[#A34E2C]" />
                                        {filters.dateFrom || filters.dateTo
                                            ? `${formatDate(filters.dateFrom)} – ${formatDate(filters.dateTo)}`
                                            : 'Filter by Date Range'}
                                    </button>
                                    {isDateFilterOpen && (
                                        <div className="absolute left-0 z-20 mt-2 grid w-64 gap-3 border border-[#E5E2DA] bg-white p-3 shadow-lg sm:grid-cols-2">
                                            <label className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                                From
                                                <input type="date" name="dateFrom" value={filters.dateFrom} max={filters.dateTo || undefined} onChange={updateDateRange} className="mt-1.5 h-8 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-2 text-[9px] font-normal normal-case tracking-normal text-[#27352C] focus:border-[#1E322A] focus:outline-none focus:ring-1 focus:ring-[#1E322A]" />
                                            </label>
                                            <label className="text-[8px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                                To
                                                <input type="date" name="dateTo" value={filters.dateTo} min={filters.dateFrom || undefined} onChange={updateDateRange} className="mt-1.5 h-8 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-2 text-[9px] font-normal normal-case tracking-normal text-[#27352C] focus:border-[#1E322A] focus:outline-none focus:ring-1 focus:ring-[#1E322A]" />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {activeTab === 'bookings' ? (
                            <section role="tabpanel" aria-label="Reservations" className="mt-4 overflow-hidden rounded-md border border-[#EBE8E1] bg-[#F5F3EE]">
                                <div className="overflow-x-auto">
                                    <table className="table-fixed w-full min-w-[760px] border-collapse text-left md:min-w-0">
                                        <thead className="bg-[#F0EFEA]">
                                            <tr className="h-[42px]">
                                                <th scope="col" className="w-[10%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">REF CODE</th>
                                                <th scope="col" className="w-[19%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">GUEST &amp; CONTACT</th>
                                                <th scope="col" className="w-[11%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">ASSIGNED UNIT</th>
                                                <th scope="col" className="w-[13%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">DATES &amp; NIGHTS</th>
                                                <th scope="col" className="w-[7%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">PARTY</th>
                                                <th scope="col" className="w-[13%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">TOTAL BILLED</th>
                                                <th scope="col" className="w-[13%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">PAYMENT STATUS</th>
                                                <th scope="col" className="w-[13%] px-3 text-[7px] font-semibold tracking-[0.08em] text-[#59615A]">STAY STATUS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredReservations.map((reservation) => (
                                                <tr key={reservation.id || reservation.ref} className="min-h-[98px] border-t border-[#EAE7DF] bg-[#F7F5F0] align-middle">
                                                    <td className="px-3 py-4">
                                                        <span className="block max-w-[90px] break-words text-[9px] font-bold leading-[1.35] tracking-[0.03em] text-[#27372D]">{reservation.ref}</span>
                                                        <span className="mt-1 block text-[8px] text-[#727871]">{reservation.channel}</span>
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-semibold ${reservation.avatar}`}>{reservation.initials}</span>
                                                            <span className="min-w-0">
                                                                <span className="block text-[9px] font-medium leading-tight text-[#27352C]">{reservation.guest}</span>
                                                                <span className="mt-1 block text-[8px] leading-relaxed text-[#747A74]">{reservation.phone}</span>
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-4 text-[9px] text-[#303A32]">{reservation.unit}</td>
                                                    <td className="px-3 py-4">
                                                        <span className="block text-[9px] leading-relaxed text-[#303A32]">{reservation.dates}</span>
                                                        <span className="mt-0.5 block text-[8px] leading-relaxed text-[#747A74]">{reservation.stay}</span>
                                                    </td>
                                                    <td className="px-1 py-4">
                                                        <span className="inline-flex min-w-[36px] flex-col items-center bg-[#ECEBE6] px-1 py-1 text-[8px] leading-tight text-[#424942]">
                                                            <span className="font-medium">{reservation.party}</span>
                                                            <span>Guests</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <span className="block text-[8px] font-medium text-[#303A32]">IDR</span>
                                                        <span className="mt-1 block whitespace-nowrap font-mono text-[9px] text-[#303A32]">{reservation.total.toLocaleString('en-US')}</span>
                                                    </td>
                                                    <td className="px-3 py-4">
                                                        <span className={`inline-flex min-h-10 w-[84px] max-w-full flex-col items-center justify-center rounded-md px-1 py-1 text-center text-[8px] leading-tight ${reservation.paymentStyle}`}>
                                                            <span className="font-medium">{reservation.payment}</span>
                                                            <span className="mt-0.5">{reservation.payment === 'Pending' ? '• ' : '✓ '}{reservation.paymentDetail}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-1 py-4">
                                                        <span className={`inline-flex min-h-6 w-full max-w-[84px] items-center justify-center px-1 text-center text-[8px] leading-tight ${reservation.statusStyle}`}>
                                                            {reservation.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredReservations.length === 0 && (
                                                <tr><td colSpan="8" className="border-t border-[#EAE7DF] px-4 py-12 text-center text-[11px] text-[#687069]">No reservations match your search.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-[#EAE7DF] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                                    <p className="text-[9px] text-[#707770]">Showing {filteredReservations.length} of {reservations.length} reservations</p>
                                    <nav aria-label="Reservation pages" className="flex items-center gap-1 self-end sm:self-auto">
                                        <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="h-7 px-2 text-[8px] text-[#5C635D] hover:bg-white">Prev</button>
                                        {[1].map((pageNumber) => (
                                            <button key={pageNumber} type="button" aria-current={page === pageNumber ? 'page' : undefined} onClick={() => setPage(pageNumber)} className={`h-7 min-w-7 px-2 text-[8px] ${page === pageNumber ? 'bg-[#1E322A] text-white' : 'text-[#515852] hover:bg-white'}`}>{pageNumber}</button>
                                        ))}
                                        <button type="button" onClick={() => setPage(1)} className="inline-flex h-7 items-center gap-1 px-2 text-[8px] text-[#5C635D] hover:bg-white">
                                            Next
                                            <Icon name="chevron" className="h-3 w-3" />
                                        </button>
                                    </nav>
                                </div>
                            </section>
                        ) : (
                            <section role="tabpanel" aria-label="Guest directory" className="mt-4 overflow-hidden rounded-md border border-[#EBE8E1] bg-[#F5F3EE]">
                                <div className="grid grid-cols-1 gap-px bg-[#EAE7DF] sm:grid-cols-2 xl:grid-cols-3">
                                    {filteredGuests.map((guest) => (
                                        <article key={guest.name} className="flex min-h-24 items-center gap-3 bg-[#F7F5F0] p-4">
                                            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${guest.avatar}`}>{guest.initials}</span>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="truncate font-serif text-sm text-[#1E322A]">{guest.name}</h2>
                                                <p className="mt-1 truncate text-[8px] text-[#747A74]">{guest.phone}</p>
                                                <p className="mt-1 text-[8px] text-[#59615A]">
                                                    {guest.reservations} {guest.reservations === 1 ? 'reservation' : 'reservations'} • {guest.units.join(', ')}
                                                </p>
                                            </div>
                                        </article>
                                    ))}
                                    {filteredGuests.length === 0 && (
                                        <p className="col-span-full bg-[#F7F5F0] px-4 py-12 text-center text-[11px] text-[#687069]">No guests match your search.</p>
                                    )}
                                </div>
                                <p className="border-t border-[#EAE7DF] px-4 py-3 text-[9px] text-[#707770]">
                                    Showing {filteredGuests.length} guest profiles
                                </p>
                            </section>
                        )}
                    </div>
                </main>

                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 py-6 backdrop-blur-sm"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setIsModalOpen(false);
                        }}
                    >
                        <section
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="new-reservation-title"
                            className="w-full max-w-lg bg-white p-6 shadow-2xl sm:p-8"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#AE8A66]">Central bookings</p>
                                    <h2 id="new-reservation-title" className="font-serif text-2xl text-[#1E322A]">New Reservation</h2>
                                </div>
                                <button type="button" aria-label="Close reservation dialog" onClick={() => setIsModalOpen(false)} className="flex h-8 w-8 items-center justify-center text-lg text-[#59615A] hover:bg-[#F1ECE0]">
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
                                        Guest name *
                                        <input required name="guest_name" type="text" value={reservationFormData.guest_name} onChange={updateReservationForm} placeholder="Enter guest name" className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-[11px] font-normal normal-case tracking-normal text-[#27352C] outline-none focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]" />
                                    </label>
                                    <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                        Guest phone *
                                        <input required name="guest_phone" type="tel" value={reservationFormData.guest_phone} onChange={updateReservationForm} placeholder="+62 812..." className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-[11px] font-normal normal-case tracking-normal text-[#27352C] outline-none focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]" />
                                    </label>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                        Cottage *
                                        <select required name="room_id" value={reservationFormData.room_id} onChange={updateReservationForm} className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-[11px] font-normal normal-case tracking-normal text-[#27352C] outline-none focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]">
                                            {rooms.map((r) => (
                                                <option key={r.id} value={r.id}>{r.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                        Booking channel
                                        <select name="source" value={reservationFormData.source} onChange={updateReservationForm} className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-[11px] font-normal normal-case tracking-normal text-[#27352C] outline-none focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]">
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
                                        Check-in date *
                                        <input required name="check_in" type="date" value={reservationFormData.check_in} onChange={updateReservationForm} className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-[11px] font-normal normal-case tracking-normal text-[#27352C] outline-none focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]" />
                                    </label>
                                    <label className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-[#59615A]">
                                        Check-out date *
                                        <input required name="check_out" type="date" min={reservationFormData.check_in} value={reservationFormData.check_out} onChange={updateReservationForm} className="mt-1.5 h-10 w-full border border-[#E5E2DA] bg-[#FBFAF7] px-3 text-[11px] font-normal normal-case tracking-normal text-[#27352C] outline-none focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]" />
                                    </label>
                                </div>
                                <div className="flex justify-end gap-2 border-t border-[#EEECE6] pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="h-9 px-4 text-[9px] font-semibold text-[#59615A] hover:bg-[#F1ECE0]">Cancel</button>
                                    <button type="submit" disabled={submitting} className="h-9 bg-[#A34E2C] px-4 text-[9px] font-semibold text-white hover:bg-[#873E23] disabled:opacity-60">
                                        {submitting ? 'Creating...' : 'Create reservation'}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}
