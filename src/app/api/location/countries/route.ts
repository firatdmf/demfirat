import { NextResponse } from 'next/server';
import { getCountries } from '@/lib/services/locationService';

export async function GET() {
    try {
        const countries = await getCountries();
        return NextResponse.json({ success: true, countries });
    } catch (error) {
        console.error('Error fetching countries:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch countries' },
            { status: 500 }
        );
    }
}
