import { usePage } from '@inertiajs/react';
import { useLanguage } from '../Contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';

export default function LocationSection() {
    const { site } = usePage().props;
    const { t } = useLanguage();

    const rating = site?.maps?.rating || '5.0';
    const embedSrc =
        'https://www.google.com/maps?q=The+Boe+Cottage,+QRRP%2BPHM,+Sumberejo,+Batur,+Banjarnegara&hl=id&z=15&output=embed';
    const placeUrl =
        'https://www.google.com/maps/search/?api=1&query=The+Boe+Cottage,+QRRP%2BPHM,+Sumberejo,+Batur,+Banjarnegara';
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

                {/* Interactive Google Maps Embed Container with Floating Info Card Overlay */}
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

                        {/* Floating Info Card Overlay */}
                        <div className="pointer-events-auto absolute left-3 top-3 z-10 w-[calc(100%-1.5rem)] max-w-[270px] rounded-xl border border-[#1E322A]/12 bg-white/95 p-3 shadow-lg backdrop-blur-xs sm:left-5 sm:top-5 sm:w-auto sm:max-w-[300px] sm:p-4">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-serif text-base font-semibold leading-tight text-[#1E322A]">
                                        The Boe Cottage
                                    </p>
                                    <p className="mt-0.5 font-sans text-[11px] text-[#555A54]">
                                        QRRP+PHM • {t('location.shortAddress')}
                                    </p>
                                </div>
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F6F3EE] px-2.5 py-1 font-sans text-xs font-bold text-[#1E322A]">
                                    {rating} <span className="text-amber-500">★</span>
                                </span>
                            </div>

                            <div className="mt-2.5 flex items-center justify-between border-t border-[#E7E4DE] pt-2 font-sans text-[11px]">
                                <span className="text-[#666A64]">2.093 mdpl • Dieng</span>
                                <a
                                    href={placeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-[#346B55] underline underline-offset-2 hover:text-[#1E322A]"
                                >
                                    {t('location.openInMaps')} ↗
                                </a>
                            </div>
                        </div>
                    </div>
                </RevealOnScroll>

                {/* Primary Dark-Green Google Maps Directions Button */}
                <div className="mt-7 text-center">
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-[#1E322A] px-7 py-3.5 font-sans text-xs font-bold uppercase tracking-[0.1em] text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#346B55] hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55] sm:text-sm"
                    >
                        <svg
                            aria-hidden="true"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-[#D9B995]"
                        >
                            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                            <circle cx="12" cy="10" r="2.5" />
                        </svg>
                        <span>{t('location.directions')}</span>
                        <span aria-hidden="true">↗</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
