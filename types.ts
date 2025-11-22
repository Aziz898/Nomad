
export interface UserPreferences {
  originCountry: string;
  originCity: string;
  destination: string;
  dates: string; // "YYYY-MM-DD"
  duration: number; // days
  flexibility: number; // +/- days
  budget: number; // per person
  travelers: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  };
  accommodationLevel: 'budget' | 'standard' | 'premium';
  tripType: 'beach' | 'excursion' | 'shopping' | 'active' | 'family';
  contact: {
    name: string;
    contactMethod: string;
  };
}

export interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  duration: string;
  logoUrl?: string;
  class: 'Economy' | 'Business' | 'First';
}

export interface Hotel {
  id: string;
  name: string;
  stars: number;
  rating: number;
  address: string;
  pricePerNight: number;
  totalPrice: number;
  imageUrl: string;
  description: string;
  type: 'Budget' | 'Standard' | 'Luxury';
}

export interface Activity {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  imageUrl?: string;
  included?: boolean; 
}

export interface VisaInfo {
  status: 'Not Required' | 'E-Visa' | 'Visa Required';
  description: string;
  actionUrl?: string;
}

// The container for all AI-generated options
export interface TripOptions {
  flightOptions: Flight[];
  hotelOptions: Hotel[];
  activities: Activity[];
  visa: VisaInfo;
}

// The user's final basket
export interface TripSelection {
  selectedFlight: Flight | null;
  selectedHotel: Hotel | null;
  selectedActivities: Activity[];
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  // If the AI suggests a replacement item, it comes here
  suggestedItem?: {
    type: 'flight' | 'hotel' | 'activity';
    data: Flight | Hotel | Activity;
  };
}

export interface TourPackage {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  type: 'economy' | 'optimal' | 'premium';
  totalPrice: number;
  flight: {
    outbound: Flight;
    return: Flight;
  };
  hotel: Hotel;
  activities: Activity[];
  visa: VisaInfo;
}

// --- Auth & Booking Types ---

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Booking {
  id: string;
  userId: string;
  destination: string;
  dateRange: string;
  totalCost: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookedAt: string;
  image: string;
  details: TripSelection;
}
