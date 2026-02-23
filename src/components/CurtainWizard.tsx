'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaCheck, FaChevronDown, FaRuler, FaCut, FaArrowRight } from 'react-icons/fa';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useLocale, useTranslations } from 'next-intl';
import { Product, ProductVariant } from '@/lib/interfaces';
import { trackEnterMeasurements, trackSelectPleat } from '@/lib/tracking';
import classes from './CurtainWizard.module.css';

type MountingType = 'cornice' | 'rustic';
type PleatType = 'flat' | 'kanun' | 'pipe' | 'water_wave' | 'american';
type WingType = 'single' | 'double';
type Step = 'mounting' | 'pleat' | 'density' | 'wing' | 'dimensions';

interface CurtainWizardProps {
    product: Product;
    selectedVariant?: ProductVariant;
    unitPrice: number;
    onAddToCart: (data: any, totalPrice: number) => void;
    selectedAttributes?: { [key: string]: string };
    forceOpen?: boolean;
    hideHeader?: boolean;
}

export default function CurtainWizard({
    product, selectedVariant, unitPrice, onAddToCart, selectedAttributes = {}, forceOpen = false, hideHeader = false
}: CurtainWizardProps) {
    const locale = useLocale();
    const t = useTranslations('CustomCurtain');
    const { convertPrice } = useCurrency();

    const [currentStep, setCurrentStep] = useState<Step>('mounting');
    const [isOpen, setIsOpen] = useState(forceOpen);

    const [mountingType, setMountingType] = useState<MountingType | null>(null);
    const [pleatType, setPleatType] = useState<PleatType | null>(null);
    const [pleatDensity, setPleatDensity] = useState<string | null>(null);
    const [wingType, setWingType] = useState<WingType | null>(null);
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [heightError, setHeightError] = useState<string | null>(null);
    const [stockError, setStockError] = useState<string | null>(null);

    const availableDensities = useMemo(() => {
        if (!pleatType) return ['1x2', '1x2.5', '1x3'];
        switch (pleatType) {
            case 'flat': return ['0', '1x2', '1x2.5', '1x3'];
            case 'american': return ['1x3.5'];
            case 'water_wave': return ['1x3'];
            default: return ['1x2', '1x2.5', '1x3'];
        }
    }, [pleatType]);

    useEffect(() => {
        if (pleatDensity && !availableDensities.includes(pleatDensity)) setPleatDensity(null);
    }, [pleatType, availableDensities]);

    /* Steps order depends on mounting */
    const steps: Step[] = mountingType === 'rustic'
        ? ['mounting', 'wing', 'dimensions']
        : ['mounting', 'pleat', 'density', 'wing', 'dimensions'];

    const advance = (from: Step) => {
        const idx = steps.indexOf(from);
        if (idx < steps.length - 1) setTimeout(() => setCurrentStep(steps[idx + 1]), 220);
    };

    /* Height validation */
    useEffect(() => {
        if (!height) { setHeightError(null); return; }
        const heightKey = Object.keys(selectedAttributes).find(k =>
            ['height', 'boy', 'yükseklik'].includes(k.toLowerCase())
        );
        let maxH = 320;
        if (heightKey) {
            const m = selectedAttributes[heightKey].match(/(\d+(\.\d+)?)/);
            if (m) maxH = parseFloat(m[0]);
        }
        setHeightError(parseFloat(height) > maxH
            ? t('maxHeightError', { max: maxH })
            : null);
    }, [height, selectedAttributes, t]);

    /* Price */
    const densityMult = useMemo(() => {
        if (!pleatDensity || pleatDensity === '0' || mountingType === 'rustic') return 1;
        const p = pleatDensity.split('x');
        return p.length === 2 ? parseFloat(p[1]) : 1;
    }, [pleatDensity, mountingType]);

    const fabricNeeded = useMemo(() => {
        if (!width) return 0;
        const wm = parseFloat(width) / 100;
        return wm * densityMult * (wingType === 'double' ? 2 : 1);
    }, [width, densityMult, wingType]);

    const totalPrice = useMemo(() => {
        if (!width || !height || !wingType || !mountingType) return 0;
        const wm = parseFloat(width) / 100;
        const wings = wingType === 'double' ? 2 : 1;
        const fabricCost = fabricNeeded * unitPrice;
        let pleatCost = 0;
        if (mountingType === 'cornice' && pleatType) {
            const rate = ['american', 'water_wave'].includes(pleatType) ? 2.5 : (pleatDensity === '0' ? 0 : 1.25);
            pleatCost = wm * rate * densityMult * wings;
        }
        const mountCost = mountingType === 'rustic' ? wm * 5 * wings : wm * 1.25 * wings;
        return fabricCost + pleatCost + mountCost;
    }, [width, height, wingType, mountingType, pleatType, pleatDensity, densityMult, fabricNeeded, unitPrice]);

    /* Stock check */
    useEffect(() => {
        if (!width || !height) { setStockError(null); return; }
        let avail = 0;
        if (selectedVariant?.variant_quantity) avail = Number(selectedVariant.variant_quantity);
        else if (product.available_quantity) avail = Number(product.available_quantity) / 100;
        else if (product.quantity) avail = Number(product.quantity) / 100;
        setStockError(fabricNeeded > avail
            ? t('insufficientStock', { required: fabricNeeded.toFixed(1), available: avail.toFixed(1) })
            : null);
    }, [fabricNeeded, width, height, selectedVariant, product, t]);

    const canSubmit = !!(width && height && wingType && mountingType && !heightError && !stockError && totalPrice > 0);

    const handleSubmit = () => {
        if (!canSubmit) return;

        // Tracking: Enter Measurements Event
        trackEnterMeasurements(Number(width), Number(height), mountingType as string);
        console.log('[Tracking] enter_measurements event fired', { width, height, mountingType });

        onAddToCart({
            mountingType, pleatType, pleatDensity,
            width, height, wingType,
            isCustomCurtain: true,
            fabricMeters: Number(fabricNeeded.toFixed(2))
        }, totalPrice);
    };

    /* Select + advance */
    const selectMounting = (v: MountingType) => {
        setMountingType(v);
        if (v === 'rustic') { setPleatType(null); setPleatDensity(null); }
        advance('mounting');
    };
    const selectPleat = (v: PleatType) => { setPleatType(v); advance('pleat'); };
    const selectDensity = (v: string) => {
        setPleatDensity(v);
        advance('density');

        // Tracking: Select Pleat Event
        if (pleatType) {
            trackSelectPleat(pleatType, v);
            console.log('[Tracking] select_pleat event fired', { pleatType, pleatDensity: v });
        }
    };
    const selectWing = (v: WingType) => { setWingType(v); advance('wing'); };

    const stepActive = (s: Step) => currentStep === s;

    /* A step is "done" if it has a value selected — independent of currentStep */
    const hasValue = (s: Step): boolean => {
        switch (s) {
            case 'mounting': return mountingType !== null;
            case 'pleat': return pleatType !== null;
            case 'density': return pleatDensity !== null;
            case 'wing': return wingType !== null;
            case 'dimensions': return !!(width && height);
        }
    };
    const stepDone = (s: Step) => !stepActive(s) && hasValue(s);

    /* A step is "unlocked" if it's the first step OR the previous step has a value */
    const isStepUnlocked = (s: Step) => {
        if (s === 'mounting') return true;
        const idx = steps.indexOf(s);
        if (idx <= 0) return false;
        return hasValue(steps[idx - 1]);
    };

    /* Locked = not active AND not done AND not unlocked */
    const stepLocked = (s: Step) => !stepActive(s) && !stepDone(s) && !isStepUnlocked(s);
    const stepVisible = (s: Step) => steps.includes(s);

    /* Pill labels */
    const mountLabel = mountingType ? (mountingType === 'cornice' ? t('cornice') : t('rustic')) : null;
    const pleatLabel = pleatType ? ({ flat: t('flat'), kanun: t('kanun'), pipe: t('pipe'), water_wave: t('water_wave'), american: t('american') } as Record<string, string>)[pleatType] : null;
    const densLabel = pleatDensity ? (pleatDensity === '0' ? t('noPleat') : pleatDensity) : null;
    const wingLabel = wingType ? (wingType === 'single' ? t('singleWing') : t('doubleWing')) : null;

    const stepNum = (s: Step): number => {
        const rusticMap: Partial<Record<Step, number>> = { mounting: 1, wing: 2, dimensions: 3 };
        const corniceMap: Partial<Record<Step, number>> = { mounting: 1, pleat: 2, density: 3, wing: 4, dimensions: 5 };
        return (mountingType === 'rustic' ? rusticMap[s] : corniceMap[s]) ?? 1;
    };

    return (
        <div className={classes.wizardWrapper}>

            {/* Clickable wizard header (Hidden if hideHeader is true) */}
            {!hideHeader && (
                <button
                    className={`${classes.wizardHeader} ${isOpen ? classes.wizardHeaderOpen : ''}`}
                    onClick={() => !forceOpen && setIsOpen(o => !o)}
                >
                    {/* Top row: icon + title + arrow */}
                    <div className={classes.wizardHeaderTop}>
                        <span className={classes.wizardHeaderIcon}><FaCut /></span>
                        <span className={classes.wizardHeaderTitle}>
                            {t('iWantCustomCurtains')}
                        </span>
                        <span className={`${classes.wizardHeaderArrow} ${isOpen ? classes.wizardHeaderArrowOpen : ''}`}>
                            <FaChevronDown />
                        </span>
                    </div>
                    {/* Step breadcrumbs row */}
                    <div className={classes.wizardStepCrumbs}>
                        {mountingType === 'rustic' ? (
                            <>
                                <span className={classes.crumb}>{t('mount')}</span>
                                <FaArrowRight className={classes.crumbArrow} />
                                <span className={classes.crumb}>{t('wing')}</span>
                                <FaArrowRight className={classes.crumbArrow} />
                                <span className={classes.crumb}>{t('size')}</span>
                            </>
                        ) : (
                            <>
                                <span className={classes.crumb}>{t('mount')}</span>
                                <FaArrowRight className={classes.crumbArrow} />
                                <span className={classes.crumb}>{t('pleat')}</span>
                                <FaArrowRight className={classes.crumbArrow} />
                                <span className={classes.crumb}>{t('density')}</span>
                                <FaArrowRight className={classes.crumbArrow} />
                                <span className={classes.crumb}>{t('wing')}</span>
                                <FaArrowRight className={classes.crumbArrow} />
                                <span className={classes.crumb}>{t('size')}</span>
                            </>
                        )}
                    </div>
                </button>
            )}

            {/* Expandable wizard panel */}
            {isOpen && (
                <div className={`${classes.wizardPanel} ${hideHeader ? classes.wizardPanelNoHeader : ''}`}>

                    {/* Confirmed pills */}
                    {(mountLabel || pleatLabel || densLabel || wingLabel) && (
                        <div className={classes.confirmedPills}>
                            {mountLabel && <button className={classes.pill} onClick={() => setCurrentStep('mounting')}><FaCheck className={classes.pillCheck} /> {mountLabel}</button>}
                            {pleatLabel && <button className={classes.pill} onClick={() => stepVisible('pleat') && setCurrentStep('pleat')}><FaCheck className={classes.pillCheck} /> {pleatLabel}</button>}
                            {densLabel && <button className={classes.pill} onClick={() => stepVisible('density') && setCurrentStep('density')}><FaCheck className={classes.pillCheck} /> {densLabel}</button>}
                            {wingLabel && <button className={classes.pill} onClick={() => setCurrentStep('wing')}><FaCheck className={classes.pillCheck} /> {wingLabel}</button>}
                        </div>
                    )}

                    {/* Introductory Welcome Text for Custom Curtains */}
                    {forceOpen && (
                        <div className={classes.wizardIntro}>
                            <h3 className={classes.wizardIntroTitle}>{t('wizardIntroTitle')}</h3>
                            <p className={classes.wizardIntroText}>{t('wizardIntroText')}</p>
                        </div>
                    )}

                    {/* ── STEP 1: Mounting ── */}
                    <div className={`${classes.step} ${stepActive('mounting') ? classes.stepActive : stepDone('mounting') ? classes.stepDone : stepLocked('mounting') ? classes.stepLocked : ''}`}>
                        <div className={classes.stepHeader} onClick={() => setCurrentStep('mounting')}>
                            <span className={classes.stepBadge}>{stepDone('mounting') ? <FaCheck /> : stepNum('mounting')}</span>
                            <span className={classes.stepTitle}>{t('chooseInstallationType')}</span>
                        </div>
                        {stepActive('mounting') && (
                            <div className={classes.imageGrid2}>
                                {([
                                    { v: 'cornice' as MountingType, src: '/media/curtain-options/cornice-mounting.jpg', alt: 'Cornice', label: t('cornice') },
                                    { v: 'rustic' as MountingType, src: '/media/curtain-options/rustic-mounting.jpg', alt: 'Rustic', label: t('rustic') },
                                ]).map(opt => (
                                    <button
                                        key={opt.v}
                                        className={`${classes.imgCard} ${mountingType === opt.v ? classes.imgCardSelected : ''}`}
                                        onClick={() => selectMounting(opt.v)}
                                    >
                                        <div className={classes.imgWrap}>
                                            <img src={opt.src} alt={opt.alt} onError={e => { (e.currentTarget as HTMLImageElement).src = '/media/placeholder-curtain.jpg'; }} />
                                            {mountingType === opt.v && <div className={classes.checkOverlay}><FaCheck /></div>}
                                        </div>
                                        <span className={classes.imgLabel}>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── STEP 2: Pleat Type ── */}
                    {stepVisible('pleat') && (
                        <div className={`${classes.step} ${stepActive('pleat') ? classes.stepActive : stepDone('pleat') ? classes.stepDone : stepLocked('pleat') ? classes.stepLocked : ''}`}>
                            <div className={classes.stepHeader} onClick={() => isStepUnlocked('pleat') && setCurrentStep('pleat')}>
                                <span className={classes.stepBadge}>{stepDone('pleat') ? <FaCheck /> : stepNum('pleat')}</span>
                                <span className={classes.stepTitle}>{t('choosePleatStyle')}</span>
                            </div>
                            {stepActive('pleat') && (
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
                                            onClick={() => selectPleat(opt.v)}
                                        >
                                            <div className={classes.imgWrap}>
                                                <img src={opt.src} alt={opt.alt} onError={e => { (e.currentTarget as HTMLImageElement).src = '/media/placeholder-curtain.jpg'; }} />
                                                {pleatType === opt.v && <div className={classes.checkOverlay}><FaCheck /></div>}
                                            </div>
                                            <span className={classes.imgLabel}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 3: Pleat Density ── */}
                    {stepVisible('density') && (
                        <div className={`${classes.step} ${stepActive('density') ? classes.stepActive : stepDone('density') ? classes.stepDone : stepLocked('density') ? classes.stepLocked : ''}`}>
                            <div className={classes.stepHeader} onClick={() => isStepUnlocked('density') && setCurrentStep('density')}>
                                <span className={classes.stepBadge}>{stepDone('density') ? <FaCheck /> : stepNum('density')}</span>
                                <span className={classes.stepTitle}>{t('choosePleatDensity')}</span>
                            </div>
                            {stepActive('density') && (
                                <div className={classes.chipRow}>
                                    {availableDensities.map(d => (
                                        <button key={d}
                                            className={`${classes.chip} ${pleatDensity === d ? classes.chipSelected : ''}`}
                                            onClick={() => selectDensity(d)}
                                        >
                                            {d === '0' ? t('noPleat') : d}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 4: Wing ── */}
                    <div className={`${classes.step} ${stepActive('wing') ? classes.stepActive : stepDone('wing') ? classes.stepDone : stepLocked('wing') ? classes.stepLocked : ''}`}>
                        <div className={classes.stepHeader} onClick={() => isStepUnlocked('wing') && setCurrentStep('wing')}>
                            <span className={classes.stepBadge}>{stepDone('wing') ? <FaCheck /> : stepNum('wing')}</span>
                            <span className={classes.stepTitle}>{t('chooseWingType')}</span>
                        </div>
                        {stepActive('wing') && (
                            <div className={classes.imageGrid2}>
                                {([
                                    { v: 'single' as WingType, src: '/media/curtain-options/wing-single.png', alt: 'Single', label: t('singleWing') },
                                    { v: 'double' as WingType, src: '/media/curtain-options/çift kanat.png', alt: 'Double', label: t('doubleWing') },
                                ]).map(opt => (
                                    <button
                                        key={opt.v}
                                        className={`${classes.imgCard} ${wingType === opt.v ? classes.imgCardSelected : ''}`}
                                        onClick={() => selectWing(opt.v)}
                                    >
                                        <div className={classes.imgWrap}>
                                            <img src={opt.src} alt={opt.alt} onError={e => { (e.currentTarget as HTMLImageElement).src = '/media/placeholder-curtain.jpg'; }} />
                                            {wingType === opt.v && <div className={classes.checkOverlay}><FaCheck /></div>}
                                        </div>
                                        <span className={classes.imgLabel}>{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── STEP 5: Dimensions ── */}
                    <div className={`${classes.step} ${stepActive('dimensions') ? classes.stepActive : stepDone('dimensions') ? classes.stepDone : stepLocked('dimensions') ? classes.stepLocked : ''}`}>
                        <div className={classes.stepHeader} onClick={() => isStepUnlocked('dimensions') && setCurrentStep('dimensions')}>
                            <span className={classes.stepBadge}>{stepDone('dimensions') ? <FaCheck /> : stepNum('dimensions')}</span>
                            <span className={classes.stepTitle}><FaRuler style={{ marginRight: '0.35rem' }} />{t('enterDimensions')}</span>
                        </div>
                        {stepActive('dimensions') && (
                            <div className={classes.dimsPanel}>
                                <div className={classes.dimHint}>
                                    💡 {t('dimensionHint')}
                                </div>
                                <div className={classes.dimRow}>
                                    <div className={classes.dimGroup}>
                                        <label>{t('width')}</label>
                                        <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="200" className={classes.dimInput} />
                                    </div>
                                    <div className={classes.dimGroup}>
                                        <label>{t('height')}</label>
                                        <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="260"
                                            className={`${classes.dimInput} ${heightError ? classes.dimInputError : ''}`} />
                                        {heightError && <div className={classes.errText}>{heightError}</div>}
                                    </div>
                                </div>

                                {totalPrice > 0 && (
                                    <div className={classes.priceBox}>
                                        <div className={classes.priceRow}>
                                            <span>{t('fabricUsage')}</span>
                                            <span>{fabricNeeded.toFixed(2)} m</span>
                                        </div>
                                        <div className={classes.priceTotalRow}>
                                            <span>{t('totalPrice')}</span>
                                            <span className={classes.priceAmount}>{convertPrice(totalPrice)}</span>
                                        </div>
                                    </div>
                                )}

                                {stockError && <div className={classes.errText}>{stockError}</div>}

                                <button className={classes.submitBtn} onClick={handleSubmit} disabled={!canSubmit}>
                                    {t('addToCart')} →
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            )}
        </div>
    );
}
