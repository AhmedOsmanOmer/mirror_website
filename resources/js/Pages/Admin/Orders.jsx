import { Fragment, useEffect, useMemo, useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import StatusBadge from '../../Components/StatusBadge';
import api, { normalizeApiError } from '../../lib/api';
import { useT } from '../../Context/LanguageContext';
import { useToast } from '../../Context/ToastContext';

const STATUSES = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

function formatMoney(cents, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency?.toUpperCase() || 'AUD' }).format(
        (cents || 0) / 100,
    );
}

function formatDate(value) {
    return new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

function compareOrders(a, b, field, direction) {
    let av;
    let bv;

    if (field === 'status') {
        av = STATUSES.indexOf(a.status);
        bv = STATUSES.indexOf(b.status);
    } else if (field === 'created_at') {
        av = new Date(a.created_at).getTime();
        bv = new Date(b.created_at).getTime();
    } else {
        av = a[field];
        bv = b[field];
    }

    if (av < bv) return direction === 'asc' ? -1 : 1;
    if (av > bv) return direction === 'asc' ? 1 : -1;
    return 0;
}

function SortableHeader({ field, label, sort, onSort, className }) {
    const active = sort.field === field;

    return (
        <th className={`px-4 py-3 text-start font-medium ${className || ''}`}>
            <button
                type="button"
                onClick={() => onSort(field)}
                className={`inline-flex items-center gap-1 hover:text-ink ${active ? 'text-ink' : ''}`}
            >
                {label}
                <span className="text-[10px]">{active ? (sort.direction === 'asc' ? '▲' : '▼') : ''}</span>
            </button>
        </th>
    );
}

export default function AdminOrders() {
    const t = useT();
    const toast = useToast();
    const [orders, setOrders] = useState(null);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [expandedId, setExpandedId] = useState(null);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [orientationFilter, setOrientationFilter] = useState('');
    const [sort, setSort] = useState({ field: 'created_at', direction: 'desc' });

    const load = () => {
        setError(null);
        api
            .get('/admin/orders')
            .then(({ data }) => setOrders(data.orders))
            .catch((err) => setError(normalizeApiError(err).message));
    };

    useEffect(load, []);

    const handleSort = (field) => {
        setSort((current) =>
            current.field === field
                ? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
                : { field, direction: 'asc' },
        );
    };

    const clearFilters = () => {
        setSearch('');
        setStatusFilter('');
        setOrientationFilter('');
    };

    const visibleOrders = useMemo(() => {
        if (!orders) return [];

        const needle = search.trim().toLowerCase();

        return orders
            .filter((order) => {
                if (statusFilter && order.status !== statusFilter) return false;
                if (orientationFilter && order.orientation !== orientationFilter) return false;

                if (needle) {
                    const haystack = [
                        `#${order.id}`,
                        order.user?.name,
                        order.user?.email,
                        order.shipping?.name,
                        order.shipping?.city,
                        order.shipping?.country,
                    ]
                        .filter(Boolean)
                        .join(' ')
                        .toLowerCase();

                    if (!haystack.includes(needle)) return false;
                }

                return true;
            })
            .sort((a, b) => compareOrders(a, b, sort.field, sort.direction));
    }, [orders, search, statusFilter, orientationFilter, sort]);

    const updateStatus = async (order, status) => {
        const previous = order.status;
        setUpdatingId(order.id);
        setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, status } : o)));

        try {
            await api.put(`/admin/orders/${order.id}`, { status });
            toast.success(t('admin.status.update_success', { id: order.id }));
        } catch (err) {
            setOrders((current) => current.map((o) => (o.id === order.id ? { ...o, status: previous } : o)));
            toast.error(normalizeApiError(err).message || t('admin.status.update_failed', { id: order.id }));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <AppLayout title={t('admin.title')}>
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t('admin.title')}</h1>

                {error && (
                    <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                        {error}
                    </div>
                )}

                {!orders && !error && <p className="mt-6 text-ink-soft">{t('common.loading')}</p>}

                {orders && orders.length === 0 && <p className="mt-6 text-ink-soft">{t('admin.empty')}</p>}

                {orders && orders.length > 0 && (
                    <>
                        <div className="mt-6 flex flex-wrap items-center gap-3">
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('admin.filter.search_placeholder')}
                                className="w-56 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink focus:border-[rgb(108,192,168)] focus:outline-none focus:ring-2 focus:ring-[rgb(108,192,168)]/30"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink focus:border-[rgb(108,192,168)] focus:outline-none"
                            >
                                <option value="">{t('admin.filter.all_statuses')}</option>
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {t(`order.status.${s}`)}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={orientationFilter}
                                onChange={(e) => setOrientationFilter(e.target.value)}
                                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-ink focus:border-[rgb(108,192,168)] focus:outline-none"
                            >
                                <option value="">{t('admin.filter.all_orientations')}</option>
                                <option value="horizontal">{t('studio.orientation.horizontal')}</option>
                                <option value="vertical">{t('studio.orientation.vertical')}</option>
                            </select>
                            {(search || statusFilter || orientationFilter) && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="text-sm font-medium text-ink-soft hover:text-ink hover:underline"
                                >
                                    {t('admin.filter.clear')}
                                </button>
                            )}
                            <span className="ms-auto text-xs text-ink-soft">
                                {t('admin.filter.result_count', { count: visibleOrders.length, total: orders.length })}
                            </span>
                        </div>

                        {visibleOrders.length === 0 ? (
                            <p className="mt-6 text-ink-soft">{t('admin.no_results')}</p>
                        ) : (
                            <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                                <table className="w-full text-start text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-ink-soft">
                                            <SortableHeader field="id" label={t('admin.column.id')} sort={sort} onSort={handleSort} />
                                            <th className="px-4 py-3 text-start font-medium">{t('admin.column.customer')}</th>
                                            <SortableHeader
                                                field="created_at"
                                                label={t('admin.column.created')}
                                                sort={sort}
                                                onSort={handleSort}
                                            />
                                            <SortableHeader
                                                field="status"
                                                label={t('admin.column.status')}
                                                sort={sort}
                                                onSort={handleSort}
                                            />
                                            <SortableHeader
                                                field="orientation"
                                                label={t('admin.column.orientation')}
                                                sort={sort}
                                                onSort={handleSort}
                                            />
                                            <SortableHeader
                                                field="quantity"
                                                label={t('admin.column.quantity')}
                                                sort={sort}
                                                onSort={handleSort}
                                            />
                                            <SortableHeader
                                                field="total_amount_cents"
                                                label={t('admin.column.total')}
                                                sort={sort}
                                                onSort={handleSort}
                                            />
                                            <th className="px-4 py-3 text-start font-medium">{t('admin.column.design')}</th>
                                            <th className="px-4 py-3 text-start font-medium">{t('admin.column.shipping')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleOrders.map((order) => (
                                            <Fragment key={order.id}>
                                                <tr className="border-b border-neutral-50 last:border-0">
                                                    <td className="px-4 py-3 font-medium text-ink">#{order.id}</td>
                                                    <td className="px-4 py-3 text-ink-soft">
                                                        <div className="font-medium text-ink">{order.user?.name}</div>
                                                        <div className="text-xs">{order.user?.email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-ink-soft">{formatDate(order.created_at)}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <StatusBadge status={order.status} />
                                                            <select
                                                                value={order.status}
                                                                disabled={updatingId === order.id}
                                                                onChange={(e) => updateStatus(order, e.target.value)}
                                                                className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs text-ink focus:border-[rgb(108,192,168)] focus:outline-none"
                                                            >
                                                                {STATUSES.map((s) => (
                                                                    <option key={s} value={s}>
                                                                        {t(`order.status.${s}`)}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-ink-soft">
                                                        {t(`studio.orientation.${order.orientation}`)}
                                                    </td>
                                                    <td className="px-4 py-3 text-ink-soft">{order.quantity}</td>
                                                    <td className="px-4 py-3 text-ink-soft">
                                                        {formatMoney(order.total_amount_cents, order.currency)}
                                                    </td>
                                                    <td className="px-4 py-3">
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
                                                    <td className="px-4 py-3">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedId((current) => (current === order.id ? null : order.id))
                                                            }
                                                            className="font-medium text-[rgb(93,175,151)] hover:underline"
                                                        >
                                                            {expandedId === order.id
                                                                ? t('admin.hide_details')
                                                                : t('admin.view_details')}
                                                        </button>
                                                    </td>
                                                </tr>
                                                {expandedId === order.id && (
                                                    <tr key={`${order.id}-details`} className="border-b border-neutral-50 bg-neutral-50/60">
                                                        <td colSpan={9} className="px-4 py-4">
                                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                                                                        {t('admin.column.shipping')}
                                                                    </p>
                                                                    <p className="mt-1 font-medium text-ink">{order.shipping.name}</p>
                                                                    <p className="text-ink-soft">{order.shipping.phone}</p>
                                                                    <p className="mt-1 text-ink-soft">
                                                                        {order.shipping.address_line1}
                                                                        {order.shipping.address_line2 && (
                                                                            <>, {order.shipping.address_line2}</>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-ink-soft">
                                                                        {order.shipping.city}
                                                                        {order.shipping.state && <>, {order.shipping.state}</>}{' '}
                                                                        {order.shipping.postal_code}
                                                                    </p>
                                                                    <p className="text-ink-soft">{order.shipping.country}</p>
                                                                    {order.company_name && (
                                                                        <p className="mt-1 text-ink-soft">
                                                                            {t('studio.details.company_name')}: {order.company_name}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                                                                        {t('studio.review.title')}
                                                                    </p>
                                                                    <p className="mt-1 flex items-center gap-2 text-ink-soft">
                                                                        <span
                                                                            className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                                                                            style={{ backgroundColor: order.selected_color }}
                                                                        />
                                                                        {order.selected_color?.toUpperCase()}
                                                                    </p>
                                                                    <p className="text-ink-soft">{order.font_family}</p>
                                                                    <p className="text-ink-soft">
                                                                        {t('admin.column.foil')}:{' '}
                                                                        {order.foil ? t('common.yes') : t('common.no')}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                                                                        {t('studio.review.total')}
                                                                    </p>
                                                                    <p className="mt-1 text-ink-soft">
                                                                        {t('studio.review.base_price')}:{' '}
                                                                        {formatMoney(order.base_price_cents, order.currency)}
                                                                    </p>
                                                                    <p className="text-ink-soft">
                                                                        {t('studio.review.foil_fee')}:{' '}
                                                                        {formatMoney(order.foil_fee_cents, order.currency)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </AppLayout>
    );
}
