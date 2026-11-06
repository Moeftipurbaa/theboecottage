import RevealOnScroll from './RevealOnScroll';

export default function AboutSection() {
    return (
        <section id="about" className="relative isolate overflow-hidden bg-[#F1ECE0] px-8 py-24 md:px-16">
            <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-16 w-64 max-w-[45vw] bg-[#346B55]" />
            <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-20 w-[40%] bg-[#1E322A]" />

            <div className="relative z-10 mx-auto max-w-7xl">
                <h2 className="mb-12 font-serif text-4xl font-normal leading-tight tracking-[-0.025em] text-[#1E322A] sm:mb-16 sm:text-5xl">
                    Building a Home for a Tired Mind
                </h2>

                <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-[4.5fr_7.5fr] lg:gap-20">
                    <div className="min-w-0">
                        <RevealOnScroll direction="right" className="w-full">
                            <img
                                src="/images/cottage/about/about-portrait.jpg"
                                alt="The Boe Cottage framed by a tall plant"
                                className="h-auto w-[85%] object-cover lg:w-[75%]"
                                loading="eager"
                            />
                        </RevealOnScroll>
                    </div>

                    <div className="min-w-0">
                        <div className="grid grid-cols-1 gap-8 font-sans text-sm leading-[1.55] text-gray-700 sm:grid-cols-2">
                            <RevealOnScroll as="p" direction="up" delay={80}>
                                The Boe Cottage was not built to conquer nature, but to submit to it. Each piece of recycled ironwood and teak was assembled by local artisans, blending harmoniously with the mountainous landscape.
                            </RevealOnScroll>
                            <RevealOnScroll as="p" direction="up" delay={180}>
                                Every corner is designed to slow down time. Enjoy the warmth of a morning cup of coffee from behind the window, while watching the fog slowly descend and envelop the silence.
                            </RevealOnScroll>
                        </div>

                        <h3 className="my-10 font-serif text-3xl font-normal leading-[1.15] tracking-[-0.02em] text-[#346B55]">
                            A blend of modern yet warm design that harmonizes with the serene mountain light
                        </h3>

                        <RevealOnScroll direction="left">
                            <img
                                src="/images/cottage/about/about-landscape.jpg"
                                alt="The cottage glass house surrounded by the mountain landscape"
                                className="block h-auto w-full object-cover"
                                loading="eager"
                            />
                        </RevealOnScroll>
                    </div>
                </div>
            </div>
        </section>
    );
}
