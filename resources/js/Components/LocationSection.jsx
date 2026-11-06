import RevealOnScroll from './RevealOnScroll';

const nearbyPlaces = [
    { name: 'Telaga Warna', distance: '13km' },
    { name: 'Kawah Sikidang', distance: '13km' },
    { name: 'Candi Arjuna', distance: '12km' },
    { name: 'Bukit Sikunir', distance: '12km' },
];

export default function LocationSection() {
    return (
        <section
            id="location"
            className="relative isolate overflow-hidden bg-[#F1ECE0] px-8 py-20 md:px-16 md:py-24"
        >
            <img
                src="/images/cottage/decor/leaf.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-6 w-32 -scale-x-100 opacity-60 md:w-48"
            />
            <img
                src="/images/cottage/decor/leaf.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 left-6 w-32 opacity-60 md:w-48"
            />

            <RevealOnScroll className="relative z-10 mx-auto max-w-7xl rounded-2xl bg-[#1E322A] p-5 shadow-[0_12px_32px_rgba(30,50,42,0.16)] sm:p-8" direction="fade">
                <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2">
                    <div>
                        <h2 className="font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#F1ECE0]">
                            Location Map
                        </h2>
                        <p className="mb-5 mt-1 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-[#D2D9D2]">
                            Above sea level
                        </p>
                        <a
                            href="https://maps.google.com/?q=The+Boe+Cottage,+Jl.+Raya+Sumberejo,+Batur,+Banjarnegara"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block overflow-hidden shadow-lg"
                            aria-label="Open directions to The Boe Cottage in Google Maps"
                        >
                            <img
                                src="/images/cottage/location/map-image.jpg"
                                alt="Map to The Boe Cottage"
                                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                loading="lazy"
                            />
                        </a>
                    </div>

                    <div>
                        <h2 className="font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#F1ECE0]">
                            Around the Cottage
                        </h2>
                        <p className="mb-6 mt-4 max-w-xl font-sans text-sm leading-relaxed text-[#D2D9D2] sm:mb-8">
                            All of these places are accessible by car or motorcycle. Distances are measured from the cottage door.
                        </p>

                        <ul className="font-serif text-xl text-[#F1ECE0] sm:text-2xl">
                            {nearbyPlaces.map((place) => (
                                <li
                                    key={place.name}
                                    className="flex items-center justify-between gap-4 border-b border-white/20 py-4"
                                >
                                    <span>{place.name}</span>
                                    <span>{place.distance}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </RevealOnScroll>
        </section>
    );
}
