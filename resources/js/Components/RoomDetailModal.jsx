import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../Contexts/LanguageContext';

const ZONE_KEYS = [
    { key: 'bedroom', icon: 'door' },
    { key: 'mezzanine', icon: 'bed' },
    { key: 'bathroom', icon: 'bath' },
    { key: 'kitchen', icon: 'kitchen' },
    { key: 'living', icon: 'sofa' },
];

const icons = {
    bed: (
        <>
            <path d="M3 17V7m0 7h18v5m0-5v-4a2 2 0 0 0-2-2h-5v6M3 11h4a4 4 0 0 1 4 4v-2a2 2 0 0 0-2-2H3" />
            <path d="M3 19v2m18-2v2" />
        </>
    ),
    expand: (
        <>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M8 15H5v4m0 0 5-5m6-5h3V5m0 0-5 5" />
        </>
    ),
    tv: (
        <>
            <rect x="3" y="5" width="18" height="13" rx="1.5" />
            <path d="M8 21h8m-4-3v3" />
        </>
    ),
    wifi: (
        <>
            <path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0m-11 3.5a5 5 0 0 1 8 0M12 19h.01" />
        </>
    ),
    bath: (
        <>
            <path d="M3 11h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM5 11V5a2 2 0 0 1 4 0v1m-5 13-1 2m16-2 1 2" />
        </>
    ),
    door: (
        <>
            <path d="M5 21V3h14v18M3 21h18M12 12h.01" />
        </>
    ),
    kitchen: (
        <>
            <rect x="5" y="3" width="14" height="18" rx="1" />
            <path d="M5 9h14M9 6h.01M12 6h.01M15 6h.01m-6 7h6m-6 3h6" />
        </>
    ),
    sofa: (
        <>
            <path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11a2 2 0 0 0-2 2v5h22v-5a2 2 0 0 0-2-2M4 18v3m16-3v3M4 14h16" />
        </>
    ),
    check: <path d="m5 12.5 4.2 4.2L19 7" />,
};

function Icon({ name, className = 'h-5 w-5' }) {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            {icons[name]}
        </svg>
    );
}

/**
 * Full-screen Interactive Lightbox Carousel with zoom & touch swipe support.
 */
