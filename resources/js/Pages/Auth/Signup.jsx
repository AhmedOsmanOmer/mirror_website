import { useEffect, useRef, useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import GuestLayout from '../../Layouts/GuestLayout';
import TextField from '../../Components/TextField';
import Button from '../../Components/Button';
import Alert from '../../Components/Alert';
import api, { normalizeApiError } from '../../lib/api';
import { useT } from '../../Context/LanguageContext';

const RESEND_COOLDOWN = 60;

export default function Signup() {
    const t = useT();
    const [step, setStep] = useState('form');
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '' });
    const [code, setCode] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef(null);

    useEffect(() => {
        if (cooldown <= 0) return;
        cooldownRef.current = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => window.clearTimeout(cooldownRef.current);
    }, [cooldown]);

    const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const submitRegister = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setLoading(true);

        try {
            await api.post('/auth/register', form);
            setStep('verify');
            setCooldown(RESEND_COOLDOWN);
        } catch (error) {
            const normalized = normalizeApiError(error);
            setErrors(normalized.errors || {});
            setMessage(normalized.errors ? null : { type: 'error', text: normalized.message });
        } finally {
            setLoading(false);
        }
    };

    const submitVerify = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setLoading(true);

        try {
            await api.post('/auth/verify-email', { email: form.email, code });
            setMessage({ type: 'success', text: t('signup.success') });
            router.post('/login', { email: form.email, password: form.password, redirect: '/studio' });
        } catch (error) {
            const normalized = normalizeApiError(error);
            setErrors(normalized.errors || {});
            setMessage(normalized.errors ? null : { type: 'error', text: normalized.message });
            setLoading(false);
        }
    };

    const resendCode = async () => {
        if (cooldown > 0) return;
        setLoading(true);

        try {
            await api.post('/auth/resend-verification', { email: form.email });
            setMessage({ type: 'success', text: t('signup.verify.resend_success') });
            setCooldown(RESEND_COOLDOWN);
        } catch (error) {
            setMessage({ type: 'error', text: normalizeApiError(error).message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <GuestLayout title={t('signup.title')}>
            <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
                <AnimatePresence mode="wait">
                    {step === 'form' ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('signup.title')}</h1>
                            <p className="mt-2 text-sm text-ink-soft">{t('signup.subtitle')}</p>

                            <Alert type={message?.type ?? 'error'}>{message?.text}</Alert>

                            <form onSubmit={submitRegister} className="mt-6 flex flex-col gap-4">
                                <TextField
                                    label={t('auth.field.name')}
                                    value={form.name}
                                    onChange={updateField('name')}
                                    error={errors.name?.[0]}
                                    autoComplete="name"
                                    required
                                />
                                <TextField
                                    label={t('auth.field.email')}
                                    type="email"
                                    value={form.email}
                                    onChange={updateField('email')}
                                    error={errors.email?.[0]}
                                    autoComplete="email"
                                    required
                                />
                                <TextField
                                    label={t('auth.field.phone')}
                                    type="tel"
                                    value={form.phone}
                                    onChange={updateField('phone')}
                                    error={errors.phone?.[0]}
                                    autoComplete="tel"
                                    required
                                />
                                <TextField
                                    label={t('auth.field.password')}
                                    type="password"
                                    value={form.password}
                                    onChange={updateField('password')}
                                    error={errors.password?.[0]}
                                    autoComplete="new-password"
                                    required
                                />
                                <TextField
                                    label={t('auth.field.password_confirmation')}
                                    type="password"
                                    value={form.password_confirmation}
                                    onChange={updateField('password_confirmation')}
                                    autoComplete="new-password"
                                    required
                                />

                                <Button type="submit" loading={loading} className="mt-2 w-full">
                                    {t('signup.submit')}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-ink-soft">
                                {t('signup.has_account')}{' '}
                                <Link href="/login" className="font-medium text-[rgb(93,175,151)] hover:underline">
                                    {t('signup.login_link')}
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
                                {t('signup.verify.subtitle', { email: form.email })}
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

                                <Button type="submit" loading={loading} disabled={code.length !== 6} className="w-full">
                                    {t('signup.verify.submit')}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm text-ink-soft">
                                {t('signup.verify.resend')}{' '}
                                <button
                                    type="button"
                                    onClick={resendCode}
                                    disabled={cooldown > 0 || loading}
                                    className="font-medium text-[rgb(93,175,151)] hover:underline disabled:cursor-not-allowed disabled:text-neutral-400 disabled:no-underline"
                                >
                                    {cooldown > 0
                                        ? t('signup.verify.resend_wait', { seconds: cooldown })
                                        : t('signup.verify.resend_action')}
                                </button>
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GuestLayout>
    );
}
