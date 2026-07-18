import { useLanguage } from '../Context/LanguageContext';

export default function LanguageSwitcher({ className }) {
    const { toggleLocale, t } = useLanguage();

    return (
        <button
            type="button"
            onClick={toggleLocale}
            className={
                'rounded-full border border-neutral-200 px-3.5 py-1.5 text-sm font-medium text-ink-soft transition hover:border-neutral-300 hover:text-ink ' +
                (className ?? '')
            }
        >
            {t('nav.language')}
        </button>
    );
}
