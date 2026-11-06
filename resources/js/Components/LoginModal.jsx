import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

function FieldIcon({ type }) {
    const paths = {
        email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></>,
        lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" /></>,
        eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
        eyeOff: <><path d="m3 3 18 18M10.6 6.2A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a16 16 0 0 1-3.1 3.6M6.2 6.2C3.5 7.8 2 12 2 12s3.5 6 10 6a10.9 10.9 0 0 0 3.1-.5" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
    };

    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            {paths[type]}
        </svg>
    );
}

function BrandMark() {
    return (
        <div aria-label="The Boe Cottage" className="mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-full bg-[#F8F1E8] text-[#AE8A66]">
            <span className="font-serif text-[6px] italic leading-[6px]">The</span>
            <span className="font-serif text-[7px] leading-[8px] tracking-[0.05em]">BOE</span>
            <span className="font-serif text-[6px] leading-[6px] tracking-[0.02em]">COTTAGE</span>
        </div>
    );
}

export default function LoginModal({ isOpen, onClose }) {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '', remember: false });
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);

    function updateFormData(event) {
        const { name, value, type, checked } = event.target;
        setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();
        setErrorMessage('');
        setLoading(true);

        try {
            const response = await window.axios.post('/login', formData);
            onClose();
            router.visit(response.data?.redirect || '/admin-dashboard');
        } catch (error) {
            const msg = error.response?.data?.errors?.email?.[0]
                || error.response?.data?.message
                || 'Invalid credentials. Please try again.';
            setErrorMessage(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleUnsupportedAction(action) {
        setErrorMessage(`${action} is managed by the Lead Desk Administrator.`);
    }

    useEffect(() => {
        if (!isOpen) return undefined;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="login-modal-title"
                className="relative my-auto w-full max-w-[390px] overflow-hidden rounded-[3px] border border-[#E7E4DE] bg-[#FBF9F4] shadow-[0_24px_80px_rgba(0,0,0,0.24)]"
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close login dialog"
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[#666A64] transition-colors hover:bg-[#F1ECE0] hover:text-[#1E322A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]"
                >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="h-4 w-4">
                        <path d="m6 6 12 12M18 6 6 18" />
                    </svg>
                </button>

                <div className="px-7 pb-7 pt-9 sm:px-9 sm:pt-10">
                    <BrandMark />

                    <div className="mt-5">
                        <header className="mb-6 text-center">
                            <h2 id="login-modal-title" className="font-serif text-[21px] font-normal leading-tight text-[#1E322A]">
                                Hello! Ready to Manage Your Stay?
                            </h2>
                            <p className="mx-auto mt-2 max-w-[260px] font-sans text-xs leading-relaxed text-[#666A64]">
                                Sign in to access the staff ledger, manage reservations, and configure cottage availability.
                            </p>
                        </header>

                        {errorMessage && (
                            <div role="alert" className="mb-4 border border-[#AE5535]/40 bg-[#FADBD1]/50 px-3 py-2 font-sans text-[11px] text-[#8E3D24]">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="guest-email" className="mb-1 block font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-[#303832]">
                                    Email Address
                                </label>
                                <div className="flex h-10 items-center gap-2.5 bg-[#F3F2ED] px-3 text-[#858A83]">
                                    <FieldIcon type="email" />
                                    <input required id="guest-email" name="email" type="email" value={formData.email} onChange={updateFormData} autoComplete="email" placeholder="admin@theboecottage.com" className="h-full min-w-0 flex-1 bg-transparent font-sans text-xs text-[#303832] outline-none placeholder:text-[#858A83]" />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between gap-3">
                                    <label htmlFor="guest-password" className="font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-[#303832]">
                                        Password
                                    </label>
                                    <button type="button" onClick={() => handleUnsupportedAction('Password recovery')} className="font-sans text-[9px] text-[#AE6548] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">
                                        Forgot Password?
                                    </button>
                                </div>
                                <div className="flex h-10 items-center gap-2.5 bg-[#F3F2ED] px-3 text-[#858A83]">
                                    <FieldIcon type="lock" />
                                    <input required id="guest-password" name="password" value={formData.password} onChange={updateFormData} type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••••" className="h-full min-w-0 flex-1 bg-transparent font-sans text-xs text-[#303832] outline-none placeholder:text-[#B2B4AE]" />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="flex h-7 w-7 items-center justify-center transition-colors hover:text-[#1E322A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#346B55]">
                                        <FieldIcon type={showPassword ? 'eyeOff' : 'eye'} />
                                    </button>
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-2 font-sans text-[11px] leading-5 text-[#666A64]">
                                <input name="remember" type="checkbox" checked={formData.remember} onChange={updateFormData} className="mt-1 h-3 w-3 accent-[#1E322A]" />
                                Remember on this terminal
                            </label>

                            <button type="submit" disabled={loading} className="flex h-10 w-full items-center justify-center gap-2 bg-[#071711] font-sans text-[10px] font-semibold tracking-[0.1em] text-white transition-colors hover:bg-[#1E322A] disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346B55]">
                                {loading ? 'SIGNING IN...' : 'SIGN IN'} <span aria-hidden="true">→</span>
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
