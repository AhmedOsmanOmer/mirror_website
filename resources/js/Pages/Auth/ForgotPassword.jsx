import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import GuestLayout from '../../Layouts/GuestLayout';
import TextField from '../../Components/TextField';
import Button from '../../Components/Button';
import Alert from '../../Components/Alert';
import api, { normalizeApiError } from '../../lib/api';
import { useT } from '../../Context/LanguageContext';
import { useToast } from '../../Context/ToastContext';

export default function ForgotPassword() {
    const t = useT();
    const toast = useToast();
    const [step, setStep] = useState('request');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const submitRequest = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setLoading(true);

        try {
            await api.post('/auth/forgot-password', { email });
            setStep('reset');
        } catch (error) {
            const normalized = normalizeApiError(error);
            setErrors(normalized.errors || {});
            setMessage(normalized.errors ? null : { type: 'error', text: normalized.message });
        } finally {
            setLoading(false);
        }
    };

    const submitReset = async (e) => {
        e.preventDefault();
        setErrors({});
        setMessage(null);
        setLoading(true);

        try {
            await api.post('/auth/reset-password', {
                email,
                code,
                password,
                password_confirmation: passwordConfirmation,
            });
            toast.success(t('forgot.success'));
            router.visit('/login');
        } catch (error) {
            const normalized = normalizeApiError(error);
            setErrors(normalized.errors || {});
            setMessage(normalized.errors ? null : { type: 'error', text: normalized.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <GuestLayout title={t('forgot.title')}>
            <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
                <AnimatePresence mode="wait">
                    {step === 'request' ? (
                        <motion.div
                            key="request"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('forgot.title')}</h1>
                            <p className="mt-2 text-sm text-ink-soft">{t('forgot.subtitle')}</p>

                            <Alert type={message?.type ?? 'error'}>{message?.text}</Alert>

                            <form onSubmit={submitRequest} className="mt-6 flex flex-col gap-4">
                                <TextField
                                    label={t('auth.field.email')}
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    error={errors.email?.[0]}
                                    autoComplete="email"
                                    required
                                />

                                <Button type="submit" loading={loading} className="w-full">
                                    {t('forgot.submit')}
                                </Button>
                            </form>

                            <p className="mt-6 text-center text-sm">
                                <Link href="/login" className="font-medium text-[rgb(93,175,151)] hover:underline">
                                    {t('forgot.back_to_login')}
                                </Link>
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="reset"
                            initial={{ opacity: 0, x: 12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('forgot.reset.title')}</h1>
                            <p className="mt-2 text-sm text-ink-soft">{t('forgot.reset.subtitle', { email })}</p>

                            <Alert type={message?.type ?? 'error'}>{message?.text}</Alert>

                            <form onSubmit={submitReset} className="mt-6 flex flex-col gap-4">
                                <TextField
                                    label={t('auth.field.code')}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    error={errors.code?.[0]}
                                    inputMode="numeric"
                                    maxLength={6}
                                    className="text-center text-2xl font-semibold tracking-[0.5em]"
                                    placeholder="000000"
                                    required
                                />
                                <TextField
                                    label={t('auth.field.password')}
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    error={errors.password?.[0]}
                                    autoComplete="new-password"
                                    required
                                />
                                <TextField
                                    label={t('auth.field.password_confirmation')}
                                    type="password"
                                    value={passwordConfirmation}
                                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />

                                <Button type="submit" loading={loading} className="w-full">
                                    {t('forgot.reset.submit')}
                                </Button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </GuestLayout>
    );
}
