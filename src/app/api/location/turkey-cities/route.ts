import { NextResponse } from 'next/server';
import { getTurkeyCities } from '@/lib/services/locationService';

export async function GET() {
    try {
        const cities = getTurkeyCities();
        return NextResponse.json({ success: true, cities });
    } catch (error) {
        console.error('Error fetching Turkey cities:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch cities' },
            { status: 500 }
        );
    }
}
