import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const money = (amount) => `IDR ${Math.round(Number(amount) || 0).toLocaleString('en-US')}`;

function Icon({ name, className = 'h-4 w-4' }) {
    const paths = {
        grid: <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>,
        bookings: <><path d="M8 3h8M8 7h8M8 11h5" /><path d="M5 2h14v20l-7-4-7 4z" /></>,
        search: <><circle cx="10.8" cy="10.8" r="6.2" /><path d="m16 16 4.2 4.2" /></>,
        bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
        cash: <><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M7 6V4h14v13h-2M12 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9c1.7 0 2.5-.8 2.5-2.5M3 16c1.7 0 2.5.8 2.5 2.5M21 9c-1.7 0-2.5-.8-2.5-2.5M21 16c-1.7 0-2.5.8-2.5 2.5" /></>,
        cabin: <><rect x="4" y="4" width="16" height="16" rx="1.5" /><path d="M8 8h8v8H8zM3 12h1m16 0h1M12 3v1m0 16v1" /></>,
        arrival: <><path d="M12 3v11m0 0 4-4m-4 4-4-4" /><path d="M5 14v5h14v-5" /></>,
        filter: <><path d="M4 6h16M7 12h10m-7 6h4" /><circle cx="8" cy="6" r="1.5" /><circle cx="15" cy="12" r="1.5" /></>,
        refresh: <><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.6 9a7 7 0 0 1 11.8-2L20 12M4 12l2.6 5a7 7 0 0 0 11.8-2" /></>,
        chevron: <path d="m7 10 5 5 5-5" />,
        pencil: <><path d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /></>,
        logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
        link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
        copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
        trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    };

    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {paths[name]}
        </svg>
    );
}

function SummaryCard({ label, icon, children, className = '' }) {
    return (
        <article className={`min-h-[142px] bg-white p-5 shadow-[0_1px_4px_rgba(30,50,42,0.04)] sm:p-6 ${className}`}>
            <div className="mb-5 flex items-center justify-between">
                <h2 className="font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-[#5A615B]">{label}</h2>
                <Icon name={icon} className="h-4 w-4 text-[#346B55]" />
            </div>
            {children}
        </article>
    );
}

