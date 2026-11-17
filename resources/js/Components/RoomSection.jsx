import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { useLanguage } from '../Contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';
import RoomDetailModal from './RoomDetailModal';

const fallbackRooms = [
    {
        id: 1,
        title: 'Daisy Room',
        slug: 'daisy-room',
        capacityCount: 6,
        size: '96 sq. meters',
        rawPrice: 3000000,
        images: [
            '/images/cottage/daisy/daisy-bedroom.jpeg',
            '/images/cottage/daisy/daisy-toilet-2.jpeg',
            '/images/cottage/daisy/bathtub-daisy.jpeg',
            '/images/cottage/daisy/daisy-sofa-bed.jpeg',
        ],
        imageAlt: 'Daisy Room bedroom with a comfortable bed and natural finishes',
    },
    {
        id: 2,
        title: 'Lily Room',
        slug: 'lily-room',
        capacityCount: 6,
        size: '96 sq. meters',
        rawPrice: 3300000,
        images: [
            '/images/cottage/lily/lily-bedroom.jpeg',
            '/images/cottage/lily/lily-master-bedroom.jpeg',
            '/images/cottage/lily/bathtub-lily.jpeg',
            '/images/cottage/lily/bathtub-lily-2.jpeg',
        ],
        imageAlt: 'Lily Room bedroom with warm wood and a bright mountain view',
    },
];

function RoomCard({ room, reverse = false, onDetails, revealDirection }) {
    const { t, formatPrice } = useLanguage();
    const isDaisy = room.title.toLowerCase().includes('daisy');
    const tagText = isDaisy ? t('rooms.tagDaisy') : t('rooms.tagLily');
    const descriptionText = isDaisy ? t('rooms.descDaisy') : t('rooms.descLily');
    const formattedPrice = formatPrice(room.rawPrice);
    const capacityLabel = `${room.capacityCount} ${t('common.guests')}`;
    const quickBadges = [t('amenities.tv'), t('amenities.wifi'), t('amenities.bath')];

    return (
        <RevealOnScroll
            as="article"
            direction={revealDirection}
            className="room-card group grid overflow-hidden rounded-xl border border-[#1E322A]/10 shadow-[0_6px_24px_rgba(30,50,42,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(30,50,42,0.16)] md:grid-cols-[minmax(0,1.18fr)_minmax(0,0.92fr)]"
            style={{ backgroundColor: '#F6F3EE' }}
        >
            <div
                onClick={() => onDetails(room)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onDetails(room);
                    }
                }}
                aria-label={`${t('rooms.details')} — ${room.title}`}
                className={`relative min-h-[240px] cursor-pointer overflow-hidden sm:min-h-[300px] md:min-h-[370px] ${
                    reverse ? 'md:col-start-2 md:row-start-1' : ''
                }`}
            >
                <img
                    src={room.images[0]}
                    alt={room.imageAlt}
                    className="h-full min-h-[240px] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 sm:min-h-[300px] md:min-h-[370px]"
                    loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 font-sans text-[10px] font-semibold tracking-[0.06em] text-white backdrop-blur-xs transition-transform duration-300 group-hover:scale-105">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                        <rect x="2.5" y="4" width="15" height="12" rx="2" />
                        <circle cx="7" cy="8.5" r="1.25" />
                        <path d="m17.5 13-3.8-3.8L7.5 16" />
                    </svg>
                    {room.images.length} {t('rooms.photos')}
                </span>
            </div>

            <div
                className={`flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-11 ${
                    reverse ? 'md:col-start-1 md:row-start-1' : ''
                }`}
            >
                <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AE8A66]">
                    {tagText}
                </p>
                <h3 className="mb-3 font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#1E322A] sm:text-4xl">
                    {room.title}
                </h3>
                <p className="font-sans text-xs leading-[1.7] text-[#454943] sm:text-[13px]">
                    {descriptionText}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    {quickBadges.map((badge) => (
                        <span
                            key={badge}
                            className="inline-flex items-center rounded-full border border-[#1E322A]/12 bg-white/80 px-2.5 py-1 font-sans text-[10px] font-medium text-[#1E322A]"
                        >
                            {badge}
                        </span>
                    ))}
                </div>

                <dl className="mt-5 grid max-w-[300px] grid-cols-2 gap-5 border-y border-[#1E322A]/10 py-3.5">
                    <div>
                        <dt className="mb-1 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-[#777B75]">
                            {t('rooms.capacity')}
                        </dt>
                        <dd className="font-sans text-xs font-semibold text-[#1E322A]">{capacityLabel}</dd>
                    </div>
                    <div>
                        <dt className="mb-1 font-sans text-[9px] font-semibold uppercase tracking-[0.12em] text-[#777B75]">
                            {t('rooms.footprint')}
                        </dt>
                        <dd className="font-sans text-xs font-semibold text-[#1E322A]">{room.size}</dd>
                    </div>
                </dl>

                <p className="mt-5 font-serif text-xl font-medium leading-none text-[#AE8A66] sm:text-2xl">
                    {formattedPrice}
                    <span className="ml-1.5 font-sans text-xs font-normal text-[#777B75]">
                        / {t('common.perNight')}
                    </span>
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    <Link
                        href={`/reservation?room=${encodeURIComponent(room.title)}`}
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-[#1E322A] px-5 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                    >
                        {t('rooms.reserve')}
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDetails(room)}
                        aria-label={`${t('rooms.details')} ${room.title}`}
                        className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1E322A] underline decoration-[#AE8A66] underline-offset-4 transition-colors hover:text-[#346B55]"
                    >
                        {t('rooms.details')}
                        <span aria-hidden="true">→</span>
                    </button>
                </div>
            </div>
        </RevealOnScroll>
    );
}

