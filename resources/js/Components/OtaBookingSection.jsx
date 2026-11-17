import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useLanguage } from '../Contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';

function AirbnbIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 shrink-0">
            <path d="M12 2.25c-1.52 0-2.79.96-3.57 2.47C6.89 7.7 4.2 13.4 3.44 15.3c-.92 2.29.42 4.95 2.95 5.45 1.54.3 3.22-.34 4.48-1.63.4-.41.78-.86 1.13-1.33.35.47.73.92 1.13 1.33 1.26 1.29 2.94 1.93 4.48 1.63 2.53-.5 3.87-3.16 2.95-5.45-.76-1.9-3.45-7.6-4.99-10.58-.78-1.51-2.05-2.47-3.57-2.47Zm0 2.1c.71 0 1.37.49 1.88 1.47 1.43 2.77 4.08 8.37 4.8 10.17.56 1.39-.24 2.86-1.58 3.12-.91.18-2.01-.26-2.92-1.19-.36-.37-.7-.78-1.02-1.22a7.5 7.5 0 0 0 1.09-3.55c0-1.95-1.05-3.4-2.25-3.4s-2.25 1.45-2.25 3.4c0 1.24.4 2.5 1.09 3.55-.32.44-.66.85-1.02 1.22-.91.93-2.01 1.37-2.92 1.19-1.34-.26-2.14-1.73-1.58-3.12.72-1.8 3.37-7.4 4.8-10.17.51-.98 1.17-1.47 1.88-1.47Zm0 7.45c.31 0 .75.67.75 1.9 0 .7-.23 1.48-.75 2.17-.52-.69-.75-1.47-.75-2.17 0-1.23.44-1.9.75-1.9Z" />
        </svg>
    );
}

function TiketIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
            <rect x="2.5" y="5.5" width="19" height="13" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="8.5" cy="12" r="2.2" fill="#FACC15" />
            <path d="M13.5 9.5h4.5M13.5 12h4.5M13.5 14.5h3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
    );
}

