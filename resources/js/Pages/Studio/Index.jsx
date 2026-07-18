import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import AppLayout from '../../Layouts/AppLayout';
import CardCanvasEditor from '../../Components/CardCanvasEditor';
import MirrorSidePreview from '../../Components/MirrorSidePreview';
import OrientationToggle from '../../Components/OrientationToggle';
import ColorPicker from '../../Components/ColorPicker';
import FontSelector from '../../Components/FontSelector';
import IconPicker from '../../Components/IconPicker';
import TextField from '../../Components/TextField';
import Button from '../../Components/Button';
import Alert from '../../Components/Alert';
import api, { normalizeApiError } from '../../lib/api';
import { contrastingTextColor } from '../../lib/contrastColor';
import { useT } from '../../Context/LanguageContext';
import { useToast } from '../../Context/ToastContext';

const STEPS = ['design', 'details', 'review'];
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

const emptyDetails = {
    quantity: 100,
    company_name: '',
    shipping_name: '',
    shipping_phone: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: '',
};

function formatMoney(cents, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency?.toUpperCase() || 'AUD' }).format(
        (cents || 0) / 100,
    );
}

export default function Studio({ fonts, defaultFont, pricing }) {
    const t = useT();
    const toast = useToast();
    const editorRef = useRef(null);
    const logoInputRef = useRef(null);

    const [step, setStep] = useState('design');
    const [orientation, setOrientation] = useState('vertical');
    const [backgroundColor, setBackgroundColor] = useState('#6CC0A8');
    const [selectionFont, setSelectionFont] = useState(null);
    const [defaultTextFont, setDefaultTextFont] = useState(defaultFont || fonts[0]);
    const [selectionColor, setSelectionColor] = useState(null);
    const [defaultTextColor, setDefaultTextColor] = useState(() => contrastingTextColor('#6CC0A8'));
    const [designDataUrl, setDesignDataUrl] = useState(null);
    const [selectionImage, setSelectionImage] = useState(null);
    const [removingBg, setRemovingBg] = useState(false);

    const [details, setDetails] = useState(emptyDetails);
    const [detailErrors, setDetailErrors] = useState({});

    const [processing, setProcessing] = useState(null);
    const [error, setError] = useState(null);

    const activeFont = selectionFont || defaultTextFont;
    const activeTextColor = selectionColor || defaultTextColor;

    const handleFontChange = (font) => {
        if (selectionFont && editorRef.current?.hasSelection()) {
            editorRef.current.applyFontToSelection(font);
            setSelectionFont(font);
        } else {
            setDefaultTextFont(font);
        }
    };

    const handleTextColorChange = (color) => {
        if (selectionColor && editorRef.current?.hasSelection()) {
            editorRef.current.applyColorToSelection(color);
            setSelectionColor(color);
        } else {
            setDefaultTextColor(color);
        }
    };

    const handleLogoFile = (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error(t('studio.error.logo_invalid_type'));
            return;
        }

        if (file.size > MAX_LOGO_SIZE_BYTES) {
            toast.error(t('studio.error.logo_too_large'));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => editorRef.current?.addLogo(reader.result);
        reader.onerror = () => toast.error(t('studio.error.logo_invalid_type'));
        reader.readAsDataURL(file);
    };

    const handleAddIcon = (pathData) => editorRef.current?.addIcon(pathData);

    const handleToggleLogoBackground = async () => {
        setRemovingBg(true);
        try {
            await editorRef.current?.toggleLogoBackground();
        } finally {
            setRemovingBg(false);
        }
    };

    const goToDetails = () => {
        const dataUrl = editorRef.current?.exportDataURL();
        setDesignDataUrl(dataUrl);
        setStep('details');
    };

    const updateDetail = (key) => (e) => setDetails((d) => ({ ...d, [key]: e.target.value }));

    const goToReview = (e) => {
        e.preventDefault();
        setStep('review');
    };

    const editDesign = () => setStep('design');

    const tiers = pricing?.tiers || {};
    const basePriceCents = tiers[details.quantity] ?? 0;
    // Foil is a mandatory flat fee included in every order, not a choice.
    const foilFeeCents = pricing?.foil_fee_cents || 0;
    const totalCents = basePriceCents + foilFeeCents;
    const total = formatMoney(totalCents, pricing?.currency);

    const confirmOrder = async () => {
        setError(null);
        setDetailErrors({});

        // 1. Create the order.
        setProcessing('order');
        let order;
        try {
            const { data } = await api.post('/orders', {
                selected_color: backgroundColor,
                font_family: defaultTextFont,
                orientation,
                ...details,
                quantity: Number(details.quantity),
            });
            order = data.order;
        } catch (err) {
            const normalized = normalizeApiError(err);
            if (normalized.errors) {
                setDetailErrors(normalized.errors);
                setStep('details');
            }
            setError(t('studio.error.order_failed'));
            setProcessing(null);
            return;
        }

        // 2. Upload the exported design image.
        setProcessing('design');
        try {
            const blob = await (await fetch(designDataUrl)).blob();
            const formData = new FormData();
            formData.append('design_image', blob, 'design.png');
            formData.append('selected_color', backgroundColor);
            formData.append('font_family', defaultTextFont);

            await api.post(`/orders/${order.id}/design-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        } catch {
            toast.error(t('studio.error.design_failed'));
            router.visit(`/orders/${order.id}`);
            return;
        }

        // 3. Start Stripe checkout.
        setProcessing('checkout');
        try {
            const { data } = await api.post(`/orders/${order.id}/checkout`);
            window.location.href = data.checkout_url;
        } catch {
            toast.error(t('studio.error.checkout_failed'));
            router.visit(`/orders/${order.id}`);
        }
    };

    return (
        <AppLayout title={t('studio.title')} noFooter>
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{t('studio.title')}</h1>

                    <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
                        {STEPS.map((s, i) => (
                            <span key={s} className="flex items-center gap-2">
                                <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                        step === s
                                            ? 'bg-[rgb(108,192,168)] text-white'
                                            : STEPS.indexOf(step) > i
                                              ? 'bg-[rgb(108,192,168)]/20 text-[rgb(60,120,101)]'
                                              : 'bg-neutral-200 text-neutral-500'
                                    }`}
                                >
                                    {i + 1}
                                </span>
                                <span className={step === s ? 'text-ink' : ''}>{t(`studio.step.${s}`)}</span>
                                {i < STEPS.length - 1 && <span className="mx-1 text-neutral-300">—</span>}
                            </span>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'design' && (
                        <motion.div
                            key="design"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                                <OrientationToggle value={orientation} onChange={setOrientation} />

                                <div className="flex flex-wrap items-center gap-4">
                                    <Button type="button" variant="secondary" size="sm" onClick={() => editorRef.current?.addText()}>
                                        + {t('studio.toolbar.add_text')}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        + {t('studio.toolbar.add_logo')}
                                    </Button>
                                    <input
                                        ref={logoInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleLogoFile}
                                    />
                                    <IconPicker onSelect={handleAddIcon} />
                                    {selectionImage && (
                                        <button
                                            type="button"
                                            onClick={handleToggleLogoBackground}
                                            disabled={removingBg}
                                            className="text-sm font-medium text-[rgb(93,175,151)] hover:underline disabled:opacity-60"
                                        >
                                            {removingBg
                                                ? t('common.loading')
                                                : selectionImage.bgRemoved
                                                  ? t('studio.toolbar.restore_bg')
                                                  : t('studio.toolbar.remove_bg')}
                                        </button>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium text-ink-soft">
                                            {t('studio.toolbar.color')}
                                        </span>
                                        <ColorPicker
                                            value={backgroundColor}
                                            onChange={setBackgroundColor}
                                            ariaLabel={t('studio.toolbar.color')}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium text-ink-soft">
                                            {t('studio.toolbar.text_color')}
                                        </span>
                                        <ColorPicker
                                            value={activeTextColor}
                                            onChange={handleTextColorChange}
                                            ariaLabel={t('studio.toolbar.text_color')}
                                        />
                                    </div>
                                    <FontSelector value={activeFont} onChange={handleFontChange} fonts={fonts} />
                                    <button
                                        type="button"
                                        onClick={() => editorRef.current?.deleteSelected()}
                                        className="text-sm font-medium text-rose-600 hover:underline"
                                    >
                                        {t('studio.toolbar.delete')}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-2">
                                <div>
                                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                                        {t('studio.side.colored')}
                                    </p>
                                    <CardCanvasEditor
                                        ref={editorRef}
                                        orientation={orientation}
                                        backgroundColor={backgroundColor}
                                        defaultFontFamily={defaultTextFont}
                                        defaultTextColor={defaultTextColor}
                                        onSelectionFontChange={setSelectionFont}
                                        onSelectionColorChange={setSelectionColor}
                                        onSelectionImageChange={setSelectionImage}
                                    />
                                </div>
                                <div>
                                    <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-ink-soft">
                                        {t('studio.side.mirror')}
                                    </p>
                                    <MirrorSidePreview orientation={orientation} />
                                </div>
                            </div>

                            <div className="mt-10 flex justify-end">
                                <Button onClick={goToDetails}>{t('studio.continue_to_details')}</Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                            className="mx-auto max-w-2xl"
                        >
                            <h2 className="text-xl font-semibold text-ink">{t('studio.details.title')}</h2>

                            <form onSubmit={goToReview} className="mt-6 flex flex-col gap-4">
                                <TextField
                                    as="select"
                                    label={t('studio.details.quantity')}
                                    value={details.quantity}
                                    onChange={updateDetail('quantity')}
                                    error={detailErrors.quantity?.[0]}
                                    required
                                >
                                    {Object.entries(tiers)
                                        .sort(([a], [b]) => Number(a) - Number(b))
                                        .map(([qty, cents]) => (
                                            <option key={qty} value={qty}>
                                                {t('studio.details.quantity_option', {
                                                    qty,
                                                    price: formatMoney(cents, pricing?.currency),
                                                })}
                                            </option>
                                        ))}
                                </TextField>

                                <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm">
                                    <span className="block font-medium text-ink">
                                        {t('studio.details.foil_label', {
                                            price: formatMoney(pricing?.foil_fee_cents, pricing?.currency),
                                        })}
                                    </span>
                                    <span className="block text-xs text-ink-soft">{t('studio.details.foil_hint')}</span>
                                </div>

                                <p className="text-xs text-ink-soft">
                                    {t('studio.pricing.shipping_note')} · {t('studio.pricing.lead_time_note')}
                                </p>

                                <TextField
                                    label={`${t('studio.details.company_name')} (${t('common.optional')})`}
                                    value={details.company_name}
                                    onChange={updateDetail('company_name')}
                                    error={detailErrors.company_name?.[0]}
                                />
                                <TextField
                                    label={t('studio.details.shipping_name')}
                                    value={details.shipping_name}
                                    onChange={updateDetail('shipping_name')}
                                    error={detailErrors.shipping_name?.[0]}
                                    required
                                />
                                <TextField
                                    label={t('studio.details.shipping_phone')}
                                    type="tel"
                                    value={details.shipping_phone}
                                    onChange={updateDetail('shipping_phone')}
                                    error={detailErrors.shipping_phone?.[0]}
                                    required
                                />
                                <TextField
                                    label={t('studio.details.shipping_address_line1')}
                                    value={details.shipping_address_line1}
                                    onChange={updateDetail('shipping_address_line1')}
                                    error={detailErrors.shipping_address_line1?.[0]}
                                    required
                                />
                                <TextField
                                    label={`${t('studio.details.shipping_address_line2')} (${t('common.optional')})`}
                                    value={details.shipping_address_line2}
                                    onChange={updateDetail('shipping_address_line2')}
                                    error={detailErrors.shipping_address_line2?.[0]}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <TextField
                                        label={t('studio.details.shipping_city')}
                                        value={details.shipping_city}
                                        onChange={updateDetail('shipping_city')}
                                        error={detailErrors.shipping_city?.[0]}
                                        required
                                    />
                                    <TextField
                                        label={`${t('studio.details.shipping_state')} (${t('common.optional')})`}
                                        value={details.shipping_state}
                                        onChange={updateDetail('shipping_state')}
                                        error={detailErrors.shipping_state?.[0]}
                                    />
                                    <TextField
                                        label={t('studio.details.shipping_postal_code')}
                                        value={details.shipping_postal_code}
                                        onChange={updateDetail('shipping_postal_code')}
                                        error={detailErrors.shipping_postal_code?.[0]}
                                        required
                                    />
                                    <TextField
                                        label={t('studio.details.shipping_country')}
                                        value={details.shipping_country}
                                        onChange={updateDetail('shipping_country')}
                                        error={detailErrors.shipping_country?.[0]}
                                        required
                                    />
                                </div>

                                <div className="mt-4 flex justify-between">
                                    <Button type="button" variant="ghost" onClick={() => setStep('design')}>
                                        {t('common.back')}
                                    </Button>
                                    <Button type="submit">{t('studio.details.continue')}</Button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {step === 'review' && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.3 }}
                            className="mx-auto max-w-2xl"
                        >
                            <h2 className="text-xl font-semibold text-ink">{t('studio.review.title')}</h2>

                            <Alert type="error">{error}</Alert>

                            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
                                {designDataUrl && (
                                    <img
                                        src={designDataUrl}
                                        alt=""
                                        className="w-full max-w-[240px] rounded-xl shadow-lg ring-1 ring-black/10 sm:max-w-[200px]"
                                    />
                                )}

                                <dl className="flex-1 divide-y divide-neutral-100 text-sm">
                                    <div className="flex justify-between py-2">
                                        <dt className="text-ink-soft">{t('studio.review.orientation')}</dt>
                                        <dd className="font-medium text-ink">{t(`studio.orientation.${orientation}`)}</dd>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <dt className="text-ink-soft">{t('studio.review.color')}</dt>
                                        <dd className="flex items-center gap-2 font-medium text-ink">
                                            <span
                                                className="h-4 w-4 rounded-full ring-1 ring-black/10"
                                                style={{ backgroundColor: backgroundColor }}
                                            />
                                            {backgroundColor.toUpperCase()}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <dt className="text-ink-soft">{t('studio.review.font')}</dt>
                                        <dd className="font-medium text-ink">{defaultTextFont}</dd>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <dt className="text-ink-soft">{t('studio.review.quantity')}</dt>
                                        <dd className="font-medium text-ink">{details.quantity}</dd>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <dt className="text-ink-soft">{t('studio.review.base_price')}</dt>
                                        <dd className="font-medium text-ink">
                                            {formatMoney(basePriceCents, pricing?.currency)}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <dt className="text-ink-soft">{t('studio.review.foil_fee')}</dt>
                                        <dd className="font-medium text-ink">
                                            {formatMoney(foilFeeCents, pricing?.currency)}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between py-2">
                                        <dt className="text-ink-soft">{t('studio.review.total')}</dt>
                                        <dd className="font-semibold text-ink">{total}</dd>
                                    </div>
                                </dl>
                            </div>

                            <p className="mt-4 text-xs text-ink-soft">
                                {t('studio.pricing.shipping_note')} · {t('studio.pricing.lead_time_note')}
                            </p>

                            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                                <button
                                    type="button"
                                    onClick={editDesign}
                                    className="text-sm font-medium text-[rgb(93,175,151)] hover:underline"
                                >
                                    {t('studio.review.edit_design')}
                                </button>

                                <Button onClick={confirmOrder} loading={Boolean(processing)}>
                                    {processing
                                        ? t(`studio.review.step_${processing}`)
                                        : t('studio.review.confirm')}
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AppLayout>
    );
}