export default function RoomSection({ rooms: backendRooms = [] }) {
    const [selectedRoom, setSelectedRoom] = useState(null);
    const { t } = useLanguage();

    const mappedRooms =
        backendRooms.length > 0
            ? backendRooms.map((r, idx) => {
                  const fallback = fallbackRooms[idx] || fallbackRooms[0];
                  const rawCapacity = Number(r.capacity) || 6;
                  return {
                      id: r.id,
                      title: r.name,
                      slug: r.slug || fallback.slug,
                      capacityCount: Math.max(6, rawCapacity),
                      size: r.size || '96 sq. meters',
                      rawPrice: Number(r.price_per_night) || fallback.rawPrice,
                      price: Number(r.price_per_night || fallback.rawPrice).toLocaleString('en-US'),
                      images:
                          r.images?.length >= 4
                              ? r.images.map((img) => img.image_path)
                              : fallback.images,
                      imageAlt: `${r.name} bedroom view`,
                  };
              })
            : fallbackRooms.map((r) => ({
                  ...r,
                  price: r.rawPrice.toLocaleString('en-US'),
              }));

    return (
        <>
            <section id="cottages" className="overflow-x-clip bg-[#F1ECE0] px-5 py-14 sm:px-8 sm:py-16 md:px-10 lg:px-12 lg:py-20">
                <div className="mx-auto max-w-[1440px]">
                    <header className="mb-8 max-w-[600px] sm:mb-10 lg:mb-12">
                        <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#AE8A66]">
                            {t('rooms.eyebrow')}
                        </p>
                        <h2 className="font-serif text-3xl font-normal leading-[1.08] tracking-[-0.03em] text-[#1E322A] sm:text-4xl lg:text-5xl">
                            {t('rooms.title')}
                        </h2>
                        <p className="mt-3 max-w-[540px] font-sans text-xs leading-relaxed text-[#454943] sm:text-sm">
                            {t('rooms.subtitle')}
                        </p>
                    </header>

                    <div className="flex flex-col gap-8 sm:gap-10 lg:gap-12">
                        {mappedRooms.map((room, index) => (
                            <RoomCard
                                key={room.id || room.title}
                                room={room}
                                reverse={index === 1}
                                onDetails={setSelectedRoom}
                                revealDirection={index % 2 === 0 ? 'left' : 'right'}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <RoomDetailModal
                isOpen={selectedRoom !== null}
                onClose={() => setSelectedRoom(null)}
                roomData={selectedRoom}
            />
        </>
    );
}
