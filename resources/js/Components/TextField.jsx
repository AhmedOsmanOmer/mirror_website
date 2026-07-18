import { useId } from 'react';
import clsx from 'clsx';

export default function TextField({
    label,
    error,
    type = 'text',
    className,
    containerClassName,
    as = 'input',
    children,
    ...props
}) {
    const id = useId();
    const Component = as;

    return (
        <div className={clsx('flex flex-col gap-1.5', containerClassName)}>
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-ink-soft">
                    {label}
                </label>
            )}

            <Component
                id={id}
                type={as === 'input' ? type : undefined}
                className={clsx(
                    'w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm text-ink shadow-sm',
                    'transition focus:border-[rgb(108,192,168)] focus:outline-none focus:ring-2 focus:ring-[rgb(108,192,168)]/30',
                    'placeholder:text-neutral-400',
                    error && 'border-rose-400 focus:border-rose-500 focus:ring-rose-200',
                    className,
                )}
                {...props}
            >
                {children}
            </Component>

            {error && <p className="text-xs font-medium text-rose-600">{error}</p>}
        </div>
    );
}
