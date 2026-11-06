import RevealOnScroll from './RevealOnScroll';

const defaultReviews = [
    {
        id: 1,
        comment: 'Tiga malam tanpa sinyal ponsel adalah keputusan terbaik dalam lima tahun terakhir hidup saya.',
        guest_name: 'Arya & Nadya',
        rating: 5,
        created_at: '2026-09-12',
    },
    {
        id: 2,
        comment: 'Teh putih panas dan kabut tebal yang menyapu jendela saat fajar... sebuah jeda yang mengembalikan kewarasan kerja berbulan-bulan.',
        guest_name: 'Risma Ayu',
        rating: 5,
        created_at: '2026-10-02',
    },
    {
        id: 3,
        comment: 'Desain kayu jati dan batu alamnya begitu hangat di tengah udara dingin Dieng. Pelayanan yang sangat tenang dan berkelas.',
        guest_name: 'Dr. Hendra Kusuma',
        rating: 5,
        created_at: '2026-10-18',
    },
];

function formatReviewDate(dateString) {
    if (!dateString) return 'VERIFIED STAY';
    const parsed = new Date(dateString);
    if (Number.isNaN(parsed.getTime())) return String(dateString);
    return parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
}

export default function ReviewSection({ reviews = [] }) {
    const items = reviews.length > 0 ? reviews : defaultReviews;

    return (
        <section id="testimonials" className="bg-[#1E322A] px-6 py-20 sm:py-24">
            <div className="mx-auto max-w-7xl">
                <header className="mb-12 text-center sm:mb-16">
                    <h2 className="font-serif text-4xl font-normal leading-tight tracking-[-0.025em] text-[#F1ECE0] sm:text-5xl">
                        Impressions Left on Faded Paper
                    </h2>
                    <p className="mx-auto mt-4 max-w-xl font-sans text-sm leading-relaxed text-gray-300 sm:text-base">
                        Real stories and memories from guests who found peace in the embrace of nature
                    </p>
                </header>

                <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
                    {items.map((review, index) => {
                        const rating = Number(review.rating) || 5;
                        const quote = review.comment || review.quote;
                        const guest = review.guest_name || review.guest;
                        const dateLabel = review.date || formatReviewDate(review.created_at);

                        return (
                            <RevealOnScroll
                                as="article"
                                key={review.id || `${guest}-${index}`}
                                direction="up"
                                delay={index * 120}
                                className="flex h-full flex-col rounded-2xl bg-[#FAFAF8] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:p-7"
                            >
                                <div aria-label={`${rating} out of 5 stars`} className="mb-6 flex gap-1 text-2xl leading-none text-yellow-400">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} aria-hidden="true">{star <= rating ? '★' : '☆'}</span>
                                    ))}
                                </div>

                                <blockquote className="mb-8 font-serif text-lg italic leading-relaxed text-gray-800">
                                    “{quote}”
                                </blockquote>

                                <footer className="mt-auto flex items-center justify-between gap-3 border-t border-[#E7E4DE] pt-4 font-sans text-[10px] text-gray-500 sm:text-xs">
                                    <span className="font-semibold text-[#1E322A]">{guest}</span>
                                    <time className="shrink-0 text-[9px] font-medium tracking-[0.12em] sm:text-[10px]">
                                        {dateLabel}
                                    </time>
                                </footer>
                            </RevealOnScroll>
                        );
                    })}
                </div>

                <div className="text-center">
                    <a
                        href="#testimonials"
                        className="inline-flex items-center gap-6 rounded-full border border-[#F1ECE0]/70 px-8 py-3 font-sans text-xs font-semibold tracking-[0.12em] text-[#F1ECE0] transition-colors hover:bg-[#F1ECE0] hover:text-[#1E322A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F1ECE0]"
                    >
                        SEE ALL REVIEWS <span aria-hidden="true">→</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
