import turkeyCitiesData from '@/lib/data/turkey-cities.json';

export interface Country {
    code: string;
    name: string;
    flag?: string;
}

export interface City {
    id: number;
    name: string;
    countryCode?: string;
}

export interface District {
    name: string;
    cityId: number;
}

/**
 * Fetch all countries from REST Countries API
 * Returns a sorted list of countries
 */
export async function getCountries(): Promise<Country[]> {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Failed to fetch countries');
        }

        const data = await response.json();

        const countries: Country[] = data.map((country: any) => ({
            code: country.cca2,
            name: country.name.common,
            flag: country.flags?.svg || country.flags?.png
        }));

        // Sort alphabetically by name
        countries.sort((a, b) => a.name.localeCompare(b.name));

        return countries;
    } catch (error) {
        console.error('Error fetching countries:', error);
        // Return a fallback list of common countries
        return [
            { code: 'TR', name: 'Turkey' },
            { code: 'US', name: 'United States' },
            { code: 'GB', name: 'United Kingdom' },
            { code: 'DE', name: 'Germany' },
            { code: 'FR', name: 'France' },
            { code: 'IT', name: 'Italy' },
            { code: 'ES', name: 'Spain' },
            { code: 'RU', name: 'Russia' },
            { code: 'PL', name: 'Poland' },
            { code: 'UA', name: 'Ukraine' },
        ].sort((a, b) => a.name.localeCompare(b.name));
    }
}

/**
 * Get all cities in Turkey
 * Returns list of Turkish cities
 */
export function getTurkeyCities(): City[] {
    return turkeyCitiesData.cities.map(city => ({
        id: city.id,
        name: city.name,
        countryCode: 'TR'
    }));
}

/**
 * Get districts for a specific Turkish city
 * @param cityId - The ID of the city
 * @returns Array of district names
 */
export function getTurkeyDistricts(cityId: number): District[] {
    const city = turkeyCitiesData.cities.find(c => c.id === cityId);

    if (!city) {
        return [];
    }

    return city.districts.map(districtName => ({
        name: districtName,
        cityId: city.id
    }));
}

/**
 * Get a specific city by ID
 * @param cityId - The ID of the city
 * @returns City object or null
 */
export function getTurkeyCityById(cityId: number): City | null {
    const city = turkeyCitiesData.cities.find(c => c.id === cityId);

    if (!city) {
        return null;
    }

    return {
        id: city.id,
        name: city.name,
        countryCode: 'TR'
    };
}

/**
 * Get a city by name
 * @param cityName - The name of the city
 * @returns City object or null
 */
export function getTurkeyCityByName(cityName: string): City | null {
    const city = turkeyCitiesData.cities.find(
        c => c.name.toLowerCase() === cityName.toLowerCase()
    );

    if (!city) {
        return null;
    }

    return {
        id: city.id,
        name: city.name,
        countryCode: 'TR'
    };
}