function LightboxCarousel({ images, initialIndex, roomTitle, photoLabels, onClose, t }) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [zoomed, setZoomed] = useState(false);
    const touchStartX = useRef(null);

    const goPrev = () => {
        setZoomed(false);
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const goNext = () => {
        setZoomed(false);
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    useEffect(() => {
        const handleKey = (event) => {
            if (event.key === 'Escape') {
                event.stopPropagation();
                onClose();
            } else if (event.key === 'ArrowLeft') {
                goPrev();
            } else if (event.key === 'ArrowRight') {
                goNext();
            }
        };
        window.addEventListener('keydown', handleKey, true);
        return () => window.removeEventListener('keydown', handleKey, true);
    });

    const handleTouchStart = (event) => {
        touchStartX.current = event.touches?.[0]?.clientX ?? null;
    };

    const handleTouchEnd = (event) => {
        if (touchStartX.current === null) return;
        const deltaX = (event.changedTouches?.[0]?.clientX ?? touchStartX.current) - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(deltaX) > 45) {
            if (deltaX < 0) goNext();
            else goPrev();
        }
    };

    const label = Array.isArray(photoLabels) && photoLabels[currentIndex] ? photoLabels[currentIndex] : '';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`${roomTitle} — ${t('lightbox.title')}`}
            className="fixed inset-0 z-[70] flex flex-col justify-between bg-black/92 p-4 text-white backdrop-blur-md sm:p-6"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="font-serif text-lg font-medium text-white sm:text-xl">
                        {roomTitle} {label ? `— ${label}` : ''}
                    </p>
                    <p className="font-sans text-xs text-white/70">
                        {currentIndex + 1} {t('lightbox.of')} {images.length} • {t('lightbox.hint')}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setZoomed((z) => !z)}
                        aria-label={zoomed ? t('lightbox.zoomOut') : t('lightbox.zoomIn')}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3.5 font-sans text-xs font-semibold text-white transition-colors hover:bg-white/20"
                    >
                        {zoomed ? '1×' : '2×'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={t('common.close')}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors hover:bg-white/20"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                            <path d="m6 6 12 12M18 6 6 18" />
                        </svg>
                    </button>
                </div>
            </div>

            <div
                className="relative my-4 flex flex-1 items-center justify-center overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <button
                    type="button"
                    onClick={goPrev}
                    aria-label={t('common.previous')}
                    className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition-all hover:bg-black/80 sm:left-4"
                >
                    ‹
                </button>

                <img
                    src={images[currentIndex]}
                    alt={`${roomTitle} ${label}`}
                    onDoubleClick={() => setZoomed((z) => !z)}
                    onClick={() => setZoomed((z) => !z)}
                    className={`max-h-[70vh] max-w-full rounded-xl object-contain transition-transform duration-300 ${
                        zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                    }`}
                />

                <button
                    type="button"
                    onClick={goNext}
                    aria-label={t('common.next')}
                    className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white transition-all hover:bg-black/80 sm:right-4"
                >
                    ›
                </button>
            </div>

            <div className="no-scrollbar mx-auto flex max-w-full items-center gap-2.5 overflow-x-auto pb-1">
                {images.map((src, idx) => (
                    <button
                        key={src + idx}
                        type="button"
                        onClick={() => {
                            setZoomed(false);
                            setCurrentIndex(idx);
                        }}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                            idx === currentIndex
                                ? 'border-[#AE8A66] opacity-100 scale-105'
                                : 'border-transparent opacity-55 hover:opacity-85'
                        }`}
                    >
                        <img src={src} alt="" className="h-full w-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default function RoomDetailModal({ isOpen, onClose, roomData }) {
    const { t, formatPrice } = useLanguage();
    const [activeZoneKey, setActiveZoneKey] = useState('bedroom');
    const [lightboxIndex, setLightboxIndex] = useState(null);

    useEffect(() => {
        if (!isOpen) {
            setLightboxIndex(null);
            return undefined;
        }

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && lightboxIndex === null) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, lightboxIndex]);

    if (!isOpen || !roomData) return null;

    const images = roomData.images || [];
    const photoLabels = t('roomModal.photoLabels');
    const rawPrice = roomData.rawPrice || Number(String(roomData.price || '3000000').replace(/[^\d]/g, '')) || 3000000;
    const capacityCount = roomData.capacityCount || 6;

    const amenityBadges = [
        { icon: 'tv', label: t('amenities.tv') },
        { icon: 'wifi', label: t('amenities.wifi') },
        { icon: 'bath', label: t('amenities.bath') },
    ];

    const zones = ZONE_KEYS.map(({ key, icon }) => {
        const zoneData = t(`roomModal.zones.${key}`) || {};
        return {
            key,
            icon,
            title: zoneData.title || key,
            short: zoneData.short || '',
            description: zoneData.description || '',
            items: Array.isArray(zoneData.items) ? zoneData.items : [],
        };
    });

    const activeZone = zones.find((z) => z.key === activeZoneKey) || zones[0];

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-2 backdrop-blur-xs sm:p-4"
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) onClose();
                }}
            >
                <section
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="room-detail-title"
                    className="relative max-h-[92vh] w-[96%] max-w-6xl overflow-y-auto rounded-2xl bg-[#F6F3EE] text-[#1E322A] shadow-2xl"
                >
                    <div className="sticky top-0 z-20 flex h-12 items-center justify-end bg-[#F6F3EE]/95 px-4 backdrop-blur-xs md:absolute md:right-0 md:top-0 md:h-14 md:bg-transparent md:px-5">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('roomModal.closeAria')}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1ECE0] text-[#1E322A] transition-colors hover:bg-[#e8e1d3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                        >
                            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                                <path d="m6 6 12 12M18 6 6 18" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-7 px-4 pb-6 pt-2 sm:px-6 md:p-9 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-9">
                        {/* Interactive 4-Photo Grid with Lightbox Trigger */}
                        <div className="grid h-fit grid-cols-2 gap-3.5">
                            {images.slice(0, 4).map((src, idx) => {
                                const layoutClass =
                                    idx === 0
                                        ? 'col-span-2 h-52 sm:h-64'
                                        : idx === 1
                                          ? 'col-span-1 row-span-2 h-full min-h-[220px] sm:min-h-[260px]'
                                          : 'col-span-1 h-28 sm:h-32';
                                const label = Array.isArray(photoLabels) && photoLabels[idx] ? photoLabels[idx] : `${idx + 1}`;
                                return (
                                    <button
                                        key={src + idx}
                                        type="button"
                                        onClick={() => setLightboxIndex(idx)}
                                        aria-label={`${t('roomModal.viewPhoto')}: ${roomData.title} ${label}`}
                                        className={`group relative overflow-hidden rounded-2xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55] ${layoutClass}`}
                                    >
                                        <img
                                            src={src}
                                            alt={`${roomData.title} ${label}`}
                                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                        />
                                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
                                        <span className="absolute bottom-2.5 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 font-sans text-[10px] font-medium text-white backdrop-blur-xs">
                                            {label}
                                        </span>
                                        <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/85 text-[#1E322A] opacity-0 shadow-xs transition-all duration-200 group-hover:opacity-100">
                                            <Icon name="expand" className="h-3.5 w-3.5" />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Room Info + Interactive Tabbed / Bento Facility Explorer */}
                        <div className="flex min-w-0 flex-col">
                            <h2 id="room-detail-title" className="mb-3 font-serif text-3xl font-normal leading-tight text-[#1E322A] sm:text-4xl">
                                {roomData.title}
                            </h2>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 font-sans text-sm font-semibold text-[#454943]">
                                <div className="flex items-center gap-2">
                                    <Icon name="bed" className="h-5 w-5 text-[#1E322A]" />
                                    <span>
                                        {capacityCount} {t('common.guests')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Icon name="expand" className="h-5 w-5 text-[#1E322A]" />
                                    <span>{roomData.size || '96 sq. meters'}</span>
                                </div>
                            </div>

                            {/* Primary Amenity Badges */}
                            <div className="mt-4 mb-6 flex flex-wrap gap-2.5">
                                {amenityBadges.map((badge) => (
                                    <span
                                        key={badge.label}
                                        className="inline-flex items-center gap-2 rounded-xl border border-[#1E322A]/12 bg-white px-3.5 py-2 font-sans text-xs font-semibold text-[#1E322A] shadow-2xs"
                                    >
                                        <Icon name={badge.icon} className="h-4 w-4 shrink-0 text-[#346B55]" />
                                        {badge.label}
                                    </span>
                                ))}
                            </div>

                            {/* Interactive Bento Card Explorer Header */}
                            <div className="mb-3 flex items-baseline justify-between gap-2">
                                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-[#346B55]">
                                    {t('roomModal.explore')}
                                </p>
                                <span className="font-sans text-[11px] text-[#777B75]">{t('roomModal.exploreHint')}</span>
                            </div>

                            {/* 5-Zone Bento Selector Grid (Swipeable on 360px mobile, Grid on tablet/desktop) */}
                            <div
                                className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-5"
                                role="tablist"
                                aria-label={t('roomModal.explore')}
                            >
                                {zones.map((zone) => {
                                    const selected = zone.key === activeZone.key;
                                    return (
                                        <button
                                            key={zone.key}
                                            type="button"
                                            role="tab"
                                            aria-selected={selected}
                                            onClick={() => setActiveZoneKey(zone.key)}
                                            className={`group flex min-w-[142px] shrink-0 flex-col items-start justify-between rounded-xl border p-3 text-left transition-all duration-200 sm:min-w-0 ${
                                                selected
                                                    ? 'border-[#1E322A] bg-[#1E322A] text-white shadow-md'
                                                    : 'border-[#1E322A]/12 bg-white/85 text-[#1E322A] hover:-translate-y-0.5 hover:border-[#AE8A66] hover:bg-white'
                                            }`}
                                        >
                                            <span
                                                className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                                                    selected ? 'bg-white/15 text-[#D9B995]' : 'bg-[#F1ECE0] text-[#1E322A] group-hover:bg-[#AE8A66]/20'
                                                }`}
                                            >
                                                <Icon name={zone.icon} className="h-4 w-4" />
                                            </span>
                                            <span className="font-sans text-xs font-bold leading-snug">{zone.title}</span>
                                            <span className={`mt-0.5 font-sans text-[10px] leading-tight ${selected ? 'text-white/75' : 'text-[#777B75]'}`}>
                                                {zone.short}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active Zone Detail Spotlight Card */}
                            <div
                                role="tabpanel"
                                className="mt-3.5 rounded-2xl border border-[#1E322A]/12 bg-white p-4 shadow-xs sm:p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E322A] text-[#D9B995]">
                                        <Icon name={activeZone.icon} className="h-5 w-5" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-serif text-lg font-medium text-[#1E322A] sm:text-xl">
                                            {activeZone.title}
                                        </h3>
                                        <p className="mt-1 font-sans text-xs leading-relaxed text-[#555A54] sm:text-[13px]">
                                            {activeZone.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2 border-t border-[#F1ECE0] pt-3.5">
                                    {activeZone.items.map((item) => (
                                        <span
                                            key={item}
                                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#F6F3EE] px-3 py-1.5 font-sans text-xs font-medium text-[#1E322A]"
                                        >
                                            <Icon name="check" className="h-3.5 w-3.5 text-[#346B55]" />
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Price & Primary CTA Footer */}
                            <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-[#DCD8CF] pt-5 sm:flex-row sm:items-center">
                                <div>
                                    <p className="font-serif text-2xl font-medium leading-none text-[#1E322A] sm:text-3xl">
                                        {formatPrice(rawPrice)}
                                        <span className="ml-1.5 font-sans text-xs font-normal text-[#666A64]">
                                            / {t('common.perNight')}
                                        </span>
                                    </p>
                                </div>
                                <Link
                                    href={`/reservation?room=${encodeURIComponent(roomData.title)}`}
                                    onClick={onClose}
                                    className="inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[#1E322A] px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55] sm:w-auto sm:px-8"
                                >
                                    {t('roomModal.checkAvailability')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {lightboxIndex !== null && (
                <LightboxCarousel
                    images={images}
                    initialIndex={lightboxIndex}
                    roomTitle={roomData.title}
                    photoLabels={photoLabels}
                    onClose={() => setLightboxIndex(null)}
                    t={t}
                />
            )}
        </>
    );
}
