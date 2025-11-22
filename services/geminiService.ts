
import { GoogleGenAI } from "@google/genai";
import { UserPreferences, TripOptions, Flight, Hotel, Activity } from '../types';
import { searchFlights, searchHotels, searchActivities } from './mockExternalApis';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- 1. Generate Options (Flights, Hotels, Activities) ---
export const generateTripOptions = async (prefs: UserPreferences): Promise<TripOptions> => {
  
  // Helper to fetch external data (optional, guides the AI)
  const [rawFlights, rawHotels] = await Promise.all([
    searchFlights(prefs.originCity, prefs.destination, prefs.dates, prefs.duration, prefs.travelers.adults, prefs.travelers.children),
    searchHotels(prefs.destination, prefs.dates, prefs.duration, prefs.accommodationLevel, prefs.travelers.adults)
  ]);

  const systemPrompt = `
    You are an expert travel agent for 'NomadTrip AI'.
    
    User Request:
    From ${prefs.originCity} to ${prefs.destination} for ${prefs.duration} days starting ${prefs.dates}.
    Budget: $${prefs.budget}. Travelers: ${prefs.travelers.adults} Adults.
    Vibe: ${prefs.tripType}.

    Task:
    1. Generate 3 distinct FLIGHT options (Economy, Business/Fastest, Premium).
    2. Generate 3 distinct HOTEL options (Budget-friendly, Standard/Central, Luxury).
    3. Generate 5 distinct ACTIVITIES suitable for the trip type.
    4. Provide Visa information.

    Instructions:
    - **USE GOOGLE SEARCH** tool to find REAL prices and availability.
    - For Images: Provide a descriptive prompt for 'imageUrl' (e.g., "Modern hotel room in Tokyo", "Swiss Alps hiking trail").
    - Return strictly valid JSON.

    JSON Structure:
    {
      "flightOptions": [ { "id": "f1", "airline": "...", "flightNumber": "...", "departureTime": "HH:MM", "arrivalTime": "HH:MM", "duration": "...", "price": number, "class": "Economy"|"Business"|"First" } ],
      "hotelOptions": [ { "id": "h1", "name": "...", "stars": 4, "rating": 8.5, "address": "...", "pricePerNight": number, "totalPrice": number, "description": "...", "type": "Budget"|"Standard"|"Luxury", "imageUrl": "..." } ],
      "activities": [ { "id": "a1", "name": "...", "description": "...", "price": number, "duration": "...", "imageUrl": "..." } ],
      "visa": { "status": "...", "description": "..." }
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    let jsonStr = response.text || '{}';
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);

    const data = JSON.parse(jsonStr);

    // Post-process images with Pollinations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.hotelOptions.forEach((h: any, i: number) => {
      h.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(h.imageUrl || h.name + ' hotel ' + prefs.destination)}?width=600&height=400&nologo=true&seed=${i}`;
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.activities.forEach((a: any, i: number) => {
      a.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(a.imageUrl || a.name + ' ' + prefs.destination)}?width=600&height=400&nologo=true&seed=${100+i}`;
    });

    return data as TripOptions;

  } catch (error) {
    console.error("Trip Options Gen Error:", error);
    throw new Error("Failed to generate options");
  }
};

// --- 2. Chat Assistant for Modification ---
export const modifyTripComponent = async (
  query: string, 
  currentContext: string, // Summary of what is currently selected
  prefs: UserPreferences
): Promise<{ text: string, suggestedItem?: Flight | Hotel | Activity, itemType?: 'flight' | 'hotel' | 'activity' }> => {

  const systemPrompt = `
    You are a helpful travel assistant modifying a user's itinerary.
    
    Current Context: ${currentContext}
    User Request: "${query}"
    Trip Details: ${prefs.destination}, ${prefs.dates}.

    If the user asks to CHANGE or FIND a specific item (e.g., "Find a cheaper hotel", "I want a flight that leaves later"), 
    you must use Google Search to find a REAL alternative and return it in JSON.
    
    If it's just a question (e.g., "Is it cold there?"), just answer in text.

    Output JSON Structure:
    {
      "text": "Here is a cheaper hotel option I found...",
      "itemType": "hotel" | "flight" | "activity" | null,
      "suggestedItem": { ... object matching Flight/Hotel/Activity interface ... } | null
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: { tools: [{ googleSearch: {} }] }
    });

    let jsonStr = response.text || '{}';
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const start = jsonStr.indexOf('{');
    const end = jsonStr.lastIndexOf('}');
    if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);

    const data = JSON.parse(jsonStr);

    // Add image if it's a hotel or activity
    if (data.suggestedItem && (data.itemType === 'hotel' || data.itemType === 'activity')) {
       const prompt = data.suggestedItem.name + ' ' + prefs.destination;
       data.suggestedItem.imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=400&nologo=true&seed=${Math.random()}`;
    }

    return data;

  } catch (error) {
    console.error("Chat Mod Error:", error);
    return { text: "I'm sorry, I couldn't process that request right now." };
  }
};
