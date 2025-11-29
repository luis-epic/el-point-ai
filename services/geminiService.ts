import { GoogleGenAI } from "@google/genai";
import { Coordinates, DirectoryItem, GroundingChunk, Review } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Helpers for Venezuelan Reviews
const VZLA_ADJECTIVES = ['brutal', 'mundial', 'chévere', 'criminal', 'fino', 'resuelto', 'buenísimo', 'normalito', 'depinga'];
const VZLA_FOOD_COMMENTS = ['Las empanadas son de otro mundo', 'La salsa de ajo es clave', 'Bien resuelto el plato', 'Tienen malta bien fría', 'Un pelo caro pero vale la pena', 'Atención 10/10', 'Me comí dos y quedé explotado'];
const VZLA_GENERIC_COMMENTS = ['El ambiente es super chill', 'La música está dura', 'Full seguridad', 'Buen point para ir con los panas', 'Se hace cola pero camina rápido', 'Estacionamiento cómodo', 'Aire acondicionado a full mecha'];
const NAMES = ['Carlos', 'Maria', 'Luis', 'Ana', 'Jose', 'Valentina', 'Andrés', 'Sofía', 'Gaby', 'Miguel'];

const getRandomElement = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const generateVenezuelanReviews = (placeName: string, tags: string[]): Review[] => {
    const numReviews = Math.floor(Math.random() * 3) + 1; // 1 to 3 reviews
    const reviews: Review[] = [];

    for (let i = 0; i < numReviews; i++) {
        let text = "";
        const rating = (Math.floor(Math.random() * 15) + 35) / 10; // 3.5 to 5.0
        
        if (tags.some(t => t.toLowerCase().includes('food') || t.toLowerCase().includes('restaurant') || t.toLowerCase().includes('cafe'))) {
             text = `${getRandomElement(VZLA_FOOD_COMMENTS)}. ¡${getRandomElement(VZLA_ADJECTIVES).charAt(0).toUpperCase() + getRandomElement(VZLA_ADJECTIVES).slice(1)}!`;
        } else {
             text = `${getRandomElement(VZLA_GENERIC_COMMENTS)}. ${placeName} es ${getRandomElement(VZLA_ADJECTIVES)}.`;
        }

        reviews.push({
            author: getRandomElement(NAMES),
            text: text,
            rating: rating,
            relativeTime: `${Math.floor(Math.random() * 10) + 1}d`
        });
    }
    return reviews;
};

export const searchPlaces = async (
  query: string,
  userLocation: Coordinates | null
): Promise<{ text: string; items: DirectoryItem[] }> => {
  if (!GEMINI_API_KEY) {
    throw new Error("API Key is missing.");
  }

  const modelId = "gemini-2.5-flash"; // Supports tools
  
  // Default to Caracas, Venezuela coordinates if no user location is provided
  const CARACAS_COORDS = { latitude: 10.4806, longitude: -66.9036 };
  const searchFocus = userLocation || CARACAS_COORDS;

  const toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: searchFocus.latitude,
          longitude: searchFocus.longitude,
        },
      },
  };

  const locationInstruction = userLocation 
    ? `The user is at lat:${userLocation.latitude}, lon:${userLocation.longitude}. Prioritize finding places strictly NEARBY this location.`
    : `The user has not provided a GPS location. Assume the user is in **Caracas, Venezuela**. You MUST find places located in **Caracas**. Do not show results from other cities unless explicitly asked.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `User Query: "${query}". 
      ${locationInstruction}
      If the query is generic (e.g. "restaurants", "cafe"), list the best ones in Caracas.
      Provide a helpful summary of the results.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: toolConfig,
      },
    });

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    const text = candidate?.content?.parts?.map(p => p.text).join('') || "No text summary available.";

    const items: DirectoryItem[] = [];

    if (groundingChunks) {
      groundingChunks.forEach((chunk, index) => {
        if (chunk.maps) {
          const mapData = chunk.maps;
          const name = mapData.sourcePlace?.name || mapData.title || "Unknown Place";
          
          // --- SMART IMAGE GENERATION ---
          // Use Pollinations.ai for contextual images based on the name and query
          // We clean the name to be URL safe and append the query for context (e.g. "Dominos Pizza" + "food")
          const cleanName = encodeURIComponent(name.replace(/[^a-zA-Z0-9 ]/g, ''));
          const cleanQuery = encodeURIComponent(query.split(' ')[0]); // Use first word of query as category hint
          const imageUrl = `https://image.pollinations.ai/prompt/${cleanQuery}%20${cleanName}%20venezuela?width=400&height=300&nologo=true&seed=${index}`;
          
          // Safety check for place details
          const address = mapData.sourcePlace?.address || "Address not available";
          const snippet = mapData.placeAnswerSources?.[0]?.reviewSnippets?.[0]?.content || "No details available.";

          // --- VENEZUELAN REVIEWS ---
          const mockReviews = generateVenezuelanReviews(name, [query, 'place']);

          items.push({
            id: `place-${index}-${Date.now()}`,
            name: name,
            address: address,
            latitude: mapData.sourcePlace?.location?.latitude,
            longitude: mapData.sourcePlace?.location?.longitude,
            googleMapsUri: mapData.uri,
            description: snippet,
            tags: [query, "El Point"], 
            imageUrl: imageUrl, // New smart image
            rating: 4.0 + (index % 10) / 10, 
            reviews: mockReviews // New reviews
          });
        }
      });
    }

    return { text, items };

  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Gemini API Error:", errorMessage);
    throw new Error(errorMessage);
  }
};