import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useT } from '../Context/LanguageContext';

const MotionLink = motion(Link);

function NavLink({ href, children }) {
    return (
        <Link href={href} className="group relative py-1 text-sm font-medium text-ink-soft transition-colors hover:text-ink">
            {children}
            <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-[rgb(108,192,168)] via-[rgb(229,182,164)] to-[rgb(229,182,164)] transition-transform duration-300 ease-out group-hover:scale-x-100" />
        </Link>
    );
}

export default function Navbar({ overlay = false }) {
    const t = useT();
    const { auth } = usePage().props;
    const user = auth?.user;
    const [open, setOpen] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    const { scrollY } = useScroll();
    const headerShadow = useTransform(
        scrollY,
        [0, 80],
        ['0 1px 0 rgba(0,0,0,0)', '0 8px 24px -12px rgba(23,24,28,0.18)'],
    );
    const headerBg = useTransform(
        scrollY,
        [0, 80],
        [overlay ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.92)'],
    );
    const headerBorder = useTransform(
        scrollY,
        [0, 80],
        [overlay ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.05)', 'rgba(0,0,0,0.05)'],
    );

    const handleLogout = (e) => {
        e.preventDefault();
        router.post('/logout');
    };

    const links = user
        ? [
              { href: '/studio', label: t('nav.studio') },
              { href: '/dashboard', label: t('nav.dashboard') },
              ...(user.is_admin ? [{ href: '/admin/orders', label: t('nav.admin') }] : []),
          ]
        : [];

    return (
        <motion.header
            className="sticky top-0 z-50 border-b backdrop-blur-md"
            style={{
                boxShadow: shouldReduceMotion ? undefined : headerShadow,
                backgroundColor: shouldReduceMotion
                    ? overlay
                        ? 'rgba(255,255,255,0.4)'
                        : 'rgba(255,255,255,0.85)'
                    : headerBg,
                borderColor: shouldReduceMotion ? 'rgba(0,0,0,0.05)' : headerBorder,
            }}
        >
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link href="/" className="group flex items-center gap-2 text-lg font-semibold tracking-tight text-ink">
                    <span className="relative flex h-6 w-6 items-center justify-center">
                        <span
                            className="absolute inset-0 rounded-full bg-gradient-to-br from-[rgb(108,192,168)] via-[rgb(229,217,219)] to-[rgb(229,182,164)] opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-80"
                            aria-hidden="true"
                        />
                        <span
                            className="relative h-6 w-6 rounded-full bg-gradient-to-br from-[rgb(108,192,168)] via-[rgb(229,217,219)] to-[rgb(229,182,164)] transition-transform duration-300 group-hover:rotate-90"
                            aria-hidden="true"
                        />
                    </span>
                    Mirror
                </Link>

                <div className="hidden items-center gap-8 md:flex">
                    {links.map((link) => (
                        <NavLink key={link.href} href={link.href}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    {user ? (
                        <motion.button
                            onClick={handleLogout}
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                            className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                        >
                            {t('nav.logout')}
                        </motion.button>
                    ) : (
                        <>
                            <NavLink href="/login">{t('nav.login')}</NavLink>
                            <div className="group relative">
                                <div
                                    className="absolute -inset-1.5 -z-10 rounded-full bg-[rgb(108,192,168)] opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60"
                                    aria-hidden="true"
                                />
                                <MotionLink
                                    href="/signup"
                                    whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                                    whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                    className="relative rounded-full bg-[rgb(108,192,168)] px-4 py-2 text-sm font-medium text-white shadow-md shadow-[rgb(108,192,168)]/30 transition-colors hover:bg-[rgb(93,175,151)]"
                                >
                                    {t('nav.signup')}
                                </MotionLink>
                            </div>
                        </>
                    )}
                </div>

                <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 md:hidden"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Menu"
                >
                    <span className="relative block h-3 w-4">
                        <span
                            className={`absolute inset-x-0 top-0 h-0.5 bg-ink transition ${open ? 'translate-y-1.5 rotate-45' : ''}`}
                        />
                        <span
                            className={`absolute inset-x-0 bottom-0 h-0.5 bg-ink transition ${open ? '-translate-y-1.5 -rotate-45' : ''}`}
                        />
                    </span>
                </button>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-black/5 md:hidden"
                    >
                        <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-neutral-50"
                                >
                                    {link.label}
                                </Link>
                            ))}

                            <div className="my-2 border-t border-black/5" />

                            {user ? (
                                <button
                                    onClick={handleLogout}
                                    className="rounded-lg px-3 py-2 text-start text-sm font-medium text-ink-soft hover:bg-neutral-50"
                                >
                                    {t('nav.logout')}
                                </button>
                            ) : (
                                <>
                                    <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-neutral-50">
                                        {t('nav.login')}
                                    </Link>
                                    <Link href="/signup" className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-neutral-50">
                                        {t('nav.signup')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
