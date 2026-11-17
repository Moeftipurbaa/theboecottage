import { useLanguage } from '../Contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';

export default function LocationSection() {
    const { t } = useLanguage();

    const embedSrc =
        'https://www.google.com/maps?q=The+Boe+Cottage,+QRRP%2BPHM,+Sumberejo,+Batur,+Banjarnegara&hl=id&z=15&output=embed';
    const directionsUrl =
        'https://www.google.com/maps/dir/?api=1&destination=The+Boe+Cottage,+QRRP%2BPHM,+Sumberejo,+Batur,+Banjarnegara';

    return (
        <section
            id="location"
            className="relative isolate overflow-hidden bg-[#F1ECE0] px-5 py-16 sm:px-8 sm:py-20 md:px-14"
        >
            <img
                src="/images/cottage/decor/leaf.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute right-6 top-6 w-28 -scale-x-100 opacity-50 md:w-44"
            />
            <img
                src="/images/cottage/decor/leaf.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute bottom-6 left-6 w-28 opacity-50 md:w-44"
            />

            <div className="relative z-10 mx-auto max-w-6xl">
                <RevealOnScroll className="mx-auto max-w-3xl text-center">
                    <p className="mb-2 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#AE8A66]">
                        {t('location.eyebrow')}
                    </p>
                    <h2 className="font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#1E322A] sm:text-4xl lg:text-5xl">
                        {t('location.titleStart')}{' '}
                        <span className="text-[#346B55]">{t('location.titleAccent')}</span>
                    </h2>
                    <p className="mx-auto mt-3.5 max-w-2xl font-sans text-xs leading-relaxed text-[#454943] sm:text-sm">
                        {t('location.address')}
                    </p>
                </RevealOnScroll>

                {/* Unobstructed Interactive Google Maps Embed */}
                <RevealOnScroll
                    direction="up"
                    delay={100}
                    className="relative mt-9 overflow-hidden rounded-2xl border border-[#1E322A]/15 bg-[#F6F3EE] shadow-[0_16px_42px_rgba(30,50,42,0.14)]"
                >
                    <div className="relative h-[360px] w-full sm:h-[430px] md:h-[480px]">
                        <iframe
                            title={t('location.mapTitle')}
                            src={embedSrc}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="h-full w-full border-0"
                            allowFullScreen
                        />
                    </div>
                </RevealOnScroll>

                {/* Primary Dark-Green Google Maps Directions Button */}
                <div className="mt-7 text-center">
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-[#1E322A] px-7 py-3.5 text-center font-sans text-xs font-bold uppercase tracking-[0.1em] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#346B55] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55] sm:text-sm"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 shrink-0 text-[#D9B995]"
                        >
                            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        <span>{t('location.directions')}</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
