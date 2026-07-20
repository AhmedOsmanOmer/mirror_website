import { Link, usePage } from '@inertiajs/react';
import ScrollReveal from './ScrollReveal';
import { CARD_ICONS } from '../lib/cardIcons';
import { useT } from '../Context/LanguageContext';

const iconPath = (key) => CARD_ICONS.find((icon) => icon.key === key)?.d;

function ContactRow({ icon, href, children }) {
    return (
        <a href={href} className="group flex items-start gap-3 text-sm text-ink-soft transition-colors hover:text-ink">
            <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4 shrink-0 fill-current opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true">
                <path d={icon} />
            </svg>
            <span>{children}</span>
        </a>
    );
}

export default function Footer() {
    const t = useT();
    const { auth } = usePage().props;
    const user = auth?.user;

    const quickLinks = [
        { href: '/', label: t('nav.home') },
        { href: '/studio', label: t('nav.studio') },
        ...(user
            ? [{ href: '/dashboard', label: t('nav.dashboard') }]
            : [
                  { href: '/login', label: t('nav.login') },
                  { href: '/signup', label: t('nav.signup') },
              ]),
    ];

    return (
        <footer className="relative border-t border-black/5 bg-neutral-50">
            <div
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(108,192,168)]/40 to-transparent"
                aria-hidden="true"
            />
            <ScrollReveal y={16} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 sm:text-start lg:grid-cols-4">
                    <div className="flex flex-col items-center gap-3 sm:items-start">
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
                        <p className="max-w-xs text-sm text-ink-soft">{t('footer.tagline')}</p>
                    </div>

                    <div className="flex flex-col items-center gap-3 sm:items-start">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                            {t('footer.contact.title')}
                        </h3>
                        <div className="flex flex-col items-center gap-2.5 sm:items-start">
                            <ContactRow icon={iconPath('location')} href="https://maps.google.com/?q=4/88+Reflection+Lane+South+Yarra+VIC+3141+Australia">
                                {t('footer.contact.address')}
                            </ContactRow>
                            <ContactRow icon={iconPath('phone')} href="tel:+61395550148">
                                {t('footer.contact.phone')}
                            </ContactRow>
                            <ContactRow icon={iconPath('email')} href="mailto:hello@mirrorcards.com.au">
                                {t('footer.contact.email')}
                            </ContactRow>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3 sm:items-start">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                            {t('footer.links.title')}
                        </h3>
                        <ul className="flex flex-col items-center gap-2.5 sm:items-start">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-center gap-3 sm:items-start">
                        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink">
                            {t('footer.hours.title')}
                        </h3>
                        <div className="flex flex-col items-center gap-1.5 text-sm text-ink-soft sm:items-start">
                            <p>{t('footer.hours.weekdays')}</p>
                            <p>{t('footer.hours.weekend')}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center gap-2 border-t border-black/5 pt-6 text-center sm:flex-row sm:justify-between sm:text-start">
                    <p className="text-xs text-neutral-400">
                        © {new Date().getFullYear()} Mirror Business Cards. {t('footer.rights')}
                    </p>
                    <p className="text-xs text-neutral-400">{t('footer.abn')}</p>
                </div>
            </ScrollReveal>
        </footer>
    );
}
