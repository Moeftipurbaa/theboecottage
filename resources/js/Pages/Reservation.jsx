import { Head, Link, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import AiChatWidget from '../Components/AiChatWidget';
import OtaBookingSection from '../Components/OtaBookingSection';
import { LanguageSwitch, SocialMediaLinks, useLanguage } from '../Contexts/LanguageContext';

const BCA_ACCOUNT_DISPLAY = '8277 0812 3456 7890';
const BCA_ACCOUNT_RAW = '8277081234567890';

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

const serviceFee = 370_000;

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

function formatDates(arrival, departure, t, lang) {
    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const cleanArrival = arrival ? String(arrival).slice(0, 10) : '';
    const cleanDeparture = departure ? String(departure).slice(0, 10) : '';
    if (!cleanArrival) return t('reservation.selectDates');
    const start = new Date(`${cleanArrival}T12:00:00`);
    const startLabel = start.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    if (!cleanDeparture) return `${startLabel}, ${start.getFullYear()} — ${t('reservation.selectDeparture')}`;
    const end = new Date(`${cleanDeparture}T12:00:00`);
    const endLabel = end.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    return `${startLabel} - ${endLabel}, ${end.getFullYear()}`;
}

function formatCountdown(secondsLeft) {
    const clamped = Math.max(0, Math.floor(secondsLeft));
    const minutes = String(Math.floor(clamped / 60)).padStart(2, '0');
    const seconds = String(clamped % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function StepHeading({ number, children }) {
    return (
        <div className="mb-4 flex items-center gap-2 border-b border-[#DCD8CF] pb-2">
            <span className="bg-[#346B55] px-1.5 py-0.5 font-sans text-[8px] font-bold text-white">{number}</span>
            <h2 className="font-serif text-lg text-[#1E322A]">{children}</h2>
        </div>
    );
}

function Counter({ label, note, value, onDecrease, onIncrease, decreaseLabel, increaseLabel }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <div>
                <p className="font-sans text-xs font-semibold text-[#1E322A]">{label}</p>
                <p className="mt-0.5 font-sans text-[9px] text-[#777B75]">{note}</p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onDecrease}
                    aria-label={`${decreaseLabel} ${label.toLowerCase()}`}
                    className="h-7 w-7 border border-[#D5D1C8] font-sans text-sm text-[#1E322A] hover:bg-[#F1ECE0]"
                >
                    −
                </button>
                <span aria-live="polite" className="w-4 text-center font-sans text-xs text-[#1E322A]">
                    {value}
                </span>
                <button
                    type="button"
                    onClick={onIncrease}
                    aria-label={`${increaseLabel} ${label.toLowerCase()}`}
                    className="h-7 w-7 border border-[#D5D1C8] font-sans text-sm text-[#1E322A] hover:bg-[#F1ECE0]"
                >
                    +
                </button>
            </div>
        </div>
    );
}

function Calendar({ month, arrival, departure, todayStr, disabledDates = [], onMonthChange, onSelectDate }) {
    const { t, lang } = useLanguage();
    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const monthLabel = month.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    const weekDays = t('reservation.weekDays');
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

    const nightsCount =
        arrival && departure
            ? Math.max(0, Math.round((new Date(`${departure}T12:00:00`) - new Date(`${arrival}T12:00:00`)) / 86400000))
            : 0;

    return (
        <div>
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-sans text-xs font-medium text-[#1E322A]">{monthLabel}</h3>
                <div className="flex gap-1">
                    <button
                        type="button"
                        aria-label={t('reservation.prevMonth')}
                        onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
                        className="flex h-7 w-7 items-center justify-center border border-[#D5D1C8] text-[#1E322A] hover:bg-[#F1ECE0]"
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        aria-label={t('reservation.nextMonth')}
                        onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
                        className="flex h-7 w-7 items-center justify-center border border-[#D5D1C8] text-[#1E322A] hover:bg-[#F1ECE0]"
                    >
                        ›
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center">
                {(Array.isArray(weekDays) ? weekDays : ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']).map((day) => (
                    <span key={day} className="py-1.5 font-sans text-[7px] font-semibold text-[#777B75]">
                        {day}
                    </span>
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
                            aria-label={date.toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })}
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
                <span className="inline-flex items-center gap-1.5">
                    <i className="h-2 w-2 bg-[#346B55]" /> {t('reservation.legendSelected')} ({nightsCount}{' '}
                    {nightsCount === 1 ? t('reservation.night') : t('reservation.nights')})
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#AE8A66]" /> {t('reservation.today')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <i className="h-2 w-2 border border-[#B5B4AE] bg-[#EFECE5]" /> {t('reservation.reserved')}
                </span>
            </div>
        </div>
    );
}

function ReservationHeader() {
    const { t } = useLanguage();
    return (
        <header className="print:hidden flex h-14 items-center justify-between border-b border-[#AE8A66]/15 bg-[#F1ECE0] px-5 sm:px-10">
            <Link href="/" aria-label="The Boe Cottage home" className="flex flex-col items-center text-[#AE8A66] no-underline">
                <span className="font-serif text-[6px] italic leading-[7px]">The</span>
                <span className="font-serif text-[10px] leading-[10px] tracking-[0.08em]">BOE</span>
                <span className="font-serif text-[12px] leading-[12px] tracking-[0.03em]">COTTAGE</span>
                <span className="font-sans text-[5px] font-medium leading-[6px] tracking-[0.4em]">DIENG</span>
            </Link>

            <div className="flex items-center gap-3">
                <a
                    href="#ota-booking"
                    className="hidden font-sans text-[11px] font-semibold text-[#346B55] underline underline-offset-4 hover:text-[#1E322A] sm:inline"
                >
                    {t('reservation.otaLink')}
                </a>
                <LanguageSwitch />
            </div>
        </header>
    );
}

/**
 * E-Commerce Style Bank BCA Checkout Card with Live MM:SS Countdown Timer
 * & Automatic Digital Receipt (Struk Lunas The Boe Cottage).
 */
function CheckoutAndReceiptPanel({
    booking,
    snapToken,
    roomName,
    secondsLeft,
    simulating,
    onSimulatePay,
    onOpenMidtrans,
    onResetBooking,
    whatsappHref,
}) {
    const { t, lang, formatPrice } = useLanguage();
    const [copiedField, setCopiedField] = useState(null);

    const isPaid = booking.payment_status === 'paid' && booking.status === 'confirmed';
    const isExpired = !isPaid && (booking.status === 'cancelled' || booking.payment_status === 'expired' || secondsLeft <= 0);

    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const paidAtFormatted = booking.paid_at
        ? new Date(booking.paid_at).toLocaleString(locale, {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
          })
        : new Date().toLocaleString(locale);

    const stayDatesFormatted = formatDates(booking.check_in, booking.check_out, t, lang);
    const totalNumeric = Math.round(Number(booking.total_price) || 0);
    const steps = t('reservation.checkout.steps');

    const copyText = (field, text) => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(String(text));
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        }
    };

    const occupantText = `${booking.adults || 1} ${
        Number(booking.adults || 1) === 1 ? t('reservation.adult') : t('reservation.adultsLabel')
    }${
        Number(booking.children || 0) > 0
            ? `, ${booking.children} ${Number(booking.children) === 1 ? t('reservation.child') : t('reservation.childrenLabel')}`
            : ''
    }`;

    // 1. AUTOMATIC DIGITAL PAYMENT RECEIPT (STRUK LUNAS OTOMATIS)
    if (isPaid) {
        const receiptNo = booking.receipt_number || `INV-${booking.booking_code}`;
        return (
            <section
                id="digital-receipt"
                aria-live="polite"
                className="overflow-hidden rounded-2xl border-2 border-[#346B55] bg-white shadow-xl print:border print:shadow-none"
            >
                {/* Receipt Header Banner */}
                <div className="bg-[#1E322A] px-6 py-6 text-white sm:px-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full bg-[#346B55] px-3.5 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
                                <path d="m4 10.5 4 4L16 6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            {t('reservation.receipt.badge')}
                        </span>
                        <span className="font-mono text-xs text-[#D9B995]">{receiptNo}</span>
                    </div>

                    <h2 className="mt-3 font-serif text-2xl font-normal text-[#F1ECE0] sm:text-3xl">
                        {t('reservation.receipt.title')}
                    </h2>
                    <p className="mt-1 font-sans text-xs text-[#D2D9D2]">{t('reservation.receipt.subtitle')}</p>
                </div>

                {/* Official Receipt Body */}
                <div className="space-y-5 p-6 sm:p-8">
                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-[#E6E2DA] bg-[#FBF9F4] p-4 sm:grid-cols-3">
                        <div>
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777B75]">
                                {t('reservation.receipt.receiptNo')}
                            </p>
                            <p className="mt-0.5 font-mono text-xs font-bold text-[#1E322A]">{receiptNo}</p>
                        </div>
                        <div>
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777B75]">
                                {t('reservation.receipt.bookingCode')}
                            </p>
                            <p className="mt-0.5 font-mono text-xs font-bold text-[#346B55]">#{booking.booking_code}</p>
                        </div>
                        <div>
                            <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.08em] text-[#777B75]">
                                {t('reservation.receipt.paidAt')}
                            </p>
                            <p className="mt-0.5 font-sans text-xs font-semibold text-[#1E322A]">{paidAtFormatted}</p>
                        </div>
                    </div>

                    <dl className="divide-y divide-[#EFECE5] font-sans text-xs">
                        <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center">
                            <dt className="font-medium text-[#777B75]">{t('reservation.receipt.guestName')}</dt>
                            <dd className="font-semibold text-[#1E322A]">{booking.guest_name}</dd>
                        </div>
                        <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center">
                            <dt className="font-medium text-[#777B75]">{t('reservation.receipt.guestContact')}</dt>
                            <dd className="text-[#1E322A]">
                                {booking.guest_email}
                                {booking.guest_phone ? ` • ${booking.guest_phone}` : ''}
                            </dd>
                        </div>
                        <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center">
                            <dt className="font-medium text-[#777B75]">{t('reservation.receipt.roomAndDates')}</dt>
                            <dd className="font-semibold text-[#1E322A]">
                                {roomName} ({stayDatesFormatted})
                            </dd>
                        </div>
                        <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center">
                            <dt className="font-medium text-[#777B75]">{t('reservation.receipt.occupants')}</dt>
                            <dd className="text-[#1E322A]">{occupantText}</dd>
                        </div>
                        <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center">
                            <dt className="font-medium text-[#777B75]">{t('reservation.receipt.paymentMethod')}</dt>
                            <dd className="font-semibold text-[#1E322A]">
                                {booking.payment_type || t('reservation.receipt.paymentMethodVal')}
                            </dd>
                        </div>
                        <div className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center">
                            <dt className="font-medium text-[#777B75]">{t('reservation.receipt.paymentStatus')}</dt>
                            <dd>
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE9DF] px-3 py-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-[#1E322A]">
                                    ✓ {t('reservation.receipt.paidStatusBadge')}
                                </span>
                            </dd>
                        </div>
                    </dl>

                    <div className="flex items-center justify-between rounded-xl bg-[#F6F3EE] px-5 py-4">
                        <span className="font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#1E322A]">
                            {t('reservation.receipt.totalPaid')}
                        </span>
                        <span className="font-serif text-2xl font-bold text-[#346B55] sm:text-3xl">
                            {formatPrice(totalNumeric)}
                        </span>
                    </div>

                    <p className="text-center font-sans text-[11px] italic text-[#666A64]">
                        {t('reservation.receipt.footerNote')}
                    </p>

                    {/* Action Buttons (Hidden when printing PDF) */}
                    <div className="print:hidden flex flex-col gap-3 border-t border-[#E6E2DA] pt-4 sm:flex-row sm:flex-wrap">
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#1E322A] px-5 py-3 font-sans text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#346B55]"
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                                <path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                                <rect x="6" y="14" width="12" height="7" />
                            </svg>
                            {t('reservation.receipt.printBtn')}
                        </button>

                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-[#346B55] bg-[#DCE9DF]/60 px-5 py-3 text-center font-sans text-xs font-bold uppercase tracking-[0.06em] text-[#1E322A] transition-colors hover:bg-[#346B55] hover:text-white"
                        >
                            {t('reservation.receipt.whatsappRescheduleBtn')} ↗
                        </a>

                        <button
                            type="button"
                            onClick={onResetBooking}
                            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#DCD8CF] px-4 py-2 font-sans text-[11px] font-semibold text-[#555A54] hover:bg-[#F6F3EE]"
                        >
                            {t('reservation.receipt.newBookingBtn')}
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    // 2. EXPIRED PAYMENT STATE (TIMER HIT 00:00)
    if (isExpired) {
        return (
            <section
                role="alert"
                className="rounded-2xl border-2 border-[#AE5535] bg-[#FADBD1]/45 p-6 text-[#743E2D] shadow-md sm:p-8"
            >
                <span className="inline-flex items-center rounded-full bg-[#AE5535] px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                    {t('reservation.checkout.expiredBadge')}
                </span>
                <h2 className="mt-3 font-serif text-2xl font-normal text-[#1E322A] sm:text-3xl">
                    {t('reservation.checkout.expiredTitle')} (#{booking.booking_code})
                </h2>
                <p className="mt-2 font-sans text-xs leading-relaxed text-[#555A54] sm:text-sm">
                    {t('reservation.checkout.expiredDesc')}
                </p>
                <button
                    type="button"
                    onClick={onResetBooking}
                    className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#1E322A] px-6 py-3 font-sans text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#346B55]"
                >
                    {t('reservation.checkout.bookAgain')}
                </button>
            </section>
        );
    }

    // 3. E-COMMERCE BANK BCA CHECKOUT CARD WITH LIVE MM:SS COUNTDOWN TIMER
    const urgentTimer = secondsLeft <= 300;

    return (
        <section
            id="bca-checkout-card"
            aria-live="polite"
            className="overflow-hidden rounded-2xl border-2 border-[#1E322A] bg-white shadow-xl"
        >
            {/* Top Bar with Booking Code & Live Countdown Timer */}
            <div className="flex flex-col justify-between gap-4 bg-[#1E322A] px-6 py-5 text-white sm:flex-row sm:items-center sm:px-7">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#AE8A66] px-3 py-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-white">
                            <span className="h-2 w-2 animate-ping rounded-full bg-white" />
                            {t('reservation.checkout.badge')}
                        </span>
                        <span className="font-mono text-xs text-[#D9B995]">#{booking.booking_code}</span>
                    </div>
                    <h2 className="mt-2 font-serif text-2xl font-normal text-[#F1ECE0] sm:text-3xl">
                        {t('reservation.checkout.title')}
                    </h2>
                    <p className="mt-1 max-w-xl font-sans text-xs text-[#D2D9D2]">
                        {t('reservation.checkout.subtitle')}
                    </p>
                </div>

                {/* Prominent Shopee/Tokopedia-style Countdown Box */}
                <div
                    className={`flex shrink-0 flex-col items-center justify-center rounded-xl border px-4 py-3 text-center ${
                        urgentTimer
                            ? 'border-red-400 bg-red-950/60 text-red-200'
                            : 'border-white/20 bg-white/10 text-white'
                    }`}
                >
                    <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-white/80">
                        {t('reservation.checkout.timerLabel')}
                    </span>
                    <span className="mt-1 font-mono text-2xl font-bold tracking-wider text-[#D9B995] sm:text-3xl">
                        {formatCountdown(secondsLeft)}
                    </span>
                </div>
            </div>

            <div className="space-y-6 p-6 sm:p-7">
                {/* Timer Warning Banner */}
                <div className="flex items-center gap-2.5 rounded-xl border border-[#AE8A66]/45 bg-[#F6F3EE] px-4 py-2.5 font-sans text-xs text-[#4C3927]">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4 shrink-0 text-[#AE8A66]">
                        <circle cx="10" cy="10" r="7.5" />
                        <path d="M10 6v4.5l3 1.5" strokeLinecap="round" />
                    </svg>
                    <span>{t('reservation.checkout.timerWarning')}</span>
                </div>

                {/* Bank BCA Virtual Account / Transfer Details Card */}
                <div className="rounded-2xl border border-[#005BAA]/25 bg-[#F8FAFC] p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 items-center justify-center rounded-lg bg-[#005BAA] px-3.5 font-sans text-sm font-extrabold tracking-wider text-white">
                                BCA
                            </span>
                            <div>
                                <h3 className="font-sans text-sm font-bold text-[#1E322A]">
                                    {t('reservation.checkout.bankHeader')}
                                </h3>
                                <p className="font-sans text-[11px] text-[#555A54]">{t('reservation.checkout.bankSub')}</p>
                            </div>
                        </div>
                        <span className="font-sans text-xs font-semibold text-[#346B55]">
                            {roomName} • {stayDatesFormatted}
                        </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {/* BCA Account / VA Number */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
                            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-[#666A64]">
                                {t('reservation.checkout.accountLabel')}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                                <span className="font-mono text-sm font-bold tracking-wider text-[#005BAA] sm:text-lg">
                                    {BCA_ACCOUNT_DISPLAY}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copyText('account', BCA_ACCOUNT_RAW)}
                                    className="shrink-0 rounded-lg bg-[#005BAA] px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#004480]"
                                >
                                    {copiedField === 'account'
                                        ? t('reservation.checkout.copied')
                                        : t('reservation.checkout.copyAccount')}
                                </button>
                            </div>
                            <p className="mt-2 font-sans text-[11px] text-[#555A54]">
                                {t('reservation.checkout.accountNameLabel')}:{' '}
                                <strong className="text-[#1E322A]">{t('reservation.checkout.accountName')}</strong>
                            </p>
                        </div>

                        {/* Exact Transfer Amount */}
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:p-4">
                            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-[#666A64]">
                                {t('reservation.checkout.amountLabel')}
                            </p>
                            <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2">
                                <span className="font-serif text-lg font-bold text-[#1E322A] sm:text-2xl">
                                    {formatPrice(totalNumeric)}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => copyText('amount', totalNumeric)}
                                    className="shrink-0 rounded-lg bg-[#1E322A] px-3 py-1.5 font-sans text-[10px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#346B55]"
                                >
                                    {copiedField === 'amount'
                                        ? t('reservation.checkout.copied')
                                        : t('reservation.checkout.copyAmount')}
                                </button>
                            </div>
                            <p className="mt-2 font-sans text-[11px] text-[#555A54]">
                                {booking.guest_name} ({booking.guest_email})
                            </p>
                        </div>
                    </div>

                    {/* Step-by-step BCA instructions */}
                    {Array.isArray(steps) && steps.length > 0 && (
                        <div className="mt-4 rounded-xl bg-white/80 p-3.5 font-sans text-xs text-[#454943]">
                            <p className="mb-1.5 font-bold text-[#1E322A]">{t('reservation.checkout.stepsTitle')}</p>
                            <ol className="list-decimal space-y-1 pl-4 text-[11px] leading-relaxed">
                                {steps.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>

                {/* Auto-Verification Polling Indicator + Localhost Instant BCA Simulation Button */}
                <div className="flex flex-col gap-3 border-t border-[#E6E2DA] pt-4">
                    <div className="flex items-center justify-center gap-2 font-sans text-[11px] text-[#555A54]">
                        <span className="h-2 w-2 animate-ping rounded-full bg-[#346B55]" />
                        <span>{t('reservation.checkout.pollingStatus')}</span>
                    </div>

                    <button
                        type="button"
                        onClick={onSimulatePay}
                        disabled={simulating}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#346B55] px-5 py-3 font-sans text-xs font-bold uppercase tracking-[0.08em] text-white shadow-md transition-all hover:bg-[#1E322A] disabled:opacity-60"
                    >
                        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                            <path d="m4 10.5 4 4L16 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {simulating ? t('reservation.checkout.simulating') : t('reservation.checkout.simulateBtn')}
                    </button>

                    {snapToken && !String(snapToken).startsWith('MOCK-SNAP-') && (
                        <button
                            type="button"
                            onClick={onOpenMidtrans}
                            className="flex min-h-10 w-full items-center justify-center rounded-xl border border-[#1E322A] bg-white px-4 py-2.5 font-sans text-xs font-bold uppercase tracking-[0.08em] text-[#1E322A] transition-colors hover:bg-[#F6F3EE]"
                        >
                            {t('reservation.checkout.midtransBtn')}
                        </button>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-sans text-[11px] font-semibold text-[#346B55] underline underline-offset-4 hover:text-[#1E322A]"
                        >
                            {t('reservation.askWhatsapp')} ↗
                        </a>
                        <button
                            type="button"
                            onClick={onResetBooking}
                            className="font-sans text-[11px] text-[#777B75] underline underline-offset-4 hover:text-[#1E322A]"
                        >
                            {t('reservation.checkout.backToForm')}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Reservation({ rooms: backendRooms = [], seasonalRates = [] }) {
    const { midtrans, site } = usePage().props;
    const { t, lang, formatPrice } = useLanguage();

    const roomOptions = useMemo(() => {
        if (backendRooms.length > 0) {
            return backendRooms.map((r, idx) => ({
                id: r.id,
                name: r.name,
                description:
                    r.name.toLowerCase().includes('daisy')
                        ? t('rooms.descDaisy')
                        : r.name.toLowerCase().includes('lily')
                          ? t('rooms.descLily')
                          : r.description || fallbackRoomOptions[idx]?.description || '',
                price: Number(r.price_per_night) || 3_000_000,
                status: r.status || 'AVAILABLE',
                image:
                    r.images?.find((img) => img.is_primary)?.image_path ||
                    r.images?.[0]?.image_path ||
                    fallbackRoomOptions[idx]?.image ||
                    '/images/cottage/daisy/daisy-bedroom.jpeg',
            }));
        }
        return fallbackRoomOptions.map((r) => ({ ...r, price: r.price_per_night }));
    }, [backendRooms, t]);

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
    const safeCheckOut =
        toDateString(requestedCheckOut) <= toDateString(safeCheckIn)
            ? new Date(safeCheckIn.getFullYear(), safeCheckIn.getMonth(), safeCheckIn.getDate() + 2)
            : requestedCheckOut;

    const requestedRoomName = query.get('room');
    const initialRoom =
        roomOptions.find((r) => r.name.toLowerCase() === String(requestedRoomName || '').toLowerCase()) || roomOptions[0];

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

    // Phase 5B Checkout & Receipt State
    const [activeBooking, setActiveBooking] = useState(null);
    const [activeSnapToken, setActiveSnapToken] = useState(null);
    const [secondsLeft, setSecondsLeft] = useState(1800);
    const [simulating, setSimulating] = useState(false);

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
    const fetchBookedDates = useCallback(async (roomId) => {
        if (!roomId) return;
        try {
            const response = await window.axios.get(`/api/rooms/${roomId}/booked-dates`);
            setDisabledDates(response.data?.disabled_dates || []);
            setRoomStatus(response.data?.room_status || 'AVAILABLE');
        } catch (error) {
            console.error('Failed to fetch booked dates:', error);
        }
    }, []);

    useEffect(() => {
        fetchBookedDates(selectedRoomData?.id);
    }, [selectedRoomData?.id, fetchBookedDates]);

    // Live 1-second Countdown Timer to payment_expires_at
    useEffect(() => {
        if (!activeBooking) return undefined;
        if (activeBooking.payment_status === 'paid' && activeBooking.status === 'confirmed') {
            return undefined;
        }

        const expiresAtMs = activeBooking.payment_expires_at
            ? new Date(activeBooking.payment_expires_at).getTime()
            : Date.now() + 30 * 60 * 1000;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.round((expiresAtMs - Date.now()) / 1000));
            setSecondsLeft(remaining);
            if (remaining === 0 && activeBooking.status === 'pending') {
                // Trigger status endpoint once so server immediately marks it expired & releases room dates
                window.axios
                    .get(`/api/bookings/${activeBooking.booking_code}/status`)
                    .then((res) => {
                        if (res.data?.booking) {
                            setActiveBooking(res.data.booking);
                        }
                        fetchBookedDates(selectedRoomData?.id);
                    })
                    .catch(() => {});
            }
        };

        updateTimer();
        const intervalId = window.setInterval(updateTimer, 1000);
        return () => window.clearInterval(intervalId);
    }, [activeBooking, fetchBookedDates, selectedRoomData?.id]);

    // Real-time 4-second Background Polling for Payment Status Verification
    useEffect(() => {
        if (!activeBooking) return undefined;
        const isPaid = activeBooking.payment_status === 'paid' && activeBooking.status === 'confirmed';
        const isExpired = activeBooking.status === 'cancelled' || activeBooking.payment_status === 'expired';
        if (isPaid || isExpired) return undefined;

        const pollId = window.setInterval(async () => {
            try {
                const res = await window.axios.get(`/api/bookings/${activeBooking.booking_code}/status`);
                if (res.data?.booking) {
                    setActiveBooking(res.data.booking);
                    if (res.data.is_paid || res.data.is_expired) {
                        fetchBookedDates(selectedRoomData?.id);
                    }
                }
            } catch {
                // Ignore transient network errors during polling
            }
        }, 4000);

        return () => window.clearInterval(pollId);
    }, [activeBooking, fetchBookedDates, selectedRoomData?.id]);

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

    const occupantLabel = `${formData.adults} ${
        formData.adults === 1 ? t('reservation.adult') : t('reservation.adultsLabel')
    }${
        formData.children > 0
            ? `, ${formData.children} ${formData.children === 1 ? t('reservation.child') : t('reservation.childrenLabel')}`
            : ''
    }`;

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

        const hasBlockedNightInRange = disabledDates.some((blocked) => blocked >= formData.arrival && blocked < value);
        if (hasBlockedNightInRange) {
            setBookingFeedback({
                type: 'error',
                message: t('reservation.errors.spansReserved'),
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

    function openMidtransSnap(snapToken, booking) {
        if (!window.snap || !snapToken || String(snapToken).startsWith('MOCK-SNAP-')) return;
        window.snap.pay(snapToken, {
            onSuccess: async () => {
                try {
                    const res = await window.axios.post(`/api/bookings/${booking.booking_code}/simulate-pay`);
                    if (res.data?.booking) setActiveBooking(res.data.booking);
                } catch {
                    // Fallback if webhook already processed
                }
            },
            onPending: () => {},
            onError: () => {
                setBookingFeedback({
                    type: 'error',
                    message: t('reservation.errors.paymentFailed', { code: booking.booking_code }),
                });
            },
            onClose: () => {},
        });
    }

    async function handleSimulateBcaPay() {
        if (!activeBooking) return;
        setSimulating(true);
        setBookingFeedback(null);
        try {
            const response = await window.axios.post(`/api/bookings/${activeBooking.booking_code}/simulate-pay`);
            if (response.data?.booking) {
                setActiveBooking(response.data.booking);
            }
            await fetchBookedDates(selectedRoomData.id);
        } catch (error) {
            setBookingFeedback({
                type: 'error',
                message: error.response?.data?.message || t('reservation.errors.generic'),
            });
        } finally {
            setSimulating(false);
        }
    }

    async function handleConfirmReservation(event) {
        event.preventDefault();
        setBookingFeedback(null);

        if (
            !formData.arrival ||
            !formData.departure ||
            formData.departure <= formData.arrival ||
            !selectedRoomData?.id ||
            !formData.name.trim() ||
            !formData.email.trim()
        ) {
            setBookingFeedback({
                type: 'error',
                message: t('reservation.errors.required'),
            });
            return;
        }

        if (roomStatus === 'MAINTENANCE') {
            setBookingFeedback({
                type: 'error',
                message: t('reservation.errors.maintenance', { room: selectedRoomData.name }),
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
                payment_method: 'bca_transfer',
            });

            const { booking, snap_token: snapToken } = response.data;
            setActiveBooking(booking);
            setActiveSnapToken(snapToken);
            await fetchBookedDates(selectedRoomData.id);

            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 120, behavior: 'smooth' });
            }
        } catch (error) {
            const validationErrors = error.response?.data?.errors;
            const firstError = validationErrors
                ? Object.values(validationErrors).flat()[0]
                : error.response?.data?.message;

            setBookingFeedback({
                type: 'error',
                message: firstError || t('reservation.errors.generic'),
            });
        } finally {
            setSubmitting(false);
        }
    }

    const locale = lang === 'id' ? 'id-ID' : 'en-US';
    const currentMonthName = new Date(`${formData.arrival || todayStr}T12:00:00`).toLocaleDateString(locale, {
        month: 'long',
    });

    const formattedSelectedDates = formatDates(
        activeBooking?.check_in || formData.arrival,
        activeBooking?.check_out || formData.departure,
        t,
        lang
    );

    const whatsappGuestName = activeBooking?.guest_name || formData.name.trim() || (lang === 'id' ? 'Tamu' : 'Guest');
    const whatsappCode = activeBooking?.booking_code ? `#${activeBooking.booking_code}` : (lang === 'id' ? 'Baru' : 'New');
    const whatsappReceipt = activeBooking?.receipt_number ? `, No. Struk: ${activeBooking.receipt_number}` : '';
    const whatsappHref = `https://wa.me/6288887879999?text=${encodeURIComponent(
        t('reservation.whatsappMessage', {
            name: whatsappGuestName,
            room: selectedRoomData.name,
            code: whatsappCode,
            receipt: whatsappReceipt,
            dates: formattedSelectedDates,
        })
    )}`;

    return (
        <>
            <Head title={t('reservation.pageTitle')} />
            <div className="min-h-screen bg-[#FBF9F4] text-[#1E322A]">
                <ReservationHeader />

                <section className="print:hidden relative flex min-h-[144px] items-center justify-center overflow-hidden bg-[#1E322A] px-5 py-8 text-center">
                    <img
                        src="/images/cottage/daisy/daisy-bedroom.jpeg"
                        alt={t('reservation.heroImageAlt')}
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-[#071711]/65" />
                    <div className="relative z-10">
                        <h1 className="font-serif text-3xl font-normal leading-tight text-white sm:text-4xl lg:text-5xl">
                            {t('reservation.heroTitle')} <em className="text-[#D9B995]">{t('reservation.heroAccent')}</em>
                        </h1>
                        <p className="mt-2 font-sans text-xs text-white/85 sm:text-sm">{t('reservation.heroSubtitle')}</p>
                    </div>
                </section>

                <main className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 md:grid-cols-[minmax(0,1.55fr)_minmax(250px,1fr)] md:gap-7 print:block print:max-w-3xl">
                    <div className="space-y-6">
                        {bookingFeedback && (
                            <div
                                role="alert"
                                className={`print:hidden border px-4 py-3 font-sans text-xs leading-relaxed ${
                                    bookingFeedback.type === 'success'
                                        ? 'border-[#346B55] bg-[#DCE9DF] text-[#1E322A]'
                                        : 'border-[#AE5535] bg-[#FADBD1] text-[#743E2D]'
                                }`}
                            >
                                {bookingFeedback.message}
                            </div>
                        )}

                        {activeBooking ? (
                            <CheckoutAndReceiptPanel
                                booking={activeBooking}
                                snapToken={activeSnapToken}
                                roomName={activeBooking.room?.name || selectedRoomData.name}
                                secondsLeft={secondsLeft}
                                simulating={simulating}
                                onSimulatePay={handleSimulateBcaPay}
                                onOpenMidtrans={() => openMidtransSnap(activeSnapToken, activeBooking)}
                                onResetBooking={() => {
                                    setActiveBooking(null);
                                    setActiveSnapToken(null);
                                    setBookingFeedback(null);
                                    fetchBookedDates(selectedRoomData.id);
                                }}
                                whatsappHref={whatsappHref}
                            />
                        ) : (
                            <>
                                <section className="border border-[#DEDAD1] bg-[#FBF9F4] p-4 sm:p-5">
                                    <StepHeading number="01">{t('reservation.step1')}</StepHeading>

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
                                                label={t('reservation.adults')}
                                                note={t('reservation.adultsNote')}
                                                value={formData.adults}
                                                decreaseLabel={t('reservation.decrease')}
                                                increaseLabel={t('reservation.increase')}
                                                onDecrease={() =>
                                                    updateOccupantCount('adults', (current) => Math.max(1, current - 1))
                                                }
                                                onIncrease={() =>
                                                    updateOccupantCount('adults', (current) => Math.min(12, current + 1))
                                                }
                                            />
                                            <Counter
                                                label={t('reservation.children')}
                                                note={t('reservation.childrenNote')}
                                                value={formData.children}
                                                decreaseLabel={t('reservation.decrease')}
                                                increaseLabel={t('reservation.increase')}
                                                onDecrease={() =>
                                                    updateOccupantCount('children', (current) => Math.max(0, current - 1))
                                                }
                                                onIncrease={() =>
                                                    updateOccupantCount('children', (current) => Math.min(10, current + 1))
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="border border-[#DEDAD1] bg-[#FBF9F4] p-4 sm:p-5">
                                    <StepHeading number="02">{t('reservation.step2')}</StepHeading>

                                    <div className="space-y-2">
                                        {roomOptions.map((room) => {
                                            const selected = Number(formData.roomId) === Number(room.id);
                                            const isMaintenance = room.status === 'MAINTENANCE';
                                            return (
                                                <label
                                                    key={room.id}
                                                    className={`flex cursor-pointer gap-3 border p-3 transition-colors sm:gap-4 ${
                                                        selected
                                                            ? 'border-[#346B55] bg-[#F6F3EE]'
                                                            : 'border-[#E4E0D8] bg-transparent hover:bg-[#F6F3EE]'
                                                    } ${isMaintenance ? 'opacity-60' : ''}`}
                                                >
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
                                                    <img
                                                        src={room.image}
                                                        alt=""
                                                        className="h-20 w-24 shrink-0 object-cover sm:h-24 sm:w-28"
                                                        loading="lazy"
                                                    />
                                                    <span className="flex min-w-0 flex-1 flex-col justify-between">
                                                        <span className="flex items-start justify-between gap-2">
                                                            <span className="min-w-0">
                                                                <span className="flex items-center gap-2 font-serif text-base leading-tight text-[#1E322A] sm:text-lg">
                                                                    {room.name}
                                                                    {isMaintenance && (
                                                                        <span className="bg-[#FADBD1] px-1.5 py-0.5 font-sans text-[8px] font-bold uppercase text-[#743E2D]">
                                                                            {t('reservation.maintenance')}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="mt-1 block font-sans text-[9px] leading-relaxed text-[#666A64] sm:text-[10px]">
                                                                    {room.description}
                                                                </span>
                                                            </span>
                                                            <span
                                                                aria-hidden="true"
                                                                className={`mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center border ${
                                                                    selected ? 'border-[#346B55]' : 'border-[#85877F]'
                                                                }`}
                                                            >
                                                                {selected && <span className="h-1.5 w-1.5 bg-[#346B55]" />}
                                                            </span>
                                                        </span>
                                                        <span className="mt-2 self-end font-sans text-[11px] font-medium text-[#1E322A]">
                                                            {formatPrice(room.price)}{' '}
                                                            <span className="text-[9px] font-normal text-[#777B75]">
                                                                / {t('common.perNight')}
                                                            </span>
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </section>

                                <section className="border border-[#DEDAD1] bg-[#FBF9F4] p-4 sm:p-5">
                                    <StepHeading number="03">{t('reservation.step3')}</StepHeading>

                                    <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
                                        <label className="block">
                                            <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">
                                                {t('reservation.fullName')}
                                            </span>
                                            <input
                                                required
                                                name="name"
                                                value={formData.name}
                                                onChange={updateFormData}
                                                autoComplete="name"
                                                placeholder={t('reservation.fullNamePlaceholder')}
                                                className="h-8 w-full border-b border-[#C9C5BC] bg-transparent font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">
                                                {t('reservation.email')}
                                            </span>
                                            <input
                                                required
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={updateFormData}
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                className="h-8 w-full border-b border-[#C9C5BC] bg-transparent font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]"
                                            />
                                        </label>
                                        <label className="block sm:col-span-2">
                                            <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">
                                                {t('reservation.whatsapp')}
                                            </span>
                                            <input
                                                name="whatsapp"
                                                type="tel"
                                                value={formData.whatsapp}
                                                onChange={updateFormData}
                                                autoComplete="tel"
                                                placeholder="+62 812 3456 7890"
                                                className="h-8 w-full border-b border-[#C9C5BC] bg-transparent font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]"
                                            />
                                        </label>
                                        <label className="block sm:col-span-2">
                                            <span className="mb-1 block font-sans text-[8px] font-semibold uppercase tracking-[0.1em] text-[#666A64]">
                                                {t('reservation.notes')}
                                            </span>
                                            <textarea
                                                name="notes"
                                                value={formData.notes}
                                                onChange={updateFormData}
                                                rows="2"
                                                placeholder={t('reservation.notesPlaceholder')}
                                                className="w-full resize-y border-b border-[#C9C5BC] bg-transparent py-1 font-sans text-[10px] text-[#1E322A] outline-none placeholder:text-[#85877F] focus:border-[#346B55]"
                                            />
                                        </label>
                                    </div>
                                </section>
                            </>
                        )}
                    </div>

                    <aside className="print:hidden border border-[#DEDAD1] bg-[#F6F3EE] p-4 sm:p-5 md:sticky md:top-6">
                        <p className="font-sans text-[8px] font-bold tracking-[0.12em] text-[#346B55]">
                            {t('reservation.summaryEyebrow')}
                        </p>
                        <h2 className="mt-1 font-serif text-xl text-[#1E322A]">
                            {currentMonthName} {t('reservation.folio')}
                        </h2>
                        <div className="mt-3 space-y-3 border-y border-[#DCD8CF] py-3 font-sans">
                            <SummaryRow label={t('reservation.selectedDates')} value={formattedSelectedDates} />
                            <SummaryRow
                                label={t('reservation.duration')}
                                value={`${pricing.nights} ${
                                    pricing.nights === 1 ? t('reservation.night') : t('reservation.nights')
                                }`}
                            />
                            <SummaryRow label={t('reservation.selectedRoom')} value={selectedRoomData.name} />
                            <SummaryRow label={t('reservation.occupants')} value={occupantLabel} />
                        </div>

                        <div className="space-y-2 py-3 font-sans text-[9px] text-[#777B75]">
                            <SummaryRow
                                label={`${t('reservation.roomLine')} (${formatPrice(selectedRoomData.price)} × ${pricing.nights})`}
                                value={formatPrice(pricing.baseSubtotal)}
                            />
                            {pricing.seasonalAdjustment !== 0 && (
                                <SummaryRow
                                    label={t('reservation.seasonal')}
                                    value={formatPrice(pricing.seasonalAdjustment)}
                                />
                            )}
                            <SummaryRow
                                label={t('reservation.serviceFee')}
                                value={formatPrice(pricing.nights > 0 ? serviceFee : 0)}
                            />
                        </div>

                        <div className="flex items-end justify-between gap-3 border-t border-[#DCD8CF] pt-3">
                            <p className="font-sans text-[8px] font-semibold tracking-[0.12em] text-[#666A64]">
                                {t('reservation.total')}
                            </p>
                            <p aria-live="polite" className="font-serif text-xl font-semibold leading-none text-[#1E322A] sm:text-2xl">
                                {formatPrice(pricing.total)}
                            </p>
                        </div>

                        <div className="mt-4 border border-[#AE8A66]/50 bg-[#D9B995] px-2.5 py-2 font-sans text-[8px] font-medium uppercase tracking-[0.04em] text-[#4C3927]">
                            {t('reservation.freeCancel')}
                        </div>

                        <form className="mt-3 space-y-2" onSubmit={handleConfirmReservation}>
                            {!activeBooking && (
                                <button
                                    type="submit"
                                    disabled={submitting || roomStatus === 'MAINTENANCE'}
                                    className="flex min-h-10 w-full items-center justify-center bg-[#346B55] px-3 py-2 font-sans text-[9px] font-bold tracking-[0.1em] text-white transition-colors hover:bg-[#1E322A] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                                >
                                    {submitting ? t('reservation.processing') : t('reservation.confirm')}
                                </button>
                            )}
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex min-h-9 w-full items-center justify-center border border-[#346B55] px-3 py-2 text-center font-sans text-[8px] font-semibold tracking-[0.08em] text-[#346B55] transition-colors hover:bg-[#E6EBE6]"
                            >
                                {t('reservation.askWhatsapp')}
                            </a>
                        </form>
                    </aside>
                </main>

                {/* OTA Platform Booking & Localhost iCal Sync Trigger Section */}
                <div className="print:hidden">
                    <OtaBookingSection rooms={backendRooms} compact />
                </div>

                <footer className="print:hidden mt-8 flex flex-wrap items-center justify-between gap-4 bg-[#292A27] px-6 py-4 text-[#F1ECE0] sm:px-10">
                    <Link href="/" className="font-serif text-sm">
                        The Boe Cottage <span className="font-sans text-[7px] tracking-[0.15em] text-white/50">DIENG</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <SocialMediaLinks
                            instagramUrl={site?.social?.instagram}
                            tiktokUrl={site?.social?.tiktok}
                            variant="dark"
                        />
                        <a href="mailto:theboecottage@gmail.com" className="font-sans text-[9px] text-white/70 hover:text-white">
                            {t('reservation.contactUs')}
                        </a>
                    </div>
                </footer>
            </div>
            <div className="print:hidden">
                <AiChatWidget />
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
