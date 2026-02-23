export const pushToDataLayer = (eventName: string, payload: any = {}) => {
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
            event: eventName,
            ...payload
        });
    }
};

export const pushToFbPixel = (eventName: string, payload: any = {}, isCustom: boolean = false) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
        const trackType = isCustom ? 'trackCustom' : 'track';
        if (Object.keys(payload).length > 0) {
            (window as any).fbq(trackType, eventName, payload);
        } else {
            (window as any).fbq(trackType, eventName);
        }
    }
};

// Generic Event helpers
export const trackViewItem = (itemType: string, itemId: string, itemName: string, value: number, currency: string = 'TRY') => {
    pushToDataLayer('view_item', {
        ecommerce: {
            currency: currency,
            value: value,
            items: [
                {
                    item_id: String(itemId),
                    item_name: itemName,
                    item_category: itemType,
                    price: value,
                    quantity: 1
                }
            ]
        }
    });

    pushToFbPixel('ViewContent', {
        content_ids: [String(itemId)],
        content_name: itemName,
        content_type: 'product',
        value: value,
        currency: currency
    });
};

export const trackAddToCart = (itemType: string, itemId: string, itemName: string, value: number, quantity: number, currency: string = 'TRY', intent?: string) => {
    pushToDataLayer('add_to_cart', {
        ecommerce: {
            currency: currency,
            value: value * quantity,
            items: [
                {
                    item_id: String(itemId),
                    item_name: itemName,
                    item_category: itemType,
                    item_variant: intent,
                    price: value,
                    quantity: quantity
                }
            ]
        }
    });

    pushToFbPixel('AddToCart', {
        content_ids: [String(itemId)],
        content_name: itemName,
        content_type: 'product',
        value: value * quantity,
        currency: currency
    });
};

export const trackBeginCheckout = (cartValue: number, items: any[], currency: string = 'TRY') => {
    pushToDataLayer('begin_checkout', {
        ecommerce: {
            currency: currency,
            value: cartValue,
            items: items.map((item: any) => ({
                item_id: String(item.product_id),
                item_name: item.title,
                price: item.price,
                quantity: item.quantity
            }))
        }
    });

    pushToFbPixel('InitiateCheckout', {
        content_ids: items.map(i => String(i.product_id)),
        value: cartValue,
        currency: currency,
        num_items: items.length
    });
};

export const trackPurchase = (orderId: string, value: number, items: any[], currency: string = 'TRY', tax: number = 0, shipping: number = 0) => {
    // Assuming purchase tracking is already somewhat in order/confirmation
    pushToDataLayer('purchase', {
        ecommerce: {
            transaction_id: String(orderId),
            value: value,
            tax: tax,
            shipping: shipping,
            currency: currency,
            items: items.map((item: any) => ({
                item_id: String(item.product_id),
                item_name: item.title,
                price: item.price,
                quantity: item.quantity
            }))
        }
    });

    pushToFbPixel('Purchase', {
        content_ids: items.map(i => String(i.product_id)),
        value: value,
        currency: currency,
        num_items: items.length
    });
};

// Custom Curtain Specific Events
export const trackSelectFabric = (fabricType: string, fabricName: string) => {
    pushToDataLayer('select_fabric', { fabric_type: fabricType, fabric_name: fabricName });
    pushToFbPixel('SelectFabric', { fabric_type: fabricType, fabric_name: fabricName }, true);
};

export const trackEnterMeasurements = (width: number, height: number, mountType: string) => {
    pushToDataLayer('enter_measurements', { width: width, height: height, mount_type: mountType });
    pushToFbPixel('EnterMeasurements', { width: width, height: height, mount_type: mountType }, true);
};

export const trackSelectPleat = (pleatType: string, density: string) => {
    pushToDataLayer('select_pleat', { pleat_type: pleatType, density: density });
    pushToFbPixel('SelectPleat', { pleat_type: pleatType, density: density }, true);
};

export const trackRequestSample = (fabricName: string, fabricId: string) => {
    pushToDataLayer('request_sample', { fabric_name: fabricName, fabric_id: String(fabricId) });
    pushToFbPixel('RequestSample', { content_name: fabricName, content_id: String(fabricId) }, true);
};
