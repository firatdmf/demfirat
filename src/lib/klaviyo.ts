// src/lib/klaviyo.ts

/**
 * Ensures the Klaviyo object `_learnq` is initialized on the window.
 */
export const getKlaviyo = () => {
    if (typeof window !== 'undefined') {
        (window as any)._learnq = (window as any)._learnq || [];
        return (window as any)._learnq;
    }
    return null;
};

/**
 * Identifies a user in Klaviyo (e.g. when they start checkout or log in).
 * This connects their past anonymous events to their profile.
 */
export const identifyUser = (email: string, firstName?: string, lastName?: string, phone?: string) => {
    const klaviyo = getKlaviyo();
    if (klaviyo) {
        const profile: any = { $email: email };
        if (firstName) profile.$first_name = firstName;
        if (lastName) profile.$last_name = lastName;
        if (phone) profile.$phone_number = phone;

        klaviyo.push(['identify', profile]);
        console.log('[Klaviyo] Identity set:', email);
    }
};

/**
 * Tracks the "Added to Cart" event.
 * Pass the exact cart items, currency, and value.
 */
export const trackKlaviyoAddToCart = (cartItem: any) => {
    const klaviyo = getKlaviyo();
    if (klaviyo) {
        klaviyo.push(['track', 'Added to Cart', {
            ...cartItem
        }]);
        console.log('[Klaviyo] Added to Cart event fired:', cartItem.ProductName);
    }
};

/**
 * Tracks the "Started Checkout" event, triggering the Abandoned Cart Flow.
 * Pass the total cart values and the array of items.
 */
export const trackKlaviyoStartedCheckout = (checkoutData: any) => {
    const klaviyo = getKlaviyo();
    if (klaviyo) {
        klaviyo.push(['track', 'Started Checkout', {
            ...checkoutData
        }]);
        console.log('[Klaviyo] Started Checkout event fired');
    }
};

/**
 * Tracks the "Requested Catalog" custom event.
 */
export const trackKlaviyoCatalogRequest = (email: string, name?: string) => {
    const klaviyo = getKlaviyo();
    if (klaviyo) {
        klaviyo.push(['track', 'Requested Catalog', {
            $email: email,
            Name: name
        }]);
        console.log('[Klaviyo] Requested Catalog event fired for:', email);
    }
};
