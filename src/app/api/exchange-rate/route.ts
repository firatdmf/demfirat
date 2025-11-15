import { NextResponse } from 'next/server';

// Cache for exchange rates (1 hour)
let cachedRate: { rate: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET() {
  try {
    // Check cache
    if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        rate: cachedRate.rate,
        cached: true
      });
    }

    // Fetch fresh rate from API
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    const usdToTry = data.rates.TRY;
    
    // Update cache
    cachedRate = {
      rate: usdToTry,
      timestamp: Date.now()
    };

    return NextResponse.json({
      success: true,
      rate: usdToTry,
      cached: false
    });
  } catch (error) {
    console.error('Exchange rate fetch error:', error);
    
    // Fallback rate if API fails
    return NextResponse.json({
      success: true,
      rate: 34.5, // Fallback TRY rate
      cached: false,
      fallback: true
    });
  }
}
