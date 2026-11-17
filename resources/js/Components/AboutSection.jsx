import { useLanguage } from '../Contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';

export default function AboutSection() {
    const { t } = useLanguage();
    const stats = t('about.stats');

    return (
        <section id="about" className="relative isolate overflow-hidden bg-[#F1ECE0] px-6 py-20 sm:px-10 md:px-16 md:py-24">
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-16 w-48 max-w-[45vw] bg-[#346B55] sm:w-64" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-16 w-[40%] bg-[#1E322A] sm:h-20" />

            <div className="relative z-10 mx-auto max-w-7xl">
                <div className="mb-10 max-w-3xl sm:mb-14">
                    <p className="mb-2.5 font-sans text-[10px] font-bold uppercase tracking-[0.22em] text-[#AE8A66]">
                        {t('about.eyebrow')}
                    </p>
                    <h2 className="font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#1E322A] sm:text-4xl lg:text-5xl">
                        {t('about.title')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[4.5fr_7.5fr] lg:gap-16">
                    <div className="min-w-0">
                        <RevealOnScroll direction="right" className="w-full">
                            <div className="group relative mx-auto w-full max-w-[420px] overflow-hidden rounded-xl shadow-[0_14px_34px_rgba(30,50,42,0.14)] md:mx-0 md:w-[90%] lg:w-[82%]">
                                <img
                                    src="/images/cottage/about/about-portrait.jpg"
                                    alt="The Boe Cottage framed by lush Dieng greenery"
                                    className="h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    loading="eager"
                                />
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1E322A]/45 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                            </div>
                        </RevealOnScroll>

                        {Array.isArray(stats) && stats.length > 0 && (
                            <div className="mt-6 grid max-w-[420px] grid-cols-3 gap-3 mx-auto md:mx-0 md:w-[90%] lg:w-[82%]">
                                {stats.map((stat, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-lg border border-[#1E322A]/10 bg-[#F6F3EE] px-3 py-3 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[#AE8A66]/60 hover:shadow-sm"
                                    >
                                        <p className="font-serif text-xl font-semibold text-[#1E322A] sm:text-2xl">
                                            {stat.value}
                                        </p>
                                        <p className="mt-0.5 font-sans text-[10px] font-medium uppercase tracking-[0.08em] text-[#666A64]">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <div className="grid grid-cols-1 gap-6 font-sans text-sm leading-[1.7] text-[#3F443F] sm:grid-cols-2 sm:gap-8">
                            <RevealOnScroll
                                as="p"
                                direction="up"
                                delay={80}
                                className="rounded-xl border border-transparent bg-[#F6F3EE]/60 p-4 transition-all duration-300 hover:border-[#AE8A66]/35 hover:bg-[#F6F3EE] sm:bg-transparent sm:p-0 sm:hover:border-transparent sm:hover:bg-transparent"
                            >
                                {t('about.p1')}
                            </RevealOnScroll>
                            <RevealOnScroll
                                as="p"
                                direction="up"
                                delay={180}
                                className="rounded-xl border border-transparent bg-[#F6F3EE]/60 p-4 transition-all duration-300 hover:border-[#AE8A66]/35 hover:bg-[#F6F3EE] sm:bg-transparent sm:p-0 sm:hover:border-transparent sm:hover:bg-transparent"
                            >
                                {t('about.p2')}
                            </RevealOnScroll>
                        </div>

                        <blockquote className="my-8 border-l-2 border-[#AE8A66] pl-5 font-serif text-2xl font-normal italic leading-[1.2] tracking-[-0.02em] text-[#346B55] sm:my-10 sm:text-3xl">
                            “{t('about.quote')}”
                        </blockquote>

                        <RevealOnScroll direction="left">
                            <div className="group relative overflow-hidden rounded-xl shadow-[0_14px_36px_rgba(30,50,42,0.14)]">
                                <img
                                    src="/images/cottage/about/about-landscape.jpg"
                                    alt="The cottage glass house surrounded by the mountain landscape"
                                    className="block h-auto w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                    loading="eager"
                                />
                            </div>
                        </RevealOnScroll>
                    </div>
                </div>
            </div>
        </section>
    );
}
