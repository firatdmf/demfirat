'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLocale, useTranslations } from 'next-intl';
import { Product, ProductVariant } from '@/lib/interfaces';
import { trackEnterMeasurements, trackSelectPleat } from '@/lib/tracking';
import classes from './CurtainWizard.module.css';

type PleatType = 'flat' | 'kanun' | 'pipe' | 'water_wave' | 'american';

interface CurtainWizardProps {
    product: Product;
    selectedVariant?: ProductVariant;
    unitPrice: number;
    onAddToCart: (data: any, totalPrice: number, quantity: number, isBuyNow: boolean) => void;
    selectedAttributes?: { [key: string]: string };
    forceOpen?: boolean;
    hideHeader?: boolean;
    isFavorite?: boolean;
    onToggleFavorite?: (e: React.MouseEvent) => void;
    onSizeGuideClick?: () => void;
    onPleatGuideClick?: () => void;
}

export default function CurtainWizard({
    product, selectedVariant, unitPrice, onAddToCart, selectedAttributes = {},
    isFavorite = false, onToggleFavorite, onSizeGuideClick, onPleatGuideClick
}: CurtainWizardProps) {
    const locale = useLocale();
    const t = useTranslations('CustomCurtain');
    const { convertPrice } = useCurrency();

    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');

    // Default config: Düz Pile (flat), Sık Pile (1x3)
    const [pleatType, setPleatType] = useState<PleatType>('flat');
    const [pleatDensity, setPleatDensity] = useState<string>('1x3');

    // Mounting Type
    const [mountingType, setMountingType] = useState<'cornice' | 'rustic'>('cornice');

    const [quantity, setQuantity] = useState<number>(1);
    const handleIncrement = () => setQuantity(prev => prev + 1);
    const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

    const [showAdvanced, setShowAdvanced] = useState(false);

    const [heightError, setHeightError] = useState<string | null>(null);
    const [stockError, setStockError] = useState<string | null>(null);

    // Max height from attributes
    const maxHeight = useMemo(() => {
        const heightKey = Object.keys(selectedAttributes).find(k =>
            ['height', 'boy', 'yükseklik'].includes(k.toLowerCase())
        );
        let maxH = 320; // Default max height
        if (heightKey) {
            const m = selectedAttributes[heightKey].match(/(\d+(\.\d+)?)/);
            if (m) maxH = parseFloat(m[0]);
        }
        return maxH;
    }, [selectedAttributes]);

    useEffect(() => {
        if (!height) { setHeightError(null); return; }
        setHeightError(parseFloat(height) > maxHeight
            ? t('maxHeightError', { max: maxHeight })
            : null);
    }, [height, maxHeight, t]);

    // Price and Fabric Calculation (Mounting=Cornice, Wing=Single fixed implicitly)
    const densityMult = useMemo(() => {
        if (!pleatDensity || pleatDensity === '0') return 1;
        const p = pleatDensity.split('x');
        return p.length === 2 ? parseFloat(p[1]) : 1;
    }, [pleatDensity]);

    const fabricNeededPerCurtain = useMemo(() => {
        if (!width) return 0;
        const wm = parseFloat(width) / 100;
        return wm * densityMult;
    }, [width, densityMult]);

    const totalFabricNeeded = fabricNeededPerCurtain * quantity;

    const unitPricePerCurtain = useMemo(() => {
        if (!width || !height) return 0;
        const wm = parseFloat(width) / 100;
        const fabricCost = fabricNeededPerCurtain * unitPrice;

        let pleatCost = 0;
        if (pleatType) {
            const rate = ['american', 'water_wave'].includes(pleatType) ? 2.5 : (pleatDensity === '0' ? 0 : 1.25);
            pleatCost = wm * rate * densityMult; // single wing
        }
        const mountCost = wm * 1.25; // cornice is standard
        return fabricCost + pleatCost + mountCost;
    }, [width, height, pleatType, pleatDensity, densityMult, fabricNeededPerCurtain, unitPrice]);

    const totalPrice = unitPricePerCurtain * quantity;

    // Stock check
    useEffect(() => {
        if (!width || !height) { setStockError(null); return; }
        let avail = 0;
        if (selectedVariant?.variant_quantity) avail = Number(selectedVariant.variant_quantity);
        else if (product.available_quantity) avail = Number(product.available_quantity) / 100;
        else if (product.quantity) avail = Number(product.quantity) / 100;
        setStockError(totalFabricNeeded > avail
            ? t('insufficientStock', { required: totalFabricNeeded.toFixed(1), available: avail.toFixed(1) })
            : null);
    }, [totalFabricNeeded, width, height, selectedVariant, product, t]);

    const canSubmit = !!(width && height && !heightError && !stockError && totalPrice > 0);

    const handleSubmit = (isBuyNow: boolean) => {
        if (!width || !height) {
            alert(locale === 'tr' ? 'Lütfen perde enini ve boyunu seçiniz.' : 'Please select curtain width and height.');
            return;
        }
        if (heightError) {
            alert(heightError);
            return;
        }
        if (stockError) {
            alert(stockError);
            return;
        }
        if (totalPrice <= 0) return;

        trackEnterMeasurements(Number(width), Number(height), 'cornice');

        onAddToCart({
            mountingType,
            pleatType,
            pleatDensity,
            width,
            height,
            wingType: 'single',
            isCustomCurtain: true,
            fabricMeters: Number(fabricNeededPerCurtain.toFixed(2)) // Meters per curtain
        }, unitPricePerCurtain, quantity, isBuyNow);
    };

    const handleBasicPleatSelect = (density: string) => {
        setPleatDensity(density);
        setPleatType('flat'); // base pleat type for these
    };

    const handleAdvancedPleatSelect = (pType: PleatType) => {
        setPleatType(pType);
        // Force valid density for advanced pleat
        if (pType === 'american') setPleatDensity('1x3.5');
        else if (pType === 'water_wave') setPleatDensity('1x3');
        else if (['1x2', '1x2.5', '1x3'].includes(pleatDensity) === false) setPleatDensity('1x2.5');
    };

    const isBasicActive = (density: string) => pleatDensity === density && pleatType === 'flat';

    return (
        <div className={classes.simpleWizardWrapper}>
            {/* Step 1: Dimensions */}
            <div className={classes.wizardSection}>
                <div className={classes.sectionTitleContainer}>
                    <div className={classes.sectionTitle}>
                        {locale === 'tr' ? 'Perde Eninizi ve Boyunuzu Seçiniz' : t('enterDimensions')}
                    </div>
                    {onSizeGuideClick && (
                        <span className={classes.sizeGuideLink} onClick={onSizeGuideClick}>
                            ({locale === 'tr' ? 'Ölçü Rehberi' : 'Size Guide'})
                        </span>
                    )}
                </div>
                <p className={classes.sectionDesc}>
                    {locale === 'tr' ? 'Sipariș vermek istediğiniz perdenin ölçüsünü veriniz, sistem pileyi kendisi hesaplamaktadır.' : t('dimensionHint')}
                </p>
                <div className={classes.dimRowSelect}>
                    <div className={classes.dimGroup}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#666' }}>
                                <line x1="2" y1="12" x2="22" y2="12"></line>
                                <polygon points="6,8 2,12 6,16"></polygon>
                                <polygon points="18,8 22,12 18,16"></polygon>
                            </svg>
                            {locale === 'tr' ? 'Perde En Ölçüsü (cm)' : 'Width (cm)'}
                        </label>
                        <select className={classes.dimSelect} value={width} onChange={e => setWidth(e.target.value)}>
                            <option value="" disabled>{locale === 'tr' ? 'En Seçiniz' : t('width')}</option>
                            {Array.from({ length: 951 }, (_, i) => 50 + i * 1).map(w => (
                                <option key={w} value={w}>{w} cm</option>
                            ))}
                        </select>
                    </div>
                    <div className={classes.dimGroup}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#666' }}>
                                <line x1="12" y1="2" x2="12" y2="22"></line>
                                <polygon points="8,6 12,2 16,6"></polygon>
                                <polygon points="8,18 12,22 16,18"></polygon>
                            </svg>
                            {locale === 'tr' ? 'Perde Boy Ölçüsü (cm)' : 'Height (cm)'}
                        </label>
                        <select className={`${classes.dimSelect} ${heightError ? classes.dimInputError : ''}`} value={height} onChange={e => setHeight(e.target.value)}>
                            <option value="" disabled>{locale === 'tr' ? 'Boy Seçiniz' : t('height')}</option>
                            {Array.from({ length: maxHeight - 49 }, (_, i) => 50 + i * 1).filter(h => h <= maxHeight).map(h => (
                                <option key={h} value={h}>{h} cm</option>
                            ))}
                        </select>
                    </div>
                </div>
                {heightError && <div className={classes.errText}>{heightError}</div>}
            </div>

            {/* Step 2: Pleat Density */}
            <div className={classes.wizardSection}>
                <div className={classes.sectionTitleContainer} style={{ marginTop: '0.5rem' }}>
                    <div className={classes.sectionTitle}>
                        {locale === 'tr' ? 'Pile Sıklığını Seçiniz' : t('choosePleatDensity')}
                    </div>
                    {onPleatGuideClick && (
                        <span className={classes.sizeGuideLink} onClick={onPleatGuideClick}>
                            ({locale === 'tr' ? 'Pile Rehberi' : 'Pleat Guide'})
                        </span>
                    )}
                </div>
                <div
                    className={classes.densityGrid}
                    style={{
                        opacity: mountingType === 'rustic' ? 0.5 : 1,
                        pointerEvents: mountingType === 'rustic' ? 'none' : 'auto',
                        transition: 'opacity 0.2s'
                    }}
                >
                    <button className={`${classes.densityBtn} ${isBasicActive('0') ? classes.densityActive : ''}`}
                        onClick={() => handleBasicPleatSelect('0')}>
                        <span className={classes.densName}>{locale === 'tr' ? 'Düz Pile' : t('noPleat')}</span>
                    </button>
                    <button className={`${classes.densityBtn} ${isBasicActive('1x2') ? classes.densityActive : ''}`}
                        onClick={() => handleBasicPleatSelect('1x2')}>
                        <span className={classes.densName}>{locale === 'tr' ? 'Seyrek Pile' : 'Light'}</span>
                        <span className={classes.densRatio}>1x2</span>
                    </button>
                    <button className={`${classes.densityBtn} ${isBasicActive('1x2.5') ? classes.densityActive : ''}`}
                        onClick={() => handleBasicPleatSelect('1x2.5')}>
                        <span className={classes.densName}>{locale === 'tr' ? 'Normal Pile' : 'Normal'}</span>
                        <span className={classes.densRatio}>1x2.5</span>
                    </button>
                    <button className={`${classes.densityBtn} ${isBasicActive('1x3') ? classes.densityActive : ''}`}
                        onClick={() => handleBasicPleatSelect('1x3')}>
                        <span className={classes.densName}>{locale === 'tr' ? 'Sık Pile' : 'Dense'}</span>
                        <span className={classes.densRatio}>1x3</span>
                    </button>
                </div>
            </div>

            {/* Advanced Toggle */}
            <div className={classes.advancedToggleWrapper} style={{ marginTop: '1rem' }}>
                <button className={classes.advancedToggleBtn} onClick={() => setShowAdvanced(!showAdvanced)}>
                    {showAdvanced ? '-' : '+'} {locale === 'tr' ? 'Ek Pile Özellikleri Ekle' : 'Advanced Pleat Options'}
                </button>
            </div>

            {
                showAdvanced && (
                    <div className={classes.advancedPleatsPanel}>
                        {/* 1. Pile Tipleri */}
                        <div
                            style={{
                                marginBottom: '1.5rem',
                                opacity: mountingType === 'rustic' ? 0.5 : 1,
                                pointerEvents: mountingType === 'rustic' ? 'none' : 'auto',
                                transition: 'opacity 0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <div style={{ background: '#c9a961', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>1</div>
                                <span style={{ fontFamily: "var(--font-body, 'Montserrat', sans-serif)", fontSize: '0.9rem', fontWeight: 600 }}>{locale === 'tr' ? 'Pile Tipleri' : 'Pleat Types'}</span>
                            </div>
                            <div className={classes.imageGrid3}>
                                {([
                                    { v: 'flat' as PleatType, src: '/media/curtain-options/pleat-flat.jpg', alt: 'Flat', label: t('flat') },
                                    { v: 'kanun' as PleatType, src: '/media/curtain-options/pleat-kanun.jpg', alt: 'Kanun', label: t('kanun') },
                                    { v: 'pipe' as PleatType, src: '/media/curtain-options/pleat-pipe.jpg', alt: 'Pipe', label: t('pipe') },
                                    { v: 'water_wave' as PleatType, src: '/media/curtain-options/pleat-water-wave.jpg', alt: 'W.Wave', label: t('water_wave') },
                                    { v: 'american' as PleatType, src: '/media/curtain-options/pleat-american.jpg', alt: 'American', label: t('american') },
                                ]).map(opt => (
                                    <button
                                        key={opt.v}
                                        className={`${classes.imgCard} ${pleatType === opt.v ? classes.imgCardSelected : ''}`}
                                        onClick={() => handleAdvancedPleatSelect(opt.v)}
                                    >
                                        <div className={classes.imgWrap}>
                                            <img src={opt.src} alt={opt.alt} onError={e => { (e.currentTarget as HTMLImageElement).src = '/media/placeholder-curtain.jpg'; }} />
                                        </div>
                                        <span className={classes.imgLabel}>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. Montaj Tipi (Rustik Checkbox) */}
                        <div style={{ pointerEvents: 'auto', opacity: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <div style={{ background: '#c9a961', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }}>2</div>
                                <span style={{ fontFamily: "var(--font-body, 'Montserrat', sans-serif)", fontSize: '0.9rem', fontWeight: 600 }}>{locale === 'tr' ? 'Montaj Tipi' : 'Mounting Type'}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f5f2ec', padding: '0.75rem', borderRadius: '8px', border: mountingType === 'rustic' ? '1px solid #c9a961' : '1px solid transparent' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontFamily: "var(--font-body, 'Montserrat', sans-serif)", fontSize: '0.85rem', fontWeight: 600, flex: 1 }}>
                                    <input
                                        type="checkbox"
                                        checked={mountingType === 'rustic'}
                                        onChange={(e) => {
                                            setMountingType(e.target.checked ? 'rustic' : 'cornice');
                                            if (e.target.checked) {
                                                setPleatDensity('0');
                                                setPleatType('flat');
                                            }
                                        }}
                                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#c9a961' }}
                                    />
                                    {locale === 'tr' ? 'Montaj Tipi Rustik Olsun' : 'Use Rustic Mounting'}
                                </label>

                                {/* Decorative Mini Rustic Image */}
                                <div style={{ width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e8e3d8', flexShrink: 0 }}>
                                    <img src="/media/curtain-options/rustic-mounting.jpg" alt="Rustic Mounting" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Total and Submit */}
            <div className={classes.wizardFooter}>
                {totalPrice > 0 && (
                    <div className={classes.priceBox}>
                        <div className={classes.priceRow}>
                            <span>{t('fabricUsage')}</span>
                            <span>{(fabricNeededPerCurtain * quantity).toFixed(2)} m</span>
                        </div>
                        <div className={classes.priceTotalRow}>
                            <span>{t('totalPrice')}</span>
                            <span className={classes.priceAmount}>{convertPrice(totalPrice)}</span>
                        </div>
                    </div>
                )}

                {stockError && <div className={classes.errText}>{stockError}</div>}

                <div className={classes.actionRowTop}>
                    <button className={classes.buyNowBtn} onClick={() => handleSubmit(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={classes.buyNowIcon}>
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                        {locale === 'tr' ? 'Şimdi Al' : 'Buy Now'}
                    </button>
                </div>

                <div className={classes.actionRowBottom}>
                    <div className={classes.quantityWrapper}>
                        <div className={classes.quantitySelector}>
                            <button type="button" onClick={handleDecrement} className={classes.quantityBtn}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                            <input type="text" readOnly value={quantity} className={classes.quantityInput} />
                            <button type="button" onClick={handleIncrement} className={classes.quantityBtn}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                    </div>

                    <button className={classes.addToCartBtn} onClick={() => handleSubmit(false)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                        </svg>
                        {locale === 'tr' ? 'Sepete Ekle' : t('addToCart')}
                    </button>

                    <button
                        type="button"
                        className={`${classes.favBtn} ${isFavorite ? classes.favActive : ''}`}
                        onClick={onToggleFavorite}
                        aria-label="Add to Favorites"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? "#c9a961" : "none"} stroke={isFavorite ? "#c9a961" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div >
    );
}
