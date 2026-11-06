import { useState } from 'react';
import RoomDetailModal from './RoomDetailModal';
import RevealOnScroll from './RevealOnScroll';

const fallbackRooms = [
    {
        id: 1,
        title: 'Daisy Room',
        tag: 'Perfect for families',
        description: 'Daisy Room offers a spacious and comfortable stay with thoughtfully designed spaces and complete facilities. Perfect for families, friends, or groups looking for a relaxing and memorable stay in Dieng.',
        capacity: '2 Guests',
        size: '96 sq. meters',
        price: '3,000,000',
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
        tag: 'Botanical sanctuary',
        description: 'Designed to bring people together, Lily Room offers a warm and inviting atmosphere with ample space to relax and recharge. Whether you are traveling with close friends or family, it serves as a cozy retreat after exploring Dieng—providing the perfect comfort for medium-sized groups.',
        capacity: '2 Guests',
        size: '96 sq. meters',
        price: '3,300,000',
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
    return (
        <RevealOnScroll
            as="article"
            direction={revealDirection}
            className="room-card grid overflow-hidden rounded-[3px] shadow-[0_2px_8px_rgba(30,50,42,0.12)] md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]"
            style={{ backgroundColor: '#F6F3EE' }}
        >
            <div className={`min-h-[230px] overflow-hidden sm:min-h-[300px] md:min-h-[350px] ${reverse ? 'md:col-start-2 md:row-start-1' : ''}`}>
                <img
                    src={room.images[0]}
                    alt={room.imageAlt}
                    className="h-full min-h-[230px] w-full object-cover sm:min-h-[300px] md:min-h-[350px]"
                    loading="lazy"
                />
            </div>

            <div className={`flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-11 ${reverse ? 'md:col-start-1 md:row-start-1' : ''}`}>
                <p className="mb-2 font-sans text-[9px] font-medium uppercase tracking-[0.14em] text-[#777B75] sm:text-[10px]">
                    {room.tag}
                </p>
                <h3 className="mb-3 font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#1E322A] sm:text-4xl">
                    {room.title}
                </h3>
                <p className="font-sans text-xs leading-[1.65] text-[#454943] sm:text-[13px]">
                    {room.description}
                </p>

                <dl className="mt-5 grid max-w-[280px] grid-cols-2 gap-5">
                    <div>
                        <dt className="mb-1 font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#777B75]">Capacity</dt>
                        <dd className="font-sans text-[11px] font-medium text-[#1E322A]">{room.capacity}</dd>
                    </div>
                    <div>
                        <dt className="mb-1 font-sans text-[8px] font-medium uppercase tracking-[0.12em] text-[#777B75]">Footprint</dt>
                        <dd className="font-sans text-[11px] font-medium text-[#1E322A]">{room.size}</dd>
                    </div>
                </dl>

                <p className="mt-5 font-serif text-lg leading-none text-[#AE8A66]">
                    IDR {room.price}
                    <span className="ml-1.5 font-sans text-[10px] text-[#777B75]">/ night</span>
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    <a
                        href={`/reservation?room=${encodeURIComponent(room.title)}`}
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 bg-[#1E322A] px-4 py-2 font-sans text-[9px] font-semibold uppercase tracking-[0.09em] text-white transition-colors hover:bg-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                    >
                        Reserve room
                    </a>
                    <a
                        href="#room-details"
                        onClick={(event) => {
                            event.preventDefault();
                            onDetails(room);
                        }}
                        aria-label={`View ${room.title} details`}
                        className="font-sans text-[8px] font-medium uppercase tracking-[0.08em] text-[#555A54] underline underline-offset-2 transition-colors hover:text-[#346B55] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                    >
                        View room details
                    </a>
                </div>
            </div>
        </RevealOnScroll>
    );
}

export default function RoomSection({ rooms: backendRooms = [] }) {
    const [selectedRoom, setSelectedRoom] = useState(null);

    const mappedRooms = backendRooms.length > 0
        ? backendRooms.map((r, idx) => ({
            id: r.id,
            title: r.name,
            tag: r.name.toLowerCase().includes('daisy') ? 'Perfect for families' : 'Botanical sanctuary',
            description: r.description || fallbackRooms[idx]?.description || '',
            capacity: `${r.capacity || 2} Guests`,
            size: r.size || '96 sq. meters',
            price: Number(r.price_per_night).toLocaleString('en-US'),
            details: r.amenities ? { amenities: r.amenities, featureColumns: undefined } : undefined,
            images: r.images?.length >= 4
                ? r.images.map((img) => img.image_path)
                : (fallbackRooms[idx]?.images || fallbackRooms[0].images),
            imageAlt: `${r.name} bedroom view`,
        }))
        : fallbackRooms;

    return (
        <>
            <section id="cottages" className="overflow-x-clip bg-[#F1ECE0] px-5 py-14 sm:px-8 sm:py-16 md:px-10 lg:px-12 lg:py-20">
                <div className="mx-auto max-w-[1440px]">
                    <header className="mb-8 max-w-[560px] sm:mb-10 lg:mb-12">
                        <p className="mb-2 font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-[#AE8A66] sm:text-[10px]">
                            The dwellings
                        </p>
                        <h2 className="font-serif text-4xl font-normal leading-[1.05] tracking-[-0.035em] text-[#1E322A] sm:text-5xl">
                            Two Sanctuaries in the Pines
                        </h2>
                        <p className="mt-3 max-w-[520px] font-sans text-xs leading-relaxed text-[#454943] sm:text-[13px]">
                            Designed with teak wood and natural stone accents, this cottage features large windows offering direct views of Mount Prau.
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
