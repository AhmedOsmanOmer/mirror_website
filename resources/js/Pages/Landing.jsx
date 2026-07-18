import { useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import GuestLayout from '../Layouts/GuestLayout';
import MirrorCardHero from '../Components/MirrorCardHero';
import ProductShowcase from '../Components/ProductShowcase';
import ScrollReveal from '../Components/ScrollReveal';
import AuroraBackground from '../Components/AuroraBackground';
import Sparkles from '../Components/Sparkles';
import AnimatedHeadline from '../Components/AnimatedHeadline';
import { useT } from '../Context/LanguageContext';

const MotionLink = motion(Link);

const features = [
    {
        key: 'mirror',
        color: 'rgb(108,192,168)',
    },
    {
        key: 'design',
        color: 'rgb(229,182,164)',
    },
    {
        key: 'orientation',
        color: 'rgb(229,217,219)',
    },
];

export default function Landing({ pricing }) {
    const t = useT();
    const { auth } = usePage().props;
    const primaryCtaHref = auth?.user ? '/studio' : '/signup';

    const heroRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
    const auroraY = useTransform(scrollYProgress, [0, 1], [0, shouldReduceMotion ? 0 : 90]);

    return (
        <GuestLayout title={t('landing.hero.title')} transparentNav>
            {/* Hero */}
            <div ref={heroRef} className="relative isolate">
                <motion.div
                    className="absolute -top-24 inset-x-0 bottom-0 -z-10 overflow-hidden"
                    style={{ y: auroraY }}
                >
                    <AuroraBackground />
                    <Sparkles count={16} />
                </motion.div>

                <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-24 pt-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:px-8 lg:pt-24">
                    <div>
                        <ScrollReveal y={16}>
                            <span className="inline-block rounded-full bg-[rgb(108,192,168)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[rgb(60,120,101)]">
                                {t('landing.hero.eyebrow')}
                            </span>
                        </ScrollReveal>

                        <AnimatedHeadline
                            text={t('landing.hero.title')}
                            startDelay={0.15}
                            className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.75rem]"
                        />

                        <ScrollReveal delay={0.5}>
                            <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
                                {t('landing.hero.subtitle')}
                            </p>
                        </ScrollReveal>

                        <ScrollReveal delay={0.6}>
                            <div className="mt-9 flex flex-wrap items-center gap-4">
                                <div className="group relative">
                                    <div
                                        className="absolute -inset-2 -z-10 rounded-full bg-[rgb(108,192,168)] opacity-40 blur-xl transition-opacity duration-300 group-hover:opacity-70"
                                        aria-hidden="true"
                                    />
                                    <MotionLink
                                        href={primaryCtaHref}
                                        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        className="relative rounded-full bg-[rgb(108,192,168)] px-7 py-3.5 text-base font-medium text-white shadow-lg shadow-[rgb(108,192,168)]/30 transition-colors hover:bg-[rgb(93,175,151)]"
                                    >
                                        {t('landing.hero.cta.primary')}
                                    </MotionLink>
                                </div>
                                {!auth?.user && (
                                    <MotionLink
                                        href="/signup"
                                        whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
                                        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                        className="rounded-full border border-neutral-200 px-7 py-3.5 text-base font-medium text-ink transition-colors hover:bg-neutral-50"
                                    >
                                        {t('landing.hero.cta.secondary')}
                                    </MotionLink>
                                )}
                            </div>
                        </ScrollReveal>
                    </div>

                    <ScrollReveal delay={0.2} y={32} className="lg:mt-10">
                        <MirrorCardHero />
                    </ScrollReveal>
                </section>
            </div>

            {/* Features */}
            <section className="relative overflow-hidden border-t border-black/5 bg-neutral-50/60 py-20">
                <AuroraBackground intensity={0.28} noise={false} />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <ScrollReveal>
                        <h2 className="text-center text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            {t('landing.section.features.title')}
                        </h2>
                    </ScrollReveal>

                    <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
                        {features.map((feature, i) => (
                            <ScrollReveal
                                key={feature.key}
                                delay={i * 0.12}
                                className={i === 1 ? 'sm:-translate-y-4' : undefined}
                            >
                                <motion.div
                                    whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                                    className="group flex flex-col items-center gap-4 text-center sm:items-start sm:text-start"
                                >
                                    <span
                                        className="relative flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                                        style={{ backgroundColor: `${feature.color}` }}
                                        aria-hidden="true"
                                    >
                                        <span
                                            className="absolute -inset-2 -z-10 rounded-full opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-60"
                                            style={{ backgroundColor: feature.color }}
                                        />
                                        <span className="h-5 w-5 rounded-full bg-white/80" />
                                    </span>
                                    <h3 className="text-lg font-semibold text-ink">
                                        {t(`landing.feature.${feature.key}.title`)}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-ink-soft">
                                        {t(`landing.feature.${feature.key}.description`)}
                                    </p>
                                </motion.div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Showcase */}
            <section className="relative overflow-hidden py-20">
                <AuroraBackground intensity={0.16} noise={false} />
                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <ScrollReveal className="text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                            {t('landing.section.showcase.title')}
                        </h2>
                        <p className="mx-auto mt-3 max-w-xl text-ink-soft">{t('landing.section.showcase.subtitle')}</p>
                    </ScrollReveal>

                    <div className="mt-14">
                        <ProductShowcase />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative mx-4 mb-20 overflow-hidden rounded-3xl bg-gradient-to-br from-[rgb(108,192,168)] via-[rgb(150,196,182)] to-[rgb(229,182,164)] sm:mx-6 lg:mx-8">
                <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true">
                    <Sparkles count={10} />
                </div>
                <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-16 text-center text-white">
                    <ScrollReveal>
                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            {t('landing.section.cta.title')}
                        </h2>
                    </ScrollReveal>
                    <ScrollReveal delay={0.1}>
                        <p className="max-w-md text-white/85">{t('landing.section.cta.subtitle')}</p>
                    </ScrollReveal>
                    <ScrollReveal delay={0.2}>
                        <MotionLink
                            href={primaryCtaHref}
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
                            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            className="inline-block rounded-full bg-white px-7 py-3.5 text-base font-semibold text-ink shadow-lg transition-shadow hover:shadow-xl"
                        >
                            {t('landing.section.cta.button')}
                        </MotionLink>
                    </ScrollReveal>
                    {pricing && (
                        <ScrollReveal delay={0.3}>
                            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                                {pricing.width_mm}×{pricing.height_mm}mm
                            </p>
                        </ScrollReveal>
                    )}
                </div>
            </section>
        </GuestLayout>
    );
}
