import { useEffect, useRef, useState } from 'react';
import { Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import Alert from '../../Components/Alert';
import Button from '../../Components/Button';
import StatusBadge from '../../Components/StatusBadge';
import api, { normalizeApiError } from '../../lib/api';
import { useT } from '../../Context/LanguageContext';
import { useToast } from '../../Context/ToastContext';

const CONFIRM_POLL_INTERVAL_MS = 2000;
const CONFIRM_POLL_MAX_ATTEMPTS = 10;

function formatMoney(cents, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency?.toUpperCase() || 'AUD' }).format(
        (cents || 0) / 100,
    );
}

export default function OrderShow({ order: initialOrder, checkout }) {
    const t = useT();
    const toast = useToast();
    const [order, setOrder] = useState(initialOrder);
    const [retrying, setRetrying] = useState(false);
    const [confirming, setConfirming] = useState(checkout === 'success' && initialOrder.status === 'pending');
    const attemptsRef = useRef(0);

    // Stripe redirects back to this page immediately on success, but the
    // webhook that actually flips the order to "paid" can land a few
    // seconds later — poll briefly rather than showing a stale "pending"
    // state (and the pay-again button) right after a successful payment.
    useEffect(() => {
        if (!confirming) return undefined;

        const timer = window.setInterval(async () => {
            attemptsRef.current += 1;

            try {
                const { data } = await api.get(`/orders/${initialOrder.id}`);
                setOrder(data.order);

                if (data.order.status !== 'pending' || attemptsRef.current >= CONFIRM_POLL_MAX_ATTEMPTS) {
                    setConfirming(false);
                }
            } catch {
                if (attemptsRef.current >= CONFIRM_POLL_MAX_ATTEMPTS) {
                    setConfirming(false);
                }
            }
        }, CONFIRM_POLL_INTERVAL_MS);

        return () => window.clearInterval(timer);
    }, [confirming, initialOrder.id]);

    const retryCheckout = async () => {
        setRetrying(true);
        try {
            const { data } = await api.post(`/orders/${order.id}/checkout`);
            window.location.href = data.checkout_url;
        } catch (error) {
            toast.error(normalizeApiError(error).message);
            setRetrying(false);
        }
    };

    return (
        <AppLayout title={t('order.show.title', { id: order.id })}>
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                {checkout === 'success' && (
                    <Alert type={confirming ? 'info' : 'success'}>
                        {confirming ? t('order.show.confirming_payment') : t('order.show.success')}
                    </Alert>
                )}
                {checkout === 'cancelled' && <Alert type="error">{t('order.show.cancelled')}</Alert>}

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink">
                        {t('order.show.title', { id: order.id })}
                    </h1>
                    <StatusBadge status={order.status} />
                </div>

                <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                    {order.design_pdf_path && (
                        <div className="sm:col-span-2">
                            <div
                                className="mx-auto max-w-xs overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/10"
                                style={{ backgroundColor: order.selected_color }}
                            >
                                <div className="aspect-[85/50] w-full" />
                            </div>
                        </div>
                    )}

                    <dl className="divide-y divide-neutral-100 rounded-2xl bg-white p-6 text-sm shadow-sm ring-1 ring-black/5">
                        <div className="flex justify-between py-2.5">
                            <dt className="text-ink-soft">{t('studio.review.orientation')}</dt>
                            <dd className="font-medium text-ink">{t(`studio.orientation.${order.orientation}`)}</dd>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <dt className="text-ink-soft">{t('studio.review.color')}</dt>
                            <dd className="flex items-center gap-2 font-medium text-ink">
                                <span
                                    className="h-4 w-4 rounded-full ring-1 ring-black/10"
                                    style={{ backgroundColor: order.selected_color }}
                                />
                                {order.selected_color?.toUpperCase()}
                            </dd>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <dt className="text-ink-soft">{t('studio.review.font')}</dt>
                            <dd className="font-medium text-ink">{order.font_family}</dd>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <dt className="text-ink-soft">{t('studio.review.quantity')}</dt>
                            <dd className="font-medium text-ink">{order.quantity}</dd>
                        </div>
                        <div className="flex justify-between py-2.5">
                            <dt className="text-ink-soft">{t('studio.review.base_price')}</dt>
                            <dd className="font-medium text-ink">
                                {formatMoney(order.base_price_cents, order.currency)}
                            </dd>
                        </div>
                        {order.foil && (
                            <div className="flex justify-between py-2.5">
                                <dt className="text-ink-soft">{t('studio.review.foil_fee')}</dt>
                                <dd className="font-medium text-ink">
                                    {formatMoney(order.foil_fee_cents, order.currency)}
                                </dd>
                            </div>
                        )}
                        <div className="flex justify-between py-2.5">
                            <dt className="text-ink-soft">{t('studio.review.total')}</dt>
                            <dd className="font-semibold text-ink">
                                {formatMoney(order.total_amount_cents, order.currency)}
                            </dd>
                        </div>
                    </dl>

                    <div className="rounded-2xl bg-white p-6 text-sm shadow-sm ring-1 ring-black/5">
                        <p className="font-medium text-ink">{order.shipping.name}</p>
                        <p className="mt-1 text-ink-soft">{order.shipping.phone}</p>
                        <p className="mt-3 text-ink-soft">
                            {order.shipping.address_line1}
                            {order.shipping.address_line2 && <>, {order.shipping.address_line2}</>}
                        </p>
                        <p className="text-ink-soft">
                            {order.shipping.city}
                            {order.shipping.state && <>, {order.shipping.state}</>} {order.shipping.postal_code}
                        </p>
                        <p className="text-ink-soft">{order.shipping.country}</p>
                    </div>
                </div>

                <p className="mt-4 text-xs text-ink-soft">
                    {t('studio.pricing.shipping_note')} · {t('studio.pricing.lead_time_note')}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                    {order.design_pdf_path ? (
                        <a
                            href={order.design_pdf_path}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-neutral-200 px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-neutral-50"
                        >
                            {t('order.show.download_pdf')}
                        </a>
                    ) : (
                        <p className="text-sm text-ink-soft">{t('order.show.no_pdf')}</p>
                    )}

                    {confirming ? (
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            {t('order.show.confirming_payment')}
                        </span>
                    ) : (
                        order.status === 'pending' && (
                            <Button variant="secondary" onClick={retryCheckout} loading={retrying}>
                                {t('studio.review.confirm')}
                            </Button>
                        )
                    )}

                    <Link href="/dashboard" className="ms-auto text-sm font-medium text-[rgb(93,175,151)] hover:underline">
                        {t('order.show.back_to_dashboard')}
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
