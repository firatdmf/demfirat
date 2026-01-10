'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import styles from './page.module.css';

interface OrderItem {
    product_sku: string;
    product_title: string;
    product_image?: string | null;
    variant_sku: string | null;
    quantity: string;
    price: string;
    status: string;
    // Custom Curtain Fields
    is_custom_curtain?: boolean;
    custom_fabric_used_meters?: string | null;
    custom_attributes?: {
        mounting_type?: string | null;
        pleat_type?: string | null;
        pleat_density?: string | null;
        width?: string | null;
        height?: string | null;
        wing_type?: string | null;
    } | null;
}

interface OrderData {
    id: number;
    order_number: string;
    status: string;
    order_status: string;
    order_status_display: string;
    created_at: string;
    updated_at: string;
    carrier: string;
    carrier_display: string;
    tracking_number: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    original_currency: string;
    original_price: string;
    paid_currency: string;
    paid_amount: string;
    delivery_address: {
        title: string;
        address: string;
        city: string;
        country: string;
        phone: string;
    };
    items: OrderItem[];
    total_items: number;
}

// Order status timeline steps
const ORDER_STATUSES = [
    { key: 'pending', icon: '⏳' },
    { key: 'confirmed', icon: '✓' },
    { key: 'preparing', icon: '📦' },
    { key: 'shipped', icon: '🚚' },
    { key: 'in_transit', icon: '🛤️' },
    { key: 'delivered', icon: '✅' },
];

