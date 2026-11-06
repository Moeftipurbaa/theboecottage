import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import AboutSection from '../Components/AboutSection';
import Footer from '../Components/Footer';
import LoginModal from '../Components/LoginModal';
import LocationSection from '../Components/LocationSection';
import ReviewSection from '../Components/ReviewSection';
import RoomSection from '../Components/RoomSection';

function CalendarIcon() {
    return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-[#AE8A66]" stroke="currentColor" strokeWidth="1.5"><rect x="3.25" y="4.5" width="13.5" height="12" rx="1.5" /><path d="M6.5 2.75v3.5m7-3.5v3.5M3.5 8h13" /></svg>;
}

function Navbar({ onOpenLogin, user }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const navLinks = [
        { label: 'About Us', href: '#about' },
        { label: 'The Cottages', href: '#cottages' },
        { label: 'Location', href: '#location' },
        { label: 'Testimonials', href: '#testimonials' },
    ];

    return (
        <nav className="sticky top-0 z-50 h-[76px] bg-[#F1ECE0]">
            <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-[4.25%]">
                <a href="/" aria-label="The Boe Cottage home" className="flex w-[112px] shrink-0 flex-col items-center text-[#AE8A66] no-underline">
                    <span className="font-serif text-[9px] italic leading-[10px]">The</span>
                    <span className="font-serif text-[15px] leading-[15px] tracking-[0.08em]">BOE</span>
                    <span className="font-serif text-[18px] leading-[18px] tracking-[0.03em]">COTTAGE</span>
                    <span className="font-sans text-[6px] font-medium leading-[9px] tracking-[0.48em]">DIENG</span>
                </a>

                <div className="hidden items-center gap-7 md:flex lg:gap-9">
                    {navLinks.map(({ label, href }) => (
                        <a key={label} href={href} className="font-sans text-[15px] font-medium text-[#424641] transition-colors hover:text-[#AE8A66]">
                            {label}
                        </a>
                    ))}
                </div>

                <div className="flex w-[140px] items-center justify-end gap-2">
                    {user ? (
                        <Link
                            href="/admin-dashboard"
                            className="inline-flex h-8 items-center justify-center rounded-[9px] bg-[#1E322A] px-3 font-sans text-[10px] font-semibold tracking-[0.08em] text-white transition-colors hover:bg-[#346B55]"
                        >
                            DASHBOARD
                        </Link>
                    ) : (
                        <button type="button" onClick={onOpenLogin} aria-label="Open guest and staff login" className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#1E322A] text-white transition-colors hover:bg-[#346B55]">
                            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="10" cy="6.5" r="2.25" />
                                <path d="M5.75 15.5v-1.25A2.25 2.25 0 0 1 8 12h4a2.25 2.25 0 0 1 2.25 2.25v1.25z" />
                            </svg>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                        aria-expanded={menuOpen}
                        className="ml-2 flex h-9 w-9 items-center justify-center rounded-md text-[#1E322A] md:hidden"
                    >
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                            {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
                        </svg>
                    </button>
                </div>
            </div>
            {menuOpen && (
                <div className="absolute inset-x-0 top-full flex flex-col gap-1 border-t border-[#AE8A66]/15 bg-[#F1ECE0] px-6 py-4 shadow-lg md:hidden">
                    {navLinks.map(({ label, href }) => (
                        <a key={label} href={href} onClick={() => setMenuOpen(false)} className="rounded px-3 py-2.5 font-sans text-sm text-[#1E322A] hover:bg-white/60">
                            {label}
                        </a>
                    ))}
                    <Link href="/reservation" onClick={() => setMenuOpen(false)} className="rounded px-3 py-2.5 font-sans text-sm text-[#1E322A] hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">
                        Booking
                    </Link>
                </div>
            )}
        </nav>
    );
}

function HeroSection({ rooms = [] }) {
    const toInputDate = (date) => [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
    ].join('-');
    const initialArrival = new Date();
    initialArrival.setDate(initialArrival.getDate() + 1);
    const initialDeparture = new Date(initialArrival);
    initialDeparture.setDate(initialDeparture.getDate() + 2);

    const roomNames = rooms.length > 0 ? rooms.map((r) => r.name) : ['Lily Room', 'Daisy Room'];

    const [bookingData, setBookingData] = useState({
        checkIn: toInputDate(initialArrival),
        checkOut: toInputDate(initialDeparture),
        guests: '2',
        room: roomNames.includes('Lily Room') ? 'Lily Room' : roomNames[0],
    });
    const today = toInputDate(new Date());
    const formatDate = (value) => value
        ? new Date(`${value}T12:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Select date';
    const bookingUrl = `/reservation?check_in=${bookingData.checkIn}&check_out=${bookingData.checkOut}&guests=${bookingData.guests}&room=${encodeURIComponent(bookingData.room)}`;
    const updateBookingData = (event) => {
        const { name, value } = event.target;
        setBookingData((current) => {
            if (name === 'checkIn' && current.checkOut <= value) {
                const nextDeparture = new Date(`${value}T12:00:00`);
                nextDeparture.setDate(nextDeparture.getDate() + 1);
                return { ...current, checkIn: value, checkOut: toInputDate(nextDeparture) };
            }

            if (name === 'checkOut' && value <= current.checkIn) {
                const nextDeparture = new Date(`${current.checkIn}T12:00:00`);
                nextDeparture.setDate(nextDeparture.getDate() + 1);
                return { ...current, checkOut: toInputDate(nextDeparture) };
            }

            return { ...current, [name]: value };
        });
    };

    return (
        <section id="hero" className="relative min-h-[calc(100svh-76px)] overflow-hidden bg-[#1E322A]">
            <img
                src="/images/cottage/hero/cottage-facade-main.png"
                alt="The Boe Cottage in the Dieng highlands"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,35,36,0.25)_0%,rgba(13,35,36,0.32)_42%,rgba(13,35,36,0.58)_100%)]" />

            <div className="relative z-10 mx-auto flex min-h-[calc(100svh-76px)] flex-col items-center justify-center px-5 pb-[190px] pt-12 text-center sm:pb-[145px]">
                <h1 className="animate-title-reveal font-serif text-[clamp(1.25rem,5vw,2.75rem)] font-medium leading-[0.99] tracking-[-0.045em] text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.2)]">
                    Where volcanic mists meet
                    <br />
                    <em className="font-normal text-[#AE8A66]">silent pine</em>
                </h1>
                <p className="animate-fade-in-up animation-delay-200 mt-6 max-w-[620px] font-sans text-[15px] font-light leading-7 text-white/85 sm:text-base">
                    A quiet mountain cabin in the caldera of Dieng, 2,093 m above sea level.
                </p>
            </div>

            <div id="booking" className="absolute inset-x-0 bottom-[clamp(3rem,23vh,11rem)] z-20 mx-auto w-[calc(100%-2rem)] max-w-[790px] sm:w-[78%]">
                <div className="animate-booking-enter rounded-xl border border-white/50 bg-[#F1ECE0] px-4 py-4 shadow-[0_12px_36px_rgba(0,0,0,0.24)] sm:px-6 sm:py-5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 lg:grid-cols-[1fr_1fr_0.9fr_1.15fr_116px] lg:items-end lg:gap-4">
                        <div className="min-w-0">
                            <label htmlFor="booking-checkin" className="mb-1 block truncate px-1.5 font-sans text-[9px] font-semibold leading-3 tracking-[0.06em] text-[#747873]">ARRIVAL</label>
                            <div className="relative flex h-10 items-center gap-2 rounded-sm bg-white px-3">
                                <CalendarIcon />
                                <span className="pointer-events-none truncate font-sans text-[11px] font-semibold text-[#343935]">{formatDate(bookingData.checkIn)}</span>
                                <input id="booking-checkin" name="checkIn" aria-label="Arrival date" type="date" min={today} value={bookingData.checkIn} onChange={updateBookingData} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <label htmlFor="booking-checkout" className="mb-1 block truncate px-1.5 font-sans text-[9px] font-semibold leading-3 tracking-[0.06em] text-[#747873]">DEPARTURE</label>
                            <div className="relative flex h-10 items-center gap-2 rounded-sm bg-white px-3">
                                <CalendarIcon />
                                <span className="pointer-events-none truncate font-sans text-[11px] font-semibold text-[#343935]">{formatDate(bookingData.checkOut)}</span>
                                <input id="booking-checkout" name="checkOut" aria-label="Departure date" type="date" min={bookingData.checkIn || today} value={bookingData.checkOut} onChange={updateBookingData} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                            </div>
                        </div>
                        <div className="min-w-0">
                            <label htmlFor="booking-guests" className="mb-1 block truncate px-1.5 font-sans text-[9px] font-semibold leading-3 tracking-[0.06em] text-[#747873]">SOJOURNERS</label>
                            <div className="flex h-10 items-center gap-2 rounded-sm bg-white px-3">
                                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-[#AE8A66]" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="6.5" r="2.3" /><path d="M3.75 15.25v-1.1A2.15 2.15 0 0 1 5.9 12h4.2a2.15 2.15 0 0 1 2.15 2.15v1.1zM13.1 4.5a2.3 2.3 0 0 1 0 4.3m1.25 3.25a2.1 2.1 0 0 1 1.9 2.1v1.1h-2.1" /></svg>
                                <select id="booking-guests" name="guests" value={bookingData.guests} onChange={updateBookingData} className="min-w-0 flex-1 appearance-none bg-transparent font-sans text-[11px] font-semibold text-[#343935] outline-none focus-visible:ring-1 focus-visible:ring-[#346B55]">
                                    <option value="1">1 Guest</option>
                                    <option value="2">2 Guests</option>
                                    <option value="3">3 Guests</option>
                                    <option value="4">4 Guests</option>
                                </select>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <label htmlFor="booking-room" className="mb-1 block truncate px-1.5 font-sans text-[9px] font-semibold leading-3 tracking-[0.06em] text-[#747873]">CHAMBER SELECTION</label>
                            <div className="flex h-10 items-center gap-2 rounded-sm bg-white px-3">
                                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0 text-[#AE8A66]" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="m2.75 8 7.25-5.25L17.25 8v8.75H2.75zM7 16.75v-5.5h6v5.5" /></svg>
                                <select id="booking-room" name="room" value={bookingData.room} onChange={updateBookingData} className="min-w-0 flex-1 appearance-none bg-transparent font-sans text-[11px] font-semibold text-[#343935] outline-none focus-visible:ring-1 focus-visible:ring-[#346B55]">
                                    {roomNames.map((name) => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <Link href={bookingUrl} className="col-span-2 flex h-10 items-center justify-center rounded-sm bg-[#346B55] px-3 font-sans text-[9px] font-bold tracking-[0.09em] text-white transition-colors hover:bg-[#1E322A] lg:col-span-1">
                            BOOKING NOW
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function Welcome({ rooms = [], reviews = [] }) {
    const { auth } = usePage().props;
    const [loginOpen, setLoginOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('login') === '1' && !auth?.user) {
                setLoginOpen(true);
            }
        }
    }, [auth]);

    return (
        <>
            <Head>
                <title>The Boe Cottage Dieng - A Quiet Mountain Cabin</title>
                <meta name="description" content="Nikmati menginap di The Boe Cottage Dieng - cottage A-Frame bergaya Eropa dengan pemandangan pegunungan dan suasana yang tenang di dataran tinggi Dieng, Wonosobo." />
                <meta name="keywords" content="cottage dieng, penginapan dieng, the boe cottage, a-frame dieng, villa dieng, wisata dieng wonosobo" />
                <meta property="og:title" content="The Boe Cottage Dieng - A Quiet Mountain Cabin" />
                <meta property="og:description" content="Cottage A-Frame bergaya Eropa di jantung dataran tinggi Dieng. Pemandangan pegunungan, arsitektur premium, pengalaman menginap tak terlupakan." />
                <meta property="og:type" content="website" />
            </Head>

            <style>{`
                @media (max-width: 767px) {
                    #booking { bottom: max(2rem, 5vh); }
                }
            `}</style>

            <div style={{ minHeight: '100vh', backgroundColor: '#F1ECE0' }}>
                <Navbar onOpenLogin={() => setLoginOpen(true)} user={auth?.user} />
                <main>
                    <HeroSection rooms={rooms} />
                    <AboutSection />
                    <RoomSection rooms={rooms} />
                    <LocationSection />
                    <ReviewSection reviews={reviews} />
                </main>
                <Footer />
            </div>
            <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        </>
    );
}