export default function OtaBookingSection({ rooms = [], compact = false }) {
    const { site } = usePage().props;
    const { t, formatPrice } = useLanguage();

    const otaLinks = site?.ota || {};
    const showIcalPanel = site?.ical_test_panel !== false;

    const fallbackFeeds = (rooms.length > 0 ? rooms : [
        { name: 'Daisy Room', slug: 'daisy-room', export_url: typeof window !== 'undefined' ? `${window.location.origin}/ical/export/daisy-room.ics` : '/ical/export/daisy-room.ics' },
        { name: 'Lily Room', slug: 'lily-room', export_url: typeof window !== 'undefined' ? `${window.location.origin}/ical/export/lily-room.ics` : '/ical/export/lily-room.ics' },
    ]).map((r) => ({
        room: r.name || r.title,
        slug: r.slug || (String(r.name || r.title).toLowerCase().includes('daisy') ? 'daisy-room' : 'lily-room'),
        url: r.export_url || (typeof window !== 'undefined' ? `${window.location.origin}/ical/export/${r.slug || 'daisy-room'}.ics` : `/ical/export/${r.slug || 'daisy-room'}.ics`),
        upcoming_bookings: 0,
    }));

    const [syncState, setSyncState] = useState({
        loading: false,
        lastSyncedAt: null,
        activeLinks: 0,
        exportFeeds: fallbackFeeds,
        summary: null,
        error: null,
    });
    const [copiedSlug, setCopiedSlug] = useState(null);

    useEffect(() => {
        if (!showIcalPanel || typeof window === 'undefined' || !window.axios) return undefined;
        let cancelled = false;

        window.axios
            .get('/api/ical/status')
            .then((res) => {
                if (cancelled) return;
                const data = res.data || {};
                setSyncState((prev) => ({
                    ...prev,
                    lastSyncedAt: data.last_synced_at || data.synced_at || prev.lastSyncedAt,
                    activeLinks: data.active_links ?? prev.activeLinks,
                    exportFeeds: Array.isArray(data.export_feeds) && data.export_feeds.length > 0 ? data.export_feeds : prev.exportFeeds,
                }));
            })
            .catch(() => {
                // Keep fallback feeds if status check is unavailable
            });

        return () => {
            cancelled = true;
        };
    }, [showIcalPanel]);

    async function handleQuickSync() {
        setSyncState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await window.axios.post('/api/ical/quick-sync');
            const data = response.data || {};
            setSyncState((prev) => ({
                ...prev,
                loading: false,
                lastSyncedAt: data.last_synced_at || data.synced_at || new Date().toISOString(),
                activeLinks: data.active_links ?? prev.activeLinks,
                exportFeeds: Array.isArray(data.export_feeds) && data.export_feeds.length > 0 ? data.export_feeds : prev.exportFeeds,
                summary: data.summary || { imported: 0, updated: 0, cancelled: 0, errors: 0 },
            }));
        } catch (err) {
            setSyncState((prev) => ({
                ...prev,
                loading: false,
                error: err.response?.data?.message || t('ota.syncFailed'),
            }));
        }
    }

    function handleCopyFeed(slug, url) {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(url);
            setCopiedSlug(slug);
            setTimeout(() => setCopiedSlug(null), 2000);
        }
    }

    const cards = [
        {
            key: 'whole',
            title: t('ota.wholeTitle'),
            badge: t('ota.wholeBadge'),
            description: t('ota.wholeDesc'),
            price: 6300000,
            directHref: '/reservation?room=Daisy%20Room',
            airbnbUrl: otaLinks?.whole_cottage?.airbnb || 'https://www.airbnb.co.id/s/Dieng/homes?query=The%20Boe%20Cottage%20Dieng',
            tiketUrl: otaLinks?.whole_cottage?.tiket_com || 'https://www.tiket.com/hotel/search?q=The%20Boe%20Cottage%20Dieng',
            featured: true,
        },
        {
            key: 'daisy',
            title: 'Daisy Room',
            badge: `6 ${t('common.guests')} • 96 m²`,
            description: t('ota.daisyDesc'),
            price: 3000000,
            directHref: '/reservation?room=Daisy%20Room',
            airbnbUrl: otaLinks?.['daisy-room']?.airbnb || 'https://www.airbnb.co.id/s/Dieng/homes?query=The%20Boe%20Cottage%20Daisy%20Room',
            tiketUrl: otaLinks?.['daisy-room']?.tiket_com || 'https://www.tiket.com/hotel/search?q=The%20Boe%20Cottage%20Dieng',
            featured: false,
        },
        {
            key: 'lily',
            title: 'Lily Room',
            badge: `6 ${t('common.guests')} • 96 m²`,
            description: t('ota.lilyDesc'),
            price: 3300000,
            directHref: '/reservation?room=Lily%20Room',
            airbnbUrl: otaLinks?.['lily-room']?.airbnb || 'https://www.airbnb.co.id/s/Dieng/homes?query=The%20Boe%20Cottage%20Lily%20Room',
            tiketUrl: otaLinks?.['lily-room']?.tiket_com || 'https://www.tiket.com/hotel/search?q=The%20Boe%20Cottage%20Dieng',
            featured: false,
        },
    ];

    const formattedSyncTime = syncState.lastSyncedAt
        ? new Date(syncState.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : t('ota.never');

    return (
        <section
            id="ota-booking"
            className={`bg-[#F1ECE0] px-5 ${compact ? 'py-10 sm:py-12' : 'py-14 sm:px-8 sm:py-18 lg:px-12'}`}
        >
            <div className="mx-auto max-w-7xl">
                <RevealOnScroll className="mx-auto max-w-3xl text-center">
                    <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#AE8A66]">
                        {t('ota.eyebrow')}
                    </p>
                    <h2 className="font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#1E322A] sm:text-4xl lg:text-[42px]">
                        {t('ota.title')}
                    </h2>
                    <p className="mx-auto mt-3 max-w-2xl font-sans text-xs leading-relaxed text-[#454943] sm:text-sm">
                        {t('ota.subtitle')}
                    </p>
                </RevealOnScroll>

                {/* 3 Structured Booking Cards: Seluruh Cottage, Daisy Room, Lily Room */}
                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {cards.map((card, idx) => (
                        <RevealOnScroll
                            key={card.key}
                            as="article"
                            direction="up"
                            delay={idx * 100}
                            className={`flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                                card.featured
                                    ? 'border-[#1E322A] bg-[#1E322A] text-[#F1ECE0] shadow-lg'
                                    : 'border-[#1E322A]/12 bg-[#F6F3EE] text-[#1E322A] shadow-sm'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2">
                                    <span
                                        className={`inline-flex items-center rounded-full px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.1em] ${
                                            card.featured
                                                ? 'bg-[#AE8A66] text-white'
                                                : 'bg-[#1E322A]/10 text-[#1E322A]'
                                        }`}
                                    >
                                        {card.badge}
                                    </span>
                                </div>

                                <h3 className="mt-4 font-serif text-2xl font-normal leading-tight sm:text-3xl">
                                    {card.title}
                                </h3>
                                <p
                                    className={`mt-2.5 font-sans text-xs leading-relaxed sm:text-[13px] ${
                                        card.featured ? 'text-[#D2D9D2]' : 'text-[#555A54]'
                                    }`}
                                >
                                    {card.description}
                                </p>

                                <p className="mt-5 font-serif text-xl font-medium">
                                    <span
                                        className={`mr-1.5 font-sans text-[10px] uppercase tracking-[0.08em] ${
                                            card.featured ? 'text-[#D2D9D2]' : 'text-[#777B75]'
                                        }`}
                                    >
                                        {t('ota.from')}
                                    </span>
                                    <span className={card.featured ? 'text-[#D9B995]' : 'text-[#AE8A66]'}>
                                        {formatPrice(card.price)}
                                    </span>
                                    <span
                                        className={`ml-1 font-sans text-xs font-normal ${
                                            card.featured ? 'text-[#D2D9D2]' : 'text-[#777B75]'
                                        }`}
                                    >
                                        / {t('common.perNight')}
                                    </span>
                                </p>
                            </div>

                            <div className="mt-6 space-y-2.5 border-t border-current/10 pt-5">
                                <a
                                    href={card.airbnbUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#FF385C] px-4 py-2.5 text-center font-sans text-xs font-bold tracking-[0.04em] text-white shadow-xs transition-all duration-200 hover:bg-[#E00B41] hover:shadow-md"
                                >
                                    <AirbnbIcon />
                                    <span>{t('ota.bookAirbnb')}</span>
                                </a>

                                <a
                                    href={card.tiketUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-[#0064D2] px-4 py-2.5 text-center font-sans text-xs font-bold tracking-[0.04em] text-white shadow-xs transition-all duration-200 hover:bg-[#004FA6] hover:shadow-md"
                                >
                                    <TiketIcon />
                                    <span>{t('ota.bookTiket')}</span>
                                </a>

                                <Link
                                    href={card.directHref}
                                    className={`flex min-h-10 w-full items-center justify-center rounded-xl border px-4 py-2 font-sans text-[11px] font-semibold tracking-[0.06em] transition-colors ${
                                        card.featured
                                            ? 'border-white/25 bg-white/10 text-white hover:bg-white/20'
                                            : 'border-[#1E322A]/20 bg-white text-[#1E322A] hover:bg-[#1E322A] hover:text-white'
                                    }`}
                                >
                                    {t('ota.bookDirect')}
                                </Link>
                            </div>
                        </RevealOnScroll>
                    ))}
                </div>

                {/* Synced Reservation Status & Test Sync (iCal) Widget for Localhost Testing */}
                {showIcalPanel && (
                    <div className="mt-8 rounded-2xl border border-[#346B55]/30 bg-[#F6F3EE] p-5 shadow-xs sm:p-6">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE9DF] px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.08em] text-[#1E322A]">
                                        <span className="h-2 w-2 rounded-full bg-[#346B55]" />
                                        {t('ota.syncLocal')}
                                    </span>
                                    <h3 className="font-serif text-lg font-medium text-[#1E322A] sm:text-xl">
                                        {t('ota.syncTitle')}
                                    </h3>
                                </div>
                                <p className="mt-1 font-sans text-xs text-[#555A54]">
                                    {t('ota.syncDesc')}
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                                <div className="text-right font-sans text-[11px] text-[#555A54]">
                                    <div>
                                        {t('ota.lastSynced')}: <strong className="text-[#1E322A]">{formattedSyncTime}</strong>
                                    </div>
                                    <div>
                                        {syncState.activeLinks} {t('ota.activeLinks')}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleQuickSync}
                                    disabled={syncState.loading}
                                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#1E322A] px-4 py-2.5 font-sans text-xs font-bold tracking-[0.06em] text-white transition-colors hover:bg-[#346B55] disabled:opacity-60"
                                >
                                    <svg
                                        aria-hidden="true"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className={`h-4 w-4 ${syncState.loading ? 'animate-spin' : ''}`}
                                    >
                                        <path d="M21 12a9 9 0 0 0-15.5-6.36L3 8" />
                                        <path d="M3 3v5h5" />
                                        <path d="M3 12a9 9 0 0 0 15.5 6.36L21 16" />
                                        <path d="M16 16h5v5" />
                                    </svg>
                                    {syncState.loading ? t('ota.syncing') : t('ota.syncButton')}
                                </button>
                            </div>
                        </div>

                        {syncState.summary && (
                            <div className="mt-3 rounded-xl border border-[#346B55]/30 bg-[#DCE9DF]/70 px-3.5 py-2 font-sans text-xs text-[#1E322A]">
                                <strong>{t('ota.resultLabel')}:</strong>{' '}
                                {syncState.summary.imported} {t('ota.imported')} •{' '}
                                {syncState.summary.updated} {t('ota.updated')} •{' '}
                                {syncState.summary.cancelled} {t('ota.cancelled')} •{' '}
                                {syncState.summary.errors} {t('ota.errors')}
                            </div>
                        )}

                        {syncState.error && (
                            <div className="mt-3 rounded-xl border border-[#AE5535]/40 bg-[#FADBD1]/60 px-3.5 py-2 font-sans text-xs text-[#743E2D]">
                                {syncState.error}
                            </div>
                        )}

                        <div className="mt-4 border-t border-[#1E322A]/10 pt-3.5">
                            <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#666A64]">
                                {t('ota.exportFeeds')}
                            </p>
                            <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
                                {syncState.exportFeeds.map((feed) => (
                                    <div
                                        key={feed.slug}
                                        className="flex items-center justify-between gap-2 rounded-xl border border-[#1E322A]/12 bg-white px-3 py-2"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-sans text-xs font-bold text-[#1E322A]">{feed.room}</span>
                                                <span className="font-sans text-[10px] text-[#666A64]">
                                                    ({feed.upcoming_bookings ?? 0} {t('ota.upcoming')})
                                                </span>
                                            </div>
                                            <p className="truncate font-mono text-[10px] text-[#555A54]">{feed.url}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyFeed(feed.slug, feed.url)}
                                            className="shrink-0 rounded-lg bg-[#F1ECE0] px-2.5 py-1.5 font-sans text-[10px] font-bold text-[#1E322A] transition-colors hover:bg-[#1E322A] hover:text-white"
                                        >
                                            {copiedSlug === feed.slug ? t('common.copied') : t('common.copy')}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

