import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const fallbackRoomOptions = [
    {
        id: 1,
        name: 'Daisy Room',
        description: 'Woven rattan, cast-iron wood stove, and unbroken morning mist vistas.',
        price_per_night: 3_000_000,
        status: 'AVAILABLE',
        image: '/images/cottage/daisy/daisy-bedroom.jpeg',
    },
    {
        id: 2,
        name: 'Lily Room',
        description: 'Ground terrace facing wild mountain hydrangeas with deep stone tub.',
        price_per_night: 3_300_000,
        status: 'AVAILABLE',
        image: '/images/cottage/lily/lily-bedroom.jpeg',
    },
];

const weekDays = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
const serviceFee = 370_000;
const money = (amount) => `IDR ${Math.round(Number(amount) || 0).toLocaleString('en-US')}`;

function toDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDate(value, fallback) {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return toDateString(date) === value ? date : fallback;
}

function formatDates(arrival, departure) {
    if (!arrival) return 'Select your dates';
    const start = new Date(`${arrival}T12:00:00`);
    const startLabel = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!departure) return `${startLabel}, ${start.getFullYear()} — select departure`;
    const end = new Date(`${departure}T12:00:00`);
    const endLabel = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startLabel} - ${endLabel}, ${end.getFullYear()}`;
}

function StepHeading({ number, children }) {
    return (
        <div className="mb-4 flex items-center gap-2 border-b border-[#DCD8CF] pb-2">
            <span className="bg-[#346B55] px-1.5 py-0.5 font-sans text-[8px] font-bold text-white">{number}</span>
            <h2 className="font-serif text-lg text-[#1E322A]">{children}</h2>
        </div>
    );
}

function Counter({ label, note, value, onDecrease, onIncrease }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div>
                <p className="font-sans text-xs font-semibold text-[#1E322A]">{label}</p>
                <p className="mt-0.5 font-sans text-[9px] text-[#777B75]">{note}</p>
            </div>
            <div className="flex items-center gap-2">
                <button type="button" onClick={onDecrease} aria-label={`Decrease ${label.toLowerCase()}`} className="h-7 w-7 border border-[#D5D1C8] font-sans text-sm text-[#1E322A] hover:bg-[#F1ECE0]">−</button>
                <span aria-live="polite" className="w-4 text-center font-sans text-xs text-[#1E322A]">{value}</span>
                <button type="button" onClick={onIncrease} aria-label={`Increase ${label.toLowerCase()}`} className="h-7 w-7 border border-[#D5D1C8] font-sans text-sm text-[#1E322A] hover:bg-[#F1ECE0]">+</button>
            </div>
        </div>
    );
}

function Calendar({ month, arrival, departure, todayStr, disabledDates = [], onMonthChange, onSelectDate }) {
    const monthLabel = month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const disabledSet = useMemo(() => new Set(disabledDates), [disabledDates]);

    const calendarDays = useMemo(() => {
        const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
        const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
        const daysInPreviousMonth = new Date(month.getFullYear(), month.getMonth(), 0).getDate();
        const cells = [];

        const cellCount = Math.ceil((firstDay.getDay() + daysInMonth) / 7) * 7;
        for (let index = 0; index < cellCount; index += 1) {
            let date;
            let inMonth = true;
            if (index < firstDay.getDay()) {
                date = new Date(month.getFullYear(), month.getMonth() - 1, daysInPreviousMonth - firstDay.getDay() + index + 1);
                inMonth = false;
            } else if (index >= firstDay.getDay() + daysInMonth) {
                date = new Date(month.getFullYear(), month.getMonth() + 1, index - firstDay.getDay() - daysInMonth + 1);
                inMonth = false;
            } else {
                date = new Date(month.getFullYear(), month.getMonth(), index - firstDay.getDay() + 1);
            }
            cells.push({ date, inMonth, value: toDateString(date) });
        }

        return cells;
    }, [month]);

    const nightsCount = arrival && departure
        ? Math.max(0, Math.round((new Date(`${departure}T12:00:00`) - new Date(`${arrival}T12:00:00`)) / 86400000))
        : 0;

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-sans text-xs font-medium text-[#1E322A]">{monthLabel}</h3>
                <div className="flex gap-1">
                    <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                        className="flex h-7 w-7 items-center justify-center border border-[#D5D1C8] text-[#1E322A] hover:bg-[#F1ECE0]"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        aria-label="Next month"
                        onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                        className="flex h-7 w-7 items-center justify-center border border-[#D5D1C8] text-[#1E322A] hover:bg-[#F1ECE0]"
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center">
                {weekDays.map((day) => (
                    <span key={day} className="py-1.5 font-sans text-[7px] font-semibold text-[#777B75]">{day}</span>
                ))}
                {calendarDays.map(({ date, inMonth, value }) => {
                    const isPast = value < todayStr;
                    const isReserved = disabledSet.has(value);
                    const isToday = value === todayStr;
                    const isArrival = value === arrival;
                    const isDeparture = value === departure;
                    const isBetween = arrival && departure && value > arrival && value < departure;
                    const selected = isArrival || isDeparture;
                    const isDisabled = isPast || isReserved;

                    return (
                        <button
                            key={value}
                            type="button"
                            disabled={isDisabled}
                            onClick={() => onSelectDate(value)}
                            aria-label={date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            aria-pressed={selected}
                            className={`relative h-7 font-sans text-[9px] transition-colors ${
                                isDisabled
                                    ? 'cursor-not-allowed bg-[#EFECE5] text-[#B5B4AE] line-through'
                                    : selected
                                        ? 'bg-[#346B55] font-semibold text-white'
                                        : isBetween
                                            ? 'bg-[#DCE8E0] text-[#1E322A]'
                                            : inMonth
                                                ? 'text-[#303832] hover:bg-[#E8E4DB]'
                                                : 'text-[#B5B4AE] hover:bg-[#E8E4DB]'
                            }`}
                        >
                            {date.getDate()}
                            {isToday && !selected && (
                                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#AE8A66]" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[#E6E2DA] pt-3 font-sans text-[8px] text-[#666A64]">
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 bg-[#346B55]" /> Selected ({nightsCount} nights)</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#AE8A66]" /> Today</span>
                <span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 border border-[#B5B4AE] bg-[#EFECE5]" /> Reserved / Unavailable</span>
            </div>
        </div>
    );
}

function ReservationHeader() {
    return (
        <header className="flex h-12 items-center bg-[#F1ECE0] px-6 sm:px-10">
            <Link href="/" aria-label="The Boe Cottage home" className="flex flex-col items-center text-[#AE8A66] no-underline">
                <span className="font-serif text-[6px] italic leading-[7px]">The</span>
                <span className="font-serif text-[10px] leading-[10px] tracking-[0.08em]">BOE</span>
                <span className="font-serif text-[12px] leading-[12px] tracking-[0.03em]">COTTAGE</span>
                <span className="font-sans text-[5px] font-medium leading-[6px] tracking-[0.4em]">DIENG</span>
            </Link>
        </header>
    );
}

export default function Reservation({ rooms: backendRooms = [], seasonalRates = [] }) {
    const { midtrans } = usePage().props;

    const roomOptions = useMemo(() => {
        if (backendRooms.length > 0) {
            return backendRooms.map((r, idx) => ({
                id: r.id,
                name: r.name,
                description: r.description || fallbackRoomOptions[idx]?.description || '',
                price: Number(r.price_per_night) || 3_000_000,
                status: r.status || 'AVAILABLE',
                image: r.images?.find((img) => img.is_primary)?.image_path
                    || r.images?.[0]?.image_path
                    || fallbackRoomOptions[idx]?.image
                    || '/images/cottage/daisy/daisy-bedroom.jpeg',
            }));
        }
        return fallbackRoomOptions.map((r) => ({ ...r, price: r.price_per_night }));
    }, [backendRooms]);

    const todayDate = new Date();
    const todayStr = toDateString(todayDate);
    const defaultStart = new Date(todayDate);
    defaultStart.setDate(defaultStart.getDate() + 1);
    const defaultEnd = new Date(defaultStart);
    defaultEnd.setDate(defaultEnd.getDate() + 2);

    const query = new URLSearchParams(typeof window === 'undefined' ? '' : window.location.search);
    const requestedCheckIn = parseDate(query.get('check_in'), defaultStart);
    const safeCheckIn = toDateString(requestedCheckIn) < todayStr ? defaultStart : requestedCheckIn;
    const requestedCheckOut = parseDate(query.get('check_out'), defaultEnd);
    const safeCheckOut = toDateString(requestedCheckOut) <= toDateString(safeCheckIn)
        ? new Date(safeCheckIn.getFullYear(), safeCheckIn.getMonth(), safeCheckIn.getDate() + 2)
        : requestedCheckOut;

    const requestedRoomName = query.get('room');
    const initialRoom = roomOptions.find((r) => r.name.toLowerCase() === String(requestedRoomName || '').toLowerCase()) || roomOptions[0];

    const [formData, setFormData] = useState({
        arrival: toDateString(safeCheckIn),
        departure: toDateString(safeCheckOut),
        adults: Math.max(1, Number(query.get('guests')) || 2),
        children: 0,
        roomId: initialRoom.id,
        name: '',
        email: '',
        whatsapp: '',
        notes: '',
    });

    const [month, setMonth] = useState(new Date(safeCheckIn.getFullYear(), safeCheckIn.getMonth(), 1));
    const [disabledDates, setDisabledDates] = useState([]);
    const [roomStatus, setRoomStatus] = useState(initialRoom.status || 'AVAILABLE');
    const [submitting, setSubmitting] = useState(false);
    const [bookingFeedback, setBookingFeedback] = useState(null);

    const selectedRoomData = useMemo(
        () => roomOptions.find((room) => room.id === Number(formData.roomId)) || roomOptions[0],
        [roomOptions, formData.roomId]
    );

    // Load Midtrans snap.js dynamically
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const clientKey = midtrans?.client_key;
        if (!clientKey) return undefined;

        const scriptUrl = midtrans?.is_production
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';

        if (document.querySelector(`script[src="${scriptUrl}"]`)) {
            return undefined;
        }

        const script = document.createElement('script');
        script.src = scriptUrl;
        script.setAttribute('data-client-key', clientKey);
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [midtrans]);

    // Fetch booked dates for selected room
    const fetchBookedDates = async (roomId) => {
        if (!roomId) return;
        try {
            const response = await window.axios.get(`/api/rooms/${roomId}/booked-dates`);
            setDisabledDates(response.data?.disabled_dates || []);
            setRoomStatus(response.data?.room_status || 'AVAILABLE');
        } catch (error) {
            console.error('Failed to fetch booked dates:', error);
        }
    };

    useEffect(() => {
        fetchBookedDates(selectedRoomData?.id);
    }, [selectedRoomData?.id]);

    // Calculate stay pricing including active seasonal rates
    const pricing = useMemo(() => {
        if (!formData.arrival || !formData.departure || formData.departure <= formData.arrival) {
            return { nights: 0, baseSubtotal: 0, seasonalAdjustment: 0, total: 0 };
        }

        const start = new Date(`${formData.arrival}T12:00:00`);
        const end = new Date(`${formData.departure}T12:00:00`);
        const nights = Math.max(0, Math.round((end - start) / 86400000));
        const basePrice = Number(selectedRoomData.price) || 0;

        let baseSubtotal = 0;
        let seasonalAdjustment = 0;

        const cursor = new Date(start);
        for (let i = 0; i < nights; i += 1) {
            const dateStr = toDateString(cursor);
            baseSubtotal += basePrice;

            seasonalRates.forEach((rule) => {
                if (!rule.is_active) return;
                if (rule.room_id && Number(rule.room_id) !== Number(selectedRoomData.id)) return;
                const ruleStart = String(rule.start_date).slice(0, 10);
                const ruleEnd = String(rule.end_date).slice(0, 10);
                if (dateStr >= ruleStart && dateStr <= ruleEnd) {
                    seasonalAdjustment += basePrice * (Number(rule.rate_adjustment_percent) / 100);
                }
            });

            cursor.setDate(cursor.getDate() + 1);
        }

        const total = Math.round(baseSubtotal + seasonalAdjustment + (nights > 0 ? serviceFee : 0));
        return {
            nights,
            baseSubtotal: Math.round(baseSubtotal),
            seasonalAdjustment: Math.round(seasonalAdjustment),
            total,
        };
    }, [formData.arrival, formData.departure, selectedRoomData, seasonalRates]);

    const occupantLabel = `${formData.adults} ${formData.adults === 1 ? 'Adult' : 'Adults'}${formData.children > 0 ? `, ${formData.children} ${formData.children === 1 ? 'Child' : 'Children'}` : ''}`;

    function updateFormData(event) {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    }

    function selectDate(value) {
        if (value < todayStr || disabledDates.includes(value)) {
            return;
        }

        if (!formData.arrival || (formData.arrival && formData.departure) || value <= formData.arrival) {
            setFormData((current) => ({ ...current, arrival: value, departure: '' }));
            setBookingFeedback(null);
            return;
        }

        // Ensure no disabled date lies between arrival and departure
        const hasBlockedNightInRange = disabledDates.some((blocked) => blocked >= formData.arrival && blocked < value);
        if (hasBlockedNightInRange) {
            setBookingFeedback({
                type: 'error',
                message: 'Your selected date range spans across already reserved dates. Please select an uninterrupted date range.',
            });
            setFormData((current) => ({ ...current, arrival: value, departure: '' }));
            return;
        }

        setBookingFeedback(null);
        setFormData((current) => ({ ...current, departure: value }));
    }

    function updateOccupantCount(name, update) {
        setFormData((current) => ({ ...current, [name]: update(current[name]) }));
    }

    async function handleConfirmReservation(event) {
        event.preventDefault();
        setBookingFeedback(null);

        if (
            !formData.arrival
            || !formData.departure
            || formData.departure <= formData.arrival
            || !selectedRoomData?.id
            || !formData.name.trim()
            || !formData.email.trim()
        ) {
            setBookingFeedback({
                type: 'error',
                message: 'Please complete all required fields (Dates, Room, Full Name, and Email Address) before confirming.',
            });
            return;
        }

        if (roomStatus === 'MAINTENANCE') {
            setBookingFeedback({
                type: 'error',
                message: `${selectedRoomData.name} is currently undergoing scheduled maintenance. Please select another cottage.`,
            });
            return;
        }

        setSubmitting(true);

        try {
            const response = await window.axios.post('/api/bookings', {
                room_id: selectedRoomData.id,
                check_in: formData.arrival,
                check_out: formData.departure,
                adults: formData.adults,
                children: formData.children,
                guest_name: formData.name.trim(),
                guest_email: formData.email.trim(),
                guest_phone: formData.whatsapp.trim() || null,
                notes: formData.notes.trim() || null,
            });

            const { booking, snap_token: snapToken } = response.data;
            await fetchBookedDates(selectedRoomData.id);

            if (window.snap && snapToken && !String(snapToken).startsWith('MOCK-SNAP-')) {
                window.snap.pay(snapToken, {
                    onSuccess: () => {
                        setBookingFeedback({
                            type: 'success',
                            message: `Reservation ${booking.booking_code} confirmed & paid! We look forward to welcoming you to Dieng.`,
                        });
                    },
                    onPending: () => {
                        setBookingFeedback({
                            type: 'success',
                            message: `Reservation ${booking.booking_code} created! Please complete your payment via the instructions provided.`,
                        });
                    },
                    onError: () => {
                        setBookingFeedback({
                            type: 'error',
                            message: `Payment failed for reservation ${booking.booking_code}. Please contact our desk.`,
                        });
                    },
                    onClose: () => {
                        setBookingFeedback({
                            type: 'success',
                            message: `Reservation ${booking.booking_code} is held pending payment completion.`,
                        });
                    },
                });
            } else {
                setBookingFeedback({
                    type: 'success',
                    message: `Reservation ${booking.booking_code} recorded successfully! Total Sanctuary Fee: ${money(booking.total_price)}.`,
                });
            }
        } catch (error) {
            const validationErrors = error.response?.data?.errors;
            const firstError = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : error.response?.data?.message;

            setBookingFeedback({
                type: 'error',
                message: firstError || 'Unable to process reservation. Please verify your dates and try again.',
            });
        } finally {
            setSubmitting(false);
        }
    }

    const currentMonthName = new Date(`${formData.arrival || todayStr}T12:00:00`).toLocaleDateString('en-US', { month: 'long' });

    return (
        <>
            <Head title="Reserve Your Stay — The Boe Cottage" />
            <div className="min-h-screen bg-[#FBF9F4] text-[#1E322A]">
                <ReservationHeader />

                <section className="relative flex min-h-[144px] items-center justify-center overflow-hidden bg-[#1E322A] px-5 py-8 text-center">
                    <img
                        src="/images/cottage/daisy/daisy-bedroom.jpeg"
                        alt="A peaceful bedroom at The Boe Cottage"
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-[#071711]/65" />
                    <div className="relative z-10">
                        <h1 className="font-serif text-3xl font-normal leading-tight text-white sm:text-4xl lg:text-5xl">
                            Reserve your quiet <em className="text-[#D9B995]">above the clouds</em>
                        </h1>
                        <p className="mt-2 font-sans text-xs text-white/85 sm:text-sm">Three steps to your stay in Dieng.</p>
                    </div>
                </section>

                <main className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,1.55fr)_minmax(250px,1fr)] md:gap-7">
                    <div className="space-y-6">
                        {bookingFeedback && (
                            <div
                                role="alert"
                                className={`border px-4 py-3 font-sans text-xs leading-relaxed ${
                                    bookingFeedback.type === 'success'
                                        ? 'border-[#346B55] bg-[#DCE9DF] text-[#1E322A]'
                                        : 'border-[#AE5535] bg-[#FADBD1] text-[#743E2D]'
                                }`}
                            >
                                {bookingFeedback.message}
                            </div>
                        )}

                        <section className="border border-[#DEDAD1] bg-[#FBF9F4] p-4 sm:p-5">
                            <StepHeading number="01">Dates &amp; Guests</StepHeading>

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1.3fr)_minmax(150px,0.7fr)] sm:items-center sm:gap-7">
                                <Calendar
                                    month={month}
                                    arrival={formData.arrival}
                                    departure={formData.departure}
                                    todayStr={todayStr}
                                    disabledDates={disabledDates}
                                    onMonthChange={setMonth}
                                    onSelectDate={selectDate}
                                />
                                <div className="space-y-5 border-t border-[#E6E2DA] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                                    <Counter
                                        label="Adults"
                                        note="Age 13+"
                                        value={formData.adults}
                                        onDecrease={() => updateOccupantCount('adults', (current) => Math.max(1, current - 1))}
                                        onIncrease={() => updateOccupantCount('adults', (current) => Math.min(12, current + 1))}
                                    />
                                    <Counter
                                        label="Children"
                                        note="Ages 2 to 12"
                                        value={formData.children}
                                        onDecrease={() => updateOccupantCount('children', (current) => Math.max(0, current - 1))}
                                        onIncrease={() => updateOccupantCount('children', (current) => Math.min(10, current + 1))}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="border border-[#DEDAD1] bg-[#FBF9F4] p-4 sm:p-5">
                            <StepHeading number="02">Choose Your Room</StepHeading>

                            <div className="space-y-2">
                                {roomOptions.map((room) => {
                                    const selected = Number(formData.roomId) === Number(room.id);
                                    const isMaintenance = room.status === 'MAINTENANCE';
                                    return (
                                        <label key={room.id} className={`flex cursor-pointer gap-3 border p-3 transition-colors sm:gap-4 ${selected ? 'border-[#346B55] bg-[#F6F3EE]' : 'border-[#E4E0D8] bg-transparent hover:bg-[#F6F3EE]'} ${isMaintenance ? 'opacity-60' : ''}`}>
                                            <input
                                                type="radio"
                                                name="roomId"
                                                value={room.id}
                                                checked={selected}
                                                onChange={() => {
                                                    setBookingFeedback(null);
                                                    setFormData((current) => ({ ...current, roomId: room.id }));
                                                }}
                                                className="sr-only"
                                            />
                                            <img src={room.image} alt="" className="h-20 w-24 shrink-0 object-cover sm:h-24 sm:w-28" loading="lazy" />
                                            <span className="flex min-w-0 flex-1 flex-col justify-between">
                                                <span className="flex items-start justify-between gap-2">
                                                    <span className="min-w-0">
                                                        <span className="flex items-center gap-2 font-serif text-base leading-tight text-[#1E322A] sm:text-lg">
                                                            {room.name}
                                                            {isMaintenance && (
                                                                <span className="bg-[#FADBD1] px-1.5 py-0.5 font-sans text-[8px] font-bold uppercase text-[#743E2D]">Maintenance</span>
                                                            )}
                                                        </span>
                                                        <span className="mt-1 block font-sans text-[9px] leading-relaxed text-[#666A64] sm:text-[10px]">{room.description}</span>
                                                    </span>
                                                    <span aria-hidden="true" className={`mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center border ${selected ? 'border-[#346B55]' : 'border-[#85877F]'}`}>
                                                        {selected && <span className="h-1.5 w-1.5 bg-[#346B55]" />}
                                                    </span>
                                                </span>
                                                <span className="mt-2 self-end font-sans text-[11px] font-medium text-[#1E322A]">
                                                    {money(room.price)} <span className="text-[9px] font-normal text-[#777B75]">/ night</span>
                                                </span>
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="border border-[#DEDAD1] bg-[#FBF9F4] p-4 sm:p-5">
                            <StepHeading number="03">Your Details</StepHeading>

                            <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">Full Name *</span>
                                    <input required name="name" value={formData.name} onChange={updateFormData} autoComplete="name" placeholder="Your full name" className="h-8 w-full border-b border-[#C9C5BC] bg-transparent font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]" />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">Email Address *</span>
                                    <input required name="email" type="email" value={formData.email} onChange={updateFormData} autoComplete="email" placeholder="you@example.com" className="h-8 w-full border-b border-[#C9C5BC] bg-transparent font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]" />
                                </label>
                                <label className="block sm:col-span-2">
                                    <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">WhatsApp Number</span>
                                    <input name="whatsapp" type="tel" value={formData.whatsapp} onChange={updateFormData} autoComplete="tel" placeholder="+62 812 3456 7890" className="h-8 w-full border-b border-[#C9C5BC] bg-transparent font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]" />
                                </label>
                                <label className="block sm:col-span-2">
                                    <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">Special Requests / Notes</span>
                                    <textarea name="notes" value={formData.notes} onChange={updateFormData} rows="2" placeholder="Let us know how we can make your stay special..." className="w-full resize-y border-b border-[#C9C5BC] bg-transparent py-1 font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]" />
                                </label>
                            </div>
                        </section>
                    </div>

                    <aside className="border border-[#DEDAD1] bg-[#F6F3EE] p-4 sm:p-5 md:sticky md:top-6">
                        <p className="font-sans text-[8px] font-bold tracking-[0.12em] text-[#346B55]">RESIDENCY SUMMARY</p>
                        <h2 className="mt-1 font-serif text-xl text-[#1E322A]">{currentMonthName} Folio</h2>
                        <div className="mt-3 space-y-3 border-y border-[#DCD8CF] py-3 font-sans">
                            <SummaryRow label="Selected Dates" value={formatDates(formData.arrival, formData.departure)} />
                            <SummaryRow label="Duration" value={`${pricing.nights} ${pricing.nights === 1 ? 'Night' : 'Nights'}`} />
                            <SummaryRow label="Selected Room" value={selectedRoomData.name} />
                            <SummaryRow label="Registered Occupants" value={occupantLabel} />
                        </div>

                        <div className="space-y-2 py-3 font-sans text-[9px] text-[#777B75]">
                            <SummaryRow label={`Room (${money(selectedRoomData.price)} × ${pricing.nights})`} value={money(pricing.baseSubtotal)} />
                            {pricing.seasonalAdjustment !== 0 && (
                                <SummaryRow label="Seasonal rate adjustment" value={money(pricing.seasonalAdjustment)} />
                            )}
                            <SummaryRow label="Taxes & hearth service" value={money(pricing.nights > 0 ? serviceFee : 0)} />
                        </div>

                        <div className="flex items-end justify-between gap-3 border-t border-[#DCD8CF] pt-3">
                            <p className="font-sans text-[8px] font-semibold tracking-[0.12em] text-[#666A64]">TOTAL SANCTUARY FEE</p>
                            <p aria-live="polite" className="font-serif text-xl font-semibold leading-none text-[#1E322A] sm:text-2xl">{money(pricing.total)}</p>
                        </div>

                        <div className="mt-4 border border-[#AE8A66]/50 bg-[#D9B995] px-2.5 py-2 font-sans text-[8px] font-medium uppercase tracking-[0.04em] text-[#4C3927]">
                            Free cancellation up to 7 days before
                        </div>

                        <form className="mt-3 space-y-2" onSubmit={handleConfirmReservation}>
                            <button
                                type="submit"
                                disabled={submitting || roomStatus === 'MAINTENANCE'}
                                className="flex min-h-10 w-full items-center justify-center bg-[#346B55] px-3 py-2 font-sans text-[9px] font-bold tracking-[0.1em] text-white transition-colors hover:bg-[#1E322A] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                            >
                                {submitting ? 'PROCESSING...' : 'CONFIRM RESERVATION'}
                            </button>
                            <a
                                href={`https://wa.me/6288887879999?text=${encodeURIComponent(`Hello, I would like to ask about a ${selectedRoomData.name} stay for ${formatDates(formData.arrival, formData.departure)}.`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-9 w-full items-center justify-center border border-[#346B55] px-3 py-2 font-sans text-[8px] font-semibold tracking-[0.08em] text-[#346B55] transition-colors hover:bg-[#E6EBE6]"
                            >
                                ASK VIA WHATSAPP
                            </a>
                        </form>
                    </aside>
                </main>

                <footer className="mt-8 flex items-center justify-between gap-4 bg-[#292A27] px-6 py-4 text-[#F1ECE0] sm:px-10">
                    <Link href="/" className="font-serif text-sm">The Boe Cottage <span className="font-sans text-[7px] tracking-[0.15em] text-white/50">DIENG</span></Link>
                    <a href="mailto:theboecottage@gmail.com" className="font-sans text-[9px] text-white/70 hover:text-white">Contact us</a>
                </footer>
            </div>
        </>
    );
}

function SummaryRow({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-3">
            <span className="shrink-0 text-[7px] font-medium uppercase tracking-[0.06em] text-[#777B75]">{label}</span>
            <span className="text-right text-[10px] leading-relaxed text-[#303832]">{value}</span>
        </div>
    );
}
