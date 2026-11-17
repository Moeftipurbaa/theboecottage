import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import translations from '../i18n/translations';

const STORAGE_KEY = 'boe_lang';
const SUPPORTED_LANGS = ['id', 'en'];

const LanguageContext = createContext(null);

function resolveNested(object, path) {
    if (!object || !path) return undefined;
    return String(path)
        .split('.')
        .reduce((cursor, segment) => (cursor !== null && cursor !== undefined ? cursor[segment] : undefined), object);
}

function interpolate(value, params) {
    if (typeof value !== 'string' || !params) return value;
    return value.replace(/\{(\w+)\}/g, (_, key) => (params[key] !== undefined ? String(params[key]) : `{${key}}`));
}

export function LanguageProvider({ children, defaultLang = 'id' }) {
    const [lang, setLangState] = useState(() => {
        if (typeof window === 'undefined') return defaultLang;
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && SUPPORTED_LANGS.includes(stored)) {
                return stored;
            }
        } catch {
            // Ignore localStorage read errors in restricted environments
        }
        return defaultLang;
    });

    const setLang = useCallback((nextLang) => {
        const normalized = SUPPORTED_LANGS.includes(nextLang) ? nextLang : 'id';
        setLangState(normalized);
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.setItem(STORAGE_KEY, normalized);
            } catch {
                // Ignore write errors
            }
            document.documentElement.lang = normalized;
        }
    }, []);

    const toggleLang = useCallback(() => {
        setLang(lang === 'id' ? 'en' : 'id');
    }, [lang, setLang]);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
    }, [lang]);

    const t = useCallback(
        (key, params) => {
            const primary = resolveNested(translations[lang], key);
            const fallback = resolveNested(translations.en, key);
            const resolved = primary !== undefined ? primary : fallback !== undefined ? fallback : key;
            return interpolate(resolved, params);
        },
        [lang]
    );

    const formatPrice = useCallback(
        (amount) => {
            const numeric = Math.round(Number(String(amount ?? 0).replace(/[^\d.-]/g, '')) || 0);
            if (lang === 'id') {
                return `Rp ${numeric.toLocaleString('id-ID')}`;
            }
            return `IDR ${numeric.toLocaleString('en-US')}`;
        },
        [lang]
    );

    const value = useMemo(
        () => ({
            lang,
            isId: lang === 'id',
            isEn: lang === 'en',
            setLang,
            toggleLang,
            t,
            formatPrice,
        }),
        [lang, setLang, toggleLang, t, formatPrice]
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context) {
        return context;
    }

    // Safe fallback if a component renders outside LanguageProvider
    return {
        lang: 'id',
        isId: true,
        isEn: false,
        setLang: () => {},
        toggleLang: () => {},
        t: (key, params) => {
            const val = resolveNested(translations.id, key) ?? resolveNested(translations.en, key) ?? key;
            return interpolate(val, params);
        },
        formatPrice: (amount) => {
            const numeric = Math.round(Number(String(amount ?? 0).replace(/[^\d.-]/g, '')) || 0);
            return `Rp ${numeric.toLocaleString('id-ID')}`;
        },
    };
}

/**
 * Elegant ID | EN Language Switcher Pill for Desktop & Mobile Navbars.
 */
export function LanguageSwitch({ className = '' }) {
    const { lang, setLang, t } = useLanguage();

    return (
        <div
            role="group"
            aria-label={t('common.language')}
            className={`inline-flex items-center rounded-full border border-[#AE8A66]/35 bg-white/80 p-0.5 font-sans text-[10px] font-bold tracking-[0.08em] shadow-xs backdrop-blur-xs ${className}`}
        >
            <button
                type="button"
                onClick={() => setLang('id')}
                aria-pressed={lang === 'id'}
                className={`rounded-full px-2.5 py-1 transition-all duration-200 ${
                    lang === 'id'
                        ? 'bg-[#1E322A] text-white shadow-xs'
                        : 'text-[#424641] hover:text-[#AE8A66]'
                }`}
            >
                ID
            </button>
            <span aria-hidden="true" className="px-0.5 text-[#AE8A66]/50">
                |
            </span>
            <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`rounded-full px-2.5 py-1 transition-all duration-200 ${
                    lang === 'en'
                        ? 'bg-[#1E322A] text-white shadow-xs'
                        : 'text-[#424641] hover:text-[#AE8A66]'
                }`}
            >
                EN
            </button>
        </div>
    );
}

/**
 * Official Social Media Icon Links (Instagram & TikTok) with smooth hover animations.
 */
export function SocialMediaLinks({ instagramUrl, tiktokUrl, variant = 'light', className = '' }) {
    const igHref = instagramUrl || 'https://www.instagram.com/theboecottage/';
    const ttHref = tiktokUrl || 'https://www.tiktok.com/@theboecottage';

    const baseButtonClass =
        variant === 'dark'
            ? 'border-white/20 bg-white/10 text-[#F1ECE0] hover:border-[#AE8A66] hover:bg-[#AE8A66] hover:text-white'
            : 'border-[#1E322A]/15 bg-white/75 text-[#1E322A] hover:border-[#1E322A] hover:bg-[#1E322A] hover:text-white';

    return (
        <div className={`inline-flex items-center gap-2.5 ${className}`}>
            <a
                href={igHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram The Boe Cottage"
                title="Instagram @theboecottage"
                className={`group inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${baseButtonClass}`}
            >
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                >
                    <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="5" />
                    <circle cx="12" cy="12" r="4.25" />
                    <circle cx="17.5" cy="6.5" r="0.85" fill="currentColor" stroke="none" />
                </svg>
            </a>

            <a
                href={ttHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok The Boe Cottage"
                title="TikTok @theboecottage"
                className={`group inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${baseButtonClass}`}
            >
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"
                >
                    <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.43 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z" />
                </svg>
            </a>
        </div>
    );
}

export default LanguageContext;

