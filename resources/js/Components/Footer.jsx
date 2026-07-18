import { Link } from '@inertiajs/react';
import ScrollReveal from './ScrollReveal';
import { useT } from '../Context/LanguageContext';

export default function Footer() {
    const t = useT();

    return (
        <footer className="relative border-t border-black/5 bg-neutral-50">
            <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(108,192,168)]/40 to-transparent"
                aria-hidden="true"
            />
            <ScrollReveal
                y={16}
                className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-10 text-center sm:px-6 lg:px-8"
            >
                <Link href="/" className="group flex items-center gap-2 text-base font-semibold text-ink">
                    <span className="relative flex h-5 w-5 items-center justify-center">
                        <span
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-[rgb(108,192,168)] via-[rgb(229,217,219)] to-[rgb(229,182,164)] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-80"
                            aria-hidden="true"
                        />
                        <span
                            className="relative h-5 w-5 rounded-full bg-gradient-to-br from-[rgb(108,192,168)] via-[rgb(229,217,219)] to-[rgb(229,182,164)] transition-transform duration-300 group-hover:rotate-90"
                            aria-hidden="true"
                        />
                    </span>
                    Mirror
                </Link>
                <p className="max-w-sm text-sm text-ink-soft">{t('footer.tagline')}</p>
                <p className="text-xs text-neutral-400">
                    © {new Date().getFullYear()} Mirror Business Cards. {t('footer.rights')}
                </p>
            </ScrollReveal>
        </footer>
    );
}
