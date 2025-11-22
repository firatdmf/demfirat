import { NextResponse } from 'next/server';
import { getTurkeyDistricts } from '@/lib/services/locationService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ cityId: string }> }
) {
    try {
        const { cityId: cityIdStr } = await params;
        const cityId = parseInt(cityIdStr);

        if (isNaN(cityId)) {
            return NextResponse.json(
                { success: false, error: 'Invalid city ID' },
                { status: 400 }
            );
        }

        const districts = getTurkeyDistricts(cityId);

        if (districts.length === 0) {
            return NextResponse.json(
                { success: false, error: 'City not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, districts });
    } catch (error) {
        console.error('Error fetching Turkey districts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch districts' },
            { status: 500 }
        );
    }
}
