import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import GuestLayout from '../../Layouts/GuestLayout';
import TextField from '../../Components/TextField';
import Button from '../../Components/Button';
import Alert from '../../Components/Alert';
import api, { normalizeApiError } from '../../lib/api';
import { useT } from '../../Context/LanguageContext';

const RESEND_COOLDOWN = 60;

export default function Login() {
    const t = useT();
    const [step, setStep] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef(null);

    useEffect(() => {
        if (cooldown <= 0) return;
        cooldownRef.current = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => window.clearTimeout(cooldownRef.current);
    }, [cooldown]);

    const submitLogin = (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setProcessing(true);

        router.post(
            '/login',
            { email, password },
            {
                onError: (errs) => {
                    setErrors(errs);

                    if (errs.unverified) {
                        setMessage({ type: 'error', text: errs.unverified });
                        setStep('verify');
                        setCooldown(RESEND_COOLDOWN);
                        api.post('/auth/resend-verification', { email }).catch(() => {});
                    }
                },
                onFinish: () => setProcessing(false),
            },
        );
    };

    const submitVerify = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setProcessing(true);

        try {
            await api.post('/auth/verify-email', { email, code });
            router.post('/login', { email, password, redirect: '/dashboard' });
        } catch (error) {
            const normalized = normalizeApiError(error);
            setErrors(normalized.errors || {});
            setMessage(normalized.errors ? null : { type: 'error', text: normalized.message });
            setProcessing(false);
        }
    };

    const resendCode = async () => {
        if (cooldown > 0) return;
        setProcessing(true);

        try {
            await api.post('/auth/resend-verification', { email });
            setMessage({ type: 'success', text: t('signup.verify.resend_success') });
            setCooldown(RESEND_COOLDOWN);
        } catch (error) {
            setMessage({ type: 'error', text: normalizeApiError(error).message });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <GuestLayout title={t('login.title')}>
            <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
                <AnimatePresence mode="wait">
                    {step === 'login' ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('login.title')}</h1>
                            <p className="mt-2 text-sm text-ink-soft">{t('login.subtitle')}</p>

                            <form onSubmit={submitLogin} className="mt-6 flex flex-col gap-4">
                                <TextField
                                    label={t('auth.field.email')}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={errors.email}
                                    autoComplete="email"
                                    required
                                />
                                <TextField
                                    label={t('auth.field.password')}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={errors.password}
                                    autoComplete="current-password"
                                    required
                                />

                                <div className="text-end">
                                    <Link href="/forgot-password" className="text-sm font-medium text-[rgb(93,175,151)] hover:underline">
                                        {t('login.forgot_password')}
                                    </Link>
                                </div>

                                <Button type="submit" loading={processing} className="w-full">
                                    {t('login.submit')}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-ink-soft">
                                {t('login.no_account')}{' '}
                                <Link href="/signup" className="font-medium text-[rgb(93,175,151)] hover:underline">
                                    {t('login.signup_link')}
                                </Link>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="verify"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('signup.verify.title')}</h1>
                            <p className="mt-2 text-sm text-ink-soft">
                                {t('signup.verify.subtitle', { email })}
                            </p>

                            <Alert type={message?.type ?? 'error'}>{message?.text}</Alert>

                            <form onSubmit={submitVerify} className="mt-6 flex flex-col gap-4">
                                <TextField
                                    label={t('auth.field.code')}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    error={errors.code?.[0]}
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="text-center text-2xl font-semibold tracking-[0.5em]"
                                    placeholder="000000"
                                    autoFocus
                                    required
                                />

                                <Button type="submit" loading={processing} disabled={code.length !== 6} className="w-full">
                                    {t('signup.verify.submit')}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-ink-soft">
                                {t('signup.verify.resend')}{' '}
                                <button
                                    type="button"
                                    onClick={resendCode}
                                    disabled={cooldown > 0 || processing}
                                    className="font-medium text-[rgb(93,175,151)] hover:underline disabled:cursor-not-allowed disabled:text-neutral-400 disabled:no-underline"
                                >
                                    {cooldown > 0
                                        ? t('signup.verify.resend_wait', { seconds: cooldown })
                                        : t('signup.verify.resend_action')}
                                </button>
                            </p>

                            <p className="mt-4 text-center text-sm">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('login');
                                        setErrors({});
                                        setMessage(null);
                                    }}
                                    className="font-medium text-ink-soft hover:underline"
                                >
                                    {t('common.back')}
                                </button>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GuestLayout>
    );
}