export default function OrderTrackingPage() {
    const t = useTranslations('OrderTracking');
    const locale = useLocale();
    const [orderNumber, setOrderNumber] = useState('');
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!orderNumber.trim()) {
            setError(t('enterOrderNumber'));
            return;
        }

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const response = await fetch(`/api/orders/track?order_number=${encodeURIComponent(orderNumber.trim())}`);
            const data = await response.json();

            if (!response.ok || !data.success) {
                setError(data.error || t('notFound'));
                return;
            }

            setOrder(data.order);
        } catch (err) {
            setError(t('notFound'));
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = (status: string) => {
        const index = ORDER_STATUSES.findIndex(s => s.key === status);
        return index >= 0 ? index : 0;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        const localeMap: Record<string, string> = {
            tr: 'tr-TR',
            en: 'en-US',
            ru: 'ru-RU',
            pl: 'pl-PL'
        };
        return new Date(dateStr).toLocaleDateString(localeMap[locale] || 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>{t('title')}</h1>
                <p className={styles.subtitle}>{t('subtitle')}</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className={styles.searchForm}>
                <div className={styles.inputGroup}>
                    <input
                        type="text"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                        placeholder={t('orderNumberPlaceholder')}
                        className={styles.searchInput}
                        maxLength={20}
                    />
                    <button
                        type="submit"
                        className={styles.searchButton}
                        disabled={loading}
                    >
                        {loading ? t('searching') : t('search')}
                    </button>
                </div>
                <p className={styles.hint}>{t('hint')}</p>
            </form>

            {/* Error Message */}
            {error && (
                <div className={styles.errorCard}>
                    <span className={styles.errorIcon}>❌</span>
                    <p>{error}</p>
                </div>
            )}

            {/* Order Details */}
            {order && (
                <div className={styles.orderDetails}>
                    {/* Order Header */}
                    <div className={styles.orderHeader}>
                        <div className={styles.orderInfo}>
                            <h2>{t('orderNumber')}: {order.order_number}</h2>
                            <p className={styles.orderDate}>
                                {t('orderDate')}: {formatDate(order.created_at)}
                            </p>
                        </div>
                        <div className={styles.statusBadge} data-status={order.order_status}>
                            {t(`status.${order.order_status}`)}
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className={styles.timelineSection}>
                        <h3>{t('orderStatus')}</h3>
                        <div className={styles.timeline}>
                            {ORDER_STATUSES.map((status, index) => {
                                const currentIndex = getStatusIndex(order.order_status);
                                const isCompleted = index <= currentIndex;
                                const isCurrent = index === currentIndex;

                                return (
                                    <div
                                        key={status.key}
                                        className={`${styles.timelineItem} ${isCompleted ? styles.completed : ''} ${isCurrent ? styles.current : ''}`}
                                    >
                                        <div className={styles.timelineIcon}>{status.icon}</div>
                                        <div className={styles.timelineLabel}>
                                            {t(`status.${status.key}`)}
                                        </div>
                                        {index < ORDER_STATUSES.length - 1 && (
                                            <div className={`${styles.timelineLine} ${isCompleted ? styles.completedLine : ''}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tracking Info */}
                    {order.tracking_number && (
                        <div className={styles.trackingSection}>
                            <h3>{t('trackingInfo')}</h3>
                            <div className={styles.trackingCard}>
                                <div className={styles.trackingRow}>
                                    <span className={styles.trackingLabel}>{t('carrier')}:</span>
                                    <span className={styles.trackingValue}>{order.carrier_display || order.carrier}</span>
                                </div>
                                <div className={styles.trackingRow}>
                                    <span className={styles.trackingLabel}>{t('trackingNumber')}:</span>
                                    <span className={styles.trackingValue}>{order.tracking_number}</span>
                                </div>
                                {order.shipped_at && (
                                    <div className={styles.trackingRow}>
                                        <span className={styles.trackingLabel}>{t('shippedAt')}:</span>
                                        <span className={styles.trackingValue}>{formatDate(order.shipped_at)}</span>
                                    </div>
                                )}
                                {order.delivered_at && (
                                    <div className={styles.trackingRow}>
                                        <span className={styles.trackingLabel}>{t('deliveredAt')}:</span>
                                        <span className={styles.trackingValue}>{formatDate(order.delivered_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className={styles.itemsSection}>
                        <h3>{t('orderItems')} ({order.total_items})</h3>
                        <div className={styles.itemsList}>
                            {order.items.map((item, index) => (
                                <div key={index} className={styles.itemCard}>
                                    <div className={styles.itemInfo}>
                                        <h4>{item.product_title}</h4>
                                        <p className={styles.itemSku}>
                                            SKU: {item.variant_sku || item.product_sku}
                                        </p>
                                        {/* Custom Curtain Badge & Details */}
                                        {item.is_custom_curtain && (
                                            <div style={{ marginTop: '0.5rem' }}>
                                                <span style={{
                                                    display: 'inline-block',
                                                    padding: '0.25rem 0.75rem',
                                                    background: '#7c3aed',
                                                    color: 'white',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    borderRadius: '9999px',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    ✂️ {t('customCurtain')}
                                                </span>
                                                {item.custom_attributes && (
                                                    <div style={{
                                                        background: '#f5f3ff',
                                                        padding: '0.5rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.8rem',
                                                        color: '#5b21b6',
                                                        lineHeight: '1.5'
                                                    }}>
                                                        {item.custom_attributes.width && item.custom_attributes.height && (
                                                            <div>📏 {t('dimensions')}: {item.custom_attributes.width}cm x {item.custom_attributes.height}cm</div>
                                                        )}
                                                        {item.custom_attributes.pleat_type && (
                                                            <div>🧵 {t('pleatType')}: {t(`pleatTypes.${item.custom_attributes.pleat_type}`)}</div>
                                                        )}
                                                        {item.custom_attributes.pleat_density && (
                                                            <div>📊 {t('pleatDensity')}: {item.custom_attributes.pleat_density}</div>
                                                        )}
                                                        {item.custom_attributes.mounting_type && (
                                                            <div>🔧 {t('mountingType')}: {t(`mountingTypes.${item.custom_attributes.mounting_type}`)}</div>
                                                        )}
                                                        {item.custom_fabric_used_meters && (
                                                            <div style={{ fontWeight: 600, color: '#7c3aed' }}>🧶 {t('fabric')}: {item.custom_fabric_used_meters} {t('meter')}</div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.itemDetails}>
                                        <span>{t('quantity')}: {item.quantity}</span>
                                        <span>{t('price')}: {item.price} {order.original_currency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    {order.delivery_address && (
                        <div className={styles.addressSection}>
                            <h3>{t('deliveryAddress')}</h3>
                            <div className={styles.addressCard}>
                                <p>{order.delivery_address.address}</p>
                                <p>{order.delivery_address.city}, {order.delivery_address.country}</p>
                                {order.delivery_address.phone && (
                                    <p>{t('phone')}: {order.delivery_address.phone}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className={styles.totalSection}>
                        <div className={styles.totalRow}>
                            <span>{t('total')}:</span>
                            <span className={styles.totalAmount}>
                                {order.paid_amount} {order.paid_currency}
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
