import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Facebook Conversions API endpoint
const FB_API_VERSION = 'v18.0';
const PIXEL_ID = process.env.META_PIXEL_ID || '3893578660935588';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

interface ConversionEvent {
    event_name: string;
    event_time: number;
    event_id: string;
    event_source_url?: string;
    action_source: 'website';
    user_data: {
        em?: string[]; // hashed email
        ph?: string[]; // hashed phone
        fn?: string[]; // hashed first name
        ln?: string[]; // hashed last name
        ct?: string[]; // hashed city
        country?: string[]; // hashed country
        client_ip_address?: string;
        client_user_agent?: string;
        fbc?: string; // Facebook click ID
        fbp?: string; // Facebook browser ID
    };
    custom_data?: {
        value?: number;
        currency?: string;
        content_ids?: string[];
        content_type?: string;
        contents?: Array<{
            id: string;
            quantity: number;
            item_price?: number;
        }>;
        num_items?: number;
        order_id?: string;
    };
}

// Hash function for PII data (SHA-256)
function hashData(data: string | undefined): string | undefined {
    if (!data) return undefined;
    const normalized = data.toLowerCase().trim();
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            eventName,
            eventId,
            eventSourceUrl,
            userData,
            customData
        } = body;

        // Check if access token is configured
        if (!ACCESS_TOKEN) {
            console.warn('[Conversions API] META_ACCESS_TOKEN not configured, skipping server-side event');
            return NextResponse.json({
                success: false,
                message: 'Conversions API not configured - META_ACCESS_TOKEN missing'
            });
        }

        // Prepare user data with hashed PII
        const hashedUserData: ConversionEvent['user_data'] = {
            client_ip_address: userData?.ip,
            client_user_agent: userData?.userAgent,
            fbc: userData?.fbc,
            fbp: userData?.fbp
        };

        // Hash PII fields
        if (userData?.email) {
            hashedUserData.em = [hashData(userData.email)!];
        }
        if (userData?.phone) {
            // Remove non-numeric characters and hash
            const cleanPhone = userData.phone.replace(/\D/g, '');
            hashedUserData.ph = [hashData(cleanPhone)!];
        }
        if (userData?.firstName) {
            hashedUserData.fn = [hashData(userData.firstName)!];
        }
        if (userData?.lastName) {
            hashedUserData.ln = [hashData(userData.lastName)!];
        }
        if (userData?.city) {
            hashedUserData.ct = [hashData(userData.city)!];
        }
        if (userData?.country) {
            hashedUserData.country = [hashData(userData.country)!];
        }

        // Build the event
        const event: ConversionEvent = {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            event_source_url: eventSourceUrl,
            action_source: 'website',
            user_data: hashedUserData,
            custom_data: customData
        };

        // Send to Facebook Conversions API
        const fbUrl = `https://graph.facebook.com/${FB_API_VERSION}/${PIXEL_ID}/events`;

        const fbResponse = await fetch(fbUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [event],
                access_token: ACCESS_TOKEN,
                // Test event code - remove in production
                // test_event_code: 'TEST12345'
            })
        });

        const fbResult = await fbResponse.json();

        if (!fbResponse.ok) {
            console.error('[Conversions API] Facebook API error:', fbResult);
            return NextResponse.json({
                success: false,
                error: fbResult.error?.message || 'Facebook API error',
                details: fbResult
            }, { status: 500 });
        }

        console.log(`[Conversions API] ${eventName} event sent successfully:`, {
            event_id: event.event_id,
            events_received: fbResult.events_received,
            fbtrace_id: fbResult.fbtrace_id
        });

        return NextResponse.json({
            success: true,
            event_id: event.event_id,
            facebook_response: fbResult
        });

    } catch (error: any) {
        console.error('[Conversions API] Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