function mapRoomToRow(room) {
    const today = new Date().toISOString().slice(0, 10);
    const activeOrNextBooking = (room.bookings || []).find((b) => String(b.check_out).slice(0, 10) >= today);
    const primaryImage = room.images?.find((img) => img.is_primary)?.image_path
        || room.images?.[0]?.image_path
        || '/images/cottage/lily/lily-bedroom.jpeg';

    let guestLabel = 'No active guest';
    let dateLabel = 'Ready Immediate';
    let detailLabel = 'NO HOLDS ACTIVE';

    if (room.status === 'MAINTENANCE') {
        guestLabel = 'Under Scheduled Maintenance';
        dateLabel = 'Maintenance Lock';
        detailLabel = 'BLOCKED FROM BOOKING';
    } else if (activeOrNextBooking) {
        const checkInStr = String(activeOrNextBooking.check_in).slice(0, 10);
        const checkOutStr = String(activeOrNextBooking.check_out).slice(0, 10);
        const nights = Math.max(1, Math.round((new Date(`${checkOutStr}T12:00:00`) - new Date(`${checkInStr}T12:00:00`)) / 86400000));
        guestLabel = `Guest: ${activeOrNextBooking.guest_name}`;
        dateLabel = new Date(`${checkOutStr}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        detailLabel = `${nights} ${nights === 1 ? 'NIGHT' : 'NIGHTS'} (${activeOrNextBooking.booking_code})`;
    }

    return {
        id: room.id,
        slug: room.slug,
        name: room.name,
        description: room.description || '',
        capacity: room.capacity || 2,
        image: primaryImage,
        rate: Number(room.price_per_night) || 0,
        guest: guestLabel,
        date: dateLabel,
        detail: detailLabel,
        status: room.status || 'AVAILABLE',
        exportUrl: room.export_url || `/ical/export/${room.slug}.ics?token=${room.export_token || ''}`,
    };
}

const platformLabels = {
    airbnb: 'Airbnb',
    tiket_com: 'Tiket.com',
    booking_com: 'Booking.com',
    agoda: 'Agoda',
    other: 'Other OTA',
};

export default function AdminDashboard({
    rooms = [],
    arrivalsToday = [],
    seasonalRates = [],
    icalLinks = [],
    dashboardStats = {
        revenue: { amount: 'IDR 0.0M', target: '0%', bookings: 0 },
        occupancy: { amount: '0%', units: '0 of 0 units', percent: 0 },
        arrivals: { parties: 0, guests: 0, pending: 0 },
    },
}) {
    const { auth } = usePage().props;
    const cottages = useMemo(() => rooms.map(mapRoomToRow), [rooms]);

    const [filters, setFilters] = useState({
        type: 'ALL COTTAGE TYPES',
        state: 'ALL STATES',
        search: '',
    });
    const [searchOpen, setSearchOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSeasonalModalOpen, setIsSeasonalModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isArrivalsModalOpen, setIsArrivalsModalOpen] = useState(false);
    const [isOtaModalOpen, setIsOtaModalOpen] = useState(false);
    const [selectedCottage, setSelectedCottage] = useState(null);
    const [seasonalFormData, setSeasonalFormData] = useState({
        ruleName: '',
        startDate: '',
        endDate: '',
        targetRoom: 'All',
        rateAdjustment: '',
    });
    const [icalFormData, setIcalFormData] = useState({
        room_id: rooms[0]?.id || '',
        platform: 'airbnb',
        url: '',
    });
    const [copiedSlug, setCopiedSlug] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isAddingIcal, setIsAddingIcal] = useState(false);
    const [openStatusMenu, setOpenStatusMenu] = useState(null);
    const [statusBanner, setStatusBanner] = useState('');
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    const currentDate = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

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

    useEffect(() => {
        if (!isSeasonalModalOpen && !isEditModalOpen && !isArrivalsModalOpen && !isOtaModalOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        function closeOnEscape(event) {
            if (event.key === 'Escape') {
                setIsSeasonalModalOpen(false);
                setIsEditModalOpen(false);
                setIsArrivalsModalOpen(false);
                setIsOtaModalOpen(false);
            }
        }

        window.addEventListener('keydown', closeOnEscape);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', closeOnEscape);
        };
    }, [isSeasonalModalOpen, isEditModalOpen, isArrivalsModalOpen, isOtaModalOpen]);

    async function handleLogout() {
        try {
            await window.axios.post('/logout');
            router.visit('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    function openEditModal(cottage) {
        setSelectedCottage({ ...cottage });
        setIsEditModalOpen(true);
    }

    function updateSelectedCottage(event) {
        const { name, value } = event.target;
        setSelectedCottage((current) => ({
            ...current,
            [name]: name === 'rate' || name === 'capacity' ? Number(value) : value,
        }));
    }

    async function handleSaveChanges(event) {
        event.preventDefault();
        if (!selectedCottage) return;

        try {
            await window.axios.put(`/admin/rooms/${selectedCottage.id}`, {
                name: selectedCottage.name,
                price_per_night: selectedCottage.rate,
                status: selectedCottage.status,
                capacity: selectedCottage.capacity,
            });
            setIsEditModalOpen(false);
            setSelectedCottage(null);
            setStatusBanner('Cottage details updated successfully.');
            router.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update cottage.');
        }
    }

    async function handleForceLedgerRefresh() {
        if (isRefreshing) return;
        setIsRefreshing(true);

        try {
            const response = await window.axios.post('/admin/ical-links/sync');
            setStatusBanner(response.data?.message || 'OTA ledger sync completed.');
            router.reload({
                onFinish: () => setIsRefreshing(false),
            });
        } catch (error) {
            setIsRefreshing(false);
            setStatusBanner(error.response?.data?.message || 'Failed to run OTA iCal sync.');
        }
    }

    async function handleCopyExportUrl(cottage) {
        const fullUrl = cottage.exportUrl.startsWith('http')
            ? cottage.exportUrl
            : `${window.location.origin}${cottage.exportUrl}`;

        try {
            await navigator.clipboard.writeText(fullUrl);
            setCopiedSlug(cottage.slug);
            setTimeout(() => setCopiedSlug(''), 2000);
        } catch {
            window.prompt('Copy this iCal Export URL:', fullUrl);
        }
    }

    async function handleAddIcalLink(event) {
        event.preventDefault();
        setIsAddingIcal(true);
        try {
            const response = await window.axios.post('/admin/ical-links', icalFormData);
            setIcalFormData((current) => ({ ...current, url: '' }));
            setStatusBanner(response.data?.message || 'OTA iCal link added.');
            router.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save iCal link. Please enter a valid .ics URL.');
        } finally {
            setIsAddingIcal(false);
        }
    }

    async function handleDeleteIcalLink(linkId) {
        try {
            await window.axios.delete(`/admin/ical-links/${linkId}`);
            setStatusBanner('OTA iCal link removed.');
            router.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove iCal link.');
        }
    }

    function updateSeasonalForm(event) {
        const { name, value } = event.target;
        setSeasonalFormData((current) => ({ ...current, [name]: value }));
    }

    async function handleSaveSeasonalRule(event) {
        event.preventDefault();
        try {
            const matchedRoom = seasonalFormData.targetRoom === 'All'
                ? null
                : rooms.find((r) => r.name.toLowerCase().includes(seasonalFormData.targetRoom.toLowerCase()));

            await window.axios.post('/admin/seasonal-rates', {
                rule_name: seasonalFormData.ruleName,
                room_id: matchedRoom ? matchedRoom.id : null,
                start_date: seasonalFormData.startDate,
                end_date: seasonalFormData.endDate,
                rate_adjustment_percent: Number(seasonalFormData.rateAdjustment),
            });

            setIsSeasonalModalOpen(false);
            setSeasonalFormData({
                ruleName: '',
                startDate: '',
                endDate: '',
                targetRoom: 'All',
                rateAdjustment: '',
            });
            setStatusBanner('Seasonal rate rule saved and active.');
            router.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save seasonal rate rule.');
        }
    }

    async function changeStatus(id, status) {
        setOpenStatusMenu(null);
        try {
            await window.axios.patch(`/admin/rooms/${id}/status`, { status });
            setStatusBanner(`Room status updated to ${status}.`);
            router.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status.');
        }
    }

    async function toggleArrivalCheckIn(arrival) {
        const nextState = arrival.check_in_status === 'checked_in' ? 'pending_arrival' : 'checked_in';
        try {
            await window.axios.patch(`/admin/bookings/${arrival.id}`, {
                check_in_status: nextState,
            });
            router.reload();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update check-in status.');
        }
    }

    const visibleCottages = useMemo(() => cottages.filter((cottage) => {
        const matchesType = filters.type === 'ALL COTTAGE TYPES'
            || cottage.name.toLowerCase().includes(filters.type.toLowerCase());
        const matchesState = filters.state === 'ALL STATES' || cottage.status === filters.state;
        const matchesSearch = `${cottage.name} ${cottage.guest} ${cottage.status}`.toLowerCase().includes(filters.search.toLowerCase());
        return matchesType && matchesState && matchesSearch;
    }), [cottages, filters]);

    function updateFilters(event) {
        const { name, value } = event.target;
        setFilters((current) => ({ ...current, [name]: value }));
    }

    return (
        <>
            <Head title="Admin Dashboard — The Boe Cottage" />
            <div className="min-h-screen bg-[#FBF9F4] font-sans text-[#1E322A]">
                <aside className="fixed inset-y-0 left-0 z-40 hidden w-[200px] flex-col border-r border-[#E7E4DC] bg-[#F3F1EB] px-4 py-5 md:flex">
                    <a href="/" className="mb-9 flex items-start gap-2.5 px-1 text-[#1E322A] no-underline">
                        <span aria-hidden="true" className="mt-1 text-sm text-[#AE8A66]">✦</span>
                        <span>
                            <span className="block font-serif text-[17px] leading-5">The Boe Cottage</span>
                            <span className="mt-1 block font-sans text-[8px] font-semibold tracking-[0.18em] text-[#747873]">STAFF LEDGER</span>
                        </span>
                    </a>

                    <nav aria-label="Admin navigation" className="space-y-1">
                        <a href="/admin-dashboard" aria-current="page" className="flex h-9 items-center gap-2 rounded-sm bg-[#1E322A] px-3 text-[10px] font-medium tracking-[0.06em] text-white">
                            <Icon name="grid" className="h-3.5 w-3.5" />
                            DASHBOARD
                        </a>
                        <a href="/central-bookings" className="flex h-9 items-center gap-2 rounded-sm px-3 text-[10px] font-medium tracking-[0.06em] text-[#363D37] transition-colors hover:bg-white/70">
                            <Icon name="bookings" className="h-3.5 w-3.5" />
                            CENTRAL BOOKINGS
                        </a>
                        <button
                            type="button"
                            onClick={() => setIsOtaModalOpen(true)}
                            className="flex h-9 w-full items-center gap-2 rounded-sm px-3 text-left text-[10px] font-medium tracking-[0.06em] text-[#363D37] transition-colors hover:bg-white/70"
                        >
                            <Icon name="link" className="h-3.5 w-3.5" />
                            OTA CHANNEL SYNC
                        </button>
                    </nav>

                    <div className="mt-auto border-t border-[#E1DED6] pt-4">
                        <div className="flex items-center gap-2.5 px-1">
                            <span className="flex h-8 w-8 items-center justify-center bg-[#E3E8E2] text-[11px] text-[#346B55]">LD</span>
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-[10px] font-semibold">{auth?.user?.name || 'Lead Desk'}</span>
                                <span className="block text-[8px] tracking-[0.05em] text-[#747873]">Duty Steward</span>
                            </span>
                            <span aria-hidden="true" className="text-[12px] text-[#5A615B]">•</span>
                        </div>
                        <button type="button" onClick={handleLogout} className="mt-4 flex w-full items-center justify-end gap-2 px-1 text-[9px] font-semibold tracking-[0.1em] text-[#AE5535] transition-colors hover:text-[#8E3D24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">
                            <Icon name="logout" className="h-3.5 w-3.5" />
                            LOG OUT
                        </button>
                    </div>
                </aside>

                <main className="min-h-screen md:ml-[200px]">
                    <header className="sticky top-0 z-30 border-b border-[#EAE7DF] bg-[#FBF9F4]/95 backdrop-blur">
                        <div className="flex min-h-[54px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
                            <div className="flex min-w-0 items-center gap-2">
                                <a href="/" className="mr-2 flex shrink-0 items-center gap-2 md:hidden">
                                    <span className="font-serif text-sm">The Boe Cottage</span>
                                </a>
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#AE5535]" />
                                <p className="truncate text-[8px] font-semibold tracking-[0.11em] text-[#4D544E] sm:text-[9px]">
                                    HIGHLAND DISPATCH SYNC <span className="px-1 text-[#AE8A66]">•</span> ACTIVE LEDGER
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                                {searchOpen && (
                                    <input
                                        autoFocus
                                        aria-label="Search cottages"
                                        name="search"
                                        value={filters.search}
                                        onChange={updateFilters}
                                        onFocus={() => { setIsNotifOpen(false); setIsProfileOpen(false); }}
                                        placeholder="Search ledger"
                                        className="w-28 border border-[#CFCBC1] bg-transparent px-2 py-1.5 text-[10px] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A] sm:w-40"
                                    />
                                )}
                                <button type="button" aria-label={searchOpen ? 'Close search' : 'Search cottages'} onClick={() => {
                                    setSearchOpen((open) => !open);
                                    setFilters((current) => ({ ...current, search: '' }));
                                }} className="text-[#3C453E] hover:text-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">
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
                                            <p className="text-[11px] leading-relaxed text-gray-600">
                                                {arrivalsToday.length > 0
                                                    ? `You have ${arrivalsToday.length} arrival(s) scheduled today.`
                                                    : 'You have no new alerts at this moment.'}
                                            </p>
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
                            <a href="/admin-dashboard" aria-current="page" className="rounded-sm bg-[#1E322A] px-3 py-1.5 text-[9px] font-medium text-white">DASHBOARD</a>
                            <a href="/central-bookings" className="rounded-sm px-3 py-1.5 text-[9px] font-medium text-[#363D37] hover:bg-white">CENTRAL BOOKINGS</a>
                            <button type="button" onClick={() => setIsOtaModalOpen(true)} className="rounded-sm px-3 py-1.5 text-[9px] font-medium text-[#363D37] hover:bg-white">OTA SYNC</button>
                        </nav>
                    </header>

                    <div className="mx-auto max-w-[1500px] px-5 pb-6 pt-7 sm:px-8 lg:px-10 lg:pt-9">
                        {statusBanner && (
                            <div className="mb-5 flex items-center justify-between border border-[#346B55] bg-[#DCE9DF] px-4 py-2.5 text-xs text-[#1E322A]">
                                <span>{statusBanner}</span>
                                <button type="button" onClick={() => setStatusBanner('')} className="font-bold">×</button>
                            </div>
                        )}

                        <section aria-labelledby="daily-operations-title">
                            <div className="mb-4 inline-flex items-center gap-2 bg-[#DCE9DF] px-2 py-1 text-[8px] font-bold tracking-[0.12em] text-[#315642]">
                                <span className="h-1 w-1 rounded-full bg-[#346B55]" />
                                DIENG PLATEAU <span className="text-[#819789]">•</span> 2,093M ASL
                            </div>
                            <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
                                <div>
                                    <h1 id="daily-operations-title" className="font-serif text-[34px] font-normal leading-[1.05] tracking-[-0.035em] sm:text-[40px]">
                                        Daily Operations
                                    </h1>
                                    <p className="mt-1.5 font-serif text-[13px] text-[#626861]">{currentDate}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button type="button" onClick={() => setIsOtaModalOpen(true)} className="inline-flex h-9 items-center gap-2 bg-[#1E322A] px-3.5 text-[8px] font-semibold tracking-[0.06em] text-white transition-colors hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]">
                                        <Icon name="link" className="h-3.5 w-3.5" />
                                        OTA CHANNEL SYNC ({icalLinks.length})
                                    </button>
                                    <button type="button" onClick={() => setIsSeasonalModalOpen(true)} className="inline-flex h-9 items-center gap-2 bg-[#F0EFEA] px-3.5 text-[8px] font-semibold tracking-[0.06em] text-[#29372E] transition-colors hover:bg-[#E7E5DD] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]">
                                        <Icon name="filter" className="h-3.5 w-3.5" />
                                        SEASONAL RATE RULES ({seasonalRates.length})
                                    </button>
                                </div>
                            </div>

                            <div role="status" className="mb-5 flex items-center gap-2 border border-[#ECE9E1] bg-[#F5F3EE] px-3.5 py-3 text-[9px] leading-relaxed text-[#454C46] sm:text-[10px]">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#AE5535]" />
                                <p><span className="font-semibold text-[#273A2E]">Live Sync Active:</span> Availability edits, maintenance locks, and seasonal surcharges propagate immediately to Guest Explore, Airbnb &amp; Tiket.com iCal Feeds.</p>
                            </div>

                            <div className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                                <SummaryCard label="Confirmed Revenue" icon="cash" className="sm:col-span-2 md:col-span-1">
                                    <p className="font-serif text-[23px] leading-none tracking-[-0.02em]">{dashboardStats.revenue.amount}</p>
                                    <div className="mt-8 flex items-end justify-between">
                                        <p className="text-[8px] uppercase leading-relaxed tracking-[0.08em] text-[#727871]">Bookings<br /><span className="text-[10px] font-medium tracking-normal text-[#25352B]">{dashboardStats.revenue.bookings}</span></p>
                                        <p className="text-right text-[8px] uppercase leading-relaxed tracking-[0.08em] text-[#727871]">Target<br /><span className="text-[10px] font-medium tracking-normal text-[#25352B]">{dashboardStats.revenue.target}</span></p>
                                    </div>
                                </SummaryCard>
                                <SummaryCard label="Occupancy Level" icon="cabin">
                                    <div className="flex items-baseline gap-2">
                                        <p className="font-serif text-[23px] leading-none tracking-[-0.02em]">{dashboardStats.occupancy.amount}</p>
                                        <span className="text-[9px] text-[#727871]">{dashboardStats.occupancy.units}</span>
                                    </div>
                                    <div className="mt-6 h-[5px] overflow-hidden bg-[#E9E8E2]">
                                        <div className="h-full bg-[#1E322A]" style={{ width: `${dashboardStats.occupancy.percent}%` }} />
                                    </div>
                                </SummaryCard>
                                <SummaryCard label="Arrivals Today" icon="arrival" className="sm:col-span-2 md:col-span-1">
                                    <div className="flex items-center justify-between">
                                        <p className="font-serif text-[22px] leading-[1.05] text-[#AE5535]">{dashboardStats.arrivals.parties}<br />Parties</p>
                                        <p className="text-[9px] leading-relaxed text-[#667068]">{dashboardStats.arrivals.guests} Guests<br />total</p>
                                    </div>
                                    <div className="mt-5 flex items-end justify-between text-[8px] uppercase tracking-[0.08em]">
                                        <span className="text-[#727871]">Arrived<br /><span className="text-[#26362C]">{dashboardStats.arrivals.pending} Pending</span></span>
                                        <button type="button" onClick={() => setIsArrivalsModalOpen(true)} className="cursor-pointer text-left font-semibold leading-relaxed text-[#AE5535] transition-colors hover:text-[#8E3D24] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">View<br />passes</button>
                                    </div>
                                </SummaryCard>
                            </div>
                        </section>

                        <section id="cottage-management" aria-labelledby="cottage-management-title">
                            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <h2 id="cottage-management-title" className="font-serif text-[26px] leading-tight tracking-[-0.025em] sm:text-[29px]">Cottage Management</h2>
                                    <p className="mt-1 max-w-[530px] text-[10px] leading-relaxed text-[#687069]">Manage physical units, live operational states, and nightly tariff configurations across the estate.</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <label className="sr-only" htmlFor="cottage-type-filter">Filter by cottage type</label>
                                    <select id="cottage-type-filter" name="type" value={filters.type} onChange={updateFilters} className="h-8 min-w-[138px] border-0 bg-[#F0EFEA] px-3 text-[8px] font-semibold tracking-[0.04em] text-[#27352C] outline-none focus-visible:ring-1 focus-visible:ring-[#346B55]">
                                        <option>ALL COTTAGE TYPES</option>
                                        <option>LILY</option>
                                        <option>DAISY</option>
                                    </select>
                                    <label className="sr-only" htmlFor="cottage-state-filter">Filter by operational state</label>
                                    <select id="cottage-state-filter" name="state" value={filters.state} onChange={updateFilters} className="h-8 min-w-[105px] border-0 bg-[#F0EFEA] px-3 text-[8px] font-semibold tracking-[0.04em] text-[#27352C] outline-none focus-visible:ring-1 focus-visible:ring-[#346B55]">
                                        <option>ALL STATES</option>
                                        <option>AVAILABLE</option>
                                        <option>OCCUPIED</option>
                                        <option>MAINTENANCE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto border-y border-[#EAE7DF]">
                                <table className="table-fixed w-full min-w-[700px] border-collapse text-left md:min-w-0">
                                    <thead className="bg-[#F0EFEA]">
                                        <tr className="h-9">
                                            <th scope="col" className="w-[25%] px-4 text-[8px] font-semibold tracking-[0.09em] text-[#60665F]">COTTAGE NAME</th>
                                            <th scope="col" className="w-[14%] px-3 text-[8px] font-semibold tracking-[0.09em] text-[#60665F]">NIGHTLY RATE</th>
                                            <th scope="col" className="w-[21%] px-3 text-[8px] font-semibold tracking-[0.09em] text-[#60665F]">CURRENT / NEXT GUEST</th>
                                            <th scope="col" className="w-[19%] px-3 text-[8px] font-semibold tracking-[0.09em] text-[#60665F]">NEXT CHECKOUT / STATUS</th>
                                            <th scope="col" className="w-[16%] px-3 text-center text-[8px] font-semibold tracking-[0.09em] text-[#60665F]">STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleCottages.map((cottage) => (
                                            <tr key={cottage.id} className="h-[86px] border-b border-[#F0EEE8] bg-white last:border-b-0 hover:bg-[#FEFDFB]">
                                                <td className="px-4">
                                                    <div className="flex items-center gap-2.5">
                                                        <img src={cottage.image} alt="" className="h-8 w-9 shrink-0 object-cover sm:h-9 sm:w-10" loading="lazy" />
                                                        <span className="font-serif text-[14px] leading-tight text-[#1E322A]">{cottage.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-[10px] font-medium leading-relaxed text-[#25352B]">{money(cottage.rate)}</span>
                                                        <button type="button" aria-label={`Edit ${cottage.name}`} onClick={() => openEditModal(cottage)} className="text-[#647068] transition-colors hover:text-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"><Icon name="pencil" className="h-3 w-3" /></button>
                                                    </div>
                                                </td>
                                                <td className={`px-3 text-[9px] leading-relaxed ${cottage.status === 'MAINTENANCE' ? 'text-[#AE5535]' : 'text-[#38413A]'}`}>{cottage.guest}</td>
                                                <td className="px-3">
                                                    <span className={`block text-[9px] leading-relaxed ${cottage.date.includes('Ready') ? 'text-[#346B55]' : 'text-[#38413A]'}`}>{cottage.date}</span>
                                                    {cottage.detail && <span className="mt-0.5 block text-[7px] font-medium uppercase leading-relaxed tracking-[0.07em] text-[#687069]">{cottage.detail}</span>}
                                                </td>
                                                <td className="px-3 text-center">
                                                    <div className="relative inline-block">
                                                        <button
                                                            type="button"
                                                            aria-haspopup="listbox"
                                                            aria-expanded={openStatusMenu === cottage.id}
                                                            onClick={() => setOpenStatusMenu((open) => open === cottage.id ? null : cottage.id)}
                                                            className="inline-flex h-7 min-w-[94px] items-center justify-center gap-1.5 bg-[#1E322A] px-2 text-[7px] font-semibold tracking-[0.03em] text-white transition-colors hover:bg-[#346B55]"
                                                        >
                                                            {cottage.status}
                                                            <Icon name="chevron" className="h-2.5 w-2.5" />
                                                        </button>
                                                        {openStatusMenu === cottage.id && (
                                                            <div role="listbox" aria-label={`Set ${cottage.name} status`} className="absolute right-0 top-full z-20 mt-1 min-w-[118px] border border-[#E4E1D9] bg-white p-1 text-left shadow-lg">
                                                                {['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((status) => (
                                                                    <button key={status} type="button" role="option" aria-selected={cottage.status === status} onClick={() => changeStatus(cottage.id, status)} className="block w-full px-2 py-2 text-left text-[8px] font-semibold text-[#26362C] hover:bg-[#F1ECE0]">{status}</button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {visibleCottages.length === 0 && (
                                            <tr><td colSpan="5" className="bg-white px-4 py-12 text-center text-[11px] text-[#687069]">No cottages match these filters.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end pt-3">
                                <button type="button" onClick={handleForceLedgerRefresh} disabled={isRefreshing} className="inline-flex items-center gap-1.5 px-1 py-1 text-[8px] font-semibold tracking-[0.04em] text-[#AE5535] transition-colors hover:text-[#8E3D24] disabled:cursor-wait disabled:opacity-60">
                                    <Icon name="refresh" className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    {isRefreshing ? 'SYNCING OTA FEEDS...' : 'FORCE LEDGER & OTA SYNC'}
                                </button>
                            </div>
                        </section>
                    </div>
                </main>
            </div>

            {isOtaModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setIsOtaModalOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="ota-sync-title"
                        className="my-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-[#FBF9F4] p-6 shadow-xl sm:p-8"
                    >
                        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#E5E2DA] pb-4">
                            <div>
                                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#AE8A66]">Two-Way Channel Manager</p>
                                <h2 id="ota-sync-title" className="mt-1 font-serif text-2xl text-[#1E322A]">
                                    OTA Channel Sync (Airbnb &amp; Tiket.com)
                                </h2>
                            </div>
                            <button
                                type="button"
                                aria-label="Close OTA channel sync modal"
                                onClick={() => setIsOtaModalOpen(false)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-[#59615A] transition-colors hover:text-[#1E322A]"
                            >
                                ×
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#346B55]">
                                    1. Outbound iCal Export URLs (Paste into Airbnb &amp; Tiket.com)
                                </h3>
                                <p className="mt-1 text-[11px] text-[#666A64]">
                                    Copy each room&apos;s `.ics` export URL below and paste it into your Airbnb and Tiket.com calendar import settings so direct website bookings automatically block dates on the OTAs.
                                </p>
                                <div className="mt-3 space-y-2">
                                    {cottages.map((cottage) => (
                                        <div key={cottage.id} className="flex flex-col gap-2 border border-[#E4E1D9] bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-serif text-sm font-medium text-[#1E322A]">{cottage.name}</p>
                                                <p className="mt-0.5 truncate font-mono text-[10px] text-[#59615A]">{cottage.exportUrl}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyExportUrl(cottage)}
                                                className="inline-flex h-8 shrink-0 items-center gap-1.5 bg-[#1E322A] px-3 text-[9px] font-semibold tracking-[0.06em] text-white transition-colors hover:bg-[#346B55]"
                                            >
                                                <Icon name="copy" className="h-3 w-3" />
                                                {copiedSlug === cottage.slug ? 'COPIED!' : 'COPY .ICS URL'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-[#E5E2DA] pt-5">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#346B55]">
                                        2. Inbound iCal Import Links (Pull from Airbnb &amp; Tiket.com)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleForceLedgerRefresh}
                                        disabled={isRefreshing}
                                        className="inline-flex items-center gap-1.5 bg-[#AE5535] px-3 py-1.5 text-[9px] font-semibold tracking-[0.06em] text-white hover:bg-[#8E3D24] disabled:opacity-60"
                                    >
                                        <Icon name="refresh" className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                                        {isRefreshing ? 'SYNCING...' : 'SYNC ALL NOW'}
                                    </button>
                                </div>

                                <form onSubmit={handleAddIcalLink} className="mt-3 grid grid-cols-1 gap-3 border border-[#E4E1D9] bg-[#F4F2ED] p-3.5 sm:grid-cols-[1fr_1fr_2fr_auto]">
                                    <select
                                        required
                                        value={icalFormData.room_id}
                                        onChange={(e) => setIcalFormData((cur) => ({ ...cur, room_id: e.target.value }))}
                                        className="h-9 border border-[#D8D5CC] bg-white px-2.5 text-xs text-[#1E322A] outline-none"
                                    >
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        required
                                        value={icalFormData.platform}
                                        onChange={(e) => setIcalFormData((cur) => ({ ...cur, platform: e.target.value }))}
                                        className="h-9 border border-[#D8D5CC] bg-white px-2.5 text-xs text-[#1E322A] outline-none"
                                    >
                                        <option value="airbnb">Airbnb</option>
                                        <option value="tiket_com">Tiket.com</option>
                                        <option value="booking_com">Booking.com</option>
                                        <option value="agoda">Agoda</option>
                                        <option value="other">Other OTA</option>
                                    </select>
                                    <input
                                        required
                                        type="url"
                                        value={icalFormData.url}
                                        onChange={(e) => setIcalFormData((cur) => ({ ...cur, url: e.target.value }))}
                                        placeholder="https://www.airbnb.com/calendar/ical/....ics"
                                        className="h-9 border border-[#D8D5CC] bg-white px-3 text-xs text-[#1E322A] outline-none"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isAddingIcal}
                                        className="h-9 bg-[#1E322A] px-4 text-[9px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-[#346B55] disabled:opacity-60"
                                    >
                                        {isAddingIcal ? 'SAVING...' : 'ADD FEED'}
                                    </button>
                                </form>

                                <div className="mt-3 divide-y divide-[#E8E5DC] border border-[#E4E1D9] bg-white">
                                    {icalLinks.length === 0 && (
                                        <p className="p-4 text-center text-xs text-[#687069]">
                                            No external OTA `.ics` feeds connected yet. Add your Airbnb or Tiket.com calendar link above.
                                        </p>
                                    )}
                                    {icalLinks.map((link) => (
                                        <div key={link.id} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-[#DCE9DF] px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-[#315642]">
                                                        {platformLabels[link.platform] || link.platform}
                                                    </span>
                                                    <span className="font-serif text-xs font-semibold text-[#1E322A]">
                                                        {link.room?.name || `Room #${link.room_id}`}
                                                    </span>
                                                    <span className="text-[9px] text-[#747873]">
                                                        • Last synced: {link.last_synced_at ? new Date(link.last_synced_at).toLocaleString('en-GB') : 'Never'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 truncate font-mono text-[10px] text-[#59615A]">{link.url}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteIcalLink(link.id)}
                                                aria-label="Delete OTA link"
                                                className="inline-flex h-7 items-center gap-1 self-end px-2 text-[9px] font-semibold text-[#AE5535] hover:bg-[#FADBD1]/40 sm:self-auto"
                                            >
                                                <Icon name="trash" className="h-3.5 w-3.5" />
                                                REMOVE
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {isSeasonalModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setIsSeasonalModalOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="seasonal-rate-title"
                        className="my-auto w-full max-w-md rounded-md bg-[#FBF9F4] p-6 shadow-xl sm:p-8"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <h2 id="seasonal-rate-title" className="font-serif text-2xl text-[#1E322A]">
                                Seasonal Rate Configuration
                            </h2>
                            <button
                                type="button"
                                aria-label="Close seasonal rate configuration"
                                onClick={() => setIsSeasonalModalOpen(false)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-[#59615A] transition-colors hover:text-[#1E322A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSaveSeasonalRule} className="space-y-4">
                            <label className="block text-xs font-medium text-[#424A43]">
                                Rule name
                                <input
                                    required
                                    name="ruleName"
                                    value={seasonalFormData.ruleName}
                                    onChange={updateSeasonalForm}
                                    placeholder="e.g. Year-end holiday"
                                    className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                />
                            </label>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="block text-xs font-medium text-[#424A43]">
                                    Start date
                                    <input
                                        required
                                        type="date"
                                        name="startDate"
                                        value={seasonalFormData.startDate}
                                        onChange={updateSeasonalForm}
                                        className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                    />
                                </label>
                                <label className="block text-xs font-medium text-[#424A43]">
                                    End date
                                    <input
                                        required
                                        type="date"
                                        name="endDate"
                                        min={seasonalFormData.startDate || undefined}
                                        value={seasonalFormData.endDate}
                                        onChange={updateSeasonalForm}
                                        className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                    />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="block text-xs font-medium text-[#424A43]">
                                    Target room
                                    <select
                                        name="targetRoom"
                                        value={seasonalFormData.targetRoom}
                                        onChange={updateSeasonalForm}
                                        className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                    >
                                        <option value="All">All</option>
                                        {rooms.map((r) => (
                                            <option key={r.id} value={r.name}>{r.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="block text-xs font-medium text-[#424A43]">
                                    Rate adjustment (%)
                                    <input
                                        required
                                        type="number"
                                        name="rateAdjustment"
                                        value={seasonalFormData.rateAdjustment}
                                        onChange={updateSeasonalForm}
                                        placeholder="e.g. 15"
                                        className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                    />
                                </label>
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsSeasonalModalOpen(false)}
                                    className="px-4 py-2.5 text-xs font-semibold text-[#4B534C] transition-colors hover:bg-[#EFEEE8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#1E322A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                                >
                                    Save Rule
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {isEditModalOpen && selectedCottage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setIsEditModalOpen(false);
                            setSelectedCottage(null);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="edit-cottage-title"
                        className="my-auto w-full max-w-md rounded-md bg-[#FBF9F4] p-6 shadow-xl sm:p-8"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <h2 id="edit-cottage-title" className="font-serif text-2xl text-[#1E322A]">
                                Edit Cottage Details
                            </h2>
                            <button
                                type="button"
                                aria-label="Close edit cottage details"
                                onClick={() => {
                                    setIsEditModalOpen(false);
                                    setSelectedCottage(null);
                                }}
                                className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-[#59615A] transition-colors hover:text-[#1E322A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSaveChanges} className="space-y-4">
                            <label className="block text-xs font-medium text-[#424A43]">
                                Cottage name
                                <input
                                    required
                                    name="name"
                                    value={selectedCottage.name}
                                    onChange={updateSelectedCottage}
                                    className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                />
                            </label>
                            <label className="block text-xs font-medium text-[#424A43]">
                                Nightly rate (IDR)
                                <input
                                    required
                                    min="0"
                                    step="1000"
                                    type="number"
                                    name="rate"
                                    value={selectedCottage.rate}
                                    onChange={updateSelectedCottage}
                                    className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                />
                            </label>
                            <label className="block text-xs font-medium text-[#424A43]">
                                Status
                                <select
                                    name="status"
                                    value={selectedCottage.status}
                                    onChange={updateSelectedCottage}
                                    className="mt-1.5 block w-full border border-[#D8D5CC] bg-white px-3 py-2.5 text-sm text-[#1E322A] outline-none transition focus:border-[#1E322A] focus:ring-1 focus:ring-[#1E322A]"
                                >
                                    <option value="AVAILABLE">Available</option>
                                    <option value="OCCUPIED">Occupied</option>
                                    <option value="MAINTENANCE">Maintenance</option>
                                </select>
                            </label>
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditModalOpen(false);
                                        setSelectedCottage(null);
                                    }}
                                    className="px-4 py-2.5 text-xs font-semibold text-[#4B534C] transition-colors hover:bg-[#EFEEE8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#1E322A] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {isArrivalsModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setIsArrivalsModalOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="todays-arrivals-title"
                        className="my-auto w-full max-w-lg rounded-md bg-[#FBF9F4] p-6 shadow-xl sm:p-8"
                    >
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <h2 id="todays-arrivals-title" className="font-serif text-2xl text-[#1E322A]">
                                Today&apos;s Arrivals
                            </h2>
                            <button
                                type="button"
                                aria-label="Close today's arrivals"
                                onClick={() => setIsArrivalsModalOpen(false)}
                                className="flex h-8 w-8 shrink-0 items-center justify-center text-xl text-[#59615A] transition-colors hover:text-[#1E322A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"
                            >
                                ×
                            </button>
                        </div>
                        <div className="divide-y divide-[#E8E5DC]">
                            {arrivalsToday.length === 0 && (
                                <p className="py-6 text-center text-xs text-[#687069]">No scheduled check-ins for today.</p>
                            )}
                            {arrivalsToday.map((arrival) => (
                                <article key={arrival.id} className="flex flex-col gap-2 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold text-[#1E322A]">{arrival.guest_name}</h3>
                                        <p className="mt-1 text-xs text-[#687069]">{arrival.room?.name || 'Cottage'} • {arrival.booking_code}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => toggleArrivalCheckIn(arrival)}
                                        className={`w-fit text-[9px] font-semibold uppercase tracking-[0.06em] ${arrival.check_in_status === 'checked_in' ? 'bg-[#D5EAD9] text-[#254A31]' : 'bg-[#F4E8D9] text-[#8A5B2D]'} px-2.5 py-1.5`}
                                    >
                                        {arrival.check_in_status === 'checked_in' ? 'Checked-In' : 'Pending Arrival (Click to Check-In)'}
                                    </button>
                                </article>
                            ))}
                        </div>
                        <div className="flex justify-end pt-6">
                            <button
                                type="button"
                                onClick={() => setIsArrivalsModalOpen(false)}
                                className="bg-[#1E322A] px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                            >
                                Close
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
