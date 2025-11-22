import { Flight, Hotel, Activity } from '../types';

// API Keys from Environment Variables
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = 'booking-com15.p.rapidapi.com';

const FALLBACK_CITIES = [
  "New York, USA", "London, UK", "Paris, France", "Tokyo, Japan", "Dubai, UAE",
  "Singapore", "Barcelona, Spain", "Rome, Italy", "Istanbul, Turkey", "Bangkok, Thailand",
  "Tashkent, Uzbekistan", "Moscow, Russia", "Berlin, Germany", "Sydney, Australia",
  "Los Angeles, USA", "San Francisco, USA", "Toronto, Canada", "Amsterdam, Netherlands",
  "Hong Kong", "Seoul, South Korea", "Mumbai, India", "Delhi, India", "Cairo, Egypt",
  "Bali, Indonesia", "Phuket, Thailand", "Cancun, Mexico", "Rio de Janeiro, Brazil"
];

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

// --- Helper: Auto-complete Cities ---
export const getCitySuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];

  // 1. Try OpenStreetMap (Nominatim) - Free & Open
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&featuretype=city&addressdetails=1&limit=5`;
    const response = await fetch(url);
    if (response.ok) {
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const openCities = data.map((item: any) => item.display_name);
      if (openCities.length > 0) return openCities;
    }
  } catch (e) {
    console.warn("Nominatim API error", e);
  }

  // 2. Try RapidAPI (Booking.com) as backup
  if (RAPIDAPI_KEY) {
    try {
       const url = `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(query)}`;
       const response = await fetch(url, {
         headers: {
           'x-rapidapi-key': RAPIDAPI_KEY,
           'x-rapidapi-host': RAPIDAPI_HOST
         }
       });
       if (response.ok) {
         const data = await response.json();
         const cities = (data.data || [])
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           .filter((item: any) => item.dest_type === 'city')
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           .map((item: any) => item.label || item.name);
         
         if (cities.length > 0) return cities;
       }
    } catch (e) {
      console.warn("Autocomplete API error", e);
    }
  }

  // 3. Fallback: Local filtering
  const lowerQuery = query.toLowerCase();
  return FALLBACK_CITIES.filter(city =>
    city.toLowerCase().includes(lowerQuery)
  );
};

// --- Helper: Fetch Booking.com Location ID ---
async function getBookingComLocationId(city: string): Promise<string | null> {
  if (!RAPIDAPI_KEY) return null;
  
  try {
    const url = `https://${RAPIDAPI_HOST}/api/v1/hotels/searchDestination?query=${encodeURIComponent(city)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': RAPIDAPI_HOST
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const location = data.data?.find((item: any) => item.dest_type === 'city');
    return location ? location.dest_id : null;
  } catch (e) {
    console.warn("Failed to fetch Booking.com location ID", e);
    return null;
  }
}

// --- Service: Search Flights ---
export const searchFlights = async (
  from: string, 
  to: string, 
  date: string, 
  duration: number = 7, 
  adults: number = 1, 
  children: number = 0
): Promise<Flight[]> => {
  
  // 1. Try SerpApi (Google Flights)
  if (SERPAPI_KEY) {
    try {
      const returnDate = addDays(date, duration);
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.append('engine', 'google_flights');
      url.searchParams.append('departure_id', from); 
      url.searchParams.append('arrival_id', to);
      url.searchParams.append('outbound_date', date);
      url.searchParams.append('return_date', returnDate);
      url.searchParams.append('adults', adults.toString());
      url.searchParams.append('currency', 'USD');
      url.searchParams.append('api_key', SERPAPI_KEY);

      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        if (data.best_flights) {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           return data.best_flights.map((item: any) => {
             const leg = item.flights[0];
             return {
               airline: leg.airline || 'Major Airline',
               flightNumber: leg.flight_number || 'FL123',
               departureTime: leg.departure_token || '10:00',
               arrivalTime: item.flights[item.flights.length - 1].arrival_token || '14:00',
               price: item.price,
               duration: `${Math.floor(item.total_duration / 60)}h ${item.total_duration % 60}m`,
               logoUrl: leg.airline_logo
             };
           }).slice(0, 5);
        }
      }
    } catch (error) {
      console.warn("SerpApi flight search error:", error);
    }
  }

  // 2. If API fails or no key, return empty. 
  return [];
};

