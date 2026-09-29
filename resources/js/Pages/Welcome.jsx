import { Head, Link } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';

/* ─────────────────────────── NAVBAR ─────────────────────────── */
function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const navLinks = [
        { label: 'About Us', href: '#about' },
        { label: 'Cottages', href: '#cottages' },
        { label: 'Amenities', href: '#amenities' },
        { label: 'Cek Booking', href: '/cek-booking', isInertia: true },
    ];

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                transition: 'all 0.4s ease',
                backgroundColor: scrolled ? 'rgba(253,251,247,0.93)' : 'transparent',
                backdropFilter: scrolled ? 'blur(16px)' : 'none',
                borderBottom: scrolled ? '1px solid rgba(181,143,91,0.15)' : '1px solid transparent',
                boxShadow: scrolled ? '0 2px 24px rgba(26,29,26,0.06)' : 'none',
            }}
        >
            <div style={{
                maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
                height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <a href="/" style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 700,
                    fontSize: '1.05rem', letterSpacing: '0.12em', textTransform: 'uppercase',
                    color: scrolled ? '#2D3A2F' : '#FDFBF7', textDecoration: 'none',
                    transition: 'color 0.4s ease', display: 'flex', flexDirection: 'column', lineHeight: 1.1,
                }}>
                    <span>The Boe Cottage</span>
                    <span style={{ fontSize: '0.6rem', letterSpacing: '0.22em', fontWeight: 400, opacity: 0.7 }}>
                        DIENG HIGHLANDS
                    </span>
                </a>

                <div className="desktop-nav" style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                }}>
                    {navLinks.map((link) =>
                        link.isInertia ? (
                            <Link key={link.label} href={link.href} style={{
                                padding: '8px 14px', fontSize: '0.875rem', fontWeight: 500,
                                color: scrolled ? '#1A1D1A' : 'rgba(253,251,247,0.9)',
                                textDecoration: 'none', borderRadius: '8px',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#B58F5B'; e.currentTarget.style.background = 'rgba(181,143,91,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = scrolled ? '#1A1D1A' : 'rgba(253,251,247,0.9)'; e.currentTarget.style.background = 'transparent'; }}
                            >{link.label}</Link>
                        ) : (
                            <a key={link.label} href={link.href} style={{
                                padding: '8px 14px', fontSize: '0.875rem', fontWeight: 500,
                                color: scrolled ? '#1A1D1A' : 'rgba(253,251,247,0.9)',
                                textDecoration: 'none', borderRadius: '8px',
                                transition: 'all 0.2s ease',
                            }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#B58F5B'; e.currentTarget.style.background = 'rgba(181,143,91,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = scrolled ? '#1A1D1A' : 'rgba(253,251,247,0.9)'; e.currentTarget.style.background = 'transparent'; }}
                            >{link.label}</a>
                        )
                    )}
                    <a href="#booking" id="nav-book-now-btn" style={{
                        marginLeft: '8px', padding: '10px 22px',
                        backgroundColor: '#2D3A2F', color: '#FDFBF7',
                        fontSize: '0.875rem', fontWeight: 600, borderRadius: '9999px',
                        textDecoration: 'none', transition: 'all 0.3s ease',
                        boxShadow: '0 4px 14px rgba(45,58,47,0.25)',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#B58F5B'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2D3A2F'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >Book Now</a>
                </div>

                <button id="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}
                    className="hamburger-btn" aria-label="Toggle navigation menu"
                    style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: scrolled ? '#1A1D1A' : '#FDFBF7' }}
                >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        {menuOpen
                            ? <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                            : <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
                    </svg>
                </button>
            </div>

            {menuOpen && (
                <div style={{
                    backgroundColor: '#FDFBF7', borderTop: '1px solid rgba(181,143,91,0.15)',
                    padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: '4px',
                }}>
                    {navLinks.map((link) =>
                        link.isInertia ? (
                            <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                                style={{ padding: '12px 16px', fontSize: '0.95rem', fontWeight: 500, color: '#1A1D1A', textDecoration: 'none', borderRadius: '8px' }}
                            >{link.label}</Link>
                        ) : (
                            <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                                style={{ padding: '12px 16px', fontSize: '0.95rem', fontWeight: 500, color: '#1A1D1A', textDecoration: 'none', borderRadius: '8px' }}
                            >{link.label}</a>
                        )
                    )}
                    <a href="#booking" onClick={() => setMenuOpen(false)} style={{
                        marginTop: '8px', padding: '12px 24px', backgroundColor: '#2D3A2F',
                        color: '#FDFBF7', fontSize: '0.95rem', fontWeight: 600,
                        borderRadius: '9999px', textDecoration: 'none', textAlign: 'center',
                    }}>Book Now</a>
                </div>
            )}
        </nav>
    );
}

/* ─────────────────────────── HERO ─────────────────────────── */
function HeroSection() {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const today = new Date().toISOString().split('T')[0];

    return (
        <section id="hero" style={{ minHeight: '100vh', padding: '16px', paddingTop: '88px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ position: 'relative', flex: 1, borderRadius: '24px', overflow: 'hidden', minHeight: '85vh' }}>
                <img
                    src="/images/cottage/hero/cottage-facade-main.jpg"
                    alt="The Boe Cottage Dieng – European A-Frame facade surrounded by mountain greenery"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(26,29,26,0.1) 0%, rgba(26,29,26,0.3) 50%, rgba(26,29,26,0.72) 100%)',
                }} />

                <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '32px 24px', paddingBottom: '180px', textAlign: 'center',
                }}>
                    <div className="animate-fade-in-up" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <span style={{ width: '40px', height: '1px', backgroundColor: '#B58F5B', display: 'block' }} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C89D66' }}>
                            Hidden Gem in Dieng Highlands
                        </span>
                        <span style={{ width: '40px', height: '1px', backgroundColor: '#B58F5B', display: 'block' }} />
                    </div>

                    <h1 className="animate-fade-in-up animation-delay-200" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 'clamp(2rem, 6vw, 4.5rem)',
                        fontWeight: 600, color: '#FDFBF7', lineHeight: 1.15,
                        marginBottom: '20px', maxWidth: '800px',
                        textShadow: '0 2px 32px rgba(26,29,26,0.45)',
                    }}>
                        Timeless European Charm
                        <br /><em>in the Clouds</em>
                    </h1>

                    <p className="animate-fade-in-up animation-delay-400" style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', color: 'rgba(253,251,247,0.8)',
                        lineHeight: 1.8, maxWidth: '520px', fontWeight: 300,
                    }}>
                        Nikmati ketenangan menginap dengan arsitektur A-Frame khas Eropa
                        dan pemandangan pegunungan Dieng yang asri.
                    </p>

                    <div className="animate-fade-in-up animation-delay-600" style={{ marginTop: '40px' }}>
                        <div style={{
                            width: '28px', height: '48px',
                            border: '1.5px solid rgba(253,251,247,0.4)',
                            borderRadius: '14px', display: 'flex', justifyContent: 'center', paddingTop: '8px', margin: '0 auto',
                        }}>
                            <div style={{
                                width: '4px', height: '10px', backgroundColor: '#C89D66',
                                borderRadius: '2px', animation: 'scrollDot 1.8s ease infinite',
                            }} />
                        </div>
                    </div>
                </div>

                {/* Floating Booking Widget */}
                <div id="booking" style={{
                    position: 'absolute', bottom: '-36px',
                    left: '50%', transform: 'translateX(-50%)',
                    width: 'calc(100% - 48px)', maxWidth: '900px',
                }}>
                    <div style={{
                        backgroundColor: 'rgba(253,251,247,0.97)',
                        backdropFilter: 'blur(24px)',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(26,29,26,0.18), 0 4px 16px rgba(26,29,26,0.08)',
                        padding: '24px 28px',
                        border: '1px solid rgba(181,143,91,0.2)',
                    }}>
                        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#B58F5B', marginBottom: '16px' }}>
                            Quick Booking
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
                            <div style={{ flex: '1 1 180px' }}>
                                <label htmlFor="booking-checkin" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#2D3A2F', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>Check-In</label>
                                <input id="booking-checkin" type="date" min={today} value={checkIn} onChange={e => setCheckIn(e.target.value)}
                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(181,143,91,0.3)', borderRadius: '10px', fontSize: '0.9rem', color: '#1A1D1A', backgroundColor: '#FDFBF7', outline: 'none', fontFamily: 'inherit' }}
                                    onFocus={e => e.target.style.borderColor = '#B58F5B'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(181,143,91,0.3)'}
                                />
                            </div>
                            <div style={{ flex: '1 1 180px' }}>
                                <label htmlFor="booking-checkout" style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#2D3A2F', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '6px' }}>Check-Out</label>
                                <input id="booking-checkout" type="date" min={checkIn || today} value={checkOut} onChange={e => setCheckOut(e.target.value)}
                                    style={{ width: '100%', padding: '12px 14px', border: '1.5px solid rgba(181,143,91,0.3)', borderRadius: '10px', fontSize: '0.9rem', color: '#1A1D1A', backgroundColor: '#FDFBF7', outline: 'none', fontFamily: 'inherit' }}
                                    onFocus={e => e.target.style.borderColor = '#B58F5B'}
                                    onBlur={e => e.target.style.borderColor = 'rgba(181,143,91,0.3)'}
                                />
                            </div>
                            <div style={{ flex: '0 0 auto' }}>
                                <Link href={`/cek-booking${checkIn ? `?check_in=${checkIn}&check_out=${checkOut}` : ''}`}
                                    id="booking-search-btn"
                                    style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                                        padding: '13px 26px', backgroundColor: '#2D3A2F', color: '#FDFBF7',
                                        fontSize: '0.9rem', fontWeight: 600, borderRadius: '10px',
                                        textDecoration: 'none', whiteSpace: 'nowrap',
                                        boxShadow: '0 4px 14px rgba(45,58,47,0.2)', transition: 'all 0.3s ease',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#B58F5B'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#2D3A2F'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                >
                                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="6.5" cy="6.5" r="5.5" /><path d="M10.5 10.5l3 3" />
                                    </svg>
                                    Cari Kamar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────── ABOUT ─────────────────────────── */
function AboutSection() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.querySelectorAll('.reveal-item').forEach((el, i) => {
                        el.style.opacity = '1';
                        el.style.transform = 'translateY(0)';
                        el.style.transitionDelay = `${i * 0.12}s`;
                    });
                }
            });
        }, { threshold: 0.15 });
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: <svg width="18" height="18" fill="none" stroke="#B58F5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
            title: 'Private Decking',
            desc: 'Teras pribadi eksklusif menghadap perbukitan hijau Dieng untuk pagi hari yang sempurna.',
        },
        {
            icon: <svg width="18" height="18" fill="none" stroke="#B58F5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /><path d="M2 12h20" /></svg>,
            title: 'Mountain View',
            desc: 'Pemandangan panoramik Gunung Prau dan dataran tinggi Dieng langsung dari kamar.',
        },
        {
            icon: <svg width="18" height="18" fill="none" stroke="#B58F5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
            title: 'Attic Room Experience',
            desc: 'Kamar mezzanine bergaya A-Frame dengan nuansa kabin Eropa yang hangat dan autentik.',
        },
    ];

    const revealStyle = { opacity: 0, transform: 'translateY(28px)', transition: 'opacity 0.65s ease, transform 0.65s ease' };

    return (
        <section id="about" ref={sectionRef} style={{ padding: '120px 24px 80px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>

                    {/* Left: Text */}
                    <div>
                        <div className="reveal-item" style={{ ...revealStyle, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <span style={{ width: '24px', height: '1.5px', backgroundColor: '#B58F5B', display: 'block' }} />
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#B58F5B' }}>
                                A Serene Mountain Retreat
                            </span>
                        </div>

                        <h2 className="reveal-item" style={{ ...revealStyle, fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 600, color: '#1A1D1A', lineHeight: 1.25, marginBottom: '24px' }}>
                            Designed to Connect You
                            <br /><em style={{ color: '#2D3A2F' }}>with Nature & Comfort</em>
                        </h2>

                        <p className="reveal-item" style={{ ...revealStyle, fontSize: '0.97rem', lineHeight: 1.85, color: '#4A4D4A', marginBottom: '16px' }}>
                            The Boe Cottage menghadirkan pengalaman menginap yang tak terlupakan di jantung dataran tinggi Dieng.
                            Terinspirasi dari arsitektur A-Frame Eropa, setiap sudut cottage dirancang dengan detail bata privat
                            dan material alami yang memancarkan kehangatan autentik.
                        </p>
                        <p className="reveal-item" style={{ ...revealStyle, fontSize: '0.97rem', lineHeight: 1.85, color: '#4A4D4A', marginBottom: '40px' }}>
                            Di sini, ketenangan bukan sekadar fasilitas—ini adalah esensi dari setiap momen. Dari kabut pagi
                            yang menyelimuti lembah hingga bintang malam yang membentang luas, The Boe Cottage adalah
                            sanctuary pribadi Anda di ketinggian.
                        </p>

                        <div className="reveal-item" style={{ ...revealStyle, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {features.map((feature) => (
                                <div key={feature.title} style={{
                                    display: 'flex', gap: '16px', alignItems: 'flex-start',
                                    padding: '16px 20px', borderRadius: '14px',
                                    border: '1px solid rgba(181,143,91,0.15)',
                                    backgroundColor: 'rgba(253,251,247,0.6)',
                                    transition: 'all 0.3s ease', cursor: 'default',
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(181,143,91,0.4)'; e.currentTarget.style.backgroundColor = 'rgba(181,143,91,0.05)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(181,143,91,0.15)'; e.currentTarget.style.backgroundColor = 'rgba(253,251,247,0.6)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                                >
                                    <div style={{ width: '40px', height: '40px', backgroundColor: 'rgba(181,143,91,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1D1A', marginBottom: '4px' }}>{feature.title}</p>
                                        <p style={{ fontSize: '0.84rem', color: '#6A6D6A', lineHeight: 1.6 }}>{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Image */}
                    <div className="reveal-item" style={{ ...revealStyle, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '24px', left: '24px', right: '-16px', bottom: '-16px', backgroundColor: 'rgba(45,58,47,0.08)', borderRadius: '24px', zIndex: 0 }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <img
                                src="/images/cottage/hero/cottage-facade-side.jpg"
                                alt="The Boe Cottage – Side view of the European A-Frame architecture"
                                style={{ width: '100%', height: '500px', objectFit: 'cover', borderRadius: '20px', boxShadow: '0 24px 64px rgba(26,29,26,0.18)' }}
                            />
                            <div style={{ position: 'absolute', bottom: '24px', left: '-24px', backgroundColor: '#2D3A2F', color: '#FDFBF7', padding: '16px 22px', borderRadius: '16px', boxShadow: '0 12px 32px rgba(45,58,47,0.3)' }}>
                                <p style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>4.9 <span style={{ fontSize: '1rem' }}>★</span></p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.7, letterSpacing: '0.08em', marginTop: '2px' }}>GUEST RATING</p>
                            </div>
                            <div style={{ position: 'absolute', top: '24px', right: '-16px', backgroundColor: '#B58F5B', color: '#FDFBF7', padding: '10px 16px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(181,143,91,0.35)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.85 }}>Est.</p>
                                <p style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>2023</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────── FOOTER ─────────────────────────── */
function Footer() {
    const links = ['About Us', 'Cottages', 'Amenities', 'Cek Booking'];
    return (
        <footer style={{ backgroundColor: '#2D3A2F', color: '#FDFBF7', padding: '56px 24px 32px', marginTop: '80px' }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '32px', marginBottom: '40px' }}>
                    <div style={{ maxWidth: '280px' }}>
                        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>The Boe Cottage</p>
                        <p style={{ fontSize: '0.85rem', opacity: 0.65, lineHeight: 1.75 }}>
                            Cottage A-Frame bergaya Eropa di jantung dataran tinggi Dieng, Wonosobo, Jawa Tengah.
                        </p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C89D66', marginBottom: '16px' }}>Navigasi</p>
                        {links.map(link => (
                            <a key={link} href={link === 'Cek Booking' ? '/cek-booking' : `#${link.toLowerCase().replace(' ', '-')}`}
                                style={{ display: 'block', fontSize: '0.875rem', color: 'rgba(253,251,247,0.65)', textDecoration: 'none', marginBottom: '10px', transition: 'color 0.2s ease' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#C89D66'}
                                onMouseLeave={e => e.currentTarget.style.color = 'rgba(253,251,247,0.65)'}
                            >{link}</a>
                        ))}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C89D66', marginBottom: '16px' }}>Kontak</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '8px' }}>📍 Dieng, Wonosobo, Jawa Tengah</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7, marginBottom: '8px' }}>📞 +62 812-XXXX-XXXX</p>
                        <p style={{ fontSize: '0.875rem', opacity: 0.7 }}>✉️ hello@theboecottage.id</p>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(253,251,247,0.1)', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.78rem', opacity: 0.45 }}>© 2024 The Boe Cottage Dieng. All rights reserved.</p>
                    <p style={{ fontSize: '0.78rem', opacity: 0.45 }}>Crafted with ♥ in Dieng Highlands</p>
                </div>
            </div>
        </footer>
    );
}

/* ─────────────────────────── PAGE ─────────────────────────── */
export default function Welcome() {
    return (
        <>
            <Head>
                <title>The Boe Cottage Dieng – Timeless European Charm in the Clouds</title>
                <meta name="description" content="Nikmati menginap di The Boe Cottage Dieng – cottage A-Frame bergaya Eropa dengan pemandangan pegunungan dan suasana yang tenang di dataran tinggi Dieng, Wonosobo." />
                <meta name="keywords" content="cottage dieng, penginapan dieng, the boe cottage, a-frame dieng, villa dieng, wisata dieng wonosobo" />
                <meta property="og:title" content="The Boe Cottage Dieng – Timeless European Charm in the Clouds" />
                <meta property="og:description" content="Cottage A-Frame bergaya Eropa di jantung dataran tinggi Dieng. Pemandangan pegunungan, arsitektur premium, pengalaman menginap tak terlupakan." />
                <meta property="og:type" content="website" />
            </Head>

            <style>{`
                @keyframes scrollDot {
                    0%   { transform: translateY(0);   opacity: 1;   }
                    60%  { transform: translateY(12px); opacity: 0.3; }
                    100% { transform: translateY(0);   opacity: 1;   }
                }
                @media (max-width: 768px) {
                    .desktop-nav  { display: none !important; }
                    .hamburger-btn { display: flex !important; }
                }
            `}</style>

            <div style={{ minHeight: '100vh', backgroundColor: '#FDFBF7' }}>
                <Navbar />
                <main>
                    <HeroSection />
                    <AboutSection />
                </main>
                <Footer />
            </div>
        </>
    );
}
