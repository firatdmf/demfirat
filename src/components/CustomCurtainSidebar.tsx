'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaRuler, FaCut, FaLayerGroup, FaInfoCircle, FaCheck } from 'react-icons/fa';
import classes from './CustomCurtainSidebar.module.css';
import { Product } from '@/lib/interfaces';

import { useTranslations, useLocale } from 'next-intl';
import { useCurrency } from '@/contexts/CurrencyContext';

interface CustomCurtainSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  unitPrice: number;
  currency: string;
  onAddToCart: (customizationData: any, totalPrice: number) => void;
}

type MountingType = 'cornice' | 'rustic';
type PleatType = 'flat' | 'kanun' | 'pipe' | 'water_wave' | 'american' | 'extrafor';
type WingType = 'single' | 'double';

export default function CustomCurtainSidebar({
  isOpen,
  onClose,
  product,
  unitPrice,
  currency,
  onAddToCart
}: CustomCurtainSidebarProps) {
  // State
  const [mountingType, setMountingType] = useState<MountingType>('cornice');
  const [pleatType, setPleatType] = useState<PleatType>('flat');
  const [pleatDensity, setPleatDensity] = useState<string>('1x2');
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [wingType, setWingType] = useState<WingType>('single');
  const [totalPrice, setTotalPrice] = useState<number>(0);

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

  // Calculate Price
  useEffect(() => {
    if (!width || !height) {
      setTotalPrice(0);
      return;
    }

    const widthMeters = parseFloat(width) / 100;
    let densityMultiplier = 1;

    if (pleatDensity !== '0') {
      // Extract multiplier from string like "1x2.5" -> 2.5
      const parts = pleatDensity.split('x');
      if (parts.length === 2) {
        densityMultiplier = parseFloat(parts[1]);
      }
    }

    // Base fabric needed = Width * Density
    let fabricNeeded = widthMeters * densityMultiplier;

    // If Double Wing, we need double the fabric? 
    // Usually "Width" is the total covered width. 
    // If user says 200cm width and double wing, it means 2 wings covering 200cm total (100cm each).
    // OR does it mean 2 wings of 200cm each? 
    // Standard practice: Input is TOTAL width. Wing selection just splits it.
    // BUT user said: "Yani 2 ise 2 ye katlanır... eğer çift kanat ise fiyat yine 2 ile çarpılır."
    // This implies the user inputs the width for ONE wing, or the logic specifically requests doubling for double wing.
    // Let's follow user instruction: "eğer çift kanat ise fiyat yine 2 ile çarpılır."

    if (wingType === 'double') {
      fabricNeeded *= 2;
    }

    // Price = Fabric Needed * Unit Price
    // Note: Height usually doesn't affect price for fabrics sold by width (tulles/curtains often have fixed height like 280-300cm), 
    // but if it's sold by meter length, then width is the main factor.
    // Assuming standard curtain fabric pricing logic where you pay for the width of fabric used.

    setTotalPrice(fabricNeeded * unitPrice);
  }, [width, height, pleatDensity, wingType, unitPrice]);

  const handleAddToCart = () => {
    if (!width || !height) return;

    onAddToCart({
      mountingType,
      pleatType,
      pleatDensity,
      width,
      height,
      wingType,
      isCustomCurtain: true
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
                  className={classes.input}
                />
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
            disabled={!width || !height || totalPrice === 0}
          >
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
