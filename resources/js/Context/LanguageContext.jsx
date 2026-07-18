import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '../i18n/en';
import ar from '../i18n/ar';

const dictionaries = { en, ar };
const STORAGE_KEY = 'mbc-locale';

// Language switching is disabled for now — English only. Flip this back to
// re-enable the switcher (the i18n dictionaries and RTL plumbing are intact).
const LOCKED_LOCALE = 'en';

const LanguageContext = createContext(null);

function interpolate(template, params) {
    if (!params) return template;

    return Object.keys(params).reduce(
        (str, key) => str.replaceAll(`{${key}}`, String(params[key])),
        template,
    );
}

export function LanguageProvider({ children }) {
    const [locale, setLocaleState] = useState(() => {
        if (LOCKED_LOCALE) return LOCKED_LOCALE;
        if (typeof window === 'undefined') return 'en';
        return window.localStorage.getItem(STORAGE_KEY) || 'en';
    });

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';

        if (!LOCKED_LOCALE) {
            window.localStorage.setItem(STORAGE_KEY, locale);
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    }, [locale]);

    const setLocale = useCallback((next) => {
        if (LOCKED_LOCALE) return;
        setLocaleState(next === 'ar' ? 'ar' : 'en');
    }, []);

    const toggleLocale = useCallback(() => {
        if (LOCKED_LOCALE) return;
        setLocaleState((current) => (current === 'ar' ? 'en' : 'ar'));
    }, []);

    const t = useCallback(
        (key, params) => {
            const dict = dictionaries[locale] || dictionaries.en;
            const template = dict[key] ?? dictionaries.en[key] ?? key;

            return interpolate(template, params);
        },
        [locale],
    );

    const value = useMemo(
        () => ({ locale, isRtl: locale === 'ar', setLocale, toggleLocale, t }),
        [locale, setLocale, toggleLocale, t],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }

    return context;
}

export function useT() {
    return useLanguage().t;
}
