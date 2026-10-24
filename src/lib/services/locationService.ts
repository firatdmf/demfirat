import turkeyCitiesData from '@/lib/data/turkey-cities.json';

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
