import { useT } from '../Context/LanguageContext';

const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    paid: 'bg-[rgb(108,192,168)]/10 text-[rgb(60,120,101)] ring-[rgb(108,192,168)]/30',
    processing: 'bg-sky-50 text-sky-700 ring-sky-200',
    shipped: 'bg-violet-50 text-violet-700 ring-violet-200',
    delivered: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
};

export default function StatusBadge({ status }) {
    const t = useT();

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                styles[status] || styles.pending
            }`}
        >
            {t(`order.status.${status}`)}
        </span>
    );
}
