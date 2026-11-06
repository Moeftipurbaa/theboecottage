import { useEffect } from 'react';

const daisyDetails = {
    amenities: ['Smart TV', 'Free WIFI', '1 Bathtub Pribadi'],
    featureColumns: [
        [
            {
                title: 'Private Bedroom',
                icon: 'door',
                items: ['1 comfortable bed on lower floor with private balcony access'],
            },
            {
                title: 'Mezzanine Bedroom',
                icon: 'bed',
                items: ['1 comfortable bed on the upper mezzanine floor', '1 sofa bed for extra sleeping space with access to a private balcony'],
            },
            {
                title: 'Bathroom Facilities',
                icon: 'bath',
                items: ['2 Bathrooms : Private bathrooms with water heaters and complete amenities.', '1 Bathtub : Private square bathtub with hot water.'],
            },
        ],
        [
            {
                title: 'Fully Equipped Kitchen & Pantry',
                icon: 'kitchen',
                items: ['Dining table', 'Electric stove', 'Rice cooker', 'Nespresso coffee machine', 'Complete kitchen utensils'],
            },
            {
                title: 'Living Room',
                icon: 'sofa',
                items: ['Comfortable sofa', 'Smart TV with free Netflix', 'Free Wi-Fi', 'Table', 'Storage shelf'],
            },
        ],
    ],
};

const icons = {
    bed: <><path d="M3 17V7m0 7h18v5m0-5v-4a2 2 0 0 0-2-2h-5v6M3 11h4a4 4 0 0 1 4 4v-2a2 2 0 0 0-2-2H3" /><path d="M3 19v2m18-2v2" /></>,
    expand: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 15H5v4m0 0 5-5m6-5h3V5m0 0-5 5" /></>,
    tv: <><rect x="3" y="5" width="18" height="13" rx="1.5" /><path d="M8 21h8m-4-3v3" /></>,
    wifi: <><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0m-11 3.5a5 5 0 0 1 8 0M12 19h.01" /></>,
    bath: <><path d="M3 11h18v4a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM5 11V5a2 2 0 0 1 4 0v1m-5 13-1 2m16-2 1 2" /></>,
    door: <><path d="M5 21V3h14v18M3 21h18M12 12h.01" /></>,
    kitchen: <><rect x="5" y="3" width="14" height="18" rx="1" /><path d="M5 9h14M9 6h.01M12 6h.01M15 6h.01m-6 7h6m-6 3h6" /></>,
    sofa: <><path d="M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M3 11a2 2 0 0 0-2 2v5h22v-5a2 2 0 0 0-2-2M4 18v3m16-3v3M4 14h16" /></>,
};

function Icon({ name, className = 'h-5 w-5' }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
            {icons[name]}
        </svg>
    );
}

export default function RoomDetailModal({ isOpen, onClose, roomData }) {
    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !roomData) return null;

    const amenities = roomData.details?.amenities?.length ? roomData.details.amenities : daisyDetails.amenities;
    const featureColumns = roomData.details?.featureColumns?.length ? roomData.details.featureColumns : daisyDetails.featureColumns;
    const images = roomData.images;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="room-detail-title"
                className="relative max-h-[90vh] w-[95%] max-w-6xl overflow-y-auto rounded-2xl bg-[#F6F3EE] text-[#1E322A] shadow-2xl"
            >
                <div className="sticky top-0 z-20 flex h-12 items-center justify-end bg-[#F6F3EE]/95 px-4 backdrop-blur-sm md:absolute md:right-0 md:top-0 md:h-14 md:bg-transparent md:px-5">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close room details"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1ECE0] text-[#1E322A] transition-colors hover:bg-[#e8e1d3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                            <path d="m6 6 12 12M18 6 6 18" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 px-4 pb-6 pt-2 sm:px-6 md:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
                    <div className="grid h-fit grid-cols-2 gap-4">
                        <img src={images[0]} alt={`${roomData.title} bedroom`} className="col-span-2 h-56 w-full rounded-2xl object-cover md:h-72" />
                        <img src={images[1]} alt={`${roomData.title} bathroom`} className="col-span-1 row-span-2 h-full min-h-[250px] w-full rounded-2xl object-cover" />
                        <img src={images[2]} alt={`${roomData.title} bathtub`} className="col-span-1 h-32 w-full rounded-2xl object-cover md:h-48" />
                        <img src={images[3]} alt={`${roomData.title} living area`} className="col-span-1 h-32 w-full rounded-2xl object-cover md:h-48" />
                    </div>

                    <div className="flex min-w-0 flex-col">
                        <h2 id="room-detail-title" className="mb-5 font-serif text-3xl font-normal leading-tight sm:text-4xl">
                            {roomData.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 font-sans text-sm font-semibold text-[#454943]">
                            <div className="flex items-center gap-2">
                                <Icon name="bed" className="h-6 w-6 text-[#101513]" />
                                <span>{roomData.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Icon name="expand" className="h-6 w-6 text-[#101513]" />
                                <span>{roomData.size}</span>
                            </div>
                        </div>

                        <div className="mt-6 mb-8 flex flex-wrap gap-3">
                            {amenities.map((amenity, index) => (
                                <span key={amenity} className="inline-flex items-center gap-2 rounded-xl bg-gray-200/60 px-3 py-2 text-xs font-medium text-[#454943] sm:px-4 sm:text-sm">
                                    <Icon name={['tv', 'wifi', 'bath'][index % 3]} className="h-5 w-5 shrink-0 text-[#101513]" />
                                    {amenity}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 gap-x-6 gap-y-7 sm:grid-cols-2">
                            {featureColumns.map((column, columnIndex) => (
                                <div key={columnIndex} className="space-y-7">
                                    {column.map((feature) => (
                                        <section key={feature.title} className="min-w-0">
                                            <h3 className="flex items-center gap-2 font-sans text-sm font-semibold text-[#353A36]">
                                                <Icon name={feature.icon} className="h-5 w-5 shrink-0 text-[#101513]" />
                                                {feature.title}
                                            </h3>
                                            <ul className="mt-2 list-disc space-y-1 pl-6 font-sans text-sm leading-[1.4] text-gray-600">
                                                {feature.items.map((item) => <li key={item}>{item}</li>)}
                                            </ul>
                                        </section>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-gray-300 pt-6 sm:flex-row sm:items-center">
                            <p className="font-serif text-2xl leading-none text-[#1E322A] sm:text-3xl">
                                IDR {roomData.price}
                                <span className="font-serif">/night</span>
                            </p>
                            <a href={`/reservation?room=${encodeURIComponent(roomData.title)}`} onClick={onClose} className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#1E322A] px-6 py-4 font-sans text-[10px] font-bold tracking-[0.12em] text-white transition-colors hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55] sm:w-auto sm:px-8 sm:text-xs">
                                LIHAT KETERSEDIAAN
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
