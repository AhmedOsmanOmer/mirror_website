import { useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import ScrollReveal from '../../Components/ScrollReveal';
import TextField from '../../Components/TextField';
import Button from '../../Components/Button';
import StatusBadge from '../../Components/StatusBadge';
import api, { normalizeApiError } from '../../lib/api';
import { useT } from '../../Context/LanguageContext';
import { useToast } from '../../Context/ToastContext';

function formatMoney(cents, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency?.toUpperCase() || 'AUD' }).format(
        (cents || 0) / 100,
    );
}

export default function Dashboard({ user, orders }) {
    const t = useT();
    const toast = useToast();
    const orderList = Array.isArray(orders) ? orders : orders?.data || [];

    const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const saveProfile = async (e) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);

        try {
            await api.put('/profile', form);
            toast.success(t('dashboard.profile.saved'));
        } catch (error) {
            const normalized = normalizeApiError(error);
            setErrors(normalized.errors || {});
            if (!normalized.errors) toast.error(normalized.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout title={t('dashboard.title')}>
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t('dashboard.title')}</h1>

                <ScrollReveal className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
                    <h2 className="text-lg font-semibold text-ink">{t('dashboard.profile.title')}</h2>

                    <form onSubmit={saveProfile} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <TextField
                            label={t('auth.field.name')}
                            value={form.name}
                            onChange={updateField('name')}
                            error={errors.name?.[0]}
                        />
                        <TextField
                            label={t('auth.field.email')}
                            type="email"
                            value={form.email}
                            onChange={updateField('email')}
                            error={errors.email?.[0]}
                        />
                        <TextField
                            label={t('auth.field.phone')}
                            value={form.phone}
                            onChange={updateField('phone')}
                            error={errors.phone?.[0]}
                        />

                        <div className="sm:col-span-3">
                            <Button type="submit" loading={saving}>
                                {t('dashboard.profile.save')}
                            </Button>
                        </div>
                    </form>
                </ScrollReveal>

                <ScrollReveal delay={0.1} className="mt-8">
                    <h2 className="text-lg font-semibold text-ink">{t('dashboard.orders.title')}</h2>

                    {orderList.length === 0 ? (
                        <div className="mt-4 rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-black/5">
                            <p className="text-ink-soft">{t('dashboard.orders.empty')}</p>
                            <Link
                                href="/studio"
                                className="mt-4 inline-block rounded-full bg-[rgb(108,192,168)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[rgb(93,175,151)]"
                            >
                                {t('dashboard.orders.empty_cta')}
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                            <table className="w-full text-start text-sm">
                                <thead>
                                    <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-ink-soft">
                                        <th className="px-5 py-3 text-start font-medium">{t('dashboard.orders.column.id')}</th>
                                        <th className="px-5 py-3 text-start font-medium">{t('dashboard.orders.column.status')}</th>
                                        <th className="px-5 py-3 text-start font-medium">
                                            {t('dashboard.orders.column.orientation')}
                                        </th>
                                        <th className="px-5 py-3 text-start font-medium">{t('dashboard.orders.column.total')}</th>
                                        <th className="px-5 py-3 text-start font-medium">{t('dashboard.orders.column.design')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderList.map((order) => (
                                        <tr key={order.id} className="border-b border-neutral-50 last:border-0">
                                            <td className="px-5 py-3">
                                                <Link href={`/orders/${order.id}`} className="font-medium text-ink hover:underline">
                                                    #{order.id}
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="px-5 py-3 text-ink-soft">
                                                {t(`studio.orientation.${order.orientation}`)}
                                            </td>
                                            <td className="px-5 py-3 text-ink-soft">
                                                {formatMoney(order.total_amount_cents, order.currency)}
                                            </td>
                                            <td className="px-5 py-3">
                                                {order.design_pdf_path ? (
                                                    <a
                                                        href={order.design_pdf_path}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-medium text-[rgb(93,175,151)] hover:underline"
                                                    >
                                                        {t('common.download')}
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </ScrollReveal>
            </div>
        </AppLayout>
    );
}
