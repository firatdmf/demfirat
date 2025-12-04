'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaRuler, FaCut, FaLayerGroup, FaInfoCircle, FaCheck } from 'react-icons/fa';
import classes from './CustomCurtainSidebar.module.css';
import { Product, ProductVariant } from '@/lib/interfaces';

import { useTranslations, useLocale } from 'next-intl';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CustomCurtainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  selectedVariant?: ProductVariant;
  unitPrice: number;
  currency: string;
  onAddToCart: (customizationData: any, totalPrice: number) => void;
  selectedAttributes?: { [key: string]: string };
}

type MountingType = 'cornice' | 'rustic';
type PleatType = 'flat' | 'kanun' | 'pipe' | 'water_wave' | 'american' | 'extrafor';
type WingType = 'single' | 'double';

export default function CustomCurtainSidebar({
  isOpen,
  onClose,
  product,
  selectedVariant,
  unitPrice,
  currency,
  onAddToCart,
  selectedAttributes = {}
}: CustomCurtainSidebarProps) {
  // State
  const [mountingType, setMountingType] = useState<MountingType>('cornice');
  const [pleatType, setPleatType] = useState<PleatType>('flat');
  const [pleatDensity, setPleatDensity] = useState<string>('1x2');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [wingType, setWingType] = useState<WingType>('single');
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Stock validation states
  const [stockError, setStockError] = useState<string | null>(null);
  const [isStockSufficient, setIsStockSufficient] = useState(true);
  const [requiredFabric, setRequiredFabric] = useState<number>(0);

  // Height validation states
  const [heightError, setHeightError] = useState<string | null>(null);
  const [isHeightValid, setIsHeightValid] = useState(true);

  // Translations
  const t = useTranslations('CustomCurtain');
  const locale = useLocale();
  const { convertPrice } = useCurrency();

  // Helper to format price
  // Helper to format price
  const formatPrice = (price: number) => {
    return convertPrice(price);
  };

  // Available Pleat Densities based on Pleat Type
  const availableDensities = useMemo(() => {
    switch (pleatType) {
      case 'flat': // Yatık Pile
        return ['0', '1x2', '1x2.5', '1x3']; // 0 for Pilesiz
      case 'american': // Amerikan Pile
        return ['1x3.5'];
      case 'water_wave': // Su Dalgası
        return ['1x3'];
      default:
        return ['1x2', '1x2.5', '1x3'];
    }
  }, [pleatType]);

  // Reset density when pleat type changes if current density is not available
  useEffect(() => {
    if (!availableDensities.includes(pleatDensity)) {
      setPleatDensity(availableDensities[0]);
    }
  }, [pleatType, availableDensities, pleatDensity]);

  // Calculate Price with labor costs
  useEffect(() => {
    if (!width || !height) {
      setTotalPrice(0);
      return;
    }

    // Perde uzunluğu (width) metreler cinsinden
    const perdeLengthMeters = parseFloat(width) / 100;

    let densityMultiplier = 1;
    if (pleatDensity !== '0') {
      // Extract multiplier from string like "1x2.5" -> 2.5
      const parts = pleatDensity.split('x');
      if (parts.length === 2) {
        densityMultiplier = parseFloat(parts[1]);
      }
    }

    // Kumaş miktarı = Perde Uzunluğu × Pile Yoğunluğu
    let fabricNeeded = perdeLengthMeters * densityMultiplier;

    if (wingType === 'double') {
      fabricNeeded *= 2;
    }

    // KUMAŞ MALİYETİ = Kumaş Miktarı × Kumaş Fiyatı (pile yoğunluğu ÜNCEKİNDE çarpılır)
    const fabricCost = fabricNeeded * unitPrice;

    // Montaj maliyeti (Korniş/Rustik) = Perde Uzunluğu × Montaj Fiyatı $/meter
    let mountingCost = 0;
    if (mountingType === 'cornice' || mountingType === 'rustic') {
      mountingCost = perdeLengthMeters * 5; // $5/meter
    }

    // Pile tipi maliyeti = Perde Uzunluğu × Pile Fiyatı $/meter (pile yoğunluğu ile çarpılmaz!)
    let pleatCost = 0;
    switch (pleatType) {
      case 'flat': // Yatık Pile
        if (pleatDensity === '0') {
          pleatCost = perdeLengthMeters * 1; // Pilesiz: $1/meter
        } else {
          pleatCost = perdeLengthMeters * 1.25; // Yatık Pile: $1.25/meter
        }
        break;
      case 'american': // Amerikan Pile
        pleatCost = perdeLengthMeters * 2.5; // $2.5/meter
        break;
      case 'water_wave': // Su Dalgası
        pleatCost = perdeLengthMeters * 2.5; // $2.5/meter
        break;
      case 'kanun': // Kanun Pile
        pleatCost = perdeLengthMeters * 1.25; // $1.25/meter
        break;
      case 'pipe': // Boru Pile
        pleatCost = perdeLengthMeters * 1.25; // $1.25/meter
        break;
      default:
        pleatCost = perdeLengthMeters * 1.25;
    }

    // TOPLAM = Kumaş Maliyeti + Montaj Maliyeti + Pile Maliyeti
    const totalPrice = fabricCost + mountingCost + pleatCost;

    setTotalPrice(totalPrice);
    setRequiredFabric(fabricNeeded);
  }, [width, height, pleatDensity, wingType, mountingType, pleatType, unitPrice]);

  // Stock Validation
  useEffect(() => {
    if (!width || !height) {
      setStockError(null);
      setIsStockSufficient(true);
      return;
    }

    // Use selectedVariant stock if available, otherwise use product stock
    // Note: variant_quantity is already in meters, product.quantity/available_quantity might be in cm
    let availableMeters = 0;
    if (selectedVariant?.variant_quantity) {
      availableMeters = Number(selectedVariant.variant_quantity); // Already in meters
    } else if (selectedVariant) {
      // Variant exists but no variant_quantity, use product quantity
      if (product.available_quantity) {
        availableMeters = Number(product.available_quantity) / 100; // Convert cm to meters
      } else if (product.quantity) {
        availableMeters = Number(product.quantity) / 100; // Convert cm to meters
      }
    } else if (product.available_quantity) {
      availableMeters = Number(product.available_quantity) / 100; // Convert cm to meters
    } else if (product.quantity) {
      availableMeters = Number(product.quantity) / 100; // Convert cm to meters
    }
    const requiredMeters = requiredFabric;

    if (requiredMeters > availableMeters) {
      setStockError(
        locale === 'tr'
          ? `Yetersiz stok! Gerekli: ${requiredMeters.toFixed(2)}m, Mevcut: ${availableMeters.toFixed(2)}m`
          : `Insufficient stock! Required: ${requiredMeters.toFixed(2)}m, Available: ${availableMeters.toFixed(2)}m`
      );
      setIsStockSufficient(false);
    } else {
      setStockError(null);
      setIsStockSufficient(true);
    }
  }, [requiredFabric, selectedVariant?.variant_quantity, product.available_quantity, product.quantity, width, height, locale]);

  // Height Validation
  useEffect(() => {
    if (!height) {
      setHeightError(null);
      setIsHeightValid(true);
      return;
    }

    const currentHeight = parseFloat(height);
    let maxHeight = 320; // Default max height

    // Check for height attribute in selectedAttributes
    // Look for keys like "height", "boy", "yükseklik" (case-insensitive)
    const heightKey = Object.keys(selectedAttributes).find(key =>
      key.toLowerCase() === 'height' ||
      key.toLowerCase() === 'boy' ||
      key.toLowerCase() === 'yükseklik'
    );

    if (heightKey) {
      const heightValue = selectedAttributes[heightKey];
      // Extract number from string (e.g., "330 cm" -> 330)
      const match = heightValue.match(/(\d+(\.\d+)?)/);
      if (match) {
        maxHeight = parseFloat(match[0]);
      }
    }

    if (currentHeight > maxHeight) {
      setHeightError(
        locale === 'tr'
          ? `Maksimum yükseklik ${maxHeight} cm olabilir.`
          : `Maximum height can be ${maxHeight} cm.`
      );
      setIsHeightValid(false);
    } else {
      setHeightError(null);
      setIsHeightValid(true);
    }
  }, [height, selectedAttributes, locale]);

  const handleAddToCart = () => {
    if (!width || !height) return;

    onAddToCart({
      mountingType,
      pleatType,
      pleatDensity,
      width,
      height,
      wingType,
      isCustomCurtain: true,
      fabricMeters: Number(requiredFabric.toFixed(2))
    }, totalPrice);
  };

  if (!isOpen) return null;

  return (
    <div className={classes.overlay} onClick={onClose}>
      <div className={classes.sidebar} onClick={e => e.stopPropagation()}>
        <div className={classes.header}>
          <h2>{t('title')}</h2>
          <button onClick={onClose} className={classes.closeBtn}>
            <FaTimes />
          </button>
        </div>

        <div className={classes.content}>
          {/* Mounting Type - With Images */}
          <div className={classes.section}>
            <label className={classes.label}>
              <FaLayerGroup className={classes.icon} /> {t('mountingType')}
            </label>
            <div className={classes.imageOptionsGrid}>
              <button
                className={`${classes.imageOptionCard} ${mountingType === 'cornice' ? classes.selected : ''}`}
                onClick={() => setMountingType('cornice')}
              >
                <div className={classes.imageWrapper}>
                  <img
                    src="/media/curtain-options/cornice-mounting.jpg"
                    alt="Cornice Mounting"
                    onError={(e) => {
                      e.currentTarget.src = '/media/placeholder-curtain.jpg';
                    }}
                  />
                  {mountingType === 'cornice' && (
                    <div className={classes.checkmark}>
                      <FaCheck />
                    </div>
                  )}
                </div>
                <span className={classes.optionLabel}>{t('cornice')}</span>
              </button>
              <button
                className={`${classes.imageOptionCard} ${mountingType === 'rustic' ? classes.selected : ''}`}
                onClick={() => setMountingType('rustic')}
              >
                <div className={classes.imageWrapper}>
                  <img
                    src="/media/curtain-options/rustic-mounting.jpg"
                    alt="Rustic Mounting"
                    onError={(e) => {
                      e.currentTarget.src = '/media/placeholder-curtain.jpg';
                    }}
                  />
                  {mountingType === 'rustic' && (
                    <div className={classes.checkmark}>
                      <FaCheck />
                    </div>
                  )}
                </div>
                <span className={classes.optionLabel}>{t('rustic')}</span>
              </button>
            </div>
          </div>

          {/* Pleat Type - Only show if not Rustic mounting */}
          {mountingType === 'cornice' && (
            <div className={classes.section}>
              <label className={classes.label}>
                <FaCut className={classes.icon} /> {t('pleatType')}
              </label>
              <div className={`${classes.imageOptionsGrid} ${classes.pleatTypeGrid}`}>
                <button
                  className={`${classes.imageOptionCard} ${pleatType === 'flat' ? classes.selected : ''}`}
                  onClick={() => setPleatType('flat')}
                >
                  <div className={classes.imageWrapper}>
                    <img
                      src="/media/curtain-options/pleat-flat.jpg"
                      alt="Flat Pleat"
                      onError={(e) => {
                        e.currentTarget.src = '/media/placeholder-curtain.jpg';
                      }}
                    />
                    {pleatType === 'flat' && (
                      <div className={classes.checkmark}>
                        <FaCheck />
                      </div>
                    )}
                  </div>
                  <span className={classes.optionLabel}>{t('flat')}</span>
                </button>
                <button
                  className={`${classes.imageOptionCard} ${pleatType === 'kanun' ? classes.selected : ''}`}
                  onClick={() => setPleatType('kanun')}
                >
                  <div className={classes.imageWrapper}>
                    <img
                      src="/media/curtain-options/pleat-kanun.jpg"
                      alt="Kanun Pleat"
                      onError={(e) => {
                        e.currentTarget.src = '/media/placeholder-curtain.jpg';
                      }}
                    />
                    {pleatType === 'kanun' && (
                      <div className={classes.checkmark}>
                        <FaCheck />
                      </div>
                    )}
                  </div>
                  <span className={classes.optionLabel}>{t('kanun')}</span>
                </button>
                <button
                  className={`${classes.imageOptionCard} ${pleatType === 'pipe' ? classes.selected : ''}`}
                  onClick={() => setPleatType('pipe')}
                >
                  <div className={classes.imageWrapper}>
                    <img
                      src="/media/curtain-options/pleat-pipe.jpg"
                      alt="Pipe Pleat"
                      onError={(e) => {
                        e.currentTarget.src = '/media/placeholder-curtain.jpg';
                      }}
                    />
                    {pleatType === 'pipe' && (
                      <div className={classes.checkmark}>
                        <FaCheck />
                      </div>
                    )}
                  </div>
                  <span className={classes.optionLabel}>{t('pipe')}</span>
                </button>
                <button
                  className={`${classes.imageOptionCard} ${pleatType === 'water_wave' ? classes.selected : ''}`}
                  onClick={() => setPleatType('water_wave')}
                >
                  <div className={classes.imageWrapper}>
                    <img
                      src="/media/curtain-options/pleat-water-wave.jpg"
                      alt="Water Wave Pleat"
                      onError={(e) => {
                        e.currentTarget.src = '/media/placeholder-curtain.jpg';
                      }}
                    />
                    {pleatType === 'water_wave' && (
                      <div className={classes.checkmark}>
                        <FaCheck />
                      </div>
                    )}
                  </div>
                  <span className={classes.optionLabel}>{t('water_wave')}</span>
                </button>
                <button
                  className={`${classes.imageOptionCard} ${pleatType === 'american' ? classes.selected : ''}`}
                  onClick={() => setPleatType('american')}
                >
                  <div className={classes.imageWrapper}>
                    <img
                      src="/media/curtain-options/pleat-american.jpg"
                      alt="American Pleat"
                      onError={(e) => {
                        e.currentTarget.src = '/media/placeholder-curtain.jpg';
                      }}
                    />
                    {pleatType === 'american' && (
                      <div className={classes.checkmark}>
                        <FaCheck />
                      </div>
                    )}
                  </div>
                  <span className={classes.optionLabel}>{t('american')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Pleat Density - Only show if not Rustic mounting */}
          {mountingType === 'cornice' && (
            <div className={classes.section}>
              <label className={classes.label}>
                <FaLayerGroup className={classes.icon} /> {t('pleatDensity')}
              </label>
              <div className={classes.optionsGrid}>
                {availableDensities.map(density => (
                  <button
                    key={density}
                    className={`${classes.optionBtn} ${pleatDensity === density ? classes.selected : ''}`}
                    onClick={() => setPleatDensity(density)}
                  >
                    {density === '0' ? t('noPleat') : density}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dimensions */}
          <div className={classes.section}>
            <label className={classes.label}>
              <FaRuler className={classes.icon} /> {t('dimensions')}
            </label>
            <div className={classes.inputRow}>
              <div className={classes.inputGroup}>
                <label>{t('width')}</label>
                <input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="200"
                  className={classes.input}
                />
              </div>
              <div className={classes.inputGroup}>
                <label>{t('height')}</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="260"
                  className={`${classes.input} ${!isHeightValid ? classes.inputError : ''}`}
                />
                {heightError && <div className={classes.errorText} style={{ color: 'red', fontSize: '0.8rem', marginTop: '0.25rem' }}>{heightError}</div>}
              </div>
            </div>
          </div>

          {/* Wing Type */}
          <div className={classes.section}>
            <label className={classes.label}>
              <FaLayerGroup className={classes.icon} /> {t('wingType')}
            </label>
            <div className={classes.optionsGrid}>
              <button
                className={`${classes.optionBtn} ${wingType === 'single' ? classes.selected : ''}`}
                onClick={() => setWingType('single')}
              >
                {t('singleWing')}
              </button>
              <button
                className={`${classes.optionBtn} ${wingType === 'double' ? classes.selected : ''}`}
                onClick={() => setWingType('double')}
              >
                {t('doubleWing')}
              </button>
            </div>
          </div>

          {/* Stock Availability Display */}
          {((selectedVariant && selectedVariant.variant_quantity) || product.available_quantity || product.quantity) && (
            <div className={classes.section}>
              <label className={classes.label}>
                <FaInfoCircle className={classes.icon} />
                {locale === 'tr' ? 'Mevcut Stok' : 'Available Stock'}
              </label>
              <div className={classes.stockBadge}>
                {(() => {
                  // Variant selected and has its own quantity (meters)
                  if (selectedVariant?.variant_quantity) {
                    return Number(selectedVariant.variant_quantity).toFixed(2);
                  }
                  // Variant selected but no variant_quantity -> fall back to product stock (convert cm to m)
                  if (selectedVariant) {
                    if (product.available_quantity) return (Number(product.available_quantity) / 100).toFixed(2);
                    if (product.quantity) return (Number(product.quantity) / 100).toFixed(2);
                  }
                  // No variant selected -> use product stock
                  if (product.available_quantity) return (Number(product.available_quantity) / 100).toFixed(2);
                  if (product.quantity) return (Number(product.quantity) / 100).toFixed(2);
                  return '-';
                })()} m
              </div>
            </div>
          )}

          {/* Stock Error Message */}
          {stockError && (
            <div className={classes.stockError}>
              <FaInfoCircle /> {stockError}
            </div>
          )}

          {/* Summary & Price */}
          <div className={classes.summary}>
            <div className={classes.priceRow}>
              <span>{t('fabricUsage')}:</span>
              <span>
                {width && pleatDensity ? (
                  <>
                    {((parseFloat(width) / 100) * (pleatDensity === '0' ? 1 : parseFloat(pleatDensity.split('x')[1])) * (wingType === 'double' ? 2 : 1)).toFixed(2)} {t('meter')}
                  </>
                ) : '-'}
              </span>
            </div>
            <div className={classes.totalPrice}>
              <span>{t('totalPrice')}:</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <button
            className={classes.addToCartBtn}
            onClick={handleAddToCart}
            disabled={!width || !height || totalPrice === 0 || !isStockSufficient || !isHeightValid}
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