// --- Service: Search Hotels ---
export const searchHotels = async (
  destination: string, 
  checkInDate: string, 
  duration: number, 
  budgetLevel: string,
  adults: number = 2
): Promise<Hotel[]> => {
  const checkOutDate = addDays(checkInDate, duration);

  // 1. Try RapidAPI (Booking.com)
  if (RAPIDAPI_KEY) {
    try {
      const destId = await getBookingComLocationId(destination);
      if (destId) {
        const url = new URL(`https://${RAPIDAPI_HOST}/api/v1/hotels/searchHotels`);
        url.searchParams.append('dest_id', destId);
        url.searchParams.append('search_type', 'CITY');
        url.searchParams.append('arrival_date', checkInDate);
        url.searchParams.append('departure_date', checkOutDate);
        url.searchParams.append('adults', adults.toString());
        url.searchParams.append('room_qty', '1');
        url.searchParams.append('currency_code', 'USD');
        // Filter sort based on budget
        if (budgetLevel === 'budget') url.searchParams.append('sort_by', 'price');
        if (budgetLevel === 'premium') url.searchParams.append('sort_by', 'class_descending');

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'x-rapidapi-key': RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
          }
        });

        if (response.ok) {
          const data = await response.json();
          const hotels = data.data || data.result || []; // Structure varies by version
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return hotels.slice(0, 8).map((h: any) => ({
            name: h.hotel_name,
            stars: h.class || 3,
            rating: h.review_score || 8.0,
            address: h.address || destination,
            pricePerNight: h.composite_price_breakdown?.gross_amount_per_night?.value 
                           ? Math.round(h.composite_price_breakdown.gross_amount_per_night.value) 
                           : 150,
            totalPrice: h.composite_price_breakdown?.gross_amount?.value 
                        ? Math.round(h.composite_price_breakdown.gross_amount.value)
                        : 150 * duration,
            imageUrl: h.main_photo_url ? h.main_photo_url.replace('square60', 'square300') : '',
            description: `Located in ${destination}, this property offers a comfortable stay.`
          }));
        }
      }
    } catch (error) {
      console.warn("RapidAPI hotel search error:", error);
    }
  }

  // 2. Try SerpApi (Google Hotels) as backup
  if (SERPAPI_KEY) {
    try {
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.append('engine', 'google_hotels');
      url.searchParams.append('q', `Hotels in ${destination}`);
      url.searchParams.append('check_in_date', checkInDate);
      url.searchParams.append('check_out_date', checkOutDate);
      url.searchParams.append('adults', adults.toString());
      url.searchParams.append('currency', 'USD');
      url.searchParams.append('api_key', SERPAPI_KEY);
      
      const response = await fetch(url.toString());
      if (response.ok) {
         const data = await response.json();
         if (data.properties) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data.properties.slice(0, 6).map((prop: any) => ({
               name: prop.name,
               stars: prop.star_rating || 4,
               rating: prop.overall_rating || 4.5,
               address: destination,
               pricePerNight: prop.rate_per_night?.lowest ? parseInt(prop.rate_per_night.lowest.replace(/[^0-9]/g, '')) : 150,
               totalPrice: 0, // Calc later
               imageUrl: prop.images?.[0]?.original_image,
               description: prop.description || `Stay at ${prop.name}`
            }));
         }
      }
    } catch (e) {
      console.warn("SerpApi Hotel Error", e);
    }
  }

  // Return empty to signal Gemini to generate data
  return [];
};

// --- Service: Search Activities ---
export const searchActivities = async (destination: string, type: string): Promise<Activity[]> => {
  return [];
};
