import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { SocialMediaLinks, useLanguage } from '../Contexts/LanguageContext';
import RevealOnScroll from './RevealOnScroll';

function ContactIcon({ type }) {
    const paths = {
        email: (
            <>
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m4 7 8 6 8-6" />
            </>
        ),
        phone: (
            <path d="M7 3H5a2 2 0 0 0-2 2c0 8.837 7.163 16 16 16a2 2 0 0 0 2-2v-2l-5-2-2 3a14 14 0 0 1-6-6l3-2-2-5H7z" />
        ),
        location: (
            <>
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
            </>
        ),
    };

    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 shrink-0 text-[#648C7B]"
        >
            {paths[type]}
        </svg>
    );
}

export default function Footer() {
    const { site } = usePage().props;
    const { t } = useLanguage();
    const [reviewForm, setReviewForm] = useState({ guest_name: '', rating: 0, review: '' });
    const [submitting, setSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    async function handleReviewSubmit(event) {
        event.preventDefault();
        if (reviewForm.rating === 0 || !reviewForm.review.trim()) {
            setStatusMessage(t('footer.ratingRequired'));
            return;
        }

        setSubmitting(true);
        setStatusMessage('');

        try {
            await window.axios.post('/api/reviews', {
                guest_name: reviewForm.guest_name.trim() || 'Verified Guest',
                rating: reviewForm.rating,
                comment: reviewForm.review.trim(),
            });
            setReviewForm({ guest_name: '', rating: 0, review: '' });
            setStatusMessage(t('footer.thanks'));
            router.reload({ only: ['reviews'] });
        } catch (error) {
            setStatusMessage(error.response?.data?.message || t('footer.failed'));
        } finally {
            setSubmitting(false);
        }
    }

    function handleUnavailablePolicy(event) {
        event.preventDefault();
        console.info('Legal policy content is not available yet.');
    }

    return (
        <footer>
            <section className="bg-[#1E322A] px-6 py-20 text-center sm:py-24">
                <RevealOnScroll className="mx-auto max-w-3xl" direction="scale">
                    <h2 className="font-serif text-3xl font-normal leading-tight tracking-[-0.025em] text-[#F1ECE0] sm:text-5xl">
                        {t('footer.ctaTitle')}
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-[#D2D9D2] sm:text-base">
                        {t('footer.ctaText')}
                    </p>
                    <a
                        href="#cottages"
                        className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-[#F6F3EE] px-8 py-3 font-sans text-[10px] font-semibold tracking-[0.14em] text-[#1E322A] transition-colors hover:bg-[#E8E1D3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F1ECE0]"
                    >
                        {t('footer.ctaButton')}
                    </a>
                </RevealOnScroll>
            </section>

            <div className="bg-[#F1ECE0] px-6 py-12 text-[#1E322A] sm:px-10 sm:py-16">
                <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:gap-16">
                    <RevealOnScroll delay={0}>
                        <h2 className="font-serif text-2xl font-normal text-[#1E322A]">The Boe Cottage</h2>
                        <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-[#666A64]">
                            {t('footer.tagline')}
                        </p>

                        <div className="mt-6">
                            <p className="mb-2.5 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-[#35423A]">
                                {t('common.followUs')}
                            </p>
                            <SocialMediaLinks
                                instagramUrl={site?.social?.instagram}
                                tiktokUrl={site?.social?.tiktok}
                                variant="light"
                            />
                        </div>
                    </RevealOnScroll>

                    <RevealOnScroll delay={100}>
                        <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#35423A]">
                            {t('footer.contact')}
                        </h3>
                        <ul className="mt-4 space-y-3 font-sans text-sm text-[#666A64]">
                            <li className="flex items-center gap-3">
                                <ContactIcon type="email" />
                                <a
                                    className="underline decoration-[#B7B8B1] underline-offset-4 hover:text-[#346B55]"
                                    href="mailto:theboecottage@gmail.com"
                                >
                                    theboecottage@gmail.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <ContactIcon type="phone" />
                                <a className="hover:text-[#346B55]" href="tel:+6288887879999">
                                    +62 888-8787-9999
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <ContactIcon type="location" />
                                <span>Sumberejo, Batur, Banjarnegara (Dieng)</span>
                            </li>
                        </ul>
                    </RevealOnScroll>

                    <RevealOnScroll delay={200}>
                        <h3 className="font-sans text-xs font-bold uppercase tracking-[0.14em] text-[#35423A]">
                            {t('footer.writeReview')}
                        </h3>
                        <p className="mt-2 font-sans text-xs text-[#777B75]">{t('footer.shareExperience')}</p>

                        <form className="mt-3 space-y-2.5" onSubmit={handleReviewSubmit}>
                            <div className="mb-1 flex items-center gap-1" role="group" aria-label={t('footer.ratingAria')}>
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                                        aria-label={`${value} ${t('footer.star')}`}
                                        aria-pressed={reviewForm.rating === value}
                                        className={`text-2xl leading-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55] ${
                                            reviewForm.rating >= value ? 'text-[#AE8A66]' : 'text-[#35423A]'
                                        }`}
                                    >
                                        {reviewForm.rating >= value ? '★' : '☆'}
                                    </button>
                                ))}
                            </div>
                            <input
                                type="text"
                                value={reviewForm.guest_name}
                                onChange={(event) =>
                                    setReviewForm((current) => ({ ...current, guest_name: event.target.value }))
                                }
                                placeholder={t('footer.namePlaceholder')}
                                className="w-full rounded-md border border-[#C9C5BC] bg-white px-3 py-1.5 font-sans text-xs text-[#1E322A] placeholder:text-[#92938D] focus:border-[#346B55] focus:outline-none focus:ring-1 focus:ring-[#346B55]"
                            />
                            <label className="sr-only" htmlFor="guest-review">
                                {t('footer.reviewLabel')}
                            </label>
                            <textarea
                                id="guest-review"
                                required
                                rows="3"
                                value={reviewForm.review}
                                onChange={(event) =>
                                    setReviewForm((current) => ({ ...current, review: event.target.value }))
                                }
                                placeholder={t('footer.reviewPlaceholder')}
                                className="w-full resize-y rounded-md border border-[#C9C5BC] bg-white px-3 py-2 font-sans text-xs text-[#1E322A] placeholder:text-[#92938D] focus:border-[#346B55] focus:outline-none focus:ring-1 focus:ring-[#346B55]"
                            />
                            {statusMessage && (
                                <p className="font-sans text-[11px] font-medium text-[#346B55]">{statusMessage}</p>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="mt-2 min-h-10 w-full rounded-md bg-[#1E322A] px-4 py-2 font-sans text-xs font-semibold tracking-[0.1em] text-white transition-colors hover:bg-[#346B55] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]"
                            >
                                {submitting ? t('footer.submitting') : t('footer.submit')}
                            </button>
                        </form>
                    </RevealOnScroll>
                </div>

                <div className="mx-auto mt-12 flex max-w-7xl flex-col gap-4 border-t border-[#D9D4CA] pt-6 font-sans text-[9px] tracking-[0.1em] text-[#777B75] sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 The Boe Cottage. {t('footer.rights')}</p>
                    <nav aria-label="Legal" className="flex flex-wrap gap-x-2 gap-y-1 uppercase">
                        <a className="hover:text-[#346B55]" href="#privacy-policy" onClick={handleUnavailablePolicy}>
                            {t('footer.privacy')}
                        </a>
                        <span aria-hidden="true">•</span>
                        <a className="hover:text-[#346B55]" href="#terms-and-conditions" onClick={handleUnavailablePolicy}>
                            {t('footer.terms')}
                        </a>
                        <span aria-hidden="true">•</span>
                        <a className="hover:text-[#346B55]" href="#reservation-policy" onClick={handleUnavailablePolicy}>
                            {t('footer.reservationPolicy')}
                        </a>
                    </nav>
                </div>
            </div>
        </footer>
    );
}
